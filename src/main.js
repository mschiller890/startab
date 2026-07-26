const API_KEY = import.meta.env.VITE_NASA_API_KEY;

let nasaData;

const heroEl = document.getElementById("app");
const loadingScreen = document.getElementById("loading-screen");

function hideLoadingScreen() {
  loadingScreen.classList.add("hidden");
}
function cleanExplanation(html) {
    if (!html) return "";

    let cleaned = html;

    cleaned = cleaned.replace(/<p>\s*Explore the Universe:[\s\S]*?<\/p>\s*/gi, "");

    cleaned = cleaned.replace(/Explore the Universe:[\s\S]*$/gi, "");

    return cleaned.trim();
}

const heroVideoEl = document.getElementById("hero-video");
const heroEmbedEl = document.getElementById("hero-embed");

function toEmbedUrl(url) {
    try {
        const u = new URL(url);

        if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
            let videoId = u.searchParams.get("v");
            if (!videoId && u.hostname.includes("youtu.be")) {
                videoId = u.pathname.slice(1);
            }
            if (!videoId && u.pathname.includes("/embed/")) {
                videoId = u.pathname.split("/embed/")[1];
            }
            if (videoId) {
                return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1`;
            }
        }

        if (u.hostname.includes("vimeo.com")) {
            const videoId = u.pathname.split("/").filter(Boolean).pop();
            if (videoId) {
                return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;
            }
        }
    } catch (e) {
    }

    return url;
}

function showVideoBackground(data) {
    if (data.thumbnail_url) {
        analyzeBrightness(data.thumbnail_url);
    } else {
        const root = document.documentElement.style;
        root.setProperty("--clock-fg", "#ffffff");
        root.setProperty("--clock-fg-secondary", "rgba(255, 255, 255, 0.7)");
    }

    heroVideoEl.src = data.url;
    heroVideoEl.style.display = "block";

    heroVideoEl.oncanplay = () => {
        heroVideoEl.play().catch(() => {});
        hideLoadingScreen();
    };

    heroVideoEl.onerror = () => {
        heroVideoEl.style.display = "none";
        heroEmbedEl.src = toEmbedUrl(data.url);
        heroEmbedEl.style.display = "block";

        heroEmbedEl.onload = hideLoadingScreen;
        setTimeout(hideLoadingScreen, 2500); 
    };
}

fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&thumbs=true`)
.then(response => response.json())
.then(data => {

    nasaData = data;

    if (data.media_type === "video") {
        showVideoBackground(data);
    } else {
        analyzeBrightness(data.url);

        const img = new Image();
        img.onload = () => {
            heroEl.style.backgroundImage = `url(${data.url})`;
            hideLoadingScreen();
        };
        img.onerror = hideLoadingScreen;
        img.src = data.url;
    }

    document.getElementById("info-title").textContent = data.title;
    document.getElementById("info-date").textContent = data.date;
    document.getElementById("info-description").innerHTML = cleanExplanation(data.explanation); // <-- was textContent
    document.getElementById("info-copyright").textContent = data.copyright
        ? `© ${data.copyright}`
        : "";

})
.catch(hideLoadingScreen);

function setTime() {
  const timeElement = document.getElementById('time');
  const dateElement = document.getElementById('date');
  const miniTimeElement = document.getElementById('mini-time');
  const miniDateElement = document.getElementById('mini-date');

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  timeElement.textContent = timeString;
  miniTimeElement.textContent = timeString;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString(undefined, options);
  dateElement.textContent = dateString;

  const miniOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  miniDateElement.textContent = now.toLocaleDateString(undefined, miniOptions);
}
setInterval(setTime, 1000);
setTime();

function weatherIcon(code) {
    if (code === 0) return "☀️";
    if ([1, 2, 3].includes(code)) return "⛅";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "🌡️";
}

let userLat = 52.52;
let userLon = 13.41;
let forecastLoaded = false;

function loadWeather(latitude, longitude) {
    userLat = latitude;
    userLon = longitude;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
        .then(response => response.json())
        .then(data => {
            const weather = data.current_weather;
            document.getElementById("weather-icon").textContent = weatherIcon(weather.weathercode);
            document.getElementById("weather-temp").textContent = `${Math.round(weather.temperature)}°C`;
        });
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            loadWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
            loadWeather(52.52, 13.41);
        }
    );
} else {
    loadWeather(52.52, 13.41);
}

function loadPlaceName(latitude, longitude) {
    const placeEl = document.getElementById("weather-place");

    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
        .then(response => response.json())
        .then(data => {
            const place = data.city || data.locality || data.principalSubdivision || "Your location";
            placeEl.textContent = data.countryName ? `${place}, ${data.countryName}` : place;
        })
        .catch(() => {
            placeEl.textContent = "Your location";
        });
}

function loadForecast(latitude, longitude) {
    const forecastEl = document.getElementById("weather-forecast");

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`)
        .then(response => response.json())
        .then(data => {
            const { time, weathercode, temperature_2m_max, temperature_2m_min } = data.daily;

            forecastEl.innerHTML = "";

            time.forEach((dateStr, i) => {
                const date = new Date(dateStr);
                const label = i === 0
                    ? "Today"
                    : date.toLocaleDateString(undefined, { weekday: "short" });

                const dayDiv = document.createElement("div");
                dayDiv.className = "forecast-day";
                dayDiv.innerHTML = `
                    <span class="day-name">${label}</span>
                    <span class="day-icon">${weatherIcon(weathercode[i])}</span>
                    <span class="day-temp">
                        <span class="max">${Math.round(temperature_2m_max[i])}°</span><span class="min">${Math.round(temperature_2m_min[i])}°</span>
                    </span>
                `;
                forecastEl.appendChild(dayDiv);
            });
        });
}

const weatherWidget = document.getElementById("weather-widget");
const weatherOverlay = document.getElementById("weather-overlay");

function openWeatherWidget() {
    weatherWidget.classList.add("expanded");
    weatherOverlay.classList.add("visible");

    if (!forecastLoaded) {
        forecastLoaded = true;
        loadPlaceName(userLat, userLon);
        loadForecast(userLat, userLon);
    }
}

function closeWeatherWidget() {
    weatherWidget.classList.remove("expanded");
    weatherOverlay.classList.remove("visible");
}

weatherWidget.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!weatherWidget.classList.contains("expanded")) {
        openWeatherWidget();
    }
});

weatherOverlay.addEventListener("click", closeWeatherWidget);

function showSnackbar(message, type = "success", duration = 3000) {
    const container = document.getElementById("snackbar-container");

    const snackbar = document.createElement("div");
    snackbar.className = `snackbar ${type}`;

    const icon = document.createElement("span");
    icon.className = "snackbar-icon";
    icon.textContent = type === "success" ? "✓" : "!";

    const text = document.createElement("span");
    text.className = "snackbar-message";
    text.textContent = message;

    snackbar.appendChild(icon);
    snackbar.appendChild(text);
    container.appendChild(snackbar);

    setTimeout(() => {
        snackbar.classList.add("leaving");
        snackbar.addEventListener("animationend", () => snackbar.remove(), { once: true });
    }, duration);
}

const shortcutsContainer = document.getElementById("shortcuts");

const DEFAULT_SHORTCUTS = [
    {
        name: "GitHub",
        url: "https://github.com",
        icon: "https://github.githubassets.com/favicons/favicon.svg"
    }
];

let shortcuts = JSON.parse(localStorage.getItem("shortcuts")) || DEFAULT_SHORTCUTS;

function saveShortcuts() {
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
}

function renderShortcuts() {
    shortcutsContainer.innerHTML = "";

    shortcuts.forEach(shortcut => {
        const div = document.createElement("div");
        div.className = "shortcut";

        div.innerHTML = `
            <img src="${shortcut.icon}">
            <p>${shortcut.name}</p>
        `;

        div.onclick = () => {
            window.location.href = shortcut.url;
        };

        div.oncontextmenu = (e) => {
            e.preventDefault();

            div.oncontextmenu = (e) => {
            e.preventDefault();

            openModal(
                  "Delete Shortcut",
                  null,
                  null,
                  null,
                  () => {
                      shortcuts = shortcuts.filter(s => s !== shortcut);
                      saveShortcuts();
                      renderShortcuts();
                  }
              );
            };
        };

        shortcutsContainer.appendChild(div);
    });

    const add = document.createElement("div");
    add.className = "shortcut";
    add.innerHTML = `
        <div style="font-size:40px;">+</div>
        <p>Add</p>
    `;

    add.onclick = addShortcut;

    shortcutsContainer.appendChild(add);
}

const modalOverlay = document.getElementById("modal-overlay");
const modalInput1 = document.getElementById("modal-input-1");
const modalInput2 = document.getElementById("modal-input-2");
const modalInput3 = document.getElementById("modal-input-3");

const modalConfirm = document.getElementById("modal-confirm");
const modalCancel = document.getElementById("modal-cancel");

let modalCallback = null;


function openModal(title, input1, input2, input3, callback) {

    document.getElementById("modal-title").textContent = title;

    modalInput1.value = "";
    modalInput2.value = "";
    modalInput3.value = "";

    modalInput1.style.display = input1 ? "block" : "none";
    modalInput2.style.display = input2 ? "block" : "none";
    modalInput3.style.display = input3 ? "block" : "none";

    if (input1) {
        modalInput1.placeholder = input1;
    }

    if (input2) {
        modalInput2.placeholder = input2;
    }

    if (input3) {
        modalInput3.placeholder = input3;
    }

    modalOverlay.classList.add("visible"); 

    modalCallback = callback;
}

const modalEl = document.getElementById("modal");

function closeModal() {
    modalEl.classList.add("closing");
    modalOverlay.classList.remove("visible");

    modalEl.addEventListener("animationend", () => {
        modalEl.classList.remove("closing");
    }, { once: true });

    modalCallback = null;
}


modalCancel.onclick = closeModal;


modalConfirm.onclick = () => {

    if(modalCallback) {
        const shouldClose = modalCallback(
            modalInput1.value,
            modalInput2.value,
            modalInput3.value
        );

        if (shouldClose !== false) {
            closeModal();
        }
    } else {
        closeModal();
    }
};

function addShortcut() {

    openModal(
        "Add Shortcut",
        "Website URL",
        "Shortcut name",
        "Custom icon URL (optional)",
        (url, name, iconUrl) => {

            if (!url) {
                showSnackbar("Please enter a website URL", "error");
                return false;
            }

            let hostname;
            try {
                hostname = new URL(url).hostname;
            } catch {
                showSnackbar("That doesn't look like a valid URL", "error");
                return false;
            }

            if (!name) {
                name = hostname;
            }

            let icon = `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;

            if (iconUrl) {
                try {
                    new URL(iconUrl);
                    icon = iconUrl;
                } catch {
                    showSnackbar("Custom icon URL was invalid, using default favicon", "error");
                }
            }

            shortcuts.push({
                name,
                url,
                icon
            });

            saveShortcuts();
            renderShortcuts();

            showSnackbar(`"${name}" shortcut added`, "success");
        }
    );
}

renderShortcuts();

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    }
});

const infoSection = document.getElementById("info-section");
const infoButton = document.getElementById("info-button");
const infoArrow = document.getElementById("info-arrow");
const infoButtonLabel = document.getElementById("info-button-label");
const imageInfo = document.getElementById("image-info");
const miniClock = document.getElementById("mini-clock");

function isScrolledToInfo() {
    return window.scrollY > window.innerHeight / 2;
}

function isOverWhite(el) {
    const elRect = el.getBoundingClientRect();
    const sectionRect = infoSection.getBoundingClientRect();
    // true once the white section's top edge has risen above this element's position
    return sectionRect.top <= elRect.bottom;
}

function isOverWhiteSection() {
    return window.scrollY >= infoSection.offsetTop;
}

infoButton.onclick = () => {

    if (nasaData) {
        document.getElementById("info-title").textContent =
            nasaData.title;

        document.getElementById("info-date").textContent =
            nasaData.date;

        document.getElementById("info-description").innerHTML = 
            cleanExplanation(nasaData.explanation); 

        document.getElementById("info-copyright").textContent =
            nasaData.copyright
            ? `© ${nasaData.copyright}`
            : "";
    } else {
        document.getElementById("info-title").textContent = "Loading...";
        document.getElementById("info-date").textContent = "";
        document.getElementById("info-description").textContent = "";
        document.getElementById("info-copyright").textContent = "";
    }

    window.scrollTo({
        top: isScrolledToInfo() ? 0 : infoSection.offsetTop,
        behavior: "smooth"
    });
};

window.addEventListener("scroll", () => {
    const scrolledDown = isScrolledToInfo();

    infoButtonLabel.textContent = scrolledDown ? "Back to top" : "More info";
    infoArrow.style.transform = scrolledDown ? "rotate(180deg)" : "rotate(0deg)";
    heroEl.classList.toggle("blurred", scrolledDown);
    imageInfo.classList.toggle("visible", scrolledDown);
    miniClock.classList.toggle("visible", scrolledDown);

    const miniTimeEl = document.getElementById("mini-time");
    const miniDateEl = document.getElementById("mini-date");
    const weatherTempEl = document.getElementById("weather-temp");

    const miniClockOverWhite = isOverWhite(miniClock);
    const weatherOverWhite = isOverWhite(weatherWidget);
    const buttonOverWhite = isOverWhite(infoButton);

    miniTimeEl.style.color = miniClockOverWhite ? "#111111" : "#ffffff";
    miniDateEl.style.color = miniClockOverWhite ? "rgba(17, 17, 17, 0.65)" : "rgba(255, 255, 255, 0.7)";

    weatherWidget.classList.toggle("on-white", weatherOverWhite);

    infoButtonLabel.style.color = buttonOverWhite ? "#111111" : "#ffffff";
    infoArrow.querySelector("path").setAttribute("stroke", buttonOverWhite ? "#111111" : "#ffffff");
});

function analyzeBrightness(url) {
    const probeImg = new Image();
    probeImg.crossOrigin = "anonymous"; 

    probeImg.onload = () => {
        try {
            const size = 20; 
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(probeImg, 0, 0, size, size);

            const { data } = ctx.getImageData(0, 0, size, size);
            let total = 0;
            for (let i = 0; i < data.length; i += 4) {
                total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            }
            const avgLuminance = total / (data.length / 4);

            const root = document.documentElement.style;
            if (avgLuminance > 150) {
                root.setProperty("--clock-fg", "#111111");
                root.setProperty("--clock-fg-secondary", "rgba(17, 17, 17, 0.7)");
            } else {
                root.setProperty("--clock-fg", "#ffffff");
                root.setProperty("--clock-fg-secondary", "rgba(255, 255, 255, 0.7)");
            }
        } catch (e) {

        }
    };

    probeImg.onerror = () => {};
    probeImg.src = url;
}
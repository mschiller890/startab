const API_KEY = import.meta.env.VITE_NASA_API_KEY;

let nasaData;

const heroEl = document.getElementById("app");

fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
.then(response => response.json())
.then(data => {

    nasaData = data;

    heroEl.style.backgroundImage = `url(${data.url})`;

    if (nasaData) {
        document.getElementById("info-title").textContent =
            nasaData.title;

        document.getElementById("info-date").textContent =
            nasaData.date;

        document.getElementById("info-description").textContent =
            nasaData.explanation;

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

    if (window.scrollY > window.innerHeight / 2) {
        document.getElementById("info-title").textContent = data.title;
        document.getElementById("info-date").textContent = data.date;
        document.getElementById("info-description").textContent = data.explanation;
        document.getElementById("info-copyright").textContent = data.copyright
            ? `© ${data.copyright}`
            : "";
    }

});

function setTime() {
  const timeElement = document.getElementById('time');
  const dateElement = document.getElementById('date');
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  timeElement.textContent = timeString;

  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString(undefined, options);
  dateElement.textContent = dateString;
}
setInterval(setTime, 1000);

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

            openModal(
              "Delete Shortcut",
              null,
              null,
              () => {
                  shortcuts = shortcuts.filter(s => s !== shortcut);
                  saveShortcuts();
                  renderShortcuts();
              }
          );
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

const modalConfirm = document.getElementById("modal-confirm");
const modalCancel = document.getElementById("modal-cancel");

let modalCallback = null;


function openModal(title, input1, input2, callback) {

    document.getElementById("modal-title").textContent = title;

    modalInput1.value = "";
    modalInput2.value = "";

    modalInput1.style.display = input1 ? "block" : "none";
    modalInput2.style.display = input2 ? "block" : "none";

    if (input1) {
        modalInput1.placeholder = input1;
    }

    if (input2) {
        modalInput2.placeholder = input2;
    }

    modalOverlay.style.display = "flex";

    modalCallback = callback;
}

function closeModal() {
    modalOverlay.style.display = "none";
    modalCallback = null;
}


modalCancel.onclick = closeModal;


modalConfirm.onclick = () => {

    if(modalCallback) {
        modalCallback(
            modalInput1.value,
            modalInput2.value
        );
    }

    closeModal();
};

function addShortcut() {

    openModal(
        "Add Shortcut",
        "Website URL",
        "Shortcut name",
        (url,name)=>{

            if(!url) return;

            if(!name)
                name = new URL(url).hostname;


            const hostname = new URL(url).hostname;


            shortcuts.push({
                name,
                url,
                icon:`https://www.google.com/s2/favicons?sz=64&domain=${hostname}`
            });


            saveShortcuts();
            renderShortcuts();
        }
    );
}

renderShortcuts();

const infoSection = document.getElementById("info-section");
const infoButton = document.getElementById("info-button");
const infoArrow = document.getElementById("info-arrow");
const infoButtonLabel = document.getElementById("info-button-label");
const imageInfo = document.getElementById("image-info");

function isScrolledToInfo() {
    return window.scrollY > window.innerHeight / 2;
}

infoButton.onclick = () => {

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
});
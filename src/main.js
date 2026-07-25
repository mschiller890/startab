const API_KEY = import.meta.env.VITE_NASA_API_KEY;

fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`).then(response => response.json()).then(data => {
  document.body.style.backgroundImage = `url(${data.url})`;
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

            if (confirm(`Delete "${shortcut.name}"?`)) {
                shortcuts = shortcuts.filter(s => s !== shortcut);
                saveShortcuts();
                renderShortcuts();
            }
        };

        shortcutsContainer.appendChild(div);
    });

    // Add button
    const add = document.createElement("div");
    add.className = "shortcut";
    add.innerHTML = `
        <div style="font-size:40px;">+</div>
        <p>Add shortcut</p>
    `;

    add.onclick = addShortcut;

    shortcutsContainer.appendChild(add);
}

async function addShortcut() {
    const url = prompt("Website URL");

    if (!url) return;

    const name = prompt("Shortcut name") || new URL(url).hostname;

    const hostname = new URL(url).hostname;

    shortcuts.push({
        name,
        url,
        icon: `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`
    });

    saveShortcuts();
    renderShortcuts();
}

renderShortcuts();
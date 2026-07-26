# startab

a new tab page. 

not the garbage your browser ships with by default, and not one of the thousand identical "productivity dashboard" clones either. 

THIS one actually does something: it shows you a different picture of the actual
universe EVERY DAY, tells you the time in text you can read regardless of
what's behind it, tells you the weather, and remembers your shortcuts. 

that's it. that's the whole pitch.

(im such a great writer)
(im so sorry reviewer i forgot to push the readme 😭)

## what it does

- pulls NASA's Astronomy Picture of the Day and uses it as the background.
  sometimes it's a photo, sometimes it's a video (YouTube/Vimeo embed).
  both are handled. this is not optional polish, this is the core feature,
  so it had better work.
- the clock, the weather text, and the buttons check how bright the current
  background is and switch between light and dark text accordingly. if you've
  ever had white text disappear onto a white background, you know why this
  matters. it's not hard to get right, most people just don't bother.
- weather widget using your location if you grant it, a hardcoded fallback
  if you don't. no drama either way.
- shortcuts grid, saved to localStorage. right click to delete. click the
  plus sign to add one. favicons are fetched automatically unless you give it
  your own icon URL.
- scroll down and you get the full APOD writeup and credit for whoever made
  the thing you're looking at, because crediting people is not optional
  either.

## built with

HTML, CSS, vanilla JS, Vite for the build step.

APIs:
- NASA APOD API: the daily image or video and its description
- Open-Meteo: weather, no key required, no reason to use anything else
- BigDataCloud reverse geocoding: turns coordinates into a place name

## the part that was actually annoying

text legibility against a background that changes every day. fixed by
sampling the image on an offscreen canvas, computing average luminance, and
flipping a CSS variable based on the result. straightforward once you think
of it, mildly infuriating before you do.

the second annoyance: fixed elements at different heights on the screen
can't all key off one scroll position. a button near the bottom of the
viewport reaches the white section of the page long before a widget near the
top does. fixed it properly by having each element check its own bounding
rect against the section it's scrolling into, instead of relying on one
global number and hoping it applies everywhere. It didn't.

## running it

```bash
git clone https://github.com/mschiller890/startab.git
cd startab
npm install
```

make a `.env` file:

```
VITE_NASA_API_KEY=your_nasa_api_key_here
```

het a key from api.nasa.gov. takes like 30 seconds. it's free.

```bash
npm run dev
```

## testing it

- grant location access if you want real weather. if you don't, it falls
  back to a default location instead of breaking.
- right click a shortcut to remove it, click plus to add one.
- scroll down to see the info panel. watch the text colors change as you go.
- come back on different days. eventually you'll hit a video day instead of
  an image day, and you should confirm that works too.

## status

works. if it doesn't work for you, it's probably NASA's API being slow, not
the code.

# Greatmind Mirror

⚡️ Lighting fast mirror of [greatmind.id](https://greatmind.id)
hosted at [greatmind.web.id](https://greatmind.web.id).

## Getting Started

### Mirror Site

1. Clone this repository
2. Install javascript dependency with `npm install`
3. Run application with `npm run dev`
4. Open browser and visit `http://localhost:8080`

### Crawl Script

1. Open `crawler.py` file and suits your need
2. Crawl new articles with `python crawler.py --crawl-step-1`
3. Crawl completing articles metadata with `python crawler.py --crawl-step-2`

### Algolia Index

1. Setup algolia search, get APP_ID and APP_KEY
2. Export APP_ID and APP_KEY as environment variable
3. Update index with `python algolia.py`

## Why and How

Why and how this project got started in the first place:

1. Visit greatmind.id
2. The website wont load, too slow
3. Submit complain, no response
4. Feel frustated
5. Got an idea of a mirror website with speed in mind
6. Build python script to crawl the website
7. Build static site with eleventy to mirror the website
8. Publish and show to them this is how you build a site!

## Attribution

All praise and thanks to:

* https://greatmind.id: upstream article source
* https://github.com/eggheadio: inspiration of the look and feel
* https://favicon.io/emoji-favicons/light-bulb: the light bulb favicon
* https://11ty.dev: amazing static site generator
* https://tailwindcss.com: the utility css for rapid development
* https://statically.io: best easy to use cdn made in jogja
* https://pages.dev: host free static site with unlimited bandwith

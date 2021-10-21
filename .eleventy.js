const fs = require('fs');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')
const sqlite = require('better-sqlite3');
const htmlmin = require('html-minifier');
const timezone = require('dayjs/plugin/timezone')
const assetUrl = require('./src/helper/assetUrl');
const rssContent = require('./src/helper/rssContent');
const readingTime = require('./src/helper/readingTime');
const UserConfig = require('@11ty/eleventy/src/UserConfig');
const staticallyImg = require('./src/helper/staticallyImg');
const transformArticles = require('./src/helper/transformArticles');

dayjs.extend(utc);
dayjs.extend(timezone);

const tz = 'Asia/Jakarta';
const now = dayjs().tz(tz).format('YYYY-MM-DD HH:mm');

/**
 * @param {UserConfig} e11
 */
module.exports = (e11) => {

  e11.addPassthroughCopy({ './src/assets/static': './' });
  e11.addPassthroughCopy({ './src/assets/js/sw.js': './sw.js' });
  e11.addPassthroughCopy({ './src/assets/js/app.js': './js/app.js' });

  e11.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath && outputPath.endsWith('.html')) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
    }
    return content;
  });

  e11.addShortcode('lastUpdate', () => now);

  e11.addFilter('dateDMY', (val) => dayjs(val).tz(tz).format('D MMM YYYY'));

  e11.addFilter('dateRfc3339', (val) => dayjs(val).tz(tz).format('YYYY-MM-DDTHH:mm:ssZ'));

  e11.addFilter('dateMidnight', (val) => dayjs(val).tz(tz).hour(0).minute(0).second(0).toISOString());

  e11.addFilter('readTime', (val) => readingTime(val, { speed: 200 }));

  e11.addFilter('ceil', (val) => Math.ceil(val));

  e11.addFilter('jsonify', (val) => JSON.stringify(val));

  e11.addFilter('assetUrl', (url) => assetUrl(url));

  e11.addFilter('staticallyImg', (url, width = '') => staticallyImg(url, width));

  e11.addFilter('rssContent', (content) => rssContent(content));

  e11.addCollection('article', (collection) => {
    const articles = sqlite('database.sqlite').prepare(
      // for development, dont load all
      // "SELECT * FROM articles WHERE content != '' ORDER BY date DESC LIMIT 100"
      "SELECT * FROM articles WHERE content != '' ORDER BY date DESC"
    ).all();
    return transformArticles(articles);
  });

  e11.addCollection('latest_article', (collection) => {
    const articles = sqlite('database.sqlite').prepare(
      "SELECT * FROM articles WHERE content != '' ORDER BY date DESC LIMIT 6"
    ).all();
    return transformArticles(articles);
  });

  e11.addCollection('feed_article', (collection) => {
    const articles = sqlite('database.sqlite').prepare(
      "SELECT * FROM articles WHERE content != '' ORDER BY date DESC LIMIT 10"
    ).all();
    return transformArticles(articles);
  });

  e11.on('afterBuild', () => {
    fs.copyFileSync('docs/daftar-artikel/halaman-1/index.html', 'docs/daftar-artikel/index.html');
    fs.copyFileSync('docs/rss.xml', 'docs/rss');
    fs.copyFileSync('docs/rss.xml', 'docs/feed');
    fs.copyFileSync('docs/rss.xml', 'docs/feed.xml');
    if (!fs.existsSync('docs/artikel/acak')) fs.mkdirSync('docs/artikel/acak');
    fs.copyFileSync('docs/acak/index.html', 'docs/artikel/acak/index.html');
  });

  return {
    passthroughFileCopy: true,
    dir: {
      output: 'docs',
      input: 'src/pages',
      layouts: '../layouts',
      includes: '../includes',
      data: '../data',
    },
    markdownTemplateEngine: 'njk',
  };

};

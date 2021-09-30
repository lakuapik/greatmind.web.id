const fs = require('fs');
const dayjs = require('dayjs');
const sqlite = require('better-sqlite3');
const htmlmin = require('html-minifier');
const UserConfig = require('@11ty/eleventy/src/UserConfig');
const readingTime = require('./src/helper/readingTime');
const transformArticles = require('./src/helper/transformArticles');

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

  e11.addFilter('dateDMY', (val) => dayjs(val).format('D MMM YYYY'));

  e11.addFilter('dateRfc3339', (val) => dayjs(val).format('YYYY-MM-DDTHH:mm:ssZ'));

  e11.addFilter('readTime', (val) => readingTime(val, { speed: 200 }));

  e11.addFilter('ceil', (val) => Math.ceil(val));

  e11.addFilter('jsonify', (val) => JSON.stringify(val));

  e11.addFilter('assetUrl', (url) => {
    const [urlPart, paramPart] = url.split('?');
    const params = new URLSearchParams(paramPart || '');
    const rUrl = (urlPart.charAt(0) == '/') ? urlPart.substring(1) : urlPart;
    const fileStats = fs.statSync(`./src/assets/${rUrl}`);
    params.set('v', new Date(fileStats.mtime).getTime());
    return `${urlPart}?${params}`;
  });

  e11.addFilter('staticallyImg', (url, width = '') => {
    const paths = url.replace('https://', '').split('/');
    const domain = paths[0];
    const image = paths.slice(1, paths.length).join('/');
    return `https://cdn.statically.io/img/${domain}/f=auto&w=${width}/${image}`;
  });

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
    fs.copyFileSync(
      'docs/daftar-artikel/halaman-1/index.html',
      'docs/daftar-artikel/index.html'
    );
    fs.copyFileSync('docs/rss.xml', 'docs/rss');
    fs.copyFileSync('docs/rss.xml', 'docs/feed');
    fs.copyFileSync('docs/rss.xml', 'docs/feed.xml');
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

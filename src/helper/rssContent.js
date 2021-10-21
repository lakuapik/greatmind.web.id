const purifyContent = require('./purifyContent');
const staticallyImg = require('./staticallyImg');
const config = require('./../data/config');

module.exports = function rssContent(article) {
  const content = purifyContent(article.content);

  // add cover image on top of content
  const coverImg = staticallyImg(article.cover);
  const cover = `<img src="${coverImg}" alt="${article.title}"
    style="border-radius:6px;margin:20px auto;object-fit:cover;" />`;

  // add original url after content
  // TODO: get domain from config
  const url = `https://${config.app.domain}/artikel/${article.slug}/`;
  const footer = `<br/><p>Versi web: <a target="_blank" href="${url}">${url}</a></p><hr>`;

  return cover + content + footer;
}

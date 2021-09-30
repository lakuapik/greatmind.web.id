const { chain } = require("underscore")
const purifyContent = require("./purifyContent")

module.exports = function transformArticles(articles) {
  return chain(articles).map(article => ({
    ...article,
    content: purifyContent(article.content),
    slug: article.url.replace('https://greatmind.id/article/', ''),
    hasIframe: article.content.includes('iframe'),
  })).value()
}

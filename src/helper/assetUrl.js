const fs = require('fs');

module.exports = function assetUrl(url, width = '') {
  const [urlPart, paramPart] = url.split('?');
  const params = new URLSearchParams(paramPart || '');
  const rUrl = (urlPart.charAt(0) == '/') ? urlPart.substring(1) : urlPart;
  const fileStats = fs.statSync(`./src/assets/${rUrl}`);
  params.set('v', new Date(fileStats.mtime).getTime());

  return `${urlPart}?${params}`;
}

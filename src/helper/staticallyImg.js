module.exports = function staticallyImg(url, width = '') {
  const paths = url.replace('https://', '').split('/');
  const domain = paths[0];
  const image = paths.slice(1, paths.length).join('/');

  return `https://cdn.statically.io/img/${domain}/f=auto&w=${width}/${image}`;
}

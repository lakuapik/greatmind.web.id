module.exports = function staticallyImg(url, width = '') {
  return url;

  // !! for unknown reason, the statically.io always redirect to original image

  const paths = url.replace('https://', '').split('/');
  const domain = paths[0];
  const image = paths.slice(1, paths.length).join('/');
  const widthParam = width !== '' ? `&w=${width}` : '';

  return `https://cdn.statically.io/img/${domain}/f=auto${widthParam}/${image}`;
}

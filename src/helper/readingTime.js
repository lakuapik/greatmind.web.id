// https://github.com/johanbrook/eleventy-plugin-reading-time
// NO LICENSE FILE
module.exports = function readingTime(
  postOrContent,
  { printSeconds = false, raw = false, speed = 300 } = {}
) {
  const htmlContent =
    typeof postOrContent === 'string'
      ? postOrContent
      : postOrContent.templateContent;

  if (!htmlContent) {
    return `0 ${printSeconds ? 'detik' : 'menit'}`;
  }

  const content = htmlContent.replace(/(<([^>]+)>)/gi, '');
  const matches = content.match(/[\u0400-\u04FF]+|\S+\s*/g);
  const count = matches !== null ? matches.length : 0;

  if (printSeconds === false) {
    const min = Math.ceil(count / speed);

    return raw === false ? `${min} menit` : min;
  }

  const min = Math.floor(count / speed);
  const sec = Math.floor((count % speed) / (speed / 60));

  if (raw === true) return min * 60 + sec;

  return min > 0
    ? `${min} menit, ${sec} detik` : `${min} detik`;
};

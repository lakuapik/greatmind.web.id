module.exports = function purifyContent(content) {
  // remove pre and convert single closing iframe into full iframe tag
  content = content.replace(
    /\<pre\>(.*\n)<iframe(.*)\/\>(.*)\<\/pre\>/gs,
    `<iframe title="an iframe" $2></iframe>`
  );

  // https://stackoverflow.com/questions/5082253/what-is-html-entity-13
  content = content.replace(/&#13;/gs, '');


  // purify ckfinder image
  content = content.replace(
    /\<img(.*?)src="(\/public\/themes\/default\/backend\/js\/library\/ckfinder\/userfiles(.*?))"(.*?)\/\>/gs,
    `<img class="prose-img" src="https://cdn.statically.io/img/greatmind.id/f=auto$2" />`
  );

  return content;
}

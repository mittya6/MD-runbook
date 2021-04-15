const fs = require("fs");
const ejs = require("ejs");
const marked = require("meta-marked");
const path = require('path');
const { Command } = require('commander');

const program = new Command();
program.option("-f, --filepath <value>", "markdown file path").parse(process.argv);
if (!program.opts().filepath){
  throw new Error("-f required filepath")
}

/** parse marked content start */
const renderer = new marked.Renderer();
renderer.image =  function (href, title, text) {
  const dataURI = parseAsDataURL(path.join(path.dirname(program.opts().filepath),href));
  return `<div class="uk-width-1-4 uk-text-center" uk-lightbox>
            <div class="uk-inline-clip uk-transition-toggle" tabindex="0">
              <a class="uk-button uk-button-default" href="${dataURI}"  data-caption="${text}" data-type="image">
                <img src="${dataURI}" uk-img>
                <div class="uk-transition-fade uk-position-cover uk-position-small uk-overlay uk-overlay-default uk-flex uk-flex-center uk-flex-middle">
                  <p class="uk-h4 uk-margin-remove">${text}</p>
                </div>
              </a>
            </div>
          </div>`;
}
renderer.table = function(header, body) {
  return `<table class="uk-table uk-table-divider">'
            <thead>${header}</thead>
            <tbody>${body}</tbody>
          </table>`;
};
const markedContents = marked(fs.readFileSync(program.opts().filepath, 'utf-8'), { renderer: renderer });
/** parse marked content end */


ejs.renderFile('./index.ejs', {

  title: markedContents['meta']['Title'],
  createDate: markedContents['meta']['CreatedDate'],
  updateDate: markedContents['meta']['UpdatedDate'],
  //temp.ejsに渡す値
  prismjs: fs.readFileSync('node_modules/prismjs/prism.js', 'utf-8'),
  prismtoolbarminjs: fs.readFileSync('node_modules/prismjs/plugins/toolbar/prism-toolbar.min.js', 'utf-8'),
  prismcopytoclipboardminjs: fs.readFileSync('node_modules/prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js', 'utf-8'),
  uikitminjs: fs.readFileSync('node_modules/uikit/dist/js/uikit.min.js', 'utf-8'),
  prismtoolbarcss: fs.readFileSync('node_modules/prismjs/plugins/toolbar/prism-toolbar.css', 'utf-8'),
  uikitmincss: fs.readFileSync('custom/my.uikit.css', 'utf-8'),
  prismcss: fs.readFileSync('node_modules/prism-themes/themes/prism-material-light.css', 'utf-8'),

  content: markedContents['html']

}, function (err, html) {
  if (err) {
    console.log(err);
    return;
  }
  // 出力ファイル名
  const file = path.dirname(program.opts().filepath) + '/index.html';
  // テキストファイルに書き込む
  fs.writeFileSync(file, html, 'utf8');
  console.log("完了")
});


function parseAsDataURL(file) {
  const base64ed = fs.readFileSync(file,{ encoding: "base64" });
  return `data:image/${path.extname(file).replace('.','')};base64,${base64ed}`;
}
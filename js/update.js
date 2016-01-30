
/// <reference path="../typings/node/node.d.ts" />

var fs = require("fs");
var path = require("path");
var langs = [
  ['index.html'   ,'img/icon_en.png','english'], 
  ['index_zh.html','img/icon_zh.png','chinese'] 
];
var rootDir = process.argv[2] || ".";


function getLang(name) {
   return name.indexOf('_')>0 ? name.substring(name.indexOf('_')) : "_en_";
}
function getIndexFile(name) {
   for (var i=0;i<langs.length;i++) {
      if (langs[i][0]==name) return "";
      if (getLang(name)==getLang(langs[i][0])) return langs[i][0];
   }
   return langs[0][0];
}
function getLangHtml(fname) {
   // include the languages
   var html="";
   if (fname.indexOf("/")>0) fname = fname.substring(fname.lastIndexOf("/")+1);
   langs.forEach(function(l){
      if (getLang(l[0]) != getLang(fname || "index.html")) 
         html+='<a href="'+l[0]+'"><img src="'+l[1]+'" width="18" align="top"  title="'+l[2]+'"></a>&nbsp;';
   });
   return html;
}

function getContent(template, mark) {
   var start = template.indexOf(mark);
   var end   = template.indexOf(mark.replace("include","/include"));
   return (start>0 && end>start) ? template.substring(start,end) : "";
}

function replaceLanguages(content, file, div) {
   var start = content.indexOf(div);
   var end   = content.indexOf("</div>",start);
   return start>0 ? content.substring(0,start)+div+ getLangHtml(file)+content.substring(end) : content;
}

function replaceIncludes(template, content, file) {
   var startPattern=/<!\-\-include ([a-zA-Z_\-]+) \-\->/g;
   var marks = [], srcContent = content;
   var found;
   while ((found = startPattern.exec(content))!==null) 
      marks.push(found[0]);
   
   marks.forEach(function(mark){
      var src   = getContent(template,mark);
      var start = content.indexOf(mark);
      var end   = content.indexOf(mark.replace("include","/include"));
      if (src) 
        content = content.substring(0,start)+src+content.substring(end);
   });
   
   content = replaceLanguages(content, file, '<div class="lang-menu slock-lang">');
   content = replaceLanguages(content, file, '<div class="menu pull-right slock-lang">');
   
   // handle lang
   if (srcContent!=content) {
      console.log("update "+file);
      fs.writeFile(path.join(rootDir,file), content, {encoding:"utf-8"});
   }   
}

function updateFile(file) {
   if (file.indexOf(".html")<0) return;
   console.log(file);
   fs.readFile(path.join(rootDir,file),"utf-8",function(err,data){
      var template = getIndexFile(file);
      if (template)
         fs.readFile(path.join(rootDir,template),"utf-8",function(err2, data2){
            replaceIncludes(data2, data, file);
         });
   });
}

fs.readdir(rootDir, function(err,files) {
   files.forEach(updateFile);
   // run again in case we changed index-files
});


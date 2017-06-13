var walker = require("walker");
var fs = require("fs-extra");
var path = require("path");
var argv = require("minimist")(process.argv.slice(2));

console.dir(argv);
walker('tmp/seefeld/'+argv["_"][0]).on('file', function(entry,stat)
{
//  fs.pathExists('fuegen/'+path.basename(entry),   existsCallback.bind(null, entry, stat));
copyFile(entry);
});

function existsCallback(entry, stat, err,exists)
{
  if (!exists)
  {
    copyFile(entry);
  }
  else
  {
    fs.stat('seefeld/'+path.basename(entry), overwriteCallback.bind(null,entry,stat));
  }
}


function overwriteCallback (entry,st, err, stats)
{
  if (new Date(st.mtime).getTime() > new Date(stats.mtime).getTime())
    copyFile(entry);

}

function copyFile (entry)
{
  fs.copy(entry, 'seefeld/'+path.basename(entry), function (err) {

    if (err)
      console.log(err);
    else
      console.log(entry + " copied");

  });
}

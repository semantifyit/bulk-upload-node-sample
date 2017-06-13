var path = require("path");
var fs = require("fs-extra");
var walker = require("walker");
var request = require("request");

var giantAnnotationArray = [];
var chunks = [];
var counter = 0;
var requestCount = 0;
//change the directory name
walker("mayrhofen").on("file", fileCallBack).on("end", endCallback);

function fileCallBack(entry, stat) {

    var cid = path.basename(entry);
    var data = fs.readFileSync(entry, "utf8");
    var annotationObject = {};
    try {
      annotationObject["content"] = JSON.parse(data);
    } catch (e) {
      return;
    }

    annotationObject["cid"] = cid;

//change this parameter to define the size of one request
    if (counter == 100) {
      chunks.push(giantAnnotationArray);
      counter = 0;
      giantAnnotationArray = [];
    }

    giantAnnotationArray.push(annotationObject);
    counter++;

}

function endCallback() {

  requestCount = chunks.length;
  makeRequest(chunks);
}

function makeRequest (chunks)
{
  request.post(
    {
      //change :apiKey with a valid apikey
      url: "https://staging.semantify.it/api/annotation/:apiKey",
      form: { content: chunks[requestCount-1] }
    },
    function(error, response, body) {
      if (error) {
        console.log("ERROR: "+ error);
      } else {

        try
        {
          JSON.parse(body);
          console.log("SUCCESS");
          requestCount--;
        }
        catch (e)
        {
          console.log ("ERROR: " + body);
        }

        console.log("remaining: "+requestCount);
      }
    }
  );

  if (requestCount > 0)
  {
    console.log("chunk sent, wait for 2.5 sec");
    console.log(chunks);
    setTimeout(makeRequest.bind(null, chunks),2500);

  }


}

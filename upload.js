var path = require("path");
var fs = require("fs-extra");
var walker = require("walker");
var request = require("request");

var chunkSize = 500; //number of annotations submitted at a time
var apiKey = "HkN8v6Az-"; //your semantify API key
//var folder = "testfiles"; //folder where your JSON files are
//var folder = "lotsoftestfiles"; //folder where your JSON files are
var folder = "mayrhofen"; //folder where your JSON files are

var giantAnnotationArray = [];
walker(folder).on("file", fileCallBack).on("end", endCallback);

function fileCallBack(entry, stat) {

    var cid = path.basename(entry, '.json');
    var data = fs.readFileSync(entry, "utf8");
    var annotationObject = {};
    try {
        annotationObject["content"] = JSON.parse(data);
    } catch (e) {
        return;
    }
    annotationObject["cid"] = cid;

    giantAnnotationArray.push(annotationObject);
}

function endCallback() {
    var length = giantAnnotationArray.length;
    var numChunks = Math.ceil(length / chunkSize);

    console.log("Uploading %d annotation chunks by blocks of %d; in total %d transactions", length, chunkSize, numChunks);

    start = 0;
    while (numChunks > 0) {
        end = start + chunkSize;

        if (end > length) {
            end = length;
        }

        makeRequest(giantAnnotationArray.slice(start, end));

        start += chunkSize;
        numChunks--;
    }
}

function makeRequest(chunks) {
    request({
        url: "https://semantify.it/api/annotation/" + apiKey,
        method: "POST",
        json: chunks
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            //console.log(body)
            console.log("ok")
        } else {
            console.log("error: " + error)
            console.log("response.statusCode: " + response.statusCode)
            console.log("response.statusText: " + response.statusText)
        }
    });
}

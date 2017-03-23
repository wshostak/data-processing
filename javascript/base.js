window.resizeTo(Math.round(screen.width * .8), Math.round(screen.height * .8));

window.data = [];

document.addEventListener("upload-success", fileUploaded);

function fileUploaded(e) {

  var file_text = e.detail.file.text,
      file_name = e.detail.file.name,
      file_ext = file_name.split(".")[1].toLowerCase(),
      ten_lines = file_text.split(/\n|\r/, 10).join("\n"),
      delimiter = guessDelimiter(ten_lines)[0],
      dsv = d3.dsvFormat(delimiter),
      data = [];

  if (file_ext == "json") {

  } else {

    data = dsv.parse(file_text);
    changePage();
  }

  window.data = data;
console.log(data[0]);
console.log(data[1]);
};

function changePage(page) {

console.log("here")
  var next_page = {
    upload: "parser",
    parser: "output",
    output: "upload",
  }

  page = page || next_page[window.location.hash.replace(/[^a-z0-9_-]*/gi, '')] || "parser";

  window.history.pushState({}, null, '/#/' + page);
  window.dispatchEvent(new CustomEvent('location-changed'));  
}

function guessDelimiter (text) {

  var possibleDelimiters = text.split('').filter(function(item, i, ar) {
    return ar.indexOf(item) === i;
  }).join('').replace(/[a-z0-9]*/gi, '');

  return possibleDelimiters.split('').filter(function(delimiter) {

    var cache = -1;

    return text.split('\n').every(function(line) {

      if (!line) {
        return true;
      }

      var length = line.split(delimiter).length;

      if (cache < 0) {
        cache = length;
      }

      return cache === length && length > 1;
    });
  });
}
// ToDo: make own page in app, allow uploading of excel files.

if (typeof window.DataProcessing === "undefined") {

  window.DataProcessing = window.DP = {
    excel: {
      files: []
    }
  };
} else if (typeof window.DataProcessing.excel === "undefined") {

  window.DataProcessing.excel: {
    files: []
  };
}

var CELL_REFERENCES_REGEX = /(['][^']+['][!]([$A-Z]+[$0-9]+|[$A-Z]+:[$A-Z]+)|([$A-Z]+[$0-9]+|[$A-Z]+:[$A-Z]+))/g,
    OBJECT_REFERENCES_REGEX = /(\[[a-zA-Z0-9 #&\?]+\]\[[a-zA-Z0-9 #&\?]+\])/g;

function startDataCrunch () {

  shfitRowsAccountWirelessSummary();
  DP.excel.files.forEach(eachFile);

  output()
}

function shfitRowsAccountWirelessSummary () {

  if (typeof DP.excel['Account&WirelessSummary'] !== "undefined") {

    DP.excel['Account&WirelessSummary'].columnToLetter.AE = DP.excel['Account&WirelessSummary'].columnToLetter.A;
    DP.excel['Account&WirelessSummary'].columnToLetter.AF = DP.excel['Account&WirelessSummary'].columnToLetter.B;
  
    delete DP.excel['Account&WirelessSummary'].columnToLetter.A;
    delete DP.excel['Account&WirelessSummary'].columnToLetter.B;
  }
}

function eachFile (file) {

//console.error("file: " + file);
  for (var property in DP.excel[file][0]) {

    if (DP.excel[file][0].hasOwnProperty(property) && DP.excel[file][0][property] && DP.excel[file][0][property][0] === '=') {

//console.debug("property: " + property);
      DP.excel[file][0][property] = replaceProperties(file, DP.excel[file], property);

      var propertyStr = DP.excel[file][0][property];

      DP.excel[file][0][property] = excelFormulaUtilities.formatFormula(DP.excel[file][0][property]).replace(/"\{/g, '{').replace(/\}"/g, '}').replace(/\}\s*(\/|\+|\-)\s*\{/g, '},"$1",{').replace(/\}\s*(=|\<>|\-)\s*([^"]*)"/g, ',"$1": "$2"}');

      try {
        
        try {

          DP.excel[file][0][property] = JSON.parse(DP.excel[file][0][property]);
        } catch (e) {

          DP.excel[file][0][property] = JSON.parse('[' + DP.excel[file][0][property] + ']');
        }
      } catch (e) {
        
        DP.excel[file][0][property] = propertyStr.replace('=', '');
      }
//console.log(DP.excel[file][0][property]);
    }
  }
}

function handleLoad (e) {

  var href = decodeURIComponent(e.target.href.replace('.txt', '')).split('/'),
      file = href[href.length -1];

  DP.excel.files.push(file);
  data = d3.tsvParse(e.path[0].import.querySelector('body').textContent);

  DP.excel[file] = data;
  data = {};

  DP.excel[file].columns.forEach(function (val, index) {

    data[columnToLetter(index + 1)] = val;
  });

  DP.excel[file].columnToLetter = data;

  if (DP.excel.files.length > 3) startDataCrunch();
}

function columnToLetter (column) {

  var temp, letter = '';

  while (column > 0) {

    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }

  return letter;
}

function output () {

//console.log(DP.excel);
console.log(JSON.stringify(DP.excel).replace(/\\"/g, "'"));
}

function replaceProperties (file, obj, property) {

  return obj[0][property].replace(CELL_REFERENCES_REGEX, function (cellReference) {
          
    var cellReferenceArray = cellReference.replace(/['$]/g, '').split('!'),
        columns = cellReferenceArray.pop().replace(/[^A-Z:]/g, '').split(':'),
        columnOne = columns.shift(),
        columnTwo = columns.shift() || false,
        sheet = cellReferenceArray.pop() || file,
        columnOneOutput = columnOutpuStr(columnOne, sheet);

    return (columnTwo && columnTwo !== columnOne)? columnOneOutput + ':' + columnOutpuStr(columnTwo, sheet): columnOneOutput;
  });
}

function columnOutpuStr (column, sheet) {

  return "@'" + sheet + "." + (DP.excel[sheet].columnToLetter[column] || column) + "'";
}

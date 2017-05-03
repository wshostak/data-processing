// resize electron window.
window.resizeTo(Math.round(screen.width * .8), Math.round(screen.height * .8));

(function (global) {
  "use strict";
  
  var scriptTimer = function (id, clear) {

    var now = !!performance.now? performance.now(): new Date();
  
    clear = clear || false;
    id = id || "default";

    if (scriptTimer[id]) {
  
      var then = scriptTimer[id].start,
          lap = scriptTimer[id].lastLap;

      scriptTimer[id].lastLap = now;

      if (clear) {
        
        scriptTimer[id] = false;
      }

      return [now - then, now - lap];
    }
  
    scriptTimer[id] = {
      start: now,
      lastLap: now
    };
  };

  global.scriptTimer = scriptTimer;

  console.timer = function (id, clear) {

    _outputTime(id, scriptTimer(id, clear));
  };

  console.timerEnd = function (id) {
    
    _outputTime(id, scriptTimer(id, true));
  };

  console.timerLap = function (id, clear) {
    
    _outputTime(id, scriptTimer(id, clear), true);    
  };

  if (!console.time) {

    console.time = console.timer;
    console.timeLap = console.timerLap;
    console.timeEnd = console.timerEnd;
  }

  var _outputTime = function (id, time, lap) {

    id = id || "default";

    if (time) {
      
      if (lap) {

        console.log(id + " lap time: " + (time[1] / 1000) + " seconds.");
      } else {
        
        console.log(id + " elapsed time: " + (time[0] / 1000) + " seconds.");
  
        if (time[0] != time[1]) {
  
          console.log(id + " lap time: " + (time[1] / 1000) + " seconds.");
        }
      }
    }
  }
})(window);

// Building excel functions here...    
(function(global){
  "use strict";

  Number.prototype.toLowerCase = function () {

    return this;
  };

  global.ParseExcelFunctionObject = global.PXlFn = function (rows, column) {

    var output;

/*
try {
console.log("column === 'string': " + (typeof column === "string"))
console.log("rows.length === 1: " + (rows.length === 1))
console.log("typeof rows[0]['" + column + "'] != 'undefined': " + (typeof rows[0][column] !== "undefined"))
} catch (e) {}
*/
    if (typeof column === "undefined") {
  
      return false;
    } else if (typeof column === "string" && rows.length === 1 && typeof rows[0][column] !== "undefined") {
  
      return rows[0][column];
    } else if (typeof column === "number") {
  
      return column;
    } else if (_.isPlainObject(column)) {
  
      var func = Object.keys(column)[0];

//console.log("Calling function :" + func)
//console.info(column[func])
      return XlFn[func].apply({rows: rows}, column[func]);
    } else if (Array.isArray(column)) {
  
      return column;
    } else if (output = column.match(/^\[([^\]]*)\]$/)) {
  
      return output[1];
    }
  
    return column;
  };

  global.ExcelFunctions = global.XlFn = {

    REGEX: function (column, substr, newSubstr) {

      var rows = this.rows || this;
    
      column = PXlFn(rows, column);
    
      substr = substr.split("/");
      newSubstr = newSubstr || '';
    
      var pattern = substr[1],
          flags = substr[2];
    
      return XlFn.PULLVAL.apply(rows, [column]).replace(new RegExp(pattern, flags), newSubstr);
    },
    PULLVAL: function (func) {

      var rows = this.rows || this;

      return _.first(_.values(_.pick(_.first(rows), func))) || "";
    },
    IFEACH: function (conditional, yes, no) {

      var rows = this.rows || this;

      var val = rows.map(function (row) {

        return XlFn.IF.apply([row], [conditional, yes, no]);
      });

      return val;
    },
    IF: function (conditional, yes, no) {

      var rows = this.rows || this;

      var conditionalResult = PXlFn(rows, conditional);
    
      if (Array.isArray(conditionalResult) && !_.isEmpty(conditionalResult)) {

        var yesResult = PXlFn(conditionalResult, yes);

        if ((Array.isArray(yesResult) && !_.isEmpty(yesResult) && typeof yesResult === "function") || conditionalResult[0][yesResult]) {
          
          var output = XlFn.PULLVAL.apply(conditionalResult, [yesResult]);

          return output;
        } else if (Array.isArray(yesResult) && yesResult.length === 1) {
          
          return PXlFn(conditionalResult, yesResult[0]) || "";
        }
    
        return PXlFn(conditionalResult, yesResult) || "";
      }
    
      if (no) {
        var noResult = PXlFn(rows, no);
      
        if ((Array.isArray(noResult) && !_.isEmpty(noResult) && typeof yesResult === "function") || rows[0][noResult]) {
      
          var output = XlFn.PULLVAL.apply(rows, [noResult]);

          return output;
        } else if (Array.isArray(noResult) && noResult.length === 1) {
          
          return PXlFn(conditionalResult, noResult[0]) || "";
        }
      
        return PXlFn(conditionalResult, noResult) || "";
      }

      return "";
    },
    EQUAL: function (leftHandSide, rightHandSide) {

      var rows = this.rows || this;

      leftHandSide = PXlFn(rows, leftHandSide);
      rightHandSide = PXlFn(rows, rightHandSide);

      return rows.filter(function (row) {
    
        var lhs = PXlFn([row], leftHandSide),
            rhs = PXlFn([row], rightHandSide);

        return lhs.toString().toLowerCase() === rhs.toString().toLowerCase();
      });
    },
    NOTEQUAL: function (leftHandSide, rightHandSide) {

      var rows = this.rows || this;

      leftHandSide = PXlFn(rows, leftHandSide);
      rightHandSide = PXlFn(rows, rightHandSide);

      return rows.filter(function (row) {
    
        var lhs = PXlFn([row], leftHandSide),
            rhs = PXlFn([row], rightHandSide);
    
//console.log("lhs: " + lhs)
//console.log("rhs: " + rhs)
//console.log("Number(lhs): " + Number(lhs))
//console.log("Number(rhs): " + Number(rhs))
//console.log("Number(lhs) > Number(rhs): " + (Number(lhs) > Number(rhs)))
//console.log("Number(lhs) > Number(rhs): " + (Number(lhs) > Number(rhs)))
        return lhs.toString().toLowerCase() !== rhs.toString().toLowerCase();
      });
    },
    GREATER: function (leftHandSide, rightHandSide) {

      var rows = this.rows || this;

      leftHandSide = PXlFn(rows, leftHandSide);
      rightHandSide = PXlFn(rows, rightHandSide);

      return rows.filter(function (row) {
    
        var lhs = PXlFn([row], leftHandSide),
            rhs = PXlFn([row], rightHandSide);
    
        return Number(lhs) > Number(rhs);
      });
    },
    FIND: function (searchValue, fromString, fromIndex, greaterThenIndex) {

      var rows = this.rows || this;

      searchValue = PXlFn(rows, searchValue);
      fromString = PXlFn(rows, fromString);
      fromIndex = fromIndex || 0;
      greaterThenIndex = greaterThenIndex || -1;

      return rows.filter(function (row) {
    
        var searchVal = PXlFn([row], searchValue),
            fromStr = PXlFn([row], fromString);
    
        return fromStr.indexOf(searchVal, fromIndex) > greaterThenIndex;
      });
    },
    DIVIDE: function (dividend, divisor) {

      var rows = this.rows || this;

      dividend = PXlFn(rows, dividend);
      divisor = PXlFn(rows, divisor);

      return rows.map(function (row) {
    
        var numerator = PXlFn([row], dividend),
            denominator = PXlFn([row], divisor);
    
        return Number(numerator) / Number(denominator);
      });
    },
    MULTIPLY: function (multiplier, multiplicand) {

      var rows = this.rows || this;

      multiplier = PXlFn(rows, multiplier);
      multiplicand = PXlFn(rows, multiplicand);

      return rows.map(function (row) {
    
        var firstFactor = PXlFn([row], multiplier),
            secondFactor = PXlFn([row], multiplicand);
    
        return Number(firstFactor) * Number(secondFactor);
      });
    },
    ADD: function (augend, addend) {

      var rows = this.rows || this;

      augend = PXlFn(rows, augend);
      addend = PXlFn(rows, addend);

      return rows.map(function (row) {
    
        var firstSummand = PXlFn([row], augend),
            secondSummand = PXlFn([row], addend);
    
        return Number(firstSummand) + Number(secondSummand);
      });
    },
    MINUS: function (minuend, subtrahend) {

      var rows = this.rows || this;

      minuend = PXlFn(rows, minuend);
      subtrahend = PXlFn(rows, subtrahend);

      return rows.map(function (row) {
    
        var firstNumber = PXlFn([row], minuend),
            secondNumber = PXlFn([row], subtrahend);
    
        return Number(firstNumber) - Number(secondNumber);
      });
    },
    MAX: function (column) {

      var rows = this.rows || this;
    
      column = PXlFn(rows, column);

      return _.maxBy(rows, function(o) {
        return o[column];
      });
    },
    SUM: function () {
    
      var args = Array.from(arguments),
          rows = this.rows || this,
          resultsColumn = args.map(function (arg) {
        
            var column = PXlFn(rows, arg);
      
            return d3.sum(d3.map(rows, function(d) { return d[column]; }).keys());
          });

      return _.sum(resultsColumn);
    },
    AND: function () {

      var args = Array.from(arguments),
          rows = this.rows || this;

      return rows.filter(function (row) {
    
        return args.every(function (item) {
    
          return !_.isEmpty(PXlFn([row], item));
        });

      });
    },
    OR: function () {

      var args = Array.from(arguments),
          rows = this.rows || this;

      return rows.filter(function (row) {

        return _.filter(args, function (item) {
      
          return !_.isEmpty(PXlFn([row], item));
        })[0];
      });
    },
    NOR: function () {

      var args = Array.from(arguments),
          rows = this.rows || this;

      return rows.filter(function (row) {
    
        row = args.every(function (item) {
    
          return _.isEmpty(PXlFn([row], item));
        });

        return row;
      });
    },
    NAND: function () {

      var args = Array.from(arguments),
          rows = this.rows || this;

      return rows.filter(function (row) {

        return _.filter(args, function (item) {
      
          return _.isEmpty(PXlFn([row], item));
        })[0];
      });
    },
    RIGHT: function (column, str) {

      var rows = this.rows || this;

      column = PXlFn(rows, column);
      str = PXlFn(rows, str);

      return rows.filter(function (row) {

        var columnValue = PXlFn([row], column);

        return _.endsWith(columnValue.toLowerCase(), str.toLowerCase());
      });
    },
    LEFT: function (column, str) {

      var rows = this.rows || this;

      column = PXlFn(rows, column);
      str = PXlFn(rows, str);

      return rows.filter(function (row) {

        var columnValue = PXlFn([row], column);

        return _.startsWith(columnValue.toLowerCase(), str.toLowerCase());
      });
    }
  };
})(window);

// Load Pratice carrier parse file.
function handleJSONLoad (e) {

  if (typeof window.DataProcessing === "undefined") {
  
    window.DataProcessing = window.DP = {};
  }

  window.DP.parse = JSON.parse(e.path[0].import.querySelector('body').textContent);
}

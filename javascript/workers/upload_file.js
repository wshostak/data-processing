onmessage = function(e) {

  var lines = e.data.split("\n"),
      headers = lines[0].replace("\r", "").split("\t"),
      len = lines.length,
      percentage = 0,
      data = [],
      columns = {};

  for (var j = 0; j < headers.length; j++) {

	  columns[headers[j]] = {};
  }

  for (var i = 1; i < len; i++){

	  var row = {},
	      row_text = lines[i].replace("\r", "").split("\t"),
	      current_percentage = Math.round((i / len) * 100),
	      phone_number;

	  for (var j = 0; j < headers.length; j++) {

		  row[headers[j]] = row_text[j];
      columns[headers[j]][row_text[j]] = row_text[j];
	  }

    if (current_percentage > percentage) postMessage({percentage: percentage + "%"});

    percentage = current_percentage;
    data.push(row);
  }

	  for (var j = 0; j < headers.length; j++) {

      columns[headers[j]] = Object.keys(columns[headers[j]]);
	  }

  postMessage(
    {
      result: {
        headers: headers,
        columns: columns,
        data: data
      }, 
      percentage: '100%'
    }
  );
  close();
};

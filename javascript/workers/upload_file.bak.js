onmessage = function(e) {

  var lines = e.data.split("\n"),
      headers = lines[0].replace("\r", "").split("\t"),
      len = lines.length,
      percentage = 0,
      phones = {},
      percentage = 0,
      plan_check = /flex|canada|mexico|nationwide|nw|share|access/i,
      plan_checkB = /disc/i,
      columns = "Access Fees\tSurcharges\tTaxes\tEquipment Charges\tDomestic MB Charges\tMinutes Alloted\tPeak Minutes Used\tMobile to Mobile Minutes Used\tNight and Weekend Minutes Used\tDirectory Assistance Charge\tInternational LD Charges\tMain Plan".split("\t"),
      column_values = [0,0,0,0,0,0,0,0,0,0,"NO PLAN"],
      delete_row = "Bill Cycle Date\tDate\tECPD Profile ID\tInvoice Number\tUser Name\tCost Center".split("\t"),
      item_category = "Monthly Charges\tVZW Surcharges\tTaxes, Governmental Surcharges and Fees\tEquipment\tData".split("\t"),
      item_description = "calling|shareplan".split("\t"),
      item_description2 = "old".split("\t"),
      sum_used = "calling|shareplan\tMOBILE TO MOBILE\tNIGHT/WEEKEND".split("\t");
      sum_cost = "411\tInternational Long Distance".split("\t");

  for (var i = 1; i < len; i++){

	  var row = {},
	      row_text = lines[i].replace("\r", "").split("\t"),
	      current_percentage = Math.round((i / len) * 100),
	      phone_number;

	  for (var j = 0; j < headers.length; j++) {

		  row[headers[j]] = row_text[j];
	  }

    if (current_percentage > percentage) postMessage({percentage: percentage + "%"});

    percentage = current_percentage;
    phone_number = row["Wireless Number"];
    row["Cost"] = (parseFloat(row["Cost"]) || 0);
    row["Allowance"] = (parseInt(row["Allowance"]) || 0);
    row["Used"] = (parseInt(row["Used"]) || 0);

    if (typeof phones[phone_number] == "undefined") {

      phones[phone_number] = {
        "Data": []
      };

  	  for (var j = 0; j < columns.length; j++) {
  
        phones[phone_number][columns[j]] = column_values[j];
  	  }
    }

	  for (var j = 0; j < item_category.length; j++) {

      var myRe = new RegExp(item_category[j], "gi");

      if (myRe.test(row["Item Category"])) {
  
        phones[phone_number][columns[j]] += row["Cost"];
      }
	  }

	  for (var j = 0; j < item_description.length; j++) {

      var myRe = new RegExp(item_description[j], "gi");
      var myRe2 = new RegExp(item_description2[j], "gi");

      if (myRe.test(row["Item Description"]) && !myRe2.test(row["Item Description"])) {
  
        phones[phone_number][columns[j + item_category.length]] = row["Allowance"];
      }
	  }

	  for (var j = 0; j < sum_used.length; j++) {

      var myRe = new RegExp(sum_used[j], "gi");

      if (myRe.test(row["Item Description"])) {
  
        phones[phone_number][columns[j + item_category.length + item_description.length]] += row["Used"];
      }
	  }

	  for (var j = 0; j < sum_cost.length; j++) {

      var myRe = new RegExp(sum_cost[j], "gi");

      if (myRe.test(row["Item Description"])) {
  
        phones[phone_number][columns[j + item_category.length + item_description.length + sum_used.length]] += row["Cost"];
      }
	  }

    if (plan_check.test(row["Item Description"]) && !plan_checkB.test(row["Item Description"])) {

      phones[phone_number]["Main Plan"] = row["Item Description"];
    }

	  for (var j = 0; j < delete_row.length; j++) {

      delete row[delete_row[j]];
	  }

    phones[phone_number]["Data"].push(row);
  }

  postMessage({result: phones, percentage: '100%'});
  close();
};

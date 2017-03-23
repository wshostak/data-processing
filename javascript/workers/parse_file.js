onmessage = function(e) {

  var contents = e.data,
      phones = {},
      len = contents.length,
      per = 0,
      plan_check = /flex|canada|mexico|nationwide|nw|share|access/i,
      plan_checkB = /disc/i;

  for (var i = 0; i < len; i++) {

	  var current_per = Math.round((i / len) * 100),
	      row = contents[i],
	      phone_number = row["Wireless Number"];

    if (current_per > per) postMessage({per: per + "%"});

    per = current_per;

    if (typeof phones[phone_number] == "undefined") {

      phones[phone_number] = {
//        "Bill Cycle Date": row["Bill Cycle Date"],
//        "Date": row["Date"],
//        "ECPD Profile ID": row["ECPD Profile ID"],
//        "Invoice Number": row["Invoice Number"],
//        "User Name": row["User Name"],
//        "Cost Center": row["Cost Center"],
        "Access Fees": 0,
        "Surcharges": 0,
        "Taxes": 0,
        "Main Plan": "NO PLAN",
        "Data": []
      };
    }

    row.Cost = (parseFloat(row.Cost) || 0);

    if (row["Item Category"] == "Monthly Charges") {

      phones[phone_number]["Access Fees"] += row.Cost;
    } else if (row["Item Category"] == "VZW Surcharges") {

      phones[phone_number]["Surcharges"] += row.Cost;
    } else if (row["Item Category"] == "Taxes, Governmental Surcharges and Fees") {

      phones[phone_number]["Taxes"] += row.Cost;
    }

    if (plan_check.test(row["Item Description"]) && !plan_checkB.test(row["Item Description"])) {

      phones[phone_number]["Main Plan"] = row["Item Description"];
    }

    delete row["Bill Cycle Date"];
    delete row["Date"];
    delete row["ECPD Profile ID"];
    delete row["Invoice Number"];
    delete row["User Name"];
    delete row["Cost Center"];

    phones[phone_number]["Data"].push(row);
  }

  postMessage({result: phones, per: '100%'});
  close();
};

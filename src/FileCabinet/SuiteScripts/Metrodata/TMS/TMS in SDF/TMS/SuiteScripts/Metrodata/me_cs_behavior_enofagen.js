/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(["N/search"], function (search) {


    const SCRIPT_SCHEDULE_ENOFAGEN = "265";

    function saveRecord(context) {
        var rec = context.currentRecord;

        var validNumber = true;
        var startNumber = rec.getValue("custpage_startnumber");
        var endNumber = rec.getValue("custpage_endnumber");
        var valStartNumber1 = startNumber.substr(0, 7);
        if (valStartNumber1.indexOf("-") != 3 && valStartNumber1.indexOf(".") != 6) validNumber = false;
        var valStartNumber2 = startNumber.substr(7);
        if (Number(valStartNumber2) == "NaN") validNumber = false;
        var valEndNumber1 = endNumber.substr(0, 7);
        if (valEndNumber1.indexOf("-") != 3 && valEndNumber1.indexOf(".") != 6) validNumber = false;
        var valEndNumber2 = endNumber.substr(7);
        if (Number(valEndNumber2) == "NaN") validNumber = false;


        "xxx-xx.00000001"
        "xxx-xx.00000100"

        if (startNumber.substr(startNumber.indexOf('.')+1).length!=8 || endNumber.substr(endNumber.indexOf('.')+1).length!=8){
            validNumber = false;
        } 
        const regexMid = /-\d{2}\./;
        if (!regexMid.test(startNumber) || !regexMid.test(endNumber)){
            validNumber = false;
        } 

        const regexFirst = /^\d{3}\-/;
        if (!regexFirst.test(startNumber) || !regexFirst.test(endNumber)){
            validNumber = false;
        } 
  
        if (validNumber == false) {
            alert(
                "Start Number dan End Number harus berformat seperti berikut: \n" +
                "Start Number: xxx-xx.00000001 \n" +
                "End Number: xxx-xx.00000100"
            )
        } else {

            var scheduledscriptinstanceSearchObj = search.create({
                type: "scheduledscriptinstance",
                filters:
                    [
                        ["script.internalid", "anyof", "SCRIPT_SCHEDULE_ENOFAGEN"], "AND",
                        ["status", "anyof", "PROCESSING", "PENDING", "RETRY"]
                    ],
                columns:
                    ["taskid", "Status"]
            });
            var ssisR = scheduledscriptinstanceSearchObj.run().getRange(0, 1000);
            if (ssisR.length > 0) {
                alert("Request pembuatan enofa baru tidak belum bisa dilakukan sekarang karena ada request pembuatan enofa yang sedang berjalan!");
                return false;
            }

            var listExistingEnofa = []
            var dupeEnofa = [];
            var startCount = [
                startNumber.substring(0, 7),
                Number(startNumber.substring(7))
            ]
            //console.log("startCount", startCount);
            var endCount = [
                endNumber.substring(0, 7),
                Number(endNumber.substring(7))
            ]
            //console.log("endCount", endCount);


            var startWith = endNumber.substring(7);
            startWith = endNumber.substring(0, 7) + startWith.substring(0, startWith.length - String(endCount[1]).length)
            //console.log("startWith", startWith);

            var existingEnofa = search.create({
                type: "customrecord_me_enofa_faktur_pajak",
                filters: [
                    ["name", "startswith", startWith]
                ],
                columns: ["name"]
            });
            var startRow = 0
            do {
                var existingEnofaR = existingEnofa.run().getRange(startRow, startRow + 1000)
                for (var i = 0; existingEnofaR.length > i; i++) {
                    listExistingEnofa.push(existingEnofaR[i].getValue("name"));
                }
                startRow += 1000
            } while (existingEnofaR.length == 1000);

            var count = endCount[1] - startCount[1] + 1;
            //console.log("count", count);

            for (var i = 0; i < count; i++) {
                var delapandigit = startCount[1] + i;
                var padding = 8 - String(delapandigit).length;
                for (var y = 0; y < padding; y++) {
                    delapandigit = "0" + delapandigit;
                }
                var currentNoFak = startCount[0] + delapandigit;
                if (listExistingEnofa.indexOf(currentNoFak) > -1) dupeEnofa.push(currentNoFak);
            }
            console.log("dupeEnofa", dupeEnofa);


            if (dupeEnofa.length > 0) {
                let text = "Enofa yang akan dibuat berikut sudah terdapat pada database enofa NetSuite:\n\
            " + dupeEnofa.join(", ") + "\n\
            ";
                if (confirm(text) == true) {
                    return false;
                } else {
                    return false;
                }
            }

            return true;
        }
    }

    return {
        saveRecord: saveRecord
    }
});

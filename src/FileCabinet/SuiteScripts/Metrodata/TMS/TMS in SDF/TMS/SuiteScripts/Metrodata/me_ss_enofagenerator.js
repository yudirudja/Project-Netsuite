/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(["N/runtime", "N/task", "N/file", "N/search", "N/redirect"], function (runtime, task, file, search, redirect) {

    const SAVED_CSV_TEMPLATE = "15" //untuk ID cari di "Saved CSV Import" nama Recordnya "ME - Enofa Generator"
    var scriptObj = runtime.getCurrentScript();
    function execute(context) {
        var paramData = scriptObj.getParameter({
            name: 'custscript_me_data_fp_enofagenerator'
        });
        log.debug("paramData", paramData);
        var parseData = JSON.parse(paramData);
        log.debug("parseData", parseData);

        var startNumber = parseData.startNumber
        var endNumber = parseData.endNumber
        var createDate = parseData.createDate

        var listExistingEnofa = []
        var dupeEnofa = [];
        var startCount = [
            startNumber.substring(0, 7),
            Number(startNumber.substring(7))
        ]
        log.debug("startCount", startCount);
        var endCount = [
            endNumber.substring(0, 7),
            Number(endNumber.substring(7))
        ]
        log.debug("endCount", endCount);
        var count = endCount[1] - startCount[1] + 1;
        log.debug("count", count);

        var startWith = endNumber.substring(7);
        startWith = endNumber.substring(0, 7) + startWith.substring(0, startWith.length - String(endCount[1]).length)
        // log.debug("startWith", startWith);

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
        // log.debug("listExistingEnofa", listExistingEnofa);

        var totalCreated = 0;
        do {
            startRow = 0;
            var rawContent = "ME - Nomor ENOFA,ME - Date,ME - Year,ME - Status Faktur Pajak\n";
            for (var i = totalCreated; i < count; i++) {
                var delapandigit = startCount[1] + i;
                var padding = 8 - String(delapandigit).length;
                for (var y = 0; y < padding; y++) {
                    delapandigit = "0" + delapandigit;
                }
                var currentNoFak = startCount[0] + delapandigit
                if (listExistingEnofa.indexOf(currentNoFak) > -1) {
                    dupeEnofa.push(currentNoFak);
                    continue;
                }

                var getYearIndex = 0;

                for (let i = createDate.length - 1; createDate.length > 0; i--) {
                    if (createDate[i] == "/") {
                        getYearIndex = i
                        break;
                    } 
                }

                var getYear = createDate.substring(getYearIndex + 1)

                var currentLine = currentNoFak + "," + createDate + "," + getYear + "," + "open"+ "," + "\n";
                rawContent += currentLine
                startRow++;
                totalCreated++;
                if (startRow == 24999) break;
            }
            log.debug("rawcontent", rawContent);


            var scriptTask = task.create({ taskType: task.TaskType.CSV_IMPORT });
            scriptTask.mappingId = SAVED_CSV_TEMPLATE;
            scriptTask.importFile = rawContent;
            var csvImportTaskId = scriptTask.submit();
            var status = task.checkStatus(csvImportTaskId);
            for (i = 0; i < 2; i++) {
                if (status.status !== 'COMPLETE') {
                    i = 0;
                } else {

                }
            }
        } while (totalCreated < count);

        var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
        log.debug('Remaining Usage:', remainingUsage);
    }

    return {
        execute: execute
    }
});

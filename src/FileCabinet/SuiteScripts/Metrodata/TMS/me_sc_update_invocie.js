/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
 define(['N/search', 'N/record'], function (search, record) {

    function execute(context) {
        var invSearch = search.create({
            type: "transaction",
            filters:
                [
                    ["type","anyof","CustInvc"], 
                    "AND", 
                    ["mainline","is","T"]
                ],
            columns:
                [

                    search.createColumn({ name: "internalid", label: "internal id" }),

                ]
        }).run().getRange({
            start: 0,
            end: 1000
        });

        for (let i = 0; i < invSearch.length; i++) {
            var loadInv = record.load({
                type: record.Type.INVOICE,
                id: invSearch[i].getValue(invSearch[i].columns[0]),
            });
            
            loadInv.save()

        }

    }

    return {
        execute: execute
    }
});

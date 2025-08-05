/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
 define(['N/search', 'N/record'], function (search, record) {

    function execute(context) {
        var soSearch = search.create({
            type: "transaction",
            filters:
                [
                    ["type","anyof","SalesOrd"], 
                    "AND", 
                    ["currency","anyof","5"], 
                    "AND", 
                    ["custbody_me_bounded_zone","anyof","2"], 
                    "AND", 
                    ["mainline","is","T"], 
                    "AND", 
                    ["custbody_me_proforma_final","anyof","2"]
                ],
            columns:
                [

                    search.createColumn({ name: "internalid", label: "internal id" }),

                ]
        }).run().getRange({
            start: 0,
            end: 1000
        });

        for (let i = 0; i < soSearch.length; i++) {
            var loadSo = record.load({
                type: record.Type.SALES_ORDER,
                id: soSearch[i].getValue(soSearch[i].columns[0]),
            });
            
            loadSo.save()

        }

    }

    return {
        execute: execute
    }
});

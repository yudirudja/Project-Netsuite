/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record'], function (search, record) {

    function execute(context) {
        var inventoryitemSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    ["type","anyof","PurchOrd"], 
                    "AND", 
                    ["custbody_me_purchase_category","anyof","13","14","15"], 
                    "AND", 
                    ["mainline","is","T"]
                ],
            columns:
                [

                    search.createColumn({ name: "internalid", label: "internal id" }),

                ]
        }).run().getRange({
            start: 0,
            end: 1
        });

        for (let i = 0; i < inventoryitemSearchObj.length; i++) {
            var loadItem = record.delete({
                type: record.Type.PURCHASE_ORDER,
                id: inventoryitemSearchObj[i].getValue(inventoryitemSearchObj[i].columns[0]),
            });
        }

    }

    return {
        execute: execute
    }
});

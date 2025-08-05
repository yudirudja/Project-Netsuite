/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
 define(['N/search', 'N/record'], function (search, record) {

    function execute(context) {
        var invoice_search = search.create({
            type: "invoice",
            filters:
                [
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["mainline", "is", "T"],
                    // "AND",
                    // ["formulatext: {transactionname}", "contains", "IN24"],
                    // "AND",
                    // ["currency", "noneof", "1"],
                    // "AND",
                    // ["custbody_me_nomor_enofa", "noneof", "@NONE@"]
                    "AND",
                    ["trandate", "within", "2/11/2024", "6/11/2024"],
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                ]
        }).run().getRange({
            start: 0,
            end: 1
        });

        for (let i = 0; i < invoice_search.length; i++) {
            let get_internal_id = invoice_search[i].getValue(invoice_search[i].columns[0])

            let load_inv = record.load({
                type: record.Type.INVOICE,
                id: get_internal_id
            })
            load_inv.save()
            
        }
    }

    return {
        execute: execute
    }
});

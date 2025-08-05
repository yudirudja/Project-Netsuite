/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record'], function (search, record) {

    function execute(context) {
        var customrecord_me_enofa_faktur_pajakSearchObj = search.create({
            type: "invoice",
            filters:
                [
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["formulatext: {transactionname}", "contains", "IN24"],
                    "AND",
                    ["currency", "noneof", "1"],
                    "AND",
                    ["custbody_me_nomor_enofa", "noneof", "@NONE@"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "transactionname", label: "Transaction Name" }),
                    search.createColumn({ name: "currency", label: "Currency" }),
                    search.createColumn({ name: "custbody_me_nomor_enofa", label: "ME - ENOFA Number" })
                ]
        }).run().getRange({
            start: 0,
            end: 1
        });

        for (let i = 0; i < customrecord_me_enofa_faktur_pajakSearchObj.length; i++) {

            if (customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[1]).includes('IN24')) {
                log.debug('nama transaksi', {
                    invoice: customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[1]),
                    internal_id: customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[0])
                })
                var id = record.submitFields({
                    type: record.Type.INVOICE,
                    id: customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[0]),
                    values: {
                        custbody_me_nomor_enofa: '',
                        custbody_me_nomor_faktur_pajak_sales: ''
                    },
                    options: {
                        // enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });
            }


        }
    }

    return {
        execute: execute
    }
});

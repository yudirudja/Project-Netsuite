/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/record", "N/url", "N/search"], function (runtime, record, url, search) {

    function getRelated(params) {
        let result = []
        var salesorderSearchObj = search.create({
            type: "salesorder",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["internalid", "anyof", params],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["taxline", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "type",
                        join: "applyingTransaction",
                        label: "Type"
                    })
                ]
        }).run().getRange({
            start: 0,
            end: 1000
        });

        for (let i = 0; i < salesorderSearchObj.length; i++) {
            let get_applying_trans_type = salesorderSearchObj[i].getText(salesorderSearchObj[i].columns[0]);
            result.push(get_applying_trans_type)
        }
        log.debug("result", result)
        return result
    }

    function beforeLoad(context) {
        // log.debug("Remaining governance Total Before Load : " + runtime.getCurrentScript().getRemainingUsage());
        var newRec = context.newRecord
        if (context.type == context.UserEventType.VIEW) {

            let get_intercompany = newRec.getValue("intercotransaction")
            let get_related = getRelated(newRec.id)

            if (!get_related.includes("Item Fulfillment") && !get_intercompany) {

                var record_id = newRec.id
                var record_type = newRec.type

                var param = {
                    record_id: record_id,
                    record_type: record_type,
                    // delegator: getDelegator,
                }
                var paramJson = JSON.stringify(param)
                context.form.addButton({
                    id: 'custpage_button_delegate',
                    label: "Create Fulfillment",
                    functionName: "onButtonClick(" + paramJson + ")"
                })
                try {
                    log.debug('client script fileid')
                    context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/transform_so_to_if/me_cs_transform_so_to_if_button.js'
                } catch (error) {
                    log.debug("error client script modulepath", error)
                    // console.log("error client script modulepath " + error)
                }
                log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
            }
        }

    }


    return {
        beforeLoad: beforeLoad,

    }
});

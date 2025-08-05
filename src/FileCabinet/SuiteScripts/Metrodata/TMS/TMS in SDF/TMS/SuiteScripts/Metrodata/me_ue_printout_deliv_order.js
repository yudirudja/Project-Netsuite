/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/record", "N/url"], function (runtime, record, url) {

    function beforeLoad(context) {
        var newRec = context.newRecord
        if (context.type == context.UserEventType.VIEW) {
            var record_id = newRec.id
            var record_type = newRec.type
            
            

            var param = {
                record_id: record_id,
                record_type: record_type
            }
            var paramJson = JSON.stringify(param)
            context.form.addButton({
                id: 'custpage_button_printout_deliv_order',
                label: "Print Delivery Order",
                functionName: "onButtonClick(" + paramJson + ")"
            })
            try {

                log.debug('client script fileid')
                context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_printout_deliv_order.js'
            } catch (error) {
                log.debug("error client script modulepath", error)
                console.log("error client script modulepath " + error)
            }
            log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());

            
        }
    }

    

    return {
        beforeLoad: beforeLoad
    }
});

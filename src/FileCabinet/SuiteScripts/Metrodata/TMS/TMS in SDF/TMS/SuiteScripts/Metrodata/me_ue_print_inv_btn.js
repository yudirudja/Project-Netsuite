/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(["N/runtime", "N/record", "N/url"], function (runtime, record, url) {

    function beforeLoad(context) {
        // log.debug("Remaining governance Total Before Load : " + runtime.getCurrentScript().getRemainingUsage());
        var newRec = context.newRecord
        if (context.type == context.UserEventType.VIEW) {
            var record_id = newRec.id
            var record_type = newRec.type
            var sales_category = newRec.getText('custbody_me_sales_category');
            // var status = newRec.getText('status');

            // var printout = url.resolveScript({
            //     scriptId: 'customscript_me_sl_delegate',//Please make sure to replace this with the script ID of your Suitelet
            //     deploymentId: 'customdeploy_me_sl_delegate',//Please make sure to replace this with the deployment ID of your Suitelet
            //     params: {
            //         id: pr_id,
            //     }
            // })
            // log.debug("printout", printout)

            var getDelegator = newRec.getValue('custbody_me_sales_approver');
            var getSalesCategory = newRec.getText('custbody_me_sales_category');
            var getProformaFinal = newRec.getText('custbody_me_proforma_final');
            if (getSalesCategory.includes('Foreign')) {

                var param = {
                    record_id: record_id,
                    record_type: record_type,
                    tipe: 'foreign',
                    // delegator: getDelegator,
                }
                var paramJson = JSON.stringify(param)
                context.form.addButton({
                    id: 'custpage_button_delegate',
                    label: "Print Export",
                    functionName: "onButtonClick(" + paramJson + ")"
                })
                try {

                    log.debug('client script fileid')
                    context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_print_inv_btn.js'
                } catch (error) {
                    log.debug("error client script modulepath", error)
                    console.log("error client script modulepath " + error)
                }
                log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());

            } else if (!getSalesCategory.includes('Foreign')){
                var param = {
                    record_id: record_id,
                    record_type: record_type,
                    tipe: 'domestic',
                    // delegator: getDelegator,
                }

                var buttonPlaceHolder = '';
                if (getSalesCategory.includes('Domestic')) {
                    buttonPlaceHolder = 'Print Domestic'
                }else{
                    buttonPlaceHolder = 'Print Other'
                }

                var paramJson = JSON.stringify(param)
                context.form.addButton({
                    id: 'custpage_button_delegate',
                    label: buttonPlaceHolder,
                    functionName: "onButtonClick(" + paramJson + ")"
                })
                try {

                    log.debug('client script fileid')
                    context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_print_inv_btn.js'
                } catch (error) {
                    log.debug("error client script modulepath", error)
                    console.log("error client script modulepath " + error)
                }
                log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
            }
        }

    }


    return {
        beforeLoad: beforeLoad,

    }
});

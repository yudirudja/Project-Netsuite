/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/url', 'N/ui/serverWidget'], function (url, serverWidget) {

    function beforeLoad(context) {
        var currentRecord = context.newRecord;

        var getClearing1 = currentRecord.getValue('custbody_me_child_settle_clearing_tran');
        var getClearing2 = currentRecord.getValue('custbody_me_child_settle_clearing_tra2');
        var getBillCredit = currentRecord.getValue('custbody_me_bill_credit_settlement');
        var getChecks = currentRecord.getValue('custbody_me_vendor_prepay');
        log.debug("getClearing1", getClearing1);
        log.debug("getClearing2", getClearing2);
        log.debug("getBillCredit", getBillCredit);

        var deleteRec = url.resolveScript({
            scriptId: 'customscript_me_sl_dlt_sttlmnt_mltcrr_ap',
            deploymentId: 'customdeploy_me_sl_dlt_sttlmnt_mltcrr_ap',
            params: {
                id: currentRecord.id,
                clearing1: getClearing1,
                clearing2: getClearing2,
                billCredit: getBillCredit,
                checks: getChecks,
            }
        });

        context.form.addButton({
            id: 'custpage_delete_button',
            label: 'Delete',
            functionName: "deleteData('" + deleteRec + "')",
        });
        context.form.clientScriptModulePath = "SuiteScripts/METRODATA/me_cs_delete_settlement_multicurr_ap_button.js "
    }

    return {
        beforeLoad: beforeLoad,
    }
});

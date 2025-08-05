/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/record", "N/url", 'N/search', './config/me_config_yudi.js'], function (runtime, record, url, search, config) {

    function beforeLoad(context) {
        // log.debug("Remaining governance Total Before Load : " + runtime.getCurrentScript().getRemainingUsage());
        var newRec = context.newRecord
        if (context.type == context.UserEventType.VIEW) {
            var record_id = newRec.id
            var record_type = newRec.type
            var meStatus = newRec.getText('custbody_me_approval_so_custom');
            var status = newRec.getText('status');
            var currUser = runtime.getCurrentUser().id;
            var getFinanceApprover = newRec.getValue('custbody_me_finance_approver');
            var getAccountingApprover = newRec.getValue('custbody_me_accounting_approver_custom');
            var getSalesApprover = newRec.getValue('custbody_me_sales_approver');

            var currUser = runtime.getCurrentUser().id;
            var currUserRoleId = runtime.getCurrentUser().role;
            log.debug("current user", currUser)
            log.debug("status", status)
            log.debug("meStatus", meStatus)

            // var printout = url.resolveScript({
            //     scriptId: 'customscript_me_sl_delegate',//Please make sure to replace this with the script ID of your Suitelet
            //     deploymentId: 'customdeploy_me_sl_delegate',//Please make sure to replace this with the deployment ID of your Suitelet
            //     params: {
            //         id: pr_id,
            //     }
            // })
            // log.debug("printout", printout)

            // var getDelegator = newRec.getValue('custbody_me_sales_approver');
            var getSalesCategory = newRec.getText('custbody_me_sales_category');
            if (config.role.administrator == currUserRoleId) {
                if (record_type.includes('salesorder')) {
                    try {

                        if (!meStatus.includes('Approved')) {


                            var param = {
                                record_id: record_id,
                                record_type: record_type,
                                delegator: getSalesApprover,
                            }
                            var paramJson = JSON.stringify(param)
                            context.form.addButton({
                                id: 'custpage_button_delegate',
                                label: "Delegate Real Time",
                                functionName: "onButtonClick(" + paramJson + ")"
                            })
                            try {

                                log.debug('client script fileid')
                                context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_delegate_btn.js'
                            } catch (error) {
                                log.debug("error client script modulepath", error)
                                console.log("error client script modulepath " + error)
                            }
                            log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
                        }
                    } catch (error) {
                    }
                } else {

                    var delegator_user = getFinanceApprover?getFinanceApprover:getAccountingApprover?getAccountingApprover:currUser;
                    if (status.includes('Pending Approval')) {
                        var param = {
                            record_id: record_id,
                            record_type: record_type,
                            delegator: delegator_user,
                        }
                        var paramJson = JSON.stringify(param)
                        context.form.addButton({
                            id: 'custpage_button_delegate',
                            label: "Delegate Real Time",
                            functionName: "onButtonClick(" + paramJson + ")"
                        })
                        try {

                            log.debug('client script fileid')
                            context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_delegate_btn.js'
                        } catch (error) {
                            log.debug("error client script modulepath", error)
                            console.log("error client script modulepath " + error)
                        }
                        log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
                    }
                }
            }

        }
    }

    return {
        beforeLoad: beforeLoad,

    }
});

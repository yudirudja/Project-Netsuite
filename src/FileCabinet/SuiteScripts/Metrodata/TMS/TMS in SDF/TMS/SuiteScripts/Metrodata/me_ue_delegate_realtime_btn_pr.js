/**
 *@NApiVersion 2.1
*@NScriptType UserEventScript
*/
define(["N/runtime", "N/record", "N/url", 'N/search', './config/me_config_yudi.js', 'N/ui/serverWidget'], function (runtime, record, url, search, config, serverWidget) {

    function beforeLoad(context) {
        // log.debug("Remaining governance Total Before Load : " + runtime.getCurrentScript().getRemainingUsage());
        var newRec = context.newRecord

        if (context.type == 'view') {//untuk menghilangkan button edit

            var getRfqStatus1 = newRec.getText('custbody_me_status_all_rfq');

            var currUserRoleId1 = runtime.getCurrentUser().role;
            log.debug('currUserRoleId1', currUserRoleId1)
            log.debug('getRfqStatus1', getRfqStatus1)

            if (getRfqStatus1.includes('Complete') && config.role.administrator != currUserRoleId1) {
                var hideFld = context.form.addField({
                    id: 'custpage_hide_buttons',
                    label: 'not shown - hidden',
                    type: serverWidget.FieldType.INLINEHTML
                });
                var scr = "";
                // scr += `jQuery("a.dottedlink:contains('Remove')").hide();`;
                scr += `jQuery("#tbl_edit").hide();`;
                scr += `jQuery("#tdbody_secondaryedit").hide();`;


                hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
            }
        }
        if (context.type == 'edit') {//untuk menghilangkan button edit

            try {


                var getRfqStatus2 = newRec.getText('custbody_me_status_all_rfq');

                var currUserRoleId2 = runtime.getCurrentUser().role;
                log.debug('currUserRoleId2', currUserRoleId2)
                log.debug('getRfqStatus2', getRfqStatus2)

                if (getRfqStatus2.includes('Complete') && config.role.administrator != currUserRoleId2) {
                    var hideFld = context.form.addField({
                        id: 'custpage_hide_buttons',
                        label: 'not shown - hidden',
                        type: serverWidget.FieldType.INLINEHTML
                    });
                    var scr = "";
                    // scr += `jQuery("a.dottedlink:contains('Remove')").hide();`;
                    scr += `jQuery("#spn_multibutton_submitter").hide();`;
                    scr += `jQuery(".bntBgB.multiBnt").hide();`;
                    scr += `jQuery("#spn_secondarymultibutton_submitter").hide();`;


                    hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
                }
            } catch (error) {

            }
        }
        if (context.type == context.UserEventType.VIEW) {
            var record_id = newRec.id
            var record_type = newRec.type
            var meStatus = newRec.getText('custbody_me_approval_so_custom');
            var status = newRec.getText('status');

            var currUser = runtime.getCurrentUser().id;
            var currUserRoleId = runtime.getCurrentUser().role;
            log.debug('currUserRoleId', currUserRoleId)
            log.debug('config.role.administrator', config.role.administrator)

            var getBuOtherApp = newRec.getValue('custbody_me_bu_approver')
            var getPurchaserApp = newRec.getValue('custbody_me_purchaser_approver')
            var getDirApp = newRec.getValue('custbody_me_director_approver')
            var getPresDirApp = newRec.getValue('custbody_me_president_director');
            var getApprovalPosition = newRec.getValue('custbody_me_custom_approval_status')
            var getDelegateBu = newRec.getValue('custbody_me_delegate_rt_bu')
            var getDelegatePurchaser = newRec.getValue('custbody_me_delegate_rt_director')
            var getDelegateDirector = newRec.getValue('custbody_me_delegate_rt_director')
            var getDelegatePresDirector = newRec.getValue('custbody_me_delegate_rt_presdir')
            // log.debug("current user", currUser)
            // log.debug("status", status)
            // log.debug("meStatus", meStatus)

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
            if (record_type.includes('salesorder')) {
                try {

                    if (!meStatus.includes('Approved')) {


                        var param = {
                            record_id: record_id,
                            record_type: record_type,
                            delegator: currUser,
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
                            // console.log("error client script modulepath " + error)
                        }
                        log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
                    }
                } catch (error) {
                }
            } else {
                if (config.role.administrator == currUserRoleId) {
                    if (status.includes('Pending Approval') && (getApprovalPosition.includes('Business Unit') || getApprovalPosition.includes('Department Approver')) && !getDelegateBu) {
                        log.debug('ini BU')
                        var param = {
                            record_id: record_id,
                            record_type: record_type,
                            delegator: getBuOtherApp,
                            delegator_dept: 'BU',
                        }
                        var paramJson = JSON.stringify(param)
                        context.form.addButton({
                            id: 'custpage_button_delegate',
                            label: "Delegate Real Time BU/Other",
                            functionName: "onButtonClick(" + paramJson + ")"
                        })
                        try {

                            log.debug('client script fileid')
                            context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_delegate_realtime_btn_pr.js'
                        } catch (error) {
                            log.debug("error client script modulepath", error)
                            // console.log("error client script modulepath " + error)
                        }
                        log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
                    }

                }
                if (config.role.administrator == currUserRoleId) {
                    if (status.includes('Pending Approval') && !getApprovalPosition.includes('President Director') && !getApprovalPosition.includes('Director') && (!getApprovalPosition.includes('Business Unit') || !getApprovalPosition.includes('Department Approver')) && !getDelegatePurchaser) {
                        log.debug('ini Purchaser')
                        var param = {
                            record_id: record_id,
                            record_type: record_type,
                            delegator: getPurchaserApp,
                            delegator_dept: 'Purchaser',
                        }
                        var paramJson = JSON.stringify(param)
                        context.form.addButton({
                            id: 'custpage_button_delegate',
                            label: "Delegate Real Time Purchasing",
                            functionName: "onButtonClick(" + paramJson + ")"
                        })
                        try {

                            log.debug('client script fileid')
                            context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_delegate_realtime_btn_pr.js'
                        } catch (error) {
                            log.debug("error client script modulepath", error)
                            // console.log("error client script modulepath " + error)
                        }
                        log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
                    }
                }
                if (config.role.administrator == currUserRoleId) {
                    if (status.includes('Pending Approval') && getApprovalPosition == ('Director Approval') && !getDelegateDirector) {
                        log.debug('ini Director')
                        var param = {
                            record_id: record_id,
                            record_type: record_type,
                            delegator: getDirApp,
                            delegator_dept: 'Director',
                        }
                        var paramJson = JSON.stringify(param)
                        context.form.addButton({
                            id: 'custpage_button_delegate',
                            label: "Delegate Real Time Director",
                            functionName: "onButtonClick(" + paramJson + ")"
                        })
                        try {

                            log.debug('client script fileid')
                            context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_delegate_realtime_btn_pr.js'
                        } catch (error) {
                            log.debug("error client script modulepath", error)
                            // console.log("error client script modulepath " + error)
                        }
                        log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
                    }

                }
                if (config.role.administrator == currUserRoleId) {
                    if (status.includes('Pending Approval') && getApprovalPosition.includes('President Director') && !getDelegatePresDirector) {
                        log.debug('ini Presdir')
                        var param = {
                            record_id: record_id,
                            record_type: record_type,
                            delegator: getPresDirApp,
                            delegator_dept: 'Pres Director',
                        }
                        var paramJson = JSON.stringify(param)
                        context.form.addButton({
                            id: 'custpage_button_delegate',
                            label: "Delegate Real Time President Director",
                            functionName: "onButtonClick(" + paramJson + ")"
                        })
                        try {

                            log.debug('client script fileid')
                            context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_delegate_realtime_btn_pr.js'
                        } catch (error) {
                            log.debug("error client script modulepath", error)
                            // console.log("error client script modulepath " + error)
                        }
                        log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
                    }

                }
                // if (status.includes('Pending Approval')) {
                //     var param = {
                //         record_id: record_id,
                //         record_type: record_type,
                //         delegator: currUser,
                //     }
                //     var paramJson = JSON.stringify(param)
                //     context.form.addButton({
                //         id: 'custpage_button_delegate',
                //         label: "Delegate Real Time",
                //         functionName: "onButtonClick(" + paramJson + ")"
                //     })
                //     try {

                //         log.debug('client script fileid')
                //         context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_delegate_realtime_btn_pr.js'
                //     } catch (error) {
                //         log.debug("error client script modulepath", error)
                //         console.log("error client script modulepath " + error)
                //     }
                //     log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
                // }
            }

        }
    }

    return {
        beforeLoad: beforeLoad,

    }
});

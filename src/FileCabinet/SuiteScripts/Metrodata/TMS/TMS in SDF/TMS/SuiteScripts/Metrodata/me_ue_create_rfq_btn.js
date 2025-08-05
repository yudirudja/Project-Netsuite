/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/record", "N/url", "N/currency", 'N/search'], function (runtime, record, url, currency, search) {

    function beforeLoad(context) {
        // log.debug("Remaining governance Total Before Load : " + runtime.getCurrentScript().getRemainingUsage());
        var newRec = context.newRecord
        var currUser = runtime.getCurrentUser().id;
        if (context.type == context.UserEventType.VIEW) {
            var record_id = newRec.id
            var record_type = newRec.type
            var meStatus = newRec.getText('custbody_me_approval_so_custom');
            var status = newRec.getText('status');
            var statusRfq = newRec.getText('custbody_me_status_all_rfq');

            // var printout = url.resolveScript({
            //     scriptId: 'customscript_me_sl_delegate',//Please make sure to replace this with the script ID of your Suitelet
            //     deploymentId: 'customdeploy_me_sl_delegate',//Please make sure to replace this with the deployment ID of your Suitelet
            //     params: {
            //         id: pr_id,
            //     }
            // })
            // log.debug("printout", printout)

            // var getDelegator = newRec.getValue('custbody_me_sales_approver');
            // var getSalesCategory = newRec.getText('custbody_me_sales_category');
            var getTranId = newRec.getValue('tranid');
            var getTranDate = newRec.getText('trandate');
            var getBusinessUnit = newRec.getValue('class');
            var getDepartment = newRec.getValue('department');
            var getCostCenter = newRec.getValue('cseg_me_cost_center');
            var getLocation = newRec.getValue('location');
            var getCurrency = newRec.getValue('custbody_me_pr_currency');
            var getPurchasingApprover = newRec.getValue('custbody_me_purchaser_approver');
            var getDeliveryDate = newRec.getText('duedate');
            var getMemo = newRec.getValue('custbody_me_memo');
            // var location = newRec.getValue('location');
            // var rate = currency.exchangeRate({
            //     source: getCurrency,
            //     target: 'USD',
            //     date: new Date()
            // });

            var param = {
                tran_id: record_id,
                tran_date: getTranDate,
                business_unit: getBusinessUnit,
                department: getDepartment,
                cost_center: getCostCenter,
                location: getLocation,
                purchasing_app: getPurchasingApprover,
                rate: getCurrency,
                delivery_date: getDeliveryDate,
                memo: getMemo,
                // location: location,
            }
            var paramJson = JSON.stringify(param)
            if (statusRfq.includes('Pending')) {
                context.form.addButton({
                    id: 'custpage_button_create_rfq',
                    label: "Create Rfq",
                    functionName: "onButtonClick(" + paramJson + ")"
                })
                try {

                    log.debug('client script fileid')
                    context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_create_rfq_btn.js'
                } catch (error) {
                    log.debug("error client script modulepath", error)
                    // console.log("error client script modulepath " + error)
                }

            }
            log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());

        } else {

            // var getDepartmentId = newRec.getValue('department');

            // var getDepartmentLookUp = search.lookupFields({
            //     type: search.Type.DEPARTMENT,
            //     id: getDepartmentId,
            //     columns: ['name']
            // });

            // var getDepartment = getDepartmentLookUp[0].name;

            // var currEmployee = record.load({
            //     type: record.Type.EMPLOYEE,
            //     id: currUser,
            // });

            // var getCurrEmployeeApproverBu = currEmployee.getValue('custentity_me_approver_business_unit');
            // var getCurrEmployeeApproverSld = currEmployee.getValue('custentity_me_sld_approver');
            // var getCurrEmployeeApproverIt = currEmployee.getValue('custentity_me_it_approver');
            // var getCurrEmployeeApproverHrga = currEmployee.getValue('custentity_me_hrga_approver');
            // var getCurrEmployeeApproverPresDir = currEmployee.getValue('custentity_me_approver_president_directo');
            // var getCurrEmployeeApproverDirSld = currEmployee.getValue('custentity_me_sld_director_approver');
            // var getCurrEmployeeApproverItOther = currEmployee.getValue('custentity_me_approver_it_other_director');

            // //==============================ini untuk approver presdir==========================================
            // if (getCurrEmployeeApproverPresDir) {
            //     var employeeLoadPresDir = record.load({
            //         type: record.Type.EMPLOYEE,
            //         id: getCurrEmployeeApproverPresDir,
            //     });

            //     var delegateLine = employeeLoadPresDir.getLineCount('recmachcustrecord_me_list_employee');

            //     var getLatestDelegateStartPeriod = employeeLoadPresDir.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_start_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateEndPeriod = employeeLoadPresDir.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_end_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateRemarks = employeeLoadPresDir.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_remarks_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateTo = employeeLoadPresDir.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_delegate_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });

            //     var getStart = moment(getLatestDelegateStartPeriod, 'D/M/YYYY');
            //     var getEnd = moment(getLatestDelegateEndPeriod, 'D/M/YYYY');

            //     var getCurrentDate = moment(new Date(), 'D/M/YYYY');
            //     // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

            //     var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
            //     log.debug('getStart', getStart)
            //     log.debug('getEnd', getEnd)
            //     log.debug('getCurrentDate', getCurrentDate)
            //     log.debug('isBetween', isBetween)
            //     if (isBetween) {
            //         var setNewApprover = newRec.setValue('custbody_me_president_director', getLatestDelegateTo);
            //     } else {
            //         var setNewApprover = newRec.setValue('custbody_me_president_director', getCurrEmployeeApprover);

            //     }
            // }
            // //==============================ini untuk approver presdir (END)==========================================

            // if (getDepartment.includes('SLD') && getCurrEmployeeApproverDirSld) {
            //     var employeeLoadDirSld = record.load({
            //         type: record.Type.EMPLOYEE,
            //         id: getCurrEmployeeApproverDirSld,
            //     });

            //     var delegateLine = employeeLoadDirSld.getLineCount('recmachcustrecord_me_list_employee');

            //     var getLatestDelegateStartPeriod = employeeLoadDirSld.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_start_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateEndPeriod = employeeLoadDirSld.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_end_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateRemarks = employeeLoadDirSld.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_remarks_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateTo = employeeLoadDirSld.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_delegate_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });

            //     var getStart = moment(getLatestDelegateStartPeriod, 'D/M/YYYY');
            //     var getEnd = moment(getLatestDelegateEndPeriod, 'D/M/YYYY');

            //     var getCurrentDate = moment(new Date(), 'D/M/YYYY');
            //     // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

            //     var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
            //     log.debug('getStart', getStart)
            //     log.debug('getEnd', getEnd)
            //     log.debug('getCurrentDate', getCurrentDate)
            //     log.debug('isBetween', isBetween)
            //     if (isBetween) {
            //         var setNewApprover = newRec.setValue('custbody_me_director_approver', getLatestDelegateTo);
            //     } else {
            //         var setNewApprover = newRec.setValue('custbody_me_director_approver', getCurrEmployeeApprover);

            //     }
            // } else if (!getDepartment.includes('SLD') && getCurrEmployeeApproverItOther) {
            //     var employeeLoadDirItOther = record.load({
            //         type: record.Type.EMPLOYEE,
            //         id: getCurrEmployeeApproverItOther,
            //     });

            //     var delegateLine = employeeLoadDirItOther.getLineCount('recmachcustrecord_me_list_employee');

            //     var getLatestDelegateStartPeriod = employeeLoadDirItOther.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_start_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateEndPeriod = employeeLoadDirItOther.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_end_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateRemarks = employeeLoadDirItOther.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_remarks_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateTo = employeeLoadDirItOther.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_delegate_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });

            //     var getStart = moment(getLatestDelegateStartPeriod, 'D/M/YYYY');
            //     var getEnd = moment(getLatestDelegateEndPeriod, 'D/M/YYYY');

            //     var getCurrentDate = moment(new Date(), 'D/M/YYYY');
            //     // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

            //     var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
            //     log.debug('getStart', getStart)
            //     log.debug('getEnd', getEnd)
            //     log.debug('getCurrentDate', getCurrentDate)
            //     log.debug('isBetween', isBetween)
            //     if (isBetween) {
            //         var setNewApprover = newRec.setValue('custbody_me_director_approver', getLatestDelegateTo);
            //     } else {
            //         var setNewApprover = newRec.setValue('custbody_me_director_approver', getCurrEmployeeApprover);

            //     }
            // }


            // if (getDepartment.includes('SLD') && getCurrEmployeeApproverSld) {
            //     var employeeLoad = record.load({
            //         type: record.Type.EMPLOYEE,
            //         id: getCurrEmployeeApproverSld,
            //     });

            //     var delegateLine = employeeLoad.getLineCount('recmachcustrecord_me_list_employee');

            //     var getLatestDelegateStartPeriod = employeeLoad.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_start_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateEndPeriod = employeeLoad.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_end_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateRemarks = employeeLoad.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_remarks_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateTo = employeeLoad.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_delegate_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });

            //     var getStart = moment(getLatestDelegateStartPeriod, 'D/M/YYYY');
            //     var getEnd = moment(getLatestDelegateEndPeriod, 'D/M/YYYY');

            //     var getCurrentDate = moment(new Date(), 'D/M/YYYY');
            //     // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

            //     var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
            //     log.debug('getStart', getStart)
            //     log.debug('getEnd', getEnd)
            //     log.debug('getCurrentDate', getCurrentDate)
            //     log.debug('isBetween', isBetween)
            //     if (isBetween) {
            //         var setNewApprover = newRec.setValue('custbody_me_bu_approver', getLatestDelegateTo);
            //     } else {
            //         var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApprover);

            //     }
            // }
            // else if (getDepartment.includes('HRGA') && getCurrEmployeeApproverHrga) {
            //     var employeeLoad = record.load({
            //         type: record.Type.EMPLOYEE,
            //         id: getCurrEmployeeApproverHrga,
            //     });

            //     var delegateLine = employeeLoad.getLineCount('recmachcustrecord_me_list_employee');

            //     var getLatestDelegateStartPeriod = employeeLoad.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_start_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateEndPeriod = employeeLoad.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_end_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateRemarks = employeeLoad.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_remarks_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateTo = employeeLoad.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_delegate_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });

            //     var getStart = moment(getLatestDelegateStartPeriod, 'D/M/YYYY');
            //     var getEnd = moment(getLatestDelegateEndPeriod, 'D/M/YYYY');

            //     var getCurrentDate = moment(new Date(), 'D/M/YYYY');
            //     // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

            //     var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
            //     log.debug('getStart', getStart)
            //     log.debug('getEnd', getEnd)
            //     log.debug('getCurrentDate', getCurrentDate)
            //     log.debug('isBetween', isBetween)
            //     if (isBetween) {
            //         var setNewApprover = newRec.setValue('custbody_me_bu_approver', getLatestDelegateTo);
            //     } else {
            //         var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApprover);

            //     }
            // }
            // else if (getDepartment.includes('IT') && getCurrEmployeeApproverIt) {
            //     var employeeLoad = record.load({
            //         type: record.Type.EMPLOYEE,
            //         id: getCurrEmployeeApproverIt,
            //     });

            //     var delegateLine = employeeLoad.getLineCount('recmachcustrecord_me_list_employee');

            //     var getLatestDelegateStartPeriod = employeeLoad.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_start_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateEndPeriod = employeeLoad.getSublistText({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_end_per_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateRemarks = employeeLoad.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_remarks_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });
            //     var getLatestDelegateTo = employeeLoad.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_list_employee',
            //         fieldId: 'custrecord_me_delegate_dlgt',
            //         line: Number(delegateLine) - 1,
            //     });

            //     var getStart = moment(getLatestDelegateStartPeriod, 'D/M/YYYY');
            //     var getEnd = moment(getLatestDelegateEndPeriod, 'D/M/YYYY');

            //     var getCurrentDate = moment(new Date(), 'D/M/YYYY');
            //     // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

            //     var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
            //     log.debug('getStart', getStart)
            //     log.debug('getEnd', getEnd)
            //     log.debug('getCurrentDate', getCurrentDate)
            //     log.debug('isBetween', isBetween)
            //     if (isBetween) {
            //         var setNewApprover = newRec.setValue('custbody_me_bu_approver', getLatestDelegateTo);
            //     } else {
            //         var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApprover);

            //     }
            // }
            // else {
            //     if (getCurrEmployeeApproverBu) {
            //         var employeeLoad = record.load({
            //             type: record.Type.EMPLOYEE,
            //             id: getCurrEmployeeApproverBu,
            //         });

            //         var delegateLine = employeeLoad.getLineCount('recmachcustrecord_me_list_employee');

            //         var getLatestDelegateStartPeriod = employeeLoad.getSublistText({
            //             sublistId: 'recmachcustrecord_me_list_employee',
            //             fieldId: 'custrecord_me_start_per_dlgt',
            //             line: Number(delegateLine) - 1,
            //         });
            //         var getLatestDelegateEndPeriod = employeeLoad.getSublistText({
            //             sublistId: 'recmachcustrecord_me_list_employee',
            //             fieldId: 'custrecord_me_end_per_dlgt',
            //             line: Number(delegateLine) - 1,
            //         });
            //         var getLatestDelegateRemarks = employeeLoad.getSublistValue({
            //             sublistId: 'recmachcustrecord_me_list_employee',
            //             fieldId: 'custrecord_me_remarks_dlgt',
            //             line: Number(delegateLine) - 1,
            //         });
            //         var getLatestDelegateTo = employeeLoad.getSublistValue({
            //             sublistId: 'recmachcustrecord_me_list_employee',
            //             fieldId: 'custrecord_me_delegate_dlgt',
            //             line: Number(delegateLine) - 1,
            //         });

            //         var getStart = moment(getLatestDelegateStartPeriod, 'D/M/YYYY');
            //         var getEnd = moment(getLatestDelegateEndPeriod, 'D/M/YYYY');

            //         var getCurrentDate = moment(new Date(), 'D/M/YYYY');
            //         // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

            //         var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
            //         log.debug('getStart', getStart)
            //         log.debug('getEnd', getEnd)
            //         log.debug('getCurrentDate', getCurrentDate)
            //         log.debug('isBetween', isBetween)
            //         if (isBetween) {
            //             var setNewApprover = newRec.setValue('custbody_me_finance_approver', getLatestDelegateTo);
            //         } else {
            //             var setNewApprover = newRec.setValue('custbody_me_finance_approver', getCurrEmployeeApprover);

            //         }
            //     }
            // }
        }

    }

    function beforeSubmit(context) {
        var rec = context.newRecord;

        log.debug('ini before submit')

        var getLineItemCount = rec.getLineCount('item');
        var countIsRfqed = 0
        for (let i = 0; i < getLineItemCount; i++) {
            var getRfqId = rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_rfq_number',
                line: i,
            });

            if (getRfqId) {
                countIsRfqed++;
            }
        }

            var statusRfq = rec.setText('custbody_me_status_all_rfq', 'Pending');
        if (countIsRfqed == getLineItemCount) {
            var statusRfq = rec.setText('custbody_me_status_all_rfq', 'Complete');
        } 


    }

    return {
        beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,

    }
});

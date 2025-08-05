/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/record", "N/url", "N/currency", 'N/search', './lib/moment.min.js'], function (runtime, record, url, currency, search, moment) {

    function afterSubmit(context) {
        var rec = context.newRecord;
        var recId = rec.id;

        var newRec = record.load({
            type: record.Type.PURCHASE_REQUISITION, 
            id: recId,
            // isDynamic: true,
        });

        var currUser = runtime.getCurrentUser().id;
        var currRole = runtime.getCurrentUser().role;

        if (currRole == 1132 || currRole == 15) {
            var getDepartment = newRec.getText('department');
            log.debug('getDepartment', getDepartment)

            // var getDepartmentLookUp = search.lookupFields({
            //     type: search.Type.DEPARTMENT,
            //     id: getDepartmentId,
            //     columns: ['name']
            // });

            // var getDepartment = getDepartmentLookUp[0].name;

            var currEmployee = record.load({
                type: record.Type.EMPLOYEE,
                id: currUser,
            });

            var getCurrEmployeeApproverBu = currEmployee.getValue('custentity_me_approver_business_unit');
            var getCurrEmployeeApproverSld = currEmployee.getValue('custentity_me_sld_approver');
            var getCurrEmployeeApproverIt = currEmployee.getValue('custentity_me_it_approver');
            var getCurrEmployeeApproverHrga = currEmployee.getValue('custentity_me_hrga_approver');
            var getCurrEmployeeApproverPresDir = currEmployee.getValue('custentity_me_approver_president_directo');
            var getCurrEmployeeApproverDirSld = currEmployee.getValue('custentity_me_sld_director_approver');
            var getCurrEmployeeApproverItOther = currEmployee.getValue('custentity_me_approver_it_other_director');
            var getCurrEmployeeApproverPurchaser = currEmployee.getValue('custentity_me_purchaser_approver');

            if (getCurrEmployeeApproverPurchaser) {
                var employeeLoadPresDir = record.load({
                    type: record.Type.EMPLOYEE,
                    id: getCurrEmployeeApproverPurchaser,
                });

                var delegate = searchData(getCurrEmployeeApproverPurchaser)
                try {


                    // var getLatestDelegateStartPeriod = employeeLoadPresDir.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_start_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateEndPeriod = employeeLoadPresDir.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_end_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateRemarks = employeeLoadPresDir.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_remarks_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateTo = employeeLoadPresDir.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_delegate_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });

                    var getStart = moment(delegate[0].start, 'D/M/YYYY');
                    var getEnd = moment(delegate[0].end, 'D/M/YYYY');

                    var getCurrentDate = moment(new Date(), 'D/M/YYYY');
                    // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

                    var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
                    log.debug('getStart', getStart)
                    log.debug('getEnd', getEnd)
                    log.debug('getCurrentDate', getCurrentDate)
                    log.debug('isBetween', isBetween)
                    if (isBetween) {
                        var setNewApprover = newRec.setValue('custbody_me_purchaser_approver', delegate[0].delegate);
                    } else {
                        var setNewApprover = newRec.setValue('custbody_me_purchaser_approver', getCurrEmployeeApproverPurchaser);

                    }
                } catch (error) {
                    var setNewApprover = newRec.setValue('custbody_me_purchaser_approver', getCurrEmployeeApproverPurchaser);
                }
            }
            //==============================ini untuk approver presdir==========================================

            if (getCurrEmployeeApproverPresDir) {
                var employeeLoadPresDir = record.load({
                    type: record.Type.EMPLOYEE,
                    id: getCurrEmployeeApproverPresDir,
                });

                var delegate = searchData(getCurrEmployeeApproverPresDir)
                try {


                    // var getLatestDelegateStartPeriod = employeeLoadPresDir.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_start_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateEndPeriod = employeeLoadPresDir.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_end_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateRemarks = employeeLoadPresDir.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_remarks_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateTo = employeeLoadPresDir.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_delegate_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });

                    var getStart = moment(delegate[0].start, 'D/M/YYYY');
                    var getEnd = moment(delegate[0].end, 'D/M/YYYY');

                    var getCurrentDate = moment(new Date(), 'D/M/YYYY');
                    // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

                    var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
                    log.debug('getStart', getStart)
                    log.debug('getEnd', getEnd)
                    log.debug('getCurrentDate', getCurrentDate)
                    log.debug('isBetween', isBetween)
                    if (isBetween) {
                        var setNewApprover = newRec.setValue('custbody_me_president_director', delegate[0].delegate);
                    } else {
                        var setNewApprover = newRec.setValue('custbody_me_president_director', getCurrEmployeeApproverPresDir);

                    }
                } catch (error) {
                    var setNewApprover = newRec.setValue('custbody_me_president_director', getCurrEmployeeApproverPresDir);
                }
            }
            //==============================ini untuk approver presdir (END)==========================================

            if (getDepartment.includes('SLD') && getCurrEmployeeApproverDirSld) {
                var employeeLoadDirSld = record.load({
                    type: record.Type.EMPLOYEE,
                    id: getCurrEmployeeApproverDirSld,
                });

                var delegate = searchData(getCurrEmployeeApproverDirSld)
                try {


                    // var getLatestDelegateStartPeriod = employeeLoadDirSld.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_start_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateEndPeriod = employeeLoadDirSld.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_end_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateRemarks = employeeLoadDirSld.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_remarks_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateTo = employeeLoadDirSld.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_delegate_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });

                    var getStart = moment(delegate[0].start, 'D/M/YYYY');
                    var getEnd = moment(delegate[0].end, 'D/M/YYYY');

                    var getCurrentDate = moment(new Date(), 'D/M/YYYY');
                    // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

                    var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
                    log.debug('getStart', getStart)
                    log.debug('getEnd', getEnd)
                    log.debug('getCurrentDate', getCurrentDate)
                    log.debug('isBetween', isBetween)
                    if (isBetween) {
                        var setNewApprover = newRec.setValue('custbody_me_director_approver', delegate[0].delegate);
                    } else {
                        var setNewApprover = newRec.setValue('custbody_me_director_approver', getCurrEmployeeApproverDirSld);

                    }
                } catch (error) {
                    var setNewApprover = newRec.setValue('custbody_me_director_approver', getCurrEmployeeApproverDirSld);
                }
            } else if (!getDepartment.includes('SLD') && getCurrEmployeeApproverItOther) {
                var employeeLoadDirItOther = record.load({
                    type: record.Type.EMPLOYEE,
                    id: getCurrEmployeeApproverItOther,
                });

                var delegate = searchData(getCurrEmployeeApproverItOther)

                try {


                    // var getLatestDelegateStartPeriod = employeeLoadDirItOther.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_start_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateEndPeriod = employeeLoadDirItOther.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_end_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateRemarks = employeeLoadDirItOther.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_remarks_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateTo = employeeLoadDirItOther.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_delegate_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });

                    var getStart = moment(delegate[0].start, 'D/M/YYYY');
                    var getEnd = moment(delegate[0].end, 'D/M/YYYY');

                    var getCurrentDate = moment(new Date(), 'D/M/YYYY');
                    // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

                    var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
                    log.debug('getStart', getStart)
                    log.debug('getEnd', getEnd)
                    log.debug('getCurrentDate', getCurrentDate)
                    log.debug('isBetween', isBetween)
                    if (isBetween) {
                        var setNewApprover = newRec.setValue('custbody_me_director_approver', delegate[0].delegate);
                    } else {
                        var setNewApprover = newRec.setValue('custbody_me_director_approver', getCurrEmployeeApproverItOther);

                    }
                } catch (error) {
                    var setNewApprover = newRec.setValue('custbody_me_director_approver', getCurrEmployeeApproverItOther);
                }
            }


            if (getDepartment.includes('SLD') && getCurrEmployeeApproverSld) {
                var employeeLoad = record.load({
                    type: record.Type.EMPLOYEE,
                    id: getCurrEmployeeApproverSld,
                });

                var delegate = searchData(getCurrEmployeeApproverSld)

                try {

                    // var getLatestDelegateStartPeriod = employeeLoad.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_start_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateEndPeriod = employeeLoad.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_end_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateRemarks = employeeLoad.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_remarks_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateTo = employeeLoad.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_delegate_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });

                    var getStart = moment(delegate[0].start, 'D/M/YYYY');
                    var getEnd = moment(delegate[0].end, 'D/M/YYYY');

                    var getCurrentDate = moment(new Date(), 'D/M/YYYY');
                    // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

                    var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
                    log.debug('getStart', getStart)
                    log.debug('getEnd', getEnd)
                    log.debug('getCurrentDate', getCurrentDate)
                    log.debug('isBetween', isBetween)
                    if (isBetween) {
                        var setNewApprover = newRec.setValue('custbody_me_bu_approver', delegate[0].delegate);
                    } else {
                        var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApproverSld);

                    }
                } catch (error) {
                    var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApproverSld);
                }
            }
            else if (getDepartment.includes('HRGA') && getCurrEmployeeApproverHrga) {
                var employeeLoad = record.load({
                    type: record.Type.EMPLOYEE,
                    id: getCurrEmployeeApproverHrga,
                });

                var delegate = searchData(getCurrEmployeeApproverHrga)

                try {


                    // var getLatestDelegateStartPeriod = employeeLoad.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_start_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateEndPeriod = employeeLoad.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_end_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateRemarks = employeeLoad.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_remarks_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateTo = employeeLoad.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_delegate_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });

                    var getStart = moment(delegate[0].start, 'D/M/YYYY');
                    var getEnd = moment(delegate[0].end, 'D/M/YYYY');

                    var getCurrentDate = moment(new Date(), 'D/M/YYYY');
                    // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

                    var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
                    log.debug('getStart', getStart)
                    log.debug('getEnd', getEnd)
                    log.debug('getCurrentDate', getCurrentDate)
                    log.debug('isBetween', isBetween)
                    if (isBetween) {
                        var setNewApprover = newRec.setValue('custbody_me_bu_approver', delegate[0].delegate);
                    } else {
                        var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApproverHrga);

                    }
                } catch (error) {
                    var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApproverHrga);
                }
            }
            else if (getDepartment.includes('IT') && getCurrEmployeeApproverIt) {
                var employeeLoad = record.load({
                    type: record.Type.EMPLOYEE,
                    id: getCurrEmployeeApproverIt,
                });

                var delegate = searchData(getCurrEmployeeApproverIt)

                try {


                    // var getLatestDelegateStartPeriod = employeeLoad.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_start_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateEndPeriod = employeeLoad.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_end_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateRemarks = employeeLoad.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_remarks_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateTo = employeeLoad.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_delegate_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });

                    var getStart = moment(delegate[0].start, 'D/M/YYYY');
                    var getEnd = moment(delegate[0].end, 'D/M/YYYY');

                    var getCurrentDate = moment(new Date(), 'D/M/YYYY');
                    // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

                    var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
                    log.debug('getStart', getStart)
                    log.debug('getEnd', getEnd)
                    log.debug('getCurrentDate', getCurrentDate)
                    log.debug('isBetween', isBetween)
                    if (isBetween) {
                        var setNewApprover = newRec.setValue('custbody_me_bu_approver', delegate[0].delegate);
                    } else {
                        var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApproverIt);

                    }
                } catch (error) {
                    var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApproverIt);
                }
            }
            else if (getCurrEmployeeApproverBu) {
                // if (getCurrEmployeeApproverBu) {
                var employeeLoad = record.load({
                    type: record.Type.EMPLOYEE,
                    id: getCurrEmployeeApproverBu,
                });

                var delegate = searchData(getCurrEmployeeApproverBu)

                try {


                    // var getLatestDelegateStartPeriod = employeeLoad.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_start_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateEndPeriod = employeeLoad.getSublistText({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_end_per_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateRemarks = employeeLoad.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_remarks_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });
                    // var getLatestDelegateTo = employeeLoad.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_list_employee',
                    //     fieldId: 'custrecord_me_delegate_dlgt',
                    //     line: Number(delegateLine) - 1,
                    // });

                    var getStart = moment(delegate[0].start, 'D/M/YYYY');
                    var getEnd = moment(delegate[0].end, 'D/M/YYYY');

                    var getCurrentDate = moment(new Date(), 'D/M/YYYY');
                    // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

                    var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]')
                    log.debug('getStart', getStart)
                    log.debug('getEnd', getEnd)
                    log.debug('getCurrentDate', getCurrentDate)
                    log.debug('isBetween', isBetween)
                    if (isBetween) {
                        var setNewApprover = newRec.setValue('custbody_me_bu_approver', delegate[0].delegate);
                    } else {
                        var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApproverBu);

                    }
                } catch (error) {
                    var setNewApprover = newRec.setValue('custbody_me_bu_approver', getCurrEmployeeApproverBu);
                }
                // }
            }
        }
        newRec.save()


    }


    return {
        afterSubmit: afterSubmit,
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', './lib/moment.min.js', 'N/runtime'], function (record, search, moment, runtime) {

    //   function searchData(params) {

    //     var result = []

    //     var data = search.create({
    //         type: "customrecord_me_delegate_user_profile",
    //         filters:
    //             [
    //                 ["custrecord_me_list_employee", "anyof", params]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "id", label: "ID", sort: search.Sort.ASC }),
    //                 search.createColumn({ name: "scriptid", label: "Script ID" }),
    //                 search.createColumn({ name: "custrecord_me_start_per_dlgt", label: "ME - Start Period" }),
    //                 search.createColumn({ name: "custrecord_me_end_per_dlgt", label: "ME - End Period" }),
    //                 search.createColumn({ name: "custrecord_me_remarks_dlgt", label: "ME - Remarks" }),
    //                 search.createColumn({ name: "custrecord_me_delegate_dlgt", label: "ME - Delegate" }),
    //                 search.createColumn({ name: "custrecord_me_list_employee", label: "ME - Employee" })
    //             ]
    //     }).run().getRange({
    //         start: 0,
    //         end: 1000,
    //     });

    //     // for (let i = 0; i < data.length; i++) {
    //         var getStartData = data[data.length-1].getValue(data[data.length-1].columns[2]);
    //         var getEndDate = data[data.length-1].getValue(data[data.length-1].columns[3]);
    //         var getRemarks = data[data.length-1].getValue(data[data.length-1].columns[4]);
    //         var getDelegate = data[data.length-1].getValue(data[data.length-1].columns[5]);
    //         var getEmployee = data[data.length-1].getValue(data[data.length-1].columns[6]);
    //         result.push({
    //             start: getStartData,
    //             end: getEndDate,
    //             remark: getRemarks,
    //             delegate: getDelegate,
    //             employee: getEmployee,
    //         })
    //     // }
    //     log.debug('result',result)

    //     return result
    // }

      function searchData(params) {

        var result = []

      try {

        var data = search.create({
            type: "customrecord_me_delegate_user_profile",
            filters:
                [
                    ["custrecord_me_list_employee", "anyof", params]
                ],
            columns:
                [
                    search.createColumn({ name: "id", label: "ID", sort: search.Sort.ASC }),
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "custrecord_me_start_per_dlgt", label: "ME - Start Period" }),
                    search.createColumn({ name: "custrecord_me_end_per_dlgt", label: "ME - End Period" }),
                    search.createColumn({ name: "custrecord_me_remarks_dlgt", label: "ME - Remarks" }),
                    search.createColumn({ name: "custrecord_me_delegate_dlgt", label: "ME - Delegate" }),
                    search.createColumn({ name: "custrecord_me_list_employee", label: "ME - Employee" })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        // for (let i = 0; i < data.length; i++) {
            var getStartData = data[data.length-1].getValue(data[data.length-1].columns[2]);
            var getEndDate = data[data.length-1].getValue(data[data.length-1].columns[3]);
            var getRemarks = data[data.length-1].getValue(data[data.length-1].columns[4]);
            var getDelegate = data[data.length-1].getValue(data[data.length-1].columns[5]);
            var getEmployee = data[data.length-1].getValue(data[data.length-1].columns[6]);
            result.push({
                start: getStartData,
                end: getEndDate,
                remark: getRemarks,
                delegate: getDelegate,
                employee: getEmployee,
            })
        // }
        log.debug('result',result)

      } catch (error) {
        return result;
      }
        return result
    }
  
    function beforeSubmit(context) {
        var rec = context.newRecord;

        var recId = rec.id;
        var currUser = runtime.getCurrentUser().id;

        if (context.type == 'create' && rec.type == 'vendorreturnauthorization') {
            // var recLoad = record.load({
            //     type: record.Type.VENDOR_RETURN_AUTHORIZATION,
            //     id: recId,
            // });

            var currEmployee = record.load({
                type: record.Type.EMPLOYEE,
                id: currUser,
            });

            var getCurrEmployeeApprover = currEmployee.getValue('custentity_me_accounting_approver');

            // if (getAccountingApprover) {
            var employeeLoad = record.load({
                type: record.Type.EMPLOYEE,
                id: getCurrEmployeeApprover,
            });
            var delegate = searchData(getCurrEmployeeApprover)
          try {
          
            // var delegateLine = employeeLoad.getLineCount('recmachcustrecord_me_list_employee');

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

            var getCurrentDate = moment(new Date(),'D/M/YYYY');
            // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

            var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]');

            if (isBetween) {
                var setNewApprover = rec.setValue('custbody_me_accounting_approver_custom', delegate[0].delegate);
            }else{
                var setNewApprover = rec.setValue('custbody_me_accounting_approver_custom', getCurrEmployeeApprover);
              
            }
              
          } catch (error) {
            var setNewApprover = rec.setValue('custbody_me_accounting_approver_custom', getCurrEmployeeApprover);
          }
            // }
        }
        if (context.type == 'create' && rec.type == 'vendorbill') {
            // var recLoad = record.load({
            //     type: record.Type.VENDOR_BILL,
            //     id: recId,
            // });

            var currEmployee = record.load({
                type: record.Type.EMPLOYEE,
                id: currUser,
            });

            var getCurrEmployeeApprover = currEmployee.getValue('custentity_me_accounting_approver');

            // if (getCurrEmployeeApprover) {
            var employeeLoad = record.load({
                type: record.Type.EMPLOYEE,
                id: getCurrEmployeeApprover,
            });
             var delegate = searchData(getCurrEmployeeApprover)
          try {
            
          
            // var delegateLine = employeeLoad.getLineCount('recmachcustrecord_me_list_employee');

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

            var getCurrentDate = moment(new Date(),'D/M/YYYY');
            // var getCurrentDate = moment(new Date(),'D/M/YYYY').zone('+07:00');

            var isBetween = getCurrentDate.isBetween(getStart.startOf('day'), getEnd.endOf('day'), undefined, '[]');
          // log.debug('getLatestDelegateTo',getLatestDelegateTo)
          // log.debug('getCurrEmployeeApprover',getCurrEmployeeApprover)
            if (isBetween) {
                var setNewApprover = rec.setValue('custbody_me_accounting_approver_custom', delegate[0].delegate);
            }else{
                var setNewApprover = rec.setValue('custbody_me_accounting_approver_custom', getCurrEmployeeApprover);
              
            }
            } catch (error) {
            var setNewApprover = rec.setValue('custbody_me_accounting_approver_custom', getCurrEmployeeApprover);
          }
            // }
        }

    }

    return {
        beforeSubmit: beforeSubmit,
    }
});

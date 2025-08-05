/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/redirect", "N/ui/serverWidget", "N/task", "N/search", './config/me_config_yudi.js', 'N/file', 'N/url', './lib/moment.min.js', 'N/encode', 'N/format', 'N/record'],
    function (redirect, serverWidget, task, search, config, file, url, moment, encode, format, record) {

        function searchListDelegate(params) {

            var result = [];
            var employeeSearchObj = search.create({
                type: "employee",
                filters:
                    [
                        ["internalid", "anyof", params]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custentity_me_list_delegate", label: "ME - List of Delegate" })
                    ]
            }).run().getRange({
                start: 0,
                end: 1000,
            });

            var getListOfEmployee = employeeSearchObj[0].getValue(employeeSearchObj[0].columns[0]);
            var getListOfEmployeeText = employeeSearchObj[0].getText(employeeSearchObj[0].columns[0]);

            var splitGetListOfEmployee =  getListOfEmployee.split(',');
            var splitGetListOfEmployeeText = getListOfEmployeeText.split(',');

            for (let i = 0; i < splitGetListOfEmployee.length; i++) {
                result.push({
                    value: splitGetListOfEmployee[i],
                    text: splitGetListOfEmployeeText[i]
                })
                
            }


            // log.debug('result', result)
            return result;
        }

        function parameters(context) {
            // throw 'DATA: ' + context.request.parameters.custscript_me_param.delegator;

            var paramData = JSON.parse(context.request.parameters.custscript_me_param);


            var form = serverWidget.createForm({
                title: 'Delegate Real Time'
            })

            var delegation = form.addFieldGroup({
                id: 'delegation',
                label: 'Filter'
            });

            var trans_number = form.addField({
                id: 'custpage_trans_num',
                type: serverWidget.FieldType.SELECT,
                source: 'transaction',
                label: "Transaction Number",
                container: 'delegation'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            trans_number.defaultValue = paramData.record_id;

            var delegator = form.addField({
                id: 'custpage_delegator',
                type: serverWidget.FieldType.SELECT,
                source: 'employee',
                label: "Delegator",
                container: 'delegation'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            delegator.defaultValue = paramData.delegator;

            var listDelegate = searchListDelegate(paramData.delegator)

            var delegate_to = form.addField({
                id: 'custpage_delegate_to',
                type: serverWidget.FieldType.SELECT,
                label: "Delegate To",
                container: 'delegation'
            });

            delegate_to.addSelectOption({
                value: '',
                text: ''
            });

            for (let i = 0; i < listDelegate.length; i++) {
                delegate_to.addSelectOption({
                    value: listDelegate[i].value,
                    text: listDelegate[i].text
                });

            }

            var remarks = form.addField({
                id: 'custpage_remarks',
                type: serverWidget.FieldType.TEXT,
                label: "Remarks",
                container: 'delegation'
            });
            var record_type = form.addField({
                id: 'custpage_type',
                type: serverWidget.FieldType.TEXT,
                label: "Remarks",
                container: 'delegation'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            record_type.defaultValue = paramData.record_type;

            return form;
        }

        function onRequest(context) {

            if (context.request.method == 'GET') {
                var form = parameters(context)
                form.addSubmitButton({
                    label: 'Delegate'
                });

                context.response.writePage(form);
            } else {
                var req_param = context.request.parameters;

                var trans_number = req_param['custpage_trans_num'];
                var delegator = req_param['custpage_delegator'];
                var delegate_to = req_param['custpage_delegate_to'];
                var remarks = req_param['custpage_remarks'];
                var record_type = req_param['custpage_type'];

                var date_time = new Date();

                var formattedCurrentDate = format.format({
                    value: date_time,
                    type: format.Type.DATETIME
                });

                var param = {
                    trans_number: trans_number,
                    delegator: delegator,
                    delegate_to: delegate_to,
                    remarks: remarks,
                    date_time: formattedCurrentDate,
                    record_type: record_type,
                }

                try {
                    var createDelegateRec = record.create({
                        type: 'customrecord_me_csrec_delegate_real_time',
                    });
                    createDelegateRec.setValue('custrecord_me_transaction_number', param.trans_number)
                    createDelegateRec.setText('custrecord_me_delegate_date', param.date_time)
                    createDelegateRec.setValue('custrecord_me_delegator_user', param.delegator)
                    createDelegateRec.setValue('custrecord_me_delegate_to', param.delegate_to)
                    createDelegateRec.setValue('custrecord_me_remarks_delegation', param.remarks)
                    var saveDelegate = createDelegateRec.save();

                    redirect.toRecord({
                        type: param.record_type,
                        id: trans_number,
                    });

                    var loadTransRec = record.load({
                        type: param.record_type,
                        id: trans_number,
                    });

                    loadTransRec.setValue('custbody_me_delegate_real_time_so', param.delegate_to);
                    loadTransRec.save();
                } catch (error) {
                    record.delete({
                        type: 'customrecord_me_csrec_delegate_real_time',
                        id: saveDelegate,
                    });
                    throw error
                }
            }

        }

        return {
            onRequest: onRequest
        }
    });

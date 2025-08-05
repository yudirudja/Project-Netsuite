/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @author Caroline (ME)
 */
define(["N/redirect", "N/ui/serverWidget", "N/task", "N/search", 'N/file', 'N/url', 'N/encode', 'N/record', 'N/https', 'N/xml', 'N/runtime'],
    function (redirect, serverWidget, task, search, file, url, encode, record, https, xml, runtime) {

        function createform(context) {
            var form = serverWidget.createForm({ title: "Generate Journal Selisih" });

            var period = form.addField({
                id: 'custpage_accountingperiod',
                type: serverWidget.FieldType.SELECT,
                label: 'Accounting Period',
                source: 'accountingperiod'
            });

            var journalType = form.addField({
                id: 'custpage_journaltype',
                type: serverWidget.FieldType.SELECT,
                label: 'Journal Type',
            });

            journalType.addSelectOption({
                value: 'AcctRec',
                text: 'Open Receivables'
            });

            journalType.addSelectOption({
                value: 'AcctPay',
                text: 'Open Payables'
            });

            journalType.addSelectOption({
                value: 'other_accounts',
                text: 'Other Accounts'
            });
            return form;
        }

        function searchEndMonthRate(enddate) {
            var customrecord_me_csrec_ex_rate_SearchObj = search.create({
                type: "customrecord_me_csrec_ex_rate_",
                filters:
                    [
                        ["custrecord_me_effective_date", "on", enddate]
                    ],
                columns:
                    [
                        search.createColumn({ name: "custrecord_me_base_currency", label: "ME - Base Currency" }),
                        search.createColumn({ name: "custrecord_me_source_currency", label: "ME - Source Currency" }),
                        search.createColumn({ name: "custrecord_me_exchange_rates_curr", label: "ME - Exchange Rate" }),
                        search.createColumn({ name: "custrecord_me_effective_date", label: "ME - Effective Date" })
                    ]
            });
            var startRow = 0;
            var pageSize = 1000;

            var recordData = [];

            do {
                var resultSearch = customrecord_me_csrec_ex_rate_SearchObj.run().getRange({
                    start: startRow,
                    end: startRow + pageSize
                });
                for (x = 0; x < resultSearch.length; x++) {
                    recordData.push({
                        "base_currency": resultSearch[x].getValue(resultSearch[x].columns[0]), // e.g. USD
                        "source_currency": resultSearch[x].getValue(resultSearch[x].columns[1]), // e.g. IDR
                        "rate": resultSearch[x].getValue(resultSearch[x].columns[2]), // e.g. 10000
                        "date": resultSearch[x].getValue(resultSearch[x].columns[3]) // e.g. 31/10/2024
                    })
                }
                startRow += pageSize
            } while (resultSearch.length === pageSize);
            return recordData;
        }

        function button(type, form, label, sublist) {
            switch (type) {
                case 'submit':
                    form.addSubmitButton(label);
                    break;
                case 'back':
                    form.addButton({
                        id: 'custpage_button_back',
                        label: label,
                        functionName: "backButton()"
                    });
                    break;
                default:
                    break;
            }
        }

        function onRequest(context) {

            var form = createform(context);
            context.response.writePage(form);

            if (context.request.method == 'GET') {
                button('submit', form, 'Generate')

            } else {
                var period = context.request.parameters.custpage_accountingperiod;
                log.debug('period', period);

                var end_period = search.lookupFields({
                    type: 'accountingperiod',
                    id: period,
                    columns: 'enddate'
                }); log.debug('end_period', end_period.enddate);

                var exchangerate = searchEndMonthRate(end_period.enddate)

                var journalType = context.request.parameters.custpage_journaltype;
                log.debug('journalType', journalType);

                var parameter = {
                    period: period,
                    journalType: journalType,
                    end_period: end_period.enddate,
                    exchangerate: exchangerate
                }

                var dataStringify = JSON.stringify(parameter)
                log.debug("data", dataStringify)

                if (journalType === 'AcctRec' || journalType === 'AcctPay') {
                    var createJE = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: "customscript_me_ss_unrealized_cr",
                        params: {
                            custscript_me_cr_parameter: dataStringify
                        }
                    })
                    createJE.submit();
                    redirect.redirect({
                        url: '/app/common/scripting/scriptstatus.nl?whence=',
                    });
                }
                if (journalType === 'other_accounts'){
                    
                    var data_get_unrealized = {
                        accountingperiods:  period
                    }
                    var param_cm = JSON.stringify(data_get_unrealized)
                    var createJE = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT,
                        scriptId: "customscript_me_ss_unrealized_oth_acc",
                        params: {
                            custscript_me_ss_unrealized_oth_acc: param_cm,
                        },
                    })
                    createJE.submit();
                    redirect.redirect({
                        url: '/app/common/scripting/scriptstatus.nl?scripttype=584',
                    });
                }

                var remainingUsage0 = runtime.getCurrentScript().getRemainingUsage();
                log.debug('Remaining Usage:', remainingUsage0);
            }
        }

        return {
            onRequest: onRequest
        }
    });

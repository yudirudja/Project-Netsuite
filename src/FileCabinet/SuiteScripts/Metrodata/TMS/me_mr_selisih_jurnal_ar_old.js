/**
 *@NApiVersion 2.1
*@NScriptType MapReduceScript
*/
define(['N/search', 'N/record', 'N/runtime'], function (search, record, runtime) {


    function searchTransAccount(param) {
        let transactionSearchObj = search.create({
            type: "invoice",
            filters:
                [
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["applyingtransaction.type", "anyof", "CustPymt", "DepAppl", "Journal"]
                ],
                columns:
                [
                   search.createColumn({name: "tranid", label: "Document Number"}),
                   search.createColumn({name: "trandate", label: "Date (Invoice)"}),
                   search.createColumn({name: "exchangerate", label: "Exchange Rate (Invoice)"}),
                   search.createColumn({name: "custbody_me_spot_rate", label: "Spot Rate (Invoice)"}),
                   search.createColumn({name: "applyingtransaction", label: "Applying Transaction"}),
                   search.createColumn({
                      name: "account",
                      join: "applyingTransaction",
                      label: "Account (Invoice)"
                   }),
                   search.createColumn({name: "applyingforeignamount", label: "Applying Link Amount (Foreign Currency)"}),
                   search.createColumn({
                      name: "trandate",
                      join: "rgPostingTransaction",
                      label: "Date (Currency Revaluation)"
                   }),
                   search.createColumn({
                      name: "exchangerate",
                      join: "applyingTransaction",
                      label: "Exchange Rate (Currency Revaluation)"
                   }),
                   search.createColumn({
                      name: "custbody_me_spot_rate",
                      join: "applyingTransaction",
                      label: "Spot Rate (Currency Revaluation)"
                   }),
                   search.createColumn({name: "rgamount", label: "Realized Gain Amount"}),
                   search.createColumn({name: "realizedgainpostingtransaction", label: "Realized Gain Posting Transaction"}),
                   search.createColumn({
                      name: "account",
                      join: "rgPostingTransaction",
                      label: "Account (Currency Revaluation)"
                   }),
                   search.createColumn({
                      name: "class",
                      join: "applyingTransaction",
                      label: "Business Unit"
                   }),
                   search.createColumn({
                      name: "department",
                      join: "applyingTransaction",
                      label: "Department"
                   }),
                   search.createColumn({
                      name: "cseg_me_cost_center",
                      join: "applyingTransaction",
                      label: "ME - Cost Center"
                   }),
                   search.createColumn({
                      name: "location",
                      join: "applyingTransaction",
                      label: "Location"
                   }),
                   search.createColumn({
                      name: "entity",
                      join: "applyingTransaction",
                      label: "Name"
                   }),
                   search.createColumn({
                      name: "debitamount",
                      join: "rgPostingTransaction",
                      label: "Amount (Debit)"
                   }),
                   search.createColumn({
                      name: "creditamount",
                      join: "rgPostingTransaction",
                      label: "Amount (Credit)"
                   }),
                   search.createColumn({
                      name: "formulacurrency",
                      formula: "({custbody_me_spot_rate} - {applyingtransaction.custbody_me_spot_rate}) * {applyingforeignamount}",
                      label: "Kontrol"
                   }),
                   search.createColumn({
                      name: "formulatext",
                      formula: "case when {rgamount} > 0 then 'Credit' when {rgamount} < 0 then 'Debit' end",
                      label: "Debit_Credit"
                   }),
                   search.createColumn({name: "currency", label: "Currency"}),
                   search.createColumn({name: "internalid", label: "Internal Id"}),
                   search.createColumn({
                    name: "formulatext",
                    formula: "'Memo pada line adalah: Jurnal Penyesuaian USD atas transaksi ' || {realizedgainpostingtransaction} || ' (AP)'",
                    label: "Memo"
                 }),
                ]
        });
        let search_result_arr = []
        let start_row = 0

        do {
            var get_result = transactionSearchObj.run().getRange({
                start: start_row,
                end: start_row + 1000,
            })

            for (let i = 0; i < get_result.length; i++) {
                let tran_id = get_result[i].getValue(get_result[i].columns[0]);
                let date = get_result[i].getValue(get_result[i].columns[1]);
                let ex_rate_netsuite = get_result[i].getValue(get_result[i].columns[2]);
                let ex_rate_tms = get_result[i].getValue(get_result[i].columns[3]);
                let applying_trans = get_result[i].getValue(get_result[i].columns[4]);
                let account = get_result[i].getValue(get_result[i].columns[5]);
                let amount_foreign = get_result[i].getValue(get_result[i].columns[6]);
                let realized_gain_date = get_result[i].getValue(get_result[i].columns[7]);
                let applying_trans_ex_rate_netsuite = get_result[i].getValue(get_result[i].columns[8]);
                let applying_trans_ex_rate_tms = get_result[i].getValue(get_result[i].columns[9]);
                let realize_gain_amount = get_result[i].getValue(get_result[i].columns[10]);
                let realize_gain_post_trans = get_result[i].getValue(get_result[i].columns[11]);
                let realizegain_post_trans_account = get_result[i].getValue(get_result[i].columns[12]);
                let applying_trans_business_unit = get_result[i].getValue(get_result[i].columns[13]);
                let applying_trans_department = get_result[i].getValue(get_result[i].columns[14]);
                let applying_trans_cost_center = get_result[i].getValue(get_result[i].columns[15]);
                let applying_trans_location = get_result[i].getValue(get_result[i].columns[16]);
                let applying_transaction_location = get_result[i].getValue(get_result[i].columns[17]);
                let applying_trans_name = get_result[i].getValue(get_result[i].columns[18]);
                let realize_gain_post_debit = get_result[i].getValue(get_result[i].columns[19]);
                let realize_gain_post_credit = get_result[i].getValue(get_result[i].columns[20]);
                let kontrol = get_result[i].getValue(get_result[i].columns[21]);
                let debit_credit = get_result[i].getValue(get_result[i].columns[22]);
                let currency = get_result[i].getValue(get_result[i].columns[24])
                let internal_id = get_result[i].getValue(get_result[i].columns[25])
                let memo = get_result[i].getValue(get_result[i].columns[26])


                search_result_arr.push({
                    tran_id: tran_id,// head
                    date: date,// head
                    ex_rate_netsuite: ex_rate_netsuite,// head
                    ex_rate_tms: ex_rate_tms,// head
                    memo_head: memo,// head
                    applying_trans: applying_trans,
                    account: account,
                    amount_foreign: amount_foreign,
                    realized_gain_date: realized_gain_date,
                    applying_trans_ex_rate_netsuite: applying_trans_ex_rate_netsuite,
                    applying_trans_ex_rate_tms: applying_trans_ex_rate_tms,
                    realize_gain_amount: realize_gain_amount,
                    realize_gain_post_trans: realize_gain_post_trans,
                    realizegain_post_trans_account: realizegain_post_trans_account,
                    applying_trans_business_unit: applying_trans_business_unit,
                    applying_trans_department: applying_trans_department,
                    applying_trans_cost_center: applying_trans_cost_center,
                    applying_trans_location: applying_trans_location,
                    applying_transaction_location: applying_transaction_location,
                    applying_trans_name: applying_trans_name,
                    realize_gain_post_debit: realize_gain_post_debit,
                    realize_gain_post_credit: realize_gain_post_credit,
                    kontrol: kontrol,
                    debit_credit: debit_credit,
                    memo_line: memo,
                    currency: currency,// head
                    internal_id: internal_id, // head
                });



            }

            if (get_result.length % 1000 === 0) {
                start_row += 1000
            }

        } while (get_result.length === 1000);

        let result = [];

        let processed_data = []



        for (let i = 0; i < search_result_arr.length; i++) {
            if (!processed_data.includes(search_result_arr[i].tran_id)) {
                let total_debit = 0;
                let total_credit = 0;
                let temp = {
                    internal_id: search_result_arr[i].internal_id,
                    tran_id: search_result_arr[i].tran_id,
                    date: search_result_arr[i].date,
                    ex_rate_netsuite: search_result_arr[i].ex_rate_netsuite,
                    currency: search_result_arr[i].currency,
                    ex_rate_tms: search_result_arr[i].ex_rate_tms,
                    memo_head: search_result_arr[i].memo_head,
                    total_debit: 0,
                    total_credit: 0,
                    line: [],
                }

                let get_duplicate = search_result_arr.filter((data) => data.tran_id == search_result_arr[i].tran_id)

                for (let j = 0; j < get_duplicate.length; j++) {

                    let debit_sel = 0;
                    let credit_sel = 0;

                    if (get_duplicate[j].debit_credit == 'Debit') {
                        let temp_amount = Math.abs(Number(get_duplicate[j].realize_gain_amount)) - Number(get_duplicate[j].kontrol);

                        if (temp_amount > 0) {
                            credit_sel = temp_amount
                            total_credit += temp_amount
                        }
                        if (temp_amount < 0) {
                            debit_sel = temp_amount * -1
                            total_debit += temp_amount * -1
                        }
                    }
                    if (get_duplicate[j].debit_credit == 'Credit') {
                        let temp_amount = Math.abs(Number(get_duplicate[j].realize_gain_amount)) - Number(get_duplicate[j].kontrol);

                        if (temp_amount > 0) {
                            debit_sel = temp_amount
                            total_debit += temp_amount
                        }
                        if (temp_amount < 0) {
                            credit_sel = temp_amount * -1
                            total_credit += temp_amount * -1
                        }
                    }

                    temp.line.push({
                        account: get_duplicate[j].account,
                        entity: get_duplicate[j].applying_trans_name,
                        business_unit: get_duplicate[j].applying_trans_business_unit,
                        department: get_duplicate[j].applying_trans_department,
                        cost_center: get_duplicate[j].applying_trans_cost_center,
                        location: get_duplicate[j].applying_trans_location,
                        amount: get_duplicate[j].amount,
                        kontrol: get_duplicate[j].kontrol,
                        debit_credit: get_duplicate[j].debit_credit,
                        debit_selisih: debit_sel ? debit_sel : '',
                        credit_selisih: credit_sel ? credit_sel : '',
                        memo_line: get_duplicate[j].memo_line,
                    });

                }
                temp.total_debit = total_debit;
                temp.total_credit = total_credit;
                processed_data.push(temp.tran_id)
                result.push(temp);
            }

        }
        return result;
    }


    function getInputData() {
        // Load the saved search using its internal ID

        let parameters = runtime.getCurrentScript().getParameter({
            name: 'custscript_me_parameters_jrnl_selisih'
        });
        var parseData = JSON.parse(parameters);
        let search_trans_acc = searchTransAccount(parseData);
        log.debug('search_trans_acc', search_trans_acc)

        return search_trans_acc;
    }

    function map(context) {
        // Parse the search result
        let result = JSON.parse(context.value);

        var create_rec = record.create({
            type: 'journalentry', // Your custom record type
        });

        let set_currency = create_rec.setValue('currency', 1)
        let set_journal_cat = create_rec.setValue('custbody_me_journal_category', 3)
        let set_voucher_list = create_rec.setValue('custbody_me_voucher_list', 3)
        let set_cost_center = create_rec.setValue('cseg_me_cost_center', 101)
        let set_generate_by_sys = create_rec.setValue('custbody_me_generate_by_sys', true)
        let set_memo_head = create_rec.setValue('memo', result.memo_head)

        let total_debit = 0;
        let total_credit = 0;

        for (let i = 0; i < result.line.length; i++) {

            total_debit += result.line[i].debit_selisih;
            total_credit += result.line[i].credit_selisih;

            let set_account = create_rec.setSublistValue({
                sublistId: 'line',
                fieldId: 'account',
                value: result.line[i].account,
                line: i,
            })
            let set_debit = create_rec.setSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                value: result.line[i].debit_selisih,
                line: i,
            })
            let set_credit = create_rec.setSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                value: result.line[i].credit_selisih,
                line: i,
            })
            let set_location = create_rec.setSublistValue({
                sublistId: 'line',
                fieldId: 'location',
                value: result.line[i].location,
                line: i,
            })
            let set_name = create_rec.setSublistValue({
                sublistId: 'line',
                fieldId: 'entity',
                value: result.line[0].entity,
                line: i,
            })
            let set_department = create_rec.setSublistValue({
                sublistId: 'line',
                fieldId: 'department',
                value: result.line[i].department,
                line: i,
            })
            let set_business_unit = create_rec.setSublistValue({
                sublistId: 'line',
                fieldId: 'class',
                value: result.line[i].business_unit,
                line: i,
            })
            let set_memo_line = create_rec.setSublistValue({
                sublistId: 'line',
                fieldId: 'memo',
                value: result.line[0].memo_line,
                line: i,
            })


            if (i == result.line.length - 1 && (Number(result.total_debit) - Number(result.total_credit)) < 0) {
                let set_account = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: 852,
                    line: result.line.length,
                })
                let set_debit = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    value: (Number(result.total_debit) - Number(result.total_credit)) * -1,
                    line: result.line.length,
                })
                // let set_credit = create_rec.setSublistValue({
                //     sublistId: 'line',
                //     fieldId: 'credit',
                //     value: total_debit - total_credit,
                //     line: i,
                // })
                let set_location = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    value: result.line[0].location,
                    line: result.line.length,
                })
                let set_name = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    value: result.line[0].entity,
                    line: result.line.length,
                })
                let set_department = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    value: result.line[0].department,
                    line: result.line.length,
                })
                let set_business_unit = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    value: result.line[0].business_unit,
                    line: result.line.length,
                })
                let set_memo_line = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    value: result.line[0].memo_line,
                    line: result.line.length,
                })
            }
            if (i == result.line.length - 1 && (Number(result.total_debit) - Number(result.total_credit)) > 0) {
                let set_account = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: 852,
                    line: result.line.length,
                })
                // let set_debit = create_rec.setSublistValue({
                //     sublistId: 'line',
                //     fieldId: 'debit',
                //     value: result.line[i].debit_selisih,
                //     line: i,
                // })
                let set_credit = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    value: (Number(result.total_debit) - Number(result.total_credit)),
                    line: result.line.length,
                })
                let set_location = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    value: result.line[0].location,
                    line: result.line.length,
                })
                let set_name = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    value: result.line[0].entity,
                    line: result.line.length,
                })
                let set_department = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    value: result.line[0].department,
                    line: result.line.length,
                })
                let set_business_unit = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    value: result.line[0].business_unit,
                    line: result.line.length,
                })
                let set_memo_line = create_rec.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    value: result.line[0].memo_line,
                    line: result.line.length,
                })
            }

        }
        log.debug("(Number(total_debit) - Number(total_credit))", (Number(total_debit) - Number(total_credit)))

        if (total_debit != 0 && total_credit != 0) {
            let save_journal = create_rec.save();

            if (result.type == "Bill") {
                var set_journal = record.submitFields({
                    type: record.Type.VENDOR_BILL,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Bill Credit") {
                var set_journal = record.submitFields({
                    type: record.Type.VENDOR_CREDIT,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Bill Payment") {
                var set_journal = record.submitFields({
                    type: record.Type.VENDOR_PAYMENT,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Credit Memo") {
                var set_journal = record.submitFields({
                    type: record.Type.CREDIT_MEMO,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            // if (result.type == "Currency Revaluation") {
            //     var set_journal = record.submitFields({
            //         type: record.Type.SALES_ORDER,
            //         id: result.internal_id,
            //         values: {
            //             'custbody_me_journal_entries_diff': save_journal,
            //         },
            //     });
            // }
            if (result.type == "Customer Refund") {
                var set_journal = record.submitFields({
                    type: record.Type.CUSTOMER_REFUND,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Deposit") {
                var set_journal = record.submitFields({
                    type: record.Type.DEPOSIT,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Invoice") {
                var set_journal = record.submitFields({
                    type: record.Type.INVOICE,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Item Receipt") {
                var set_journal = record.submitFields({
                    type: record.Type.ITEM_RECEIPT,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Journal") {
                var set_journal = record.submitFields({
                    type: record.Type.JOURNAL_ENTRY,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Payment") {
                var set_journal = record.submitFields({
                    type: record.Type.CUSTOMER_PAYMENT,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Vendor Prepayment") {
                var set_journal = record.submitFields({
                    type: record.Type.VENDOR_PREPAYMENT,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
            if (result.type == "Vendor Prepayment Application") {
                var set_journal = record.submitFields({
                    type: record.Type.VENDOR_PREPAYMENT_APPLICATION,
                    id: result.internal_id,
                    values: {
                        'custbody_me_journal_entries_diff': save_journal,
                    },
                });
            }
        }

    }

    function summarize(summary) {
        // Log summary information
        summary.output.iterator().each(function (key, value) {
            log.audit({
                title: 'Summary',
                details: key + ' ' + value
            });
            return true;
        });

        // Handle any map stage errors
        summary.mapSummary.errors.iterator().each(function (key, error) {
            log.error({
                title: 'Map Error',
                details: key + ' caused error: ' + error
            });
            return true;
        });
    }


    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize

    };
});

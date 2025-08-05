/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/runtime'], function (record, search, runtime) {


    function beforeSubmit(context) {
        if (runtime.executionContext === runtime.ContextType.SUITELET || runtime.executionContext === runtime.ContextType.WEBSERVICES || runtime.executionContext === runtime.ContextType.SCHEDULED || runtime.executionContext === runtime.ContextType.MAP_REDUCE) {
            return;
        }
        let rec = context.newRecord;
        let get_je_trans = rec.getValue('custbody_me_creditmemo_je')

        if (context.type == 'delete' && get_je_trans) {
            let delete_je = record.delete({
                type: record.Type.JOURNAL_ENTRY,
                id: get_je_trans,
            });
        }
    }

    function afterSubmit(context) {
        if (runtime.executionContext === runtime.ContextType.SUITELET || runtime.executionContext === runtime.ContextType.WEBSERVICES || runtime.executionContext === runtime.ContextType.SCHEDULED || runtime.executionContext === runtime.ContextType.MAP_REDUCE) {
            return;
        }
        let recNew = context.newRecord;
        if (context.type != 'delete') {


            try {

                let rec = record.load({
                    type: 'creditmemo',
                    id: recNew.id,
                });

                let get_account = rec.getValue('account')
                let get_amt_pph = rec.getValue('custbody_tms_amountpph_billpayment')
                // let get_pph_account = rec.getValue('custbody_tms_pph_for_billpayment')
                let business_unit = rec.getValue('class')
                let department = rec.getValue('department')
                let location = rec.getValue('location')
                let currency = rec.getValue('currency')
                let get_je_trans = rec.getValue('custbody_me_creditmemo_je')
                let get_date = rec.getValue('trandate')
                let get_ex_rate = rec.getValue('exchangerate')
                // let get_status_approval = rec.getValue('approvalstatus')
                let get_status = rec.getText('status')
                // let get_approval_status = rec.getText('approvalstatus')
                let get_vendor = rec.getValue('entity')
                let get_tms_exrate = rec.getValue('custbody_me_spot_rate')

                let item_line = rec.getLineCount('item');

                let item_arr = []

                for (let i = 0; i < item_line; i++) {
                    let item_id = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
                    let business_unit_line = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'class',
                        line: i
                    });
                    let department_line = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'department',
                        line: i
                    });
                    let location_line = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: i
                    });

                    let lookup_item_account = search.lookupFields({
                        type: search.Type.ITEM,
                        id: item_id,
                        columns: ['incomeaccount']
                    });

                    let item_tot_amount = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: i
                    });

                    if (Number(item_tot_amount) > 0 && lookup_item_account.incomeaccount[0].value == 54) {
                        item_arr.push({
                            account: lookup_item_account.incomeaccount[0].value,
                            item_amount: item_tot_amount,
                            business_unit_line: business_unit_line,
                            department_line: department_line,
                            location_line: location_line,
                        });
                    }
                }

                log.debug('item_arr', item_arr)

                let get_vendor_lookup = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: get_vendor,
                    columns: ['altname', 'custentity_me_income_account_customer']
                });

                // log.debug('get_approval_status',get_approval_status)

                if (!get_je_trans) {
                    let create_journal = record.create({
                        type: record.Type.JOURNAL_ENTRY,
                    });

                    let set_bill_payment = create_journal.setValue('custbody_me_cm_number', recNew.id);
                    let set_journal_cat = create_journal.setText('custbody_me_journal_category', 'Journal Accounting');
                    let set_voucher_list = create_journal.setText('custbody_me_voucher_list', 'None');
                    let set_currency = create_journal.setValue('currency', currency);
                    let set_exrate = create_journal.setValue('exchangerate', get_ex_rate);
                    let set_date = create_journal.setValue('trandate', get_date);
                    let set_approve_status = create_journal.setText('approvalstatus', "Approved");
                    let set_tms_ex_rate = create_journal.setValue('custbody_me_spot_rate', get_tms_exrate);
                    // let set_status= create_journal.setText('status', get_status);

                    for (let i = 0; i < item_arr.length; i++) {
                        let set_debit_account = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: get_vendor_lookup.custentity_me_income_account_customer[0].value,
                            line: i
                        });
                        let set_debit_class = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            // value: business_unit,
                            value: item_arr[i].business_unit_line,
                            line: i
                        });
                        let set_debit_entity = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: get_vendor,
                            line: i
                        });
                        let set_debit_department = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            // value: department,
                            value: item_arr[i].department_line,
                            line: i
                        });
                        let set_debit_location = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            // value: location,
                            value: item_arr[i].location_line,
                            line: i
                        });
                        let set_debit_amount = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: item_arr[i].item_amount,
                            line: i
                        });
                        let set_debit_memo = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: get_vendor_lookup.altname,
                            line: i
                        });

                    }

                    for (let i = item_arr.length; i < item_arr.length * 2; i++) {
                        let set_credit_account = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: item_arr[i - item_arr.length].account,
                            line: i
                        });
                        let set_credit_class = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            // value: business_unit,
                            value: item_arr[i - item_arr.length].business_unit_line,
                            line: i
                        });
                        let set_credit_entity = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: get_vendor,
                            line: i
                        });
                        let set_credit_department = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            // value: department,
                            value: item_arr[i - item_arr.length].department_line,
                            line: i
                        });
                        let set_credit_location = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            // value: location,
                            value: item_arr[i - item_arr.length].location_line,
                            line: i
                        });
                        let set_credit_amount = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: item_arr[i - item_arr.length].item_amount,
                            line: i
                        });
                        let set_credit_memo = create_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: get_vendor_lookup.altname,
                            line: i
                        });

                    }


                    let save = create_journal.save()
                    let set_je_trans = rec.setValue('custbody_me_creditmemo_je', save)

                }

                if (get_je_trans) {
                    let load_journal = record.load({
                        type: record.Type.JOURNAL_ENTRY,
                        id: get_je_trans,
                    });

                    let set_bill_payment = load_journal.setValue('custbody_me_cm_number', recNew.id);
                    let set_journal_cat = load_journal.setText('custbody_me_journal_category', 'Journal Accounting');
                    let set_voucher_list = load_journal.setText('custbody_me_voucher_list', 'None');
                    let set_currency = load_journal.setValue('currency', currency);
                    let set_exrate = load_journal.setValue('exchangerate', get_ex_rate);
                    let set_date = load_journal.setValue('trandate', get_date);
                    let set_approve_status = load_journal.setText('approvalstatus', "Approved");
                    let set_tms_ex_rate = load_journal.setValue('custbody_me_spot_rate', get_tms_exrate);
                    // let set_status= load_journal.setText('status', get_status);

                    let get_journal_line = load_journal.getLineCount('line')

                    for (let j = get_journal_line - 1; j >= 0; j--) {
                        load_journal.removeLine({
                            sublistId: 'line',
                            line: j,
                            // ignoreRecalc: true
                        });
                        log.debug('j', j)
                    }

                    for (let i = 0; i < item_arr.length; i++) {
                        let set_debit_account = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: get_vendor_lookup.custentity_me_income_account_customer[0].value,
                            line: i
                        });
                        let set_debit_class = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: item_arr[i].business_unit_line,
                            line: i
                        });
                        let set_debit_entity = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: get_vendor,
                            line: i
                        });
                        let set_debit_department = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: item_arr[i].department_line,
                            line: i
                        });
                        let set_debit_location = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: item_arr[i].location_line,
                            line: i
                        });
                        let set_debit_amount = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: item_arr[i].item_amount,
                            line: i
                        });
                        let set_debit_memo = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: get_vendor_lookup.altname,
                            line: i
                        });

                    }

                    for (let i = item_arr.length; i < item_arr.length * 2; i++) {
                        let set_credit_account = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: item_arr[i - item_arr.length].account,
                            line: i
                        });
                        let set_credit_class = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: item_arr[i - item_arr.length].business_unit_line,
                            line: i
                        });
                        let set_credit_entity = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: get_vendor,
                            line: i
                        });
                        let set_credit_department = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: item_arr[i - item_arr.length].department_line,
                            line: i
                        });
                        let set_credit_location = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: item_arr[i - item_arr.length].location_line,
                            line: i
                        });
                        let set_credit_amount = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: item_arr[i - item_arr.length].item_amount,
                            line: i
                        });
                        let set_credit_memo = load_journal.setSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: get_vendor_lookup.altname,
                            line: i
                        });

                    }
                    load_journal.save()

                }

                rec.save()

            } catch (error) {
                log.error('error', error)
            }
        }
    }



    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit,
    }
});

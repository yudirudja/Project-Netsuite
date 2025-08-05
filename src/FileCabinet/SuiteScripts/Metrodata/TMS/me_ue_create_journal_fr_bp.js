/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function afterSubmit(context) {
        let recNew = context.newRecord;

        try {

            let rec = record.load({
                type: 'vendorpayment',
                id: recNew.id,                    
            });

            let get_account = rec.getValue('account')
            let get_amt_pph = rec.getValue('custbody_tms_amountpph_billpayment')
            let get_pph_account = rec.getValue('custbody_tms_pph_for_billpayment')
            let business_unit = rec.getValue('class')
            let department = rec.getValue('department')
            let location = rec.getValue('location')
            let currency = rec.getValue('currency')
            let get_je_trans = rec.getValue('custbody_me_journal_transaction')
            let get_date = rec.getValue('trandate')
            let get_ex_rate = rec.getValue('exchangerate')
            // let get_status_approval = rec.getValue('approvalstatus')
            let get_status = rec.getText('status')

            if (get_account && get_amt_pph && get_pph_account && !get_je_trans) {
                let create_journal = record.create({
                    type: record.Type.JOURNAL_ENTRY,
                });

                let set_journal_cat = create_journal.setText('custbody_me_journal_category', 'Journal Accounting');
                let set_voucher_list = create_journal.setText('custbody_me_voucher_list', 'None');
                let set_currency = create_journal.setValue('currency', currency);
                let set_exrate = create_journal.setValue('exchangerate', get_ex_rate);
                let set_date = create_journal.setValue('trandate', get_date);
                let set_approve_status = create_journal.setText('approvalstatus', get_status);
                // let set_status= create_journal.setText('status', get_status);

                let set_debit_account = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: get_account,
                    line: 0
                });
                let set_debit_class = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    value: business_unit,
                    line: 0
                });
                let set_debit_department = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    value: department,
                    line: 0
                });
                let set_debit_location = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    value: location,
                    line: 0
                });
                let set_debit_amount = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: get_pph_account != 482 ? 'debit' : 'credit',
                    value: get_amt_pph,
                    line: 0
                });

                let set_credit_account = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: get_pph_account,
                    line: 1
                });
                let set_credit_class = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    value: business_unit,
                    line: 1
                });
                let set_credit_department = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    value: department,
                    line: 1
                });
                let set_credit_location = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    value: location,
                    line: 1
                });
                let set_credit_amount = create_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: get_pph_account != 482 ? 'credit' : debit,
                    value: get_amt_pph,
                    line: 1
                });
                let save = create_journal.save()
                let set_je_trans = rec.setValue('custbody_me_journal_transaction', save)

            }

            if (get_account && get_amt_pph && get_pph_account && get_je_trans) {
                let load_journal = record.load({
                    type: record.Type.JOURNAL_ENTRY,
                    id: get_je_trans,
                });

                let set_journal_cat = load_journal.setText('custbody_me_journal_category', 'Journal Accounting');
                let set_voucher_list = load_journal.setText('custbody_me_voucher_list', 'None');
                let set_currency = load_journal.setValue('currency', currency);
                let set_exrate = load_journal.setValue('exchangerate', get_ex_rate);
                let set_date = load_journal.setValue('trandate', get_date);
                let set_approve_status = load_journal.setText('approvalstatus', get_status);
                log.debug('set_approve_status', set_approve_status)
                // let set_status= load_journal.setText('status', get_status);

                let set_debit_account = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: get_account,
                    line: 0
                });
                let set_debit_class = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    value: business_unit,
                    line: 0
                });
                let set_debit_department = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    value: department,
                    line: 0
                });
                let set_debit_location = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    value: location,
                    line: 0
                });
                let set_debit_amount = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: get_pph_account != 482 ? 'debit' : 'credit',
                    value: get_amt_pph,
                    line: 0
                });

                let set_credit_account = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    value: get_pph_account,
                    line: 1
                });
                let set_credit_class = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    value: business_unit,
                    line: 1
                });
                let set_credit_department = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    value: department,
                    line: 1
                });
                let set_credit_location = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    value: location,
                    line: 1
                });
                let set_credit_amount = load_journal.setSublistValue({
                    sublistId: 'line',
                    fieldId: get_pph_account != 482 ? 'credit' : 'debit',
                    value: get_amt_pph,
                    line: 1
                });
                load_journal.save()

            }
            rec.save()

        } catch (error) {
            log.error('error', error)
        }
    }



    return {
        afterSubmit: afterSubmit,
    }
});

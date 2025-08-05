/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', './config/me_config.js'], function (record, search, config) {

    const CSREC = {
        id: 'customrecord_me_csrec_multicur_tran_fund',

        trandate: 'custrecord_me_cmctf_trandate',
        subsidiary: 'custrecord_me_cmctf_subsidiary',
        class_: 'custrecord_me_cmctf_class',
        department: 'custrecord_me_cmctf_department',
        fr0m_location: 'custrecord_me_cmctf_location',

        from_account: 'custrecord_me_cmctf_from_account',
        from_acc_balance: 'custrecord_me_cmctf_from_acc_balance',
        from_acc_exrate: 'custrecord_me_cmctf_from_acc_exrate',
        from_acc_amount: 'custrecord_me_cmctf_from_acc_amount',
        from_acc_record: 'custrecord_me_cmctf_from_acc_record',
        from_acc_currency: 'custrecord_me_cmctf_from_currency',

        to_account: 'custrecord_me_cmctf_to_account',
        to_acc_balance: 'custrecord_me_cmctf_to_acc_balance',
        to_acc_exrate: 'custrecord_me_cmctf_to_acc_exrate',
        to_acc_amount: 'custrecord_me_cmctf_to_acc_amount',
        to_acc_record: 'custrecord_me_cmctf_to_acc_record',
        to_acc_currency: 'custrecord_me_cmctf_to_currency',

        from_acc_amount: "custrecord_me_cmctf_from_acc_amount",
        from_acc_exrate: "custrecord_me_cmctf_from_acc_exrate",
        from_acc_idr_balance: "custrecord_me_cmctf_from_acc_idr_balance",

        to_acc_amount: "custrecord_me_cmctf_to_acc_amount",
        to_acc_exrate: "custrecord_me_cmctf_to_acc_exrate",
        to_acc_idr_balance: "custrecord_me_cmctf_to_acc_idr_balance",
    }

    // const DATA = {
    //     from_acc_amount: "custrecord_me_cmctf_from_acc_amount",
    //     from_acc_exrate: "custrecord_me_cmctf_from_acc_exrate",
    //     from_acc_idr_balance: "custrecord_me_cmctf_from_acc_idr_balance",

    //     to_acc_amount: "custrecord_me_cmctf_to_acc_amount",
    //     to_acc_exrate: "custrecord_me_cmctf_to_acc_exrate",
    //     to_acc_idr_balance: "custrecord_me_cmctf_to_acc_idr_balance",

    // }

    function setCOAforeignAmt(coa, currency) {
        var dates = new Date()
        var day_date = dates.getDate()
        var day_month = dates.getMonth() + 1
        var day_year = dates.getFullYear()
        var fulldate = day_date + '/' + day_month + '/' + day_year
        // log.debug('fulldate', fulldate)

        var filter = [
            ["posting", "is", "T"],
            "AND",
            ["trandate", "onorbefore", fulldate],
            "AND",
            ["currency", "anyof", currency],
            "AND",
            ["account", "anyof", coa]
        ];

        // if (currency == 1) {
        //     filter.push(
        //         "AND",
        //         [["currency", "anyof", currency],]
        //     )
        // }
        var coa_amt_search = search.create({
            type: "transaction",
            filters: filter,
            columns:
                [
                    search.createColumn({
                        name: "account",
                        summary: "GROUP",
                        label: "Account"
                    }),
                    search.createColumn({
                        name: "currency",
                        summary: "GROUP",
                        label: "Currency"
                    }),
                    search.createColumn({
                        name: "fxamount",
                        summary: "SUM",
                        label: "Amount (Foreign Currency)"
                    })
                ]
        });

        var coa_amt_result = coa_amt_search.run().getRange(0, 1)
        log.debug('coa_amt_result', coa_amt_result)
        if (coa_amt_result.length > 0) {
            var coa_amt = parseFloat(coa_amt_result[0].getValue(coa_amt_result[0].columns[2])).toFixed(2)
        } else {
            var coa_amt = 0
        }
        log.debug("coa_amt", coa_amt)
        return coa_amt
    }

    function createFromTransferFund(data) {
        // From Account mengisi Debit
        // To Account mengisi Credit

        try {
            var subsidiary = data.from_subsidiary
            var from_account = data.from_account
            var from_acc_balance = data.from_acc_balance
            var from_acc_exrate = data.from_acc_exrate
            var from_acc_amount = data.from_acc_amount
            var from_acc_currency = data.from_acc_currency
            var class_ = data.class_
            var department = data.department
            var from_location = data.from_location
            var to_location = data.to_location
            var trandate = data.trandate
            var from_acc_record = data.from_acc_record
            var coa_clearing_idr = COA_ID.BAK_CLEARING_IDR
            if (subsidiary == 3) {
                coa_clearing_idr = COA_ID.PAK_CLEARING_IDR
            }

            // var from_acc_currency = search.lookupFields({
            //     type: search.Type.ACCOUNT,
            //     id: from_account,
            //     columns: ['currency']
            // })
            // log.debug('from_acc_currency', from_acc_currency)
            // throw('error bentar')

            var rec_from = record.create({
                type: FLD_CT.id,
                isDynamic: true
            })

            rec_from.setValue({
                fieldId: FLD_CT.head_subsidiary,
                value: subsidiary
            })
            rec_from.setValue({
                fieldId: FLD_CT.head_trandate,
                value: trandate
            })
            rec_from.setValue({
                fieldId: FLD_CT.head_currency,
                value: from_acc_currency
            })
            rec_from.setValue({
                fieldId: FLD_CT.head_exchangerate,
                value: from_acc_exrate
            })

            log.debug('exrate from_acc_exrate', rec_from.getValue(FLD_CT.head_exchangerate))
            rec_from.setValue({
                fieldId: FLD_CT.head_is_transfer_fund,
                value: true,
                ignoreFieldChange: true
            })



            // Set Sublist DEBIT
            rec_from.selectNewLine({
                sublistId: FLD_CT.child_parent
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_account,
                value: coa_clearing_idr
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_debit,
                value: from_acc_amount
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_department,
                value: department
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_class,
                value: class_
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_location,
                value: from_location
            })
            rec_from.commitLine({
                sublistId: FLD_CT.child_parent
            })

            // Set Sublist CREDIT
            rec_from.selectNewLine({
                sublistId: FLD_CT.child_parent
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_account,
                value: from_account
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_credit,
                value: from_acc_amount
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_department,
                value: department
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_class,
                value: class_
            })
            rec_from.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_location,
                value: from_location
            })
            rec_from.commitLine({
                sublistId: FLD_CT.child_parent
            })

            var id_ct_from = rec_from.save()

            return id_ct_from

        } catch (error) {
            throw ('Failed to Create Transfer Fund From Account. ' + error)

        }
    }

    function createToTransferFund(data) {
        // From Account mengisi Debit
        // To Account mengisi Credit

        try {

            var subsidiary = data.from_subsidiary
            var to_account = data.to_account
            var to_acc_balance = data.to_acc_balance
            var to_acc_exrate = data.to_acc_exrate
            var to_acc_amount = data.to_acc_amount
            var to_acc_currency = data.to_acc_currency
            var class_ = data.class_
            var department = data.department
            var from_location = data.from_location
            var to_location = data.to_location
            var trandate = data.trandate
            var to_acc_record = data.to_acc_record
            var coa_clearing_idr = COA_ID.BAK_CLEARING_IDR
            if (subsidiary == 3) {
                coa_clearing_idr = COA_ID.PAK_CLEARING_IDR
            }

            // var to_acc_currency = search.lookupFields({
            //     type: search.Type.ACCOUNT,
            //     id: to_account,
            //     columns: ['currency']
            // }).currency[0].value

            var rec_to = record.create({
                type: FLD_CT.id,
                isDynamic: true
            })

            rec_to.setValue({
                fieldId: FLD_CT.head_subsidiary,
                value: subsidiary
            })
            rec_to.setValue({
                fieldId: FLD_CT.head_trandate,
                value: trandate
            })
            rec_to.setValue({
                fieldId: FLD_CT.head_currency,
                value: to_acc_currency
            })
            rec_to.setValue({
                fieldId: FLD_CT.head_exchangerate,
                value: to_acc_exrate
            })

            log.debug('exrate to_acc_exrate', rec_to.getValue(FLD_CT.head_exchangerate))
            rec_to.setValue({
                fieldId: FLD_CT.head_is_transfer_fund,
                value: true,
                ignoreFieldChange: true
            })


            // Set Sublist DEBIT
            rec_to.selectNewLine({
                sublistId: FLD_CT.child_parent
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_account,
                value: to_account
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_debit,
                value: to_acc_amount
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_department,
                value: department
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_class,
                value: class_
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_location,
                value: to_location
            })
            rec_to.commitLine({
                sublistId: FLD_CT.child_parent
            })

            // Set Sublist CREDIT
            rec_to.selectNewLine({
                sublistId: FLD_CT.child_parent
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_account,
                value: coa_clearing_idr
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_credit,
                value: to_acc_amount
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_department,
                value: department
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_class,
                value: class_
            })
            rec_to.setCurrentSublistValue({
                sublistId: FLD_CT.child_parent,
                fieldId: FLD_CT.child_location,
                value: from_location
            })
            rec_to.commitLine({
                sublistId: FLD_CT.child_parent
            })

            var id_ct_to = rec_to.save()

            return id_ct_to
        } catch (error) {
            throw ('Failed to Create Transfer Fund To Account. ' + error)
        }
    }

    function createFromJournalEntry(data) {
        // From Account mengisi Debit
        // To Account mengisi Credit

        if (data.from_subsidiary == config.pak) {//intercompany from PAK to BAK
            try {

                var JournalPakToBak = record.create({
                    type: "journalentry",
                    isDynamic: true
                })

                var setSubsidiary = JournalPakToBak.setValue({
                    fieldId: 'subsidiary',
                    value: data.from_subsidiary
                });
                var setStatus = JournalPakToBak.setValue({
                    fieldId: 'approvalstatus',
                    value: 2
                });
                var setCurrency = JournalPakToBak.setValue({
                    fieldId: 'currency',
                    value: data.from_acc_currency
                });

                // Set Sublist DEBIT
                JournalPakToBak.selectNewLine('line');

                var setDebitAccount = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 2,
                    value: config.account.system_ar_clearing_account,
                });
                var setDebitAmount = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    // line: 2,
                    value: parseFloat(Math.abs(data.from_acc_amount)).toFixed(2),
                });
                var setDebitDepartment = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 2,
                    value: data.department,
                });
                var setDebitEntity = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    // line: 2,
                    value: config.interco_pak_to_bak,
                });
                var setDebitClass = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 2,
                    value: data.class,
                });
                var setDebitLocation = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 2,
                    value: data.from_location,
                });
                JournalPakToBak.commitLine('line');

                // Set Sublist CREDIT
                JournalPakToBak.selectNewLine('line');
                var setCreditAccount = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 1,
                    value: data.from_account,
                });

                var setCreditAmount = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    // line: 1,
                    value: parseFloat(Math.abs(data.from_acc_amount)).toFixed(2),
                });

                var setCreditDepartment = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 1,
                    value: data.department,
                });

                var setCreditClass = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 1,
                    value: data.class,
                });

                var setCreditLocation = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 1,
                    value: data.to_location,
                });
                JournalPakToBak.commitLine('line');

                var saveJournal = JournalPakToBak.save()

                return saveJournal;
            } catch (error) {
                throw ('Failed to Create Journal Entry. ' + error)
            }

        }

        if (data.from_subsidiary == config.bak) {//intercompany from BAK to PAK
            try {

                var journalBakToPak = record.create({
                    type: "journalentry",
                    isDynamic: true
                })

                var setSubsidiary = journalBakToPak.setValue({
                    fieldId: 'subsidiary',
                    value: data.from_subsidiary
                });
                var setStatus = journalBakToPak.setValue({
                    fieldId: 'approvalstatus',
                    value: 2
                });
                var setCurrency = journalBakToPak.setValue({
                    fieldId: 'currency',
                    value: data.from_acc_currency
                });
                // Set Sublist DEBIT
                journalBakToPak.selectNewLine('line');

                var setDebitAccount = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 2,
                    value: config.account.system_ar_clearing_account,
                });
                var setDebitAmount = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    // line: 2,
                    value: parseFloat(Math.abs(data.from_acc_amount)).toFixed(2),
                });
                var setDebitDepartment = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 2,
                    value: data.department,
                });
                var setDebitEntity = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    // line: 2,
                    value: config.interco_bak_to_pak,
                });
                var setDebitClass = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 2,
                    value: data.class,
                });
                var setDebitLocation = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 2,
                    value: data.from_location,
                });
                journalBakToPak.commitLine('line');

                // Set Sublist CREDIT
                journalBakToPak.selectNewLine('line');
                var setCreditAccount = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 1,
                    value: data.from_account,
                });

                var setCreditAmount = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    // line: 1,
                    value: parseFloat(Math.abs(data.from_acc_amount)).toFixed(2),
                });

                var setCreditDepartment = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 1,
                    value: data.department,
                });

                var setCreditClass = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 1,
                    value: data.class,
                });

                var setCreditLocation = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 1,
                    value: data.to_location,
                });
                journalBakToPak.commitLine('line');

                var saveJournal = journalBakToPak.save()

                return saveJournal;
            } catch (error) {
                throw ('Failed to Create Journal Entry. ' + error)
            }
        }

    }
    
    function createToJournalEntry(data) {
        // From Account mengisi Debit
        // To Account mengisi Credit

        if (data.to_subsidiary == config.pak) {//intercompany from BAK to PAK
            try {

                var journalBakToPak = record.create({
                    type: "journalentry",
                    isDynamic: true
                })

                var setSubsidiary = journalBakToPak.setValue({
                    fieldId: 'subsidiary',
                    value: data.from_subsidiary
                });
                var setStatus = journalBakToPak.setValue({
                    fieldId: 'approvalstatus',
                    value: 2
                });
                var setCurrency = journalBakToPak.setValue({
                    fieldId: 'currency',
                    value: data.to_acc_currency
                });

                // Set Sublist DEBIT
                journalBakToPak.selectNewLine('line');

                var setDebitAccount = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 2,
                    value: config.account.system_ar_clearing_account,
                });
                var setDebitAmount = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    // line: 2,
                    value: parseFloat(Math.abs(data.from_acc_amount)).toFixed(2),
                });
                var setDebitDepartment = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 2,
                    value: data.department,
                });
                var setDebitEntity = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    // line: 2,
                    value: config.interco_bak_to_pak,
                });
                var setDebitClass = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 2,
                    value: data.class,
                });
                var setDebitLocation = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 2,
                    value: data.from_location,
                });
                journalBakToPak.commitLine('line');

                // Set Sublist CREDIT
                journalBakToPak.selectNewLine('line');
                var setCreditAccount = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 1,
                    value: data.from_account,
                });

                var setCreditAmount = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    // line: 1,
                    value: parseFloat(Math.abs(data.from_acc_amount)).toFixed(2),
                });

                var setCreditDepartment = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 1,
                    value: data.department,
                });

                var setCreditClass = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 1,
                    value: data.class,
                });

                var setCreditLocation = journalBakToPak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 1,
                    value: data.to_location,
                });
                journalBakToPak.commitLine('line');

                var saveJournal = journalBakToPak.save()

                return saveJournal;
            } catch (error) {
                throw ('Failed to Create Journal Entry. ' + error)
            }

        }

        if (data.to_subsidiary == config.bak) {//intercompany from PAK to BAK
            try {

                var JournalPakToBak = record.create({
                    type: "journalentry",
                    isDynamic: true
                })

                var setSubsidiary = JournalPakToBak.setValue({
                    fieldId: 'subsidiary',
                    value: data.from_subsidiary
                });
                var setStatus = JournalPakToBak.setValue({
                    fieldId: 'approvalstatus',
                    value: 2
                });
                var setCurrency = JournalPakToBak.setValue({
                    fieldId: 'currency',
                    value: data.to_acc_currency
                });

                // Set Sublist DEBIT
                JournalPakToBak.selectNewLine('line');

                var setDebitAccount = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 2,
                    value: config.account.system_ar_clearing_account,
                });
                var setDebitAmount = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    // line: 2,
                    value: parseFloat(Math.abs(data.from_acc_amount)).toFixed(2),
                });
                var setDebitDepartment = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 2,
                    value: data.department,
                });
                var setDebitEntity = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'entity',
                    // line: 2,
                    value: config.interco_pak_to_bak,
                });
                var setDebitClass = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 2,
                    value: data.class,
                });
                var setDebitLocation = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 2,
                    value: data.from_location,
                });
                JournalPakToBak.commitLine('line');

                // Set Sublist CREDIT
                JournalPakToBak.selectNewLine('line');
                var setCreditAccount = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 1,
                    value: data.from_account,
                });

                var setCreditAmount = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    // line: 1,
                    value: parseFloat(Math.abs(data.from_acc_amount)).toFixed(2),
                });

                var setCreditDepartment = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 1,
                    value: data.department,
                });

                var setCreditClass = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 1,
                    value: data.class,
                });

                var setCreditLocation = JournalPakToBak.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 1,
                    value: data.to_location,
                });
                JournalPakToBak.commitLine('line');

                var saveJournal = JournalPakToBak.save()

                return saveJournal;
            } catch (error) {
                throw ('Failed to Create Journal Entry. ' + error)
            }
        }

    }

    function beforeSubmit(context) {
        var rec_ctmttf = context.newRecord;

        var from_subsidiary = rec_ctmttf.getValue(CSREC.subsidiary)
        var class_ = rec_ctmttf.getValue(CSREC.class_)
        var department = rec_ctmttf.getValue(CSREC.department)
        var fromLocation = rec_ctmttf.getValue(CSREC.location)
        var trandate = rec_ctmttf.getValue(CSREC.trandate)

        var from_account = rec_ctmttf.getValue(CSREC.from_account)
        var from_acc_balance = rec_ctmttf.getValue(CSREC.from_acc_balance)
        var from_acc_exrate = rec_ctmttf.getValue(CSREC.from_acc_exrate)
        var from_acc_amount = rec_ctmttf.getValue(CSREC.from_acc_amount)
        var from_acc_currency = rec_ctmttf.getValue(CSREC.from_acc_currency)

        var to_account = rec_ctmttf.getValue(CSREC.to_account)
        var to_acc_balance = rec_ctmttf.getValue(CSREC.to_acc_balance)
        var to_acc_exrate = rec_ctmttf.getValue(CSREC.to_acc_exrate)
        var to_acc_amount = rec_ctmttf.getValue(CSREC.to_acc_amount)
        var from_acc_record = rec_ctmttf.getValue(CSREC.from_acc_record)
        var to_acc_record = rec_ctmttf.getValue(CSREC.to_acc_record)
        var to_acc_currency = rec_ctmttf.getValue(CSREC.to_acc_currency)

        var getToSubsidiary = rec_ctmttf.getValue({
            fieldId: 'custrecord_me_csrec_tffund_to_subsidiary'
        })
        var getToLocation = rec_ctmttf.getValue({
            fieldId: 'custrecord_me_csrec_tfffunds_to_location'
        })
        var getFromAccIdrBalance = rec_ctmttf.getValue({
            fieldId: CSREC.from_acc_idr_balance
        })
        var getToAccIdrBalance = rec_ctmttf.getValue({
            fieldId: CSREC.to_acc_idr_balance
        })

        if (getToSubsidiary == '' && getToLocation != '') {
            var paramObj = {
                trandate: trandate,
                from_subsidiary: from_subsidiary,
                to_subsidiary: getToSubsidiary,
                class_: class_,
                department: department,
                from_location: fromLocation,
                to_location: getToLocation,

                from_account: from_account,
                from_acc_balance: from_acc_balance,
                from_acc_exrate: from_acc_exrate,
                from_acc_amount: from_acc_amount,
                from_acc_record: from_acc_record,
                from_acc_currency: from_acc_currency,

                to_account: to_account,
                to_acc_balance: to_acc_balance,
                to_acc_exrate: to_acc_exrate,
                to_acc_amount: to_acc_amount,
                to_acc_record: to_acc_record,
                to_acc_currency: to_acc_currency,
            }

            var createTransferFundsFrom = createFromTransferFund(paramObj);
            var createTransferFundsTo = createToTransferFund(paramObj);

            var setTransferFundsFrom = rec_ctmttf.setValue(CSREC.from_acc_record, createTransferFundsFrom);
            var setTransferFundsTo = rec_ctmttf.setValue(CSREC.to_acc_record, createTransferFundsTo);

        }

        if (getToSubsidiary != '' && getToLocation != '') {
            var paramObj = {
                trandate: trandate,
                from_subsidiary: from_subsidiary,
                to_subsidiary: getToSubsidiary,
                class_: class_,
                department: department,
                from_location: fromLocation,
                from_location: fromLocation,
                to_location: getToLocation,

                from_account: from_account,
                from_acc_balance: from_acc_balance,
                from_acc_exrate: from_acc_exrate,
                from_acc_amount: from_acc_amount,
                from_acc_record: from_acc_record,
                from_acc_currency: from_acc_currency,

                to_account: to_account,
                to_acc_balance: to_acc_balance,
                to_acc_exrate: to_acc_exrate,
                to_acc_amount: to_acc_amount,
                to_acc_record: to_acc_record,
                to_acc_currency: to_acc_currency,
            }

            var createTransferFundsFrom = createFromJournalEntry(paramObj);
            var createTransferFundsTo = createToJournalEntry(paramObj);

            var setJournalEntryFrom = rec_ctmttf.setValue(CSREC.from_acc_record, createTransferFundsFrom);
            var setJournalEntryTo = rec_ctmttf.setValue(CSREC.to_acc_record, createTransferFundsTo);
        }
    }


    return {
        beforeSubmit: beforeSubmit,
    }
});

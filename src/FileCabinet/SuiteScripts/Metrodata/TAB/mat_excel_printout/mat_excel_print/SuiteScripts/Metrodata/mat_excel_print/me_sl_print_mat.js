/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/url', 'N/format', 'N/record', "N/runtime", 'N/currentRecord', 'N/error', 'N/file', '../config/me_config.js'], function (search, serverWidget, log, task, redirect, url, format, record, runtime, currentRecord, error, file, config) {

    const DATA = {
        account: 'custpage_account',
        currency: 'custpage_currency',
        balance: 'custpage_balance',

        sublist: 'custpage_sublist',
        sublist_checkbox: 'custpage_sublist_checkbox',
        sublist_transaction_id: 'custpage_sublist_transaction_id',
        sublist_transaction_type: 'custpage_sublist_transaction_type',
        sublist_transaction_display: 'custpage_sublist_transaction_display',
        sublist_transfer_type: 'custpage_sublist_transfer_type',
        sublist_debited_account: 'custpage_sublist_debited_account',
        sublist_benificiary_id: 'custpage_sublist_benificiary_id',
        sublist_credited_account: 'custpage_sublist_credited_account',
        sublist_amount: 'custpage_sublist_amount',
        sublist_effective_date: 'custpage_sublist_effective_date',
        sublist_transaction_purpose: 'custpage_sublist_transaction_purpose',
        sublist_currency: 'custpage_sublist_currency',
        sublist_charges_type: 'custpage_sublist_charges_type',
        sublist_charges_account: 'custpage_sublist_charges_account',
        sublist_remark_1: 'custpage_sublist_remark_1',
        sublist_remark_2: 'custpage_sublist_remark_2',
        sublist_receiver_bank_code: 'custpage_sublist_receiver_bank_code',
        sublist_receiver_bank_name: 'custpage_sublist_receiver_bank_name',
        sublist_receiver_name: 'custpage_sublist_receiver_name',
        sublist_receiver_cust_type: 'custpage_sublist_receiver_cust_type',
        sublist_receiver_cust_residence: 'custpage_sublist_receiver_cust_residence',
        sublist_transaction_code: 'custpage_sublist_transaction_code',
        sublist_beneficiary_email: 'custpage_sublist_beneficiary_email',
    }

    function searchAccounts() {

        let result = [];

        let accountSearchObj = search.create({
            type: "account",
            filters:
                [
                    ["displayname", "contains", "BCA"]
                ],
            columns:
                [
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        })

        for (let i = 0; i < accountSearchObj.length; i++) {
            let display_name = accountSearchObj[i].getValue(accountSearchObj[i].columns[0]);
            let internal_id = accountSearchObj[i].getValue(accountSearchObj[i].columns[1]);
            result.push({
                display_name: display_name,
                internal_id: internal_id
            })
        }

        log.debug("Account_list", result)

        return result;

    }

    function getParameters(context) {
        var form = serverWidget.createForm({ title: 'MAT Report' });
        var MAT_information = form.addFieldGroup({
            id: 'mat_report',
            label: 'MAT'
        });

        var field_account = form.addField({
            id: DATA.account,
            type: serverWidget.FieldType.SELECT,
            label: 'Account',
            container: 'mat_report'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.NORMAL,
        });
        field_account.isMandatory = true
        var getAccount = searchAccounts()
        log.debug("getAccout_result", getAccount)
        field_account.addSelectOption({
            value: "",
            text: "",
        })
        for (let x = 0; x < getAccount.length; x++) {

            field_account.addSelectOption({
                value: getAccount[x].internal_id,
                text: getAccount[x].display_name,
            })
        }

        var currency = form.addField({
            id: DATA.currency,
            type: serverWidget.FieldType.SELECT,
            source: 'currency',
            label: 'Currency',
            container: 'mat_report'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        var balance = form.addField({
            id: DATA.balance,
            type: serverWidget.FieldType.FLOAT,
            label: 'Balance',
            container: 'mat_report'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED,
        });



        var sublist = form.addSublist({
            id: DATA.sublist,
            type: serverWidget.SublistType.LIST,
            label: 'MAT'
        });
        var sub_checkbox = sublist.addField({
            id: DATA.sublist_checkbox,
            type: serverWidget.FieldType.CHECKBOX,
            label: 'checkbox'
        });
        var sub_transaction_id = sublist.addField({
            id: DATA.sublist_transaction_id,
            type: serverWidget.FieldType.TEXT,
            label: 'Transaction_ID'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        var sub_transaction_type = sublist.addField({
            id: DATA.sublist_transaction_type,
            type: serverWidget.FieldType.TEXT,
            label: 'Transaction_type'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        var sub_transaction_display = sublist.addField({
            id: DATA.sublist_transaction_display,
            type: serverWidget.FieldType.TEXT,
            // source: -9,
            label: 'Transaction ID'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE,
        });

        var sub_transfer_type = sublist.addField({
            id: DATA.sublist_transfer_type,
            type: serverWidget.FieldType.TEXT,
            label: 'Transfer Type'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_debited_account = sublist.addField({
            id: DATA.sublist_debited_account,
            type: serverWidget.FieldType.TEXT,
            // source: 'vendorbill',
            label: 'Debited Account'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        // var sub_benificiary_id = sublist.addField({
        //     id: DATA.sublist_benificiary_id,
        //     type: serverWidget.FieldType.TEXT,
        //     label: 'Beneficiary ID'
        // }).updateDisplayType({
        //     displayType: serverWidget.FieldDisplayType.INLINE
        // });

        var sub_credited_account = sublist.addField({
            id: DATA.sublist_credited_account,
            type: serverWidget.FieldType.TEXT,
            label: 'Credited Account'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_amount = sublist.addField({
            id: DATA.sublist_amount,
            type: serverWidget.FieldType.TEXT,
            label: 'Amount'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_effective_date = sublist.addField({
            id: DATA.sublist_effective_date,
            type: serverWidget.FieldType.DATE,
            label: 'Effective Date'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        // var sub_transaction_purpose = sublist.addField({
        //     id: DATA.sublist_transaction_purpose,
        //     type: serverWidget.FieldType.TEXT,
        //     label: 'Transaction Purpose'
        // }).updateDisplayType({
        //     displayType: serverWidget.FieldDisplayType.ENTRY
        // });

        var sub_currency = sublist.addField({
            id: DATA.sublist_currency,
            type: serverWidget.FieldType.TEXT,
            // source: 'currency',
            label: 'Currency'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_charges_type = sublist.addField({
            id: DATA.sublist_charges_type,
            type: serverWidget.FieldType.TEXT,
            label: 'Charges Type'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_charges_account = sublist.addField({
            id: DATA.sublist_charges_account,
            type: serverWidget.FieldType.TEXT,
            label: 'Charges Account'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var remark_1 = sublist.addField({
            id: DATA.sublist_remark_1,
            type: serverWidget.FieldType.TEXT,
            label: 'Remark 1'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var remark_2 = sublist.addField({
            id: DATA.sublist_remark_2,
            type: serverWidget.FieldType.TEXT,
            label: 'Remark 2'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var receiver_bank_code = sublist.addField({
            id: DATA.sublist_receiver_bank_code,
            type: serverWidget.FieldType.TEXT,
            label: 'Receiver Bank Code'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var receiver_bank_name = sublist.addField({
            id: DATA.sublist_receiver_bank_name,
            type: serverWidget.FieldType.TEXT,
            label: 'Receiver Bank Name'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var receiver_name = sublist.addField({
            id: DATA.sublist_receiver_name,
            type: serverWidget.FieldType.TEXT,
            label: 'Receiver Name'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var receiver_cust_type = sublist.addField({
            id: DATA.sublist_receiver_cust_type,
            type: serverWidget.FieldType.TEXT,
            label: 'Receiver Customer Type'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        // let receiver_cust_option = [["", ""], ["1", "Perorangan"], ["2", "Perusahaan"], ["3", "Pemerintah"]]

        // for (let x = 1; x < receiver_cust_option.length; x++) {
        //     receiver_cust_type.addSelectOption({
        //         value: receiver_cust_option[x][0],
        //         text: receiver_cust_option[x][1],
        //     })
        // }

        var receiver_cust_residence = sublist.addField({
            id: DATA.sublist_receiver_cust_residence,
            type: serverWidget.FieldType.TEXT,
            label: 'receiver Customer Residence'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        // let receiver_cust_residence_option = [["", ""], ["1", "Residence/Penduduk"], ["2", "Non-Residence/Bukan Penduduk"]]

        // for (let x = 1; x < receiver_cust_residence_option.length; x++) {
        //     receiver_cust_residence.addSelectOption({
        //         value: receiver_cust_residence_option[x][0],
        //         text: receiver_cust_residence_option[x][1],
        //     })
        // }

        var transaction_code = sublist.addField({
            id: DATA.sublist_transaction_code,
            type: serverWidget.FieldType.TEXT,
            label: 'Transaction Code'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        // let transaction_code_option = [["", ""], ["70", "Payroll/Gaji"], ["2", "Pembayaran Dividen"], ["72", "Distribusi bantuan dana pemerintah"], ["73", "Pembayaran Tagihan"], ["78", "Pembayaran Lainnya"], ["79", "Pengembalian DKE Pembayaran"], ["80", "Pembayaran Cicilan"], ["81", "Pembayaran Tagihan"], ["82", "Pembayaran Pajak"], ["88", "Pembayaran Lainnya"], ["89", "Pengembalian DKE Pembayaran"]]

        // for (let x = 1; x < transaction_code_option.length; x++) {
        //     transaction_code.addSelectOption({
        //         value: transaction_code_option[x][0],
        //         text: transaction_code_option[x][1],
        //     })
        // }

        var beneficiary_email = sublist.addField({
            id: DATA.sublist_beneficiary_email,
            type: serverWidget.FieldType.TEXT,
            label: 'Beneficiary Email'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        return form;
    }

    function getTransaaction(account) {

        let result = []

        let transactionSearchObj = search.create({
            type: "transaction",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["account", "anyof", account],
                    "AND",
                    ["custbodycustbody_me_tf_status_cetak_ma", "is", "F"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["type", "anyof", "Check", "VendPymt"]
                ],
            columns:
                [
                    // search.createColumn({ name: "transactionnumber", label: "Transaction Name" }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "REPLACE({transactionnumber}, '/', '')",
                        label: "Formula (Text)"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when INSTR(LOWER({vendor.custentity_me_bank_name}), 'pt bank central asia, tbk') > 0 then 'BCA' when INSTR(LOWER({vendor.custentity_me_bank_name}), 'pt bank central asia, tbk') < 1 and {amount} <= 500000000 then 'LLG' when INSTR(LOWER({vendor.custentity_me_bank_name}), 'pt bank central asia, tbk') < 1 and {amount} > 500000000 then 'LLG' end",
                        label: "Formula (Text)"
                    }),
                    search.createColumn({
                        name: "custrecord_me_bank_acc_num_shadow",
                        join: "account",
                        label: "ME - Bank Account Number (Shadow)"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when {customer.accountnumber} is not null then {customer.accountnumber} when {vendor.accountnumber} is not null then {vendor.accountnumber} end",
                        label: "Beneficiary ID/ Credited account"
                    }),
                    search.createColumn({ name: "amount", label: "Amount" }),
                    search.createColumn({ name: "custbody_me_charges_type", label: "ME - Charges Type" }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when {customer.custentity_me_bifast_code} is not null then {customer.custentity_me_bifast_code} when {vendor.custentity_me_bifast_code} is not null then {vendor.custentity_me_bifast_code} end",
                        label: "Receiver Bank Code"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when {customer.custentity_me_bank_name} is not null then {customer.custentity_me_bank_name} when {vendor.custentity_me_bank_name} is not null then {vendor.custentity_me_bank_name} end",
                        label: "Receiver Bank Name"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when {vendor.custentity_me_bank_account_owner} is not null then {vendor.custentity_me_bank_account_owner} when {customer.custentity_me_bank_account_owner} is not null then {customer.custentity_me_bank_account_owner} end",
                        label: "Name"
                    }),
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "type", label: "transaction type" }),
                    search.createColumn({ name: "trandate", label: "Date" }),
                    // search.createColumn({ name: "memo", label: "memo" }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "SUBSTR({custbody_me_memo_bill}, 1, 18)",
                        label: "remark 1/memo 1"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when {vendor.custentity_me_rec_cust_type} is not null then {vendor.custentity_me_rec_cust_type} end",
                        label: "Receiver Cust Type"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when {vendor.custentity_me_rec_cust_residence} is not null then {vendor.custentity_me_rec_cust_residence} end",
                        label: "Receiver Cust Residence"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when {vendor.email} is not null and {vendor.altemail} is null then {vendor.email} when {vendor.email} is not null and {vendor.altemail} is not null then {vendor.email} || ', ' || {vendor.altemail} else 'finance@tentanganak.id' end",
                        label: "Beneficiary Email"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "SUBSTR({custbody_me_memo_bill}, 19, 18)",
                        label: "remark 2/memo 2"
                    }),
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let i = 0; i < transactionSearchObj.length; i++) {
            let internal_id = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[9])
            let transaction_name = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[0])
            let transfer_type = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[1])
            let account = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[2])
            let beneficiary_id = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[3])
            let amount = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[4])
            let charges_type = transactionSearchObj[i].getText(transactionSearchObj[i].columns[5])
            let receiver_bank_code = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[6])
            let receiver_bank_name = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[7])
            let entity_name = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[8])
            let transaction_type = transactionSearchObj[i].getText(transactionSearchObj[i].columns[10])
            let date = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[11])
            let memo = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[12])
            let receiver_cust_type = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[13])
            let receiver_cust_residence = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[14])
            let beneficiary_email = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[15])
            let memo_2 = transactionSearchObj[i].getValue(transactionSearchObj[i].columns[16])

            result.push({
                internal_id: internal_id,
                transaction_name: transaction_name,
                transfer_type: transfer_type,
                account: account,
                beneficiary_id: beneficiary_id,
                amount: Number(Math.abs(amount)).toFixed(0),
                charges_type: charges_type,
                receiver_bank_code: receiver_bank_code,
                receiver_bank_name: receiver_bank_name,
                entity_name: entity_name,
                transaction_type: transaction_type,
                date: date,
                memo: memo,
                memo_2: memo_2,
                receiver_cust_type: receiver_cust_type,
                receiver_cust_residence: receiver_cust_residence,
                beneficiary_email: beneficiary_email,
            })

        }
        log.debug("result", result)
        return result;

    }

    function generateCsv(data, context) {

        log.debug('data', data)

        var csvContent = `"Transaction ID";"Transfer Type";"Debited Account";"Credited Account";"Amount";"Effective Date";"Currency";"Charges Type";"Charges Account";"Remark 1";"Remark 2";"Receiver Bank Code";"Receiver Bank Name";"Receiver Name";"Receiver Cust Type";"Receiver Cust Residence";"Transaction Code";"Beneficiary Email"\r\n`;



        for (let i = 0; i < data.length; i++) {
            csvContent += `${data[i].transaction_display};${data[i].transfer_type};${data[i].debited_account};${data[i].credited_account};${data[i].amount};${data[i].effective_date};${data[i].currency};${data[i].charges_type};${data[i].charges_account};${data[i].remark_1};${data[i].remark_2};${data[i].receiver_bank_code};${data[i].receiver_bank_name};${data[i].receiver_name};${data[i].receiver_cust_type};${data[i].receiver_cust_residence};${data[i].transaction_code};${data[i].beneficiary_email}\r\n`;
        }

        var createCsv = file.create({
            name: 'MAT_csv_report.csv', // Name of the file
            fileType: file.Type.CSV, // Type of the file
            contents: csvContent, // CSV content as a string
            folder: config.csv_folder.csv_mat, // Folder ID where you want to save the file
            description: 'created in: ' + new Date() // Optional description
        });
        var fileId = createCsv.save();

        var filePath = file.load({
            id: fileId
        });

        var pathUrl = filePath.url;

        return pathUrl
    }


    function onRequest(context) {

        let form = getParameters(context);

        let field_account = form.getField({ id: DATA.account });
        let field_currency = form.getField({ id: DATA.currency });
        let field_balance = form.getField({ id: DATA.balance });

        let sublistId = form.getSublist({ id: DATA.sublist });

        let params = context.request.parameters;
        let value_account = params[DATA.account];



        if (context.request.method === 'GET') {
            form.addSubmitButton({ label: 'GET MAT' });
            context.response.writePage(form);
            // form.clientScriptModulePath = 'SuiteScripts/METRODATA/me_sl_cs_settlement_multicurrency_ap.js';

        } else if (context.request.method === 'POST') {

            let load_account = record.load({
                type: "account",
                id: value_account,
            })

            let get_currency = load_account.getValue("currency");
            let get_balance = search.lookupFields({
                type: search.Type.ACCOUNT,
                id: value_account,
                columns: ['balance']
            });

            field_account.defaultValue = value_account
            field_account.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            field_currency.defaultValue = get_currency
            field_currency.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            field_balance.defaultValue = get_balance.balance
            field_balance.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            let checked_trans = [];

            let subCount = context.request.getLineCount({
                group: DATA.sublist,
            })

            for (let i = 0; i < subCount; i++) {
                var is_checked = context.request.getSublistValue({
                    group: DATA.sublist,
                    name: DATA.sublist_checkbox,
                    line: i
                });

                if (is_checked == "true" || is_checked == true || is_checked == "T") {
                    var transaction_id = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_transaction_id,
                        line: i
                    });
                    var transaction_type = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_transaction_type,
                        line: i
                    });
                    var transaction_display = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_transaction_display,
                        line: i
                    });
                    var transfer_type = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_transfer_type,
                        line: i
                    });
                    var debited_account = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_debited_account,
                        line: i
                    });
                    // var benificiary_id = context.request.getSublistValue({
                    //     group: DATA.sublist,
                    //     name: DATA.sublist_benificiary_id,
                    //     line: i
                    // });
                    var credited_account = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_credited_account,
                        line: i
                    });
                    var amount = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_amount,
                        line: i
                    });
                    var effective_date = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_effective_date,
                        line: i
                    });
                    // var transaction_purpose = context.request.getSublistValue({
                    //     group: DATA.sublist,
                    //     name: DATA.sublist_transaction_purpose,
                    //     line: i
                    // });
                    var currency = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_currency,
                        line: i
                    });
                    var charges_type = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_charges_type,
                        line: i
                    });
                    var charges_account = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_charges_account,
                        line: i
                    });
                    var remark_1 = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_remark_1,
                        line: i
                    });
                    var remark_2 = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_remark_2,
                        line: i
                    });
                    var receiver_bank_code = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_receiver_bank_code,
                        line: i
                    });
                    var receiver_bank_name = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_receiver_bank_name,
                        line: i
                    });
                    var receiver_name = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_receiver_name,
                        line: i
                    });
                    var receiver_cust_type = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_receiver_cust_type,
                        line: i
                    });
                    var receiver_cust_residence = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_receiver_cust_residence,
                        line: i
                    });
                    var transaction_code = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_transaction_code,
                        line: i
                    });
                    var beneficiary_email = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_beneficiary_email,
                        line: i
                    });

                    checked_trans.push({
                        transaction_id: transaction_id ? transaction_id : "",
                        transaction_type: transaction_type ? transaction_type : "",
                        transaction_display: transaction_display ? transaction_display : "",
                        transfer_type: transfer_type ? transfer_type : "",
                        debited_account: debited_account ? debited_account : "",
                        // benificiary_id: benificiary_id ? benificiary_id : "",
                        credited_account: credited_account ? credited_account : "",
                        amount: amount,
                        effective_date: effective_date ? effective_date : "",
                        // transaction_purpose: transaction_purpose ? transaction_purpose : "",
                        currency: currency ? currency : "",
                        charges_type: charges_type ? charges_type : "",
                        charges_account: charges_account ? charges_account : "",
                        remark_1: remark_1 ? remark_1 : "",
                        remark_2: remark_2 ? remark_2 : "",
                        receiver_bank_code: receiver_bank_code ? receiver_bank_code : "",
                        receiver_bank_name: receiver_bank_name ? receiver_bank_name : "",
                        receiver_name: receiver_name ? receiver_name : "",
                        receiver_cust_type: receiver_cust_type ? receiver_cust_type : "",
                        receiver_cust_residence: receiver_cust_residence ? receiver_cust_residence : "",
                        transaction_code: transaction_code ? transaction_code : "",
                        beneficiary_email: beneficiary_email ? beneficiary_email : "",
                    })
                }
            }

            if (checked_trans <= 0) {
                let get_transaction = getTransaaction(value_account)

                for (let x = 0; x < get_transaction.length; x++) {

                    log.debug(`get_transaction ${x}`, get_transaction[x])

                    sublistId.setSublistValue({
                        id: DATA.sublist_transaction_id,
                        line: x,
                        value: get_transaction[x].internal_id
                    })
                    sublistId.setSublistValue({
                        id: DATA.sublist_transaction_type,
                        line: x,
                        value: get_transaction[x].transaction_type
                    })
                    sublistId.setSublistValue({
                        id: DATA.sublist_transaction_display,
                        line: x,
                        value: get_transaction[x].transaction_name
                    })
                    if (get_transaction[x].transfer_type) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_transfer_type,
                            line: x,
                            value: get_transaction[x].transfer_type
                        })
                    }
                    if (get_transaction[x].account) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_debited_account,
                            line: x,
                            value: get_transaction[x].account
                        })
                    }
                    // if (get_transaction[x].beneficiary_id) {
                    //     sublistId.setSublistValue({
                    //         id: DATA.sublist_benificiary_id,
                    //         line: x,
                    //         value: get_transaction[x].beneficiary_id
                    //     })

                    // }
                    if (get_transaction[x].beneficiary_id) {

                        sublistId.setSublistValue({
                            id: DATA.sublist_credited_account,
                            line: x,
                            value: get_transaction[x].beneficiary_id
                        })

                    }
                    if (get_transaction[x].amount) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_amount,
                            line: x,
                            value: get_transaction[x].amount
                        })

                    }
                    if (get_transaction[x].date) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_effective_date,
                            line: x,
                            value: get_transaction[x].date
                        })

                    }
                    // sublistId.setSublistValue({
                    //     id: DATA.sublist_effective_date,
                    //     line: x,
                    //     value: "get_transaction[x].internalId"
                    // })
                    // sublistId.setSublistValue({
                    //     id: DATA.sublist_transaction_purpose,
                    //     line: x,
                    //     value: "get_transaction[x].internalId"
                    // })
                    sublistId.setSublistValue({
                        id: DATA.sublist_currency,
                        line: x,
                        value: "IDR"
                    })
                    if (get_transaction[x].charges_type) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_charges_type,
                            line: x,
                            value: get_transaction[x].charges_type
                        })

                    }

                    if (get_transaction[x].account) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_charges_account,
                            line: x,
                            value: get_transaction[x].account
                        })

                    }
                    if (get_transaction[x].memo) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_remark_1,
                            line: x,
                            value: get_transaction[x].memo
                        })

                    }
                    if (get_transaction[x].memo_2) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_remark_2,
                            line: x,
                            value: get_transaction[x].memo_2
                        })

                    }
                    // sublistId.setSublistValue({
                    //     id: DATA.sublist_remark_1,
                    //     line: x,
                    //     value: "get_transaction[x].internalId"
                    // })
                    // sublistId.setSublistValue({
                    //     id: DATA.sublist_remark_2,
                    //     line: x,
                    //     value: "get_transaction[x].internalId"
                    // })

                    if (get_transaction[x].receiver_bank_code) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_receiver_bank_code,
                            line: x,
                            value: get_transaction[x].receiver_bank_code
                        })

                    }

                    if (get_transaction[x].receiver_bank_name) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_receiver_bank_name,
                            line: x,
                            value: get_transaction[x].receiver_bank_name
                        })

                    }

                    if (get_transaction[x].entity_name) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_receiver_name,
                            line: x,
                            value: get_transaction[x].entity_name
                        })

                    }
                    if (get_transaction[x].receiver_cust_type) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_receiver_cust_type,
                            line: x,
                            value: get_transaction[x].receiver_cust_type

                        });
                    }
                    if (get_transaction[x].receiver_cust_residence) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_receiver_cust_residence,
                            line: x,
                            value: get_transaction[x].receiver_cust_residence

                        });
                    }
                    // sublistId.setSublistValue({
                    //     id: DATA.sublist_receiver_cust_type,
                    //     line: x,
                    //     value: "get_transaction[x].receiver_cust_type"
                    // })
                    // sublistId.setSublistValue({
                    //     id: DATA.sublist_receiver_cust_residence,
                    //     line: x,
                    //     value: "get_transaction[x].internalId"
                    // })

                    sublistId.setSublistValue({
                        id: DATA.sublist_transaction_code,
                        line: x,
                        value: 88
                    })
                    if (get_transaction[x].beneficiary_email) {
                        sublistId.setSublistValue({
                            id: DATA.sublist_beneficiary_email,
                            line: x,
                            value: get_transaction[x].beneficiary_email
                        })
                    }
                    // sublistId.setSublistValue({
                    //     id: DATA.sublist_beneficiary_email,
                    //     line: x,
                    //     value: "get_transaction[x].internalId"
                    // })

                }
            }

            log.debug("checked_trans", checked_trans)
            form.addSubmitButton({ label: 'Make Settlement' });

            if (checked_trans.length > 0) {
                for (let i = 0; i < checked_trans.length; i++) {
                    log.debug("checked_trans[i].transaction_type", checked_trans[i].transaction_type)
                    if (checked_trans[i].transaction_type.includes("Check")) {
                        record.submitFields({
                            type: record.Type.CHECK,
                            id: checked_trans[i].transaction_id,
                            values: {
                                'custbodycustbody_me_tf_status_cetak_ma': true,

                            }
                        });
                    }
                    if (checked_trans[i].transaction_type.includes("Bill Payment")) {
                        record.submitFields({
                            type: record.Type.VENDOR_PAYMENT,
                            id: checked_trans[i].transaction_id,
                            values: {
                                'custbodycustbody_me_tf_status_cetak_ma': true,

                            }
                        });
                    }
                }

                let createCsv = generateCsv(checked_trans, context)

                if (createCsv) {
                    var suiteletURL = url.resolveScript({
                        scriptId: 'customscript_me_sl_print_mat',
                        deploymentId: 'customdeploy_me_sl_print_mat',
                        params: null
                    });
                    context.response.write("<h3>Success Download CSV File</h3><a href='" + suiteletURL + "'>Back</a><script type='text/javascript'>window.open('" + createCsv + "','_blank');</script>");
                    /*response.writeFile({
                        file : csvFile
                     });*/
                }
            } else {
                context.response.writePage(form);

            }


        }



    }

    return {
        onRequest: onRequest
    }
});

/**
* @NApiVersion 2.1
* @NScriptType Suitelet
*/

define(['N/ui/serverWidget', 'N/log', 'N/search', 'N/record', 'N/redirect', "N/runtime", "../config/me_config.js"],
    function (serverWidget, log, search, record, redirect, runtime, config) {

        let rec_type = ""

        function roundIfMoreThanTwoDecimals(num) {
            let decimalPart = num.toString().split('.')[1];

            if (decimalPart && decimalPart.length > 2) {
                return Math.round(num * 100) / 100;
            }

            return num;
        }

        function findIndicesByProperty(item, propName, params) {
            let data = item.map((data, index) => data[propName] == params ? index : -1).filter((index_val) => index_val != -1)
            log.debug("findIndicesByProperty", data)
            return data
        }

        function filterForm(context) {

            var form = serverWidget.createForm({
                title: 'Filter Bill Realisasi'
            });

            var typeField = form.addField({
                id: 'custpage_typefield',
                label: 'Type',
                type: serverWidget.FieldType.SELECT,
            });
            var typeUM = form.addField({
                id: 'custpage_type_um',
                label: 'Type UM',
                type: serverWidget.FieldType.SELECT,
            });


            typeField.addSelectOption({
                value: 'check',
                text: 'Check'
            });
            typeField.addSelectOption({
                value: "purchase_order",
                text: "Purchase Order",
            });
            var role39 = runtime.getCurrentUser().role;
            var subsidiaryFilter = role39 == 1355 || role39 == 1337 ? "6" : role39 == 1617 ? "12" : role39 == 1626 ? "12" : ""
            var typeSearch = search.create({
                type: "account",
                filters: [
                    ["subsidiary", "anyof", subsidiaryFilter],
                    "AND",
                    ["custrecord_me_pum", "is", "T"]
                ],
                columns: [
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ],
            });
            var searchResultType = typeSearch.run().getRange({
                start: 0,
                end: 1000
            });
            searchResultType.forEach(function (result) {
                var accountName = result.getValue({ name: "name" });
                var accountId = result.getValue({ name: "internalid" });
                typeUM.addSelectOption({
                    value: accountId,
                    text: accountName
                })
            });

            form.addSubmitButton({
                label: 'GET DATA'
            });
            context.response.writePage(form);

        }
        function filteredResultForm(data) {
            let form = serverWidget.createForm({
                title: 'Automate Bill Realisasi Result'
            });
            var transactionSublist = form.addSublist({
                id: 'custpage_trans_sublist',
                label: 'Transaction List',
                type: serverWidget.SublistType.LIST
            });
            transactionSublist.addField({
                id: "custpage_check",
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Check'
            });
            transactionSublist.addField({
                id: "custpage_check_hidden",
                type: serverWidget.FieldType.CHECKBOX,
                label: 'is Print'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });
            transactionSublist.addField({
                id: 'custpage_pengajuan_number',
                type: serverWidget.FieldType.TEXT,
                label: "Nomor Pengajuan"
            });
            transactionSublist.addField({
                id: 'custpage_pengajuan_number_id',
                type: serverWidget.FieldType.TEXT,
                label: "Nomor Pengajuan"
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: 'custpage_pumnumber_text',
                type: serverWidget.FieldType.TEXT,
                label: "PUM Number"
            });
            transactionSublist.addField({
                id: 'custpage_pumnumber_id',
                type: serverWidget.FieldType.TEXT,
                label: "PUM Number"
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            transactionSublist.addField({
                id: "custpage_datepum",
                type: serverWidget.FieldType.DATE,
                label: "Tanggal PUM"
            });
            transactionSublist.addField({
                id: "custpage_memo",
                type: serverWidget.FieldType.TEXT,
                label: "Memo"
            });
            transactionSublist.addField({
                id: "custpage_dept",
                type: serverWidget.FieldType.TEXT,
                label: "Department"
            });
            transactionSublist.addField({
                id: "custpage_location_text",
                type: serverWidget.FieldType.TEXT,
                label: "Location"
            });
            transactionSublist.addField({
                id: "custpage_type",
                type: serverWidget.FieldType.TEXT,
                label: "Type"
            });
            transactionSublist.addField({
                id: "custpage_type_id",
                type: serverWidget.FieldType.TEXT,
                label: "Type"
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({//using entry/hidden FieldDisplayType to able to edit in ClientScriupt me_sl_cs_automate_bill_v3.js
                id: "custpage_amnt",
                type: serverWidget.FieldType.CURRENCY,
                label: "Amount"
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });
            transactionSublist.addField({ //using entry/hidden FieldDisplayType to able to edit in ClientScriupt me_sl_cs_automate_bill_v3.js
                id: "custpage_outsanding_adv_amount",
                type: serverWidget.FieldType.CURRENCY,
                label: "realisasi"
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            transactionSublist.addField({//using entry/hidden FieldDisplayType to able to edit in ClientScriupt me_sl_cs_automate_bill_v3.js
                id: "custpage_ppn_amount",
                type: serverWidget.FieldType.CURRENCY,
                label: 'PPN Amount'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });
            let wht_field = transactionSublist.addField({
                id: "custpage_wht",
                type: serverWidget.FieldType.SELECT,
                label: 'WHT'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });

            let get_wht = getWhtData();
            wht_field.addSelectOption({
                value: '',
                text: ''
            });

            for (let i = 0; i < get_wht.length; i++) {
                wht_field.addSelectOption({
                    value: get_wht[i].get_internalid,
                    text: get_wht[i].get_wht_description
                });

            }


            let wht_rate = transactionSublist.addField({//using entry/hidden FieldDisplayType to able to edit in ClientScriupt me_sl_cs_automate_bill_v3.js
                id: "custpage_wht_rate",
                type: serverWidget.FieldType.FLOAT,
                label: 'WHT Rate'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });
            let wht_amount = transactionSublist.addField({//using entry/hidden FieldDisplayType to able to edit in ClientScriupt me_sl_cs_automate_bill_v3.js
                id: "custpage_wht_amount",
                type: serverWidget.FieldType.CURRENCY,
                label: 'WHT Amount'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });
            transactionSublist.addField({
                id: "custpage_num_doc_transaksi",
                type: serverWidget.FieldType.TEXT,
                label: 'nomor dokumen transaksi'
            });
            transactionSublist.addField({
                id: "custpage_num_doc_transaksi_type",
                type: serverWidget.FieldType.TEXT,
                label: 'nomor dokumen transaksi TYPE'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_num_doc_transaksi_amount",
                type: serverWidget.FieldType.CURRENCY,
                label: 'nomor dokumen transaksi amount'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_biaya_um_text",
                type: serverWidget.FieldType.TEXT,
                label: data.rec_type === "purchase_order" ? "Akun Bank" : "Biaya UM", // Ubah label berdasarkan tipe transaksi
            });
            transactionSublist.addField({
                id: "custpage_biaya_um_id",
                type: serverWidget.FieldType.TEXT,
                label: data.rec_type === "purchase_order" ? "Akun Bank Id" : "Biaya UM Id", // Ubah label berdasarkan tipe transaksi
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_biaya_um_account",
                type: serverWidget.FieldType.TEXT,
                label: data.rec_type === "purchase_order" ? "Akun Bank" : "Biaya UM", // Ubah label berdasarkan tipe transaksi
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({//using entry/hidden FieldDisplayType to able to edit in ClientScriupt me_sl_cs_automate_bill_v3.js
                id: "custpage_reman_amnt",
                type: serverWidget.FieldType.CURRENCY,
                label: " Remaining Amount "
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });
            transactionSublist.addField({//this is for hidden value for CS purposes
                id: "custpage_reman_amnt_hidden",
                type: serverWidget.FieldType.CURRENCY,
                label: " Remaining Amount Hidden"
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_biaya_id",
                type: serverWidget.FieldType.TEXT,
                label: " biaya id "
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_uang_muka_id",
                type: serverWidget.FieldType.TEXT,
                label: " uang muka id "
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_dept_id",
                type: serverWidget.FieldType.TEXT,
                label: "departemen id "
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_class_id",
                type: serverWidget.FieldType.TEXT,
                label: "class id "
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_location_id",
                type: serverWidget.FieldType.TEXT,
                label: "location id "
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_budget_hid",
                type: serverWidget.FieldType.TEXT,
                label: "budget Hidden "
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_budget_avail_hid",
                type: serverWidget.FieldType.TEXT,
                label: "budget avail Hidden "
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_detail_data",
                type: serverWidget.FieldType.TEXTAREA,
                label: "Detail Data"
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            transactionSublist.addField({
                id: "custpage_line_unique_key",
                type: serverWidget.FieldType.TEXTAREA,
                label: "Line Unique Key(LINE)"
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            return form;

        }
        function confimationForm(context, data) {
            // Create a new form for the confirmation page
            var confirmationForm = serverWidget.createForm({
                title: 'Journal Entry Created'
            });

            // Add a message field to show the journal entry number
            var numbersHtml = data.map(item => `<li>PO ${item.pum_number} -> JE ${item.je_number_text}</li>`).join('')
            //  ubah array
            confirmationForm.addField({
                id: 'custpage_confirmation',
                type: serverWidget.FieldType.INLINEHTML,
                label: ' '
            }).defaultValue = `<h2>Journal Entry Created: ${numbersHtml} </h2>`;

            // Display the confirmation form
            context.response.writePage(confirmationForm)
        }

        function getWhtData() {

            let result = []

            var get_wht_data = search.create({
                type: "customrecord_4601_witaxcode",
                filters:
                    [
                        ["custrecord_4601_wtc_subsidiaries", "anyof", "6"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "scriptid", label: "Script ID" }),
                        search.createColumn({ name: "custrecord_4601_wtc_description", label: "Description" }),
                        search.createColumn({ name: "custrecord_4601_wtc_rate", label: "Rate" }),
                        search.createColumn({
                            name: "custrecord_4601_wtt_purcaccount",
                            join: "CUSTRECORD_4601_WTC_WITAXTYPE",
                            label: "Liability/Purchase Tax Account"
                        }),
                        search.createColumn({ name: "custrecord_4601_wtc_witaxtype", label: "Withholding Tax Type" }),
                        search.createColumn({ name: "custrecord_ph4014_wtax_code_country", label: "Country Code" }),
                        search.createColumn({ name: "custrecord_4601_wtc_name", label: "Name" }),
                        search.createColumn({ name: "custrecord_4601_wtc_percentageofbase", label: "Percentage of Base" }),
                        search.createColumn({ name: "custrecord_4601_wtc_amountthresholds", label: "Amount Thresholds" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                    ]
            }).run().getRange({
                start: 0,
                end: 1000,
            });

            for (let i = 0; i < get_wht_data.length; i++) {
                let get_wht_description = get_wht_data[i].getValue("custrecord_4601_wtc_description");
                let get_internalid = get_wht_data[i].getValue("internalid");
                let account = get_wht_data[i].getValue({ name: "custrecord_4601_wtt_purcaccount", join: "CUSTRECORD_4601_WTC_WITAXTYPE" });

                result.push({
                    get_wht_description: get_wht_description,
                    get_internalid: get_internalid,
                    account: account,
                })

            }
            return result;
        }

        function onRequest(context) {
            let role = runtime.getCurrentUser().role;

            let get_wht_data = getWhtData()
            if (context.request.method === 'GET') {

                let form_filter = filterForm(context);

            } else { // POST request handling
                let req_param = context.request.parameters;
                let recType = req_param.custpage_typefield;
                let umType = req_param.custpage_type_um;


                log.debug("role", role)
                let subsidiary;

                let parameter_data = {
                    rec_type: recType,
                    um_type: umType
                }
                rec_type = parameter_data.rec_type

                let po_je_arr = []


                if (config.ROLE.SANDBOX.ASL_USER.includes(role)) {
                    parameter_data.subsidiary = config.SUBSIDIARY.SANDBOX.ASL
                } else if (config.ROLE.SANDBOX.JBA_USER.includes(role)) {
                    parameter_data.subsidiary = config.SUBSIDIARY.SANDBOX.JBA
                }

                log.debug("parameter_data", parameter_data)

                let form_filter_result = filteredResultForm(parameter_data);
                if (parameter_data.rec_type === 'check') {
                    let get_journal = getJournal();
                    let get_pum_data = getPumDataCheck(parameter_data, get_journal);
                    let get_nomor_doc = getNomorDocCheck(get_pum_data, parameter_data);
                    let populate_data = populateDataCheck(form_filter_result, get_nomor_doc); //input data ke tabel
                }
                if (parameter_data.rec_type === 'purchase_order') {
                    let get_po_pum_jba = getPoPum(parameter_data)
                    let get_journal = getJournal();
                    log.debug("get_journal", get_journal)
                    let get_pum_data = getPumDataPo(parameter_data, get_journal, get_po_pum_jba);
                    let combine_duplicate_pum = combinePumDuplicate(get_pum_data, parameter_data)
                    let get_nomor_doc = getNomorDocPo(combine_duplicate_pum, parameter_data);
                    let populate_data = populateDataPo(form_filter_result, get_nomor_doc); //input data ke tabel
                }


                form_filter_result.addSubmitButton({
                    id: 'submitCreate',
                    label: 'Submit'
                });

                var lineCount = context.request.getLineCount({
                    group: 'custpage_trans_sublist'
                })


                let checked_array = []
                for (let i = 0; i < lineCount; i++) {
                    let isChecked = context.request.getSublistValue({
                        group: 'custpage_trans_sublist',
                        line: i,
                        name: 'custpage_check'
                    })
                    let isCheckedHidden = context.request.getSublistValue({
                        group: 'custpage_trans_sublist',
                        line: i,
                        name: 'custpage_check_hidden'
                    })

                    if (isCheckedHidden === 'T') {
                        let amount_um = parseFloat(context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_amnt',
                            line: i
                        }));
                        let amount_advance = parseFloat(context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_outsanding_adv_amount',
                            line: i
                        }));
                        let amount_titipan = parseFloat(context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_reman_amnt',
                            line: i
                        }));
                        let amount_titipan_hidden = parseFloat(context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_reman_amnt_hidden',
                            line: i
                        }));
                        let PumRealisasi = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_pumnumber_text',
                            line: i
                        });
                        let PumRealisasiId = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_pumnumber_id',
                            line: i
                        });
                        let pengajuanNumber = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_pengajuan_number',
                            line: i
                        });
                        let pengajuanNumberId = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_pengajuan_number_id',
                            line: i
                        });
                        let memomain = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_memo',
                            line: i
                        });
                        let PUMTanggal = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_datepum',
                            line: i
                        });
                        let item_um_amount = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_biaya_um_text',
                            line: i
                        });
                        let item_um_amount_id = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_biaya_um_id',
                            line: i
                        });
                        let account_um_amount_id = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_biaya_um_account',
                            line: i
                        });
                        let account_advance_text = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_type',
                            line: i
                        });
                        let account_advance_id = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_type_id',
                            line: i
                        });
                        let ppnAmount = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_ppn_amount',
                            line: i
                        });
                        let wht = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_wht',
                            line: i
                        });
                        // log.debug("wht", wht)

                        let get_wht_index = get_wht_data.findIndex((data) => data.get_internalid == wht);
                        let wht_account = get_wht_index != -1 ? get_wht_data[get_wht_index].account : null;
                        let whtAmount = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_wht_amount',
                            line: i
                        });

                        let check_deposit_amount = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_num_doc_transaksi_amount',
                            line: i
                        })
                        let check_deposit_type = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_num_doc_transaksi_type',
                            line: i
                        })
                        let departId = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_dept_id',
                            line: i
                        })
                        let classId = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_class_id',
                            line: i
                        })
                        let locationId = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_location_id',
                            line: i
                        })
                        let line_unique_key = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_line_unique_key',
                            line: i
                        })
                        let get_entity = search.lookupFields({
                            type: search.Type.PURCHASE_ORDER,
                            id: PumRealisasiId,
                            columns: ['entity']
                        });

                        let detail_data = context.request.getSublistValue({
                            group: 'custpage_trans_sublist',
                            name: 'custpage_detail_data',
                            line: i
                        });

                        if (checked_array.some((data) => data.pengajuanNumberId == pengajuanNumberId)) {
                            // if (checked_array.some((data) => data.PumRealisasiId == PumRealisasiId)) {
                            let get_index = checked_array.findIndex((data) => data.pengajuanNumberId == pengajuanNumberId)
                            whtAmount ? checked_array[get_index].whtAmount += Number(whtAmount) : ""
                            whtAmount ? checked_array[get_index].amount_titipan_hidden -= Number(whtAmount) : ""
                            whtAmount ? (checked_array[get_index].wht_list).push({
                                wht_account: wht_account,
                                whtAmount: whtAmount,
                            }) : "";
                            checked_array[get_index].line.push(...JSON.parse(detail_data))
                            checked_array[get_index].PumRealisasi.some((data)=>data == PumRealisasi)?"":checked_array[get_index].PumRealisasi.push(PumRealisasi)
                            checked_array[get_index].PumRealisasiId.some((data)=>data == PumRealisasiId)?"":checked_array[get_index].PumRealisasiId.push(PumRealisasiId)
                        } else {
                            checked_array.push({
                                amount_um: Math.abs(amount_um),
                                amount_advance: Math.abs(amount_advance),
                                // amount_advance: Math.abs(amount_advance),
                                // amount_titipan: amount_titipan,
                                // amount_titipan_hidden: Number(amount_titipan_hidden),
                                amount_titipan_hidden: Number(whtAmount) != 0 ? Number(whtAmount) - Math.abs(amount_titipan_hidden) : Number(amount_titipan_hidden),
                                item_um_amount: item_um_amount,
                                item_um_amount_id: item_um_amount_id,
                                account_um_amount_id: account_um_amount_id,
                                account_advance_id: account_advance_id,
                                account_advance_text: account_advance_text,
                                account_titipan_id: config.ROLE.SANDBOX.ASL_USER.includes(role) ? config.ACCOUNT_TITIPAN.PRODUCTION.ASL : config.ACCOUNT_TITIPAN.PRODUCTION.JBA,
                                ppnAmount: Number(ppnAmount),
                                wht: wht,
                                wht_account: wht_account,
                                wht_list: wht_account != null ? [{
                                    wht_account: wht_account,
                                    whtAmount: whtAmount,
                                }] : [],
                                whtAmount: Number(whtAmount),
                                PumRealisasi: [PumRealisasi],
                                PumRealisasiId: [PumRealisasiId],
                                pengajuanNumber: pengajuanNumber,
                                pengajuanNumberId: pengajuanNumberId,
                                memomain: memomain,
                                PUMTanggal: PUMTanggal,
                                check_deposit_type: check_deposit_type,
                                check_deposit_amount: Number(check_deposit_amount),
                                departId: departId,
                                classId: classId,
                                locationId: locationId,
                                line_unique_key: line_unique_key,
                                entity_text: get_entity.entity[0].text,
                                entity_value: get_entity.entity[0].value,
                                line: JSON.parse(detail_data),
                            })

                        }

                    }

                }
                log.debug("checked_array", checked_array)
                let checked_arr_new = checked_array
                // for (let i = 0; i < checked_array.length; i++) {
                //     let filter_dup_realisasi = checked_arr_new.some((data) => data.PumRealisasiId == checked_array[i].PumRealisasiId)
                //     if (filter_dup_realisasi) {
                //         let find_index = checked_arr_new.findIndex((data) => data.PumRealisasiId == checked_array[i].PumRealisasiId)
                //         checked_arr_new[find_index].whtAmount += Number(checked_array[i].whtAmount)
                //         checked_arr_new[find_index].amount_titipan_hidden -= Number(checked_array[i].whtAmount)
                //         checked_arr_new[find_index].line.push(...checked_array[i].line)
                //     } else {
                //         checked_arr_new.push(checked_array[i])
                //     }

                // }


                let journal_form = null;

                if (runtime.getCurrentUser().subsidiary == 6) {
                    journal_form = 149
                }
                if (runtime.getCurrentUser().subsidiary == 12) {
                    journal_form = 173
                }
                if (runtime.getCurrentUser().subsidiary == 22) {
                    journal_form = 192
                }

                log.debug("checked_arr_new", checked_arr_new)
                for (let i = 0; i < checked_arr_new.length; i++) {



                    var jeRecord = record.create({
                        type: record.Type.JOURNAL_ENTRY,
                        isDynamic: true
                    });

                    jeRecord.setValue({
                        fieldId: 'customform',
                        value: journal_form,
                    });
                    jeRecord.setValue({
                        fieldId: 'subsidiary',
                        value: parameter_data.subsidiary,
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_asl_pumnumber',
                        value: checked_arr_new[i].pengajuanNumberId
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_me_realisasi_number',
                        value: checked_arr_new[i].PumRealisasiId[0]
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_me_multi_realisasi_number',
                        value: checked_arr_new[i].PumRealisasiId
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody10',
                        value: 2
                    });
                    jeRecord.setValue({
                        fieldId: 'approvalstatus',
                        value: 2,
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_me_asl_type_je',
                        value: 7,// Journal Uang Muka Lainnya(7), Journal HC(4)
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_asl_journal_category',
                        value: 2,// Non Unit
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_me_asl_uangtitip_checkbox',
                        value: 1,// Settlement
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_me_asl_settlement_um_pembelia',
                        value: 1,// Settlement
                    });

                    // jeRecord.setValue({ //for testing purposes
                    //     fieldId: 'trandate',
                    //     value: new Date('2024-05-14')
                    // });
                    jeRecord.setValue({
                        fieldId: 'memo',
                        value: checked_arr_new[i].memomain
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_asl_accountadvance',
                        value: checked_arr_new[i].account_advance_id
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_asl_pumnumtext',
                        value: checked_arr_new[i].PumRealisasi[0]
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_me_date_pum',
                        value: checked_arr_new[i].PUMTanggal
                    });
                    jeRecord.setValue({
                        fieldId: 'custbody_me_pum_name',
                        value: checked_arr_new[i].entity_text
                    });

                    let total_um_amount = 0
                    for (let j = 0; j < checked_arr_new[i].line.length; j++) {
                        // log.debug("account_um", checked_arr_new[i].line[j].grossamount)
                        // log.debug("rec_type", rec_type == 'purchase_order')
                        // log.debug("parameter_data.rec_type", parameter_data.rec_type == 'purchase_order')
                        // log.debug("account_um with rec_type validation", parameter_data.rec_type == 'purchase_order' ? checked_arr_new[i].line[j].grossamount : checked_arr_new[i].line[j].amount)
                        jeRecord.selectNewLine('line'); //set Amount Um (Debit)

                        let set_account_um = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: checked_arr_new[i].line[j].item_expenseaccount_um
                        });
                        let set_memo_um = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: checked_arr_new[i].line[j].memo
                        });
                        let set_name = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: checked_arr_new[i].entity_value
                        });
                        let set_class_um = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: checked_arr_new[i].line[j].class_
                        });
                        let set_department_um = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: checked_arr_new[i].line[j].department
                        });
                        let set_location_um = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: checked_arr_new[i].line[j].location
                        });
                        let set_ammount_um = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: checked_arr_new[i].line[j].grossamount,
                        });
                        total_um_amount += Number(checked_arr_new[i].line[j].grossamount)
                        jeRecord.commitLine('line');
                    }

                    log.debug("total_amount", total_um_amount)
                    if (checked_arr_new[i].amount_titipan_hidden != 0 || checked_arr_new[i].check_deposit_amount != 0) {//set Amount titipan/ remaining amount (Debit atau credit, tergantung amount titipan bernilai minus atau tidak)

                        // log.debug("account_titipan", Math.abs(checked_arr_new[i].check_deposit_amount))
                        // log.debug("account_titipan debit or credit", (checked_arr_new[i].check_deposit_type) == "deposit" ? 'debit' : 'credit')
                        jeRecord.selectNewLine('line');
                        let set_account_titipan = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: checked_arr_new[i].account_titipan_id
                        });
                        let set_memo_titipan = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: checked_arr_new[i].memomain
                        });
                        let set_name = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: checked_arr_new[i].entity_value
                        });
                        let set_class_titipan = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: checked_arr_new[i].classId
                        });
                        let set_department_titipan = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: checked_arr_new[i].departId
                        });
                        let set_location_titipan = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: checked_arr_new[i].locationId
                        });
                        if (checked_arr_new[i].check_deposit_amount) {
                            let set_ammount_titipan = jeRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                // fieldId: checked_arr_new[i].check_deposit_type == "deposit" ? 'debit' : 'credit',
                                fieldId: Number(total_um_amount) > Number(checked_arr_new[i].amount_advance) ? 'credit' : 'debit',
                                value: Math.abs(Number(checked_arr_new[i].check_deposit_amount) - Number(checked_arr_new[i].amount_titipan_hidden))
                            });

                        } else {
                            let set_ammount_titipan = jeRecord.setCurrentSublistValue({
                                sublistId: 'line',
                                // fieldId: checked_arr_new[i].check_deposit_type == "deposit" ? 'debit' : 'credit',
                                fieldId: (checked_arr_new[i].amount_titipan_hidden > 0) ? 'debit' : 'credit',
                                value: Math.abs(Number(checked_arr_new[i].amount_titipan_hidden) - Number(checked_arr_new[i].check_deposit_amount))
                            });

                        }
                        jeRecord.commitLine('line');
                    }
                    jeRecord.selectNewLine('line'); // set amount advance/realisasi(credit)
                    log.debug("account_advance", Math.abs(checked_arr_new[i].amount_advance))
                    let set_account_advance = jeRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: checked_arr_new[i].account_advance_id
                    });
                    let set_memo_advance = jeRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        value: checked_arr_new[i].memomain
                    });
                    let set_name = jeRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: checked_arr_new[i].entity_value
                    });
                    let set_class_advance = jeRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'class',
                        value: checked_arr_new[i].classId
                    });
                    let set_department_advance = jeRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department',
                        value: checked_arr_new[i].departId
                    });
                    let set_location_advance = jeRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'location',
                        value: checked_arr_new[i].locationId
                    });
                    let set_ammount_advance = jeRecord.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: checked_arr_new[i].amount_advance
                    });
                    jeRecord.commitLine('line');

                    if (checked_arr_new[i].whtAmount != 0 && !isNaN(checked_arr_new[i].whtAmount)) {
                        jeRecord.selectNewLine('line'); // set amount wht (credit)
                        let set_account_wht = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: checked_arr_new[i].wht_account
                        });
                        let set_memo_wht = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: checked_arr_new[i].memomain
                        });
                        let set_name = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: checked_arr_new[i].entity_value
                        });
                        let set_class_wht = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: checked_arr_new[i].classId
                        });
                        let set_department_wht = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: checked_arr_new[i].departId
                        });
                        let set_location_wht = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: checked_arr_new[i].locationId
                        });
                        let set_ammount_wht = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: checked_arr_new[i].whtAmount
                        });
                        jeRecord.commitLine('line');
                    }

                    if (checked_arr_new[i].ppnAmount != 0 && !isNaN(checked_arr_new[i].ppnAmount)) {
                        jeRecord.selectNewLine('line'); // set amount wht (credit)
                        let set_account_ppn = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: config.ACCOUNT_PPN.SANDBOX
                        });
                        let set_memo_ppn = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'memo',
                            value: checked_arr_new[i].memomain
                        });
                        let set_name = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'entity',
                            value: checked_arr_new[i].entity_value
                        });
                        let set_class_ppn = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: checked_arr_new[i].classId
                        });
                        let set_department_ppn = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: checked_arr_new[i].departId
                        });
                        let set_location_ppn = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: checked_arr_new[i].locationId
                        });
                        let set_ammount_ppn = jeRecord.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: Math.abs(checked_arr_new[i].ppnAmount)
                        });
                        jeRecord.commitLine('line');

                    }

                    let saveJe = jeRecord.save()

                    po_je_arr.push({
                        pum_number: checked_array[i].PumRealisasi,
                        je_number_text: null,
                        je_number: saveJe,
                    })



                }

                if (po_je_arr.length > 0) {
                    log.debug("po_je_arr", po_je_arr)
                    let get_je_tranid = getJeTranid(po_je_arr)
                    confimationForm(context, get_je_tranid)

                } else {

                    context.response.writePage(form_filter_result);
                }
                form_filter_result.clientScriptModulePath = 'SuiteScripts/METRODATA/Automate bill v3.3/me_sl_cs_automate_bill_v3_3.js';

            }
        }

        function getJournal() {
            let result_data = []
            var jurSearch = search.create({
                type: "journalentry",
                filters: [
                    ["type", "anyof", "Journal"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["taxline", "is", "F"],
                    "AND",
                    ["custbody_me_realisasi_number", "noneof", "@NONE@"],
                ],
                columns:
                    [
                        search.createColumn({ name: "custbody_me_realisasi_number", label: "ME - Realisasi Number(Record)" }),
                        search.createColumn({name: "custbody_me_multi_realisasi_number", label: "ME - Multi Realisasi Number (Record)"}),
                    ]
            });

            let pagedResults = jurSearch.runPaged({ pageSize: 1000 });

            pagedResults.pageRanges.forEach(function (pageRange) {
                let page = pagedResults.fetch({ index: pageRange.index });
                page.data.forEach(function (result) {
                    let custbody_me_realisasi_number = result.getValue({ name: 'custbody_me_realisasi_number' });
                    let custbody_me_multi_realisasi_number = result.getValue({ name: 'custbody_me_multi_realisasi_number' });

                    log.debug({
                        custbody_me_realisasi_number:custbody_me_realisasi_number,
                        custbody_me_multi_realisasi_number:custbody_me_multi_realisasi_number
                    })

                    if (!result_data.includes(custbody_me_realisasi_number)) {
                        !custbody_me_multi_realisasi_number?result_data.push(custbody_me_realisasi_number):result_data.push(...(custbody_me_multi_realisasi_number.split(",").map((data)=>data)))

                    }
                });
            });
            return result_data;
        }

        function getJeTranid(data_confirmation) {

            let je_id_arr = []

            let get_je_id = data_confirmation.forEach(data => {
                je_id_arr.push(data.je_number)
            });

            var je_name_search = search.create({
                type: "journalentry",
                filters: [
                    ["type", "anyof", "Journal"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["internalid", "anyof", je_id_arr],
                ],
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "tranid", label: "TranIsacton Name" }),
                    ]
            }).run().getRange({
                start: 0,
                end: 1000
            });

            for (let i = 0; i < je_name_search.length; i++) {
                let internal_id = je_name_search[i].getValue({ name: 'internalid' });
                let tranid = je_name_search[i].getValue({ name: 'tranid' });

                log.debug("result", {
                    internal_id: internal_id,
                    tranid: tranid
                })

                let get_data_confirmation_index = data_confirmation.findIndex((data) => data.je_number == internal_id)

                log.debug("get_data_confirmation_index", get_data_confirmation_index)

                data_confirmation[get_data_confirmation_index].je_number_text = tranid;

            }
            return data_confirmation;

        }

        //===========================rec.type is Check========================================

        function getPumDataCheck(parameter_data, get_journal) {
            log.debug("parameter_data.subsidiary]", parameter_data.subsidiary)

            let result_data = []

            let filter = [
                ["subsidiary", "anyof", parameter_data.subsidiary],
                "AND",
                ["customform", "anyof", parameter_data.subsidiary == config.SUBSIDIARY.SANDBOX.ASL ? "148" : "189"],
                "AND",
                ["type", "anyof", "PurchOrd"],
                "AND",
                ["voided", "is", "F"],
                "AND",
                ["mainline", "is", "F"],
                "AND",
                ["taxline", "is", "F"],
                "AND",
                ["memomain", "isnotempty", ""],
                "AND",
                ["custbody_asl_pumnumtext", "startswith", "CHCK"],

                "AND",
                ["status", "anyof", "PurchOrd:H"],
                "AND",
                ["custbody_me_jba_account_advance_1", "anyof", parameter_data.um_type],

            ]

            if (get_journal.length > 0) {
                filter.push("AND",
                    ["custbody_me_realisasi_number", "noneof", get_journal],)
            }


            var checkSearch = search.create({
                type: "purchaseorder",
                filters: filter,
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "item", label: "Item" }),
                        search.createColumn({ name: "memomain", label: "Memo (Main)" }),
                        search.createColumn({ name: "trandate", label: "Date" }),
                        search.createColumn({ name: "custbody_me_jba_full_amt_adv_1", label: "ME - Full Amount Advance" }),
                        search.createColumn({ name: "custbody_me_full_amnt_realisasi", label: "JBA - FULL AMOUNT REALISASI" }),
                        search.createColumn({ name: "department", label: "Department" }),
                        search.createColumn({ name: "custbody_me_jba_account_advance_1", label: "ME - Account Advance" }),
                        search.createColumn({ name: "memo", label: "Memo" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                        search.createColumn({ name: "custbody_asl_pumnumtext", label: "ASL - PUM Number (Text)" }),
                        search.createColumn({ name: "custbody_asl_outstandingadv", label: "ASL - Full Amount Advance" }),
                        search.createColumn({ name: "taxcode", label: "Tax Item" }),
                        search.createColumn({ name: "taxamount", label: "Amount (Tax)" }),
                        search.createColumn({ name: "custcol_me_budget_id_record_po", label: "ME - Budget# PO" }),
                        search.createColumn({ name: "custcol_me_line_budget_available", label: "Budget Available" }),
                        search.createColumn({ name: "custbody_asl_pumnumber", label: "ASL - PUM Number" }),
                        search.createColumn({ name: "location", label: "Location" }),
                        search.createColumn({ name: "grossamount", label: "Amount (Gross)" }),
                        search.createColumn({ name: "class", label: "Class" }),
                        search.createColumn({ name: "taxamount", label: "Tax Amount" }),
                        search.createColumn({
                            name: "expenseaccount",
                            join: "item",
                            label: "Expense/COGS Account"
                        }),
                        search.createColumn({ name: "lineuniquekey", label: "Line Unique Key" }),
                        search.createColumn({ name: "custbody_me_realisasi_number_multi", label: "ME - ME - Multi Realisasi Number (Record)" }),
                    ]
            });
            let pagedResults = checkSearch.runPaged({ pageSize: 1000 });

            pagedResults.pageRanges.forEach(function (pageRange) {
                let page = pagedResults.fetch({ index: pageRange.index });
                page.data.forEach(function (result) {
                    let internalid = result.getValue({ name: 'internalid' });
                    let tranid = result.getValue({ name: 'tranid' });
                    let item = result.getText({ name: 'item' });
                    let item_id = result.getValue({ name: 'item' });
                    let memomain = result.getValue({ name: 'memomain' });
                    let trandate = result.getValue({ name: 'trandate' });
                    let custbody_me_jba_full_amt_adv_1 = result.getValue({ name: 'custbody_me_jba_full_amt_adv_1' });
                    let custbody_me_full_amnt_realisasi = result.getValue({ name: 'custbody_me_full_amnt_realisasi' });
                    let department = result.getValue({ name: 'department' });
                    let department_text = result.getText({ name: 'department' });
                    let custbody_me_jba_account_advance_1 = result.getText({ name: 'custbody_me_jba_account_advance_1' });
                    let custbody_me_jba_account_advance_1_id = result.getValue({ name: 'custbody_me_jba_account_advance_1' });
                    let memo = result.getValue({ name: 'memo' });
                    let amount = result.getValue({ name: 'amount' });
                    let custbody_asl_pumnumtext = result.getValue({ name: 'custbody_asl_pumnumtext' });
                    let custbody_asl_outstandingadv = result.getValue({ name: 'custbody_asl_outstandingadv' });
                    let taxcode = result.getValue({ name: 'taxcode' });
                    let taxamount = result.getValue({ name: 'taxamount' });
                    let custcol_me_budget_id_record_po = result.getValue({ name: 'custcol_me_budget_id_record_po' });
                    let custcol_me_line_budget_available = result.getValue({ name: 'custcol_me_line_budget_available' });
                    let custbody_asl_pumnumber = result.getValue({ name: 'custbody_asl_pumnumber' });
                    let location = result.getValue({ name: 'location' });
                    let location_text = result.getText({ name: 'location' });
                    let grossamount = result.getValue({ name: 'grossamount' });
                    let class_ = result.getValue({ name: 'class' });
                    let class_text = result.getText({ name: 'class' });
                    let item_expenseaccount_um = result.getValue({ name: 'expenseaccount', join: "item" });
                    let line_unique_key = result.getValue({ name: 'lineuniquekey', join: "Line Unique Key" });


                    if (result_data.some((data) => data.internalid == internalid)) {
                        let get_index = result_data.findIndex((data) => data.internalid == internalid)
                        result_data[get_index].total_amount += Number(amount)
                        result_data[get_index].total_taxamount += Number(taxamount)
                        result_data[get_index].total_grossamount += Number(grossamount)
                        result_data[get_index].custbody_me_full_amnt_realisasi -= (parameter_data.rec_type === 'purchase_order' ? Number(grossamount) : Number(amount))
                        result_data[get_index].line.push({
                            item: item,
                            item_id: item_id,
                            item_expenseaccount_um: item_expenseaccount_um,
                            // memomain: memomain,
                            // trandate: trandate,
                            custbody_me_jba_full_amt_adv_1: custbody_me_jba_full_amt_adv_1,
                            custbody_me_full_amnt_realisasi: Number(custbody_me_full_amnt_realisasi),
                            department: department,
                            department_text: department_text,
                            // custbody_me_jba_account_advance_1: custbody_me_jba_account_advance_1,
                            // custbody_me_jba_account_advance_1_id: custbody_me_jba_account_advance_1_id,
                            memo: memo,
                            amount: Number(amount),
                            // custbody_asl_pumnumtext: custbody_asl_pumnumtext,
                            custbody_asl_outstandingadv: Number(custbody_asl_outstandingadv),
                            taxcode: taxcode,
                            taxamount: Number(taxamount),
                            custcol_me_budget_id_record_po: custcol_me_budget_id_record_po,
                            custcol_me_line_budget_available: custcol_me_line_budget_available,
                            // custbody_asl_pumnumber: custbody_asl_pumnumber,
                            // doc_number: null,
                            // doc_number_amount: 0,
                            location: location,
                            location_text: location_text,
                            grossamount: Number(grossamount),
                            class_: class_ ? class_ : config.CLASS_NONE,
                            class_text: class_text,
                            line_unique_key: line_unique_key,
                        })
                    } else {
                        result_data.push({
                            internalid: internalid,
                            tranid: tranid,
                            item: item,
                            trandate: trandate,
                            custbody_asl_outstandingadv: Number(custbody_asl_outstandingadv),
                            custbody_me_full_amnt_realisasi: Number(custbody_asl_outstandingadv) - (parameter_data.rec_type === 'purchase_order' ? Number(grossamount) : Number(amount)),
                            custbody_asl_pumnumtext: custbody_asl_pumnumtext,
                            custbody_asl_pumnumber: custbody_asl_pumnumber,
                            custbody_me_jba_account_advance_1: custbody_me_jba_account_advance_1,
                            custbody_me_jba_account_advance_1_id: custbody_me_jba_account_advance_1_id,
                            memomain: memomain,
                            department: department,
                            department_text: department_text,
                            location: location,
                            location_text: location_text,
                            class_: class_ ? class_ : config.CLASS_NONE,
                            total_amount: Number(amount),
                            doc_number: null,
                            doc_number_amount_total: 0,
                            total_taxamount: Number(taxamount),
                            total_grossamount: Number(grossamount),
                            line: [{
                                item: item,
                                item_id: item_id,
                                item_expenseaccount_um: item_expenseaccount_um,
                                // trandate: trandate,
                                custbody_me_jba_full_amt_adv_1: custbody_me_jba_full_amt_adv_1,
                                custbody_me_full_amnt_realisasi: Number(custbody_asl_outstandingadv) - (parameter_data.rec_type === 'purchase_order' ? Number(grossamount) : Number(amount)),
                                department: department,
                                department_text: department_text,
                                // custbody_me_jba_account_advance_1: custbody_me_jba_account_advance_1,
                                // custbody_me_jba_account_advance_1_id: custbody_me_jba_account_advance_1_id,
                                memo: memo,
                                amount: Number(amount),
                                // custbody_asl_pumnumtext: custbody_asl_pumnumtext,
                                custbody_asl_outstandingadv: Number(custbody_asl_outstandingadv),
                                taxcode: taxcode,
                                taxamount: Number(taxamount),
                                custcol_me_budget_id_record_po: custcol_me_budget_id_record_po,
                                custcol_me_line_budget_available: custcol_me_line_budget_available,
                                // custbody_asl_pumnumber: custbody_asl_pumnumber,
                                // doc_number: null,
                                // doc_number_amount: 0,
                                location: location,
                                location_text: location_text,
                                grossamount: Number(grossamount),
                                class_: class_ ? class_ : config.CLASS_NONE,
                                class_text: class_text,
                                line_unique_key: line_unique_key,
                            }],
                        })
                    }
                    // result_data.push({
                    //     internalid: internalid,
                    //     tranid: tranid,
                    //     item: item,
                    //     item_id: item_id,
                    //     item_expenseaccount_um: item_expenseaccount_um,
                    //     memomain: memomain,
                    //     trandate: trandate,
                    //     custbody_me_jba_full_amt_adv_1: custbody_me_jba_full_amt_adv_1,
                    //     custbody_me_full_amnt_realisasi: Number(custbody_me_full_amnt_realisasi),
                    //     department: department,
                    //     department_text: department_text,
                    //     custbody_me_jba_account_advance_1: custbody_me_jba_account_advance_1,
                    //     custbody_me_jba_account_advance_1_id: custbody_me_jba_account_advance_1_id,
                    //     memo: memo,
                    //     amount: Number(amount),
                    //     custbody_asl_pumnumtext: custbody_asl_pumnumtext,
                    //     custbody_asl_outstandingadv: Number(custbody_asl_outstandingadv),
                    //     taxcode: taxcode,
                    //     taxamount: Number(taxamount),
                    //     custcol_me_budget_id_record_po: custcol_me_budget_id_record_po,
                    //     custcol_me_line_budget_available: custcol_me_line_budget_available,
                    //     custbody_asl_pumnumber: custbody_asl_pumnumber,
                    //     doc_number: null,
                    //     doc_number_amount: 0,
                    //     location: location,
                    //     location_text: location_text,
                    //     grossamount: Number(grossamount),
                    //     class_: class_ ? class_ : config.CLASS_NONE,
                    //     class_text: class_text,
                    // })
                });
            });
            return result_data
        }

        function getNomorDocCheck(pum_data, parameter_data) {// untuk mencari value pada kolom "Nomor Dokumen"

            let pum_deposit = [] //if custbody_me_full_amnt_realisasi < 0
            let pum_check = []// if custbody_me_full_amnt_realisasi > 0

            log.debug("pum_data", pum_data)

            pum_data.forEach(data => {
                if (data.custbody_me_full_amnt_realisasi < data.custbody_asl_outstandingadv && !pum_deposit.some((data_depo) => data_depo == data.custbody_asl_pumnumber)) {
                    pum_deposit.push(data.custbody_asl_pumnumber)
                    // log.debug("data.custbody_asl_pumnumber",data.custbody_asl_pumnumber)
                } else if (data.custbody_me_full_amnt_realisasi > data.custbody_asl_outstandingadv && !pum_check.some((data_check) => data_check == data.custbody_asl_pumnumber)) {
                    pum_check.push(data.custbody_asl_pumnumber)
                    // log.debug("data.custbody_asl_pumnumber",data.custbody_asl_pumnumber)
                }
            });

            let get_deposit = getDeposit(pum_deposit, parameter_data);
            let get_check = getCheck(pum_check, parameter_data);

            let input_depo_check_to_parent_data = combine(get_deposit, get_check, pum_data);
            return input_depo_check_to_parent_data;

        }

        function getDeposit(pum_number, parameter_data) {
            let result_data = [];
            if (pum_number.length > 0) {

                var depositSearch = search.create({
                    type: "transaction",
                    filters: [
                        ["subsidiary", "anyof", parameter_data.subsidiary],
                        "AND",
                        ["type", "anyof", "Deposit"],
                        "AND",
                        ["custbody_asl_pumnumber", "anyof", pum_number],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["taxline", "is", "F"]
                    ],
                    columns: [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                        search.createColumn({ name: "custbody_asl_pumnumber", label: "Amount" }),
                    ]
                });
                let pagedResults = depositSearch.runPaged({ pageSize: 1000 });

                pagedResults.pageRanges.forEach(function (pageRange) {
                    let page = pagedResults.fetch({ index: pageRange.index });
                    page.data.forEach(function (result) {
                        let tranid = result.getValue({ name: 'tranid' });
                        let amount = result.getValue({ name: 'amount' });
                        let custbody_asl_pumnumber = result.getValue({ name: 'custbody_asl_pumnumber' });


                        result_data.push({
                            tranid: tranid,
                            amount: amount,
                            custbody_asl_pumnumber: custbody_asl_pumnumber,
                        })
                    });
                });
            }
            return result_data;
        }

        function getCheck(pum_number, parameter_data) {
            let result_data = []
            let filter = []
            if (pum_number > 0) {

                var checkSearch = search.create({
                    type: "transaction",
                    filters: [
                        ["subsidiary", "anyof", parameter_data.subsidiary],
                        "AND",
                        ["type", "anyof", "Check"],
                        "AND",
                        ["custbody_asl_pumnumber", "anyof", pum_number],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["taxline", "is", "F"],
                        "AND",
                        ["custbody_me_tipe_pum", "anyof", "2"]
                    ],
                    columns: [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                        search.createColumn({ name: "custbody_asl_pumnumber", label: "custbody_asl_pumnumber" })
                    ]
                });
                let pagedResults = checkSearch.runPaged({ pageSize: 1000 });

                pagedResults.pageRanges.forEach(function (pageRange) {
                    let page = pagedResults.fetch({ index: pageRange.index });
                    page.data.forEach(function (result) {
                        let tranid = result.getValue({ name: 'tranid' });
                        let amount = result.getValue({ name: 'amount' });
                        let custbody_asl_pumnumber = result.getValue({ name: 'custbody_asl_pumnumber' });


                        result_data.push({
                            tranid: tranid,
                            amount: amount,
                            custbody_asl_pumnumber: custbody_asl_pumnumber,
                        })
                    });
                });
            }
            return result_data;
        }

        function populateDataCheck(form, get_nomor_doc) {

            let sublist = form.getSublist({
                id: 'custpage_trans_sublist'
            });

            let line_index = 0

            for (let i = 0; i < get_nomor_doc.length; i++) {
                for (let j = 0; j < get_nomor_doc[i].line.length; j++) {
                    log.debug("get_nomor_doc", get_nomor_doc[i])
                    if (get_nomor_doc[i].custbody_asl_pumnumtext) {
                        let set_pengajuan_number = sublist.setSublistValue({
                            id: "custpage_pengajuan_number",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_asl_pumnumtext
                        })
                    }
                    if (get_nomor_doc[i].custbody_asl_pumnumber) {
                        let set_pengajuan_number = sublist.setSublistValue({
                            id: "custpage_pengajuan_number_id",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_asl_pumnumber
                        })
                    }

                    if (get_nomor_doc[i].tranid) {
                        let set_pum_number = sublist.setSublistValue({
                            id: "custpage_pumnumber_text",
                            line: line_index,
                            value: get_nomor_doc[i].tranid
                        })
                    }
                    if (get_nomor_doc[i].internalid) {
                        let set_pum_number = sublist.setSublistValue({
                            id: "custpage_pumnumber_id",
                            line: line_index,
                            value: get_nomor_doc[i].internalid
                        })
                    }

                    if (get_nomor_doc[i].trandate) {
                        let set_date = sublist.setSublistValue({
                            id: "custpage_datepum",
                            line: line_index,
                            value: get_nomor_doc[i].trandate
                        })
                    }

                    if (get_nomor_doc[i].memomain) {
                        let set_date = sublist.setSublistValue({
                            id: "custpage_memo",
                            line: line_index,
                            value: get_nomor_doc[i].memomain
                        })
                    }

                    if (get_nomor_doc[i].line[j].amount) {
                        let set_amount = sublist.setSublistValue({
                            id: "custpage_amnt",
                            line: line_index,
                            value: Number(get_nomor_doc[i].line[j].amount)
                        })
                    }

                    if (!isNaN(get_nomor_doc[i].custbody_me_full_amnt_realisasi)) {
                        let set_remaining_amt = sublist.setSublistValue({
                            id: "custpage_reman_amnt",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_me_full_amnt_realisasi ? roundIfMoreThanTwoDecimals(Number(get_nomor_doc[i].custbody_me_full_amnt_realisasi) + Number(get_nomor_doc[i].doc_number_amount_total)) : 0
                        })
                        let set_remaining_amt_hidden = sublist.setSublistValue({
                            id: "custpage_reman_amnt_hidden",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_me_full_amnt_realisasi ? roundIfMoreThanTwoDecimals(Number(get_nomor_doc[i].custbody_me_full_amnt_realisasi) + Number(get_nomor_doc[i].doc_number_amount_total)) : 0
                        })
                    }

                    if (get_nomor_doc[i].department_text) {
                        let set_department_text = sublist.setSublistValue({
                            id: "custpage_dept",
                            line: line_index,
                            value: get_nomor_doc[i].department_text
                        })
                    }

                    if (get_nomor_doc[i].department) {
                        let set_department = sublist.setSublistValue({
                            id: "custpage_dept_id",
                            line: line_index,
                            value: get_nomor_doc[i].department
                        })
                    }
                    if (get_nomor_doc[i].line[j].location_text) {
                        let set_department = sublist.setSublistValue({
                            id: "custpage_location_text",
                            line: line_index,
                            value: get_nomor_doc[i].line[j].location_text
                        })
                    }

                    if (get_nomor_doc[i].custbody_me_jba_account_advance_1) {
                        let set_type = sublist.setSublistValue({
                            id: "custpage_type",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_me_jba_account_advance_1
                        })
                    }

                    if (!isNaN(Number(get_nomor_doc[i].custbody_asl_outstandingadv))) {
                        let set_type = sublist.setSublistValue({
                            id: "custpage_outsanding_adv_amount",
                            line: line_index,
                            value: Number(get_nomor_doc[i].custbody_asl_outstandingadv)
                        })
                    }

                    if (get_nomor_doc[i].custbody_me_jba_account_advance_1_id) {
                        let set_type = sublist.setSublistValue({
                            id: "custpage_type_id",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_me_jba_account_advance_1_id
                        })
                    }

                    if (get_nomor_doc[i].doc_number) {
                        let set_biaya_um = sublist.setSublistValue({
                            id: "custpage_num_doc_transaksi",
                            line: line_index,
                            value: get_nomor_doc[i].doc_number
                        })
                    }

                    if (get_nomor_doc[i].item) {
                        let set_biaya_um_text = sublist.setSublistValue({
                            id: "custpage_biaya_um_text",
                            line: line_index,
                            value: get_nomor_doc[i].item
                        })
                    }
                    if (get_nomor_doc[i].item_id) {
                        let set_biaya_um_id = sublist.setSublistValue({
                            id: "custpage_biaya_um_id",
                            line: line_index,
                            value: get_nomor_doc[i].item_id
                        })
                    }
                    if (get_nomor_doc[i].item_expenseaccount_um) {
                        let set_biaya_um_account = sublist.setSublistValue({
                            id: "custpage_biaya_um_account",
                            line: line_index,
                            value: get_nomor_doc[i].item_expenseaccount_um
                        })
                    }


                    if (get_nomor_doc[i].class_) {
                        let set_class_id = sublist.setSublistValue({
                            id: "custpage_class_id",
                            line: line_index,
                            value: get_nomor_doc[i].class_
                        })
                    }

                    if (get_nomor_doc[i].line[j].location) {
                        let set_location_id = sublist.setSublistValue({
                            id: "custpage_location_id",
                            line: line_index,
                            value: get_nomor_doc[i].line[j].location
                        })
                    }

                    if (!isNaN(get_nomor_doc[i].line[j].taxamount)) {
                        let set_location_id = sublist.setSublistValue({
                            id: "custpage_ppn_amount",
                            line: line_index,
                            value: Number(get_nomor_doc[i].line[j].taxamount)
                        })
                    }
                    if (get_nomor_doc[i].line[j].line_unique_key) {
                        let set_location_id = sublist.setSublistValue({
                            id: "custpage_line_unique_key",
                            line: line_index,
                            value: get_nomor_doc[i].line[j].line_unique_key
                        })
                    }

                    if (get_nomor_doc[i].line.length > 0) {
                        let set_location_id = sublist.setSublistValue({
                            id: "custpage_detail_data",
                            line: line_index,
                            value: JSON.stringify(get_nomor_doc[i].line)
                        })
                    }
                    line_index++;
                }

            }

        }

        //===========================rec.type is Check(END)========================================

        //===========================rec.type is Purchase Order========================================

        function getPoPum(parameter_data) {
            let result_data = []
            var poPUMSearch = search.create({
                type: "purchaseorder",
                filters:
                    [
                        ["subsidiary", "anyof", parameter_data.subsidiary],
                        "AND",
                        ["type", "anyof", "PurchOrd"],
                        "AND",
                        ["customform", "anyof", parameter_data.subsidiary == config.SUBSIDIARY.SANDBOX.ASL ? "148" : "189"],
                        "AND",
                        ["custbody_me_jba_sub_category_po", "anyof", "3"],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
            });
            let pagedResults = poPUMSearch.runPaged({ pageSize: 1000 });

            pagedResults.pageRanges.forEach(function (pageRange) {
                let page = pagedResults.fetch({ index: pageRange.index });
                page.data.forEach(function (result) {
                    let internalid = result.getValue({ name: 'internalid' });

                    result_data.push(internalid)
                });
            });
            return result_data
        }

        function getPumDataPo(parameter_data, get_journal, get_po_pum_jba) {
            log.debug("parameter_data.subsidiary]", parameter_data.subsidiary)

            let result_data = []


            let filter = [
                ["subsidiary", "anyof", parameter_data.subsidiary],
                "AND",
                ["type", "anyof", "PurchOrd"],
                "AND",
                ["customform", "anyof", parameter_data.subsidiary == config.SUBSIDIARY.SANDBOX.ASL ? "148" : "189"],
                "AND",
                ["custbody_me_jba_sub_category_po", "anyof", "4"],
                "AND",
                ["custbody_asl_pumnumber", "anyof", get_po_pum_jba],
                "AND",
                ["item.type", "anyof", "NonInvtPart"],

                "AND",
                ["status", "anyof", "PurchOrd:H"],
                "AND",
                ["memomain", "isnotempty", ""],
                "AND",
                ["custbody_me_jba_account_advance_1", "anyof", parameter_data.um_type],
                "AND",
                ["voided", "is", "F"],
            ]

            if (get_journal.length > 0) {
                filter.push("AND",
                    ["internalid", "noneof", get_journal],)
            }

            var poSearch = search.create({
                type: "purchaseorder",
                filters: filter,
                columns:
                    [
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        search.createColumn({ name: "custbody_me_jba_account_advance_1", label: "ME - Account Advance" }),
                        search.createColumn({ name: "memomain", label: "Memo (Main)" }),
                        search.createColumn({ name: "trandate", label: "Date" }),
                        search.createColumn({ name: "custbody_me_jba_full_amt_adv_1", label: "ME - Full Amount Advance" }),
                        search.createColumn({ name: "custbody_me_full_amnt_realisasi", label: "JBA - FULL AMOUNT REALISASI" }),
                        search.createColumn({ name: "department", label: "Department" }),
                        search.createColumn({ name: "item", label: "Item" }),
                        search.createColumn({ name: "custbody_me_jba_pum_number_text_1", label: "ME - PUM Number (Free-Text)" }),
                        search.createColumn({ name: "custbody_asl_pumnumtext", label: "ASL - PUM Number (Text)" }),
                        search.createColumn({ name: "custbody_asl_outstandingadv", label: "ASL - Full Amount Advance" }),
                        search.createColumn({ name: "grossamount", label: "Amount (Gross)" }),
                        // search.createColumn({
                        //     name: "formulatext",
                        //     formula: "CASE WHEN {class} IS NOT NULL THEN {class.internalid} ELSE 'No Class' END",
                        //     label: "Formula (Text)"
                        // }),
                        search.createColumn({
                            name: "class",
                            label: "class"
                        }),
                        search.createColumn({ name: "location", label: "Location" }),
                        search.createColumn({ name: "custcol_me_budget_id_record_po", label: "ME - Budget# PO" }),
                        search.createColumn({ name: "custcol_me_line_budget_available", label: "Budget Available" }),
                        search.createColumn({ name: "custbody_asl_pumnumber", label: "ASL - PUM Number" }),
                        search.createColumn({ name: "taxamount", label: "Tax Amount" }),
                        search.createColumn({
                            name: "expenseaccount",
                            join: "item",
                            label: "Expense/COGS Account"
                        }),
                        search.createColumn({ name: "memo", label: "Memo" }),
                        search.createColumn({ name: "lineuniquekey", label: "Line Unique Key" })
                    ]
            });
            let pagedResults = poSearch.runPaged({ pageSize: 1000 });

            pagedResults.pageRanges.forEach(function (pageRange) {
                let page = pagedResults.fetch({ index: pageRange.index });
                page.data.forEach(function (result) {
                    let internalid = result.getValue({ name: 'internalid' });
                    let tranid = result.getValue({ name: 'tranid' });
                    let item = result.getText({ name: 'item' });
                    let item_id = result.getValue({ name: 'item' });
                    let memomain = result.getValue({ name: 'memomain' });
                    let trandate = result.getValue({ name: 'trandate' });
                    let custbody_me_jba_full_amt_adv_1 = result.getValue({ name: 'custbody_me_jba_full_amt_adv_1' });
                    let custbody_me_full_amnt_realisasi = result.getValue({ name: 'custbody_me_full_amnt_realisasi' });
                    let department = result.getValue({ name: 'department' });
                    let department_text = result.getText({ name: 'department' });
                    let custbody_me_jba_account_advance_1 = result.getText({ name: 'custbody_me_jba_account_advance_1' });
                    let custbody_me_jba_account_advance_1_id = result.getValue({ name: 'custbody_me_jba_account_advance_1' });
                    let memo = result.getValue({ name: 'memo' });
                    let amount = Math.abs(result.getValue({ name: 'amount' }));
                    let custbody_asl_pumnumtext = result.getValue({ name: 'custbody_asl_pumnumtext' });
                    let custbody_asl_outstandingadv = result.getValue({ name: 'custbody_asl_outstandingadv' });
                    let taxcode = result.getValue({ name: 'taxcode' });
                    let taxamount = result.getValue({ name: 'taxamount' });
                    let custcol_me_budget_id_record_po = result.getValue({ name: 'custcol_me_budget_id_record_po' });
                    let custcol_me_line_budget_available = result.getValue({ name: 'custcol_me_line_budget_available' });
                    let custbody_asl_pumnumber = result.getValue({ name: 'custbody_asl_pumnumber' });
                    let location = result.getValue({ name: 'location' });
                    let location_text = result.getText({ name: 'location' });
                    let grossamount = Math.abs(result.getValue({ name: 'grossamount' }));
                    let custbody_me_jba_pum_number_text_1 = result.getValue({ name: 'custbody_me_jba_pum_number_text_1' });
                    let class_ = result.getValue({ name: 'class' });
                    // let class_ = result.getValue({ name: 'formulatext', formula: "CASE WHEN {class} IS NOT NULL THEN {class.internalid} ELSE 'No Class' END" });
                    let item_expenseaccount_um = result.getValue({ name: 'expenseaccount', join: "item" });
                    let line_unique_key = result.getValue({ name: 'lineuniquekey' });

                    if (result_data.some((data) => data.internalid == internalid)) {
                        let get_index = result_data.findIndex((data) => data.internalid == internalid)
                        result_data[get_index].custbody_me_full_amnt_realisasi -= parameter_data.rec_type === 'purchase_order' ? Number(grossamount) : Number(amount);
                        result_data[get_index].total_amount += Number(amount)
                        result_data[get_index].total_taxamount += Number(taxamount)
                        result_data[get_index].total_grossamount += Number(grossamount)
                        result_data[get_index].total_grossamount_for_calculte_remaining += Number(grossamount)
                        result_data[get_index].line_unique_key_arr.push(line_unique_key)
                        result_data[get_index].line.push({
                            item: item,
                            item_id: item_id,
                            item_expenseaccount_um: item_expenseaccount_um,
                            // memomain: memomain,
                            trandate: trandate,
                            custbody_me_jba_full_amt_adv_1: custbody_me_jba_full_amt_adv_1,
                            // custbody_me_full_amnt_realisasi: Number(custbody_me_full_amnt_realisasi),
                            custbody_me_full_amnt_realisasi: Number(custbody_asl_outstandingadv) - (parameter_data.rec_type === 'purchase_order' ? Number(grossamount) : Number(amount)),
                            department: department,
                            department_text: department_text,
                            // custbody_me_jba_account_advance_1: custbody_me_jba_account_advance_1,
                            // custbody_me_jba_account_advance_1_id: custbody_me_jba_account_advance_1_id,
                            memo: memo,
                            amount: Number(amount),
                            // custbody_asl_pumnumtext: custbody_asl_pumnumtext,
                            custbody_asl_outstandingadv: Number(custbody_asl_outstandingadv),
                            taxcode: taxcode,
                            taxamount: Number(taxamount),
                            custcol_me_budget_id_record_po: custcol_me_budget_id_record_po,
                            custcol_me_line_budget_available: custcol_me_line_budget_available,
                            // custbody_asl_pumnumber: custbody_asl_pumnumber,
                            // doc_number: null,
                            // doc_number_amount: 0,
                            location: location,
                            location_text: location_text,
                            grossamount: Number(grossamount),
                            class_: class_ ? class_ : config.CLASS_NONE,
                            custbody_me_jba_pum_number_text_1: custbody_me_jba_pum_number_text_1,
                            line_unique_key: line_unique_key,
                        })
                    } else {
                        result_data.push({
                            internalid: internalid,
                            tranid: tranid,
                            item: item,
                            trandate: trandate,
                            custbody_asl_outstandingadv: Number(custbody_asl_outstandingadv),
                            // custbody_me_full_amnt_realisasi: Number(custbody_me_full_amnt_realisasi),
                            custbody_me_full_amnt_realisasi: Number(custbody_asl_outstandingadv) - (parameter_data.rec_type === 'purchase_order' ? Number(grossamount) : Number(amount)),
                            custbody_asl_pumnumtext: custbody_asl_pumnumtext,
                            custbody_asl_pumnumber: custbody_asl_pumnumber,
                            custbody_me_jba_account_advance_1: custbody_me_jba_account_advance_1,
                            custbody_me_jba_account_advance_1_id: custbody_me_jba_account_advance_1_id,
                            memomain: memomain,
                            department: department,
                            department_text: department_text,
                            location: location,
                            location_text: location_text,
                            class_: class_ ? class_ : config.CLASS_NONE,
                            total_amount: Number(amount),
                            doc_type: null,
                            doc_number: null,
                            doc_number_amount_total: 0,
                            total_taxamount: Number(taxamount),
                            total_grossamount: Number(grossamount),
                            total_grossamount_for_calculte_remaining: Number(grossamount),
                            line_unique_key_arr: [line_unique_key],
                            line: [{
                                item: item,
                                item_id: item_id,
                                item_expenseaccount_um: item_expenseaccount_um,
                                // trandate: trandate,
                                custbody_me_jba_full_amt_adv_1: custbody_me_jba_full_amt_adv_1,
                                custbody_me_full_amnt_realisasi: Number(custbody_asl_outstandingadv) - (parameter_data.rec_type === 'purchase_order' ? Number(grossamount) : Number(amount)),
                                department: department,
                                department_text: department_text,
                                // custbody_me_jba_account_advance_1: custbody_me_jba_account_advance_1,
                                // custbody_me_jba_account_advance_1_id: custbody_me_jba_account_advance_1_id,
                                memo: memo,
                                amount: Number(amount),
                                // custbody_asl_pumnumtext: custbody_asl_pumnumtext,
                                custbody_asl_outstandingadv: Number(custbody_asl_outstandingadv),
                                taxcode: taxcode,
                                taxamount: Number(taxamount),
                                custcol_me_budget_id_record_po: custcol_me_budget_id_record_po,
                                custcol_me_line_budget_available: custcol_me_line_budget_available,
                                // custbody_asl_pumnumber: custbody_asl_pumnumber,
                                // doc_number: null,
                                // doc_number_amount: 0,
                                location: location,
                                location_text: location_text,
                                grossamount: Number(grossamount),
                                class_: class_ ? class_ : config.CLASS_NONE,
                                custbody_me_jba_pum_number_text_1: custbody_me_jba_pum_number_text_1,
                                line_unique_key: line_unique_key,
                            }],
                        })
                    }

                    // result_data.push({
                    //     // internalid: internalid,
                    //     // tranid: tranid,
                    //     item: item,
                    //     item_id: item_id,
                    //     item_expenseaccount_um: item_expenseaccount_um,
                    //     memomain: memomain,
                    //     trandate: trandate,
                    //     custbody_me_jba_full_amt_adv_1: custbody_me_jba_full_amt_adv_1,
                    //     custbody_me_full_amnt_realisasi: Number(custbody_me_full_amnt_realisasi),
                    //     department: department,
                    //     department_text: department_text,
                    //     // custbody_me_jba_account_advance_1: custbody_me_jba_account_advance_1,
                    //     // custbody_me_jba_account_advance_1_id: custbody_me_jba_account_advance_1_id,
                    //     memo: memo,
                    //     amount: Number(amount),
                    //     // custbody_asl_pumnumtext: custbody_asl_pumnumtext,
                    //     custbody_asl_outstandingadv: Number(custbody_asl_outstandingadv),
                    //     taxcode: taxcode,
                    //     taxamount: Number(taxamount),
                    //     custcol_me_budget_id_record_po: custcol_me_budget_id_record_po,
                    //     custcol_me_line_budget_available: custcol_me_line_budget_available,
                    //     // custbody_asl_pumnumber: custbody_asl_pumnumber,
                    //     doc_number: null,
                    //     doc_number_amount: 0,
                    //     location: location,
                    //     location_text: location_text,
                    //     grossamount: Number(grossamount),
                    //     class_: class_ ? class_ : config.CLASS_NONE,
                    //     custbody_me_jba_pum_number_text_1: custbody_me_jba_pum_number_text_1,
                    //     taxamount: taxamount,
                    // })
                });
            });
            return result_data
        }

        function combinePumDuplicate(dataPo, parameter_data) {

            let used_index = []

            for (let i = 0; i < dataPo.length; i++) {
                let total_amount_duplicate_pum = 0
                let total_realisasi_duplicate_pum = 0
                let get_multiple_index = findIndicesByProperty(dataPo, "custbody_asl_pumnumber", dataPo[i].custbody_asl_pumnumber)

                for (let j = 0; j < get_multiple_index.length; j++) {
                    if (used_index.includes(get_multiple_index[j])) {
                        continue;
                    }
                    log.debug("combinePumDuplicate", {
                        amount: Number(dataPo[get_multiple_index[j]].total_grossamount),
                        get_multiple_index: [get_multiple_index[j]],
                        realisasi: dataPo[get_multiple_index[j]].custbody_me_full_amnt_realisasi,
                        dataPo: dataPo[get_multiple_index[j]]
                    })
                    total_amount_duplicate_pum += Number(dataPo[get_multiple_index[j]].total_grossamount_for_calculte_remaining);
                    // dataPo[get_multiple_index[j]].custbody_me_full_amnt_realisasi += parameter_data.rec_type === 'purchase_order' ? Number(dataPo[i].custbody_me_full_amnt_realisasi) : Number(dataPo[i].custbody_me_full_amnt_realisasi);
                    // dataPo[i].custbody_me_full_amnt_realisasi -= parameter_data.rec_type === 'purchase_order' ? Number(dataPo[i].grossamount) : Number(dataPo[i].amount);
                    if (j == get_multiple_index.length - 1) {
                        for (let j = 0; j < get_multiple_index.length; j++) {
                            dataPo[get_multiple_index[j]].custbody_me_full_amnt_realisasi = Number(dataPo[get_multiple_index[j]].custbody_asl_outstandingadv) - total_amount_duplicate_pum
                        }
                    }

                }
                used_index.push(...get_multiple_index)
                // for (let j = 0; j < get_multiple_index.length; j++) {
                //     dataPo[get_multiple_index[j]].custbody_me_full_amnt_realisasi = total_realisasi_duplicate_pum

                // }
            }

            return dataPo;

        }

        function getNomorDocPo(pum_data, parameter_data) {// untuk mencari value pada kolom "Nomor Dokumen"

            let pum_deposit = [] //if custbody_me_full_amnt_realisasi < 0
            let pum_check = []// if custbody_me_full_amnt_realisasi > 0

            log.debug("pum_data", pum_data)

            pum_data.forEach(data => {
                if (data.custbody_me_full_amnt_realisasi > 0 && !pum_deposit.some((data_depo) => data_depo == data.custbody_asl_pumnumber) && data.custbody_asl_pumnumber) {
                    pum_deposit.push(data.custbody_asl_pumnumber)
                    // log.debug("data.custbody_asl_pumnumber",data.custbody_asl_pumnumber)
                } else if (data.custbody_me_full_amnt_realisasi < 0 && !pum_check.some((data_check) => data_check == data.custbody_asl_pumnumber) && data.custbody_asl_pumnumber) {
                    pum_check.push(data.custbody_asl_pumnumber)
                    // log.debug("data.custbody_asl_pumnumber",data.custbody_asl_pumnumber)
                }
            });

            log.debug("pum_deposit", pum_deposit)
            log.debug("pum_check", pum_check)
            let get_deposit = getDepositPo(pum_deposit, parameter_data);
            let get_check = getCheckPo(pum_check, parameter_data);

            let input_depo_check_to_parent_data = combine(get_deposit, get_check, pum_data);
            return input_depo_check_to_parent_data;

        }

        function getDepositPo(pum_number, parameter_data) {

            log.debug("pum_number", pum_number)
            let result_data = [];
            if (pum_number.length > 0) {

                var depositSearch = search.create({
                    type: "transaction",
                    filters: [
                        ["subsidiary", "anyof", parameter_data.subsidiary],
                        "AND",
                        ["type", "anyof", "Deposit"],
                        "AND",
                        ["custbody_asl_pumnumber", "anyof", pum_number],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        // "AND",
                        // ["account", "anyof", "2644", "2837"]
                    ],
                    columns: [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        // search.createColumn({ name: "custbody_me_jba_outst", label: "JBA - OUTSTANDING" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                        search.createColumn({ name: "custbody_asl_pumnumber", label: "custbody_asl_pumnumber" }),
                    ]
                });
                let pagedResults = depositSearch.runPaged({ pageSize: 1000 });

                pagedResults.pageRanges.forEach(function (pageRange) {
                    let page = pagedResults.fetch({ index: pageRange.index });
                    page.data.forEach(function (result) {
                        let tranid = result.getValue({ name: 'tranid' });
                        let amount = result.getValue({ name: 'amount' });
                        let custbody_asl_pumnumber = result.getValue({ name: 'custbody_asl_pumnumber' });


                        result_data.push({
                            tranid: tranid,
                            amount: amount,
                            custbody_asl_pumnumber: custbody_asl_pumnumber,
                        })
                    });
                });
            }
            return result_data;
        }

        function getCheckPo(pum_number, parameter_data) {

            log.debug("pum_number", pum_number)
            let result_data = []
            let filter = []
            if (pum_number.length > 0) {

                var checkSearch = search.create({
                    type: "transaction",
                    filters: [
                        ["subsidiary", "anyof", parameter_data.subsidiary],
                        "AND",
                        ["type", "anyof", "Check"],
                        "AND",
                        ["custbody_asl_pumnumber", "anyof", pum_number],
                        "AND",
                        ["mainline", "is", "F"],
                        "AND",
                        ["taxline", "is", "F"],
                        // "AND",
                        // ["account", "anyof", "2644", "2837", "7040", "11320"]
                    ],
                    columns: [
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        // search.createColumn({ name: "custbody_me_jba_outst", label: "JBA - OUTSTANDING" }),
                        search.createColumn({ name: "amount", label: "Amount" }),
                        search.createColumn({ name: "custbody_asl_pumnumber", label: "custbody_asl_pumnumber" })
                    ]
                });
                let pagedResults = checkSearch.runPaged({ pageSize: 1000 });

                pagedResults.pageRanges.forEach(function (pageRange) {
                    let page = pagedResults.fetch({ index: pageRange.index });
                    page.data.forEach(function (result) {
                        let tranid = result.getValue({ name: 'tranid' });
                        let amount = result.getValue({ name: 'amount' });
                        let custbody_asl_pumnumber = result.getValue({ name: 'custbody_asl_pumnumber' });


                        result_data.push({
                            tranid: tranid,
                            amount: amount,
                            custbody_asl_pumnumber: custbody_asl_pumnumber,
                        })
                    });
                });
            }
            return result_data;
        }

        function populateDataPo(form, get_nomor_doc) {

            let sublist = form.getSublist({
                id: 'custpage_trans_sublist'
            });

            let line_index = 0
            for (let i = 0; i < get_nomor_doc.length; i++) {
                for (let j = 0; j < get_nomor_doc[i].line.length; j++) {
                    log.debug("get_nomor_doc", get_nomor_doc[i])
                    log.debug("get_nomor_doc[i].line", get_nomor_doc[i].line)
                    if (get_nomor_doc[i].custbody_asl_pumnumtext) {
                        let set_pengajuan_number = sublist.setSublistValue({
                            id: "custpage_pengajuan_number",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_asl_pumnumtext
                        })
                    }
                    if (get_nomor_doc[i].custbody_asl_pumnumber) {
                        let set_pengajuan_number = sublist.setSublistValue({
                            id: "custpage_pengajuan_number_id",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_asl_pumnumber
                        })
                    }

                    if (get_nomor_doc[i].tranid) {
                        let set_pum_number = sublist.setSublistValue({
                            id: "custpage_pumnumber_text",
                            line: line_index,
                            value: get_nomor_doc[i].tranid
                        })
                    }

                    if (get_nomor_doc[i].internalid) {
                        let set_pum_number = sublist.setSublistValue({
                            id: "custpage_pumnumber_id",
                            line: line_index,
                            value: get_nomor_doc[i].internalid
                        })
                    }

                    if (get_nomor_doc[i].trandate) {
                        let set_date = sublist.setSublistValue({
                            id: "custpage_datepum",
                            line: line_index,
                            value: get_nomor_doc[i].trandate
                        })
                    }

                    if (get_nomor_doc[i].memomain) {
                        let set_date = sublist.setSublistValue({
                            id: "custpage_memo",
                            line: line_index,
                            value: get_nomor_doc[i].memomain
                        })
                    }

                    if (get_nomor_doc[i].line[j].grossamount) {
                        let set_amount = sublist.setSublistValue({
                            id: "custpage_amnt",
                            line: line_index,
                            value: Number(get_nomor_doc[i].line[j].grossamount)
                        })
                    }

                    if (!isNaN(get_nomor_doc[i].custbody_me_full_amnt_realisasi)) {
                        let set_remaining_amt = sublist.setSublistValue({
                            id: "custpage_reman_amnt",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_me_full_amnt_realisasi ? roundIfMoreThanTwoDecimals((Number(get_nomor_doc[i].custbody_me_full_amnt_realisasi) + Number(get_nomor_doc[i].doc_number_amount_total)) + Number(get_nomor_doc[i].total_taxamount)) : 0
                        })
                        let set_remaining_amt_hidden = sublist.setSublistValue({
                            id: "custpage_reman_amnt_hidden",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_me_full_amnt_realisasi ? roundIfMoreThanTwoDecimals((Number(get_nomor_doc[i].custbody_me_full_amnt_realisasi) + Number(get_nomor_doc[i].doc_number_amount_total)) + Number(get_nomor_doc[i].total_taxamount)) : 0
                        })
                    }

                    if (get_nomor_doc[i].department_text) {
                        let set_department_text = sublist.setSublistValue({
                            id: "custpage_dept",
                            line: line_index,
                            value: get_nomor_doc[i].department_text
                        })
                    }

                    if (get_nomor_doc[i].department) {
                        let set_department = sublist.setSublistValue({
                            id: "custpage_dept_id",
                            line: line_index,
                            value: get_nomor_doc[i].department
                        })
                    }

                    if (get_nomor_doc[i].line[j].location_text) {
                        let set_department = sublist.setSublistValue({
                            id: "custpage_location_text",
                            line: line_index,
                            value: get_nomor_doc[i].line[j].location_text
                        })
                    }

                    if (get_nomor_doc[i].custbody_me_jba_account_advance_1) {
                        let set_type = sublist.setSublistValue({
                            id: "custpage_type",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_me_jba_account_advance_1
                        })
                    }
                    if (get_nomor_doc[i].custbody_me_jba_account_advance_1_id) {
                        let set_type = sublist.setSublistValue({
                            id: "custpage_type_id",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_me_jba_account_advance_1_id
                        })
                    }
                    if (!isNaN(Number(get_nomor_doc[i].custbody_asl_outstandingadv))) {
                        let set_type = sublist.setSublistValue({
                            id: "custpage_outsanding_adv_amount",
                            line: line_index,
                            value: get_nomor_doc[i].custbody_asl_outstandingadv
                        })
                    }

                    if (get_nomor_doc[i].doc_number) {
                        let set_biaya_um = sublist.setSublistValue({
                            id: "custpage_num_doc_transaksi",
                            line: line_index,
                            value: get_nomor_doc[i].doc_number
                        })
                    }
                    if (get_nomor_doc[i].doc_number_amount_total) {
                        let set_biaya_um = sublist.setSublistValue({
                            id: "custpage_num_doc_transaksi_amount",
                            line: line_index,
                            value: get_nomor_doc[i].doc_number_amount_total
                        })
                    }
                    if (get_nomor_doc[i].doc_type) {
                        let set_biaya_um = sublist.setSublistValue({
                            id: "custpage_num_doc_transaksi_type",
                            line: line_index,
                            value: get_nomor_doc[i].doc_type
                        })
                    }

                    if (get_nomor_doc[i].line[j].item) {
                        let set_biaya_um_text = sublist.setSublistValue({
                            id: "custpage_biaya_um_text",
                            line: line_index,
                            value: get_nomor_doc[i].line[j].item
                        })
                    }
                    if (get_nomor_doc[i].line[j].item_id) {
                        let set_biaya_um_id = sublist.setSublistValue({
                            id: "custpage_biaya_um_id",
                            line: line_index,
                            value: get_nomor_doc[i].line[j].item_id
                        })
                    }

                    if (get_nomor_doc[i].line[j].item_expenseaccount_um) {
                        let set_biaya_um_account = sublist.setSublistValue({
                            id: "custpage_biaya_um_account",
                            line: line_index,
                            value: get_nomor_doc[i].line[j].item_expenseaccount_um
                        })
                    }


                    if (get_nomor_doc[i].class_) {
                        let set_class_id = sublist.setSublistValue({
                            id: "custpage_class_id",
                            line: line_index,
                            value: get_nomor_doc[i].class_
                        })
                    }

                    if (get_nomor_doc[i].line[j].location) {
                        let set_location_id = sublist.setSublistValue({
                            id: "custpage_location_id",
                            line: line_index,
                            value: get_nomor_doc[i].line[j].location
                        })
                    }
                    if (get_nomor_doc[i].line_unique_key_arr) {
                        let set_location_id = sublist.setSublistValue({
                            id: "custpage_line_unique_key",
                            line: line_index,
                            value: get_nomor_doc[i].line_unique_key_arr
                        })
                    }
                    if (!isNaN(get_nomor_doc[i].line[j].taxamount)) {
                        let set_location_id = sublist.setSublistValue({
                            id: "custpage_ppn_amount",
                            line: line_index,
                            value: Number(get_nomor_doc[i].line[j].taxamount)
                        })
                    }
                    if (get_nomor_doc[i].line.length > 0) {


                        let get_line_index = get_nomor_doc[i].line_unique_key_arr.findIndex((data) => data == get_nomor_doc[i].line[j].line_unique_key)

                        if (get_line_index != -1) {
                            let set_location_id = sublist.setSublistValue({
                                id: "custpage_detail_data",
                                line: line_index,
                                value: JSON.stringify([get_nomor_doc[i].line[get_line_index]])
                            });


                        }
                    }
                    line_index++;
                }
            }

        }

        //===========================rec.type is Purchase Order(END)========================================

        function combine(get_deposit, get_check, pum_data) {
            for (let i = 0; i < pum_data.length; i++) {
                let get_deposit_data = get_deposit.filter((data) => data.custbody_asl_pumnumber == pum_data[i].custbody_asl_pumnumber)
                log.debug("get_deposit_data", get_deposit_data)
                if (get_deposit_data.length > 0) {
                    pum_data[i].doc_type = "deposit";
                    pum_data[i].doc_number = get_deposit_data[0].tranid;
                    pum_data[i].doc_number_amount_total = Number(get_deposit_data[0].amount);
                    continue;
                }

                let get_check_data = get_check.filter((data) => data.custbody_asl_pumnumber == pum_data[i].custbody_asl_pumnumber)
                log.debug("get_check_data", get_check_data)
                if (get_check_data.length > 0) {
                    pum_data[i].doc_type = "check";
                    pum_data[i].doc_number = get_check_data[0].tranid;
                    pum_data[i].doc_number_amount_total = Number(get_check_data[0].amount);
                    continue;
                }
            }
            return pum_data;
        }


        return {
            onRequest: onRequest
        }
    })

/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/record', "N/runtime"], function (search, serverWidget, log, task, redirect, record, runtime) {

    function confimationForm(context, data) {
        // Create a new form for the confirmation page
        var confirmationForm = serverWidget.createForm({
            title: 'Bon Bahan Created'
        });

        // Add a message field to show the journal entry number
        var numbersHtml = data.map(item => `<li> ${item}</li>`).join('')
        //  ubah array
        confirmationForm.addField({
            id: 'custpage_confirmation',
            type: serverWidget.FieldType.INLINEHTML,
            label: ' '
        }).defaultValue = `<h2>Bon Bahan Created: ${numbersHtml} </h2>`;

        // Display the confirmation form
        context.response.writePage(confirmationForm)
    }

    function getTranid(data_confirmation) {

        let result = []

        var je_name_search = search.create({
            type: "transaction",
            filters: [
                ["mainline", "is", "T"],
                "AND",
                ["internalid", "anyof", data_confirmation],
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

            result.push(tranid)

        }
        return result;

    }

    function getParameter() {
        var form = serverWidget.createForm({ title: 'Create Bon Bahan' });

        var custpage_startdate_fld = form.addField({
            id: "custpage_startdate",
            type: serverWidget.FieldType.DATE,
            label: 'Start Date',
        })
        custpage_startdate_fld.isMandatory = true;
        var custpage_enddate_fld = form.addField({
            id: "custpage_enddate",
            type: serverWidget.FieldType.DATE,
            label: 'End Date'
        })
        custpage_enddate_fld.isMandatory = true;
        var custpage_class_fld = form.addField({
            id: "custpage_class",
            type: serverWidget.FieldType.SELECT,
            source: 'classification',
            label: 'Class'
        })
        custpage_class_fld.isMandatory = true;
        // var custpage_instruksi_kerja_fld = form.addField({
        //     id: custpage_instruksi_kerja,
        //     type: serverWidget.FieldType.MULTISELECT,
        //     label: 'Instruksi Kerja'
        // }).updateDisplayType({
        //     displayType: serverWidget.FieldDisplayType.DISABLED
        // });
        var custpage_instruksi_kerja_fld = form.addField({
            id: "custpage_instruksi_kerja",
            type: serverWidget.FieldType.TEXT,
            label: 'Instruksi Kerja'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });
        var to_location = form.addField({
            id: "custpage_to_location",
            type: serverWidget.FieldType.SELECT,
            source: "location",
            label: 'To Location'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });
        to_location.isMandatory = true;

        var iksublist = form.addSublist({
            id: "custpage_sublist",
            type: serverWidget.SublistType.LIST,
            label: 'Instruksi Kerja'
        })
        iksublist.addMarkAllButtons()


        var sub_checkbox_fld = iksublist.addField({
            id: "sub_checkbox",
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Check'
        });

        var sub_ik_fld = iksublist.addField({
            id: "sub_ik",
            type: serverWidget.FieldType.SELECT,
            label: 'IK #',
            source: 'transaction'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_item_fld = iksublist.addField({
            id: "sub_item",
            type: serverWidget.FieldType.SELECT,
            label: 'Item',
            source: 'item'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_bahan_fld = iksublist.addField({
            id: "sub_bahan",
            type: serverWidget.FieldType.TEXT,
            label: 'Bahan'
        })
        var sub_from_location_fld = iksublist.addField({
            id: "sub_from_location",
            type: serverWidget.FieldType.SELECT,
            source: "location",
            label: 'From Location'
        })
        var sub_warna_fld = iksublist.addField({
            id: "sub_warna",
            type: serverWidget.FieldType.TEXT,
            label: 'Warna'
        })
        var sub_quantity_fld = iksublist.addField({
            id: "sub_quantity",
            type: serverWidget.FieldType.FLOAT,
            label: 'Quantity'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        return form
    }

    function getItemIK(data) {
        var startdate = data.startdate
        var enddate = data.enddate
        var class_ = data.ik_class
        var to_location = data.to_location
        var instruksi_kerja = data.instruksi_kerja.split('\u0005')



        let filter = [
            ["type", "anyof", "WorkOrd"],
            "AND",
            ["trandate", "within", startdate, enddate],
            "AND",
            ["quantity", "greaterthan", "0"],
            "AND",
            ["mainline", "is", "F"],
            "AND",
            ["item.type", "anyof", "InvtPart", "Assembly"],
        ]

        if (instruksi_kerja) {
            filter.push(
                "AND",
                ["numbertext", "contains", instruksi_kerja]
            )
        }
        if (to_location) {
            filter.push(
                "AND",
                ["location", "anyof", to_location],
            )
        }
        if (class_) {
            filter.push(
                "AND",
                ["class", "anyof", class_],
            )
        }

        var ik_search = search.create({
            type: "workorder",
            filters: filter,
            columns:
                [
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "trandate", label: "Date" }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({ name: "quantity", label: "Quantity" }),
                    search.createColumn({
                        name: "custitem_me_warna",
                        join: "item",
                        label: "Warna"
                    }),
                    search.createColumn({
                        name: "displayname",
                        join: "item",
                        label: "Display Name"
                    }),
                    search.createColumn({ name: "location", label: "location" }),
                ]
        });
        var startrow = 0
        var list_item_ik = []

        do {
            var ik_result = ik_search.run().getRange(startrow, startrow + 1000)
            if (ik_result.length > 0) {
                for (var i = 0; i < ik_result.length; i++) {
                    var ik_id = ik_result[i].id
                    var ik_tranid = ik_result[i].getValue({ name: "tranid", label: "Document Number" })
                    var ik_item = ik_result[i].getValue({ name: "item", label: "Item" })
                    var ik_item_qty = ik_result[i].getValue({ name: "quantity", label: "Quantity" })
                    var ik_item_warna = ik_result[i].getValue({ name: "custitem_me_warna", join: "item" })
                    var ik_item_bahan = ik_result[i].getValue({ name: "displayname", join: "item" })
                    var ik_location = ik_result[i].getValue({ name: "location", join: "location" })

                    list_item_ik.push({
                        ik_id: ik_id,
                        ik_tranid: ik_tranid,
                        ik_item: ik_item,
                        ik_item_qty: ik_item_qty,
                        ik_item_warna: !ik_item_warna ? "-" : ik_item_warna,
                        ik_item_bahan: !ik_item_bahan ? "-" : ik_item_bahan,
                        ik_location: ik_location,
                    })

                }
            }

            startrow += 1000
        } while (ik_result.length == 1000);
        log.debug('IK Result length: ' + list_item_ik.length, list_item_ik)

        return list_item_ik

    }

    function createBonBahan(data, params) {

        log.debug("data", data)

        let saved_to = []

        try {
            for (let i = 0; i < data.length; i++) {
                var rec_bb = record.create({
                    type: record.Type.TRANSFER_ORDER,
                    isDynamic: true
                })

                rec_bb.setValue({
                    fieldId: 'subsidiary',
                    value: 1
                })

                rec_bb.setValue({
                    fieldId: 'transferlocation',
                    value: params.to_location
                })
                rec_bb.setValue({
                    fieldId: 'location',
                    value: data[i].ik_from_location
                })
                // rec_bb.setValue({
                //     fieldId: 'tolocation',
                //     value: 27
                // })
                rec_bb.setValue({
                    fieldId: 'class',
                    value: params.ik_class
                })
                rec_bb.setValue({
                    fieldId: 'employee',
                    value: 4680
                })
                rec_bb.setValue({
                    fieldId: 'department',
                    value: 10
                })
                rec_bb.setValue({
                    fieldId: "custbody49",
                    value: 4681
                })
                rec_bb.setValue({
                    fieldId: "custbody50",
                    value: 5336
                })
                rec_bb.setValue({
                    fieldId: "custbody51",
                    value: 5335
                })



                for (let j = 0; j < data[i].line.length; j++) {
                    rec_bb.selectNewLine({
                        sublistId: 'item'
                    })

                    rec_bb.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: data[i].line[j].ik_item
                    })
                    rec_bb.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        // value: data[i].line[j].qty_built
                        value: data[i].line[j].ik_item_qty
                    })
                    rec_bb.commitLine({
                        sublistId: 'item'
                    })
                }



                var rec_bb_id = rec_bb.save()
                saved_to.push(rec_bb_id)
            }
            log.debug('Susccessfully Create Bon Bahan id: ' + rec_bb_id)

        } catch (error) {
            throw ('Failed to create bon bahan! ' + error)
        }

        return saved_to
    }

    function onRequest(context) {
        let form = getParameter()
        var body_startdate = form.getField("custpage_startdate")
        var body_enddate = form.getField("custpage_enddate")
        var body_instruksi_kerja = form.getField("custpage_instruksi_kerja")
        var body_to_location = form.getField('custpage_to_location')
        var body_class = form.getField("custpage_class")

        var iksublist = form.getSublist({ id: "custpage_sublist" })
        var sub_bahan_fld = iksublist.getField({ id: "sub_bahan" })
        var sub_from_location_fld = iksublist.getField({ id: "sub_from_location" })
        var sub_warna_fld = iksublist.getField({ id: "sub_warna" })

        var params = context.request.parameters
        var startdate = params["custpage_startdate"]
        var enddate = params["custpage_enddate"]
        var instruksi_kerja = params["custpage_instruksi_kerja"]
        var to_location = params["custpage_to_location"]
        var ik_class = params["custpage_class"]

        if (context.request.method === 'GET') {
            form.addSubmitButton({ label: 'Get Data' });
            context.response.writePage(form);
            // form.clientScriptModulePath = 'SuiteScripts/Metrodata/Bon Bahan(SL)/test_sl_cs_create_bon_bahan.js';
        } else {
            body_startdate.defaultValue = startdate
            body_startdate.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            body_enddate.defaultValue = enddate
            body_enddate.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            body_class.defaultValue = ik_class
            body_class.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            body_to_location.defaultValue = to_location
            body_class.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })


            body_instruksi_kerja.defaultValue = instruksi_kerja
            body_instruksi_kerja.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            // body_instruksi_kerja.defaultValue = instruksi_kerja
            // body_instruksi_kerja.updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.HIDDEN
            // })
            // var custpage_instruksi_kerja_display_fld = form.addField({
            //     id: custpage_instruksi_kerja_display,
            //     type: serverWidget.FieldType.MULTISELECT,
            //     label: 'Instruksi Kerja',
            //     source: 'transaction'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // });
            // custpage_instruksi_kerja_display_fld.defaultValue = instruksi_kerja

            var data = {
                startdate: startdate,
                enddate: enddate,
                instruksi_kerja: instruksi_kerja,
                to_location: to_location,
                // from_location: from_location,
                ik_class: ik_class,
            }
            log.debug('data', data)

            // Step 1 Showing Result IK 
            var list_item_ik = getItemIK(data)

            if (list_item_ik.length > 0) {
                for (var i = 0; i < list_item_ik.length; i++) {

                    iksublist.setSublistValue({
                        id: "sub_ik",
                        line: i,
                        value: list_item_ik[i].ik_id
                    })
                    iksublist.setSublistValue({
                        id: "sub_item",
                        line: i,
                        value: list_item_ik[i].ik_item
                    })
                    iksublist.setSublistValue({
                        id: "sub_quantity",
                        line: i,
                        value: list_item_ik[i].ik_item_qty
                    })
                    iksublist.setSublistValue({
                        id: "sub_bahan",
                        line: i,
                        value: list_item_ik[i].ik_item_bahan
                    })
                    iksublist.setSublistValue({
                        id: "sub_warna",
                        line: i,
                        value: list_item_ik[i].ik_item_warna
                    })

                    // sub_bahan_fld.updateDisplayType({
                    //     displayType: serverWidget.FieldDisplayType.ENTRY
                    // })
                    // sub_warna_fld.updateDisplayType({
                    //     displayType: serverWidget.FieldDisplayType.ENTRY
                    // })
                }
            }

            let checked_data = []
            let count = context.request.getLineCount("custpage_sublist");

            for (var i = 0; i < count; i++) {
                var pickedTrx = context.request.getSublistValue({
                    group: "custpage_sublist",
                    name: "sub_checkbox",
                    line: i
                });

                if (pickedTrx == 'T' || pickedTrx == true) {
                    var ik_id = context.request.getSublistValue({
                        group: "custpage_sublist",
                        name: "sub_ik",
                        line: i
                    });
                    var ik_item = context.request.getSublistValue({
                        group: "custpage_sublist",
                        name: "sub_item",
                        line: i
                    });
                    var ik_bahan = context.request.getSublistValue({
                        group: "custpage_sublist",
                        name: "sub_bahan",
                        line: i
                    });
                    var ik_from_location = context.request.getSublistValue({
                        group: "custpage_sublist",
                        name: "sub_from_location",
                        line: i
                    });
                    var ik_warna = context.request.getSublistValue({
                        group: "custpage_sublist",
                        name: "sub_warna",
                        line: i
                    });
                    var ik_item_qty = Number(context.request.getSublistValue({
                        group: "custpage_sublist",
                        name: "sub_quantity",
                        line: i
                    }));

                    if (checked_data.some((data) => data.ik_id == ik_id && data.ik_from_location == ik_from_location)) {
                        let get_index = checked_data.findIndex((data) => data.ik_id == ik_id)

                        checked_data[i].line.push({
                            ik_item: ik_item,
                            ik_item_qty: ik_item_qty,
                            ik_bahan: ik_bahan,
                            ik_warna: ik_warna,
                        })

                    } else {
                        checked_data.push({
                            ik_item: ik_item,
                            ik_from_location: ik_from_location,
                            line: [{
                                ik_item: ik_item,
                                ik_item_qty: ik_item_qty,
                                ik_bahan: ik_bahan,
                                ik_warna: ik_warna,
                            },
                            ]
                        })
                    }

                }
            }

            let bb_id = createBonBahan(checked_data, data)



            form.addSubmitButton({ label: 'Create Bon Bahan' });
            if (checked_data.length > 0) {
                let get_tranid = getTranid(bb_id)
                confimationForm(context, get_tranid)
            } else {
                context.response.writePage(form);
            }
        }
    }

    return {
        onRequest: onRequest
    }
});

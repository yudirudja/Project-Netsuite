/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/record', "N/runtime"], function (search, serverWidget, log, task, redirect, record, runtime) {

    function getClass() {
        let filtering = ['42', '49', '41', '40']
        let result = []
        var classificationSearchObj = search.create({
            type: "classification",
            filters:
                [
                ],
            columns:
                [
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let i = 0; i < classificationSearchObj.length; i++) {
            let name = classificationSearchObj[i].getValue(classificationSearchObj[i].columns[0])
            let internal_id = classificationSearchObj[i].getValue(classificationSearchObj[i].columns[1])

            if (filtering.includes(internal_id)) {
                result.push({
                    internal_id: internal_id,
                    name: name
                })
            }
        }
        return result;
    }

    function confimationForm(context, data) {
        // Create a new form for the confirmation page
        var confirmationForm = serverWidget.createForm({
            title: 'Berita Serah Terima Created'
        });

        // Add a message field to show the journal entry number
        var numbersHtml = data.map(item => `<li> ${item}</li>`).join('')
        //  ubah array
        confirmationForm.addField({
            id: 'custpage_confirmation',
            type: serverWidget.FieldType.INLINEHTML,
            label: ' '
        }).defaultValue = `<h2>Berita Serah Terima Created: ${numbersHtml} </h2>`;

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
        var form = serverWidget.createForm({ title: 'Create Berita Serah Terima' });

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
            // source: 'classification',
            label: 'To Class'
        })

        custpage_class_fld.addSelectOption({
            value: 0,
            text: ''
        });
        let get_class = getClass()
        for (let i = 0; i < get_class.length; i++) {
            custpage_class_fld.addSelectOption({
                value: get_class[i].internal_id,
                text: get_class[i].name
            });

        }
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
        var from_location = form.addField({
            id: "custpage_from_location",
            type: serverWidget.FieldType.SELECT,
            source: "location",
            label: 'From Location'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });

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
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        var sub_item_text_fld = iksublist.addField({
            id: "sub_item_text",
            type: serverWidget.FieldType.TEXT,
            source: 'item',
            label: 'Item'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_qty_fld = iksublist.addField({
            id: "sub_qty_build",
            type: serverWidget.FieldType.INTEGER,
            label: 'Quantity Built'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        return form
    }

    function getItemIKold(data) {
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
            ["mainline", "is", "F"],
            "AND",
            ["item.type", "anyof", "InvtPart", "Assembly"],
        ]

        if (instruksi_kerja) {
            filter.push("AND", ["numbertext", "contains", instruksi_kerja])
        }
        if (to_location) {
            filter.push("AND", ["location", "anyof", to_location],)
        }
        if (class_) {
            filter.push("AND", ["class", "anyof", class_],)
        }

        var ik_search = search.create({
            type: "workorder",
            filters: filter,
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "custbody3", label: "Shoes Name 1" }),
                    search.createColumn({ name: "custbody5", label: "Shoes Name 2" }),
                    search.createColumn({ name: "custbody7", label: "Shoes Name 3" }),
                    search.createColumn({ name: "custbody9", label: "Shoes Name 4" }),
                    search.createColumn({ name: "custbody11", label: "Shoes Name 5" }),
                    search.createColumn({ name: "custbody13", label: "Shoes Name 6" }),
                    search.createColumn({ name: "custbody42", label: "Shoes Quantity Built 1" }),
                    search.createColumn({ name: "custbody41", label: "Shoes Quantity Built 2" }),
                    search.createColumn({ name: "custbody8", label: "Shoes Quantity 3" }),
                    search.createColumn({ name: "custbody44", label: "Shoes Quantity Built 4" }),
                    search.createColumn({ name: "custbody45", label: "Shoes Quantity Built 5" }),
                    search.createColumn({ name: "custbody46", label: "Shoes Quantity Built 6" }),
                    search.createColumn({ name: "item", label: "Item" })
                ]
        });
        var startrow = 0
        var list_item_ik = []

        do {
            var ik_result = ik_search.run().getRange(startrow, startrow + 1000)
            if (ik_result.length > 0) {
                for (var i = 0; i < ik_result.length; i++) {

                    var internal_id = ik_result[i].getValue({ name: "internalid" })
                    var doc_number = ik_result[i].getValue({ name: "tranid" })
                    var shoes_name1 = ik_result[i].getValue({ name: "custbody3" })
                    var shoes_name2 = ik_result[i].getValue({ name: "custbody5" })
                    var shoes_name3 = ik_result[i].getValue({ name: "custbody7" })
                    var shoes_name4 = ik_result[i].getValue({ name: "custbody9" })
                    var shoes_name5 = ik_result[i].getValue({ name: "custbody11" })
                    var shoes_name6 = ik_result[i].getValue({ name: "custbody13" })
                    var shoes_quantity_built1 = ik_result[i].getValue({ name: "custbody42" })
                    var shoes_quantity_built2 = ik_result[i].getValue({ name: "custbody41" })
                    var shoes_quantity_built3 = ik_result[i].getValue({ name: "custbody8" })
                    var shoes_quantity_built4 = ik_result[i].getValue({ name: "custbody44" })
                    var shoes_quantity_built5 = ik_result[i].getValue({ name: "custbody45" })
                    var shoes_quantity_built6 = ik_result[i].getValue({ name: "custbody46" })
                    var assembly_item = ik_result[i].getValue({ name: "item" })

                    list_item_ik.push({
                        internal_id: internal_id,
                        doc_number: doc_number,
                        assembly_item: assembly_item,
                        line: [
                            {
                                shoes_name: shoes_name1,
                                shoes_quantity_built: shoes_quantity_built1
                            },
                            {
                                shoes_name: shoes_name2,
                                shoes_quantity_built: shoes_quantity_built2
                            },
                            {
                                shoes_name: shoes_name3,
                                shoes_quantity_built: shoes_quantity_built3
                            },
                            {
                                shoes_name: shoes_name4,
                                shoes_quantity_built: shoes_quantity_built4
                            },
                            {
                                shoes_name: shoes_name5,
                                shoes_quantity_built: shoes_quantity_built5
                            },
                            {
                                shoes_name: shoes_name6,
                                shoes_quantity_built: shoes_quantity_built6
                            },
                        ]
                    })

                }
            }

            startrow += 1000
        } while (ik_result.length == 1000);
        log.debug('IK Result length: ' + list_item_ik.length, list_item_ik)

        return list_item_ik

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
            ["mainline", "is", "F"],
            "AND",
            ["item.type", "anyof", "InvtPart", "Assembly"],
        ]

        if (instruksi_kerja) {
            filter.push("AND", ["numbertext", "contains", instruksi_kerja])
        }
        if (to_location) {
            filter.push("AND", ["location", "anyof", to_location],)
        }
        if (class_) {
            filter.push("AND", ["class", "anyof", class_],)
        }

        var ik_search = search.create({
            type: "workorder",
            filters: filter,
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({ name: "quantity", label: "Quantity" }),
                ]
        });
        var startrow = 0
        var list_item_ik = []

        do {
            var ik_result = ik_search.run().getRange(startrow, startrow + 1000)
            if (ik_result.length > 0) {
                for (var i = 0; i < ik_result.length; i++) {

                    var internal_id = ik_result[i].getValue({ name: "internalid" })
                    var doc_number = ik_result[i].getValue({ name: "tranid" })
                    var item = ik_result[i].getValue({ name: "item" })
                    var item_text = ik_result[i].getText({ name: "item" })
                    var quantity = ik_result[i].getValue({ name: "quantity" })

                    if (quantity != 0) {
                        list_item_ik.push({
                            internal_id: internal_id,
                            doc_number: doc_number,
                            item: item,
                            item_text: item_text,
                            quantity: quantity,
                        })
                        
                    }

                }
            }

            startrow += 1000
        } while (ik_result.length == 1000);
        log.debug('IK Result length: ' + list_item_ik.length, list_item_ik)

        return list_item_ik

    }

    function createBST(data, params) {

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
                    value: params.from_location
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
                    fieldId: "custbody_me_bst",
                    value: true
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
                        value: data[i].line[j].item
                    })
                    rec_bb.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        // value: data[i].line[j].qty_built
                        value: data[i].line[j].qty_built
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
        let body_startdate = form.getField("custpage_startdate")
        let body_enddate = form.getField("custpage_enddate")
        let body_instruksi_kerja = form.getField("custpage_instruksi_kerja")
        let body_to_location = form.getField("custpage_to_location")
        let body_from_location = form.getField("custpage_from_location")
        let body_class = form.getField("custpage_class")

        let iksublist = form.getSublist({ id: "custpage_sublist" })
        let sub_bahan_fld = iksublist.getField({ id: "sub_bahan" })
        let sub_location_fld = iksublist.getField({ id: "sub_location" })
        let sub_warna_fld = iksublist.getField({ id: "sub_warna" })

        let params = context.request.parameters
        let startdate = params["custpage_startdate"]
        let enddate = params["custpage_enddate"]
        let instruksi_kerja = params["custpage_instruksi_kerja"]
        let to_location = params["custpage_to_location"]
        let from_location = params["custpage_from_location"]
        let ik_class = params["custpage_class"]

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
            body_from_location.defaultValue = from_location
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
                from_location: from_location,
                ik_class: ik_class,
            }
            log.debug('data', data)

            // Step 1 Showing Result IK 
            var list_item_ik = getItemIK(data)

            for (let i = 0; i < list_item_ik.length; i++) {
                    let set_ik = iksublist.setSublistValue({
                        id: "sub_ik",
                        line: i,
                        value: list_item_ik[i].internal_id
                    })
                    let set_assembly_item = iksublist.setSublistValue({
                        id: "sub_item",
                        line: i,
                        value: list_item_ik[i].item
                    })
                    let set_size = iksublist.setSublistValue({
                        id: "sub_item_text",
                        line: i,
                        value: list_item_ik[i].item_text
                    })
                    let set_qty_build = iksublist.setSublistValue({
                        id: "sub_qty_build",
                        line: i,
                        value: list_item_ik[i].quantity
                    })



            }


            let checked_data = []
            let count = context.request.getLineCount("custpage_sublist");

            for (let i = 0; i < count; i++) {
                let isChecked = context.request.getSublistValue({
                    group: "custpage_sublist",
                    name: "sub_checkbox",
                    line: i
                });

                if (isChecked == 'T' || isChecked == true) {
                    let get_ik = context.request.getSublistValue({
                        group: "custpage_sublist",
                        name: "sub_ik",
                        line: i,
                    })
                    let get_item = context.request.getSublistValue({
                        group: "custpage_sublist",
                        name: "sub_item",
                        line: i,
                    })
                    // let get_size = context.request.getSublistValue({
                    //     group: "custpage_sublist",
                    //     name: "sub_item_text",
                    //     line: i,
                    // })
                    let get_qty_build = context.request.getSublistValue({
                        group: "custpage_sublist",
                        name: "sub_qty_build",
                        line: i,
                    })

                    if (checked_data.some((data) => data.id == get_ik)) {
                        let get_index = checked_data.findIndex((data) => data.id == get_ik);

                        checked_data[get_index].line.push({
                            item: get_item,
                            qty_built: get_qty_build,
                        })


                    } else {
                        checked_data.push({
                            id: get_ik,
                            line: [
                                {
                                    item: get_item,
                                    qty_built: get_qty_build,
                                }
                            ]
                        })
                    }
                }

            }

            let bb_id = createBST(checked_data, data)



            form.addSubmitButton({ label: 'Create Berita Serah terima' });
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

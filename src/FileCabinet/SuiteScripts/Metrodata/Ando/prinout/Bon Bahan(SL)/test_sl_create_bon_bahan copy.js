/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/record', "N/runtime"],
    function (search, serverWidget, log, task, redirect, record, runtime) {
        const custpage_startdate = 'custpage_startdate'
        const custpage_enddate = 'custpage_enddate'
        const custpage_class = 'custpage_class'
        const custpage_instruksi_kerja = 'custpage_instruksi_kerja'
        const custpage_instruksi_kerja_display = 'custpage_instruksi_kerja_display'
        const custpage_to_location = 'custpage_to_location'
        const custpage_sublist = 'custpage_sublist'
        const sub_checkbox = 'sub_checkbox'
        const sub_ik = 'sub_ik'
        const sub_item = 'sub_item'
        const sub_bahan = 'sub_bahan'
        const sub_location = 'sub_location'
        const sub_to_location = 'sub_to_location'
        const sub_warna = 'sub_warna'
        const sub_quantity = 'sub_quantity'


        const custbody_penerima = 'custbody49'
        const custbody_gudang = 'custbody50'
        const custbody_ppc = 'custbody51'

        function getParameter() {
            var form = serverWidget.createForm({ title: 'Create Bon Bahan' });

            var custpage_startdate_fld = form.addField({
                id: custpage_startdate,
                type: serverWidget.FieldType.DATE,
                label: 'Start Date',
            })
            custpage_startdate_fld.isMandatory = true;
            var custpage_enddate_fld = form.addField({
                id: custpage_enddate,
                type: serverWidget.FieldType.DATE,
                label: 'End Date'
            })
            custpage_enddate_fld.isMandatory = true;
            var custpage_class_fld = form.addField({
                id: custpage_class,
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
                id: custpage_instruksi_kerja,
                type: serverWidget.FieldType.TEXT,
                label: 'Instruksi Kerja'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });
            var to_location = form.addField({
                id: custpage_to_location,
                type: serverWidget.FieldType.SELECT,
                source: "location",
                label: 'To Location'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });
            to_location.isMandatory = true;

            var iksublist = form.addSublist({
                id: custpage_sublist,
                type: serverWidget.SublistType.LIST,
                label: 'Instruksi Kerja'
            })
            iksublist.addMarkAllButtons()


            var sub_checkbox_fld = iksublist.addField({
                id: sub_checkbox,
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Check'
            });

            var sub_ik_fld = iksublist.addField({
                id: sub_ik,
                type: serverWidget.FieldType.SELECT,
                label: 'IK #',
                source: 'transaction'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });

            var sub_item_fld = iksublist.addField({
                id: sub_item,
                type: serverWidget.FieldType.SELECT,
                label: 'Item',
                source: 'item'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            var sub_bahan_fld = iksublist.addField({
                id: sub_bahan,
                type: serverWidget.FieldType.TEXT,
                label: 'Bahan'
            })
            var sub_location_fld = iksublist.addField({
                id: sub_location,
                type: serverWidget.FieldType.SELECT,
                source: "location",
                label: 'From Location'
            })
            var sub_to_location_fld = iksublist.addField({
                id: sub_to_location,
                type: serverWidget.FieldType.SELECT,
                source: "location",
                label: 'From Location'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            var sub_warna_fld = iksublist.addField({
                id: sub_warna,
                type: serverWidget.FieldType.TEXT,
                label: 'Warna'
            })
            var sub_quantity_fld = iksublist.addField({
                id: sub_quantity,
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

        function createBonBahan(data) {
            var startdate = data.startdate
            var enddate = data.enddate
            var instruksi_kerja = data.instruksi_kerja
            var to_location = data.to_location
            var final_data = data.final_data

            log.debug("data",data)

            try {
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
                    value: to_location
                })
                // rec_bb.setValue({
                //     fieldId: 'tolocation',
                //     value: 27
                // })
                rec_bb.setValue({
                    fieldId: 'class',
                    value: 39
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
                    fieldId: custbody_penerima,
                    value: 4681
                })
                rec_bb.setValue({
                    fieldId: custbody_gudang,
                    value: 5336
                })
                rec_bb.setValue({
                    fieldId: custbody_ppc,
                    value: 5335
                })


                for (var i in final_data) {
                    var ik_item = final_data[i].ik_item
                    var ik_item_qty = final_data[i].ik_item_qty
                    var ik_id = final_data[i].ik_id

                    rec_bb.setValue({
                    fieldId: 'location',
                    value: final_data[i].ik_from_location
                })

                    rec_bb.selectNewLine({
                        sublistId: 'item'
                    })

                    rec_bb.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: ik_item
                    })

                    rec_bb.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: ik_item_qty
                    })

                    rec_bb.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_nomor_ik_1',
                        value: ik_id[0] ? ik_id[0] : null
                    })
                    rec_bb.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_nomor_ik_2',
                        value: ik_id[1] ? ik_id[1] : null
                    })
                    rec_bb.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_nomor_ik_3',
                        value: ik_id[2] ? ik_id[2] : null
                    })
                    rec_bb.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_nomor_ik_4',
                        value: ik_id[3] ? ik_id[3] : null
                    })

                    rec_bb.commitLine({
                        sublistId: 'item'
                    })

                }

                var rec_bb_id = rec_bb.save()
                log.debug('Susccessfully Create Bon Bahan id: ' + rec_bb_id)

            } catch (error) {
                throw ('Failed to create bon bahan! ' + error)
            }

            return rec_bb_id
        }

        function onRequest(context) {
            var form = getParameter()
            var body_startdate = form.getField(custpage_startdate)
            var body_enddate = form.getField(custpage_enddate)
            var body_instruksi_kerja = form.getField(custpage_instruksi_kerja)
            var body_to_location = form.getField(custpage_to_location)
            var body_class = form.getField(custpage_class)

            //SUBLIST
            var iksublist = form.getSublist({ id: custpage_sublist })
            var sub_bahan_fld = iksublist.getField({ id: sub_bahan })
            var sub_location_fld = iksublist.getField({ id: sub_location })
            var sub_warna_fld = iksublist.getField({ id: sub_warna })
            var sub_warna_fld = iksublist.getField({ id: sub_warna })

            var params = context.request.parameters
            var startdate = params[custpage_startdate]
            var enddate = params[custpage_enddate]
            var instruksi_kerja = params[custpage_instruksi_kerja]
            var to_location = params[custpage_to_location]
            var ik_class = params[custpage_class]

            var data = {
                startdate: startdate,
                enddate: enddate,
                instruksi_kerja: instruksi_kerja,
                to_location: to_location,
                ik_class: ik_class,
                final_data: {}
            }

            if (context.request.method === 'GET') {
                form.addSubmitButton({ label: 'Get Data' });
                form.clientScriptModulePath = 'SuiteScripts/Metrodata/Bon Bahan(SL)/test_sl_cs_create_bon_bahan.js';
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
                log.debug('data', data)

                // Step 1 Showing Result IK 
                var list_item_ik = getItemIK(data)

                if (list_item_ik.length > 0) {
                    for (var i = 0; i < list_item_ik.length; i++) {
                        var ik_id = list_item_ik[i].ik_id
                        var ik_item = list_item_ik[i].ik_item
                        var ik_item_qty = list_item_ik[i].ik_item_qty
                        var ik_item_warna = list_item_ik[i].ik_item_warna
                        var ik_item_bahan = list_item_ik[i].ik_item_bahan

                        iksublist.setSublistValue({
                            id: sub_ik,
                            line: i,
                            value: ik_id
                        })
                        iksublist.setSublistValue({
                            id: sub_item,
                            line: i,
                            value: ik_item
                        })
                        iksublist.setSublistValue({
                            id: sub_quantity,
                            line: i,
                            value: ik_item_qty
                        })
                        iksublist.setSublistValue({
                            id: sub_bahan,
                            line: i,
                            value: ik_item_bahan
                        })
                        iksublist.setSublistValue({
                            id: sub_warna,
                            line: i,
                            value: ik_item_warna
                        })

                        // sub_bahan_fld.updateDisplayType({
                        //     displayType: serverWidget.FieldDisplayType.ENTRY
                        // })
                        // sub_warna_fld.updateDisplayType({
                        //     displayType: serverWidget.FieldDisplayType.ENTRY
                        // })
                    }
                }


                // Step 2 Create Bon Bahan
                var list_item_ik_final = {}

                var count = context.request.getLineCount({
                    group: custpage_sublist
                });
                for (var i = 0; i < count; i++) {
                    var pickedTrx = context.request.getSublistValue({
                        group: custpage_sublist,
                        name: sub_checkbox,
                        line: i
                    });

                    if (pickedTrx == 'T' || pickedTrx == true) {
                        var ik_id = context.request.getSublistValue({
                            group: custpage_sublist,
                            name: sub_ik,
                            line: i
                        });
                        var ik_item = context.request.getSublistValue({
                            group: custpage_sublist,
                            name: sub_item,
                            line: i
                        });
                        var ik_bahan = context.request.getSublistValue({
                            group: custpage_sublist,
                            name: sub_bahan,
                            line: i
                        });
                        var ik_from_location = context.request.getSublistValue({
                            group: custpage_sublist,
                            name: sub_location,
                            line: i
                        });
                        var ik_warna = context.request.getSublistValue({
                            group: custpage_sublist,
                            name: sub_warna,
                            line: i
                        });
                        var ik_item_qty = Number(context.request.getSublistValue({
                            group: custpage_sublist,
                            name: sub_quantity,
                            line: i
                        }));
                        if (!list_item_ik_final[ik_item]) {
                            list_item_ik_final[ik_item] = {
                                ik_item: ik_item,
                                ik_from_location: ik_from_location,
                                ik_item_qty: 0,
                                ik_id: [],
                                ik_bahan: [],
                                ik_warna: []
                            }
                        }

                        list_item_ik_final[ik_item].ik_item_qty += ik_item_qty
                        if (list_item_ik_final[ik_item].ik_id.indexOf(ik_id) == -1) {
                            list_item_ik_final[ik_item].ik_id.push(ik_id)
                        }
                        if (list_item_ik_final[ik_item].ik_bahan.indexOf(ik_bahan) == -1) {
                            list_item_ik_final[ik_item].ik_bahan.push(ik_bahan)
                        }
                        if (list_item_ik_final[ik_item].ik_warna.indexOf(ik_warna) == -1) {
                            list_item_ik_final[ik_item].ik_warna.push(ik_warna)
                        }

                    }
                }
                log.debug('Object.keys(list_item_ik_final).length ' + Object.keys(list_item_ik_final).length, list_item_ik_final)

                if (Object.keys(list_item_ik_final).length > 0) {
                    data.final_data = list_item_ik_final
                    var bb_id = createBonBahan(data)
                    if (bb_id) {
                        redirect.toRecord({
                            type: record.Type.TRANSFER_ORDER,
                            id: bb_id
                        });
                    }
                }

                form.addSubmitButton({ label: 'Create Bon Bahan' });
            }
            context.response.writePage(form);
            var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
            log.debug('Remaining Usage FINALE:', remainingUsage);
        }

        return {
            onRequest: onRequest
        }
    });

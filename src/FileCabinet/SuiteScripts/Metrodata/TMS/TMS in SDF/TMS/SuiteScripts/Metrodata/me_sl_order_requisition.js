/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(["N/redirect", "N/ui/serverWidget", "N/task", "N/search", 'N/file', 'N/url', './lib/moment.min.js', 'N/record',"N/runtime"],
function (redirect, serverWidget, task, search, file, url, moment, record, runtime) {
 
    var BODY = {
        title: 'Order Requisition',
        pr_number: 'custpage_pr_number',
        eta_date: 'custpage_eta_date',
        etd_date: 'custpage_etd_date',
        memo_pr: 'custpage_memo_pr',

        tanggal_po: 'custpage_tanggal_po',
        payment_condition: 'custpage_payment_condition',
        delivery_condition: 'custpage_delivery_condition',
        remarks: 'custpage_remarks',
        total_pr: 'custpage_total_pr',



        sub_item_sublist: 'custpage_sublist_item',
        sub_checkbox:'checkbox',
        sub_pr_number: 'pr_number',
        sub_business_unit: 'business_unit',
        sub_cost_center: 'cost_center',
        sub_department: 'department',
        sub_location: 'location',

        sub_currency: 'currency',
        sub_item_id_custom: 'item_id_custom',
        sub_product_name: 'product_name',
        sub_item_quantity: 'item_quantity',
        sub_vendor: 'vendor',

        sub_unit_price_b4_disc: 'unit_price_b4_disc',
        sub_disc_percentage: 'disc_percentage',
        sub_disc_amount: 'disc_amount',
        sub_unit_price_a4_disc: 'unit_price_a4_disc',
        sub_amount_price_a4_disc: 'amount_price_a4_disc',

        sub_taxcode: 'taxcode',
        sub_taxrate: 'taxrate',
        sub_amount_price_a4_disc_tax: 'amount_price_a4_disc_tax',
        sub_rfq_transaction: 'rfq_transaction'
    }

    function getParameters(form){

        var reportFilter = form.addFieldGroup({
            id: 'report_filter',
            label: 'Filter'
        });
        

        var body_pr_number = form.addField({
            id: BODY.pr_number,
            type: serverWidget.FieldType.SELECT,
            label: 'PR Number',
            container: 'report_filter'
        })
        var get_pr = searchPR()
        for(var pr=0; pr < get_pr.length; pr++){
            body_pr_number.addSelectOption({value: get_pr[pr].value, text: get_pr[pr].text})
        }
        
        var body_etd_date = form.addField({
            id: BODY.etd_date,
            type: serverWidget.FieldType.DATE,
            label: 'ETD',
            container: 'report_filter'
        })
        var body_eta_date = form.addField({
            id: BODY.eta_date,
            type: serverWidget.FieldType.DATE,
            label: 'ETA',
            container: 'report_filter'
        })
        // var body_memo_pr = form.addField({
        //     id: BODY.memo_pr,
        //     type: serverWidget.FieldType.TEXT,
        //     label: 'Memo',
        //     container: 'report_filter'
        // })
        var body_tanggal_po = form.addField({
            id: BODY.tanggal_po,
            type: serverWidget.FieldType.DATE,
            label: 'Tanggal PO',
            container: 'report_filter'
        })
        body_tanggal_po.defaultValue = moment(new Date()).zone('+07:00').format('D/M/YYYY')

        var body_delivery_condition = form.addField({
            id: BODY.delivery_condition,
            type: serverWidget.FieldType.SELECT,
            source: 'incoterm',
            label: 'Delivery Condition',
            container: 'report_filter'
        })
        var body_remarks = form.addField({
            id: BODY.remarks,
            type: serverWidget.FieldType.TEXTAREA,
            label: 'Remarks',
            container: 'report_filter'
        })
        var body_total_pr = form.addField({
            id: BODY.total_pr,
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total',
            container: 'report_filter'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });

        // SUBLIST
        var item_sublist = form.addSublist({
            id: BODY.sub_item_sublist,
            type: serverWidget.SublistType.LIST,
            label: 'Item'
        });
        var sub_checkbox = item_sublist.addField({
            id: BODY.sub_checkbox,
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Check'
        })
        var sub_pr_number = item_sublist.addField({
            id: BODY.sub_pr_number,
            type: serverWidget.FieldType.SELECT,
            label: 'PR Number',
            source: 'transaction'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_business_unit = item_sublist.addField({
            id: BODY.sub_business_unit,
            type: serverWidget.FieldType.SELECT,
            label: 'Business Unit',
            source: 'classification'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_cost_center = item_sublist.addField({
            id: BODY.sub_cost_center,
            type: serverWidget.FieldType.SELECT,
            label: 'Cost Center',
            source: 'cseg_me_cost_center'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_department = item_sublist.addField({
            id: BODY.sub_department,
            type: serverWidget.FieldType.SELECT,
            label: 'Department',
            source: 'department'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_location = item_sublist.addField({
            id: BODY.sub_location,
            type: serverWidget.FieldType.SELECT,
            label: 'Location',
            source: 'location'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_currency = item_sublist.addField({
            id: BODY.sub_currency,
            type: serverWidget.FieldType.SELECT,
            label: 'Currency',
            source: 'currency'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_item_id_custom = item_sublist.addField({
            id: BODY.sub_item_id_custom,
            type: serverWidget.FieldType.TEXT,
            label: 'Item ID'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_product_name = item_sublist.addField({
            id: BODY.sub_product_name,
            type: serverWidget.FieldType.SELECT,
            label: 'Product Name',
            source: 'item'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_item_quantity = item_sublist.addField({
            id: BODY.sub_item_quantity,
            type: serverWidget.FieldType.TEXT,
            label: 'Item Quantity'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED
        });
        var sub_vendor = item_sublist.addField({
            id: BODY.sub_vendor,
            type: serverWidget.FieldType.SELECT,
            label: 'Vendor',
            source: 'vendor'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_unit_price_b4_disc = item_sublist.addField({
            id: BODY.sub_unit_price_b4_disc,
            type: serverWidget.FieldType.CURRENCY,
            label: 'Unit Price Before Disc'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_disc_percentage = item_sublist.addField({
            id: BODY.sub_disc_percentage,
            type: serverWidget.FieldType.PERCENT,
            label: 'Disc Percentage'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_disc_amount = item_sublist.addField({
            id: BODY.sub_disc_amount,
            type: serverWidget.FieldType.CURRENCY,
            label: 'Disc Amount'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_unit_price_a4_disc = item_sublist.addField({
            id: BODY.sub_unit_price_a4_disc,
            type: serverWidget.FieldType.CURRENCY,
            label: 'Unit Price After Disc'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
        var sub_amount_price_a4_disc = item_sublist.addField({
            id: BODY.sub_amount_price_a4_disc,
            type: serverWidget.FieldType.CURRENCY,
            label: 'Amount Price After Disc'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });
        var sub_taxcode = item_sublist.addField({
            id: BODY.sub_taxcode,
            type: serverWidget.FieldType.SELECT,
            source: 'salestaxitem',
            label: 'Taxcode'
        })
        var sub_taxrate = item_sublist.addField({
            id: BODY.sub_taxrate,
            type: serverWidget.FieldType.PERCENT,
            label: 'Taxrate'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });
        var sub_amount_price_a4_disc_tax = item_sublist.addField({
            id: BODY.sub_amount_price_a4_disc_tax,
            type: serverWidget.FieldType.CURRENCY,
            label: 'Amount Price After Disc Tax'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });
        var sub_rfq_transaction = item_sublist.addField({
            id: BODY.sub_rfq_transaction,
            type: serverWidget.FieldType.SELECT,
            label: 'RFQ Transaction',
            source: 'customrecord_me_csrec_rfq'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

    }

    function searchPR(){
        var pr_search = search.create({
           type: "purchaserequisition",
           filters:
           [
              ["type","anyof","PurchReq"], 
              "AND", 
              ["status","anyof","PurchReq:B","PurchReq:D"], 
              "AND", 
              ["approvalstatus","anyof","2"]
           ],
           columns:
           [
              search.createColumn({name: "tranid", label: "Document Number"})
           ]
        });
        
        var startrow = 0;
        var arr_pr = []
        do {
           var result = pr_search.run().getRange({
              start: startrow,
              end: startrow + 1000
           });

           for(var i = 0; i < result.length; i++){
              var pr_id = result[i].id
              var pr_number = result[i].getValue(result[i].columns[0])
              var check_existing = arr_pr.findIndex(val => val.value == pr_id)
            //   log.debug('check_existing', check_existing)
              if(check_existing == -1){
                 arr_pr.push({value: pr_id, text: pr_number})
              }
           }

           startrow += 1000
        } while (result.length == 1000);
        log.debug('arr_pr', arr_pr)
        
        return arr_pr
    }

    function searchItemPR(param){
        var filters = [
            ["type","anyof","PurchReq"], 
            "AND", 
            ["status","anyof","PurchReq:B","PurchReq:D"], 
            "AND", 
            ["taxline","is","F"], 
            "AND", 
            ["mainline","is","F"], 
            "AND", 
            ["custcol_me_rfq_number","noneof","@NONE@"], 
            "AND", 
            ["approvalstatus","anyof","2"], 
            "AND", 
            ["purchaseorder","anyof","@NONE@"]
        ]
        var pr_number = param.pr_number
        var eta_date = param.eta_date
        var etd_date = param.etd_date
        if(pr_number.length > 0) {
            filters.push(
                "AND", 
                ["internalid","anyof",pr_number]
             )
        }
        log.debug('filters searchItemPR', filters)
        var itemPRSearch = search.create({
            type: "purchaserequisition",
            filters: filters,
            columns:
            [
                search.createColumn({name: "tranid", label: "Document Number"}),
                search.createColumn({name: "class", label: "Business Unit"}),
                search.createColumn({name: "classnohierarchy", label: "Business Unit (no hierarchy)"}),
                search.createColumn({name: "cseg_me_cost_center", label: "ME - Cost Center"}),
                search.createColumn({name: "department", label: "Department"}),
                //5
                search.createColumn({name: "location", label: "Location"}),
                search.createColumn({name: "custbody_me_pr_currency", label: "Currency"}),
                search.createColumn({name: "trandate", label: "Date"}),
                search.createColumn({
                    name: "custitem_me_item_id",
                    join: "item",
                    label: "ME - Item ID"
                }),
                search.createColumn({name: "item", label: "Item"}),
                //10
                search.createColumn({name: "quantity", label: "Quantity"}),
                search.createColumn({name: "custcol_me_rfq_number", label: "ME - RFQ Number"}),
                search.createColumn({
                    name: "altname",
                    join: "custcol_me_vendor_name",
                    label: "Name"
                }),
                search.createColumn({
                    name: "internalid",
                    join: "custcol_me_vendor_name",
                    label: "Internal ID"
                }),
                search.createColumn({name: "custcolme_unitprice_bfr_purchase_disc", label: "ME - Unit Price Before Discount"}),
                //15
                search.createColumn({name: "custcol_me_discount_percentage", label: "ME - Discount Percentage"}),
                search.createColumn({name: "custcol_me_discount_amount_purchase", label: "ME - Discount Amount"}),
                search.createColumn({name: "custcol_me_unit_price_after_discount", label: "ME - Unit Price After Discount (PR)"}),
                search.createColumn({name: "custcol_me_amount_pr", label: "ME - Amount "})
            ]
        });
        var startrow = 0;
        var data_final = []
        var data_obj = {}
        var vendor_taxcode = {}

        do {
            var result = itemPRSearch.run().getRange(startrow, startrow+1000)
            log.debug('result searchitempr length: ' + result.length, result)
            for(var i = 0; i < result.length; i ++){
                var pr_id = result[i].id
                var pr_tranid = result[i].getValue(result[i].columns[0])
                var business_unit_id = result[i].getValue(result[i].columns[2])
                var business_unit_name = result[i].getText(result[i].columns[2])
                var cost_center = result[i].getValue(result[i].columns[3])
                var department = result[i].getValue(result[i].columns[4])
                var location = result[i].getValue(result[i].columns[5])
                var currency = result[i].getValue(result[i].columns[6])
                var item_id_custom = result[i].getValue(result[i].columns[8]) || ''
                var item_id = result[i].getValue(result[i].columns[9])
                var item_name = result[i].getText(result[i].columns[9])
                var item_quantity = Number(result[i].getValue(result[i].columns[10])) || 0
                var vendor_id = result[i].getValue(result[i].columns[13]) || ''
                var vendor_name = result[i].getValue(result[i].columns[12]) || ''
                var rfq_number = result[i].getValue(result[i].columns[11])
                var unit_price_b4_disc = Number(result[i].getValue(result[i].columns[14])) || 0
                var disc_percentage = Number(result[i].getValue(result[i].columns[15]).split('%')[0]) || 0
                var disc_amount = Number(result[i].getValue(result[i].columns[16])) || 0
                var unit_price_a4_disc = Number(result[i].getValue(result[i].columns[17])) || 0
                var amount_price_a4_disc = Number(result[i].getValue(result[i].columns[18])) || 0
                log.debug('Data Line PR',
                    {
                        pr_id : pr_id,
                        pr_tranid : pr_tranid,
                        business_unit_id : business_unit_id,
                        business_unit_name : business_unit_name,
                        cost_center : cost_center,
                        department : department,
                        location : location,
                        currency : currency,
                        item_id_custom : item_id_custom,
                        item_id : item_id,
                        item_name : item_name,
                        item_quantity : item_quantity,
                        vendor_id : vendor_id,
                        vendor_name : vendor_name,
                        rfq_number : rfq_number,
                        unit_price_b4_disc : unit_price_b4_disc,
                        disc_percentage : disc_percentage,
                        disc_amount : disc_amount,
                        unit_price_a4_disc : unit_price_a4_disc,
                        amount_price_a4_disc : amount_price_a4_disc
                    }
                )

                if(!data_obj[business_unit_id + '_' + vendor_id]){
                    data_obj[business_unit_id + '_' + vendor_id] = {
                        lengths: 0,
                        business_unit_id : business_unit_id,
                        business_unit_name : business_unit_name,
                        vendor_id : vendor_id,
                        vendor_name : vendor_name,
                        cost_center : cost_center,
                        department : department,
                        location : location,
                        currency : currency,
                        data_item: []
                    }
                }
                if(!vendor_taxcode[vendor_id]){

                }
                data_obj[business_unit_id + '_' + vendor_id].lengths += 1
                data_obj[business_unit_id + '_' + vendor_id].data_item.push({
                    business_unit_id : business_unit_id,
                    business_unit_name : business_unit_name,
                    vendor_id : vendor_id,
                    vendor_name : vendor_name,
                    cost_center : cost_center,
                    department : department,
                    location : location,
                    currency : currency,
                    pr_id : pr_id,
                    pr_tranid : pr_tranid,
                    item_id_custom : item_id_custom ? item_id_custom : '',
                    item_id : item_id,
                    item_name : item_name,
                    item_quantity : item_quantity,
                    unit_price_b4_disc : unit_price_b4_disc,
                    disc_percentage : disc_percentage,
                    disc_amount : disc_amount,
                    unit_price_a4_disc : unit_price_a4_disc,
                    amount_price_a4_disc : amount_price_a4_disc,
                    taxcode : 5, //ID UNDEF PPN
                    taxrate : 0,
                    amount_price_a4_disc_tax : 0,
                    rfq_number : rfq_number
                })
            }

            startrow += 1000
        } while (result.length == 1000);
        log.debug('data_obj',data_obj)

        if(Object.keys(data_obj).length > 0){
            for(var key in data_obj){
                var data_item = data_obj[key].data_item
                if(data_item.length > 0){
                    for(var item = 0; item < data_item.length; item++){
                        data_final.push(data_item[item])
                    }
                }
            }
        }
        return data_final
    }

    function createPOtransform(data){
        var eta_date = data.eta_date
        var etd_date = data.etd_date
        // var memo_pr = data.memo_pr
        var tanggal_po = data.tanggal_po
        var payment_condition = data.payment_condition
        var delivery_condition = data.delivery_condition
        var remarks = data.remarks
        var data_po = data.data_po
        
        var new_po = []

        for(var i = 0; i < data_po.length; i++){
            var pr_number = data_po[i].pr_number
            var business_unit = data_po[i].business_unit
            var vendor = data_po[i].vendor
            var cost_center = data_po[i].cost_center
            var department = data_po[i].department
            var location = data_po[i].location
            var currency = data_po[i].currency
            var po_item = data_po[i].item_list
            try {
                
                var rec_po = record.transform({
                    fromType: record.Type.PURCHASE_REQUISITION,
                    fromId: pr_number,
                    toType: record.Type.PURCHASE_ORDER,
                    isDynamic: true
                })
                rec_po.setValue('customform',117) // Custom Form PO ME - Purchase Order Form (GP)
                rec_po.setValue('entity',vendor)
                rec_po.setValue('currency',currency)
                rec_po.setValue('class',business_unit)
                rec_po.setValue('department',department)
                rec_po.setValue('incoterm',delivery_condition)
                rec_po.setValue('custbody_tms_so_body_department',department)
                rec_po.setValue('location',location)
                if(tanggal_po){
                    rec_po.setText('trandate',tanggal_po)
                }
                if(etd_date){
                    rec_po.setText('custbody_me_etd',etd_date)
                }
                if(eta_date){
                    rec_po.setText('custbody_me_eta',eta_date)
                }
                rec_po.setValue('custbody_me_memo',remarks)
                rec_po.setValue('cseg_me_cost_center',cost_center)

                var item_count = rec_po.getLineCount('item')
                log.debug('item_count PO', item_count)
                var arr_remove_item = []
                var total_po_sublist= 0
                var total_qty_sublist= 0
                var total_item_sublist= 0
                
                for(var j = 0; j < item_count; j++){
                    try {
                        rec_po.selectLine('item', j)
                        var po_product_name = rec_po.getCurrentSublistValue('item','item')
                        
                        var idx_item_po = po_item.findIndex(val => val.product_name == po_product_name)
                        if(idx_item_po != -1){
                            
                            var item_id_custom = po_item[idx_item_po].item_id_custom
                            var product_name = po_item[idx_item_po].product_name
                            var item_quantity = Number(po_item[idx_item_po].item_quantity).toFixed(2)
                            var unit_price_b4_disc = parseFloat(po_item[idx_item_po].unit_price_b4_disc).toFixed(2)
                            var disc_percentage = po_item[idx_item_po].disc_percentage
                            var disc_amount = parseFloat(po_item[idx_item_po].disc_amount).toFixed(2)
                            var unit_price_a4_disc = parseFloat(po_item[idx_item_po].unit_price_a4_disc).toFixed(2)
                            var amount_price_a4_disc = parseFloat(po_item[idx_item_po].amount_price_a4_disc).toFixed(2)
                            var taxcode = po_item[idx_item_po].taxcode
                            var taxrate = po_item[idx_item_po].taxrate
                            var amount_price_a4_disc_tax = parseFloat(po_item[idx_item_po].amount_price_a4_disc_tax).toFixed(2)
                            var rfq_transaction = po_item[idx_item_po].rfq_transaction
                            log.debug('po_item[idx_item_po]',po_item[idx_item_po])

                            rec_po.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custitem_me_item_id',
                                value: item_id_custom
                            })
                            rec_po.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: item_quantity
                            })
                            rec_po.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcolme_unitprice_bfr_purchase_disc',
                                value: unit_price_b4_disc
                            })
                            rec_po.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_discount_percentage',
                                value: disc_percentage
                            })
                            rec_po.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_discount_amount_purchase',
                                value: disc_amount
                            })
                            rec_po.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                value: unit_price_a4_disc
                            })
                            rec_po.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                value: taxcode
                            })
                            rec_po.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'location',
                                value: location
                            })

                            rec_po.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                value: unit_price_a4_disc*item_quantity
                            })

                            total_po_sublist += Number(unit_price_a4_disc*item_quantity)
                            total_qty_sublist += Number(item_quantity)
                            total_item_sublist += 1
                            rec_po.commitLine('item')
                        } else {
                            arr_remove_item.push(j)
                            rec_po.cancelLine('item')
                        }
                        
                    } catch (error) {
                        throw('Failed To Process item index: ' + j +' | ' + error)
                    }
                }

                if(arr_remove_item.length > 0){
                    for(var k = (arr_remove_item.length-1); k >= 0; k--){

                        rec_po.removeLine({
                            sublistId: 'item',
                            line: arr_remove_item[k]
                        });
                    }
                }
                
                log.debug('rec_po', rec_po)
                log.debug('Data PO',
                    {
                        total: rec_po.getValue('total'),
                        total_po_sublist: total_po_sublist,
                        total_qty_sublist: total_qty_sublist,
                        total_item_sublist: total_item_sublist,
                        total_line_sublist: rec_po.getLineCount('item'),
                        item_count: item_count,
                        item_remove: arr_remove_item.length

                    }
                )
                var po_id = rec_po.save({ignoreMandatoryFields: true})
                // if(!data_pr[pr_number]){
                //     data_pr[pr_number] = po_id
                // }
                if(new_po.indexOf(po_id) == -1){
                    new_po.push(po_id)
                }
            } catch (error) {
                throw('Error Create PO. ' + error)
            }
        }

        log.debug('new POs', new_po)
        
        return new_po
        
    }

    function onRequest(context) {
        var form = serverWidget.createForm({
            title: BODY.title
        })
        var get_form = getParameters(form)
        var item_sublist = form.getSublist({ id: BODY.sub_item_sublist })
        var col_sub_item_quantity = item_sublist.getField(BODY.sub_item_quantity)
        var col_sub_taxcode = item_sublist.getField(BODY.sub_taxcode)
        var col_sub_taxrate = item_sublist.getField(BODY.sub_taxrate)
        var col_sub_amount_price_a4_disc_tax = item_sublist.getField(BODY.sub_amount_price_a4_disc_tax)
        var col_sub_amount_price_a4_disc = item_sublist.getField(BODY.sub_amount_price_a4_disc)


        var param = context.request.parameters;
        var pr_number = param[BODY.pr_number] || []
        var eta_date = param[BODY.eta_date]
        var etd_date = param[BODY.etd_date]
        // var memo_pr = param[BODY.memo_pr]
        var tanggal_po = param[BODY.tanggal_po]
        var payment_condition = param[BODY.payment_condition]
        var delivery_condition = param[BODY.delivery_condition]
        var remarks = param[BODY.remarks]
        var total_pr = param[BODY.total_pr]
        form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_sl_cs_order_requisition.js';
        
        if (context.request.method == 'GET') {
            form.addSubmitButton({
                label: 'Search PR'
            });
            
            context.response.writePage(form);
        } else {
            form.addSubmitButton({
                label: 'Create PO'
            });
            
            var body_pr_number = form.getField(BODY.pr_number)
            var body_eta_date = form.getField(BODY.eta_date)
            var body_etd_date = form.getField(BODY.etd_date)
            // var body_memo_pr = form.getField(BODY.memo_pr)
            var body_tanggal_po = form.getField(BODY.tanggal_po)
            var body_total_pr = form.getField(BODY.total_pr)
            // var body_payment_condition = form.getField(BODY.payment_condition)
            var body_delivery_condition = form.getField(BODY.delivery_condition)
            var body_remarks = form.getField(BODY.remarks)
            body_pr_number.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED})
            col_sub_amount_price_a4_disc_tax.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED})
            col_sub_amount_price_a4_disc.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED})
            col_sub_taxrate.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED})
            // body_eta_date.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED})
            // body_total_pr.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED})
            body_pr_number.defaultValue = pr_number
            body_eta_date.defaultValue = eta_date
            body_etd_date.defaultValue = etd_date
            // body_memo_pr.defaultValue = memo_pr
            body_tanggal_po.defaultValue = tanggal_po
            // body_payment_condition.defaultValue = payment_condition
            body_delivery_condition.defaultValue = delivery_condition
            body_remarks.defaultValue = remarks
            
            
            
            
            var param = {
                pr_number : pr_number.length > 0 ? pr_number.split('\u0005') : [],
                eta_date : eta_date,
                etd_date : etd_date,
                // memo_pr : memo_pr,
                tanggal_po : tanggal_po,
                payment_condition : payment_condition,
                delivery_condition : delivery_condition,
                remarks : remarks
            }
            log.debug('param', param)
            var listItemPR = searchItemPR(param)
            var vendor_taxcode_obj = {}
            if(listItemPR.length > 0){
                for(var i = 0; i < listItemPR.length; i++){
                    var item = listItemPR[i]
                    var pr_id = item.pr_id || ''
                    var business_unit = item.business_unit_id
                    var cost_center = item.cost_center || ''
                    var department = item.department || ''
                    var location = item.location || ''
                    var currency = item.currency || ''
                    var item_id_custom = item.item_id_custom || ''
                    var item_id = item.item_id || ''
                    var item_quantity = Number(item.item_quantity) || 0
                    var vendor_id = item.vendor_id || ''
                    var unit_price_b4_disc = item.unit_price_b4_disc || 0
                    var disc_percentage = item.disc_percentage || 0
                    var disc_amount = item.disc_amount || 0
                    var unit_price_a4_disc = Number(item.unit_price_a4_disc) || 0
                    var amount_price_a4_disc = (item_quantity*unit_price_a4_disc)
                    var taxcode = 5 // ID UNDEF
                    var taxrate = 0
                    var vendor_rec = record.load({
                        type: search.Type.VENDOR,
                        id: vendor_id
                    })
                    var vendor_taxcode = vendor_rec.getValue('taxitem')
                    if(!vendor_taxcode_obj[vendor_id] && vendor_taxcode && vendor_id != ''){
                        var tax_rec = search.lookupFields({
                            type: search.Type.SALES_TAX_ITEM,
                            id: vendor_taxcode,
                            columns:["itemid", "rate"]
                        })
                        var vendor_taxrate = Number(tax_rec.rate.replace("%", ""))
                        vendor_taxcode_obj[vendor_id] = {
                            taxcode: vendor_taxcode,
                            taxrate: vendor_taxrate
                        }
                    }
                    if(vendor_id in vendor_taxcode_obj){
                        taxcode = vendor_taxcode_obj[vendor_id].taxcode
                        taxrate = Number(vendor_taxcode_obj[vendor_id].taxrate)
                    }
                    
                    var taxamount = Number(taxrate*amount_price_a4_disc/100)
                    var amount_price_a4_disc_tax = Number(amount_price_a4_disc + taxamount)
                    var rfq_transaction = item.rfq_number


                    col_sub_item_quantity.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY})
                    col_sub_taxcode.updateDisplayType({displayType: serverWidget.FieldDisplayType.ENTRY})
                    try {
                        
                        item_sublist.setSublistValue({
                            id: BODY.sub_pr_number,
                            line: i,
                            value: pr_id
                        })
                        item_sublist.setSublistValue({
                            id: BODY.sub_business_unit,
                            line: i,
                            value: business_unit
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_cost_center,
                            line: i,
                            value: cost_center
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_department,
                            line: i,
                            value: department
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_location,
                            line: i,
                            value: location
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_currency,
                            line: i,
                            value: currency
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_item_id_custom,
                            line: i,
                            value: item_id_custom ? item_id_custom : "-"
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_product_name,
                            line: i,
                            value: item_id
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_item_quantity,
                            line: i,
                            value: item_quantity
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_vendor,
                            line: i,
                            value: vendor_id
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_unit_price_b4_disc,
                            line: i,
                            value: unit_price_b4_disc
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_disc_percentage,
                            line: i,
                            value: disc_percentage
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_disc_amount,
                            line: i,
                            value: disc_amount
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_unit_price_a4_disc,
                            line: i,
                            value: unit_price_a4_disc
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_amount_price_a4_disc,
                            line: i,
                            value: amount_price_a4_disc
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_taxcode,
                            line: i,
                            value: taxcode
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_taxrate,
                            line: i,
                            value: taxrate
                        }) 



                        item_sublist.setSublistValue({
                            id: BODY.sub_amount_price_a4_disc_tax,
                            line: i,
                            value: amount_price_a4_disc_tax
                        }) 
                        item_sublist.setSublistValue({
                            id: BODY.sub_rfq_transaction,
                            line: i,
                            value: rfq_transaction 
                        }) 
                    } catch (error) {
                        log.debug('error setsublist value idx: ' + i + ' from' + listItemPR.length, {
                            error: error,
                            detail: item
                        })
                        throw('error setsublist value idx: ' + i + ' from' + listItemPR.length + ' | ' + error)
                    }
                } 
            }

            var final_data = {
                eta_date : eta_date,
                etd_date : etd_date,
                // memo_pr : memo_pr,
                tanggal_po : tanggal_po,
                payment_condition : payment_condition,
                delivery_condition : delivery_condition,
                remarks : remarks,
                data_po: []
            }

            var count = context.request.getLineCount({
                group: BODY.sub_item_sublist
            });
            var po_obj = {}
            for(var j = 0; j < count; j++){
                var pickedTrx = context.request.getSublistValue({
                    group: BODY.sub_item_sublist,
                    name: BODY.sub_checkbox,
                    line: j
                });

                if (pickedTrx == 'T' || pickedTrx == true) {
                    var pr_number = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_pr_number,
                        line: j
                    }); 
                    var business_unit = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_business_unit,
                        line: j
                    }); 
                    var cost_center = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_cost_center,
                        line: j
                    }); 
                    var department = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_department,
                        line: j
                    }); 
                    var location = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_location,
                        line: j
                    }); 
                    var currency = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_currency,
                        line: j
                    }); 
                    var item_id_custom = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_item_id_custom,
                        line: j
                    }); 
                    var product_name = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_product_name,
                        line: j
                    }); 
                    var item_quantity = Number(context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_item_quantity,
                        line: j
                    })); 
                    var vendor = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_vendor,
                        line: j
                    }); 
                    var unit_price_b4_disc = Number(context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_unit_price_b4_disc,
                        line: j
                    })); 
                    var disc_percentage = Number(context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_disc_percentage,
                        line: j
                    })); 
                    var disc_amount = Number(context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_disc_amount,
                        line: j
                    })); 
                    var unit_price_a4_disc = Number(context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_unit_price_a4_disc,
                        line: j
                    })); 
                    var amount_price_a4_disc = Number(context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_amount_price_a4_disc,
                        line: j
                    })); 
                    var taxcode = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_taxcode,
                        line: j
                    }); 
                    var taxrate = Number(context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_taxrate,
                        line: j
                    }))
                    var amount_price_a4_disc_tax = Number(context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_amount_price_a4_disc_tax,
                        line: j
                    }))
                    var rfq_transaction = context.request.getSublistValue({
                        group: BODY.sub_item_sublist,
                        name: BODY.sub_rfq_transaction,
                        line: j
                    }); 

                    if(!po_obj[vendor]){
                        po_obj[vendor] = {
                            pr_number: pr_number,
                            business_unit : business_unit,
                            vendor : vendor,
                            cost_center : cost_center,
                            department : department,
                            location : location,
                            currency : currency,
                            item_list : []
                            
                        }
                    }
                    po_obj[vendor].item_list.push({
                        item_id_custom : item_id_custom,
                        product_name : product_name,
                        item_quantity : item_quantity,
                        unit_price_b4_disc : unit_price_b4_disc,
                        disc_percentage : disc_percentage,
                        disc_amount : disc_amount,
                        unit_price_a4_disc : unit_price_a4_disc,
                        amount_price_a4_disc : amount_price_a4_disc,
                        taxcode : taxcode,
                        taxrate : taxrate,
                        amount_price_a4_disc_tax : amount_price_a4_disc_tax,
                        rfq_transaction : rfq_transaction,
                    })
                }
            }
            log.debug('po_obj length: ' + Object.keys(po_obj).length, po_obj)
            log.debug('vendor_taxcode_obj length: ' + Object.keys(vendor_taxcode_obj).length, vendor_taxcode_obj)

            if(Object.keys(po_obj).length > 0){
                for(var key in po_obj){
                    final_data.data_po.push(po_obj[key])
                }
                log.debug('final_data', final_data)
                var ids_po_arr = createPOtransform(final_data)
                
                //Redirect To Saved Search
                var ssType = 'purchaseorder';
                var ssFilters = [
                    ['mainline', 'is', 'T'],
                    "AND",
                    ["internalid", "anyof", ids_po_arr]
                ];
                var ssColumns = [
                    search.createColumn({ name: 'tranid', label: 'PO Number' }),
                    search.createColumn({ name: 'trandate', label: 'Date PO' }),

                ];
                var trxS = search.create({
                    type: ssType,
                    filters: ssFilters,
                    columns: ssColumns
                });
                redirect.toSearchResult({
                    search: trxS
                });
            }
        }
        context.response.writePage(form);

        var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
        log.debug('Remaining Usage FINALE:', remainingUsage);
    }

    return {
        onRequest: onRequest
    }
});

/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
 define(['N/ui/serverWidget', 'N/render', 'N/record', './config/me_config_sely.js', 'N/file', './lib/moment.min.js', 'N/search'], 
    function (serverWidget, render, record, config_ss, file, moment, search) {
    
        function replaceMonth(month) {
            var bulan = ''
            if (month == '1') {
                bulan = 'January'
            } else if (month == '2') {
                bulan = 'February'
            } else if (month == '3') {
                bulan = 'March'
            } else if (month == '4') {
                bulan = 'April'
            } else if (month == '5') {
                bulan = 'Mei'
            } else if (month == '6') {
                bulan = 'June'
            } else if (month == '7') {
                bulan = 'July'
            } else if (month == '8') {
                bulan = 'August'
            } else if (month == '9') {
                bulan = 'September'
            } else if (month == '10') {
                bulan = 'October'
            } else if (month == '11') {
                bulan = 'November'
            } else if (month == '12') {
                bulan = 'December'
            }
            return bulan
        }
    
        function formattedDate(todate){
            // var todaysdate = moment(new Date()).zone("+07.00").format("DD/MM/YYYY")
            log.debug('todate', todate)
            if(!todate) return ''
            var date = todate.split('/')[0]
            var month = replaceMonth(todate.split('/')[1])
            var year = todate.split('/')[2]
    
            
            var finalDate = month + ' ' + date + ', ' + year
    
            return finalDate
        }
    
        function getTare(data_if){
            // log.debug('data_if', data_if)
            var arr_item = data_if.arr_item
            var arr_item_lot = data_if.arr_item_lot
            var data_ifs = data_if.data_ifs
            log.debug('data_ifs', data_ifs)
            var filters = [
                ["custrecord_me_item_name","anyof",arr_item], 
                "AND", 
                ["custrecord_me_batch_number","anyof",arr_item_lot]
            ]
            log.debug('filters tare', filters)
    
            var tareSearch = search.create({
                type: "customrecord_me_csrec_batches_item",
                filters: filters,
                columns:
                [
                   search.createColumn({name: "id", label: "ID"}),
                   search.createColumn({name: "custrecord_me_batch_number", label: "ME - Batch Number"}),
                   search.createColumn({name: "custrecord_me_tare_weight", label: "ME - Tare (Weight)"}),
                   search.createColumn({name: "custrecord_me_item_name", label: "ME - Item"}),
                   search.createColumn({name: "custrecord_me_manufacture_date", label: "ME - Manufacture Date"})
                ]
            });
    
            
            var startrow = 0
            do {
                var result = tareSearch.run().getRange({
                    start: startrow,
                    end: startrow + 1000
                })
                // log.debug('result tare', result)
                for (var i = 0; i < result.length; i++) {
                    var item_id = result[i].getValue(result[i].columns[3])
                    var item_name = result[i].getText(result[i].columns[3])
                    var item_lot = result[i].getValue(result[i].columns[1])
                    var item_lot_name = result[i].getText(result[i].columns[1])
                    var tare = Number(result[i].getValue(result[i].columns[2]))
                    
                    for(var ful in data_ifs){
                        // log.debug('data_if[ful]', data_ifs[ful])
                        if(item_id in data_ifs[ful].data_items && item_lot in data_ifs[ful].data_items[item_id].detail_lot){
                            data_ifs[ful].data_items[item_id].detail_lot[item_lot].tare = tare
                            data_ifs[ful].data_items[item_id].detail_lot[item_lot].qty_bruto = Number(data_ifs[ful].data_items[item_id].detail_lot[item_lot].qty_netto) + tare

                        }
                    }
                }
                startrow += 1000
            } while (result.length == 1000);
    
            return data_if
        }

        function getDataInvoice(data){
            var data = data
            var inv_id = data.inv_id
            var filters = [
                ["type","anyof","CustInvc"], 
                "AND", 
                ["internalid","anyof",inv_id], 
                "AND", 
                ["taxline","is","F"], 
                "AND", 
                ["mainline","is","T"]
            ]
            log.debug('filters getDataInvoice', filters)

            var invoiceSearch = search.create({
                type: "invoice",
                filters: filters,
                columns:
                [
                   search.createColumn({name: "trandate", label: "Date"}),
                   search.createColumn({name: "tranid", label: "Document Number"}),
                   search.createColumn({name: "custbody_me_delivery_order_number", label: "ME  - Delivery Order Number"}),
                   search.createColumn({name: "entity", label: "Name"}),
                   search.createColumn({
                      name: "otherrefnum",
                      join: "createdFrom",
                      label: "PO/Check Number"
                   }),
                   //5
                   search.createColumn({
                      name: "internalid",
                      join: "customer",
                      label: "Internal ID"
                   }),
                   search.createColumn({
                      name: "altname",
                      join: "customer",
                      label: "Name"
                   }),
                   search.createColumn({
                      name: "internalid",
                      join: "createdFrom",
                      label: "Internal ID"
                   }),
                   search.createColumn({
                      name: "tranid",
                      join: "createdFrom",
                      label: "Document Number"
                   })
                ]
            });
            // var if_arr = []
            var startrow = 0
            do {
                var result = invoiceSearch.run().getRange({
                    start: startrow,
                    end: startrow + 1000
                })

                for(var i = 0; i < result.length; i++){
                    var inv_tranid = result[i].getValue(result[i].columns[1])
                    var inv_trandate = formattedDate(result[i].getValue(result[i].columns[0]))
                    var if_ids = result[i].getValue(result[i].columns[2])
                    var customer_id = result[i].getValue(result[i].columns[5])
                    var customer_name = result[i].getValue(result[i].columns[6])
                    var address = ''
                    var po_so = result[i].getValue(result[i].columns[4])
                    // log.debug('if_ids', if_ids.split(','))
                    data.inv_tranid = inv_tranid
                    data.inv_trandate = inv_trandate
                    data.if_ids = if_ids.split(',')
                    data.customer_id = customer_id
                    data.customer_name = customer_name
                    data.address = address
                    data.po_so = po_so

                    // for(var if_id = 0; if_id < if_ids.length; if_id++){

                    //     if(if_arr.indexOf(if_ids[if_id]) == -1){
                    //         if_arr.push(Number(if_ids[if_id]))
                    //     }

                    // }
                }

                startrow += 1000
            } while (result.length == 1000);

            // data.if_ids = if_arr
            log.debug('Data after get invoice', data)

            return data
        }
    
        function printPDF(final_data, context) {
            log.debug('Final final_data Printout', final_data)
            for(var key in final_data){
                log.debug('final_data[key]' + key, final_data[key])
            }
            var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')
            var templateFile = file.load({ id: config_ss.csttmplt.pack_weight });
    
            var renderer = render.create();
    
            renderer.templateContent = templateFile.getContents();
    
            // ==================== Start Olah Data ===================== //
            // Yang dibutuhkan untuk Printout
    
            renderer.addCustomDataSource({
                alias: "record",
                format: render.DataSource.OBJECT,
                data: final_data
            });
    
    
            // ==================== Akhir Olah Data ===================== //
    
            //================ START PrintOut ======================//
    
    
            var xml = renderer.renderAsString().replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1");;
    
            // log.debug("xml", xml)
            // log.debug("renderer exist", renderer);
    
            var pdf = render.xmlToPdf({ // gunakan ini jika mau di Save
                xmlString: xml
            });
    
            pdf.name = 'Packing & Weight List ' + now + ".pdf";// gunakan ini jika mau di Save
            context.response.renderPdf(xml) // gunakan ini jika mau di Open new tab
            
            //================ END PrintOut ======================//
    
            // context.response.writeFile(pdf, false);// gunakan ini jika mau di Save
        }
    
        function getIFData(data){
            log.debug('data getIFData', data)
            var if_id = data.if_ids
            var final_data = data
            var filters = [
                ["inventorydetail.inventorynumber","noneof","@NONE@"],
                "AND", 
                ["type","anyof","ItemShip"]
            ]
            
            if(if_id){
                filters.push(
                    "AND",
                    ["internalid","anyof",if_id]
                )
            }
            log.debug('filters getIFData', filters)

            var transactionSearch = search.create({
                type: "transaction",
                filters: filters,
                columns:
                [
                    search.createColumn({name: "tranid", label: "Document Number"}),
                    search.createColumn({name: "trandate", label: "Date"}),
                    search.createColumn({name: "item", label: "Item"}),
                    search.createColumn({name: "quantity", label: "Quantity"}),
                    search.createColumn({
                        name: "inventorynumber",
                        join: "inventoryDetail",
                        label: " Number"
                    }),
                    // 5
                    search.createColumn({
                        name: "internalid",
                        join: "inventoryDetail",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "quantity",
                        join: "inventoryDetail",
                        label: "Quantity"
                    }),
                    search.createColumn({
                        name: "status",
                        join: "inventoryDetail",
                        label: "Status"
                    }),
                    search.createColumn({name: "custbody_me_nomor_container", label: "No Container"}),
                    search.createColumn({name: "custbody_me_nomor_seal", label: "No Seal"}),
                    // 10
                    search.createColumn({name: "custcol_me_unit", label: "Unit"})
                 
                ]
            });
    
            var startrow = 0
            var data_if = {
                arr_item: [],
                arr_item_lot: [],
                data_ifs: {}
            }
            do {
                var result = transactionSearch.run().getRange({
                    start: startrow,
                    end: startrow + 1000
                })
                log.debug('result', result)
                for(var i = 0; i < result.length; i++){
                    var if_id = result[i].id
                    var no_do = result[i].getValue(result[i].columns[0])
                    var no_container = result[i].getValue(result[i].columns[8])
                    var no_seal = result[i].getValue(result[i].columns[9])
                    var item_id =  result[i].getValue(result[i].columns[2])
                    var item_name =  result[i].getText(result[i].columns[2])
                    var item_lot =  result[i].getValue(result[i].columns[4])
                    var item_lot_name =  result[i].getText(result[i].columns[4])
                    var item_lot_qty =  Number(result[i].getValue(result[i].columns[6]))
                    var item_lot_detail =  result[i].getValue(result[i].columns[5])
                    var item_unit_id =  result[i].getValue(result[i].columns[10])
                    var item_unit_name =  result[i].getText(result[i].columns[10])

                    if(!data_if.data_ifs[if_id]){
                        data_if.data_ifs[if_id] = {
                            no_do : no_do,
                            no_container: no_container,
                            no_seal: no_seal,
                            total_netto: 0,
                            total_bruto: 0,
                            total_coil: 0,
                            total_unit: {},
                            data_items: {}
                        }
                    }
                    // log.debug('data_if', data_if)
                    // if(final_data.arr_item.indexOf(item_id) == -1){
                    //     final_data.arr_item.push(item_id)
                    // }
                    // if(final_data.arr_item_lot.indexOf(item_lot) == -1){
                    //     final_data.arr_item_lot.push(item_lot)
                    // }
                    if(data_if.arr_item.indexOf(item_id) == -1){
                        data_if.arr_item.push(item_id)
                    }
                    if(data_if.arr_item_lot.indexOf(item_lot) == -1){
                        data_if.arr_item_lot.push(item_lot)
                    }
                    // if(!final_data.grand_total_unit[item_unit_id]){
                    //     final_data.grand_total_unit[item_unit_id] = {
                    //         item_unit_id: item_unit_id,
                    //         item_unit_name: item_unit_name,
                    //         unit_qty: 0
                    //     }
                    // }
                    if(!data_if.data_ifs[if_id].data_items[item_id]){
                        data_if.data_ifs[if_id].data_items[item_id] = {
                            item_id: item_id,
                            item_name: item_name,
                            item_unit_id: item_unit_id,
                            item_unit_name: item_unit_name,
                            total_coil: 0,
                            total_bruto: 0,
                            total_netto: 0,
                            detail_lot: {}
                        }
                    }
                    if(!data_if.data_ifs[if_id].data_items[item_id].detail_lot[item_lot]){
                        data_if.data_ifs[if_id].data_items[item_id].detail_lot[item_lot] = {
                            item_lot : item_lot,
                            item_lot_name : item_lot_name,
                            item_lot_qty : item_lot_qty,
                            item_lot_detail : item_lot_detail,
                            tare: 0,
                            qty_netto: item_lot_qty,
                            qty_bruto: 0
                        }
                    }
                }
                
            } while (result.length == 1000);
            
            log.debug('data_if 449', data_if)
            getTare(data_if)
            // getInvDetail(data_if)
            
            // Olah total untuk item data IF
            var if_arr = []
            var unit_arr = []
            for(var ful in data_if.data_ifs){
                var item_arr = []
                for(var item in data_if.data_ifs[ful].data_items){
                    var item_lot_arr = []
                    var item_unit_id = data_if.data_ifs[ful].data_items[item].item_unit_id
                    var item_unit_name = data_if.data_ifs[ful].data_items[item].item_unit_name
                    if(!final_data.grand_total_unit[item_unit_id]){
                        final_data.grand_total_unit[item_unit_id] = {
                            item_unit_id: item_unit_id,
                            item_unit_name: item_unit_name,
                            unit_qty: 0
                        }
                    }
                    for(var lot in data_if.data_ifs[ful].data_items[item].detail_lot){
                        var item_lot_name = data_if.data_ifs[ful].data_items[item].detail_lot[lot].item_lot_name
                        var qty_bruto = Number(data_if.data_ifs[ful].data_items[item].detail_lot[lot].qty_bruto)
                        var qty_netto = Number(data_if.data_ifs[ful].data_items[item].detail_lot[lot].qty_netto)
                        
                        data_if.data_ifs[ful].data_items[item].total_coil += 1
                        data_if.data_ifs[ful].data_items[item].total_bruto += qty_bruto
                        data_if.data_ifs[ful].data_items[item].total_netto += qty_netto

                        data_if.data_ifs[ful].total_bruto += qty_bruto
                        data_if.data_ifs[ful].total_netto += qty_netto
                        data_if.data_ifs[ful].total_coil += qty_netto

                        final_data.grand_total_coil += 1
                        final_data.grand_total_bruto += qty_bruto
                        final_data.grand_total_netto += qty_netto
                        

                        final_data.grand_total_unit[item_unit_id].unit_qty += 1

                        item_lot_arr.push(data_if.data_ifs[ful].data_items[item].detail_lot[lot])
                    }
                    data_if.data_ifs[ful].data_items[item]["detail_lot"] = item_lot_arr
                    item_arr.push(data_if.data_ifs[ful].data_items[item])
                }
                final_data.grand_total_if += 1
                data_if.data_ifs[ful]["data_items"] = item_arr 
                if_arr.push(data_if.data_ifs[ful])
            }

            for(var unit in final_data.grand_total_unit){
                unit_arr.push(final_data.grand_total_unit[unit])
            }
            final_data.grand_total_unit = unit_arr
            final_data["data_ifs"] = if_arr
            // log.debug('data final', final_data)
            return final_data
        }
    
        function onRequest(context) {
            
            var params = context.request.parameters
            var data = JSON.parse(params.custscript_me_param);
            log.debug('data params', data)
            var final_data = {
                inv_id: data.record_id,
                inv_tranid: "",
                inv_trandate: "",
                if_ids: [],
                customer_id: "",
                customer_name: "",
                address: "",
                po_so: "",
                grand_total_netto: 0,
                grand_total_bruto: 0,
                grand_total_coil: 0,
                grand_total_if: 0,
                data_ifs: [],
                grand_total_unit: {}
            }
            var rec_inv = getDataInvoice(final_data)
            
            getIFData(final_data)
            
            log.debug('data printout packing and weight list', final_data)
            var print = printPDF(final_data, context)
    
        }
    
        return {
            onRequest: onRequest
        }
    });
    
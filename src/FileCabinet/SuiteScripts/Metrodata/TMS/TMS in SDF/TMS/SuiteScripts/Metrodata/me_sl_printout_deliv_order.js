/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/render', 'N/record', './config/me_config_sely.js', 'N/file', './lib/moment.min.js', 'N/search'], 
function (serverWidget, render, record, config_ss, file, moment, search) {

    function terbilangBahasa(number){
        const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

        function terbilang(n) {
            if (n < 12) {
                return satuan[n];
            } else if (n < 20) {
                return satuan[n - 10] + " Belas";
            } else if (n < 100) {
                return satuan[Math.floor(n / 10)] + " Puluh " + satuan[n % 10];
            } else if (n < 200) {
                return "Seratus " + terbilang(n - 100);
            } else if (n < 1000) {
                return satuan[Math.floor(n / 100)] + " Ratus " + terbilang(n % 100);
            } else if (n < 2000) {
                return "Seribu " + terbilang(n - 1000);
            } else if (n < 1000000) {
                return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
            } else if (n < 1000000000) {
                return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
            } else if (n < 1000000000000) {
                return terbilang(Math.floor(n / 1000000000)) + " Milyar " + terbilang(n % 1000000000);
            } else if (n < 1000000000000000) {
                return terbilang(Math.floor(n / 1000000000000)) + " Triliun " + terbilang(n % 1000000000000);
            }
        }

        function decimalToWords(decimalPart) {
            const satuanWithZero = ["Nol", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"];
            let word = "";
            for (let digit of decimalPart) {
                word += satuanWithZero[parseInt(digit)] + " ";
            }
            return word.trim();
        }

        const [integerPart, decimalPart] = number.toString().split(".");

        let words = terbilang(parseInt(integerPart));
        if (decimalPart) {
            words += " koma " + decimalToWords(decimalPart);
        }

        return words.replace(/\s+/g, ' ').trim();

    }

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


    function getInvDetail(data_if) {
        var arr_item = data_if.arr_item
        var arr_item_lot= data_if.arr_item_lot
        var data_if = data_if

        var invDetIDSearch = search.create({
            type: "inventorydetail",
            filters:
            [
               ["item","anyof",arr_item], 
               "AND", 
               ["inventorynumber","anyof",arr_item_lot], 
               "AND", 
               ["transaction.type","anyof","ItemShip"]
            ],
            columns:
            [
                search.createColumn({name: "inventorynumber", label: " Number"}),
                search.createColumn({name: "status", label: "Status"}),
                search.createColumn({name: "quantity", sort: search.Sort.DESC, label: "Quantity"}),
                search.createColumn({name: "item", label: "Item"}),
                search.createColumn({name: "itemcount", label: "Item Count"}),
                //5
                search.createColumn({
                    name: "tranid",
                    join: "transaction",
                    label: "Document Number"
                }),
                search.createColumn({
                    name: "internalid",
                    join: "transaction",
                    label: "Internal ID"
                }),
                search.createColumn({name: "internalid", label: "Internal ID"})
            ]
        });

        var startrow = 0
        var detail_lot = {}
        do {
            var result = invDetIDSearch.run().getRange({
                start: startrow,
                end: startrow + 1000
            })
            // log.debug('result 244', result)

            for (var i = 0; i < result.length; i++) {
                var item_id = result[i].getValue(result[i].columns[3])
                var item_name = result[i].getText(result[i].columns[3])
                var item_lot = result[i].getValue(result[i].columns[0])
                var item_lot_name = result[i].getText(result[i].columns[0])
                var item_lot_qty = Number(result[i].getValue(result[i].columns[2]))
                var item_lot_detail = result[i].getValue(result[i].columns[7])
                var check_item = data_if.data_items[item_id]
                var check_item_id = data_if.data_items[item_id].item_id
                var check_item_lot = data_if.data_items[item_id].detail_lot[item_lot].item_lot
                var check_item_lot_qty = Number(data_if.data_items[item_id].detail_lot[item_lot].item_lot_qty)
                var check_item_lot_detail = data_if.data_items[item_id].detail_lot[item_lot].item_lot_detail
                if(check_item_id == item_id && check_item_lot == item_lot && check_item_lot_detail != item_lot_detail){
                    log.debug('check_item', check_item)
                    
                    if(check_item_lot_qty < item_lot_qty){
                        data_if.data_items[item_id].detail_lot[item_lot].item_lot_name = item_lot_name + '-EX'
                        data_if.data_items[item_id].detail_lot[item_lot].qty_bruto = 0
                    }
                }
            }
            startrow += 1000

        } while (result.length == 1000);

        return data_if

    }

    function getTare(data_if){
        var arr_item = data_if.arr_item
        var arr_item_lot = data_if.arr_item_lot
        var arr_item_lot_name = data_if.arr_item_lot_name

        var data_if = data_if
        var filters = [
            ["custrecord_me_item_name","anyof",arr_item]
        ]

        var filter_lot_name = []

        if(arr_item_lot_name.length > 0){
            for(var j=0; j < arr_item_lot_name.length; j++){
                if(filter_lot_name.length > 0){
                    filter_lot_name.push(
                        "OR",
                        ["formulatext: {name}","is",arr_item_lot_name[j]]
                    )
                } else {
                    filter_lot_name.push(
                        ["formulatext: {name}","is",arr_item_lot_name[j]]
                    )
                }
            }
        }

        if(filter_lot_name.length > 0){
            filters.push(
                "AND",
                filter_lot_name
            )
        }
        
        log.debug('filters tare', filters)

        var tareSearch = search.create({
            type: "customrecord_me_csrec_batches_item",
            filters: filters,
            columns:
            [
               search.createColumn({name: "name", label: "ID"}),
            //    search.createColumn({name: "custrecord_me_batch_number", label: "ME - Batch Number"}),
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
            log.debug('result tare', result)
            for (var i = 0; i < result.length; i++) {
                var item_id = result[i].getValue(result[i].columns[2])
                var item_name = result[i].getText(result[i].columns[2])
                // var item_lot = result[i].getValue(result[i].columns[1])
                var item_lot_name = result[i].getValue(result[i].columns[0])
                var tare = Number(result[i].getValue(result[i].columns[1]))
                log.debug(
                    'data tare idx ' + i,
                    {item_id : item_id,
                    item_name : item_name,
                    // item_lot : item_lot,
                    item_lot_name : item_lot_name}
                )
                for(var lot in data_if.data_items[item_id].detail_lot){
                    if(data_if.data_items[item_id].detail_lot[lot].item_lot_name == item_lot_name){
                        data_if.data_items[item_id].detail_lot[lot].tare = tare
                        data_if.data_items[item_id].detail_lot[lot].qty_bruto = Number(data_if.data_items[item_id].detail_lot[lot].qty_netto) + tare
                    }
                }
            }
            startrow += 1000
        } while (result.length == 1000);

        return data_if
    }

    function printPDF(data, context) {
        var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')
        var templateFile = file.load({ id: config_ss.csttmplt.deliv_order });

        var renderer = render.create();

        renderer.templateContent = templateFile.getContents();

        // ==================== Start Olah Data ===================== //
        // Yang dibutuhkan untuk Printout

        renderer.addCustomDataSource({
            alias: "record",
            format: render.DataSource.OBJECT,
            data: data
        });


        // ==================== Akhir Olah Data ===================== //

        //================ START PrintOut ======================//


        var xml = renderer.renderAsString().replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1");;

        // log.debug("xml", xml)
        // log.debug("renderer exist", renderer);

        var pdf = render.xmlToPdf({ // gunakan ini jika mau di Save
            xmlString: xml
        });

        pdf.name = 'Delivery Order ' + now + ".pdf";// gunakan ini jika mau di Save
        context.response.renderPdf(xml) // gunakan ini jika mau di Open new tab
        
        //================ END PrintOut ======================//

        // context.response.writeFile(pdf, false);// gunakan ini jika mau di Save
    }

    function getIFData(data){
        var if_id = data.record_id
        var transactionSearch = search.create({
            type: "transaction",
            filters:
            [
               ["internalid","anyof",if_id], 
               "AND", 
               ["inventorydetail.inventorynumber","noneof","@NONE@"]
            ],
            columns:
            [
                search.createColumn({name: "tranid", label: "Document Number"}),
                search.createColumn({name: "trandate", label: "Date"}),
                search.createColumn({
                    name: "formulatext",
                    formula: "case when {customer.isperson} like 'F' then {customer.companyname} else {customer.firstname}  || '  ' || {customer.lastname} end",
                    label: "Customer"
                }),
                search.createColumn({name: "custbody_me_delivery_date", label: "ME - Delivery Date"}),
                search.createColumn({name: "custbody_me_driver_trucking_no", label: "ME - Driver & Trucking No"}),
                //5
                search.createColumn({
                    name: "formulatext",
                    formula: "case when {custbody_me_transporter.isperson} like 'F' then {custbody_me_transporter.companyname} else {custbody_me_transporter.firstname}  || '  ' || {custbody_me_transporter.lastname} end",
                    label: "Transporter"
                }),
                // search.createColumn({name: "custbody_me_transporter", label: "ME - Transporter Name"}),
                search.createColumn({name: "item", label: "Item"}),
                search.createColumn({name: "quantity", label: "Quantity"}),
                search.createColumn({name: "custbody_me_shipping_address", label: "Address"}),
                search.createColumn({
                    name: "inventorynumber",
                    join: "inventoryDetail",
                    label: " Number"
                }),
                //10
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
                search.createColumn({
                    name: "total",
                    join: "createdFrom",
                    label: "Amount Total"
                }),
                search.createColumn({
                    name: "taxtotal",
                    join: "createdFrom",
                    label: "Tax Total"
                }),
                //15
                search.createColumn({
                    name: "trandate",
                    join: "createdFrom",
                    label: "SO Date"
                }),
                search.createColumn({
                    name: "tranid",
                    join: "createdFrom",
                    label: "SO Tranid"
                }),
                search.createColumn({
                    name: "custbody_me_tanggal_po_sales",
                    join: "createdFrom",
                    label: "PO Date"
                }),
                search.createColumn({
                    name: "otherrefnum",
                    join: "createdFrom",
                    label: "PO Number"
                }),
                search.createColumn({name: "custcol_me_unit", label: "Unit"}),
                //20
                search.createColumn({name: "custbody_me_ekspedisi", label: "ME - Ekspedisi"}),
                search.createColumn({name: "custbody_me_nomor_container", label: "No Container"}),
                search.createColumn({name: "displayname", join: 'item', label: "Item Name"}),
                search.createColumn({name: "memo", label: "Memo"}),
                search.createColumn({name: "custbody_me_nomor_seal", label: "Seal Number"})                
            ]
        });

        var startrow = 0
        var data_if = {}
        do {
            var result = transactionSearch.run().getRange({
                start: startrow,
                end: startrow + 1000
            })
            log.debug('result', result)
            for(var i = 0; i < result.length; i++){
                var no_do = result[i].getValue(result[i].columns[0])
                var date_do = formattedDate(result[i].getValue(result[i].columns[1]))
                var customer_do = result[i].getValue(result[i].columns[2])
                var address_do = result[i].getValue(result[i].columns[8])
                var transporter_do = result[i].getValue(result[i].columns[5])
                var po_do = result[i].getValue(result[i].columns[18])
                var po_date_do = formattedDate(result[i].getValue(result[i].columns[17]))
                var driver_truck = result[i].getValue(result[i].columns[4])
                var ekspedisi = result[i].getValue(result[i].columns[20])
                var container = result[i].getValue(result[i].columns[21])
                var amount = Number(result[i].getValue(result[i].columns[13]))
                
                var item_id =  result[i].getValue(result[i].columns[6])
                var item_name =  result[i].getValue(result[i].columns[22])
                var item_lot =  result[i].getValue(result[i].columns[9])
                var item_lot_name =  result[i].getText(result[i].columns[9])
                var item_lot_qty =  Number(result[i].getValue(result[i].columns[11]))
                var item_lot_detail =  result[i].getValue(result[i].columns[10])
                var item_unit_id =  result[i].getValue(result[i].columns[19])
                var item_unit_name =  result[i].getText(result[i].columns[19])
                var memo =  result[i].getValue(result[i].columns[23])
                var seal_num =  result[i].getValue(result[i].columns[24])
                
                if(Object.keys(data_if).length <= 0){
                    data_if = {
                        no_do : no_do,
                        date_do : date_do,
                        memo : memo,
                        seal_num : seal_num,
                        customer_do : customer_do,
                        address_do : address_do,
                        transporter_do : transporter_do,
                        po_do : po_do,
                        po_date_do : po_date_do,
                        driver_truck : driver_truck,
                        ekspedisi: ekspedisi,
                        container: container,
                        amount : amount,
                        terbilang : '',
                        grand_total_netto: 0,
                        grand_total_bruto: 0,
                        arr_item : [],
                        arr_item_lot : [],
                        arr_item_lot_name : [],
                        data_items: {},
                        total_unit: {}
                    }
                }
                // log.debug('data_if', data_if)
                if(data_if.arr_item.indexOf(item_id) == -1){
                    data_if.arr_item.push(item_id)
                }
                if(data_if.arr_item_lot.indexOf(item_lot) == -1){
                    data_if.arr_item_lot.push(item_lot)
                    data_if.arr_item_lot_name.push(item_lot_name)
                }
                if(!data_if.total_unit[item_unit_id]){
                    data_if.total_unit[item_unit_id] = {
                        item_unit_id: item_unit_id,
                        item_unit_name: item_unit_name,
                        unit_qty: 0
                    }
                }
                if(!data_if.data_items[item_id]){
                    data_if.data_items[item_id] = {
                        item_id: item_id,
                        item_name: item_name,
                        item_unit_id: item_unit_id,
                        item_unit_name: item_unit_name,
                        total_coil: 0,
                        total_bruto: 0,
                        total_netto: 0,
                        length_lot: 0,
                        detail_lot: {}
                    }
                }
                if(!data_if.data_items[item_id].detail_lot[item_lot]){
                    data_if.data_items[item_id].detail_lot[item_lot] = {
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
        log.debug('data_if', data_if)

        getTare(data_if)
        getInvDetail(data_if)
        
        // Olah total untuk item data IF
        var item_arr = []
        var unit_arr = []
        for(var item in data_if.data_items){
            var item_lot_arr = []
            for(var lot in data_if.data_items[item].detail_lot){
                var item_lot_name = data_if.data_items[item].detail_lot[lot].item_lot_name
                var qty_bruto = Number(data_if.data_items[item].detail_lot[lot].qty_bruto)
                var qty_netto = Number(data_if.data_items[item].detail_lot[lot].qty_netto)
                if(item_lot_name.indexOf('EX') == -1){
                    data_if.data_items[item].total_coil += 1
                    if(data_if.data_items[item].item_unit_id in data_if.total_unit){
                        data_if.total_unit[data_if.data_items[item].item_unit_id].unit_qty += 1
                    }
                }
                data_if.data_items[item].length_lot += 1
                data_if.data_items[item].total_bruto += qty_bruto
                data_if.data_items[item].total_netto += qty_netto
                data_if.grand_total_bruto += qty_bruto
                data_if.grand_total_netto += qty_netto
                item_lot_arr.push(data_if.data_items[item].detail_lot[lot])
            }
            data_if.data_items[item]["detail_lot"] = item_lot_arr
            item_arr.push(data_if.data_items[item])
        }
        for(var unit in data_if.total_unit){
            unit_arr.push(data_if.total_unit[unit])
        }

        data_if["data_items"] = item_arr
        data_if["total_unit"] = unit_arr
        data_if["terbilang"] = terbilangBahasa(String(data_if.grand_total_netto))
        log.debug('data_if final', data_if)
        return data_if
    }

    function onRequest(context) {
        
        var params = context.request.parameters
        var data = JSON.parse(params.custscript_me_param);
        log.debug('data printout delivery order', data)

        var rec_if = getIFData(data)

        var print = printPDF(rec_if, context)

    }

    return {
        onRequest: onRequest
    }
});

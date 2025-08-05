/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/redirect", "N/ui/serverWidget", "N/task", "N/search", './config/me_config_yudi.js', 'N/file', 'N/url', './lib/moment.min.js', 'N/encode', './lib/jszip.min.js'],
   function (redirect, serverWidget, task, search, config, file, url, moment, encode, jszip) {


      function addComa(number) {
         // Ensure the input is a number
         if (isNaN(number)) {
            return '0.00';
         }

         // Convert the number to a string with exactly two decimal places
         var parts = Number(number).toFixed(5).split('.');

         // Format the integer part with commas
         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

         // Rejoin the integer and decimal parts
         return parts.join('.');
      }

      function addComaFiveDec(number) {
         // Ensure the input is a number
         if (isNaN(number)) {
            return '0.00';
         }

         // Convert the number to a string with exactly two decimal places
         var parts = Number(number).toFixed(5).split('.');

         // Format the integer part with commas
         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

         // Rejoin the integer and decimal parts
         return parts.join('.');
      }

      function searchSalesRep1(params) {

         log.debug("paramsales", params.invoice_id);

         var result = [];

         var filter = [[
            ["type", "anyof", "CustInvc"],
            "AND",
            ["createdfrom.type", "anyof", "SalesOrd"],
            "AND",
            ["mainline", "is", "F"],
            "AND",
            ["cogs", "is", "F"],
            "AND",
            ["shipping", "is", "F"],
            "AND",
            ["taxline", "is", "F"],
         ]];

         if (params.start_date && params.end_date) {
            filter.push("AND",
               ["trandate", "within", params.start_date, params.end_date],)
         }
         if (params.delivery_order[0] != '') {
            filter.push("AND",
               ["custbody_me_delivery_order_number", "anyof", params.delivery_order],)
         }
         if (params.invoice_number[0] != '') {
            filter.push("AND",
               ["internalid", "anyof", params.invoice_number],)
         }
         if (params.items[0] != '') {
            filter.push("AND",
               ["item", "anyof", params.items],)
         }
         if (params.business_unit[0] != '') {
            filter.push("AND",
               ["class", "anyof", params.business_unit],)
         }
         if (params.sales_category[0] != '') {
            filter.push("AND",
               ["custbody_me_sales_category", "anyof", params.sales_category],)
         }

         var itemfulfillmentSearchObj = search.create({
            type: "invoice",
            filters: filter,
            columns:
               [
                  search.createColumn({
                     name: "altname",
                     join: "customer",
                     label: "Customer Name"
                  }),
                  search.createColumn({
                     name: "otherrefnum",
                     join: "createdFrom",
                     label: "PO No"
                  }),
                  search.createColumn({
                     name: "custbody_me_tanggal_po_sales",
                     join: "createdFrom",
                     label: "PO Date"
                  }),
                  search.createColumn({ name: "custbody_me_price_category", label: "QP" }),
                  search.createColumn({
                     name: "tranid",
                     join: "createdFrom",
                     label: "SO Number"
                  }),
                  search.createColumn({
                     name: "trandate",
                     join: "createdFrom",
                     label: "SO Date"
                  }),
                  search.createColumn({
                     name: "itemid",
                     join: "item",
                     label: "Product Name"
                  }),
                  search.createColumn({
                     name: "formulanumeric",
                     formula: "case when {currency} like '%IDR%' AND {custbody_me_bounded_zone} = 'Yes' then {custcol_me_lme_final} *{custbody_me_ex_rate_pjk}when {currency} like '%IDR%' AND {custbody_me_bounded_zone} = 'No' then {custcol_me_lme_final} *{custcol_me_kurs_kesepakatan}when {currency} like '%US%' then {custcol_me_lme_final} end",
                     label: "LME"
                  }),
                  search.createColumn({
                     name: "formulanumeric",
                     formula: "case when {currency} like '%IDR%' AND {custbody_me_bounded_zone} = 'Yes' then {custcol_me_premium_final} *{custbody_me_ex_rate_pjk}when {currency} like '%IDR%' AND {custbody_me_bounded_zone} = 'No' then {custcol_me_premium_final} *{custcol_me_kurs_kesepakatan}when {currency} like '%US%' then {custcol_me_premium_final} end",
                     label: "Premium"
                  }),
                  search.createColumn({
                     name: "formulanumeric",
                     formula: "case when {currency} like '%IDR%' AND {custbody_me_bounded_zone} = 'Yes' then {custcol_me_mjp_price} *{custbody_me_ex_rate_pjk}when {currency} like '%IDR%' AND {custbody_me_bounded_zone} = 'No' then {custcol_me_mjp_price} *{custcol_me_kurs_kesepakatan}when {currency} like '%US%' then {custcol_me_mjp_price} end",
                     label: "MJP"
                  }),
                  search.createColumn({
                     name: "formulanumeric",
                     formula: "case when {currency} like '%IDR%' AND {custbody_me_bounded_zone} = 'Yes' then {custcol_me_other_final} *{custbody_me_ex_rate_pjk}when {currency} like '%IDR%' AND {custbody_me_bounded_zone} = 'No' then {custcol_me_other_final} *{custcol_me_kurs_kesepakatan}when {currency} like '%US%' then {custcol_me_other_final} end",
                     label: "Others Premium"
                  }),
                  search.createColumn({
                     name: "formulanumeric",
                     formula: "case when {currency} like '%IDR%' THEN {rate}/{exchangerate}ELSE {rate} end",
                     label: "Unit Price"
                  }),
                  search.createColumn({ name: "currency", label: "Currency" }),
                  search.createColumn({
                     name: "vatregnumber",
                     join: "customer",
                     label: "Customer NPWP No."
                  }),
                  search.createColumn({ name: "custbody_me_delivery_order_number", label: "Delivery Order Number" }),
                  search.createColumn({ name: "tranid", label: "Invoice Id" }),
                  search.createColumn({ name: "trandate", label: "Invoice Date" }),
                  search.createColumn({ name: "custbody_me_nomor_faktur_pajak_sales", label: "VAT No." }),
                  search.createColumn({ name: "duedate", label: "Due Date" }),
                  search.createColumn({ name: "classnohierarchy", label: "Business Unit" }),
                  search.createColumn({
                     name: "rate",
                     join: "taxItem",
                     label: "Rate"
                  }),
                  search.createColumn({ name: "custcol_me_lme_final", label: "LME - USD" }),
                  search.createColumn({ name: "custcol_me_premium_final", label: "Premium - USD" }),
                  search.createColumn({ name: "custcol_me_mjp_price", label: "MJP - USD" }),
                  search.createColumn({ name: "custcol_me_other_final", label: "Other - USD" }),
                  search.createColumn({ name: "internalid", label: "Internal Id" }),
                  search.createColumn({ name: "exchangerate", label: "Exchange Rate" }),
                  search.createColumn({ name: "custbody_me_sales_category", label: "ME - Sales Category" }),
                  search.createColumn({
                     name: "custitem_me_item_id",
                     join: "item",
                     label: "ME - Item ID"
                  }),
                  search.createColumn({ name: "custcol_me_others_rate_final", label: "others rate" }),
                  search.createColumn({ name: "custcol_me_unit_price_bounded_zone", label: "Unit Price IDR" }),
                  search.createColumn({ name: "rate", label: "Unit Price" }),
               ]
         });

         var startrow = 0;

         do {

            var toResult = itemfulfillmentSearchObj.run().getRange({
               start: startrow,
               end: startrow + 1000
            });

            for (let i = 0; i < toResult.length; i++) {
               var cust_name = toResult[i].getValue(toResult[i].columns[0])
               var cust_po = toResult[i].getValue(toResult[i].columns[1])
               var cust_po_date = toResult[i].getValue(toResult[i].columns[2])
               var qp = toResult[i].getValue(toResult[i].columns[3])
               var so_number = toResult[i].getValue(toResult[i].columns[4])
               var so_date = toResult[i].getValue(toResult[i].columns[5])
               var product_name_text = toResult[i].getText(toResult[i].columns[6])
               var product_name = toResult[i].getValue(toResult[i].columns[6])
               var lme = toResult[i].getValue(toResult[i].columns[7])
               var premium = toResult[i].getValue(toResult[i].columns[8])
               var mjp = toResult[i].getValue(toResult[i].columns[9])
               var others = toResult[i].getValue(toResult[i].columns[10])
               var unit_price = toResult[i].getValue(toResult[i].columns[11])
               var currency = toResult[i].getText(toResult[i].columns[12])
               var cust_npwp = toResult[i].getValue(toResult[i].columns[13])
               var del_ord_number_text = toResult[i].getText(toResult[i].columns[14])
               var del_ord_number = toResult[i].getValue(toResult[i].columns[14])
               var invoice_id = toResult[i].getValue(toResult[i].columns[15])
               var invoice_id_text = toResult[i].getText(toResult[i].columns[15])
               var invoice_date = toResult[i].getValue(toResult[i].columns[16])
               var vat_no = toResult[i].getValue(toResult[i].columns[17])
               var due_date = toResult[i].getValue(toResult[i].columns[18])
               var business_unit = toResult[i].getText(toResult[i].columns[19])
               var tax_rate = toResult[i].getValue(toResult[i].columns[20])
               var lme_usd = toResult[i].getValue(toResult[i].columns[21])
               var premium_usd = toResult[i].getValue(toResult[i].columns[22])
               var mjp_usd = toResult[i].getValue(toResult[i].columns[23])
               var other_usd = toResult[i].getValue(toResult[i].columns[24])
               var internal_id = toResult[i].getValue(toResult[i].columns[25])
               var exchange_rate = toResult[i].getValue(toResult[i].columns[26])
               var sales_cat = toResult[i].getText(toResult[i].columns[27])
               var item_id_name = toResult[i].getValue(toResult[i].columns[28])
               var others_rate = toResult[i].getValue(toResult[i].columns[29])

               if (del_ord_number.includes(',')) {
                  var splitDelOrd = del_ord_number.split(',')

                  for (let j = 0; j < splitDelOrd.length; j++) {
                     result.push({
                        cust_name: cust_name,
                        cust_po: cust_po,
                        cust_po_date: cust_po_date,
                        qp: qp,
                        so_number: so_number,
                        so_date: so_date,
                        product_name_text: product_name_text,
                        product_name: product_name,
                        lme: lme,
                        premium: premium,
                        mjp: mjp,
                        others: others,
                        others_rate: others_rate,
                        unit_price: unit_price,
                        currency: currency,
                        cust_npwp: cust_npwp,
                        // del_ord_number_text: del_ord_number_text,
                        del_ord_number: splitDelOrd[j],
                        invoice_id: invoice_id,
                        invoice_id_text: invoice_id_text,
                        invoice_date: invoice_date,
                        vat_no: vat_no,
                        due_date: due_date,
                        business_unit: business_unit,
                        tax_rate: tax_rate,
                        lme_usd: lme_usd,
                        premium_usd: premium_usd,
                        mjp_usd: mjp_usd,
                        other_usd: other_usd,
                        unit_price_usd: Number(lme_usd) + Number(premium_usd) + Number(mjp_usd) + Number(other_usd),
                        internal_id: internal_id,
                        exchange_rate: exchange_rate,
                        sales_cat: sales_cat,
                        item_id_name: item_id_name,
                        do: []
                        // do_number: '',
                        // inventory_detail_qty: '',
                        // inv_number: '',
                        // invoice_ar_num: '',
                        // do_date: '',
                     })

                  }

               } else {
                  result.push({
                     cust_name: cust_name,
                     cust_po: cust_po,
                     cust_po_date: cust_po_date,
                     qp: qp,
                     so_number: so_number,
                     so_date: so_date,
                     product_name_text: product_name_text,
                     product_name: product_name,
                     lme: lme,
                     premium: premium,
                     mjp: mjp,
                     others: others,
                     others_rate: others_rate,
                     unit_price: unit_price,
                     currency: currency,
                     cust_npwp: cust_npwp,
                     del_ord_number_text: del_ord_number_text,
                     del_ord_number: del_ord_number,
                     invoice_id: invoice_id,
                     invoice_id_text: invoice_id_text,
                     invoice_date: invoice_date,
                     vat_no: vat_no,
                     due_date: due_date,
                     business_unit: business_unit,
                     tax_rate: tax_rate,
                     lme_usd: lme_usd,
                     premium_usd: premium_usd,
                     mjp_usd: mjp_usd,
                     other_usd: other_usd,
                     unit_price_usd: Number(lme_usd) + Number(premium_usd) + Number(mjp_usd) + Number(other_usd),
                     internal_id: internal_id,
                     exchange_rate: exchange_rate,
                     sales_cat: sales_cat,
                     item_id_name: item_id_name,
                     do: []
                     // do_number: '',
                     // inventory_detail_qty: '',
                     // inv_number: '',
                     // invoice_ar_num: '',
                     // do_date: '',
                  })

               }


            }

            startrow += 1000;

         } while (toResult.length === 1000);

         var noDuplicate = []

         for (let i = 0; i < result.length; i++) {

            var cekDuplicate = noDuplicate.filter((data) => data.del_ord_number == result[i].del_ord_number && data.invoice_id == result[i].invoice_id && data.product_name == result[i].product_name)

            if (cekDuplicate.length < 1) {
               noDuplicate.push(result[i])
            }

         }

         log.debug("sales rep", noDuplicate)

         return noDuplicate;

      }

      function searchSalesRep2(params) {

         var result = []

         var invoiceSearchObj = search.create({
            type: "itemfulfillment",
            filters:
               [
                  ["type", "anyof", "ItemShip"],
                  "AND",
                  ["taxline", "is", "F"],
                  "AND",
                  ["shipping", "is", "F"],
                  "AND",
                  ["mainline", "is", "F"],
                  "AND",
                  ["formulanumeric: case when {quantity} >= 0 then 1 else 0 end", "equalto", "1"],
                  "AND",
                  ["internalid", "anyof", params]
               ],
            columns:
               [
                  search.createColumn({ name: "tranid", label: "Document Number" }),
                  search.createColumn({ name: "item", label: "Item" }),
                  search.createColumn({ name: "custbody_me_invoice_ar_number", label: "ME - Invoice AR Number" }),
                  search.createColumn({
                     name: "formulanumeric",
                     formula: "{inventorydetail.quantity}",
                     label: "Quantity Inventory number"
                  }),
                  search.createColumn({
                     name: "inventorynumber",
                     join: "inventoryDetail",
                     label: " Number"
                  }),
                  search.createColumn({ name: "internalid", label: "Internal Id" }),
                  search.createColumn({ name: "trandate", label: "Date" }),
                  search.createColumn({ name: "quantity", label: "Quantity" }),

               ]
         });

         var startrow = 0;

         do {

            var toResult = invoiceSearchObj.run().getRange({
               start: startrow,
               end: startrow + 1000
            });

            for (let i = 0; i < toResult.length; i++) {
               var do_number_text = toResult[i].getText(toResult[i].columns[0])
               var do_number = toResult[i].getValue(toResult[i].columns[0])
               var item = toResult[i].getText(toResult[i].columns[1])
               var invoice_ar_num = toResult[i].getValue(toResult[i].columns[2])
               var inventory_qty = toResult[i].getValue(toResult[i].columns[3])
               var inv_number = toResult[i].getText(toResult[i].columns[4])
               var internal_id = toResult[i].getValue(toResult[i].columns[5])
               var date = toResult[i].getValue(toResult[i].columns[6])
               var quantity = toResult[i].getValue(toResult[i].columns[7])

               result.push({
                  internal_id: internal_id,
                  do_number_text: do_number_text,
                  do_number: do_number,
                  item: item,
                  inventory_detail_qty: inventory_qty,
                  inv_number: inv_number,
                  invoice_ar_num: invoice_ar_num,
                  do_date: date,
                  do_qty: quantity,

               })
            }

            startrow += 1000;

         } while (toResult.length === 1000);
         log.debug('fulfillment', result)
         return result;
      }

      function combine(salesRep, inv) {
         for (let i = 0; i < salesRep.length; i++) {
            var getDuplicateInvoiceNitem = inv.filter((data) => data.item == salesRep[i].product_name && data.invoice_ar_num == salesRep[i].internal_id)

            log.debug('duplicate', getDuplicateInvoiceNitem)

            // for (let j = 0; j < getDuplicateInvoiceNitem.length; j++) {

            if (getDuplicateInvoiceNitem.length > 0) {
               salesRep[i].do.push(getDuplicateInvoiceNitem[0])

            }
            // salesRep[i].do_number = getDuplicateInvoiceNitem[0].do_number;
            // salesRep[i].inventory_detail_qty = getDuplicateInvoiceNitem[0].inventory_qty;
            // salesRep[i].inv_number = getDuplicateInvoiceNitem[0].inv_number;
            // salesRep[i].invoice_ar_num = getDuplicateInvoiceNitem[0].invoice_ar_num;
            // salesRep[i].do_date = getDuplicateInvoiceNitem[0].date;
            // salesRep[i].do_qty = getDuplicateInvoiceNitem[0].quantity;

            // }
         }

         log.debug("sales re[p", salesRep)
         return salesRep;
      }

      function printHtml(form, params, context, param) {
         var reportGroup = form.addFieldGroup({
            id: 'report_group',
            label: 'Report'
         });
         var salesReport = form.addField({
            id: 'custpage_sls_report',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Reprt Pnl',
            container: 'report_group'
         });

         salesReport.defaultValue = '<!DOCTYPE html> ' +
            '<html lang="en">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<h2 style= "text-align">Report Sales ' + (param.start_date ? param.start_date : "") + " to " + (param.end_date ? param.end_date : "") + '</h2>' +
            '<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"/>' +
            // '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs4-4.6.0/jqc-1.12.4/dt-1.13.1/datatables.min.css"/>' +
            // '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css">' +
            '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js">' +
            '</script>' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
            '</script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js">' +
            '</script>' +
            '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css"/>' +
            '<script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js">' +
            '</script>' +
            // ' <link rel="stylesheet" href="https://cdn.datatables.net/1.10.21/css/dataTables.bootstrap4.min.css">' +
            //=============
            //  '<script src="https://cdn.datatables.net/1.10.21/js/dataTables.bootstrap4.min.js">' +
            //  '<script src="https://cdn.datatables.net/2.0.8/js/dataTables.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/dataTables.buttons.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.dataTables.js">' +
            //  '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js">' +
            //  '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js">' +
            //  '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.html5.min.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.print.min.js">' +
            //=============
            '<script src="https://code.jquery.com/jquery-3.3.1.js"></script>' +
            '<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/dataTables.buttons.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.flash.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.html5.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.print.min.js"></script>' +
            // '<script src="https://cdn.datatables.net/2.0.8/js/dataTables.js"></script>'+

            // '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
            '</script>' +

            '<script>$(document).ready(function () { $("#daTable").DataTable({ "pageLength": 50, dom: "Bfrtip","buttons": ["excel", "pdfHtml5"]})})</script>' +
            '</head>';
         salesReport.defaultValue += '<body>';

         salesReport.defaultValue += '<style>' +
            '.table{border:1px solid black; margin-top: 5%}' +
            '.table-head-column{border:1px solid black; border-collapse: collapse; font-weight: bold;}' +
            '.table-row{border:1px solid black; border-collapse: collapse;}' +
            '.table-column{border:1px solid black; border-collapse: collapse;}' +
            '</style>' +
            // '<div>' +
            '<table style="width:200%; border:10px" id="daTable" class="table table-striped table-bordered table-hover dt-responsive" style="width:100%">' +
            '<thead class="thead-dark" style="font-weight: bold">' +
            '<tr >' +
            '<th scope="col">Customer Name</th>' +
            '<th scope="col">Sales Category</th>' +
            '<th scope="col">Customer PO</th>' +
            '<th scope="col">Customer PO Date</th>' +
            '<th scope="col">QP</th>' +
            '<th scope="col">SO No.</th>' +
            '<th scope="col">SO Date</th>' +
            '<th scope="col">Product Name</th>' +
            '<th scope="col">Product ID</th>' +
            '<th scope="col">LME</th>' +
            '<th scope="col">Premium</th>' +
            '<th scope="col">Mjp</th>' +
            '<th scope="col">Others Premium</th>' +
            '<th scope="col">Others Rate</th>' +
            '<th scope="col">Unit Price</th>' +
            '<th scope="col">Currency</th>' +
            '<th scope="col">DO No.</th>' +
            '<th scope="col">DO Date</th>' + //
            '<th scope="col">Batch No.</th>' +
            '<th scope="col">Invoice Id</th>' +
            '<th scope="col">Invoice Date</th>' +
            '<th scope="col">Delivered.</th>' +
            '<th scope="col">Net Amount</th>' +
            '<th scope="col">VAT</th>' +
            '<th scope="col">Invoice Amount</th>' +
            '<th scope="col">Net Amount(USD)</th>' +
            '<th scope="col">VAT(USD)</th>' +
            '<th scope="col">Invoice Amount(USD)</th>' +
            '<th scope="col">VAT No.</th>' +
            '<th scope="col">Customer NPWP No.</th>' +
            '<th scope="col">Due Date</th>' +
            '<th scope="col">Business Unit</th>';

         salesReport.defaultValue += '</tr>';
         salesReport.defaultValue += '</thead>';
         salesReport.defaultValue += '<tbody>';

         // for (let i = 0; i < getPnl.length; i++) {
         //     salesReport.defaultValue += 
         //     '<tr class="table-row">' +
         //     '<td class="table-column">'+getPnl[i].account+'</td>' +
         //     '<td class="table-column">'+getPnl[i].description+'</td>' +
         //     '<td class="table-column">ini amount 001</td>' +
         //     '</tr>';
         // }


         //==========================Penjualan=============================

         for (let a = 0; a < params.length; a++) {
            for (let i = 0; i < params[a].do.length; i++) {

               var netAmount = Number(Number(!params[a].do[i].inventory_detail_qty ? '0.00' : params[a].do[i].inventory_detail_qty) * Number(params[a].unit_price)).toFixed(5);
               var vatAmount = ((params[a].currency).includes('US') ? '0.00' : Number((parseFloat(params[a].tax_rate) / 100) * Number(params[a].unit_price)).toFixed(5) * Number(params[a].do[i].inventory_detail_qty).toFixed(5));

               var invoiceAmount = Number(Number(netAmount) + Number(vatAmount)).toFixed(5)

               var netAmountUsd = 0;
               var vatAmountUsd = 0;

               if ((params[a].currency).includes('IDR')) {
                  netAmountUsd = netAmount * params[a].exchange_rate;
                  vatAmountUsd = vatAmount * params[a].exchange_rate;

               } else if ((params[a].currency).includes('US')) {
                  netAmountUsd = netAmount;
                  vatAmountUsd = vatAmount;

               }


               var invoiceAmountUsd = Number((Number(netAmountUsd) + Number(vatAmountUsd))).toFixed(5)

               salesReport.defaultValue +=
                  '<tr >' +
                  '<td >' + params[a].cust_name + '</td>' +
                  '<td >' + params[a].sales_cat + '</td>' +
                  '<td >' + params[a].cust_po + '</td>' +
                  '<td >' + params[a].cust_po_date + '</td>' +
                  '<td >' + params[a].qp + '</td>' +
                  '<td >' + params[a].so_number + '</td>' +
                  '<td >' + params[a].so_date + '</td>' +
                  '<td >' + params[a].product_name + '</td>' +
                  '<td >' + params[a].item_id_name + '</td>' +
                  '<td >' + addComa(params[a].lme) + '</td>' +
                  '<td >' + addComa(params[a].premium) + '</td>' +
                  '<td >' + addComa(params[a].mjp) + '</td>' +
                  '<td >' + addComa(params[a].others) + '</td>' +
                  '<td >' + addComa(params[a].others_rate) + '</td>' +
                  '<td >' + addComaFiveDec(params[a].unit_price) + '</td>' +
                  '<td >' + params[a].currency + '</td>' +
                  '<td >' + params[a].do[i].do_number + '</td>' +
                  '<td >' + params[a].do[i].do_date + '</td>' +
                  '<td >' + params[a].do[i].inv_number + '</td>' +
                  '<td >' + params[a].invoice_id + '</td>' +
                  '<td >' + params[a].invoice_date + '</td>' +
                  '<td >' + (!params[a].do[i].inventory_detail_qty ? 0 : params[a].do[i].inventory_detail_qty) + '</td>' +
                  '<td >' + addComa(netAmount) + '</td>' +
                  '<td >' + addComa(vatAmount) + '</td>' +
                  '<td >' + addComa(invoiceAmount) + '</td>' +
                  '<td >' + addComa(netAmountUsd) + '</td>' +
                  '<td >' + addComa(vatAmountUsd) + '</td>' +
                  '<td >' + addComa(invoiceAmountUsd) + '</td>' +
                  '<td >' + ((params[a].currency).includes('US') ? '-' : params[a].vat_no) + '</td>' +
                  '<td >' + params[a].cust_npwp + '</td>' +
                  '<td >' + params[a].due_date + '</td>' +
                  '<td >' + params[a].business_unit + '</td>';
               salesReport.defaultValue += '</tr>';

               // pnlReport.defaultValue += '</div>';
            }
         }

         salesReport.defaultValue += '</tbody>';
         salesReport.defaultValue += '</table>';
         salesReport.defaultValue += '</body>' +
            '</html>';
         context.response.writePage(form);
      }

      function printExcel(form, params, context) {
         // log.debug('header', header)
         var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
         xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
         xmlString += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
         xmlString += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
         xmlString += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
         xmlString += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

         xmlString += '<Styles>' +
            '<Style ss:ID="MyNumber">' +
            '<NumberFormat ss:Format="#,#"/>' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '</Style>' +
            '<Style ss:ID="MyCurr">' +
            '<NumberFormat ss:Format="#,#"/>' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignHeader">' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlign">' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderTop">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderLeft">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderRight">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderRightHeader">' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderLeftHeader">' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderTopLeft">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderTopRight">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomRightHeader">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomLeftHeader">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomRightBase">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomLeftBase">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="Header">' +
            '<Font ss:Size="9" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomHeader">' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottom">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomCenter">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomCenterARight">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Right"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomCenterACenter">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomLeft">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
            '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomRight">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
            '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenter">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenterHeader">' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenterBorderTop">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenterBorderBottomHeader">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenterBorderBottom">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="Font"><Font ss:Size="7" ss:FontName="Arial"/></Style>' +
            '<Style ss:ID="FontRight"><Font ss:Size="7" ss:FontName="Arial"/><Alignment ss:Horizontal="Right"/></Style>' +
            '</Styles>'

         xmlString += '<Worksheet ss:Name="Sheet1">';
         xmlString += '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">';
         xmlString += '<PageSetup>';
         xmlString += '<PageMargins x:Bottom="0.75" x:Left="0.25" x:Right="0.25" x:Top="0.75"/>'
         xmlString += '</PageSetup>';
         xmlString += '</WorksheetOptions>';

         xmlString += '<Table>';

         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
         xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';

         // xmlString += '<Row>' +
         //     '<Cell ss:StyleID="Header" ss:MergeAcross="5"><Data ss:Type="String">' + header.location + ', SLS Retur' + ", " + header.conditioned_filter + '</Data></Cell>' +
         //     '</Row>';
         xmlString += '<Row>' +
            '<Cell ss:StyleID="Header" ss:MergeAcross="5"><Data ss:Type="String">Print : ' + moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss') + '</Data></Cell>' +
            '</Row>';

         xmlString += '<Row>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Customer Name</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Sales Category</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Customer PO</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Customer PO Date</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">QP</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">SO No.</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">SO Date</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Product Name</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Product ID</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">LME</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Premium</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Mjp</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Others</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Unit Price</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Currency</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">DO No</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">DO Date</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Batch No.</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Invoice Id</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Invoice Date</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Delivered</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Net Amount</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">VAT</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Invoice Amount</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Net Amount(USD)</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">VAT(USD)</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Invoice Amount(USD)</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">VAT No.</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Customer NPWP No.</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Due Date</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Business Unit</Data></Cell>' +
            '</Row>';

         if (params.length <= 0) {
            xmlString += '<Row>' +
               '<Cell ss:StyleID="MyAlignCenterHeader" ss:MergeAcross="11"><Data ss:Type="String">TIDAK ADA DATA</Data></Cell>' +
               '</Row>';
         } else {
            for (let a = 0; a < params.length; a++) {
               for (let i = 0; i < params[a].do.length; i++) {

                  var netAmount = Number(Number(!params[a].do[i].inventory_detail_qty ? '0.00' : params[a].do[i].inventory_detail_qty) * Number(params[a].unit_price)).toFixed(5);
                  var vatAmount = ((params[a].currency).includes('US') ? '0.00' : Number((parseFloat(params[a].tax_rate) / 100) * Number(params[a].unit_price)).toFixed(5) * Number(params[a].do[i].inventory_detail_qty).toFixed(5));

                  var invoiceAmount = Number(Number(netAmount) + Number(vatAmount)).toFixed(5)

                  var netAmountUsd = 0;
                  var vatAmountUsd = 0;

                  if ((params[a].currency).includes('IDR')) {
                     netAmountUsd = Number(netAmount * params[a].exchange_rate).toFixed(5);
                     vatAmountUsd = Number(vatAmount * params[a].exchange_rate).toFixed(5);

                  } else if ((params[a].currency).includes('US')) {
                     netAmountUsd = netAmount;
                     vatAmountUsd = vatAmount;

                  }

                  var invoiceAmountUsd = Number((Number(netAmountUsd) + Number(vatAmountUsd))).toFixed(5)

                  xmlString += '<Row>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].cust_name + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].sales_cat + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].cust_po + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].cust_po_date + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].qp + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].so_number + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].so_date + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].product_name + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].item_id_name + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].lme + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].premium + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].mjp + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].others + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].unit_price + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].currency + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].do[i].do_number + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].do[i].do_date + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].do[i].inv_number + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].invoice_id + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].invoice_date + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + (!params[a].do[i].inventory_detail_qty ? 0 : params[a].do[i].inventory_detail_qty) + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + netAmount + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + vatAmount + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + invoiceAmount + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + netAmountUsd + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + vatAmountUsd + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + invoiceAmountUsd + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + ((params[a].currency).includes('US') ? '-' : params[a].vat_no) + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].cust_npwp + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].due_date + '</Data></Cell>' +
                     '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].business_unit + '</Data></Cell>' +
                     '</Row>';
               }
            }
         }
         xmlString += '</Table></Worksheet></Workbook>';
         var strXmlEncoded = encode.convert({
            string: xmlString,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64
         });

         var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

         var objXlsFile = file.create({
            name: 'Sales Report' + now + '.xls',
            fileType: file.Type.EXCEL,
            contents: strXmlEncoded

         });

         context.response.writeFile({
            file: objXlsFile
         });
      }

      function parameters() {
         var form = serverWidget.createForm({
            title: 'Sales Report'
         })

         var reportFilter = form.addFieldGroup({
            id: 'report_filter',
            label: 'Filter'
         });

         var printAs = form.addField({
            id: 'custpage_print_as',
            type: serverWidget.FieldType.SELECT,
            label: "Generate As",
            container: 'report_filter'
         })
         printAs.isMandatory = true;
         printAs.addSelectOption({
            value: '',
            text: ''
         });

         printAs.addSelectOption({
            value: '1',
            text: 'Page'
         });
         // printAs.addSelectOption({
         //    value: '2',
         //    text: 'Excel'
         // });

         var startDate = form.addField({
            id: 'custpage_start_date',
            type: serverWidget.FieldType.DATE,
            label: "Start Date",
            container: 'report_filter'
         })
         // startDate.defaultValue = new Date();

         var endDate = form.addField({
            id: 'custpage_end_date',
            type: serverWidget.FieldType.DATE,
            label: "End Date",
            container: 'report_filter'
         });

         // endDate.isMandatory = true;
         // endDate.defaultValue = new Date();

         var deliveryOrder = form.addField({
            id: 'custpage_delivery_order',
            type: serverWidget.FieldType.MULTISELECT,
            source: 'itemfulfillment',
            label: "Delivery Order",
            container: 'report_filter'
         });
         var items = form.addField({
            id: 'custpage_items',
            type: serverWidget.FieldType.MULTISELECT,
            source: 'item',
            label: "Item",
            container: 'report_filter'
         });
         var invoiceNumber = form.addField({
            id: 'custpage_invoice_number',
            type: serverWidget.FieldType.MULTISELECT,
            source: 'invoice',
            label: "Invoice Number",
            container: 'report_filter'
         });
         var BusinessUnit = form.addField({
            id: 'custpage_business_unit',
            type: serverWidget.FieldType.MULTISELECT,
            source: 'classification',
            label: "Business Unit",
            container: 'report_filter'
         });
         var salesCategory = form.addField({
            id: 'custpage_sales_category',
            type: serverWidget.FieldType.MULTISELECT,
            source: 'customlist_me_customer_group',
            label: "Sales Category",
            container: 'report_filter'
         });

         return form;
      }

      function onRequest(context) {
         var form = parameters()

         if (context.request.method == 'GET') {

            context.response.writePage(form);
         } else {
            var req_param = context.request.parameters;

            var print_as = req_param['custpage_print_as'];
            var start_date = req_param['custpage_start_date'];
            var end_date = req_param['custpage_end_date'];
            var delivery_order = req_param['custpage_delivery_order'];
            var items = req_param['custpage_items'];
            var invoice_number = req_param['custpage_invoice_number'];
            var business_unit = req_param['custpage_business_unit'];
            var sales_category = req_param['custpage_sales_category'];

            var param = {
               start_date: start_date,
               end_date: end_date,
               delivery_order: (delivery_order).split('\u0005'),
               items: (items).split('\u0005'),
               invoice_number: (invoice_number).split('\u0005'),
               business_unit: (business_unit).split('\u0005'),
               sales_category: (sales_category).split('\u0005'),
            }
            log.debug('params', param)

            var salesRep = searchSalesRep1(param);

            var invIdArr = []

            for (let i = 0; i < salesRep.length; i++) {
               if (salesRep[i].del_ord_number) {
                  invIdArr.push(salesRep[i].del_ord_number);
               }
            }
            log.debug('invIdArr', invIdArr)

            if (invIdArr.length > 0) {
               var invoiceSearch = searchSalesRep2(invIdArr);

               var combineArr = combine(salesRep, invoiceSearch);


               if (print_as === '1') {
                  var printReportHtml = printHtml(form, combineArr, context, param);
               } else if (print_as === '2') {
                  var printReportHtml = printExcel(form, combineArr, context);
               }
            } else {
               // var invoiceSearch = searchSalesRep2(invIdArr);

               var combineArr = combine(salesRep, []);

               // log.debug('params', param)

               if (print_as === '1') {
                  var printReportHtml = printHtml(form, combineArr, context, param);
               } else if (print_as === '2') {
                  var printReportHtml = printExcel(form, combineArr, context);
               }
            }


         }

         form.addSubmitButton({
            label: 'Generate'
         });

      }

      return {
         onRequest: onRequest
      }
   });

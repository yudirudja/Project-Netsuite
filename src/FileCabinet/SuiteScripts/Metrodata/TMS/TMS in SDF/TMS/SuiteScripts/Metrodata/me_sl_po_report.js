/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/redirect", "N/ui/serverWidget", "N/task", "N/search", './config/me_config_yudi.js', 'N/file', 'N/url', './lib/moment.min.js', 'N/encode', './lib/jszip.min.js'],
   function (redirect, serverWidget, task, search, config, file, url, moment, encode, jszip) {

      const FILTER = {
         print_type : 'custpage_print_type',
         startdate : 'custpage_startdate',
         enddate : 'custpage_enddate',
         business_unit : 'custpage_business_unit',
         po_status : 'custpage_po_status',
         po_number : 'custpage_po_number',
         pr_number : 'custpage_pr_number',
         bill_number : 'custpage_bill_number',
         vendor_category: 'custpage_vendor_category'
      }

      const HEADER_COLUMN = {
         vendor_coa : 'Vend Account',
         vendor_name : 'Vend Name',
         vendor_group : 'Vend Group',
         vendor_category : 'Vend Category',
         item_group : 'Item Group',
         item_id : 'Item ID',
         item_name : 'Item Name',
         business_unit : 'Business Unit',
         pr_number : 'PR Number',
         pr_date : 'PR Date',
         rfq_number : 'RFQ Number',
         po_number : 'PO Number',
         po_date : 'PO Date',
         selisih_pr_po: 'Selisih PR - PO Date', //new additional
         eta_date: 'ETA Date', //new additional
         etd_date: 'ETD Date', //new additional
         po_qty : 'PO Qty',
         item_unit : 'Unit',
         grn_number : 'GRN Number',
         grn_date : 'GRN Date',
         selisih_eta_grn: 'Selisih ETA - GRN Date', //new additional
         grn_qty : 'GRN Qty',
         grn_amount_fx : 'GRN Amount (Original)',
         grn_amount : 'GRN Amount Base (USD)',
         grn_exch_rate : 'GRN Exch rate',
         inv_number : 'Invoice Number',
         inv_date : 'Invoice Date',
         inv_qty : 'Invoice Qty',
         inv_currency : 'Invoice Currency',
         inv_unit_price : 'Invoice Unit Price',
         inv_exch_rate : 'Invoice Exchange Rate',
         sub_tot_fx : 'Sub Total Original',
         sub_tot : 'Sub Total Base (USD)',
         discount : 'Discount',
         other_amt_fx : 'Other (Original)',
         other_amt : 'Other (USD)',
         grand_total_fx : 'Grand Total Original',
         grand_total : 'Grand Total Base (USD)',
      }

      var final_result = {
         pr_arr: [],
         po_arr : [],
         ir_arr : [],
         bill_arr : [],
         data_final : {}
      };
      
      function addComa(number) {
         // Ensure the input is a number
         if (isNaN(number)) {
            return '0.00';
         }

         // Convert the number to a string with exactly two decimal places
         var parts = Number(number).toFixed(2).split('.');

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

      function searchPOByBill(params) {
         var bill_arr = params.bill_number
         
         var filters = [
            ["applyingtransaction","anyof",bill_arr]
         ]
         log.debug('filters searchPObybill', filters)
         var po_arr = []
         var poBillSearch = search.create({
            type: "purchaseorder",
            filters: filters,
            columns:
            [
               search.createColumn({name: "tranid", label: "PO Number"}),
               search.createColumn({name: "trandate", label: "PO Date"}),
               
            ]
         });

         var startrow = 0;

         do {

            var result = poBillSearch.run().getRange({
               start: startrow,
               end: startrow + 1000
            });
            // log.debug('result searchPOBill', result)

            for (let i = 0; i < result.length; i++) {
               var po_id = result[i].id
               if(po_arr.indexOf(po_id) == -1){
                  po_arr.push(po_id)
               }
            }

            startrow += 1000;

         } while (result.length === 1000);
         log.debug('po_arr searchPOByBill()', po_arr)
         
         return po_arr;

      }

      function getStatusPO(){
         var status_po_value = [
            "PurchOrd:A",
            "PurchOrd:B",
            "PurchOrd:C",
            "PurchOrd:D",
            "PurchOrd:E",
            "PurchOrd:F",
            "PurchOrd:G",
            "PurchOrd:H",
            "PurchOrd:P"
         ]
         var status_po_text = [ 
            "Purchase Order:Pending Supervisor Approval",
            "Purchase Order:Pending Receipt",
            "Purchase Order:Rejected by Supervisor",
            "Purchase Order:Partially Received",
            "Purchase Order:Pending Billing/Partially Received",
            "Purchase Order:Pending Bill",
            "Purchase Order:Fully Billed",
            "Purchase Order:Closed",
            "Purchase Order:Planned",
         ]

         var status_po = []
         for(var i=0; i < status_po_value.length; i++){
            var status_obj = {value: status_po_value[i], text: status_po_text[i]}
            status_po.push(status_obj)
         }

         return status_po
      }

      function searchPO(params) {

         log.debug("param searchPO", params);
         var ir_arr = []
         var bill_arr = params.bill_number
         var startdate = params.startdate
         var enddate = params.enddate
         var po_arr = params.po_number
         var po_status_arr = params.po_status
         var pr_arr = params.pr_number
         var business_unit_arr = params.business_unit
         var vendor_category_arr = params.vendor_category
      
         
         var filters = [
            ["type","anyof","PurchOrd"], 
            "AND", 
            ["applyingtransaction.type","noneof","VendBill","VendAuth"], 
            "AND", 
            ["appliedtotransaction.type","noneof","BlankOrd","PurchCon"], 
            "AND", 
            ["mainline","is","F"], 
            "AND", 
            ["shipping","is","F"], 
            "AND", 
            ["cogs","is","F"], 
            "AND", 
            ["taxline","is","F"], 
            "AND", 
            ["appliedtotransaction.numbertext","startswith",""], 
            "AND", 
            ["numbertext","startswith",""]
         ]

         if (startdate && enddate) {
            filters.push(
               "AND",
               ["trandate", "within", startdate, enddate]
            )
         }

         if(po_arr.length > 0){
            filters.push(
               "AND", 
               ["internalid","anyof",po_arr]
            )
         }

         if(po_status_arr.length > 0){
            filters.push(
               "AND", 
               ["status","anyof", po_status_arr]
            )
         }

         if(business_unit_arr.length > 0) {
            filters.push(
               "AND",
               ["class", "anyof", business_unit_arr]
            )
         }

         if(vendor_category_arr.length > 0) {
            filters.push(
               "AND",
               ["vendor.category", "anyof", vendor_category_arr]
            )
         }

         if(pr_arr.length > 0){
            filters.push(
               "AND", 
               ["createdfrom","anyof",pr_arr]
            )
         }

         if(bill_arr.length > 0){
            po_arr = searchPOByBill(params)
            filters.push(
               "AND", 
               ["internalid", "anyof", po_arr]
            )
         }
         log.debug('searchPO filters', filters)

         var poBillSearch = search.create({
            type: "purchaseorder",
            filters: filters,
            columns:
            [
               search.createColumn({
                  name: "entityid",
                  join: "vendor",
                  label: "Vend Account"
               }),
               search.createColumn({
                  name: "altname",
                  join: "vendor",
                  label: "Name"
               }),
               search.createColumn({
                  name: "custitem_me_item_group",
                  join: "item",
                  label: "Item Group"
               }),
               search.createColumn({name: "custitem_me_item_id", join: "item", label: "Item ID"}),
               search.createColumn({name: "item", label: "Item Name"}),
               //5
               search.createColumn({name: "classnohierarchy", label: "Business Unit"}),
               search.createColumn({name: "appliedtotransaction", label: "PR ID"}),
               search.createColumn({name: "tranid", label: "PO Number"}),
               search.createColumn({name: "trandate", label: "PO Date"}),
               search.createColumn({name: "quantity", label: "PO Quantity"}),
               //10
               search.createColumn({name: "unit", label: "Unit"}),
               search.createColumn({name: "applyingtransaction", label: "GRN Number"}),
               search.createColumn({
                  name: "trandate",
                  join: "applyingTransaction",
                  label: "GRN Date"
               }),
               search.createColumn({
                  name: "quantity",
                  join: "applyingTransaction",
                  label: "GRN Qty"
               }),
               search.createColumn({
                  name: "fxamount",
                  join: "applyingTransaction",
                  label: "GRN Amount (Original)"
               }),
               //15
               search.createColumn({
                  name: "amount",
                  join: "applyingTransaction",
                  label: "GRN Amount Base (USD)"
               }),
               search.createColumn({
                  name: "exchangerate",
                  join: "applyingTransaction",
                  label: "GRN Exchange Rate"
               }),
               search.createColumn({
                  name: "custbody_me_invoice_ap_number",
                  join: "applyingTransaction",
                  label: "Invoice Number"
               }),
               search.createColumn({name: "custcol_me_discount_percentage", label: "Discount %"}),
               search.createColumn({name: "custcol_me_discount_amount_purchase", label: "Discount Amount"}),
               //20
               search.createColumn({name: "custbody_me_eta", label: "ME - ETA"}),
               search.createColumn({name: "custbody_me_etd", label: "ME - ETD"}),
               search.createColumn({
                  name: "trandate",
                  join: "createdFrom",
                  label: "PR Date"
               }),
               search.createColumn({
                  name: "trandate",
                  join: "applyingTransaction",
                  label: "GR Date"
               }),
               search.createColumn({
                  name: "formulanumeric",
                  formula: "{trandate}-{createdfrom.trandate}",
                  label: "Selisih PR Date - PO Date"
               }),
               //25
               search.createColumn({
                  name: "formulanumeric",
                  formula: "{custbody_me_eta}-{applyingtransaction.trandate}",
                  label: "Selisih ETA Date - GR Date"
               }),
               search.createColumn({
                  name: "custentity_me_vendor_group",
                  join: "vendor",
                  label: "ME - Vendor Group"
               }),
               search.createColumn({
                  name: "category",
                  join: "vendor",
                  label: "ME - Vendor Category"
               }),
               search.createColumn({
                  name: "tranid",
                  join: "createdFrom",
                  label: "PR Number"
               }),
            ]
         });

         var startrow = 0;

         do {

            var result = poBillSearch.run().getRange({
               start: startrow,
               end: startrow + 1000
            });
            // log.debug('result searchPOBill', result)

            for (let i = 0; i < result.length; i++) {
               var vendor_coa = result[i].getValue(result[i].columns[0])
               var vendor_name = result[i].getValue(result[i].columns[1])
               var vendor_group = result[i].getText(result[i].columns[26])
               var vendor_category = result[i].getText(result[i].columns[27])
               var item_group = result[i].getText(result[i].columns[2])
               var itemID = result[i].getValue(result[i].columns[3])
               var item_id = result[i].getValue(result[i].columns[4])
               var item_name = result[i].getText(result[i].columns[4])
               var business_unit = result[i].getText(result[i].columns[5])
               var pr_number = result[i].getValue(result[i].columns[28])
               var pr_id = result[i].getValue(result[i].columns[6])
               var po_id = result[i].id
               var po_number = result[i].getValue(result[i].columns[7])
               var po_date = result[i].getValue(result[i].columns[8])
               var po_qty = Number(result[i].getValue(result[i].columns[9]))
               var item_unit = result[i].getValue(result[i].columns[10])
               var grn_number = result[i].getValue(result[i].columns[11])
               var grn_exch_rate = Number(result[i].getValue(result[i].columns[16]))
               var grn_amount = Number(result[i].getValue(result[i].columns[15]))
               var grn_amount_fx = Number(result[i].getValue(result[i].columns[14]))
               var discount_amt = Number(result[i].getValue(result[i].columns[19]))
               var discount_rate = Number(result[i].getValue(result[i].columns[18]))
               var eta_date = result[i].getValue(result[i].columns[20])
               var etd_date = result[i].getValue(result[i].columns[21])
               var pr_date = result[i].getValue(result[i].columns[22])
               var grn_date = result[i].getValue(result[i].columns[23])
               var selisih_prdate_podate = Number(result[i].getValue(result[i].columns[24]))
               var selisih_etadate_grndate = Number(result[i].getValue(result[i].columns[25]))

               if(!final_result.data_final[po_id]){
                  final_result.data_final[po_id] = {
                     vendor_coa : vendor_coa,
                     vendor_name : vendor_name,
                     vendor_group : vendor_group,
                     vendor_category : vendor_category,
                     business_unit : business_unit,
                     po_id : po_id,
                     po_number : po_number,
                     po_date : po_date,
                     eta_date : eta_date,
                     etd_date : etd_date,
                     selisih_prdate_podate : selisih_prdate_podate,
                     data_item:{}
                  }
               }

               if(!final_result.data_final[po_id].data_item[item_id]){
                  final_result.data_final[po_id].data_item[item_id] = {
                     itemID: itemID,
                     item_id: item_id,
                     item_name: item_name,
                     item_group: item_group,
                     item_qty: po_qty,
                     item_unit: item_unit,
                     discount_amt: discount_amt,
                     discount_rate: discount_rate,
                     item_amount: 0,
                     item_amount_fx: 0,
                     item_amount: 0,
                     pr_number : pr_number,
                     pr_date: pr_date,
                     rfq_number: '',
                     grn_amount: grn_amount,
                     grn_amount_fx: grn_amount_fx,
                     grn_exch_rate: grn_exch_rate,
                     grn_date: grn_date,
                     selisih_etadate_grndate: selisih_etadate_grndate,
                     detail_receipt: {}
                  }
               }
               if(final_result.ir_arr.indexOf(grn_number) == -1 && grn_number != ''){
                  final_result.ir_arr.push(grn_number)
               }
               if(final_result.pr_arr.indexOf(grn_number) == -1 && grn_number != ''){
                  final_result.pr_arr.push(pr_id)
               }
               if(final_result.po_arr.indexOf(po_id) == -1){
                  final_result.po_arr.push(po_id)
               }
            }

            startrow += 1000;

         } while (result.length === 1000);

         searchPRRFQ(pr_arr,po_arr)
         searchReceipt(final_result)
         log.debug('Final Result after search receipt', final_result)

         searchBill()

         log.debug('Final Result PO Bill Search', final_result)
         return final_result;

      }

      function searchReceipt(final_result) {
         var ir_arr = final_result.ir_arr
         var po_arr = final_result.po_arr

         var filters = [
            ["type","anyof","ItemRcpt"], 
            "AND", 
            ["mainline","is","F"], 
            "AND", 
            ["taxline","is","F"], 
            "AND", 
            ["shipping","is","F"], 
            "AND", 
            ["cogs","is","F"],
            "AND", 
            ["createdfrom.type","anyof","PurchOrd"] 
            
         ]
         if(ir_arr.length > 0){
            filters.push(
               "AND", 
               ["internalid","anyof",ir_arr]
            )
         }
         if(po_arr.length > 0){
            filters.push(
               "AND", 
               ["createdfrom","anyof",po_arr]
            )
         }


         log.debug('filters searchReceipt', filters)
         var itemreceiptSearch = search.create({
            type: "itemreceipt",
            filters: filters,
            columns:
            [
               search.createColumn({name: "tranid", label: "IR Docnum"}),
               search.createColumn({name: "trandate", label: "IR Date"}),
               search.createColumn({name: "custbody_me_invoice_ap_number", label: "ME - Bill/Invoice Number"}),
               search.createColumn({name: "item", label: "Item"}),
               search.createColumn({name: "quantity", label: "Item Qty"}),
               //5
               search.createColumn({name: "createdfrom", label: "Created From"}),
               search.createColumn({name: "currency", label: "Invoice Currency"}),
               search.createColumn({name: "exchangerate", label: "Invoice Exchange Rate"}),
               search.createColumn({name: "amount", label: "Amount"}),
               search.createColumn({name: "fxamount", label: "Amount (Foreign Currency)"}),
               //10
               search.createColumn({
                  name: "custbody_me_eta",
                  join: "createdFrom",
                  label: "ME - ETA"
               }),
               search.createColumn({
                  name: "formulanumeric",
                  formula: "{createdfrom.custbody_me_eta}-{trandate}",
                  label: "Selisih ETA PO - IR Date"
               })
            ]
         });

         var startrow = 0;

         do {

            var result = itemreceiptSearch.run().getRange({
               start: startrow,
               end: startrow + 1000
            });

            for (let i = 0; i < result.length; i++) {
               var grn_id = result[i].id
               var grn_tranid = result[i].getValue(result[i].columns[0])
               var grn_trandate = result[i].getValue(result[i].columns[1])
               var grn_exch_rate = Number(result[i].getValue(result[i].columns[7]))
               var grn_curency = result[i].getText(result[i].columns[6])
               var grn_amount = result[i].getValue(result[i].columns[8])
               var grn_amount_fx = result[i].getValue(result[i].columns[9])
               var po_id = result[i].getValue(result[i].columns[5])
               var po_tranid = result[i].getValue(result[i].columns[5])
               var bill_id = result[i].getValue(result[i].columns[2])
               var bill_tranid = result[i].getText(result[i].columns[2])
               var item_id = result[i].getValue(result[i].columns[3])
               var item_name = result[i].getText(result[i].columns[3])
               var item_qty = result[i].getValue(result[i].columns[4])
               var po_eta = result[i].getValue(result[i].columns[10])
               var selisih_etadate_grndate = result[i].getValue(result[i].columns[11])
               if(final_result.bill_arr.indexOf(bill_id) == -1 && bill_id != ''){
                  final_result.bill_arr.push(bill_id)
               }

               if(po_id in final_result.data_final){
                  if(item_id in final_result.data_final[po_id].data_item){
                     if (!final_result.data_final[po_id].data_item[item_id].detail_receipt[item_id + '_' + grn_id]){
                        final_result.data_final[po_id].data_item[item_id].detail_receipt[item_id + '_' + grn_id] = {
                           item_id: item_id,
                           item_name: item_name,
                           item_qty: item_qty,
                           po_eta: po_eta,
                           selisih_etadate_grndate: selisih_etadate_grndate,
                           grn_id: grn_id,
                           grn_tranid: grn_tranid,
                           grn_trandate: grn_trandate,
                           grn_curency: grn_curency,
                           grn_exch_rate: grn_exch_rate,
                           grn_amount: grn_amount,
                           grn_amount_fx: grn_amount_fx,
                           bill_id: '',
                           bill_tranid: '',
                           bill_trandate: '',
                           bill_currency: '',
                           bill_exch_rate: 0,
                           bill_disc_rate: 0,
                           bill_disc_amount: 0,
                           bill_qty: 0,
                           bill_unit_price: 0,
                           sub_tot : 0,
                           sub_tot_fx : 0,
                           discount : 0,
                           other_amt : 0,
                           other_amt_fx : 0,
                           grand_total : 0,
                           grand_total_fx: 0
                        }
                     }
                  }                  
               }
            }

            startrow += 1000;

         } while (result.length === 1000);

         log.debug('final result searchReceipt', final_result)
         return final_result;
      }

      function searchBill(params){
         var bill_arr = final_result.bill_arr
         var filters = [
            ["type","anyof","VendBill"], 
            "AND", 
            ["mainline","is","F"], 
            "AND", 
            ["taxline","is","F"], 
            "AND", 
            ["shipping","is","F"], 
            "AND", 
            ["cogs","is","F"]
         ]
         if(bill_arr.length > 0){
            filters.push(
               "AND", 
               ["internalid","anyof",bill_arr]
               
            )
         }
         var vendorbillSearch = search.create({
            type: "vendorbill",
            filters: filters,
            columns:
            [
               search.createColumn({name: "tranid", label: "Invoice Number"}),
               search.createColumn({name: "custbody_me_gr_number", label: "GRN Number"}),
               search.createColumn({name: "trandate", label: "Invoice Date"}),
               search.createColumn({
                  name: "formulanumeric",
                  formula: "ABS({quantity})",
                  label: "Invoice Qty"
               }),
               search.createColumn({name: "currency", label: "Invoice Currency"}),
               //5
               search.createColumn({
                  name: "formulacurrency",
                  formula: "ABS({custcolme_unitprice_bfr_purchase_disc})",
                  label: "Bill Unit Price (Original)"
               }),
               search.createColumn({name: "exchangerate", label: "Invoice Exchange Rate"}),
               search.createColumn({
                  name: "formulacurrency",
                  formula: "ABS({custcolme_unitprice_bfr_purchase_disc}*{quantity})",
                  label: "Sub Total (Original)"
               }),
               search.createColumn({
                  name: "formulacurrency",
                  formula: "ABS({custcolme_unitprice_bfr_purchase_disc}*{quantity}*{exchangerate})",
                  label: "Sub Total (USD)"
               }),
               search.createColumn({name: "custcol_me_discount_percentage", label: "Discount (%)"}),
               //10
               search.createColumn({
                  name: "formulacurrency",
                  formula: "ABS(({taxitem.rate}/100)*{fxamount})",
                  label: "Other (Original)"
               }),
               search.createColumn({
                  name: "formulacurrency",
                  formula: "ABS({taxamount})",
                  label: "Other (USD)"
               }),
               search.createColumn({
                  name: "formulacurrency",
                  formula: "ABS({fxamount}+ABS({taxitem.rate}/100)*{fxamount})",
                  label: "Grand Total (Original)"
               }),
               search.createColumn({name: "total", label: "Grand Total (USD)"}),
               search.createColumn({name: "item", label: "Item"}),
               //15
               search.createColumn({name: "quantity", label: "Quantity"}),
               search.createColumn({name: "appliedtotransaction", label: "Applied To Transaction"}),
               search.createColumn({name: "custcol_me_discount_amount_purchase", label: "Discount Amt"})
               
            ]
         });

         var startrow = 0;

         do {

            var result = vendorbillSearch.run().getRange({
               start: startrow,
               end: startrow + 1000
            });
            log.debug('result searchBill length ' + result.length, result)
            for (let i = 0; i < result.length; i++) {
               var bill_id = result[i].id
               var bill_tranid = result[i].getValue(result[i].columns[0])
               var bill_trandate = result[i].getValue(result[i].columns[2])
               var po_id = result[i].getValue(result[i].columns[16])
               var po_tranid = result[i].getValue(result[i].columns[16])
               var grn_ids = result[i].getValue(result[i].columns[1])
               var item_id = result[i].getValue(result[i].columns[14])
               var item_name = result[i].getText(result[i].columns[14])
               var item_qty = Number(result[i].getValue(result[i].columns[15])) || 0
               var bill_disc_rate = result[i].getValue(result[i].columns[9])
               var bill_currency = result[i].getText(result[i].columns[4])
               var bill_unit_price = Number(result[i].getValue(result[i].columns[5]))
               var bill_exch_rate = Number(result[i].getValue(result[i].columns[6]))
               var sub_tot = Number(result[i].getValue(result[i].columns[8]))
               var sub_tot_fx = Number(result[i].getValue(result[i].columns[7]))
               var bill_disc_amount = Number(result[i].getValue(result[i].columns[17]))
               var other_amt = Number(result[i].getValue(result[i].columns[11]))
               var other_amt_fx = Number(result[i].getValue(result[i].columns[10]))
               var grand_total_fx = Number(result[i].getValue(result[i].columns[12]))
               var grand_total = Number(grand_total_fx * bill_exch_rate)
               if(final_result.bill_arr.indexOf(bill_id) == -1){
                  final_result.bill_arr.push(bill_id)
               }

               if(po_id in final_result.data_final){
                  // log.debug('final_result.data_final[po_id] ' + po_tranid, final_result.data_final[po_id])
                  if(item_id in final_result.data_final[po_id].data_item){
                     // log.debug('ITEM ID ADA ' + item_name + ' BILL TRANID: ' + bill_tranid + ' idx: ' + i,
                     //    {
                     //       item_id: item_id,
                     //       item_name: item_name,
                     //       grn_id: grn_ids
                     //    }
                     // )
                     var data_item = final_result.data_final[po_id].data_item[item_id]
                     var detail_receipt = data_item.detail_receipt
                     for(var item_ir in detail_receipt){
                        // log.debug('detail_receipt[item_ir]', detail_receipt[item_ir])

                        if(detail_receipt[item_ir].item_id == item_id && grn_ids.indexOf(detail_receipt[item_ir].grn_id) != -1){
                           // log.debug('Data data ITEM ID ADA ' + item_name + ' | ' + item_id +
                           //    ' | BILL TRANID: ' + bill_tranid,
                           //    {
                           //       item_name: item_name,
                           //       // item_lot_name: item_lot_name,
                           //       grn_id: grn_ids
                           //    }
                           // )
                           detail_receipt[item_ir].bill_id = bill_id
                           detail_receipt[item_ir].bill_tranid = bill_tranid
                           detail_receipt[item_ir].bill_trandate = bill_trandate
                           detail_receipt[item_ir].bill_unit_price = bill_unit_price
                           detail_receipt[item_ir].bill_currency = bill_currency
                           detail_receipt[item_ir].bill_exch_rate = bill_exch_rate
                           detail_receipt[item_ir].bill_disc_rate = bill_disc_rate
                           detail_receipt[item_ir].bill_disc_amount = bill_disc_amount
                           detail_receipt[item_ir].bill_qty = item_qty
                           detail_receipt[item_ir].sub_tot = sub_tot
                           detail_receipt[item_ir].sub_tot_fx = sub_tot_fx
                           detail_receipt[item_ir].other_amt = other_amt
                           detail_receipt[item_ir].other_amt_fx = other_amt_fx
                           detail_receipt[item_ir].grand_total_fx = grand_total_fx
                           detail_receipt[item_ir].grand_total = grand_total
                        }
                     }
                  }                  
               }
            }

            startrow += 1000;
         } while (result.length === 1000);

         log.debug('final result searchBill', final_result)
         return final_result;
      }

      function printHtml(final_data, param, context, form) {
         var reportGroup = form.addFieldGroup({
            id: 'report_group',
            label: 'Report'
         });
         var data_final = final_data.data_final
         var poReport = form.addField({
            id: 'custpage_po_report',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Report Purchase Order',
            container: 'report_group'
         });

         poReport.defaultValue = '<!DOCTYPE html> ' +
            '<html lang="en">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<h2 style= "text-align">Report Purchase ' + (param.startdate?param.startdate:"") + " to " + (param.enddate?param.enddate:"") + '</h2>' +
            '<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"/>' +
            '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js">' +
            '</script>' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
            '</script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js">' +
            '</script>' +
            '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css"/>' +
            '<script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js">' +
            '</script>' +
            '<script src="https://code.jquery.com/jquery-3.3.1.js"></script>' +
            '<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/dataTables.buttons.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.flash.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.html5.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.print.min.js"></script>' +
            '</script>' +

            '<script>$(document).ready(function () { $("#daTable").DataTable({ "pageLength": 50, dom: "Bfrtip","buttons": ["excel"]})})</script>' +
            '</head>';
         poReport.defaultValue += '<body>';

         poReport.defaultValue += '<style>' +
            '.table{border:1px solid black; margin-top: 5%}' +
            '.table-head-column{border:1px solid black; border-collapse: collapse; font-weight: bold;}' +
            '.table-row{border:1px solid black; border-collapse: collapse;}' +
            '.table-column{border:1px solid black; border-collapse: collapse;}' +
            '</style>' +
            '<table style="width:200%; border:10px" id="daTable" class="table table-striped table-bordered table-hover dt-responsive" style="width:100%">' +
            '<thead class="thead-dark" style="font-weight: bold">' +
            '<tr >'
            for(var bodyname in HEADER_COLUMN){
               poReport.defaultValue += '<th scope="col">' + HEADER_COLUMN[bodyname] + '</th>'
            }
            

         poReport.defaultValue += '</tr>';
         poReport.defaultValue += '</thead>';
         poReport.defaultValue += '<tbody>';

         for(var po in data_final){
            var data_po = data_final[po]
            for (var item in data_po.data_item){
               var data_item = data_po.data_item[item]
               if(Object.keys(data_item.detail_receipt).length > 0){
                  for(var detail in data_item.detail_receipt){
                     var detail_item = data_item.detail_receipt[detail]
                     // log.debug('data_po ' + po, data_po)
                     // log.debug('data_item ' + item, data_item)
                     // log.debug('detail_item ' + detail, detail_item)
                     
                     poReport.defaultValue += '<tr>' +
                              '<td>' + data_po.vendor_coa + '</td>' +
                              '<td>' + data_po.vendor_name + '</td>' +
                              '<td>' + data_po.vendor_group + '</td>' +
                              '<td>' + data_po.vendor_category + '</td>' +
                              '<td>' + data_item.item_group + '</td>' +
                              //5
                              '<td>' + data_item.itemID + '</td>' +
                              '<td>' + data_item.item_name + '</td>' +
                              '<td>' + data_po.business_unit + '</td>' +
                              '<td>' + data_item.pr_number + '</td>' +
                              '<td>' + data_item.pr_date + '</td>' +
                              //10
                              '<td>' + data_item.rfq_number + '</td>' +
                              '<td>' + data_po.po_number + '</td>' +
                              '<td>' + data_po.po_date + '</td>' +
                              '<td>' + data_po.selisih_prdate_podate + '</td>' +
                              '<td>' + data_po.eta_date + '</td>' +
                              //15
                              '<td>' + data_po.etd_date + '</td>' +
                              '<td>' + data_item.item_qty + '</td>' +
                              '<td>' + data_item.item_unit + '</td>' +
                              '<td>' + detail_item.grn_tranid + '</td>' +
                              '<td>' + detail_item.grn_trandate + '</td>' +
                              //20
                              '<td>' + detail_item.selisih_etadate_grndate + '</td>' +
                              '<td>' + detail_item.item_qty + '</td>' +
                              '<td>' + addComa(detail_item.grn_amount_fx) + '</td>' +
                              '<td>' + addComa(detail_item.grn_amount) + '</td>' +
                              '<td>' + detail_item.grn_exch_rate + '</td>' +
                              //25
                              '<td>' + detail_item.bill_tranid + '</td>' +
                              '<td>' + detail_item.bill_trandate + '</td>' +
                              '<td>' + Math.abs(detail_item.bill_qty) + '</td>' +
                              '<td>' + detail_item.bill_currency + '</td>' +
                              '<td>' + addComaFiveDec(detail_item.bill_unit_price) + '</td>' +
                              //30
                              '<td>' + detail_item.bill_exch_rate + '</td>' +
                              '<td>' + addComa(detail_item.sub_tot_fx) + '</td>' +
                              '<td>' + addComa(detail_item.sub_tot) + '</td>' +
                              '<td>' + detail_item.bill_disc_rate + '</td>' +
                              '<td>' + addComa(detail_item.other_amt_fx) + '</td>' +
                              //35
                              '<td>' + addComa(detail_item.other_amt) + '</td>' +
                              '<td>' + addComa(detail_item.grand_total_fx) + '</td>' +
                              '<td>' + addComa(detail_item.grand_total) + '</td>' +
                        '</tr>';
                  }
               } else {
                  poReport.defaultValue += '<tr>' +
                              '<td>' + data_po.vendor_coa + '</td>' +
                              '<td>' + data_po.vendor_name + '</td>' +
                              '<td>' + data_po.vendor_group + '</td>' +
                              '<td>' + data_po.vendor_category + '</td>' +
                              '<td>' + data_item.item_group + '</td>' +
                              //5
                              '<td>' + data_item.itemID + '</td>' +
                              '<td>' + data_item.item_name + '</td>' +
                              '<td>' + data_po.business_unit + '</td>' +
                              '<td>' + data_item.pr_number + '</td>' +
                              '<td>' + data_item.pr_date + '</td>' +
                              //10
                              '<td>' + data_item.rfq_number + '</td>' +
                              '<td>' + data_po.po_number + '</td>' +
                              '<td>' + data_po.po_date + '</td>' +
                              '<td>' + data_po.selisih_prdate_podate + '</td>' +
                              '<td>' + data_po.eta_date + '</td>' +
                              //15
                              '<td>' + data_po.etd_date + '</td>' +
                              '<td>' + data_item.item_qty + '</td>' +
                              '<td>' + data_item.item_unit + '</td>' +
                              '<td>' + '' + '</td>' +
                              '<td>' + '' + '</td>' +
                              //20
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              //25
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              //30
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              //35
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                              '<td>' + 0 + '</td>' +
                        '</tr>';
               }
            }
         }

         poReport.defaultValue += '</tbody>';
         poReport.defaultValue += '</table>';
         poReport.defaultValue += '</body>' +
            '</html>';
         context.response.writePage(form);
      }

      function parameters() {
         var form = serverWidget.createForm({
            title: 'Purchase Report'
         })

         var reportFilter = form.addFieldGroup({
            id: 'report_filter',
            label: 'Filter'
         });

         var printType = form.addField({
            id: FILTER.print_type,
            type: serverWidget.FieldType.SELECT,
            label: "Generate As",
            container: 'report_filter'
         })
         printType.isMandatory = true;
         printType.addSelectOption({
            value: '1',
            text: 'Page'
         });
         printType.defaultValue = 1

         var startDate = form.addField({
            id: FILTER.startdate,
            type: serverWidget.FieldType.DATE,
            label: "Start Date",
            container: 'report_filter'
         })
         // startDate.defaultValue = new Date();

         var endDate = form.addField({
            id: FILTER.enddate,
            type: serverWidget.FieldType.DATE,
            label: "End Date",
            container: 'report_filter'
         });

         // endDate.isMandatory = true;
         // endDate.defaultValue = new Date();
         var po_status = form.addField({
            id: FILTER.po_status,
            type: serverWidget.FieldType.MULTISELECT,
            label: "PO Status",
            container: 'report_filter'
         });
         var status_po_arr = getStatusPO()
         for(var i = 0; i < status_po_arr.length; i++){
            po_status.addSelectOption({value: status_po_arr[i].value, text: status_po_arr[i].text})
         }
         // po_status.isMandatory = true

         var po_number = form.addField({
            id: FILTER.po_number,
            type: serverWidget.FieldType.MULTISELECT,
            source: 'purchaseorder',
            label: "PO Number",
            container: 'report_filter'
         });

         var pr_number = form.addField({
            id: FILTER.pr_number,
            type: serverWidget.FieldType.MULTISELECT,
            source: 'purchaserequisition',
            label: "Requisition Number",
            container: 'report_filter'
         });

         var bill_number = form.addField({
            id: FILTER.bill_number,
            type: serverWidget.FieldType.MULTISELECT,
            source: 'vendorbill',
            label: "Bill Number",
            container: 'report_filter'
         });
         var businessUnit = form.addField({
            id: FILTER.business_unit,
            type: serverWidget.FieldType.MULTISELECT,
            source: 'classification',
            label: "Business Unit",
            container: 'report_filter'
         });

         var vendor_category = form.addField({
            id: FILTER.vendor_category,
            type: serverWidget.FieldType.MULTISELECT,
            source: 'vendorcategory',
            label: "Vendor Category",
            container: 'report_filter'
         });

         return form;
      }

      function searchPRRFQ(pr_arr, po_arr){
         var filters = [
            ["type","anyof","PurchReq"], 
            "AND", 
            ["mainline","is","F"], 
            "AND", 
            ["shipping","is","F"], 
            "AND", 
            ["cogs","is","F"], 
            "AND", 
            ["taxline","is","F"], 
            "AND", 
            ["custcol_me_rfq_number","noneof","@NONE@"]
         ]
         if(pr_arr.length > 0){
            filters.push(
               "AND", 
               ["internalid","anyof",pr_arr]
            )
         }
         if(pr_arr.length > 0){
            filters.push(
               "AND", 
               ["applyingtransaction","anyof",po_arr]
            )
         }

         var pr_search = search.create({
            type: "purchaserequisition",
            filters: filters,
            columns:
            [
               search.createColumn({name: "tranid", label: "Document Number"}),
               search.createColumn({name: "trandate", label: "Date"}),
               search.createColumn({name: "item", label: "Item"}),
               search.createColumn({name: "custcol_me_rfq_number", label: "ME - RFQ Number"}),
               search.createColumn({name: "applyingtransaction", label: "Applying Transaction"})
            ]
         });
         
         var startrow = 0;
         var arr_pr = []
         do {
            var result = pr_search.run().getRange({
               start: startrow,
               end: startrow + 1000
            });
            log.debug('result search PRRFQ length: ' + result.length, result)
            for(var i = 0; i < result.length; i++){
               var pr_id = result[i].id
               var pr_number = result[i].getValue(result[i].columns[0])
               var po_id = result[i].getValue(result[i].columns[4])
               var po_number = result[i].getText(result[i].columns[4])
               var pr_item = result[i].getValue(result[i].columns[2])
               var pr_item_name = result[i].getText(result[i].columns[2])
               var rfq_number = result[i].getText(result[i].columns[3]) || ''
               if(po_id in final_result.data_final){
                  log.debug('po ada di rfq ' + po_number)
                  if (pr_item in final_result.data_final[po_id].data_item){
                     var pr_number_final = final_result.data_final[po_id].data_item[pr_item].pr_number
                     log.debug('item PR ada di rfq ' + pr_item_name, {pr_number: pr_number, pr_number_final: pr_number_final})
                     if(pr_number == pr_number_final){
                        final_result.data_final[po_id].data_item[pr_item].rfq_number = rfq_number
                     }
                  }
               }
               // var check_existing = arr_pr.findIndex((val)=>{val.value == pr_id})
               // if(check_existing == -1){
               //    arr_pr.push({value: pr_id, text: pr_number})
               // }
            }

            startrow += 1000
         } while (result.length == 1000);
         log.debug('arr_pr', arr_pr)
         
         return arr_pr
      }

      function onRequest(context) {
         var form = parameters()

         if (context.request.method == 'GET') {
            
            context.response.writePage(form);
         } else {
            var param = context.request.parameters;
            
            
            var print_type = param[FILTER.print_type]
            var startdate = param[FILTER.startdate]
            var enddate = param[FILTER.enddate]
            var business_unit = param[FILTER.business_unit] || []
            var po_status = param[FILTER.po_status] || []
            var po_number = param[FILTER.po_number] || []
            var pr_number = param[FILTER.pr_number] || []
            var bill_number = param[FILTER.bill_number] || []
            var vendor_category = param[FILTER.vendor_category] || []

            var body_startdate = form.getField(FILTER.startdate)
            var body_enddate = form.getField(FILTER.enddate)
            var body_business_unit = form.getField(FILTER.business_unit)
            var body_po_status = form.getField(FILTER.po_status)
            var body_po_number = form.getField(FILTER.po_number)
            var body_pr_number = form.getField(FILTER.pr_number)
            var body_bill_number = form.getField(FILTER.bill_number)
            var body_vendor_category = form.getField(FILTER.vendor_category)

            body_startdate.defaultValue = startdate
            body_enddate.defaultValue = enddate
            body_business_unit.defaultValue = business_unit
            body_po_status.defaultValue = po_status
            body_po_number.defaultValue = po_number
            body_pr_number.defaultValue = pr_number
            body_bill_number.defaultValue = bill_number
            body_vendor_category.defaultValue = vendor_category

            var params = {
               print_type : print_type,
               startdate : startdate,
               enddate : enddate,
               business_unit : business_unit.length > 0 ? business_unit.split('\u0005') : [],
               po_status : po_status.length > 0 ? po_status.split('\u0005') : [],
               po_number : po_number.length > 0 ? po_number.split('\u0005') : [],
               pr_number : pr_number.length > 0  ? pr_number.split('\u0005') : [],
               bill_number : bill_number.length > 0  ? bill_number.split('\u0005') : [],
               vendor_category : vendor_category.length > 0  ? vendor_category.split('\u0005') : []
            }
            log.debug('params', params)

            var final_data = searchPO(params);
            var printHtmls = printHtml(final_data, params, context, form);

         }
         form.addSubmitButton({
            label: 'Generate'
         });
      }

      return {
         onRequest: onRequest
      }
   });

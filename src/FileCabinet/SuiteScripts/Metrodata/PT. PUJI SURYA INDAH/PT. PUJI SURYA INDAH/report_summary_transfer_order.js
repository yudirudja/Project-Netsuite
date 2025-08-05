/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 *@author Test
 */

 define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/url', 'N/format', 'N/record', "N/runtime",],
 function (search, serverWidget, log, task, redirect, url, format, record, runtime) {
     var CONFIG = {
         //BAGIAN HEADER
         title: 'Report Summary Item Receipt',
         vendorName: 'custpage_customer_name',
         locationObj: 'custpage_location',
         locationObjTo: 'custpage_location_to',
         startDate: 'custpage_startdate',
         endDate: 'custpage_enddate',
         itemName: 'custpage_item_name',
         viewWith: 'custpage_view',
         viewWithPurch: 'custpage_view_purch',
         productName: 'custpage_product',
     }
     function getParameter() {
         var form = serverWidget.createForm({
             title: 'Report Summary Item Receipt'
         });

         var body_Vendor_Name = form.addField({
             id: CONFIG.vendorName,
             type: serverWidget.FieldType.MULTISELECT,
             label: 'Vendor Name',
             source: 'vendor'
         });

         var body_product = form.addField({
             id: CONFIG.productName,
             type: serverWidget.FieldType.MULTISELECT,
             label: 'Product',
             source: 'customlist_me_clist_produk'
         });

         var body_startDate = form.addField({
             id: CONFIG.startDate,
             type: serverWidget.FieldType.DATE,
             label: 'Start Date'
         });
         body_startDate.isMandatory = true
         body_startDate.defaultValue = new Date()

         var body_endDate = form.addField({
             id: CONFIG.endDate,
             type: serverWidget.FieldType.DATE,
             label: 'End Date'
         });
         body_endDate.isMandatory = true
         body_endDate.defaultValue = new Date()


         body_Vendor_Name.isMandatory = true

         var body_Location = form.addField({
             id: CONFIG.locationObj,
             type: serverWidget.FieldType.MULTISELECT,
             label: 'Location',
             source: 'customlist_me_clist_location'
         });

         var body_Location_to = form.addField({
            id: CONFIG.locationObj,
            type: serverWidget.FieldType.MULTISELECT,
            label: 'Location To',
            source: 'location'
        });

         var body_item = form.addField({
             id: CONFIG.itemName,
             type: serverWidget.FieldType.MULTISELECT,
             label: 'Item',
             source: 'inventoryitem'
         });

         var view_with = form.addField({
             id: CONFIG.viewWith,
             type: serverWidget.FieldType.CHECKBOX,
             label: 'Komplit Inv'
         });

         var viewWith_Purch = form.addField({
             id: CONFIG.viewWithPurch,
             type: serverWidget.FieldType.CHECKBOX,
             label: 'Tampil Purchase'
         });



         //     var view = []
         // var purpose1 = {
         //     id: 'T',
         //     text: 'Komplit Invoice'
         // }
         // var purpose2 = {
         //     id: 'F',
         //     text: 'Tampil Purchase'
         // }

         // view.push(purpose1,purpose2)

         // view_with.addSelectOption({value: '', text: ''})
         // if(view.length){
         //     for(var i=0; i < view.length; i++){
         //         view_with.addSelectOption({value: view[i].id, text: view[i].text})
         //     }
         // }
         viewWith_Purch.defaultValue = "T"
         view_with.defaultValue = "T"


         return {
             form: form,
         }
     }

     function onRequest(context) {
         try {
             // ISI FORM
             if (context.request.method === 'GET') {
                 var form = getParameter().form
                 //  var formPDF = getParameter().form
                 log.debug('hasil form print', form)

                 //FORM EXCEL
                 var body_startDate = form.getField({ id: CONFIG.startDate })
                 var body_endDate = form.getField({ id: CONFIG.endDate })
                 var body_Vendor_Name = form.getField({ id: CONFIG.vendorName })
                 var body_item = form.getField({ id: CONFIG.itemName })
                 var view_with = form.getField({ id: CONFIG.viewWith })
                 var body_product = form.getField({ id: CONFIG.productName })
                 var view_with_purch = form.getField({ id: CONFIG.viewWithPurch })

                 //GET PARAMS Excel
                 var params = context.request.parameters
                 var scriptId = context.request.parameters.script
                 var params_start_date = params[CONFIG.startDate]
                 var params_end_date = params[CONFIG.startDate]
                 var params_vendor_name = params[CONFIG.vendorName]
                 var params_items = params[CONFIG.itemName]
                 var params_view = params[CONFIG.viewWith]
                 var params_product = params[CONFIG.productName]
                 var params_view_with_purch = params[CONFIG.viewWithPurch]


                 form.clientScriptModulePath =  'SuiteScripts/Metrodata/_me_cl_report_summary_item(button).js';
                 
                 form.addButton({
                     id: 'button_report_purchase_order_pdf',
                     label: 'Save As PDF',
                     functionName: 'reportByPurchaseOrdPDF()',
                     // clientScriptModulePath:  'SuiteScripts/Metrodata/_me_cl_report_summary_item(button).js'
                 });

                 form.addButton({
                     id: 'button_report_purchase_order',
                     label: 'Save As Excel',
                     functionName: 'reportByPurchaseOrder()',
                     // clientScriptModulePath: 'SuiteScripts/Metrodata/_me_cl_report_summary_item(button).js'
                 });
             }
             context.response.writePage(form);
             //  context.response.writePage(formPDF);

             var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
             log.debug('Remaining Usage FINALE:', remainingUsage);
         } catch (error) {
             log.debug("error", error);
             throw "Something Error " + error;
         }
     }

     function getLocation() {
         var locSearch = search.create({
             type: "customlist_me_clist_location",
             filters:
                 [
                 ],
             columns:
                 [
                     search.createColumn({ name: "internalid", label: "Internal ID" }),
                     search.createColumn({
                         name: "name",
                         sort: search.Sort.ASC,
                         label: "Name"
                     })
                 ]
         });

         var startrow = 0;
         var previous_doc_id = null;
         var listLocation = []
         do {
             var locResult = locSearch.run().getRange({
                 start: startrow,
                 end: startrow + 1000
             })

             log.debug("locResult", locResult);
             log.debug("Loc Result length", 'length: ' + locResult.length);
             for (var i = 0; i < locResult.length; i++) {

                 var idLocation = locResult[i].getValue(locResult[i].columns[0]);
                 var nameLocation = locResult[i].getValue(locResult[i].columns[1]);

                 if (previous_doc_id === idLocation) continue;
                 listLocation.push({
                     idLocation: idLocation,
                     nameLocation: nameLocation
                 })
             }
             startrow += 1000
         } while (locResult.length == 1000);

         log.debug('Loc Result', listLocation)

         return listLocation
     }

     /*function getItem(){
             var itemSearch =  search.create({
             type: "inventoryitem",
             filters:
             [
                ["type","anyof","InvtPart"]
             ],
             columns:
             [
                search.createColumn({name: "internalid", label: "Internal ID"}),
                search.createColumn({
                   name: "itemid",
                   sort: search.Sort.ASC,
                   label: "Name"
                }),
                search.createColumn({name: "type", label: "Type"})
             ]
          });
         var startrow = 0;
         var previous_doc_id = null;
         var listItem = []
         do {
             var itemResult = itemSearch.run().getRange({
                 start: startrow,
                 end: startrow + 1000
             })

             log.debug("itemResult", itemResult);
             log.debug("itemResult length",'length: ' + itemResult.length);
             for (var i = 0; i < itemResult.length; i++) {
                 
                 var idItem = itemResult[i].getValue(itemResult[i].columns[0]); 
                 var nameItem = itemResult[i].getValue(itemResult[i].columns[1]);

                 if (previous_doc_id === idItem) continue;
                 listItem.push({
                     idItem: idItem,
                     nameItem: nameItem
                 })
             }
             startrow += 1000
         } while (itemResult.length == 1000);

         log.debug('Item Result', listItem)

         return listItem
     }*/

     return {
         onRequest: onRequest,
         
     };
 });
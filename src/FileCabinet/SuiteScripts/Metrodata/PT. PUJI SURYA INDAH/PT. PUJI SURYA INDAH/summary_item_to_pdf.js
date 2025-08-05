/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(['N/search', 'N/render', 'N/file', 'N/record', 'N/encode', 'N/format', 'N/task', 'N/redirect', 'N/ui/serverWidget'],
 function (search, render, file, record, encode, format, task, redirect, serverWidget) {

     function getLocationCostGroupName(locationRecId) {

         var locationRec = record.load({
             type: record.Type.LOCATION,
             id: locationRecId
         });
         var getLocCostGrpName = locationRec.getText({
             fieldId: 'locationcostinggroup'
         });

         return getLocCostGrpName;
     }

     function getItemPrice(itemData, dataSet) {
         var idItems = [];
         itemData.map(function (val) {
             if (val.item != "") {
                 idItems.push(val.item);
             }
         });

         log.debug('id items', idItems);

         var itemPriceSearch = search.create({
             type: "customrecord_me_po_price_disc",
             filters:
                 [
                     ["custrecord_me_po_price_disc_item", "anyof", idItems]
                 ],
             columns:
                 [
                     search.createColumn({
                         name: "scriptid",
                         sort: search.Sort.ASC,
                         label: "Script ID"
                     }),
                     //    search.createColumn({name: "custrecord_me_po_price_disc_area", label: "Area"}),
                     //    search.createColumn({name: "custrecord_me_po_price_disc_startdate", label: "Start Date"}),
                     //    search.createColumn({name: "custrecord_me_po_price_disc_enddate", label: "End Date"}),
                     search.createColumn({ name: "custrecord_me_po_price_disc_price", label: "Pricelist" }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_item", label: "item" }),
                     //    search.createColumn({name: "custrecord_me_po_price_disc_disc1", label: "Discount 1 (%)"}),
                     //    search.createColumn({name: "custrecord_me_po_price_disc_disc2", label: "Discount 2 (%)"}),
                     //    search.createColumn({name: "custrecord_me_po_price_disc_disc3", label: "Discount 3 (Rp)"}),
                     //    search.createColumn({name: "custrecord_me_po_price_disc_disc4", label: "Discount 4 (%)"}),
                     //    search.createColumn({name: "custrecord_me_po_price_disc_disc5", label: "Discount 5 (Rp)"})
                 ]
         }).run().getRange({
             start: 0,
             end: 1000,
         });
         for (let i = 0; i < itemPriceSearch.length; i++) {
             var indexItemData = itemData.findIndex(function(val){
                 return val.item == itemPriceSearch[i].getValue("custrecord_me_po_price_disc_item");
             });
             // log.debug('item data 123', indexItemData);
             itemData[indexItemData].price = itemPriceSearch[i].getValue("custrecord_me_po_price_disc_price");
         }
         for (const key in dataSet) {
             var dataItem = dataSet[key].data_item;
             dataItem.map(function(val){
                 var indexItemData = itemData.findIndex(function(val2){
                     return val2.item == val.itemId;
                 });
                 // log.debug('item data 123', indexItemData);
                 log.debug('price item', itemData[indexItemData].price);
                 
                 val.price = itemData[indexItemData].price;

             });
         log.debug('data item 321',dataItem);
         }
         return dataSet;
     }

     function createPdfTransferOrder(context) {
         var requestparam = context.request.parameters;
         var vendorId = JSON.parse(requestparam.vendorId);

         var vendorName = JSON.parse(requestparam.vendorName);
         var vendorNameString = "";
         if (vendorName.length == 0) {
             vendorNameString = "ALL"
         } else {
             for (i = 0; i < vendorName.length; i++) {
                 if (vendorNameString != "") {
                     vendorNameString += " , ";
                 }
                 vendorNameString = vendorNameString + vendorName[i];
             }
         }
         log.debug('vendor name', vendorNameString);

         var locationTo = JSON.parse(requestparam.locationId);
         var locationNameTo = JSON.parse(requestparam.locationName);
         var LocationNameString = ""
         if (locationNameTo.length == 0) {
             LocationNameString = "ALL"
         } else {
             for (j = 0; j < locationNameTo.length; j++) {
                 if (LocationNameString != "") {
                     LocationNameString += " , ";
                 }
                 LocationNameString = LocationNameString + locationNameTo[j];
             }
         }

         var locationId = JSON.parse(requestparam.locationTransOrd);
         // var locationNameTo = JSON.parse(requestparam.locationTo);
         // var LocationNameToString = ""
         // if (locationNameTo.length == 0) {
         //     LocationNameToString = "ALL"
         // } else {
         //     for (k = 0; k < locationNameTo.length; k++) {
         //         if (LocationNameToString != "") {
         //             LocationNameToString += " , ";
         //         }
         //         LocationNameToString = LocationNameToString + locationNameTo[k];
         //     }
         // }

         var itemId = JSON.parse(requestparam.itemId);
         var itemName = JSON.parse(requestparam.itemName);
         var itemNameCode = []
         var itemNameString = ''

         // if (selectedValues.length === options.length) {
         //     output = "ALL";
         //   } else if (selectedValues.length > 0) {
         //     output = selectedValues.join(", ");
         //   } else {
         //     output = "Tidak ada pilihan yang dipilih";
         //   }
         if (itemName.length == 0) {
             itemNameCode = "ALL"
             for (l = 0; l < itemName.length; l++) {
                 var text = itemName[l];
                 if (text.length > 0) {
                     var result = text.split('-');
                 }
                 itemNameCode.push(result[0])
             }
         }

         var start = JSON.parse(requestparam.start);
         var end = JSON.parse(requestparam.end);
         var checkbox = JSON.parse(requestparam.view)
         var product = JSON.parse(requestparam.productId)
         if (product.length === 0) {
             product = "ALL"
         }

         var transferOrderNumber = JSON.parse(requestparam.transferOrder);



         var chckTampilPurch = JSON.parse(requestparam.tampilPurchase)

         log.debug('Location', locationId)
         log.debug('Location to', locationTo)
         log.debug('Location name', locationNameTo)
         log.debug('vendor Id', vendorId)
         log.debug("item", itemId)
         log.debug('item name', itemName)
         log.debug('item name code', itemNameCode)
         log.debug('product name', product)
         log.debug('transfer order number', transferOrderNumber)

         // log.debug('item name string',itemNameString)
         // log.debug('produk name', productName)
         // log.debug(' check', checkbox)

         var parseDataArr = []


         var parseData = []
         var parseDataObj = {}
         var parseDataItem = {}
         var internalItemIdArr = [];


         var parseDataArray = []

         //FILTER TRANSFER ORDER

         var filter = [
             ["type", "anyof", "TrnfrOrd"],
             "AND",
             ["trandate", "within", start, end],
             // "AND",
             // ["tolocation.locationcostinggroup", "anyof", locationId],
             // "AND",
             // ["location.locationcostinggroup", "anyof", locationTo],
             // "AND",
             // ["item", "anyof", itemId],
             // "AND",
             // ["custcol_me_product","anyof",product]
         ];

         if (locationTo != "") {

             filter.push(
                 "AND",
                 ["tolocation.locationcostinggroup", "anyof", locationTo]);
         };
         if (locationId != "") {

             filter.push(
                 "AND",
                 ["location.locationcostinggroup", "anyof", locationId]);
         };
         if (itemId != "") {

             filter.push(
                 "AND",
                 ["item", "anyof", itemId]);
         };
         if (product != "") {

             filter.push(
                 "AND",
                 ["custcol_me_product", "anyof", product]);
         };
         if (transferOrderNumber != "") {

             filter.push(
                 "AND",
                 ["internalid", "anyof", transferOrderNumber]);
         };

         //FILTER PRICING & DISCOUNT
         var filterPricingDisc = [
             ["custrecord_me_po_price_disc_item", "anyof", itemId],
         ];

         if (checkbox === true) {
             if (itemId[0] != "") {

                 filter.push(
                     "AND",
                     ["item", "anyof", itemId])
             }
         }
         else {
             if (itemId[0] != "") {

                 filter.push(
                     "AND",
                     ["item", "anyof", itemId])
             }
         }

         var reportSearch = search.create({
             type: "transferorder",
             filters: filter,
             columns:
                 [
                     //1
                     search.createColumn({ name: "tranid", label: "Document Number" }),
                     //2
                     search.createColumn({ name: "item", label: "Item" }),
                     //3
                     search.createColumn({
                         name: "tranid",
                         join: "fulfillingTransaction",
                         label: "Document Number"
                     }),
                     //4
                     search.createColumn({ name: "trandate", label: "Date" }),
                     //5

                     search.createColumn({
                         name: "trandate",
                         join: "fulfillingTransaction",
                         label: "Date"
                     }),
                     //6
                     search.createColumn({ name: "location", label: "Location" }),
                     //7
                     search.createColumn({ name: "transferlocation", label: "To Location" }),
                     //8
                     search.createColumn({ name: "quantityshiprecv", label: "Quantity Fulfilled/Received" }),
                     //9
                     search.createColumn({ name: "custcol_me_qtycarton", label: "ME - Carton" }),
                     //10
                     search.createColumn({ name: "custcol_me_qtypcs", label: "ME - Pcs" }),
                     //11
                     search.createColumn({
                         name: "custcol_me_qtycarton",
                         join: "fulfillingTransaction",
                         label: "ME - Carton"
                     }),
                     //12
                     search.createColumn({
                         name: "custcol_me_qtypcs",
                         join: "fulfillingTransaction",
                         label: "ME - Pcs"
                     }),
                     //13
                     search.createColumn({
                         name: "custitem_me_cfield_item_product",
                         join: "item",
                         label: "ME - Product"
                     }),
                     //14
                     search.createColumn({
                         name: "internalid",

                         //summary: "GROUP",
                         label: "internal ID"
                     }),
                     //15
                     search.createColumn({ name: "quantity", label: "Quantity" }),
                     //16
                     search.createColumn({
                         name: "locationcostinggroup",
                         join: "location",
                         label: "Location Costing Group"
                     }),
                     //17
                     search.createColumn({
                         name: "locationcostinggroup",
                         join: "toLocation",
                         label: "Location Costing Group"
                     }),
                     //18
                     search.createColumn({ name: "custcol_me_fulfillcarton", label: "ME - Qty Carton Fulfill" }),
                     //19
                     search.createColumn({ name: "custcol_me_fulfillpcs", label: "ME - Qty Pcs Fulfill" })
                 ]
         });

         var customrecord_me_po_price_discSearchObj = search.create({
             type: "customrecord_me_po_price_disc",
             filters: filterPricingDisc,
             columns:
                 [
                     search.createColumn({
                         name: "scriptid",
                         sort: search.Sort.ASC,
                         label: "Script ID"
                     }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_area", label: "Area" }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_startdate", label: "Start Date" }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_enddate", label: "End Date" }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_price", label: "Pricelist" }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_disc1", label: "Discount 1 (%)" }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_disc2", label: "Discount 2 (%)" }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_disc3", label: "Discount 3 (Rp)" }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_disc4", label: "Discount 4 (%)" }),
                     search.createColumn({ name: "custrecord_me_po_price_disc_disc5", label: "Discount 5 (Rp)" })
                 ]
         });

         var startrow = 0;
         do {
             var toResult = reportSearch.run().getRange({
                 start: startrow,
                 end: startrow + 1000
             })

             // log.debug("suratResult", suratResult);
             // log.debug("Surat Result length" + suratResult.length);
             var formattedNumber = 0;

             var quantityRaw = 0;
             // var netPurchaseIrRaw = 0;
             var totalNet = 0;
             var sisaIR = 0;
             var totalCartonFullfillment = 0;
             var totalPcsFullfillment = 0;


             for (var i = 0; i < toResult.length; i++) {


                 var internalid = toResult[i].getValue(toResult[i].columns[13]);
                 var documentNumber = toResult[i].getValue(toResult[i].columns[0]);
                 var documentNumberFullfillment = toResult[i].getValue(toResult[i].columns[2]);
                 var tanggal = toResult[i].getValue(toResult[i].columns[3]);
                 var tanggalFullFillment = toResult[i].getValue(toResult[i].columns[4]);
                 // var lokasi = toResult[i].getValue(toResult[i].columns[15]);
                 // var lokasiTo = toResult[i].getValue(toResult[i].columns[16]);
                 var item = toResult[i].getText(toResult[i].columns[1]);
                 var itemId = toResult[i].getValue(toResult[i].columns[1]);

                 internalItemIdArr.push({
                     idTo: internalid,
                     item: itemId,
                 });

                 var carton = toResult[i].getValue(toResult[i].columns[17]);
                 var pcs = toResult[i].getValue(toResult[i].columns[18]);
                 var cartonFullfillemnt = toResult[i].getValue(toResult[i].columns[10]);
                 var pcsFullfillment = toResult[i].getValue(toResult[i].columns[11]);
                 var quantity = toResult[i].getValue(toResult[i].columns[14]);
                 var quantRecieved = toResult[i].getValue(toResult[i].columns[7]);
                 var getLocCostGroup = toResult[i].getValue(toResult[i].columns[6]);
                 var getToLocCostGroup = toResult[i].getValue(toResult[i].columns[5]);
                 //  log.debug('get cost group loc from', getLocCostGroup)
                 //  log.debug('get cost group loc To', getToLocCostGroup)
                 if (getLocCostGroup != "") {
                     var getLocCostGroupName = getLocationCostGroupName(getLocCostGroup);
                 }
                 var getToLocCostGroupName = getLocationCostGroupName(getToLocCostGroup);




                 // totalCartonFullfillment = totalCartonFullfillment + cartonFullfillemnt;
                 // totalPcsFullfillment = totalPcsFullfillment + pcsFullfillment;





                 // log.debug('carton REceipt', cartonIRBar)
                 // log.debug('rate after karton', rateAftrCTN)
                 // log.debug('PCS Receipt', pcsIrBar)
                 // log.debug('rate after PCS', rateAftrPCS)

                 // log.debug('jumlah sisa karton', JumlahSisaKarton)


                 if (!parseDataObj[internalid]) {
                     //TO

                     parseDataObj[internalid] = {
                         tanggal: tanggal,
                         lokasi: getLocCostGroupName,
                         lokasiTo: getToLocCostGroupName,
                         documentNumber: documentNumber,


                         //Item

                         data_item: [
                             {
                                 item: item,
                                 itemId: itemId,
                                 carton: parseInt(carton),
                                 pcs: pcs,
                                 quantity: quantity,
                                 price: 0,



                                 //Item Receipt                                   
                                 data_receipt: [
                                     {
                                         documentNumberFullfillment: documentNumberFullfillment,
                                         tanggalFullFillment: tanggalFullFillment,
                                         cartonFullfillemnt: cartonFullfillemnt,
                                         pcsFullfillment: pcsFullfillment,
                                         quantRecieved: quantRecieved

                                     }
                                 ]
                             }

                         ]

                     };


                 }
                 else {
                     //GROUP ITEM AND RECEIPT
                     var countDataItem = 0;
                     for (var u = 0; u < parseDataObj[internalid].data_item.length; u++) {
                         var currentDataItem = parseDataObj[internalid].data_item[u];

                         if (currentDataItem.item === item) {
                             for (var m = 0; m < parseDataObj[internalid].data_item[u].data_receipt.length; m++) {
                                 var currentDataIR = parseDataObj[internalid].data_item[u].data_receipt[m]

                                 if (currentDataIR.documentNumberFullfillment === documentNumberFullfillment) {
                                     currentDataIR.tanggalFullFillment = tanggalFullFillment;
                                     currentDataIR.cartonFullfillemnt = currentDataIR.cartonFullfillemnt + cartonFullfillemnt;
                                     currentDataIR.pcsFullfillment = currentDataIR.pcsFullfillment + pcsFullfillment;
                                     currentDataIR.quantRecieved = currentDataIR.quantRecieved + quantRecieved;



                                 } else {
                                     parseDataObj[internalid].data_item[u].data_receipt.push({
                                         documentNumberFullfillment: documentNumberFullfillment,
                                         tanggalFullFillment: tanggalFullFillment,
                                         cartonFullfillemnt: cartonFullfillemnt,
                                         pcsFullfillment: pcsFullfillment,
                                         quantRecieved: quantRecieved
                                     });
                                 }
                                 // log.debug('parse data after123', parseDataObj[internalid].data_item[u].data_receipt[m])
                                 countDataItem++
                                 break;
                             }
                         }

                     }

                     if (countDataItem == 0) {
                         parseDataObj[internalid].data_item.push({
                             item: item,
                             itemId: itemId,
                             carton: parseInt(carton),
                             pcs: pcs,
                             quantity: quantity,
                             price: 0,


                             data_receipt: [
                                 {
                                     documentNumberFullfillment: documentNumberFullfillment,
                                     tanggalFullFillment: tanggalFullFillment,
                                     cartonFullfillemnt: cartonFullfillemnt,
                                     pcsFullfillment: pcsFullfillment,
                                     quantRecieved: quantRecieved
                                 }
                             ]

                         });
                     }

                 }
             }
             // log.debug('parse data after321', parseDataObj[internalid]);
             startrow += 1000
         } while (toResult.length == 1000);
         var itemPrice = getItemPrice(internalItemIdArr, parseDataObj);
         log.debug('final', itemPrice);



         // do {

         //     var toPricingDiscResult = customrecord_me_po_price_discSearchObj.run().getRange({
         //         start: startrow,
         //         end: startrow + 1000
         //     })

         //     // log.debug("suratResult", suratResult);
         //     // log.debug("Surat Result length" + suratResult.length);
         //     var formattedNumber = 0;

         //     var quantityRaw = 0;
         //     // var netPurchaseIrRaw = 0;
         //     var totalNet = 0;
         //     var sisaIR = 0;


         //     for (var j = 0; j < toPricingDiscResult.length; j++) {

         //         var area = toPricingDiscResult[i].getValue(toPricingDiscResult[j].columns[0]);

         //         // var kodeItem = suratResult[i].getValue(suratResult[i].columns[10]);

         //         // var diskon1 = suratResult[i].getValue(suratResult[i].columns[16]) || '-';
         //         // var diskon2 = suratResult[i].getValue(suratResult[i].columns[17]) || '-';
         //         // var diskon3 = parseInt(suratResult[i].getValue(suratResult[i].columns[18])) || '-';
         //         // var diskon4 = suratResult[i].getValue(suratResult[i].columns[19]) || '-';
         //         // var diskon5 = parseInt(suratResult[i].getValue(suratResult[i].columns[20])) || '-';
         //         // var itemBonus = suratResult[i].getValue(suratResult[i].columns[24]);
         //         // var amount = suratResult[i].getValue(suratResult[i].columns[25]);
         //         // var price = suratResult[i].getValue(suratResult[i].columns[26]);
         //         // var diskon1Ir = suratResult[i].getValue(suratResult[i].columns[28]);
         //         // var diskon2Ir = suratResult[i].getValue(suratResult[i].columns[29]);
         //         // var diskon3Ir = suratResult[i].getValue(suratResult[i].columns[30]);
         //         // var diskon4Ir = suratResult[i].getValue(suratResult[i].columns[31]);
         //         // var diskon5Ir = suratResult[i].getValue(suratResult[i].columns[31]);
         //         // var bonusPcsIr = suratResult[i].getValue(suratResult[i].columns[32]) || 0;

         //         // var tglIrBar = suratResult[i].getValue(suratResult[i].columns[35]);
         //         // var docNumIr = suratResult[i].getValue(suratResult[i].columns[36]);
         //         // var internalid = suratResult[i].getValue(suratResult[i].columns[13]);
         //         // var nameVendor = suratResult[i].getValue(suratResult[i].columns[38]);
         //         // var amontBaru = parseFloat(suratResult[i].getValue(suratResult[i].columns[39]));
         //         // var taxBaru = suratResult[i].getValue(suratResult[i].columns[40]);
         //         // var bonusCarton = suratResult[i].getValue(suratResult[i].columns[41]) || 0;
         //         // var bonusPcs = suratResult[i].getValue(suratResult[i].columns[42]) || 0;

         //         // // var purchTotal = suratResult[i].getValue(suratResult[i].columns[22]);
         //         // var ItemBonusA = suratResult[i].getValue(suratResult[i].columns[22]);
         //         // var netTotalPo = parseInt(Math.abs(taxBaru) - amontBaru);
         //         // var karton_kurang = suratResult[i].getValue(suratResult[i].columns[49]) || 0;
         //         // var bonus = suratResult[i].getValue(suratResult[i].columns[50]);
         //         // var rateAftrPCS = suratResult[i].getValue(suratResult[i].columns[47]) || 0;
         //         // var rateAftrCTN = suratResult[i].getValue(suratResult[i].columns[48]) || 0;
         //         // var subTot = parseInt(suratResult[i].getValue(suratResult[i].columns[22])) || 0;


         //         if (!parseDataObj[internalid]) {
         //             //PO

         //             parseDataObj[internalid] = {
         //                 tanggal: tanggal,
         //                 lokasi: lokasi,
         //                 documentNumber: documentNumber,
         //                 nameVendor: nameVendor,
         //                 amontBaru: amontBaru,
         //                 taxBaru: taxBaru,
         //                 internalid: internalid,
         //                 // netPurch: parseInt(netPurch += netReCeipt),
         //                 netCount: netTotalPo,
         //                 net_kurang_po: quantityRaw,
         //                 meProd: meProd,


         //                 //Item

         //                 data_item: [
         //                     {
         //                         item: item,
         //                         rateCtn: rateCtn,
         //                         ratePcs: ratePcs,
         //                         diskon1: diskon1,
         //                         diskon2: diskon2,
         //                         diskon3: parseInt(diskon3),
         //                         diskon4: diskon4,
         //                         diskon5: parseInt(diskon5),
         //                         bonusCarton: bonusCarton,
         //                         bonusPcs: bonusPcs,
         //                         amount: amount,
         //                         price: price,
         //                         karton_kurang: karton_kurang,
         //                         subTot: parseInt(subTot),
         //                         JumlahSisaKarton: JumlahSisaKarton,
         //                         // sisaPcs: sisaPcs,
         //                         bonusItem: bonus,
         //                         bonusCartonItem: Number(bonusCartonItem),
         //                         bonusPcsItem: Number(bonusPcsItem),
         //                         itemBonus: itemBonus,


         //                         //Item Receipt                                   
         //                         data_receipt: [
         //                             {
         //                                 kodeItem: kodeItem,
         //                                 cartonIRBar: Number(cartonIRBar),
         //                                 pcsIrBar: Number(pcsIrBar),
         //                                 bonusCartonIR: Number(bonusCartonIR),
         //                                 bonusPCSIR: Number(bonusPCSIR),
         //                                 diskon1Ir: diskon1Ir,
         //                                 diskon2Ir: diskon2Ir,
         //                                 diskon3Ir: diskon3Ir,
         //                                 diskon4Ir: diskon4Ir,
         //                                 diskon5Ir: diskon5Ir,
         //                                 tglIrBar: tglIrBar,
         //                                 docNumIr: docNumIr,
         //                                 netAmntItm: parseInt(quantityRaw),
         //                                 bonus: bonus,
         //                                 rateAftrCTN: rateAftrCTN,
         //                                 rateAftrPCS: rateAftrPCS,
         //                                 netReCeipt: parseFloat(netReCeipt)

         //                             }
         //                         ]
         //                     }

         //                 ]

         //             }


         //         }
         //         else {
         //             //GROUP ITEM AND RECEIPT
         //             var countDataItem = 0;
         //             for (var u = 0; u < parseDataObj[internalid].data_item.length; u++) {
         //                 var currentDataItem = parseDataObj[internalid].data_item[u];

         //                 if (currentDataItem.item === item) {
         //                     for (var m = 0; m < parseDataObj[internalid].data_item[u].data_receipt.length; m++) {
         //                         var currentDataIR = parseDataObj[internalid].data_item[u].data_receipt[m]

         //                         if (currentDataIR.docNumIr === docNumIr) {
         //                             currentDataIR.cartonIRBar = Number(currentDataIR.cartonIRBar) + Number(cartonIRBar)
         //                             currentDataIR.pcsIrBar = Number(currentDataIR.pcsIrBar) + Number(pcsIrBar)
         //                             currentDataIR.bonusCartonIR = Number(currentDataIR.bonusCartonIR) + Number(bonusCartonIR)
         //                             currentDataIR.bonusPCSIR = Number(currentDataIR.bonusPCSIR) + Number(bonusPCSIR)
         //                             currentDataIR.diskon1Ir = currentDataIR.diskon1Ir + diskon1Ir
         //                             currentDataIR.diskon2Ir = currentDataIR.diskon2Ir + diskon2Ir
         //                             currentDataIR.diskon3Ir = currentDataIR.diskon3Ir + diskon3Ir
         //                             currentDataIR.diskon4Ir = currentDataIR.diskon4Ir + diskon4Ir
         //                             currentDataIR.diskon5Ir = currentDataIR.diskon5Ir + diskon5Ir
         //                             currentDataIR.tglIrBar = tglIrBar
         //                             currentDataIR.docNumIr = docNumIr
         //                             currentDataIR.netAmntItm = currentDataIR.quantityRaw + quantityRaw
         //                             currentDataIR.bonus = currentDataIR.bonus + bonus
         //                             currentDataIR.rateAftrCTN = currentDataIR.rateAftrCTN + rateAftrCTN
         //                             currentDataIR.rateAftrPCS = currentDataIR.rateAftrPCS + rateAftrPCS
         //                             currentDataIR.netReCeipt = parseFloat(currentDataIR.netReCeipt) + parseFloat(netReCeipt)
         //                         } else {
         //                             parseDataObj[internalid].data_item[u].data_receipt.push({
         //                                 kodeItem: kodeItem,
         //                                 cartonIRBar: Number(cartonIRBar),
         //                                 pcsIrBar: Number(pcsIrBar),
         //                                 bonusCartonIR: Number(bonusCartonIR),
         //                                 bonusPCSIR: Number(bonusPCSIR),
         //                                 diskon1Ir: diskon1Ir,
         //                                 diskon2Ir: diskon2Ir,
         //                                 diskon3Ir: diskon3Ir,
         //                                 diskon4Ir: diskon4Ir,
         //                                 diskon5Ir: diskon5Ir,
         //                                 tglIrBar: tglIrBar,
         //                                 docNumIr: docNumIr,
         //                                 netAmntItm: parseInt(quantityRaw),
         //                                 bonus: bonus,
         //                                 rateAftrCTN: rateAftrCTN,
         //                                 rateAftrPCS: rateAftrPCS,
         //                                 netReCeipt: parseFloat(netReCeipt)

         //                             });
         //                         }
         //                         // log.debug('parse data after', parseDataObj[internalid].data_item[u].data_receipt[m])
         //                         countDataItem++
         //                         break;
         //                     }
         //                 }

         //             }

         //             if (countDataItem == 0) {
         //                 parseDataObj[internalid].data_item.push({
         //                     item: item,
         //                     rateCtn: rateCtn,
         //                     ratePcs: ratePcs,
         //                     diskon1: diskon1,
         //                     diskon2: diskon2,
         //                     diskon3: parseInt(diskon3),
         //                     diskon4: diskon4,
         //                     diskon5: parseInt(diskon5),
         //                     itemBonus: itemBonus,
         //                     amount: amount,
         //                     price: price,
         //                     subTot: parseInt(subTot),
         //                     karton_kurang: karton_kurang,
         //                     bonusCarton: bonusCarton,
         //                     bonusPcs: bonusPcs,
         //                     JumlahSisaKarton: JumlahSisaKarton,
         //                     // sisaPcs: sisaPcs,
         //                     bonusItem: bonus,
         //                     bonusCartonItem: Number(bonusCartonItem),
         //                     bonusPcsItem: Number(bonusPcsItem),


         //                     data_receipt: [
         //                         {
         //                             kodeItem: kodeItem,
         //                             cartonIRBar: Number(cartonIRBar),
         //                             pcsIrBar: Number(pcsIrBar),
         //                             bonusCartonIR: Number(bonusCartonIR),
         //                             bonusPCSIR: Number(bonusPCSIR),
         //                             diskon1Ir: diskon1Ir,
         //                             diskon2Ir: diskon2Ir,
         //                             diskon3Ir: diskon3Ir,
         //                             diskon4Ir: diskon4Ir,
         //                             diskon5Ir: diskon5Ir,
         //                             tglIrBar: tglIrBar,
         //                             docNumIr: docNumIr,
         //                             netAmntItm: parseInt(quantityRaw),
         //                             bonus: bonus,
         //                             rateAftrCTN: rateAftrCTN,
         //                             rateAftrPCS: rateAftrPCS,
         //                             netReCeipt: parseFloat(netReCeipt),
         //                         }
         //                     ]

         //                 });
         //             }

         //         }
         //     }
         //     startrow += 1000
         // } while (toPricingDiscResult.length == 1000);
         // log.debug('parse data after', parseDataObj[internalid]);
         log.debug('parse data after', parseDataObj);
         log.debug('object with itemId', internalItemIdArr);

     }

     return {
         onRequest: createPdfTransferOrder
     }
 });

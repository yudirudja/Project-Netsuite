/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@author Yulianus Wayan Y.R.
 */
define(['N/search', 'N/render', 'N/file', 'N/record', 'N/encode', 'N/format', 'N/task', 'N/redirect', 'N/ui/serverWidget'],
    function (search, render, file, record, encode, format, task, redirect, serverWidget) {

        function getItemPriceTest(itemData, arrData) {
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
                var indexItemData = itemData.findIndex(function (val) {
                    return val.item == itemPriceSearch[i].getValue("custrecord_me_po_price_disc_item");
                });
                // log.debug('item data 123', indexItemData);

                itemData[indexItemData].price = itemPriceSearch[i].getValue("custrecord_me_po_price_disc_price");
            }

            for (var i = 0; i < arrData.length; i++) {
                var indexItemData = itemData.findIndex(function (val) {
                    return val.item == arrData[i].data_item.itemId;
                });
                log.debug('test index item Data', itemData[indexItemData].price);
                arrData[i].data_item.price = itemData[indexItemData].price;
            }

            // for (const key in dataSet) {
            //     var dataItem = dataSet[key].data_item;
            //     dataItem.map(function (val) {
            //         var indexItemData = itemData.findIndex(function (val2) {
            //             return val2.item == val.itemId;
            //         });
            //         // log.debug('item data 123', indexItemData);
            //         log.debug('price item', itemData[indexItemData].price);

            //         val.price = itemData[indexItemData].price;
            //     });
            //     log.debug('data item 321', dataItem);
            // }
            return arrData;
        }

        // function calculateAmountMod(itemData, dataSet, paramCalculate) {
        //     var getDataSet = getItemPrice(itemData, dataSet);
        //     for (const key in getDataSet) {
        //         var getDataItem = getDataSet[key].data_item;
        //         for (let o = 0; o < getDataItem.length; o++) {
        //             var getQuantityConversion = paramCalculate.get_quantity_conversion;
        //             var getPriceData = getDataItem[o].price;
        //             var getCartonQty = getDataItem[o].carton;
        //             var getQuantityOrder = paramCalculate.quantity;
        //             var getPriceEachpcsOrder = getPriceData / getQuantityConversion;
        //             // var calculateAmtOrd = getPriceData * getCartonQty;
        //             var calculateAmtOrd = getPriceEachpcsOrder * Math.abs(getQuantityOrder);
        //             log.debug('get Calculate', calculateAmtOrd);
        //             log.debug('get each pcs price', getPriceEachpcsOrder);
        //             getDataItem[o].amount_order = calculateAmtOrd;
        //             // getDataItem.map(function (val) {
        //             //     val.amount_order = calculateAmtOrd;
        //             // });
        //             getDataReciept = getDataSet[key].data_item[o].data_receipt;
        //             for (let i = 0; i < getDataReciept.length; i++) {
        //                 var getPriceData = getDataItem[o].price;

        //                 var getPcsQtyFullfillment = getDataReciept[i].pcsFullfillment;
        //                 var getCartonQtyFullfillment = getDataReciept[i].cartonFullfillemnt;
        //                 var convertgetCartonQtytoPcsFullfillment = getCartonQtyFullfillment * parseInt(getQuantityConversion);
        //                 var addCtnPcs = convertgetCartonQtytoPcsFullfillment + parseInt(getPcsQtyFullfillment);
        //                 var calculateAmountEachRecieved = addCtnPcs * getPriceEachpcsOrder;


        //                 var getQuantityRecieved = paramCalculate.quantity_recieved;
        //                 var convertQuantitytoCarton = getQuantityRecieved / getQuantityConversion;
        //                 var convertQuantitytoPcs = getQuantityRecieved % getQuantityConversion;
        //                 var getPriceEachpcs = getPriceData / getQuantityConversion;
        //                 var calculateAmtFullfillment = getPriceEachpcs * getQuantityRecieved;
        //                 log.debug('price each pcs', getPriceEachpcs);
        //                 log.debug('get quantity Received', getQuantityRecieved);
        //                 log.debug('calcuate amt fulfillment', calculateAmtFullfillment);
        //                 log.debug('get Carton Fulfillment', paramCalculate.carton_fulfillment);
        //                 log.debug('get Carton quantity total', convertQuantitytoCarton);

        //                 var sisaItemNotRecieved = Math.abs(getQuantityOrder) - parseInt(getQuantityRecieved);
        //                 var sisaCtn = sisaItemNotRecieved / getQuantityConversion;
        //                 var sisaPcs = sisaItemNotRecieved % getQuantityConversion;
        //                 var sisaAmountItemNotRecieved = sisaItemNotRecieved * getPriceEachpcsOrder;

        //                 log.debug('get Calculate fullfilment', calculateAmountEachRecieved);
        //                 getDataItem[o].amount_recieved = calculateAmountEachRecieved;
        //                 getDataItem[o].cartonFullfillemntTotal = convertQuantitytoCarton;
        //                 getDataItem[o].pcsFullfillmentTotal = convertQuantitytoPcs;
        //                 getDataItem[o].quantRecieved = getQuantityRecieved;
        //                 getDataItem[o].sisa_carton = sisaCtn;
        //                 getDataItem[o].sisa_pcs = sisaPcs;
        //                 getDataItem[o].sisa_amount = sisaAmountItemNotRecieved;
        //                 getDataReciept[i].amountRecievedEachReciept = calculateAmountEachRecieved;
        //                 getDataReciept[i].amount_recieved = calculateAmtFullfillment;
        //                 // getDataReciept[i].cartonFullfillemntTotal = convertQuantitytoCarton;
        //                 // getDataReciept[i].pcsFullfillmentTotal = convertQuantitytoPcs;
        //             }


        //         }

        //     }
        //     return getDataSet;
        // }

        function calculateAmountModTest(itemData, arrData, paramCalculate) {
            var getDataArr = getItemPriceTest(itemData, arrData);

            var prevTransferOrderDocNumber = "";
            var prevCalculateAmtOrd = 0;
            var prevCalculateAmtReceiptInt = 0;
            var prevSisaAmountItemNotRecievedTotalInt = 0;
            var prevCalculateAmtReceiptTotalInt = 0;

            for (var j = 0; j < getDataArr.length; j++) {
                var transferOrderDocnum = arrData[j].transfer_order.documentNumber;


                var getPriceData = arrData[j].data_item.price;
                var getQuantityOrder = arrData[j].data_item.quantity;
                var getQuantityConversion = arrData[j].data_item.quantity_conversion;
                var getPriceEachpcs = getPriceData / getQuantityConversion;
                var calculateAmtOrd = getPriceEachpcs * Math.abs(getQuantityOrder);

                var getPcsQtyReceipt = arrData[j].data_receipt.pcsFullfillment;
                var getCartonQtyReceipt = parseInt(arrData[j].data_receipt.cartonFullfillemnt);
                var convertgetCartonQtytoPcsReceipt = getCartonQtyReceipt * parseInt(getQuantityConversion);
                var addCtnPcs = convertgetCartonQtytoPcsReceipt + parseInt(getPcsQtyReceipt);
                var calculateAmountEachReceipt = addCtnPcs * getPriceEachpcs;

                var getQuantityReceipt = arrData[j].data_item.quantRecieved;
                var convertQuantitytoCarton = getQuantityReceipt / getQuantityConversion;
                var convertQuantitytoPcs = getQuantityReceipt % getQuantityConversion;
                var calculateAmtReceipt = getPriceEachpcs * getQuantityReceipt;

                var sisaItemNotRecieved = Math.abs(getQuantityOrder) - parseInt(getQuantityReceipt);
                var sisaCtn = sisaItemNotRecieved / getQuantityConversion;
                var sisaPcs = sisaItemNotRecieved % getQuantityConversion;
                var sisaAmountItemNotRecieved = sisaItemNotRecieved * getPriceEachpcs;

                var calculateAmtOrdInt = parseInt(calculateAmtOrd);
                var calculateAmtOrdTotalInt = parseInt(calculateAmtOrd);
                var calculateAmtReceiptInt = parseInt(calculateAmtReceipt);
                var calculateAmtReceiptTotalInt = parseInt(calculateAmtReceipt);
                var convertQuantitytoCartonInt = parseInt(convertQuantitytoCarton);
                var sisaCtnInt = parseInt(sisaCtn);
                var sisaAmountItemNotRecievedInt = parseInt(sisaAmountItemNotRecieved);
                var sisaAmountItemNotRecievedTotalInt = parseInt(sisaAmountItemNotRecieved);
                var calculateAmountEachReceiptInt = parseInt(calculateAmountEachReceipt);

                // var calculateAmtOrdCurrency = calculateAmtOrdInt.toLocaleString('en-US',
                //     {
                //         style: 'currency',
                //         currency: 'USD',
                //         currencyDisplay: 'hidden'
                //     });
                // var calculateAmtReceiptCurrency = calculateAmtReceiptInt.toLocaleString('en-US',
                //     {
                //         style: 'currency',
                //         currency: 'USD',
                //         currencyDisplay: 'hidden'
                //     });
                // var sisaAmountItemNotRecievedCurrency = sisaAmountItemNotRecievedInt.toLocaleString('en-US',
                //     {
                //         style: 'currency',
                //         currency: 'USD',
                //         currencyDisplay: 'hidden'
                //     });

                // var calculateAmountEachReceiptCurrency = calculateAmountEachReceiptInt.toLocaleString('en-US',
                //     {
                //         style: 'currency',
                //         currency: 'USD',
                //         currencyDisplay: 'hidden'
                //     });// var calculateAmtOrdCurrency = calculateAmtOrdInt.toLocaleString('en-US',
                //     {
                //         style: 'currency',
                //         currency: 'USD',
                //         currencyDisplay: 'hidden'
                //     });
                // var calculateAmtReceiptCurrency = calculateAmtReceiptInt.toLocaleString('en-US',
                //     {
                //         style: 'currency',
                //         currency: 'USD',
                //         currencyDisplay: 'hidden'
                //     });
                // var sisaAmountItemNotRecievedCurrency = sisaAmountItemNotRecievedInt.toLocaleString('en-US',
                //     {
                //         style: 'currency',
                //         currency: 'USD',
                //         currencyDisplay: 'hidden'
                //     });

                // var calculateAmountEachReceiptCurrency = calculateAmountEachReceiptInt.toLocaleString('en-US',
                //     {
                //         style: 'currency',
                //         currency: 'USD',
                //         currencyDisplay: 'hidden'
                //     });

                if (transferOrderDocnum == prevTransferOrderDocNumber) {
                    arrData[j].data_item.amount_order = calculateAmtOrdInt;
                    arrData[j].transfer_order.amount_order_total = calculateAmtOrdTotalInt + prevCalculateAmtOrd;
                    arrData[j].data_item.amount_recieved = calculateAmtReceiptInt;
                    // arrData[j].transfer_order.amount_recieved_total = parseInt(calculateAmtReceiptTotalInt) + prevCalculateAmtReceiptTotalInt;
                    arrData[j].data_item.cartonFullfillemntTotal = parseInt(convertQuantitytoCartonInt);
                    arrData[j].data_item.pcsFullfillmentTotal = convertQuantitytoPcs;
                    arrData[j].data_item.sisa_carton = parseInt(sisaCtnInt);
                    arrData[j].data_item.sisa_pcs = sisaPcs;
                    arrData[j].data_item.sisa_amount = sisaAmountItemNotRecievedInt;
                    arrData[j].transfer_order.amount_sisa_total = sisaAmountItemNotRecievedTotalInt + prevSisaAmountItemNotRecievedTotalInt;
                    arrData[j].data_item.amount_order = calculateAmtOrdInt;
                    // arrData[j].data_item.amount_order = parseInt(calculateAmtOrdInt);
                    arrData[j].data_receipt.amountRecievedEachReciept = calculateAmountEachReceiptInt;
                } else {
                    arrData[j].data_item.amount_order = calculateAmtOrdInt;
                    arrData[j].transfer_order.amount_order_total = calculateAmtOrdTotalInt;
                    arrData[j].data_item.amount_recieved = calculateAmtReceiptInt;
                    // arrData[j].transfer_order.amount_recieved_total = parseInt(calculateAmtReceiptTotalInt);
                    arrData[j].data_item.cartonFullfillemntTotal = parseInt(convertQuantitytoCartonInt);
                    arrData[j].data_item.pcsFullfillmentTotal = convertQuantitytoPcs;
                    arrData[j].data_item.sisa_carton = parseInt(sisaCtnInt);
                    arrData[j].data_item.sisa_pcs = sisaPcs;
                    arrData[j].data_item.sisa_amount = sisaAmountItemNotRecievedInt;
                    arrData[j].transfer_order.amount_sisa_total = sisaAmountItemNotRecievedTotalInt;
                    arrData[j].data_item.amount_order = calculateAmtOrdInt;
                    // arrData[j].data_item.amount_order = parseInt(calculateAmtOrdInt);
                    arrData[j].data_receipt.amountRecievedEachReciept = calculateAmountEachReceiptInt;

                    prevSisaAmountItemNotRecievedTotalInt = 0;
                    prevCalculateAmtOrd = 0;
                    prevCalculateAmtReceiptTotalInt = 0;
                }

                // arrData[j].data_item.amount_order = calculateAmtOrdInt;
                // arrData[j].transfer_order.amount_order_total = calculateAmtOrdInt;
                // arrData[j].data_item.amount_recieved = calculateAmtReceiptInt + prevCalculateAmtReceiptInt;
                // // arrData[j].transfer_order.amount_recieved_total = parseInt(calculateAmtReceiptInt);
                // arrData[j].data_item.cartonFullfillemntTotal = parseInt(convertQuantitytoCartonInt);
                // arrData[j].data_item.pcsFullfillmentTotal = convertQuantitytoPcs;
                // arrData[j].data_item.sisa_carton = parseInt(sisaCtnInt);
                // arrData[j].data_item.sisa_pcs = sisaPcs;
                // arrData[j].data_item.sisa_amount = sisaAmountItemNotRecievedInt;
                // arrData[j].transfer_order.amount_sisa_total = sisaAmountItemNotRecievedInt;
                // arrData[j].data_item.amount_order = calculateAmtOrdInt;
                // // arrData[j].data_item.amount_order = parseInt(calculateAmtOrdInt);
                // arrData[j].data_receipt.amountRecievedEachReciept = calculateAmountEachReceiptInt;

                prevTransferOrderDocNumber = transferOrderDocnum;

                log.debug('getQuantityConversion', getQuantityConversion);
                log.debug('check data carton fulfillment', arrData[j].data_item.cartonFullfillemntTotal);
            }

            // for (const key in getDataSet) {
            //     var getDataItem = getDataSet[key].data_item;
            //     for (let o = 0; o < getDataItem.length; o++) {
            //         var getQuantityConversion = paramCalculate.get_quantity_conversion;
            //         var getPriceData = getDataItem[o].price;
            //         var getCartonQty = getDataItem[o].carton;
            //         var getQuantityOrder = paramCalculate.quantity;
            //         var getPriceEachpcsOrder = getPriceData / getQuantityConversion;
            //         // var calculateAmtOrd = getPriceData * getCartonQty;
            //         var calculateAmtOrd = getPriceEachpcsOrder * Math.abs(getQuantityOrder);
            //         log.debug('get Calculate', calculateAmtOrd);
            //         log.debug('get each pcs price', getPriceEachpcsOrder);
            //         getDataItem[o].amount_order = calculateAmtOrd;
            //         // getDataItem.map(function (val) {
            //         //     val.amount_order = calculateAmtOrd;
            //         // });
            //         getDataReciept = getDataSet[key].data_item[o].data_receipt;
            //         for (let i = 0; i < getDataReciept.length; i++) {
            //             var getPriceData = getDataItem[o].price;

            //             var getPcsQtyFullfillment = getDataReciept[i].pcsFullfillment;
            //             var getCartonQtyFullfillment = getDataReciept[i].cartonFullfillemnt;
            //             var convertgetCartonQtytoPcsFullfillment = getCartonQtyFullfillment * parseInt(getQuantityConversion);
            //             var addCtnPcs = convertgetCartonQtytoPcsFullfillment + parseInt(getPcsQtyFullfillment);
            //             var calculateAmountEachRecieved = addCtnPcs * getPriceEachpcsOrder;


            //             var getQuantityRecieved = paramCalculate.quantity_recieved;
            //             var convertQuantitytoCarton = getQuantityRecieved / getQuantityConversion;
            //             var convertQuantitytoPcs = getQuantityRecieved % getQuantityConversion;
            //             var getPriceEachpcs = getPriceData / getQuantityConversion;
            //             var calculateAmtFullfillment = getPriceEachpcs * getQuantityRecieved;
            //             log.debug('price each pcs', getPriceEachpcs);
            //             log.debug('get quantity Received', getQuantityRecieved);
            //             log.debug('calcuate amt fulfillment', calculateAmtFullfillment);
            //             log.debug('get Carton Fulfillment', paramCalculate.carton_fulfillment);
            //             log.debug('get Carton quantity total', convertQuantitytoCarton);

            //             var sisaItemNotRecieved = Math.abs(getQuantityOrder) - parseInt(getQuantityRecieved);
            //             var sisaCtn = sisaItemNotRecieved / getQuantityConversion;
            //             var sisaPcs = sisaItemNotRecieved % getQuantityConversion;
            //             var sisaAmountItemNotRecieved = sisaItemNotRecieved * getPriceEachpcsOrder;

            //             log.debug('get Calculate fullfilment', calculateAmountEachRecieved);
            //             getDataItem[o].amount_recieved = calculateAmountEachRecieved;
            //             getDataItem[o].cartonFullfillemntTotal = convertQuantitytoCarton;
            //             getDataItem[o].pcsFullfillmentTotal = convertQuantitytoPcs;
            //             getDataItem[o].quantRecieved = getQuantityRecieved;
            //             getDataItem[o].sisa_carton = sisaCtn;
            //             getDataItem[o].sisa_pcs = sisaPcs;
            //             getDataItem[o].sisa_amount = sisaAmountItemNotRecieved;
            //             getDataReciept[i].amountRecievedEachReciept = calculateAmountEachRecieved;
            //             getDataReciept[i].amount_recieved = calculateAmtFullfillment;
            //             // getDataReciept[i].cartonFullfillemntTotal = convertQuantitytoCarton;
            //             // getDataReciept[i].pcsFullfillmentTotal = convertQuantitytoPcs;
            //         }


            //     }

            // }
            return getDataArr;
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
            var locationToText = JSON.parse(requestparam.locationName);
            var LocationToNameString = ""
            if (locationToText.length == 0) {
                LocationToNameString = "ALL"
            } else if (locationToText.length <= 5) {
                for (j = 0; j < locationToText.length; j++) {
                    if (LocationToNameString != "") {
                        LocationToNameString += " , ";
                    }
                    LocationToNameString = LocationToNameString + locationToText[j];
                }
            } else {
                LocationToNameString = locationToText[0].split("-")[0] + " - " + locationToText[locationToText.length - 1].split("-")[0];
            }

            var locationId = JSON.parse(requestparam.locationTransOrd);
            var locationIdText = JSON.parse(requestparam.locationTransOrdText);
            var LocationFromNameString = ""
            if (locationIdText.length == 0) {
                LocationFromNameString = "ALL"
            } else if (locationIdText.length <= 5) {
                for (j = 0; j < locationIdText.length; j++) {
                    if (LocationFromNameString != "") {
                        LocationFromNameString += " , ";
                    }
                    LocationFromNameString = LocationFromNameString + locationIdText[j];
                }
            } else {
                LocationFromNameString = locationIdText[0].split("-")[0] + " - " + locationIdText[locationIdText.length - 1].split("-")[0]
            }

            var itemId = JSON.parse(requestparam.itemId);
            var itemName = JSON.parse(requestparam.itemName);
            var itemNameCode = [];
            var itemNameString = "";

            if (itemName.length == 0) {
                itemNameString = "ALL"
            } else if (itemName.length <= 5) {
                for (j = 0; j < itemName.length; j++) {
                    if (itemNameString != "") {
                        itemNameString += ", ";
                    }
                    itemNameString = itemNameString + itemName[j].split("-")[0];
                }
            } else {
                itemNameString = itemName[0].split("-")[0] + " - " + itemName[itemName.length - 1].split("-")[0];
            }

            var start = JSON.parse(requestparam.start);
            var end = JSON.parse(requestparam.end);

            var checkboxInv = JSON.parse(requestparam.view);
            var checkboxPurch = JSON.parse(requestparam.tampilPurchase);
            if (checkboxInv === true) {
                checkboxInv = "T";
            } else {
                checkboxInv = "F";
            };

            if (checkboxPurch === true) {
                checkboxPurch = "T";
            } else {
                checkboxPurch = "F"
            };


            var product = JSON.parse(requestparam.productId);
            var productText = JSON.parse(requestparam.productName);
            var productTextString = "";
            if (productText.length == 0) {
                productTextString = "ALL";
            } else if (productText.length <= 5) {
                for (j = 0; j < productText.length; j++) {
                    if (productTextString != "") {
                        productTextString += " , ";
                    }
                    productTextString = productTextString + productText[j];
                }
            } else {
                productTextString = productText[0].split("-")[0] + " - " + productText[productText.length - 1].split("-")[0];
            }

            var transferOrderNumber = JSON.parse(requestparam.transferOrder);
            var transferOrderTextArr = [];
            if (transferOrderNumber != "") {
                var getHeaderValue = search.create({
                    type: "transferorder",
                    filters: ["internalid", "anyof", transferOrderNumber],
                    columns:
                        [
                            search.createColumn({ name: "tranid", label: "Document Number" }),

                        ]
                });
                var toResultHeaderValue = getHeaderValue.run().getRange({
                    start: 0,
                    end: 100
                });
                for (var i = 0; i < toResultHeaderValue.length; i++) {
                    var toNumberText = toResultHeaderValue[i].getValue(toResultHeaderValue[i].columns[0])
                    transferOrderTextArr.push(toNumberText);
                }
                // var documentNumber = toResultHeaderValue[0].getValue(toResultHeaderValue[0].columns[0]);
                // headerData.document_number = documentNumber;

            }
            var transferOrderNumberString = ""
            if (transferOrderTextArr.length == 0) {
                transferOrderNumberString = "ALL";
            } else if (transferOrderTextArr.length <= 5) {
                for (j = 0; j < transferOrderTextArr.length; j++) {
                    if (transferOrderNumberString != "") {
                        transferOrderNumberString += " , ";
                    }
                    transferOrderNumberString = transferOrderNumberString + transferOrderTextArr[j];
                }
            } else {
                transferOrderNumberString = transferOrderTextArr[0] + " - " + transferOrderTextArr[transferOrderTextArr.length - 1];
            }


            var chckTampilPurch = JSON.parse(requestparam.tampilPurchase)

            log.debug('Location', locationId)
            log.debug('Location to', locationTo)
            log.debug('Location name', locationToText)
            log.debug('vendor Id', vendorId)
            log.debug("item", itemId)
            log.debug('item name', itemName)
            log.debug('item name code', itemNameCode)
            log.debug('product name', product)
            log.debug('transfer order number', transferOrderNumber)

            var parseDataArr = []


            var transfer_order_data = [];
            var parseData = []
            var parseDataObject = {};
            var parseDataObj = {}
            var prevParseDataObj = {}
            var headerDataDocNumber = [];
            var headerData = {
                document_number: transferOrderNumberString,
                location_from: LocationToNameString,
                location_to: LocationFromNameString,
                start_date: start,
                end_date: end,
                item: itemNameString,
                product: productTextString,
                checkboxInv: checkboxInv,
                checkboxPurch: checkboxPurch,
            }
            var parseDataItem = {}
            var internalItemIdArr = [];

            // if (transferOrderNumber != "") {
            //     var getHeaderValue = search.create({
            //         type: "transferorder",
            //         filters: ["internalid", "anyof", transferOrderNumber],
            //         columns:
            //             [
            //                 search.createColumn({ name: "tranid", label: "Document Number" }),

            //             ]
            //     });
            //     var toResultHeaderValue = getHeaderValue.run().getRange({
            //         start: 0,
            //         end: 100
            //     });
            //     for (var i = 0; i < toResultHeaderValue.length; i++) {
            //         var toNumberText = toResultHeaderValue[i].getValue(toResultHeaderValue[0].columns[0])
            //         transferOrderTextArr.push(toNumberText);
            //     }
            //     // var documentNumber = toResultHeaderValue[0].getValue(toResultHeaderValue[0].columns[0]);
            //     // headerData.document_number = documentNumber;

            // }
            var headerJson = JSON.stringify(headerData);
            log.debug('cek value header', JSON.stringify(headerData));
            log.debug('cek value header', JSON.parse(headerJson));
            log.debug('cek value header', headerData);
            log.debug('location to', locationTo);
            log.debug('location from', locationId);

            var parseDataArray = []

            var isKomplitInv = "";
            var isKomplitPurch = "";

            //FILTER TRANSFER ORDER

            var filter = [
                ["type", "anyof", "TrnfrOrd"],
                "AND",
                ["trandate", "within", start, end],
                "AND",
                ["applyingtransaction.type", "anyof", "ItemShip", "ItemRcpt"]
            ];

            if (locationId != "") {

                filter.push(
                    "AND",
                    ["tolocation.locationcostinggroup", "anyof", locationId]);
            };
            if (locationTo != "") {

                filter.push(
                    "AND",
                    ["location.locationcostinggroup", "anyof", locationTo]);
            };
            if (itemId != "") {

                filter.push(
                    "AND",
                    ["item", "anyof", itemId]);
            };
            if (product != "") {

                filter.push(
                    "AND",
                    ["item.custitem_me_cfield_item_product", "anyof", product]);
            };
            if (transferOrderNumber != "") {

                filter.push(
                    "AND",
                    ["internalid", "anyof", transferOrderNumber]);
            };


            var searchTransferOrd = search.create({
                type: "transaction",
                filters: filter,
                columns:
                    [
                        //0
                        search.createColumn({ name: "tranid", label: "Document Number" }),
                        //1
                        search.createColumn({ name: "item", label: "Item" }),
                        //2
                        search.createColumn({
                            name: "tranid",
                            join: "fulfillingTransaction",
                            label: "Document Number"
                        }),
                        //3
                        search.createColumn({
                            name: "trandate",
                            sort: search.Sort.ASC,
                            label: "Date"
                        }),
                        //4
                        search.createColumn({
                            name: "trandate",
                            join: "fulfillingTransaction",
                            label: "Date"
                        }),
                        //5
                        search.createColumn({ name: "location", label: "Location" }),
                        //6
                        search.createColumn({ name: "transferlocation", label: "To Location" }),
                        //7
                        search.createColumn({ name: "quantityshiprecv", label: "Quantity Fulfilled/Received" }),
                        //8
                        search.createColumn({ name: "custcol_me_qtycarton", label: "ME - Carton" }),
                        //9
                        search.createColumn({ name: "custcol_me_qtypcs", label: "ME - Pcs" }),
                        //10
                        search.createColumn({
                            name: "custcol_me_qtycarton",
                            join: "fulfillingTransaction",
                            label: "ME - Carton"
                        }),
                        //11
                        search.createColumn({
                            name: "custcol_me_qtypcs",
                            join: "fulfillingTransaction",
                            label: "ME - Pcs"
                        }),
                        //12
                        search.createColumn({
                            name: "custitem_me_cfield_item_product",
                            join: "item",
                            label: "ME - Product"
                        }),
                        //13
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        //14
                        search.createColumn({ name: "quantity", label: "Quantity" }),
                        //15
                        search.createColumn({ name: "custcol_me_qty_conversion_transcation", label: "ME - Qty Conversion" }),
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
                        search.createColumn({ name: "custcol_me_fulfillpcs", label: "ME - Qty Pcs Fulfill" }),
                        //20
                        search.createColumn({
                            name: "type",
                            join: "fulfillingTransaction",
                            label: "Type"
                        }),
                        //21
                        search.createColumn({
                            name: "tranid",
                            join: "applyingTransaction",
                            label: "Document Number"
                        }),
                        //22
                        search.createColumn({
                            name: "type",
                            join: "applyingTransaction",
                            label: "Type"
                        }),
                        //23
                        search.createColumn({ name: "tranid", label: "Document Number" })
                    ]
            }).run().getRange({
                start: 0,
                end: 1000
            });

            var transfer_order_coll_obj = {}
            var item_collection_obj = {}
            var inv_obj = {}
            var inv_obj_arr = []
            var arr_cust_deposit = []
            var arr_cust_code = []
            var collection_obj = {}
            var cm_return_obj = {}
            var je_extint_obj = {}
            var je_obj = {}
            var cm_other_obj = {}

            for (var p = 0; p < array.length; p++) {
                var internalId = toResult[i].getValue(toResult[i].columns[0]);
                var item = toResult[i].getValue(toResult[i].columns[1]);
                var itemText = toResult[i].getText(toResult[i].columns[1]);

                internalItemIdArr.push({
                    idTo: internalid,
                    item: itemId,
                });
                
            }

            
            for (var x = 0; x < searchTransferOrd.length; x++) {
                var internalId = toResult[i].getValue(toResult[i].columns[0]);
                var item = toResult[i].getValue(toResult[i].columns[1]);
                var itemText = toResult[i].getText(toResult[i].columns[1]);
                var itemFulfillReceipt = toResult[i].getValue(toResult[i].columns[2]);
                var itemFulfillReceiptText = toResult[i].getText(toResult[i].columns[2]);
                var dateFrom = toResult[i].getValue(toResult[i].columns[3]);
                var dateTo = toResult[i].getValue(toResult[i].columns[4]);
                var locationFromSearch = toResult[i].getValue(toResult[i].columns[16]);
                var locationToSearch = toResult[i].getValue(toResult[i].columns[17]);
                var qtyFulfillReceipt = toResult[i].getValue(toResult[i].columns[7]);
                var carton = toResult[i].getValue(toResult[i].columns[8]);
                var pcs = toResult[i].getValue(toResult[i].columns[9]);
                var cartonFulfillReceipt = toResult[i].getValue(toResult[i].columns[10]);
                var pcsFulfillReceipt = toResult[i].getValue(toResult[i].columns[11]);
                var productGroup = toResult[i].getValue(toResult[i].columns[12]);
                var productGroup = toResult[i].getText(toResult[i].columns[20]) == "item Fulfillment"? toResult[i].getValue(toResult[i].columns[12]) * -1 : toResult[i].getValue(toResult[i].columns[12]);
                var qty = toResult[i].getValue(toResult[i].columns[14]);
                var qtyConversion = toResult[i].getValue(toResult[i].columns[15]);
                var cartonFulFill = toResult[i].getValue(toResult[i].columns[18]) == null? 0: toResult[i].getValue(toResult[i].columns[18]);
                var pcsFulFill = toResult[i].getValue(toResult[i].columns[19]) == null? 0: toResult[i].getValue(toResult[i].columns[19]);
                var type = toResult[i].getValue(toResult[i].columns[21]);
                // var  = toResult[i].getValue(toResult[i].columns[22]);
                
                if (!transfer_order_coll_obj[internalId]) {
                    transfer_order_coll_obj[internalId] = {
                        transfer_order_id: internalId,
                        transfer_order_date: dateFrom,
                        transfer_order_location_from: locationFromSearch,
                        transfer_order_location_to: locationToSearch,
                        transfer_order_amount_order: 0,
                        transfer_order_amount_receipt: 0,
                        
                        transfer_order_substract_ord_rec_pcs: 0,
                        item_collection:[],
                    }
                }
                
                if (!item_collection_obj[item]) {
                    item_collection_obj[item] = {
                        item_text: itemText,
                        item_harga_perkarton: 0,
                        item_carton: carton,
                        item_pcs: pcs,
                        item_amount_ord: 0,
                        item_amount_rec: 0,
                        item_sisa_carton: 0,
                        item_sisa_pcs: 0,
                        inv_coll:[],
                    }
                }
                
                if(!inv_obj[itemFulfillReceipt]){
                    inv_obj_arr.push(
                        inv_obj[itemFulfillReceipt] = {
                        inv_item_name: itemFulfillReceiptText,
                        inv_date: dateTo,
                        carton_fulfill_receipt: cartonFulfillReceipt,
                        pcs_fulfill_receipt: pcsFulfillReceipt,
                        amount_rec_fulfill: 0,
                        transfer_coll_id: internalId,
                    });

                }
                
                if(Object.keys(inv_obj).length > 0){
                    for(var inv in inv_obj){
                        for(var coll in transfer_order_coll_obj){
                            if(inv_obj[inv].coll_id == coll){
                                collection_obj[coll].invoice.push(inv_obj[inv])
                            }
                        }
                    }
                }
                
                
                
            }


            if(Object.keys(cm_return_obj).length > 0){
                for(var cm in cm_return_obj){
                    for(var coll in collection_obj){
                        if(cm_return_obj[cm].coll_id == coll){
                            collection_obj[coll].cm_return.push(cm_return_obj[cm])
                        }
                    }
                }
            }

            var getCalculateAmount = calculateAmountModTest(internalItemIdArr, transfer_order_data, calculateParam);


            //FILTER PRICING & DISCOUNT
            // var filterPricingDisc = [
            //     ["custrecord_me_po_price_disc_item", "anyof", itemId],
            // ];

            // if (checkboxInv === true) {
            //     if (itemId[0] != "") {

            //         filter.push(
            //             "AND",
            //             ["item", "anyof", itemId])
            //     }
            // }
            // else {
            //     if (itemId[0] != "") {

            //         filter.push(
            //             "AND",
            //             ["item", "anyof", itemId])
            //     }
            // }





        }



        return {
            onRequest: createPdfTransferOrder
        }
    });

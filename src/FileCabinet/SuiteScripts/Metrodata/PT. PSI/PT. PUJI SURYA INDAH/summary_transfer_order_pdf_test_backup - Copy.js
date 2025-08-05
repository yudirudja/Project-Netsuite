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

            var subTotalTo = {};
            var subTotalToArr = [];

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
                ["appliedtotransaction.type", "anyof", "TrnfrOrd"],
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
                        search.createColumn({ name: "custcol_me_fulfillpcs", label: "ME - Qty Pcs Fulfill" }),
                        //20
                        search.createColumn({ name: "custcol_me_qty_conversion_transcation", label: "ME - Qty Conversion" }),
                        //21
                        search.createColumn({
                            name: "type",
                            join: "fulfillingTransaction",
                            label: "Type"
                        }),
                        //22
                        search.createColumn({
                            name: "tranid",
                            join: "appliedToTransaction",
                            label: "Document Number"
                         }),
                    ]
            });

            var startrow = 0;
            do {
                var toResult = reportSearch.run().getRange({
                    start: startrow,
                    end: startrow + 1000
                });

                for (var i = 0; i < toResult.length; i++) {


                    var internalid = toResult[i].getValue(toResult[i].columns[13]);
                    var documentNumber = toResult[i].getValue(toResult[i].columns[0]);
                    var documentNumberFullfillment = toResult[i].getValue(toResult[i].columns[2]);
                    var tanggal = toResult[i].getValue(toResult[i].columns[3]);
                    var tanggalFullFillment = toResult[i].getValue(toResult[i].columns[4]);
                    var lokasi = toResult[i].getValue(toResult[i].columns[5]);
                    var lokasiTo = toResult[i].getValue(toResult[i].columns[6]);
                    var item = toResult[i].getText(toResult[i].columns[1]);
                    var itemId = toResult[i].getValue(toResult[i].columns[1]);

                    internalItemIdArr.push({
                        idTo: internalid,
                        item: itemId,
                    });

                    var carton = toResult[i].getValue(toResult[i].columns[17]);
                    var pcs = toResult[i].getValue(toResult[i].columns[18]);
                    if (pcs == "") {
                        pcs = 0;
                    }
                    var cartonFullfillemnt = toResult[i].getValue(toResult[i].columns[10]);
                    var pcsFullfillment = toResult[i].getValue(toResult[i].columns[11]);
                    var quantity = toResult[i].getValue(toResult[i].columns[14]);
                    log.debug('quantity', quantity)
                    var quantRecieved = toResult[i].getValue(toResult[i].columns[7]);
                    log.debug('quantRecieved', quantRecieved)
                    var getLocCostGroup = toResult[i].getValue(toResult[i].columns[15]);
                    var getToLocCostGroup = toResult[i].getValue(toResult[i].columns[16]);
                    var getLocCostGroupName = toResult[i].getText(toResult[i].columns[15]);
                    var getToLocCostGroupName = toResult[i].getText(toResult[i].columns[16]);
                    var getQuantityConversion = toResult[i].getValue(toResult[i].columns[19]);
                    var getType = toResult[i].getValue(toResult[i].columns[20]);
                    log.debug('get cost group loc from', getLocCostGroup)

                    if (cartonFullfillemnt == "") {
                        cartonFullfillemnt = 0;
                    }
                    if (pcsFullfillment == "") {
                        pcsFullfillment = 0;
                    }



                    var calculateParam = {
                        internal_id: internalid,
                        document_number: documentNumber,
                        document_number_fulfillment: documentNumberFullfillment,
                        tanggal: tanggal,
                        tanggal_fulfillment: tanggalFullFillment,
                        item: item,
                        item_id: itemId,
                        carton: carton,
                        pcs: pcs,
                        carton_fulfillment: cartonFullfillemnt,
                        pcs_fulfillment: pcsFullfillment,
                        quantity: quantity,
                        quantity_recieved: quantRecieved,
                        get_loc_cost_group: getLocCostGroup,
                        get_to_loc_cost_group: getToLocCostGroup,
                        get_quantity_conversion: getQuantityConversion,
                    };





                    var getFirstLevelParam = {
                        tanggal: tanggal,
                        lokasi: getLocCostGroupName,
                        lokasiTo: getToLocCostGroupName,
                        documentNumber: documentNumber,
                        amount_recieved_total: 0,
                        amount_order_total: 0,
                        amount_sisa_total: 0,
                        isExist: 0,
                        isDupIsExistEachItem: 0,
                        isReceipt: false,
                    }

                    var getSecondLevelParam = {
                        item: item,
                        itemId: itemId,
                        carton: parseInt(carton),
                        pcs: parseInt(pcs),
                        quantity: Math.abs(quantity),
                        price: 0,
                        amount_order: 0,
                        quantity_conversion: getQuantityConversion,
                        amount_recieved: 0,
                        cartonFullfillemntTotal: 0,
                        pcsFullfillmentTotal: 0,
                        quantRecieved: parseInt(quantRecieved),
                        sisa_carton: 0,
                        sisa_pcs: 0,
                        sisa_amount: 0,
                        fulfillment_quant: 0,
                        documentNumberParam: documentNumber,
                        isExist: 0,
                        isReceipt: false,
                        isKomplitInv: checkboxInv,
                    }

                    var getThirdLevelParam = {
                        documentNumberFullfillment: documentNumberFullfillment,
                        tanggalFullFillment: tanggalFullFillment,
                        cartonFullfillemnt: parseInt(cartonFullfillemnt),
                        pcsFullfillment: parseInt(pcsFullfillment),
                        amountRecievedEachReciept: 0,
                        type: getType,
                        documentNumberParam: documentNumber,
                        isKomplitPurch: checkboxPurch,
                    }
                    log.debug('getFirstLevelParam', getFirstLevelParam.documentNumber);
                    log.debug('getPrevParamnull', Object.keys(prevParseDataObj).length);
                    if (Object.keys(prevParseDataObj).length !== 0) {
                        log.debug('getprev', prevParseDataObj.transfer_order.documentNumber);
                        if (getThirdLevelParam.documentNumberFullfillment == "") {
                            getFirstLevelParam.documentNumber = "empty"
                            getSecondLevelParam.item = "empty"
                        }
                        if (getThirdLevelParam.type == "ItemRcpt") {
                            getSecondLevelParam.isReceipt = true;
                            getFirstLevelParam.isReceipt = true;
                        }
                        // if (getFirstLevelParam.documentNumber === prevParseDataObj.transfer_order.documentNumber) {
                        //     getFirstLevelParam.isExist = true;
                        // }

                        // if(getFirstLevelParam.documentNumber === prevParseDataObj.transfer_order.documentNumber){
                        //     getFirstLevelParam.documentNumber = "";
                        // }
                        // if(getSecondLevelParam.itemId === prevParseDataObj.data_item.itemId){
                        //     getSecondLevelParam.itemId = "";
                        // }
                        // if (getThirdLevelParam.type == "ItemShip" || getThirdLevelParam.type == "") {
                        //     getThirdLevelParam.type = "";
                        //     // getFirstLevelParam.documentNumber = "";
                        // }
                    }

                    var objectDataJson = {};
                    objectDataJson['transfer_order'] = getFirstLevelParam;
                    objectDataJson['data_item'] = getSecondLevelParam;
                    objectDataJson['data_receipt'] = getThirdLevelParam;

                    // if(objectDataJson['data_receipt'].type ==  || objectDataJson['data_item'].itemId == ""){
                    //     objectDataJson['data_receipt'].itemId = "";
                    // }
                    prevParseDataObj = objectDataJson;

                    transfer_order_data.push(prevParseDataObj);
                }
                // log.debug('parse data after321', parseDataObj[internalid]);
                startrow += 1000
            } while (toResult.length == 1000);
            // ========================================== END DO WHILE ================================================//
            // var finalOutputMod = calculateAmountMod(internalItemIdArr, parseDataObj, calculateParam);
            log.debug("OBJECT JSON Final", internalItemIdArr);
            log.debug("OBJECT JSON Final", objectDataJson);
            if (internalItemIdArr.length > 1) {
                var finalOutputModTest = calculateAmountModTest(internalItemIdArr, transfer_order_data, calculateParam);

                // var finalOutputArr = [];
                // //Get value inside internal id object
                // for (const key in finalOutputMod) {
                //     // push array to variable finalOutputArr
                //     finalOutputArr.push(finalOutputMod[key]);
                // }


                var prevDataDocNumber = "";
                var prevDataItemId = "";
                var prevDataItemName = "";
                var prevDataFulfillmentQuant = 0;
                var countisDupItemIsExist = 0;
                var countTo = 0;
                var countToDataItem = 0;
                var prevAmountReceived = 0;
                var dataSetFinal = [];
                var countIsExistto = 0


                for (var c = 0; c < transfer_order_data.length; c++) {
                    if (transfer_order_data[c].data_receipt.documentNumberFullfillment != "" && dataSetFinal.length != 0) {
                        // transfer_order_data.splice(z, 1);
                        var getValuedocNum = transfer_order_data[c].transfer_order.documentNumber;
                        if (dataSetFinal.includes(getValuedocNum)) {
                            countIsExistto++;
                            transfer_order_data[c].transfer_order.isExist = countIsExistto;
                            dataSetFinal.push(transfer_order_data[c]);

                        } else {
                            countIsExistto = 0;
                            transfer_order_data[c].transfer_order.isExist = countIsExistto;
                            dataSetFinal.push(transfer_order_data[c]);
                        }


                    } else if (dataSetFinal.length == 0 && transfer_order_data[c].data_receipt.documentNumberFullfillment != "") {
                        dataSetFinal.push(transfer_order_data[c]);
                    }

                }
                log.debug('test Data datasetFinal', dataSetFinal);

                for (var z = 0; z < transfer_order_data.length; z++) {
                    // log.debug('test doc number', transfer_order_data[z].transfer_order.documentNumber);
                    // log.debug('test prev doc number', transfer_order_data[z].transfer_order.documentNumber);
                    if (transfer_order_data[z].transfer_order.documentNumber == prevDataDocNumber && prevDataDocNumber != "empty") {
                        countTo++;
                        transfer_order_data[z].transfer_order.isExist = countTo;
                        if (transfer_order_data[z].transfer_order.isExist != 0) {
                            prevAmountReceived += transfer_order_data[z].data_receipt.amountRecievedEachReciept;
                            transfer_order_data[z].transfer_order.amount_recieved_total = prevAmountReceived;
                        }
                    } else {
                        countTo = 0;
                        prevAmountReceived = 0;
                    }
                    // if (transfer_order_data[z].data_item.itemId == prevDataItemId || transfer_order_data[z].data_receipt.type != "ItemRcpt" || transfer_order_data[z].transfer_order.documentNumber == "empty") {
                    //     transfer_order_data[z].data_item.isExist = 1;
                    //     if (transfer_order_data[z].data_receipt.type == "ItemRcpt") {
                    //         if (countTypeItemReceipt < 1 && transfer_order_data[z].data_item.itemId == prevDataItemId) {
                    //             transfer_order_data[z].data_item.isExist = 0;
                    //         }
                    //         if (transfer_order_data[z].transfer_order.documentNumber != prevDataDocNumber ) {
                    //             countTypeItemReceipt = 0;
                    //         }else{
                    //             countTypeItemReceipt++;
                    //         }
                    //     }

                    // }
                    if (transfer_order_data[z].data_item.item == prevDataItemName && prevDataItemName != "empty") {
                        countToDataItem++;
                        transfer_order_data[z].data_item.isExist = countToDataItem;
                    } else {
                        countToDataItem = 0;
                    }
                    if (transfer_order_data[z].data_item.isExist == 1 && transfer_order_data[z].transfer_order.documentNumber == prevDataDocNumber && prevDataItemName != "empty") {
                        countisDupItemIsExist++;
                        transfer_order_data[z].transfer_order.isDupIsExistEachItem = countisDupItemIsExist;
                    } else if (transfer_order_data[z].data_item.isExist != 1 && transfer_order_data[z].transfer_order.documentNumber != prevDataDocNumber && prevDataItemName != "empty") {
                        countisDupItemIsExist = 0
                        transfer_order_data[z].transfer_order.isDupIsExistEachItem = countisDupItemIsExist;
                    }
                    // if (transfer_order_data[z].data_receipt.type == "ItemRecpt" && countTypeItemReceipt == 0) {
                    //     transfer_order_data[z].data_item.isExist = 0;
                    // } else {
                    //     countTypeItemReceipt++;
                    // }
                    // if (transfer_order_data[z].data_receipt.type == "ItemShip" && transfer_order_data[z].data_item.itemId == prevDataItemId) {
                    //     transfer_order_data[z].data_item.fulfillment_quant = transfer_order_data[z].data_item.quantRecieved;
                    //     prevDataFulfillmentQuant = parseInt(transfer_order_data[z].data_item.fulfillment_quant);
                    // }
                    if (parseInt(transfer_order_data[z].data_item.fulfillment_quant) > prevDataFulfillmentQuant && prevDataItemId == transfer_order_data[z].data_item.itemId) {
                        prevDataFulfillmentQuant = parseInt(transfer_order_data[z].data_item.fulfillment_quant);
                    } else if (parseInt(transfer_order_data[z].data_item.fulfillment_quant) < prevDataFulfillmentQuant && prevDataItemId == transfer_order_data[z].data_item.itemId) {
                        transfer_order_data[z].data_item.fulfillment_quant = prevDataFulfillmentQuant;
                    }
                    // if (transfer_order_data[z].data_item.itemId == prevDataItemId) {
                    //     transfer_order_data[z].data_item.fulfillment_quant = prevDataFulfillmentQuant;
                    // }
                    // if (transfer_order_data[z].data_receipt.documentNumberFullfillment != "") {
                    //     dataSetFinal.push(transfer_order_data[z])
                    //     // transfer_order_data.splice(z, 1);
                    // }
                    prevDataDocNumber = transfer_order_data[z].transfer_order.documentNumber;
                    prevDataItemId = transfer_order_data[z].data_item.itemId;
                    prevDataItemName = transfer_order_data[z].data_item.item;

                }

                log.debug('before addition', "test");

                //get object from last array
                var prevDataDocNumber1 = dataSetFinal[dataSetFinal.length - 1].transfer_order.documentNumber;
                var prevAmountReceivedTotal = 0;
                var prevAmountOrderTotal = 0;
                var prevAmountSisaTotal = 0;

                var inputAmountReceivedTotal = 0;
                var inputAmountOrderTotal = 0;
                var inputAmountSisaTotal = 0;

                for (var p = dataSetFinal.length - 1; p >= 0; p--) {
                    if (dataSetFinal[p].transfer_order.documentNumber == prevDataDocNumber1 && dataSetFinal[p].transfer_order.documentNumber != "empty" && dataSetFinal[p].data_receipt.type == "ItemRcpt") {
                        if (prevAmountReceivedTotal <= dataSetFinal[p].data_item.amount_recieved || prevAmountReceivedTotal >= dataSetFinal[p].data_item.amount_recieved) {
                            if (dataSetFinal[p].data_item.isExist == 1) {
                                prevAmountReceivedTotal += dataSetFinal[p].data_item.amount_recieved;
                                inputAmountReceivedTotal += dataSetFinal[p].data_item.amount_recieved;
                            }
                        }
                        if (prevAmountOrderTotal <= dataSetFinal[p].data_item.amount_order || prevAmountOrderTotal >= dataSetFinal[p].data_item.amount_order) {
                            if (dataSetFinal[p].data_item.isExist == 1) {
                                prevAmountOrderTotal += dataSetFinal[p].data_item.amount_order;
                                inputAmountOrderTotal += dataSetFinal[p].data_item.amount_order;
                            }
                        }
                        if (prevAmountSisaTotal <= dataSetFinal[p].data_item.sisa_amount || prevAmountSisaTotal >= dataSetFinal[p].data_item.sisa_amount) {
                            if (dataSetFinal[p].data_item.isExist == 1) {
                                prevAmountSisaTotal += dataSetFinal[p].data_item.sisa_amount;
                                inputAmountSisaTotal += dataSetFinal[p].data_item.sisa_amount;
                            }
                        }
                        dataSetFinal[p].transfer_order.amount_recieved_total = prevAmountReceivedTotal;
                        dataSetFinal[p].transfer_order.amount_order_total = prevAmountOrderTotal;
                        dataSetFinal[p].transfer_order.amount_sisa_total = prevAmountSisaTotal;
                        log.debug('amount received total', prevAmountReceivedTotal);
                    } else if (dataSetFinal[p].data_receipt.type != "ItemRcpt") {
                        continue;
                    } else {
                        prevAmountReceivedTotal = 0;
                        prevAmountOrderTotal = 0;
                        prevAmountSisaTotal = 0
                    }
                    for (var g = 0; g < dataSetFinal.length; g++) {
                        if (dataSetFinal[g].transfer_order.documentNumber != "empty" && dataSetFinal[g].data_receipt.type == "ItemShip") {
                            dataSetFinal[g].transfer_order.amount_recieved_total = inputAmountReceivedTotal;
                            dataSetFinal[g].transfer_order.amount_order_total = inputAmountOrderTotal;
                            dataSetFinal[g].transfer_order.amount_sisa_total = inputAmountSisaTotal;
                            inputAmountReceivedTotal = 0;
                            inputAmountOrderTotal = 0;
                            inputAmountSisaTotal = 0;
                        }

                    }
                    prevDataDocNumber1 = dataSetFinal[p].transfer_order.documentNumber;
                }



                // for (var p = transfer_order_data.length - 1; p >= 0; p--) {
                //     if (transfer_order_data[p].transfer_order.documentNumber == prevDataDocNumber1 && transfer_order_data[p].transfer_order.documentNumber != "empty" && transfer_order_data[p].data_receipt.type == "ItemRcpt") {
                //         if (prevAmountReceivedTotal <= transfer_order_data[p].data_item.amount_recieved || prevAmountReceivedTotal >= transfer_order_data[p].data_item.amount_recieved) {
                //             if (transfer_order_data[p].data_item.isExist == 1) {
                //                 prevAmountReceivedTotal += transfer_order_data[p].data_item.amount_recieved;
                //             }
                //         }
                //         if (prevAmountOrderTotal <= transfer_order_data[p].data_item.amount_order || prevAmountOrderTotal >= transfer_order_data[p].data_item.amount_order) {
                //             if (transfer_order_data[p].data_item.isExist == 1) {
                //                 prevAmountOrderTotal += transfer_order_data[p].data_item.amount_order;
                //             }
                //         }
                //         if (prevAmountSisaTotal <= transfer_order_data[p].data_item.sisa_amount || prevAmountSisaTotal >= transfer_order_data[p].data_item.sisa_amount) {
                //             if (transfer_order_data[p].data_item.isExist == 1) {
                //                 prevAmountSisaTotal += transfer_order_data[p].data_item.sisa_amount;
                //             }
                //         }
                //         transfer_order_data[p].transfer_order.amount_recieved_total = prevAmountReceivedTotal;
                //         transfer_order_data[p].transfer_order.amount_order_total = prevAmountOrderTotal;
                //         transfer_order_data[p].transfer_order.amount_sisa_total = prevAmountSisaTotal;
                //         log.debug('amount received total', prevAmountReceivedTotal);
                //     } else if (transfer_order_data[p].data_receipt.type != "ItemRcpt") {
                //         continue;
                //     } else {
                //         prevAmountReceivedTotal = 0;
                //         prevAmountOrderTotal = 0;
                //         prevAmountSisaTotal = 0
                //     }
                //     prevDataDocNumber1 = transfer_order_data[p].transfer_order.documentNumber;
                // }

                // var dataSetFinal = {}

                // for (var m = 0; m < transfer_order_data.length; m++) {




                //     var convertAmountOrder = transfer_order_data[m].data_item.amount_order.toFixed;
                //     var convertAmountOrderTotal = transfer_order_data[m].transfer_order.amount_order_total;
                //     var convertAmountReceipt = transfer_order_data[m].data_item.amount_recieved;
                //     var convertSisaAmountItemNotRecieved = transfer_order_data[m].data_item.sisa_amount;
                //     var convertSisaAmountItemNotRecievedTotal = transfer_order_data[m].data_item.amount_sisa_total;
                //     var convertAmountOrderItem = transfer_order_data[m].data_item.amount_order;
                //     var convertcalculateAmountEachReceiptInt = transfer_order_data[m].data_receipt.amountRecievedEachReciept;

                //     transfer_order_data[m].data_item.amount_order.toFixed = convertAmountOrder.toFixed(2);
                //     transfer_order_data[m].transfer_order.amount_order_total = convertAmountOrderTotal.toFixed(2);
                //     transfer_order_data[m].data_item.amount_recieved = convertAmountReceipt.toFixed(2);
                //     transfer_order_data[m].data_item.sisa_amount = convertSisaAmountItemNotRecieved.toFixed(2);
                //     transfer_order_data[m].data_item.amount_sisa_total = convertSisaAmountItemNotRecievedTotal.toFixed(2);
                //     transfer_order_data[m].data_item.amount_order = convertAmountOrderItem.toFixed(2);
                //     transfer_order_data[m].data_receipt.amountRecievedEachReciept = convertcalculateAmountEachReceiptInt.toFixed(2);









                //     // var calculateAmtOrdCurrency = calculateAmtOrdInt.toLocaleString('en-US',
                //     //     {
                //     //         style: 'currency',
                //     //         currency: 'USD',
                //     //         currencyDisplay: 'hidden'
                //     //     });
                //     // var calculateAmtReceiptCurrency = calculateAmtReceiptInt.toLocaleString('en-US',
                //     //     {
                //     //         style: 'currency',
                //     //         currency: 'USD',
                //     //         currencyDisplay: 'hidden'
                //     //     });
                //     // var sisaAmountItemNotRecievedCurrency = sisaAmountItemNotRecievedInt.toLocaleString('en-US',
                //     //     {
                //     //         style: 'currency',
                //     //         currency: 'USD',
                //     //         currencyDisplay: 'hidden'
                //     //     });

                //     // var calculateAmountEachReceiptCurrency = calculateAmountEachReceiptInt.toLocaleString('en-US',
                //     //     {
                //     //         style: 'currency',
                //     //         currency: 'USD',
                //     //         currencyDisplay: 'hidden'
                //     //     });


                // }

                var tempDataSet = [];
                var amountTotalParam = [];
                var amountDataItemParam = [];
                var getDocNum = "";
                var getDocNumItem = "";
                var getItemIdforFulfillment = "";
                var getReceivedAmountTot = 0;
                var getOrderAmountTot = 0;
                var getSisaAmountTot = 0;

                var getReceivedAmount = 0;
                var getOrderAmount = 0;
                var getSisaAmount = 0;
                var getCartonSisa = 0;
                var getPcsSisa = 0;

                var prevDocNumAmountTot = "";
                var countAmountTotDuplicate = 0;

                for (var k = 0; k < dataSetFinal.length; k++) {
                    if (dataSetFinal[k].data_receipt.type == "ItemShip") {
                        tempDataSet.push(dataSetFinal[k]);
                    }

                }


                for (var s = 0; s < dataSetFinal.length; s++) {
                    if (dataSetFinal[s].data_item.isExist == 1) {
                        getDocNum = dataSetFinal[s].transfer_order.documentNumber;
                        getReceivedAmountTot = dataSetFinal[s].transfer_order.amount_recieved_total;
                        getOrderAmountTot = dataSetFinal[s].transfer_order.amount_order_total;
                        getSisaAmountTot = dataSetFinal[s].transfer_order.amount_sisa_total;

                        amountTotalParam.push({
                            docNum: getDocNum,
                            received_amount_total: getReceivedAmountTot,
                            order_amount_total: getOrderAmountTot,
                            sisa_amount_total: getSisaAmountTot,

                        });
                    }
                }

                for (var s = 0; s < dataSetFinal.length; s++) {
                    if (dataSetFinal[s].data_item.isExist == 1) {
                        getDocNumItem = dataSetFinal[s].transfer_order.documentNumber;
                        getItemIdforFulfillment = dataSetFinal[s].data_item.itemId;
                        getReceivedAmount = dataSetFinal[s].data_item.amount_recieved;
                        getOrderAmount = dataSetFinal[s].transfer_order.amount_order_total;
                        getSisaAmount = dataSetFinal[s].transfer_order.amount_sisa_total;
                        getCartonSisa = dataSetFinal[s].data_item.sisa_carton;
                        getPcsSisa = dataSetFinal[s].data_item.sisa_pcs;

                        amountDataItemParam.push({
                            docNum: getDocNumItem,
                            itemId: getItemIdforFulfillment,
                            received_amount: getReceivedAmount,
                            order_amount: getOrderAmount,
                            sisa_amount: getSisaAmount,
                            sisa_carton: getCartonSisa,
                            sisa_pcs: getPcsSisa,
                        });
                    }
                }

                log.debug("OBJECT JSON DATA TEST amount data item", amountDataItemParam);

                for (var a = 0; a < amountTotalParam.length; a++) {
                    for (var b = a + 1; b < amountTotalParam.length; b++) {
                        if (amountTotalParam[a].docNum == amountTotalParam[b].docNum && amountTotalParam[a].order_amount_total > amountTotalParam[b].order_amount_total) {
                            amountTotalParam.splice(b, 1);
                        } else if (amountTotalParam[a].docNum == amountTotalParam[b].docNum && amountTotalParam[a].order_amount_total <= amountTotalParam[b].order_amount_total) {
                            amountTotalParam.splice(a, 1);
                        }
                    }
                }


                for (var w = 0; w < tempDataSet.length; w++) {
                    var getAmountIndex = amountTotalParam.findIndex(function (val) {
                        return val.docNum == tempDataSet[w].transfer_order.documentNumber;
                    });
                    log.debug('get index getamount', amountTotalParam[getAmountIndex]);
                    var checkIfExist = amountTotalParam;
                    if (getAmountIndex != -1) {
                        tempDataSet[w].transfer_order.amount_recieved_total = amountTotalParam[getAmountIndex].received_amount_total;
                        tempDataSet[w].transfer_order.amount_order_total = amountTotalParam[getAmountIndex].order_amount_total;
                        tempDataSet[w].transfer_order.amount_sisa_total = amountTotalParam[getAmountIndex].sisa_amount_total;
                    }

                }

                //UBAH OUTPUT SISA PCS/CARTON DISINI BRO(NOTE FOR MY IDIOT BRAIN)
                for (var x = 0; x < tempDataSet.length; x++) {
                    var getAmountIndex = amountDataItemParam.findIndex(function (val) {
                        return val.docNum == tempDataSet[x].data_item.documentNumberParam && val.itemId == tempDataSet[x].data_item.itemId;
                    });
                    // log.debug('get index getamount', amountTotalParam[getAmountIndex]);
                    var checkIfExist = amountTotalParam;
                    if (getAmountIndex != -1) {
                        tempDataSet[x].data_item.amount_recieved = amountDataItemParam[getAmountIndex].received_amount;
                        tempDataSet[x].data_item.sisa_carton = amountDataItemParam[getAmountIndex].sisa_carton;
                        tempDataSet[x].data_item.sisa_pcs = amountDataItemParam[getAmountIndex].sisa_pcs;
                        // tempDataSet[x].data_item.amount_order = amountDataItemParam[getAmountIndex].order_amount;
                        // tempDataSet[x].data_item.sisa_amount = amountDataItemParam[getAmountIndex].sisa_amount;
                    }

                }

                for (var a = 0; a < tempDataSet.length; a++) {
                    for (var b = a + 1; b < tempDataSet.length; b++) {
                        if (tempDataSet[a].transfer_order.documentNumber == tempDataSet[b].transfer_order.documentNumber) {
                            tempDataSet[b].transfer_order.isExist = 1;
                        }
                    }
                }



                log.debug("OBJECT JSON DATA TEST", objectDataJson.data_item);
                log.debug("OBJECT JSON DATA TEST", transfer_order_data);
                log.debug("OBJECT JSON DATA TEST BRUH", dataSetFinal);
                log.debug("OBJECT JSON DATA TEST BRUH TEMP", tempDataSet);
                log.debug("OBJECT JSON DATA TEST BRUH TEMP PARAMETER", amountTotalParam);
                // log.debug("OBJECT JSON DATA TEST BRUH TEMP PARAMETER FILTERED", filteredAmountTotalParam);
                log.debug("OBJECT JSON DATA TEST", prevParseDataObj.transfer_order.documentNumber);
                log.debug("OBJECT JSON Final", { finalOutputModTest });
                log.debug("OBJECT JSON Final", transfer_order_data.length);
                log.debug("Array of Object JSON DATA TEST", transfer_order_data[0].transfer_order.lokasi);
                log.debug("JSON Stringify test", JSON.stringify({ finalOutputModTest: finalOutputModTest }));
                // log.debug("first Level Json", finalOutputMod);
                // log.debug("first Level Json", firstLevelOnlyJson);


                // var loopFinalOutput = [];
                // var filteredFinalOutput = filterValueNestedJSON(finalOutputArr, checkboxInv, checkboxPurch);
                // for (var k = 0; k < filteredFinalOutput.length; k++) {
                //     loopFinalOutput.push(filteredFinalOutput[k]);
                // }

                // var flatFinalOutput = flattenData(loopFinalOutput);
                // flatFinalOutput['TO'] = getFirstLevelParam;
                // log.debug("flatFinalOutput", flatFinalOutput);



                // ===================== Start Renderer ==================== //

                log.debug("renderer exist", "exist");

                var templateFile = file.load({ id: 505664 });

                var renderer = render.create();

                renderer.templateContent = templateFile.getContents();

                // ==================== Start Olah Data ===================== //
                // Yang dibutuhkan untuk Printout


                log.debug('header Json', headerJson);

                renderer.addCustomDataSource({
                    alias: "HEADER",
                    format: render.DataSource.JSON,
                    data: headerJson,
                });

                // renderer.addCustomDataSource({
                //     alias: "detail",
                //     format: render.DataSource.OBJECT,
                //     data: flatFinalOutput,
                // });

                renderer.addCustomDataSource({
                    alias: "transferOrder",
                    format: render.DataSource.OBJECT,
                    data: { tempDataSet },
                });

                renderer.addCustomDataSource({
                    alias: "test",
                    format: render.DataSource.OBJECT,
                    data: { dataSetFinal },
                });


                // ==================== Akhir Olah Data ===================== //

                //================ Start PrintOut ======================//


                var xml = renderer.renderAsString();

                log.debug("xml", xml)
                log.debug("renderer exist", renderer);

                var pdf = render.xmlToPdf({
                    xmlString: xml
                });

                // var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

                pdf.name = "Report Transfer Order from " + start + " to " + end + ".pdf";
                context.response.writeFile(pdf, false);


            } else {

                log.debug("renderer exist", "not exist");

                var templateFile = file.load({ id: 505664 });

                var renderer = render.create();

                renderer.templateContent = templateFile.getContents();

                // ==================== Start Olah Data ===================== //
                // Yang dibutuhkan untuk Printout


                log.debug('header Json', headerJson);

                renderer.addCustomDataSource({
                    alias: "HEADER",
                    format: render.DataSource.JSON,
                    data: headerJson,
                });
                // renderer.addCustomDataSource({
                //     alias: "test",
                //     format: render.DataSource.OBJECT,
                //     data: { transfer_order_data },
                // });

                // renderer.addCustomDataSource({
                //     alias: "detail",
                //     format: render.DataSource.OBJECT,
                //     data: flatFinalOutput,
                // });


                // ==================== Akhir Olah Data ===================== //

                //================ Start PrintOut ======================//


                var xml = renderer.renderAsString();

                log.debug("xml", xml)
                log.debug("renderer null", renderer);

                var pdf = render.xmlToPdf({
                    xmlString: xml
                });

                // var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

                pdf.name = "Report Transfer Order from " + start + " to " + end + ".pdf";
                context.response.writeFile(pdf, false);
            }
            log.debug('product name', product)

        }



        return {
            onRequest: createPdfTransferOrder
        }
    });

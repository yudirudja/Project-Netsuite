/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */

define(['N/url', 'N/search', 'N/format', 'N/currentRecord', 'N/record'],
    function (url, search, format, currentRecord, record) {
        var clicked = 0;

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
            viewForm: 'custpage_view_form',
            transferOrder: 'custpage_transfer_order',
            returnAuthorization: 'custpage_return_authorization',
            returnAuthorizationLocation: 'custpage_return_authorization_location',
            returnAuthorizationCustomer: 'custpage_return_authorization_customer',
            returnAuthorizationCustomerGroup: 'custpage_return_authorization_customer_group',
            returnAuthorizationCustomerStartDate: 'custpage_return_authorization_start_date',
            returnAuthorizationCustomerEndDate: 'custpage_return_authorization_end_date',
            returnAuthorizationCustomerSalesRep: 'custpage_return_authorization_sales_rep',
            returnAuthorizationCustomerCategoryCustomer: 'custpage_return_authorization_category_customer',
            returnAuthorizationCustomerProductName: 'custpage_return_authorization_product_name',
            returnAuthorizationCustomerItemName: 'custpage_return_authorization_item_name',
            returnAuthorizationCustomerViewWith: 'custpage_return_authorization_view',
            returnAuthorizationCustomerViewWithPurch: 'custpage_return_authorization_view_purch',
        }

        function pageInit(context) {

            var currentRec = context.currentRecord;
            var currentSublist = context.sublistId;
            var currentFieldId = context.fieldId;

            var getViewForm = currentRec.getField({
                fieldId: CONFIG.viewForm,
            });

            var getTransferOrder = currentRec.getField({
                fieldId: CONFIG.transferOrder,
            });

            var getVendorName = currentRec.getField({
                fieldId: CONFIG.vendorName,
            });

            var getLocationObjTo = currentRec.getField({
                fieldId: CONFIG.locationObjTo,
            });

            var getViewFormPick = currentRec.getValue({
                fieldId: CONFIG.viewForm,
            });

            if (getViewFormPick === 'T') {
                getTransferOrder.isDisabled = true
                getLocationObjTo.isDisabled = true
                getVendorName.isDisabled = false

                currentRec.setValue({
                    fieldId: CONFIG.vendorName,
                    value: ['']
                });
            }
            else if (getViewFormPick === 'F') {
                getTransferOrder.isDisabled = false
                getLocationObjTo.isDisabled = false
                getVendorName.isDisabled = true

                currentRec.setValue({
                    fieldId: CONFIG.locationObjTo,
                    value: ['']
                });
                currentRec.setValue({
                    fieldId: CONFIG.transferOrder,
                    value: ['']
                });

            }
            else {
                getTransferOrder.isDisabled = true
                getLocationObjTo.isDisabled = true
                getVendorName.isDisabled = true
            }
        }

        function fieldChanged(context) {
            var currentRec = context.currentRecord;
            var currentSublist = context.sublistId;
            var currentFieldId = context.fieldId;
            var lineIdx = context.line;

            var getViewForm = currentRec.getField({
                fieldId: CONFIG.viewForm,
            });

            var getTransferOrder = currentRec.getField({
                fieldId: CONFIG.transferOrder,
            });

            var getVendorName = currentRec.getField({
                fieldId: CONFIG.vendorName,
            });

            var getLocationObjTo = currentRec.getField({
                fieldId: CONFIG.locationObjTo,
            });

            var getViewFormPick = currentRec.getValue({
                fieldId: CONFIG.viewForm,
            });

            if (currentFieldId === CONFIG.viewForm) {


                if (getViewFormPick == 'T') {
                    getTransferOrder.isDisabled = true
                    getLocationObjTo.isDisabled = true
                    getVendorName.isDisabled = false

                    currentRec.setValue({
                        fieldId: CONFIG.vendorName,
                        value: ['']
                    });
                } else if (getViewFormPick == 'F') {
                    getTransferOrder.isDisabled = false
                    getLocationObjTo.isDisabled = false
                    getVendorName.isDisabled = true

                    currentRec.setValue({
                        fieldId: CONFIG.locationObjTo,
                        value: ['']
                    });
                    currentRec.setValue({
                        fieldId: CONFIG.transferOrder,
                        value: ['']
                    });

                } else {
                    getTransferOrder.isDisabled = true
                    getLocationObjTo.isDisabled = true
                    getVendorName.isDisabled = true
                }
            }

        }

        function reportByPurchaseOrder() {
            var rec = currentRecord.get();
            log.debug('test report nampil')

            var vendorName = rec.getValue({
                fieldId: CONFIG.vendorName
            })

            var vendorNameText = rec.getText({
                fieldId: CONFIG.vendorName
            })

            var cust = vendorName.length
            // log.debug('nama vendor', vendorNameText)

            var locationName = rec.getValue({
                fieldId: CONFIG.locationObj
            })

            var locationNameText = rec.getText({
                fieldId: CONFIG.locationObj
            })

            var itemNameBtn = rec.getValue({
                fieldId: CONFIG.itemName
            })

            var itemNameTextBtn = rec.getText({
                fieldId: CONFIG.itemName
            })

            var productName = rec.getValue({
                fieldId: CONFIG.productName
            })

            var productNameText = rec.getText({
                fieldId: CONFIG.productName
            })
            //view with
            var checkboxView = rec.getValue({
                fieldId: CONFIG.viewWith
            });


            //TAMPIL PURCAHSE VIEW
            var checkboxViewPurchase = rec.getValue({
                fieldId: CONFIG.viewWithPurch
            });


            //START DATE
            var startDate = rec.getValue({
                fieldId: CONFIG.startDate
            })
            // log.debug('start date', startDate)
            var timeStart = format.format({
                value: startDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug('timestart', timeStart)

            var dateStart = timeStart.toString();
            var arrayStart = dateStart.split(" ");
            var getDateStart = arrayStart[0];
            log.debug("Date start conv", getDateStart)


            //END DATE
            var endDate = rec.getValue({
                fieldId: CONFIG.endDate
            })
            // log.debug("End Date", endDate)

            var timeEnd = format.format({
                value: endDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug("time end", timeEnd)

            var dateEnd = timeEnd.toString();
            var arrayEnd = dateEnd.split(" ");
            var getDateEnd = arrayEnd[0];
            // log.debug("Date end conv", getDateEnd)





            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_me_sl_report_po',
                deploymentId: 'customdeploy_me_sl_summary_report',
                params: {
                    start: JSON.stringify(getDateStart),
                    end: JSON.stringify(getDateEnd),
                    vendorId: JSON.stringify(vendorName),
                    vendorName: JSON.stringify(vendorNameText),
                    locationId: JSON.stringify(locationName),
                    locationName: JSON.stringify(locationNameText),
                    itemId: JSON.stringify(itemNameBtn),
                    itemName: JSON.stringify(itemNameTextBtn),
                    productId: JSON.stringify(productName),
                    productName: JSON.stringify(productNameText),
                    view: JSON.stringify(checkboxView),
                    tampilPurchase: JSON.stringify(checkboxViewPurchase)
                }
            });
            log.debug(suiteletURL)

            var downloadWindow = window.open("")
            downloadWindow.document.write("Please wait for file to be created")
            downloadWindow.location.replace(suiteletURL)
        };

        function reportByPurchaseOrdPDF() {
            var rec = currentRecord.get();
            log.debug('test report nampil')

            var vendorName = rec.getValue({
                fieldId: CONFIG.vendorName
            })

            var vendorNameText = rec.getText({
                fieldId: CONFIG.vendorName
            })

            var cust = vendorName.length
            // log.debug('nama vendor', vendorNameText)

            var locationName = rec.getValue({
                fieldId: CONFIG.locationObj
            })

            var locationNameText = rec.getText({
                fieldId: CONFIG.locationObj
            })

            var itemNameBtn = rec.getValue({
                fieldId: CONFIG.itemName
            })

            var itemNameTextBtn = rec.getText({
                fieldId: CONFIG.itemName
            })

            var productName = rec.getValue({
                fieldId: CONFIG.productName
            })

            var productNameText = rec.getText({
                fieldId: CONFIG.productName
            })
            //view with
            var checkboxView = rec.getValue({
                fieldId: CONFIG.viewWith
            });


            //TAMPIL PURCAHSE VIEW
            var checkboxViewPurchase = rec.getValue({
                fieldId: CONFIG.viewWithPurch
            });


            //START DATE
            var startDate = rec.getValue({
                fieldId: CONFIG.startDate
            })
            // log.debug('start date', startDate)
            var timeStart = format.format({
                value: startDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug('timestart', timeStart)

            var dateStart = timeStart.toString();
            var arrayStart = dateStart.split(" ");
            var getDateStart = arrayStart[0];
            log.debug("Date start conv", getDateStart)


            //END DATE
            var endDate = rec.getValue({
                fieldId: CONFIG.endDate
            })
            // log.debug("End Date", endDate)

            var timeEnd = format.format({
                value: endDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug("time end", timeEnd)

            var dateEnd = timeEnd.toString();
            var arrayEnd = dateEnd.split(" ");
            var getDateEnd = arrayEnd[0];
            // log.debug("Date end conv", getDateEnd)


            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_me_summary_item_pdf',
                deploymentId: 'customdeploy_me_summary_report_pdf',
                params: {
                    start: JSON.stringify(getDateStart),
                    end: JSON.stringify(getDateEnd),
                    vendorId: JSON.stringify(vendorName),
                    vendorName: JSON.stringify(vendorNameText),
                    locationId: JSON.stringify(locationName),
                    locationName: JSON.stringify(locationNameText),
                    itemId: JSON.stringify(itemNameBtn),
                    itemName: JSON.stringify(itemNameTextBtn),
                    productId: JSON.stringify(productName),
                    productName: JSON.stringify(productNameText),
                    view: JSON.stringify(checkboxView),
                    tampilPurchase: JSON.stringify(checkboxViewPurchase)
                }
            });
            log.debug(suiteletURL)

            var downloadWindow = window.open("")
            downloadWindow.document.write("Please wait for file to be created")
            downloadWindow.location.replace(suiteletURL)
        };

        function reportByTransferOrdPDF() {
            var rec = currentRecord.get();
            log.debug('test report nampil')

            var vendorName = rec.getValue({
                fieldId: CONFIG.vendorName
            })

            var vendorNameText = rec.getText({
                fieldId: CONFIG.vendorName
            })

            var cust = vendorName.length
            // log.debug('nama vendor', vendorNameText)

            var locationName = rec.getValue({
                fieldId: CONFIG.locationObj
            })

            var locationNameText = rec.getText({
                fieldId: CONFIG.locationObj
            })

            var locationTransOrd = rec.getValue({
                fieldId: CONFIG.locationObjTo
            })
            var locationTransOrdText = rec.getText({
                fieldId: CONFIG.locationObjTo
            })

            var transOrder = rec.getValue({
                fieldId: CONFIG.transferOrder
            })

            var transOrderText = rec.getText({
                fieldId: CONFIG.transferOrder
            })

            var itemNameBtn = rec.getValue({
                fieldId: CONFIG.itemName
            })

            var itemNameTextBtn = rec.getText({
                fieldId: CONFIG.itemName
            })

            var productName = rec.getValue({
                fieldId: CONFIG.productName
            })

            var productNameText = rec.getText({
                fieldId: CONFIG.productName
            })
            //view with
            var checkboxView = rec.getValue({
                fieldId: CONFIG.viewWith
            });


            //TAMPIL PURCAHSE VIEW
            var checkboxViewPurchase = rec.getValue({
                fieldId: CONFIG.viewWithPurch
            });


            //START DATE
            var startDate = rec.getValue({
                fieldId: CONFIG.startDate
            })
            // log.debug('start date', startDate)
            var timeStart = format.format({
                value: startDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug('timestart', timeStart)

            var dateStart = timeStart.toString();
            var arrayStart = dateStart.split(" ");
            var getDateStart = arrayStart[0];
            log.debug("Date start conv", getDateStart)


            //END DATE
            var endDate = rec.getValue({
                fieldId: CONFIG.endDate
            })
            // log.debug("End Date", endDate)

            var timeEnd = format.format({
                value: endDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug("time end", timeEnd)

            var dateEnd = timeEnd.toString();
            var arrayEnd = dateEnd.split(" ");
            var getDateEnd = arrayEnd[0];
            // log.debug("Date end conv", getDateEnd)

            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_me_summary_to_pdf',
                deploymentId: 'customdeploy_me_summary_to_pdf_suitelet',
                params: {
                    start: JSON.stringify(getDateStart),
                    end: JSON.stringify(getDateEnd),
                    transferOrder: JSON.stringify(getDateEnd),
                    vendorId: JSON.stringify(vendorName),
                    vendorName: JSON.stringify(vendorNameText),
                    locationId: JSON.stringify(locationName),
                    locationName: JSON.stringify(locationNameText),
                    itemId: JSON.stringify(itemNameBtn),
                    itemName: JSON.stringify(itemNameTextBtn),
                    productId: JSON.stringify(productName),
                    productName: JSON.stringify(productNameText),
                    view: JSON.stringify(checkboxView),
                    tampilPurchase: JSON.stringify(checkboxViewPurchase),
                    locationTransOrd: JSON.stringify(locationTransOrd),
                    locationTransOrdText: JSON.stringify(locationTransOrdText),
                    transferOrder: JSON.stringify(transOrder),
                    transferOrderText: JSON.stringify(transOrderText),
                }
            });
            log.debug(suiteletURL)

            var downloadWindow = window.open("")
            downloadWindow.document.write("Please wait for file to be created")
            downloadWindow.location.replace(suiteletURL)
        }

        function reportByTransferOrdXML() {
            var rec = currentRecord.get();
            log.debug('test report nampil')

            var vendorName = rec.getValue({
                fieldId: CONFIG.vendorName
            })

            var vendorNameText = rec.getText({
                fieldId: CONFIG.vendorName
            })

            var cust = vendorName.length
            // log.debug('nama vendor', vendorNameText)

            var locationName = rec.getValue({
                fieldId: CONFIG.locationObj
            })

            var locationNameText = rec.getText({
                fieldId: CONFIG.locationObj
            })

            var locationTransOrd = rec.getValue({
                fieldId: CONFIG.locationObjTo
            })
            var locationTransOrdText = rec.getText({
                fieldId: CONFIG.locationObjTo
            })

            var transOrder = rec.getValue({
                fieldId: CONFIG.transferOrder
            })

            var transOrderText = rec.getText({
                fieldId: CONFIG.transferOrder
            })

            var itemNameBtn = rec.getValue({
                fieldId: CONFIG.itemName
            })

            var itemNameTextBtn = rec.getText({
                fieldId: CONFIG.itemName
            })

            var productName = rec.getValue({
                fieldId: CONFIG.productName
            })

            var productNameText = rec.getText({
                fieldId: CONFIG.productName
            })
            //view with
            var checkboxView = rec.getValue({
                fieldId: CONFIG.viewWith
            });


            //TAMPIL PURCAHSE VIEW
            var checkboxViewPurchase = rec.getValue({
                fieldId: CONFIG.viewWithPurch
            });


            //START DATE
            var startDate = rec.getValue({
                fieldId: CONFIG.startDate
            })
            // log.debug('start date', startDate)
            var timeStart = format.format({
                value: startDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug('timestart', timeStart)

            var dateStart = timeStart.toString();
            var arrayStart = dateStart.split(" ");
            var getDateStart = arrayStart[0];
            log.debug("Date start conv", getDateStart)


            //END DATE
            var endDate = rec.getValue({
                fieldId: CONFIG.endDate
            })
            // log.debug("End Date", endDate)

            var timeEnd = format.format({
                value: endDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug("time end", timeEnd)

            var dateEnd = timeEnd.toString();
            var arrayEnd = dateEnd.split(" ");
            var getDateEnd = arrayEnd[0];
            // log.debug("Date end conv", getDateEnd)

            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_me_sl_summary_transf_ord',
                deploymentId: 'customdeploy_me_summary_transf_ord',
                params: {
                    start: JSON.stringify(getDateStart),
                    end: JSON.stringify(getDateEnd),
                    transferOrder: JSON.stringify(getDateEnd),
                    vendorId: JSON.stringify(vendorName),
                    vendorName: JSON.stringify(vendorNameText),
                    locationId: JSON.stringify(locationName),
                    locationName: JSON.stringify(locationNameText),
                    itemId: JSON.stringify(itemNameBtn),
                    itemName: JSON.stringify(itemNameTextBtn),
                    productId: JSON.stringify(productName),
                    productName: JSON.stringify(productNameText),
                    view: JSON.stringify(checkboxView),
                    tampilPurchase: JSON.stringify(checkboxViewPurchase),
                    locationTransOrd: JSON.stringify(locationTransOrd),
                    locationTransOrdText: JSON.stringify(locationTransOrdText),
                    transferOrder: JSON.stringify(transOrder),
                    transferOrderText: JSON.stringify(transOrderText),
                }
            });
            log.debug(suiteletURL)

            var downloadWindow = window.open("")
            downloadWindow.document.write("Please wait for file to be created")
            downloadWindow.location.replace(suiteletURL)
        }

        function reportByReturnAuthorizationPDF() {
            var rec = currentRecord.get();
            log.debug('test report nampil')

            var getReturnAuthorization = rec.getValue({
                fieldId: CONFIG.returnAuthorization
            })

            var getReturnAuthorizationText = rec.getText({
                fieldId: CONFIG.returnAuthorization
            })

            // var returnAuthorizationLocation = vendorName.length
            // log.debug('nama vendor', vendorNameText)

            var getReturnAuthorizationLocation = rec.getValue({
                fieldId: CONFIG.returnAuthorizationLocation
            })

            var getReturnAuthorizationLocationText = rec.getText({
                fieldId: CONFIG.returnAuthorizationLocation
            })

            var getReturnAuthorizationCustomer = rec.getValue({
                fieldId: CONFIG.returnAuthorizationCustomer
            })
            var getReturnAuthorizationCustomerText = rec.getText({
                fieldId: CONFIG.returnAuthorizationCustomer
            })

            var getReturnAuthorizationCustomerGroup = rec.getValue({
                fieldId: CONFIG.returnAuthorizationCustomerGroup
            })

            var getReturnAuthorizationCustomerGroupText = rec.getText({
                fieldId: CONFIG.returnAuthorizationCustomerGroup
            })

            var getReturnAuthorizationCustomerSalesRep = rec.getValue({
                fieldId: CONFIG.returnAuthorizationCustomerSalesRep
            })

            var getReturnAuthorizationCustomerSalesRepText = rec.getText({
                fieldId: CONFIG.returnAuthorizationCustomerSalesRep
            })

            var getReturnAuthorizationCustomerCategoryCustomer = rec.getValue({
                fieldId: CONFIG.returnAuthorizationCustomerCategoryCustomer
            })

            var getReturnAuthorizationCustomerCategoryCustomerText = rec.getText({
                fieldId: CONFIG.returnAuthorizationCustomerCategoryCustomer
            })
            //view with
            var checkboxView = rec.getValue({
                fieldId: CONFIG.returnAuthorizationCustomerViewWith
            });


            //TAMPIL PURCAHSE VIEW
            var checkboxViewPurchase = rec.getValue({
                fieldId: CONFIG.returnAuthorizationCustomerViewWithPurch
            });


            //START DATE
            var startDate = rec.getValue({
                fieldId: CONFIG.returnAuthorizationCustomerStartDate
            })
            // log.debug('start date', startDate)
            var timeStart = format.format({
                value: startDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug('timestart', timeStart)

            var dateStart = timeStart.toString();
            var arrayStart = dateStart.split(" ");
            var getDateStart = arrayStart[0];
            log.debug("Date start conv", getDateStart)


            //END DATE
            var endDate = rec.getValue({
                fieldId: CONFIG.returnAuthorizationCustomerEndDate
            })
            // log.debug("End Date", endDate)

            var timeEnd = format.format({
                value: endDate,
                type: format.Type.DATETIME,
                timezone: format.Timezone.ASIA_BANGKOK
            });
            // log.debug("time end", timeEnd)

            var dateEnd = timeEnd.toString();
            var arrayEnd = dateEnd.split(" ");
            var getDateEnd = arrayEnd[0];
            // log.debug("Date end conv", getDateEnd)

            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_me_sl_return_auth_pdf',
                deploymentId: 'customdeploy_me_sl_return_auth_pdf',
                params: {
                    start: JSON.stringify(getDateStart),
                    end: JSON.stringify(getDateEnd),
                    return_auth: JSON.stringify(getReturnAuthorization),
                    return_auth_text: JSON.stringify(getReturnAuthorizationText),
                    location: JSON.stringify(getReturnAuthorizationLocation),
                    location_text: JSON.stringify(getReturnAuthorizationLocationText),
                    customer: JSON.stringify(getReturnAuthorizationCustomer),
                    customer_text: JSON.stringify(getReturnAuthorizationCustomerText),
                    customer_group: JSON.stringify(getReturnAuthorizationCustomerGroup),
                    customer_group_text: JSON.stringify(getReturnAuthorizationCustomerGroupText),
                    sales_rep: JSON.stringify(getReturnAuthorizationCustomerSalesRep),
                    sales_rep_text: JSON.stringify(getReturnAuthorizationCustomerSalesRepText),
                    category_customer: JSON.stringify(getReturnAuthorizationCustomerCategoryCustomer),
                    category_customer_text: JSON.stringify(getReturnAuthorizationCustomerCategoryCustomerText),
                    transferOrder: JSON.stringify(transOrder),
                    transferOrderText: JSON.stringify(transOrderText),
                }
            });
            log.debug(suiteletURL)

            var downloadWindow = window.open("")
            downloadWindow.document.write("Please wait for file to be created")
            downloadWindow.location.replace(suiteletURL)
        }

        function disableLocatioTrans(context) {
            var typeFormValue = context.currentRecord.getValue({
                fieldId: 'custpage_view_form'
            });
            var bodyLocationToField = context.currentRecord.getField({
                fieldId: 'custpage_location_to'
            });
            if (typeFormValue === 'T') {
                bodyLocationToField.isDisabled = true;
                bodyLocationToField.defaultValue = '';
            } else {
                bodyLocationToField.isDisabled = false;
            }

        }

        return {
            pageInit: pageInit,
            reportByPurchaseOrder: reportByPurchaseOrder,
            reportByPurchaseOrdPDF: reportByPurchaseOrdPDF,
            reportByTransferOrdPDF: reportByTransferOrdPDF,
            reportByTransferOrdXML: reportByTransferOrdXML,
            fieldChanged: fieldChanged,
            //  disableLocatioTrans: disableLocatioTrans,
        }
    });
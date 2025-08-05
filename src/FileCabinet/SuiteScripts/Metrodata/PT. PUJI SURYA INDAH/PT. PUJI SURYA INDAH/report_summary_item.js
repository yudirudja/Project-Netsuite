/**
 *@NApiVersion 2.1
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

        function getRAfilter() {

            var data = [];

            var returnAuthSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({ name: "salesrep", label: "Sales Rep" }),
                        search.createColumn({
                            name: "custentity_me_category_customer",
                            join: "customer",
                            label: "ME - Category Customer"
                        })
                    ]
            }).run().getRange({
                start: 0,
                end: 1000,
            });

            for (let a = 0; a < returnAuthSearchObj.length; a++) {
                var salesRep = returnAuthSearchObj[a].getValue(returnAuthSearchObj[a].columns[0]);
                var salesRepText = returnAuthSearchObj[a].getText(returnAuthSearchObj[a].columns[0]);
                var categoryCust = returnAuthSearchObj[a].getValue(returnAuthSearchObj[a].columns[1]);
                var categoryCustText = returnAuthSearchObj[a].getText(returnAuthSearchObj[a].columns[1]);

                data.push({
                    salesRep: salesRep,
                    salesRepText: salesRepText,
                    categoryCust: categoryCust,
                    categoryCustText: categoryCustText,
                });
            }
            return data;
        }

        function getCustomerData() {

            var data = [];
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({ name: "parent", label: "Top Level Parent" }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "REGEXP_SUBSTR({parent}, '[^-]+', 1, 1)",
                            label: "Group Code"
                        }),
                        search.createColumn({ name: "custentity_me_category_customer", label: "ME - Category Customer" })
                    ]
            }).run().getRange({
                start: 0,
                end: 1000,
            });

            for (let a = 0; a < customerSearchObj.length; a++) {
                var nameSpecific = customerSearchObj[a].getValue(customerSearchObj[a].columns[0]);
                var topLevelParent = customerSearchObj[a].getValue(customerSearchObj[a].columns[1]);
                var groupCode = customerSearchObj[a].getValue(customerSearchObj[a].columns[2]);
                var category = customerSearchObj[a].getValue(customerSearchObj[a].columns[3]);

                data.push({
                    nameSpecific: nameSpecific,
                    topLevelParent: topLevelParent,
                    groupCode: groupCode,
                    category: category,
                });
            }
            log.debug("data", data);
            return data;
        }

        function getParameter() {


            var form = serverWidget.createForm({
                title: 'Report Summary Item Receipt'
            });

            // FIELD GROUP
            var fieldgroupPOTO = form.addFieldGroup({
                id: 'fieldgroupPOTO',
                label: 'Purchase Order & Transfer Order'
            });
            var fieldgroupRA = form.addFieldGroup({
                id: 'fieldgroupRA',
                label: 'Return Authorization'
            });


            // PO & TO
            var typeForm = form.addField({
                id: CONFIG.viewForm,
                type: serverWidget.FieldType.SELECT,
                label: 'Form Type',
                container: 'fieldgroupPOTO',
            })
            var tipeForm = []

            var purpose1 = {
                id: 'T',
                text: 'Purchase order'
            }
            var purpose2 = {
                id: 'F',
                text: 'Transfer Order'
            }
            var purpose3 = {
                id: 'F',
                text: 'Return Authorization'
            }
            tipeForm.push(purpose1, purpose2, purpose3);

            typeForm.addSelectOption({ value: '', text: '' })
            if (tipeForm.length) {
                for (var i = 0; i < tipeForm.length; i++) {
                    typeForm.addSelectOption({ value: tipeForm[i].id, text: tipeForm[i].text })
                }
            }
            typeForm.defaultValue = "F"

            var body_TransferOrder = form.addField({
                id: CONFIG.transferOrder,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'transfer order number',
                source: 'transferorder',
                container: 'fieldgroupPOTO',
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            var body_Vendor_Name = form.addField({
                id: CONFIG.vendorName,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Vendor Name',
                source: 'vendor',
                container: 'fieldgroupPOTO',
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });




            var body_product = form.addField({
                id: CONFIG.productName,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Product',
                source: 'customlist_me_clist_produk',
                container: 'fieldgroupPOTO',
            })

            var body_startDate = form.addField({
                id: CONFIG.startDate,
                type: serverWidget.FieldType.DATE,
                label: 'Start Date',
                container: 'fieldgroupPOTO',
            })
            body_startDate.isMandatory = false
            body_startDate.defaultValue = new Date()

            var body_endDate = form.addField({
                id: CONFIG.endDate,
                type: serverWidget.FieldType.DATE,
                label: 'End Date',
                container: 'fieldgroupPOTO'
            })
            body_endDate.isMandatory = false
            body_endDate.defaultValue = new Date()





            var body_Location = form.addField({
                id: CONFIG.locationObj,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Location',
                source: 'locationcostinggroup',
                container: 'fieldgroupPOTO',
            })

            var body_Location_to = form.addField({
                id: CONFIG.locationObjTo,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Location To',
                source: 'locationcostinggroup',
                container: 'fieldgroupPOTO',
            });
            // body_Location_to.isDisabled = true;


            //  typeForm.updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.NORMAL
            // });
            typeForm.clientScriptModulePath = 'SuiteScripts/Metrodata/_me_cl_report_summary_item(button).js'; // replace with your actual client script path
            var body_item = form.addField({
                id: CONFIG.itemName,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Item',
                source: 'inventoryitem',
                container: 'fieldgroupPOTO',
            })

            var view_with = form.addField({
                id: CONFIG.viewWith,
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Komplit Inv',
                container: 'fieldgroupPOTO'
            })

            var viewWith_Purch = form.addField({
                id: CONFIG.viewWithPurch,
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Tampil Purchase',
                container: 'fieldgroupPOTO',
            })

            viewWith_Purch.defaultValue = "T"
            view_with.defaultValue = "T"

            // RA

            var getCustomer = getCustomerData();
            var getRaFilters = getRAfilter();

            var body_return_authorization = form.addField({
                id: CONFIG.returnAuthorization,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Return Authorization',
                source: 'returnAuthorization',
                container: 'fieldgroupRA',
            });

            var body_Location_return_authorization = form.addField({
                id: CONFIG.returnAuthorizationLocation,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Location (Return Authorization)',
                source: 'locationcostinggroup',
                container: 'fieldgroupRA',
            });

            var return_auth_startDate = form.addField({
                id: CONFIG.returnAuthorizationCustomerStartDate,
                type: serverWidget.FieldType.DATE,
                label: 'Start Date',
                container: 'fieldgroupRA',
            })
            return_auth_startDate.isMandatory = false
            return_auth_startDate.defaultValue = new Date()

            var return_auth_endDate = form.addField({
                id: CONFIG.returnAuthorizationCustomerEndDate,
                type: serverWidget.FieldType.DATE,
                label: 'End Date',
                container: 'fieldgroupRA'
            })
            return_auth_endDate.isMandatory = false
            return_auth_endDate.defaultValue = new Date()

            var body_return_authorization_customer_specific = form.addField({
                id: CONFIG.returnAuthorizationCustomer,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Customer (Return Authorization)',
                container: 'fieldgroupRA',
            });

            var body_return_authorization_customer_group = form.addField({
                id: CONFIG.returnAuthorizationCustomerGroup,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Customer Group (Return Authorization)',
                container: 'fieldgroupRA',
            });

            var body_return_authorization_category_cust = form.addField({
                id: CONFIG.returnAuthorizationCustomerCategoryCustomer,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Category Customer (Return Authorization)',
                source: 'customrecord_me_category_customer',
                container: 'fieldgroupRA',
            });
            var body_return_authorization_sales_rep = form.addField({
                id: CONFIG.returnAuthorizationCustomerSalesRep,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Salesman (Return Authorization)',
                source: 'employee',
                container: 'fieldgroupRA',
            });

            var body_product = form.addField({
                id: CONFIG.returnAuthorizationCustomerProductName,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Product',
                source: 'customlist_me_clist_produk',
                container: 'fieldgroupRA',
            })

            var body_item = form.addField({
                id: CONFIG.returnAuthorizationCustomerItemName,
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Item',
                source: 'inventoryitem',
                container: 'fieldgroupRA',
            })

            var view_with = form.addField({
                id: CONFIG.returnAuthorizationCustomerViewWith,
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Komplit Inv',
                container: 'fieldgroupRA'
            })

            var viewWith_Purch = form.addField({
                id: CONFIG.returnAuthorizationCustomerViewWithPurch,
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Tampil Purchase',
                container: 'fieldgroupRA',
            })

            viewWith_Purch.defaultValue = "T"
            view_with.defaultValue = "T"



            if (getCustomer.length) {
                for (let index = 0; index < getCustomer.length; index++) {
                    body_return_authorization_customer_specific.addSelectOption({ value: getCustomer[index].nameSpecific, text: getCustomer[index].nameSpecific })
                    body_return_authorization_customer_group.addSelectOption({ value: getCustomer[index].groupCode, text: getCustomer[index].groupCode })
                }
            }

            //  if (getRaFilters.length) {
            //     for (let a = 0; a < getRaFilters.length; a++) {
            //         body_return_authorization_sales_rep.addSelectOption({value: getRaFilters[a].salesRep, text: getRaFilters[a].salesRepText})
            //         body_return_authorization_category_cust.addSelectOption({value: getRaFilters[a].categoryCust, text: getRaFilters[a].categoryCustText})

            //     }
            //  }



            //=========================end of RA======================================


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
                    var body_klaim = form.getField({ id: CONFIG.viewForm })
                    var body_transferOrder = form.getField({ id: CONFIG.transferOrder })

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
                    var params_body_klaim = params[CONFIG.viewForm]
                    var params_transferOrder = params[CONFIG.transferOrder]


                    form.clientScriptModulePath = 'SuiteScripts/Metrodata/_me_cl_report_summary_item(button).js';

                    // var paramLabelBtn = "";
                    var paramFunctionNamePdf = '';
                    var paramIdPdf = '';
                    var paramFunctionNameExcel = '';
                    var paramIdExcel = '';

                    // if (typeForm == 'T') {
                    //     paramFunctionNamePdf = 'reportByPurchaseOrdPDF()';
                    //     paramIdPdf = 'button_report_purchase_order_pdf';
                    //     paramFunctionNameExcel = 'reportByPurchaseOrder()';
                    //     paramIdExcel = 'button_report_purchase_order';
                    // }else if(typeForm == 'F'){
                    //     paramFunctionNamePdf = 'reportByTransferOrdPDF()';
                    //     paramIdPdf = 'button_report_transfer_order';
                    //     paramFunctionNameExcel = 'reportByTransferOrdXML()';
                    //     paramIdExcel = 'button_report_transfer_order_excel';
                    // }

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

                    form.addButton({
                        id: 'button_report_transfer_order',
                        label: 'Save As PDF (Transfer Order)',
                        functionName: 'reportByTransferOrdPDF()',
                        // clientScriptModulePath: 'SuiteScripts/Metrodata/_me_cl_report_summary_item(button).js'
                    });

                    form.addButton({
                        id: 'button_report_transfer_order_excel',
                        label: 'Save As Excel (Transfer Order)',
                        functionName: 'reportByTransferOrdXML()',
                        // clientScriptModulePath: 'SuiteScripts/Metrodata/_me_cl_report_summary_item(button).js'
                    });

                    form.addButton({
                        id: 'button_report_purchase_order_pdf',
                        label: 'Save As PDF(Return Authorization)',
                        functionName: 'reportByReturnAuthorizationPDF()',
                        // clientScriptModulePath:  'SuiteScripts/Metrodata/_me_cl_report_summary_item(button).js'
                    });

                    form.addButton({
                        id: 'button_report_purchase_order',
                        label: 'Save As Excel(Return Authorization)',
                        functionName: 'reportByReturnAuthorizationOrder()',
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
/**
 *@NApiVersion 2.1
*@NScriptType ClientScript
*/
define(['N/runtime', 'N/currency'], function (runtime, currency) {

    function pageInit(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;
        log.debug('PageInit is triggered')
        var getRfqApprover = rec.getValue('custrecord_me_rfq_validator')

        var getCurrentUser = runtime.getCurrentUser().id;

        var isCheckedItemLine = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rfq_number_1',
            fieldId: 'custrecord_me_check_item'
        });
        var productNameF = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rfq_number_1',
            fieldId: 'custrecord_me_product_name'
        });
        var quantiyField = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rfq_number_1',
            fieldId: 'custrecord_me_quantity_item'
        });

        var isWinnerField = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rfq_number_2',
            fieldId: 'custrecord_me_check_wineer'
        });
        var discHeadField = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rfq_number_2',
            fieldId: 'custrecord_me_discount_header'
        });
        var totDiscField = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rfq_number_2',
            fieldId: 'custrecord_me_total_after_discount'
        });
        var vendorField = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rfq_number_2',
            fieldId: 'custrecord_me_vendor_list'
        });

        var discAmountF = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rf_number_3',
            fieldId: 'custrecord_me_discount_amount'
        });
        var isCalculatedF = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rf_number_3',
            fieldId: 'custrecord_me_is_calculated_rfq_prc_itm'
        });
        var percentageRateF = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rf_number_3',
            fieldId: 'custrecord_me_percentage_rate'
        });
        var productNameF3 = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rf_number_3',
            fieldId: 'custrecord_me_product_name_1'
        });
        var quantityField = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rf_number_3',
            fieldId: 'custrecord_me_quantity_1'
        });
        var totUnitPrcAfterDiscF = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rf_number_3',
            fieldId: 'custrecord_me_total_unit_price_after_dis'
        });
        var unitPrcF = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rf_number_3',
            fieldId: 'custrecord_me_unit_price_vendor'
        });
        var vendorF = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rf_number_3',
            fieldId: 'custrecord_me_vendor_1'
        });
        var unitPrcAfterDiscF = rec.getCurrentSublistField({
            sublistId: 'recmachcustrecord_me_rf_number_3',
            fieldId: 'custrecord_me_vendor_price_after_disc'
        });
        

        if (getRfqApprover == getCurrentUser) {
            
            isCheckedItemLine.isDisabled = true;
            productNameF.isDisabled = true;
            quantiyField.isDisabled = true;

            isWinnerField.isDisabled = false;
            discHeadField.isDisabled = true;
            totDiscField.isDisabled = true;
            vendorField.isDisabled = true;

            discAmountF.isDisabled = true;
            isCalculatedF.isDisabled = true;
            percentageRateF.isDisabled = true;
            productNameF3.isDisabled = true;
            quantityField.isDisabled = true;
            totUnitPrcAfterDiscF.isDisabled = true;
            unitPrcF.isDisabled = true;
            vendorF.isDisabled = true;
            unitPrcAfterDiscF.isDisabled = true;
        } else {

            isWinnerField.isDisabled = true;
        }
        log.debug('runtime.ContextType', runtime.ContextType)
    }

    function lineInit(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;
        if (sublistId == 'recmachcustrecord_me_rfq_number_1') {
            log.debug('lineinit1 ' + sublistId + ' | ' + runtime.executionContext)

            // for (let i = 0; i < getRfq1Line; i++) {

            var isCheckedItemLineRfqed = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_1',
                fieldId: 'custrecord_me_check_item'
            });
            var isRfqed = rec.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rfq_number_1',
                fieldId: 'custrecord_me_ue_is_rfqed'
            });
            
            if (isRfqed) {
                
                isCheckedItemLineRfqed.isDisabled = true;

            }else{
                isCheckedItemLineRfqed.isDisabled = false;
            }
        }

        if (sublistId == 'recmachcustrecord_me_rf_number_3') {
            log.debug('lineinit3 ' + sublistId + ' | ' + runtime.executionContext)

            var getRfqApprover = rec.getValue('custrecord_me_rfq_validator')

            var getCurrentUser = runtime.getCurrentUser().id;

            

            var isCheckedItemLine = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_1',
                fieldId: 'custrecord_me_check_item'
            });
            var productNameF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_1',
                fieldId: 'custrecord_me_product_name'
            });
            var quantiyField = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_1',
                fieldId: 'custrecord_me_quantity_item'
            });

            var isWinnerField = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_2',
                fieldId: 'custrecord_me_check_wineer'
            });
            var discHeadField = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_2',
                fieldId: 'custrecord_me_discount_header'
            });
            var totDiscField = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_2',
                fieldId: 'custrecord_me_total_after_discount'
            });
            var vendorField = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_2',
                fieldId: 'custrecord_me_vendor_list'
            });

            var discAmountF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_discount_amount'
            });
            var isCalculatedF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_is_calculated_rfq_prc_itm'
            });
            var percentageRateF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_percentage_rate'
            });
            var productNameF3 = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_product_name_1'
            });
            var quantityField = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_quantity_1'
            });
            var totUnitPrcAfterDiscF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_total_unit_price_after_dis'
            });
            var unitPrcF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_unit_price_vendor'
            });
            var vendorF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_vendor_1'
            });
            var unitPrcAfterDiscF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_vendor_price_after_disc'
            });
            var unitIsPercentFix = rec.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_is_fixed_percent'
            });
            var unitIsPercentFixF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_is_fixed_percent'
            });

            if (unitIsPercentFix == true || unitIsPercentFix == 'true') {
                percentageRateF.isDisabled = true;
            } else {
                percentageRateF.isDisabled = false;
            }
            
            if (getRfqApprover == getCurrentUser) {
                isCheckedItemLine.isDisabled = true;
                productNameF.isDisabled = true;
                quantiyField.isDisabled = true;

                isWinnerField.isDisabled = false;
                discHeadField.isDisabled = true;
                totDiscField.isDisabled = true;
                vendorField.isDisabled = true;

                discAmountF.isDisabled = true;
                isCalculatedF.isDisabled = true;
                percentageRateF.isDisabled = true;
                productNameF3.isDisabled = true;
                quantityField.isDisabled = true;
                totUnitPrcAfterDiscF.isDisabled = true;
                unitPrcF.isDisabled = true;
                vendorF.isDisabled = true;
                unitPrcAfterDiscF.isDisabled = true;
            } else {
               
                isWinnerField.isDisabled = true;
            }

            var IsCheckedItem = false;
            var getItemLine = rec.getLineCount('recmachcustrecord_me_rfq_number_1');

            
            var isCheckedItemLine = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_1',
                fieldId: 'custrecord_me_check_item'
            });
            var getQuantityF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_1',
                fieldId: 'custrecord_me_quantity_item'
            });
            var getDescF = rec.getCurrentSublistField({
                sublistId: 'recmachcustrecord_me_rfq_number_1',
                fieldId: 'custrecord_me_description_item'
            });
            
            var getIsRfqed = rec.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rfq_number_1',
                fieldId: 'custrecord_me_ue_is_rfqed'
            });

            
            if (getIsRfqed == true) {
                
                isCheckedItemLine.isDisabled = true;
                getQuantityF.isDisabled = true;
                getDescF.isDisabled = true;
            } else {
                
                isCheckedItemLine.isDisabled = false;
                getQuantityF.isDisabled = false;
                getDescF.isDisabled = false;
            }

        }
    }

    function sublistChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        var IsCheckedItem = false;
        var sublist_triggered = rec.getValue('custrecord_me_rfq_sublist_triggered')
        // log.debug('sublistchanged triggered ' + sublistId, sublist_triggered)
        var itemListArr = [];

        var vendorListArr = [];
        if (sublistId == 'recmachcustrecord_me_rfq_number_1' && !rec.getCurrentSublistValue({ sublistId: 'recmachcustrecord_me_rfq_number_1', fieldId: 'custrecord_me_ue_is_rfqed'}) && sublist_triggered != 'recmachcustrecord_me_rf_number_3') {
            var getItemLine = rec.getLineCount('recmachcustrecord_me_rfq_number_1');
            log.debug('sublistchanged1  ' + sublistId)

            for (let i = 0; i < getItemLine; i++) {
                var isCheckedItemLine = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_check_item',
                    line: i
                });
                
                var getProductName = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_product_name',
                    line: i
                });
                var getItemId = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_item_id',
                    line: i
                });
                var getQuantityItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_quantity_item',
                    line: i
                });
                if (isCheckedItemLine == true || isCheckedItemLine == 'true') {
                    IsCheckedItem = true;
                    itemListArr.push({
                        product_name: getProductName,
                        item_id: getItemId,
                        quantiy_item: getQuantityItem,
                        line: i
                    });
                }
            }
            
            var getVendorLine = rec.getLineCount('recmachcustrecord_me_rfq_number_2');

            for (let i = 0; i < getVendorLine; i++) {
                var getVendor = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_vendor_list',
                    line: i
                })
                var getDiscount = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_discount_header',
                    line: i
                })
                var getCurrVendor = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_curency_vendpr',
                    line: i
                })
                var getExrateVendor = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_exrate_vendor',
                    line: i
                })
                
                vendorListArr.push({
                    vendor: getVendor,
                    discount: getDiscount,
                    currency: getCurrVendor,
                    ex_rate: getExrateVendor,
                })    
            }

            for (let i = 0; i < vendorListArr.length; i++) {
                for (let j = 0; j < itemListArr.length; j++) {
                    rec.selectLine('recmachcustrecord_me_rf_number_3', j + (itemListArr.length * i))
                    var setProductName = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_product_name_1',
                        value: itemListArr[j].product_name,
                        ignoreFieldChange: true
                    });
                    
                    var setItemId = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_item_id_1',
                        value: itemListArr[j].item_id,
                        ignoreFieldChange: true
                    });
                    var setQuantity = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_quantity_1',
                        value: itemListArr[j].quantiy_item,
                        ignoreFieldChange: true
                    });
                    var setVendor = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_vendor_1',
                        value: vendorListArr[i].vendor,
                        ignoreFieldChange: true
                    });
                    var setCurrItmPrc = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_curr_item_prc',
                        value: vendorListArr[i].currency,
                        ignoreFieldChange: true
                    });
                    var setExRateItmPrc = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_ex_rate_itm_prc',
                        value: vendorListArr[i].ex_rate,
                        ignoreFieldChange: true
                    });
                    var getDiscount = rec.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_is_fixed_percent',
                        ignoreFieldChange: true
                    });
                    if (vendorListArr[i].discount) {
                        var setDiscount = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_percentage_rate',
                            value: vendorListArr[i].discount,
                            ignoreFieldChange: true
                            
                        });
                        var setDiscount = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_is_fixed_percent',
                            value: true,
                            ignoreFieldChange: true
                            
                        });
                    } else {
                        if (getDiscount) {
                            var setDiscount = rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_me_rf_number_3',
                                fieldId: 'custrecord_me_percentage_rate',
                                value: 0,
                                ignoreFieldChange: true
                                
                            });

                        }
                        var setDiscount = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_is_fixed_percent',
                            value: false,
                            ignoreFieldChange: true
                            
                        });
                    }
                    rec.commitLine({sublistId:'recmachcustrecord_me_rf_number_3', ignoreRecalc: true});
                }
            }
            rec.setValue('custrecord_me_rfq_sublist_triggered', '')



        }
        if (sublistId == 'recmachcustrecord_me_rfq_number_2' && (!rec.getValue('custrecord_me_refrech_chbx')) && (sublist_triggered != 'recmachcustrecord_me_rf_number_3')) {
            // log.debug('sublistchanged2 di triggered  ' + sublistId, runtime.executionContext)
            if(runtime.executionContext == 'USERINTERFACE'){
                log.debug('UI sublistschanged2  is triggered' + sublistId, {
                    sublistId: sublistId,
                    chbx: rec.getValue('custrecord_me_refrech_chbx'),
                    sublist_triggered: sublist_triggered
                })
                
                var getItemLine = rec.getLineCount('recmachcustrecord_me_rfq_number_1');
                for (let i = 0; i < getItemLine; i++) {
                    var isCheckedItemLine = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_check_item',
                        line: i
                    });
                    
                    var getProductName = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_product_name',
                        line: i
                    });
                    var getItemId = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_item_id',
                        line: i
                    });
                    var getQuantityItem = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_quantity_item',
                        line: i
                    });
                    if (isCheckedItemLine == true || isCheckedItemLine == 'true') {
                        IsCheckedItem = true;
                        itemListArr.push({
                            product_name: getProductName,
                            item_id: getItemId,
                            quantiy_item: getQuantityItem,
                            line: i
                        });
                    }
                }
    
                var getVendorLine = rec.getLineCount('recmachcustrecord_me_rfq_number_2');
    
                for (let i = 0; i < getVendorLine; i++) {
                    var getVendor = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_2',
                        fieldId: 'custrecord_me_vendor_list',
                        line: i
                    })
                    var getDiscount = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_2',
                        fieldId: 'custrecord_me_discount_header',
                        line: i
                    })
                    var getCurrVendor = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_2',
                        fieldId: 'custrecord_me_curency_vendpr',
                        line: i
                    })
                    var getExrateVendor = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_2',
                        fieldId: 'custrecord_me_exrate_vendor',
                        line: i
                    })
                    
                    vendorListArr.push({
                        vendor: getVendor,
                        discount: getDiscount,
                        currency: getCurrVendor,
                        ex_rate: getExrateVendor,
                    })
                    
                }
    
                for (let i = 0; i < vendorListArr.length; i++) {
                    log.debug('set value sublist 3 changed')
                    for (let j = 0; j < itemListArr.length; j++) {
                        rec.selectLine('recmachcustrecord_me_rf_number_3', j + (itemListArr.length * i))
                        var setProductName = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_product_name_1',
                            value: itemListArr[j].product_name,
                            ignoreFieldChange: true
                        });
                        
                        var setItemId = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_item_id_1',
                            value: itemListArr[j].item_id,
                            ignoreFieldChange: true
                        });
                        var setQuantity = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_quantity_1',
                            value: itemListArr[j].quantiy_item,
                            ignoreFieldChange: true
                        });
                        var setVendor = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_vendor_1',
                            value: vendorListArr[i].vendor,
                            ignoreFieldChange: true
                        });
                        var setCurrItmPrc = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_curr_item_prc',
                            value: vendorListArr[i].currency,
                            ignoreFieldChange: true
                        });
                        var setExRateItmPrc = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_ex_rate_itm_prc',
                            value: vendorListArr[i].ex_rate,
                            ignoreFieldChange: true
                        });
                        var getDiscount = rec.getCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_is_fixed_percent',
                            ignoreFieldChange: true
                        });
                        if (vendorListArr[i].discount) {
                            var setDiscount = rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_me_rf_number_3',
                                fieldId: 'custrecord_me_percentage_rate',
                                value: vendorListArr[i].discount,
                                ignoreFieldChange: true
                                
                            });
                            var setDiscount = rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_me_rf_number_3',
                                fieldId: 'custrecord_me_is_fixed_percent',
                                value: true,
                                ignoreFieldChange: true
                                
                            });
                        } else {
                            if (getDiscount) {
                                var setDiscount = rec.setCurrentSublistValue({
                                    sublistId: 'recmachcustrecord_me_rf_number_3',
                                    fieldId: 'custrecord_me_percentage_rate',
                                    value: 0,
                                    ignoreFieldChange: true
                                    
                                });
    
                            }
                            var setDiscount = rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_me_rf_number_3',
                                fieldId: 'custrecord_me_is_fixed_percent',
                                value: false,
                                ignoreFieldChange: true
                                
                            });
                        }
                        
                        rec.commitLine({sublistId:'recmachcustrecord_me_rf_number_3', ignoreRecalc: true});
                    }
                }
                rec.setValue('custrecord_me_rfq_sublist_triggered', '')
    
                var getItmPrcLine = rec.getLineCount('recmachcustrecord_me_rf_number_3');
                
                for (let i = 0; i < getItmPrcLine; i++) {
                    rec.selectLine('recmachcustrecord_me_rf_number_3', i)
                    var getVendorItemRemove = rec.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_product_name_1',
                    });
                    
                    if (!getVendorItemRemove) {
                        rec.removeLine({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            line: i,
                            ignoreRecalc: true
                        });
                    }
                }

            } 
        }
        var totalEachVendorArr = []
        if (sublistId == 'recmachcustrecord_me_rf_number_3' && rec.getCurrentSublistValue({ sublistId: 'recmachcustrecord_me_rf_number_3', fieldId: 'custrecord_me_total_unit_price_after_dis' }) && !rec.getValue('custrecord_me_refrech_chbx') && sublistId == sublist_triggered) {
            // log.debug('sublistchanged333 di triggered  ' + sublistId, runtime.executionContext)
            if(runtime.executionContext == 'USERINTERFACE'){
                log.debug('sublistchanged333 UIUIUI di triggered  ' + sublistId, runtime.executionContext)
                var getPriceLine = rec.getLineCount('recmachcustrecord_me_rf_number_3');
                for (let i = 0; i < getPriceLine; i++) {
                    var getVendorItem = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_vendor_1',
                        line: i,
                    });
                    var getAmountItem = Number(rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_total_unit_price_after_dis',
                        line: i,
                    }));

                    if (totalEachVendorArr.some((data) => data.vendor == getVendorItem)) {


                        for (let j = 0; j < totalEachVendorArr.length; j++) {
                            if (getVendorItem == totalEachVendorArr[j].vendor) {
                                totalEachVendorArr[j].amount_item += Number(getAmountItem);
                                totalEachVendorArr[j].line += ',' + String(i);
                            }
                        }
                    } else {
                        totalEachVendorArr.push({
                            vendor: getVendorItem,
                            amount_item: getAmountItem,
                            line: String(i),
                        });
                    }
                }
                var getVendorLineCount = rec.getLineCount('recmachcustrecord_me_rfq_number_2');
                log.debug('totalEachVendorArr', totalEachVendorArr)

                for (let i = 0; i < getVendorLineCount; i++) {
                    var getVendorMaster = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_2',
                        fieldId: 'custrecord_me_vendor_list',
                        line: i
                    });
                    var getEquivalentVendor = totalEachVendorArr.filter((data) => data.vendor == getVendorMaster && Number(data.amount_item !== 0));
                    
                    var getVendorItmPrc = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_is_calculated_rfq_prc_itm',
                        value: true,
                        ignoreFieldChange: true
                    })
                    
                    if (getEquivalentVendor.length > 0) {
                        rec.selectLine('recmachcustrecord_me_rfq_number_2', i)
                        
                        var setVendorMaster = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rfq_number_2',
                            fieldId: 'custrecord_me_total_after_discount',
                            value: getEquivalentVendor[0].amount_item,
                            line: i,
                            // ignoreFieldChange: true
                        })
                        rec.commitLine({sublistId:'recmachcustrecord_me_rfq_number_2', ignoreRecalc: true})
                        log.debug('total amount vendor di sublist 2 di set dari sublistchanged 3 ' + i, {
                            vendor: getVendorMaster,
                            getEquivalentVendor: getEquivalentVendor,
                            getVendorItmPrc: getVendorItmPrc,
                            setVendorMaster: rec.getCurrentSublistValue('recmachcustrecord_me_rfq_number_2', 'custrecord_me_total_after_discount')
                        })
                    }       
                }

                rec.setValue('custrecord_me_rfq_sublist_triggered', '')

            }
        }

    }

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        var getCurrency = rec.getValue('custrecord_me_rfq_currency');
        var getDate = rec.getValue('custrecord_me_rfq_date');

        if (fieldId == 'custrecord_me_rfq_currency' || fieldId == 'custrecord_me_rfq_date') {
            log.debug('fieldchanged di triggered  ' + sublistId + ' <s | f> ' + fieldId, runtime.executionContext)
            var rate = currency.exchangeRate({
                source: getCurrency,
                target: 'USD',
                date: new Date(getDate),
            });
            var setRate = rec.setValue('custrecord_me_ex_rates_rfq', rate);
        }
        if (fieldId == 'custrecord_me_curency_vendpr') {
            log.debug('fieldchanged di triggered  ' + sublistId + ' <s | f> ' + fieldId, runtime.executionContext)
            var getCurrencyVendor = rec.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rfq_number_2' ,
                fieldId: 'custrecord_me_curency_vendpr', 
                // value: rate
            });
            var rateVend = currency.exchangeRate({
                source: getCurrencyVendor,
                target: 'USD',
                date: new Date(getDate),
            });
            var setRateVendor = rec.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rfq_number_2' ,
                fieldId: 'custrecord_me_exrate_vendor', 
                value: rateVend,
                ignoreFieldChange: true
            });
        }
        

        if ((sublistId == 'recmachcustrecord_me_rf_number_3' && (fieldId == 'custrecord_me_unit_price_vendor' || fieldId == 'custrecord_me_percentage_rate' || fieldId == 'custrecord_me_is_fixed_percent'))) {
            log.debug('fieldchanged di triggered  ' + sublistId + ' <s | f> ' + fieldId, runtime.executionContext)
            var getVendorPrc = rec.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_unit_price_vendor',
            });
            var getQuantity = rec.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_quantity_1',
            });

            var getDiscountPercent = rec.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_percentage_rate',
            });

            if (!getDiscountPercent) {
                getDiscountPercent = 0;
            }

            var getDiscountAmount = Number(getVendorPrc) * (Number(getDiscountPercent / 100));

            var getVendorPriceAfterDisc = Number(getVendorPrc) - Number(getDiscountAmount);

            var getTotalItemPriceAfterDisc = getVendorPriceAfterDisc * getQuantity;

            var setDiscountAmount = rec.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_discount_amount',
                value: getDiscountAmount,
                ignoreFieldChange: true,
            });

            var setItmPrcAfterDisc = rec.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_vendor_price_after_disc',
                value: getVendorPriceAfterDisc,
                ignoreFieldChange: true,
            });
            var setTotalItmPrcAfterDisc = rec.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_total_unit_price_after_dis',
                value: getTotalItemPriceAfterDisc,
                ignoreFieldChange: true,
            });
            var getVendorItmPrc = rec.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_is_calculated_rfq_prc_itm',
                value: false,
                ignoreFieldChange: true,
                // line: j
            })
            var getCurrencyItmPrc = rec.getCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3' ,
                fieldId: 'custrecord_me_curr_item_prc', 
                // value: rate
            });
            var rateItmPrc = currency.exchangeRate({
                source: getCurrencyItmPrc,
                target: 'USD',
                date: new Date(getDate),
            });
            var setRateItmPrc = rec.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3' ,
                fieldId: 'custrecord_me_ex_rate_itm_prc', 
                value: rateItmPrc,
                ignoreFieldChange: true
            });
        }

        if (fieldId == 'custrecord_me_mark_all_item') {
            rec.setValue('custrecord_me_rfq_sublist_triggered', '')
            var getPriceLine = rec.getLineCount('recmachcustrecord_me_rf_number_3');
            var getItemLine = rec.getLineCount('recmachcustrecord_me_rfq_number_1');
            if (rec.getValue('custrecord_me_mark_all_item') == true || rec.getValue('custrecord_me_mark_all_item') == 'true') {
                for (let i = 0; i < getItemLine; i++) {
                    rec.selectLine('recmachcustrecord_me_rfq_number_1', i)
                    var setCheckItem = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_check_item',
                        value: true,
                    })
                    rec.commitLine('recmachcustrecord_me_rfq_number_1', i)
                }
            }else{
                for (let i = 0; i < getItemLine; i++) {
                    rec.selectLine('recmachcustrecord_me_rfq_number_1', i)
                    var setCheckItem = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_check_item',
                        value: false,
                    })
                    rec.commitLine('recmachcustrecord_me_rfq_number_1', i)
                }
                for (let i = getPriceLine-1; i >= 0; i--) {
                    // rec.selectLine('recmachcustrecord_me_rf_number_3',i)
                    // var getVendorItem = rec.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_rf_number_3',
                    //     fieldId: 'custrecord_me_vendor_1',
                    //     line: i
                    // });
                    // if (!getVendorItem) {
                        rec.removeLine({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            line: i,
                            // ignoreRecalc: true
                        });
                    // }
        
                }
            }
        }

        if (fieldId == 'custrecord_me_refrech_chbx' && rec.getValue('custrecord_me_refrech_chbx')) {

            // Subtab Item(PR)
            var getItemLine = rec.getLineCount('recmachcustrecord_me_rfq_number_1');
            log.debug('sublistchanged1  ' + sublistId)
            var itemListArr = [];
            var vendorListArr = [];

            for (let i = 0; i < getItemLine; i++) {
                var isCheckedItemLine = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_check_item',
                    line: i
                });
                
                var getProductName = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_product_name',
                    line: i
                });
                var getItemId = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_item_id',
                    line: i
                });
                var getQuantityItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_quantity_item',
                    line: i
                });
                if (isCheckedItemLine == true || isCheckedItemLine == 'true') {
                    IsCheckedItem = true;
                    itemListArr.push({
                        product_name: getProductName,
                        item_id: getItemId,
                        quantiy_item: getQuantityItem,
                        line: i
                    });
                }
            }
            
            var getVendorLine = rec.getLineCount('recmachcustrecord_me_rfq_number_2');

            for (let i = 0; i < getVendorLine; i++) {
                var getVendor = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_vendor_list',
                    line: i
                })
                var getDiscount = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_discount_header',
                    line: i
                })
                var getCurrVendor = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_curency_vendpr',
                    line: i
                })
                var getExrateVendor = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_exrate_vendor',
                    line: i
                })
                
                vendorListArr.push({
                    vendor: getVendor,
                    discount: getDiscount,
                    currency: getCurrVendor,
                    ex_rate: getExrateVendor,
                })    
            }

            for (let i = 0; i < vendorListArr.length; i++) {
                for (let j = 0; j < itemListArr.length; j++) {
                    rec.selectLine('recmachcustrecord_me_rf_number_3', j + (itemListArr.length * i))
                    var setProductName = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_product_name_1',
                        value: itemListArr[j].product_name,
                        ignoreFieldChange: true
                    });
                    
                    var setItemId = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_item_id_1',
                        value: itemListArr[j].item_id,
                        ignoreFieldChange: true
                    });
                    var setQuantity = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_quantity_1',
                        value: itemListArr[j].quantiy_item,
                        ignoreFieldChange: true
                    });
                    var setVendor = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_vendor_1',
                        value: vendorListArr[i].vendor,
                        ignoreFieldChange: true
                    });
                    var setCurrItmPrc = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_curr_item_prc',
                        value: vendorListArr[i].currency,
                        ignoreFieldChange: true
                    });
                    var setExRateItmPrc = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_ex_rate_itm_prc',
                        value: vendorListArr[i].ex_rate,
                        ignoreFieldChange: true
                    });
                    var getDiscount = rec.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_is_fixed_percent',
                        ignoreFieldChange: true
                    });
                    if (vendorListArr[i].discount) {
                        var setDiscount = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_percentage_rate',
                            value: vendorListArr[i].discount,
                            ignoreFieldChange: true
                            
                        });
                        var setDiscount = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_is_fixed_percent',
                            value: true,
                            ignoreFieldChange: true
                            
                        });
                    } else {
                        if (getDiscount) {
                            var setDiscount = rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_me_rf_number_3',
                                fieldId: 'custrecord_me_percentage_rate',
                                value: 0,
                                ignoreFieldChange: true
                                
                            });

                        }
                        var setDiscount = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_is_fixed_percent',
                            value: false,
                            ignoreFieldChange: true
                            
                        });
                    }
                    rec.commitLine({sublistId:'recmachcustrecord_me_rf_number_3', ignoreRecalc: true});
                }
            }
            //end
            rec.setValue('custrecord_me_rfq_sublist_triggered', '')

            rec.setValue('custrecord_me_rfq_sublist_triggered', '')
            log.debug('fieldchanged di triggered  ' + sublistId + ' <s | f> ' + fieldId, runtime.executionContext)
            var totalEachVendorArr = []
            var getItmPrcLn = rec.getLineCount('recmachcustrecord_me_rf_number_3');

            var getPriceLine = rec.getLineCount('recmachcustrecord_me_rf_number_3');
            
            for (let i = 0; i < getPriceLine; i++) {
                var getVendorItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_vendor_1',
                    line: i,
                });
                var getAmountItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_total_unit_price_after_dis',
                    line: i,
                });

                if (totalEachVendorArr.some((data) => data.vendor == getVendorItem)) {


                    for (let j = 0; j < totalEachVendorArr.length; j++) {
                        if (getVendorItem == totalEachVendorArr[j].vendor) {
                            totalEachVendorArr[j].amount_item += Number(getAmountItem);
                            totalEachVendorArr[j].line += ',' + String(i);
                        }
                    }
                } else {
                    totalEachVendorArr.push({
                        vendor: getVendorItem,
                        amount_item: getAmountItem,
                        line: String(i),
                    });
                }
                // ini calculate ulang semua value di Price (item & vendor) subtab

                rec.selectLine('recmachcustrecord_me_rf_number_3', i)
                var getQuantityItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_quantity_1',
                    line: i,
                });
                var getVendorPrice = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_unit_price_vendor',
                    line: i,
                });
                var getDiscount = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_percentage_rate',
                    line: i,
                });

                var getDiscoutAmount = Number(getVendorPrice) * ((getDiscount ? Number(getDiscount) : 0) / 100)

                var setDiscountAmt = rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_discount_amount',
                    line: i,
                    value: getDiscoutAmount
                });
                var setAmountAftrDisc = rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_vendor_price_after_disc',
                    line: i,
                    value: Number(getVendorPrice) - getDiscoutAmount
                });
                var setAmountFinal = rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_total_unit_price_after_dis',
                    line: i,
                    value: (Number(getVendorPrice) - getDiscoutAmount) * Number(getQuantityItem)
                });
                rec.commitLine('recmachcustrecord_me_rf_number_3', i)
            }

            var getVendorLineCount = rec.getLineCount('recmachcustrecord_me_rfq_number_2');
            for (let i = 0; i < getVendorLineCount; i++) {
                var getVendorMaster = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_vendor_list',
                    line: i
                });
                var getEquivalentVendor = totalEachVendorArr.filter((data) => data.vendor == getVendorMaster);
                
                var getVendorItmPrc = rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_is_calculated_rfq_prc_itm',
                    value: true,
                    ignoreFieldChange: true
                })
                if (getEquivalentVendor.length > 0) {
                    rec.selectLine('recmachcustrecord_me_rfq_number_2', i)
                    
                    var setVendorMaster = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_2',
                        fieldId: 'custrecord_me_total_after_discount',
                        value: getEquivalentVendor[0].amount_item,
                        line: i,
                        // ignoreFieldChange: true
                    })
                    rec.commitLine({sublistId:'recmachcustrecord_me_rfq_number_2'});
                    log.debug('total amount vendor di sublist 2 di set dari fieldchanged custrecord_me_refrech_chbx')
                }           
            }

            

            for (let i = getPriceLine - 1; i >= 0; i--) {
                rec.selectLine('recmachcustrecord_me_rf_number_3',i)
                var getVendorItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_vendor_1',
                    line: i
                });
                if (!getVendorItem) {
                    rec.removeLine({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        line: i,
                        // ignoreRecalc: true
                    });
                }
    
            }
            rec.setValue('custrecord_me_refrech_chbx', false)
        }
        
    }

    function validateLine(context){
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        if(sublistId == 'recmachcustrecord_me_rf_number_3'){
            var index = rec.getCurrentSublistIndex(sublistId)
            rec.setCurrentSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_is_calculated_rfq_prc_itm',
                value: true,
                ignoreFieldChange: true
            })
            rec.setValue('custrecord_me_rfq_sublist_triggered', sublistId)
            log.debug('validateLine triggered ' + sublistId + ' | ' + index, rec.getValue('custrecord_me_rfq_sublist_triggered'))
            
        }
        return true
    }
    function saveRecord(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;
        log.debug('rec.getValue(custrecord_me_refrech_chbx)',rec.getValue('custrecord_me_refrech_chbx'))
        // if (!rec.getValue('custrecord_me_refrech_chbx')) {
        //     throw error.create({
        //         name: 'UNCHECKED_CONFIRMED',
        //         message: 'Please Check confirm checkbox before saving'
        //     });
        //     return false
        // }
        rec.setValue('custrecord_me_refrech_chbx', true)
        // if (rec.getValue('custrecord_me_refrech_chbx')) {

            // Subtab Item(PR)
            var getItemLine = rec.getLineCount('recmachcustrecord_me_rfq_number_1');
            log.debug('sublistchanged1  ' + sublistId)
            var itemListArr = [];
            var vendorListArr = [];

            for (let i = 0; i < getItemLine; i++) {
                var isCheckedItemLine = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_check_item',
                    line: i
                });
                
                var getProductName = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_product_name',
                    line: i
                });
                var getItemId = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_item_id',
                    line: i
                });
                var getQuantityItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_quantity_item',
                    line: i
                });
                if (isCheckedItemLine == true || isCheckedItemLine == 'true') {
                    IsCheckedItem = true;
                    itemListArr.push({
                        product_name: getProductName,
                        item_id: getItemId,
                        quantiy_item: getQuantityItem,
                        line: i
                    });
                }
            }
            
            var getVendorLine = rec.getLineCount('recmachcustrecord_me_rfq_number_2');

            for (let i = 0; i < getVendorLine; i++) {
                var getVendor = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_vendor_list',
                    line: i
                })
                var getDiscount = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_discount_header',
                    line: i
                })
                var getCurrVendor = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_curency_vendpr',
                    line: i
                })
                var getExrateVendor = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_exrate_vendor',
                    line: i
                })
                
                vendorListArr.push({
                    vendor: getVendor,
                    discount: getDiscount,
                    currency: getCurrVendor,
                    ex_rate: getExrateVendor,
                })    
            }

            for (let i = 0; i < vendorListArr.length; i++) {
                for (let j = 0; j < itemListArr.length; j++) {
                    rec.selectLine('recmachcustrecord_me_rf_number_3', j + (itemListArr.length * i))
                    var setProductName = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_product_name_1',
                        value: itemListArr[j].product_name,
                        ignoreFieldChange: true
                    });
                    
                    var setItemId = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_item_id_1',
                        value: itemListArr[j].item_id,
                        ignoreFieldChange: true
                    });
                    var setQuantity = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_quantity_1',
                        value: itemListArr[j].quantiy_item,
                        ignoreFieldChange: true
                    });
                    var setVendor = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_vendor_1',
                        value: vendorListArr[i].vendor,
                        ignoreFieldChange: true
                    });
                    var setCurrItmPrc = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_curr_item_prc',
                        value: vendorListArr[i].currency,
                        ignoreFieldChange: true
                    });
                    var setExRateItmPrc = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_ex_rate_itm_prc',
                        value: vendorListArr[i].ex_rate,
                        ignoreFieldChange: true
                    });
                    var getDiscount = rec.getCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        fieldId: 'custrecord_me_is_fixed_percent',
                        ignoreFieldChange: true
                    });
                    if (vendorListArr[i].discount) {
                        var setDiscount = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_percentage_rate',
                            value: vendorListArr[i].discount,
                            ignoreFieldChange: true
                            
                        });
                        var setDiscount = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_is_fixed_percent',
                            value: true,
                            ignoreFieldChange: true
                            
                        });
                    } else {
                        if (getDiscount) {
                            var setDiscount = rec.setCurrentSublistValue({
                                sublistId: 'recmachcustrecord_me_rf_number_3',
                                fieldId: 'custrecord_me_percentage_rate',
                                value: 0,
                                ignoreFieldChange: true
                                
                            });

                        }
                        var setDiscount = rec.setCurrentSublistValue({
                            sublistId: 'recmachcustrecord_me_rf_number_3',
                            fieldId: 'custrecord_me_is_fixed_percent',
                            value: false,
                            ignoreFieldChange: true
                            
                        });
                    }
                    rec.commitLine({sublistId:'recmachcustrecord_me_rf_number_3', ignoreRecalc: true});
                }
            }
            //end
            rec.setValue('custrecord_me_rfq_sublist_triggered', '')

            rec.setValue('custrecord_me_rfq_sublist_triggered', '')
            log.debug('fieldchanged di triggered  ' + sublistId + ' <s | f> ' + fieldId, runtime.executionContext)
            var totalEachVendorArr = []
            var getItmPrcLn = rec.getLineCount('recmachcustrecord_me_rf_number_3');

            var getPriceLine = rec.getLineCount('recmachcustrecord_me_rf_number_3');
            
            for (let i = 0; i < getPriceLine; i++) {
                var getVendorItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_vendor_1',
                    line: i,
                });
                var getAmountItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_total_unit_price_after_dis',
                    line: i,
                });

                if (totalEachVendorArr.some((data) => data.vendor == getVendorItem)) {


                    for (let j = 0; j < totalEachVendorArr.length; j++) {
                        if (getVendorItem == totalEachVendorArr[j].vendor) {
                            totalEachVendorArr[j].amount_item += Number(getAmountItem);
                            totalEachVendorArr[j].line += ',' + String(i);
                        }
                    }
                } else {
                    totalEachVendorArr.push({
                        vendor: getVendorItem,
                        amount_item: getAmountItem,
                        line: String(i),
                    });
                }
                // ini calculate ulang semua value di Price (item & vendor) subtab

                rec.selectLine('recmachcustrecord_me_rf_number_3', i)
                var getQuantityItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_quantity_1',
                    line: i,
                });
                var getVendorPrice = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_unit_price_vendor',
                    line: i,
                });
                var getDiscount = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_percentage_rate',
                    line: i,
                });

                var getDiscoutAmount = Number(getVendorPrice) * ((getDiscount ? Number(getDiscount) : 0) / 100)

                var setDiscountAmt = rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_discount_amount',
                    line: i,
                    value: getDiscoutAmount
                });
                var setAmountAftrDisc = rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_vendor_price_after_disc',
                    line: i,
                    value: Number(getVendorPrice) - getDiscoutAmount
                });
                var setAmountFinal = rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_total_unit_price_after_dis',
                    line: i,
                    value: (Number(getVendorPrice) - getDiscoutAmount) * Number(getQuantityItem)
                });
                rec.commitLine('recmachcustrecord_me_rf_number_3', i)
            }

            var getVendorLineCount = rec.getLineCount('recmachcustrecord_me_rfq_number_2');
            for (let i = 0; i < getVendorLineCount; i++) {
                var getVendorMaster = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_vendor_list',
                    line: i
                });
                var getEquivalentVendor = totalEachVendorArr.filter((data) => data.vendor == getVendorMaster);
                
                var getVendorItmPrc = rec.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_is_calculated_rfq_prc_itm',
                    value: true,
                    ignoreFieldChange: true
                })
                if (getEquivalentVendor.length > 0) {
                    rec.selectLine('recmachcustrecord_me_rfq_number_2', i)
                    
                    var setVendorMaster = rec.setCurrentSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_2',
                        fieldId: 'custrecord_me_total_after_discount',
                        value: getEquivalentVendor[0].amount_item,
                        line: i,
                        // ignoreFieldChange: true
                    })
                    rec.commitLine({sublistId:'recmachcustrecord_me_rfq_number_2'});
                    log.debug('total amount vendor di sublist 2 di set dari fieldchanged custrecord_me_refrech_chbx')
                }           
            }

            

            for (let i = getPriceLine - 1; i >= 0; i--) {
                rec.selectLine('recmachcustrecord_me_rf_number_3',i)
                var getVendorItem = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_vendor_1',
                    line: i
                });
                if (!getVendorItem) {
                    rec.removeLine({
                        sublistId: 'recmachcustrecord_me_rf_number_3',
                        line: i,
                        // ignoreRecalc: true
                    });
                }
    
            }
            rec.setValue('custrecord_me_refrech_chbx', false)
        // }
        return true;
    }

    return {
        lineInit: lineInit,
        sublistChanged: sublistChanged,
        fieldChanged: fieldChanged,
        pageInit: pageInit,
        validateLine: validateLine,
        saveRecord: saveRecord
    }
});

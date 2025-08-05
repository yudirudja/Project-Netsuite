/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/record", "N/url", "./config/me_config_yudi.js", "N/ui/serverWidget"], function (runtime, record, url, config, serverWidget) {

    function beforeLoad(context) {


        if (context.type == 'view') {
            var hideFld = context.form.addField({
                id: 'custpage_hide_buttons',
                label: 'not shown - hidden',
                type: serverWidget.FieldType.INLINEHTML
            });
            var scr = "";
            scr += `jQuery("a.dottedlink:contains('Remove')").hide();`;
            scr += `jQuery("a.dottedlink:contains('Edit')").hide();`;
            scr += `jQuery(".listheader:contains('Remove')").hide();`;
            scr += `jQuery(".listheader:contains('Edit')").hide();`;


            hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
        }
        // var scr = "";
        if (context.type = 'create') {


            // log.debug("Remaining governance Total Before Load : " + runtime.getCurrentScript().getRemainingUsage());
            try {
                var newRec = context.newRecord



                var prNumber = context.request.parameters.custrecord_me_pr_number;
                var prDate = context.request.parameters.custrecord_me_pr_date;
                var businessUnit = context.request.parameters.custrecord_me_rfq_business_unit;
                var department = context.request.parameters.custrecord_me_rfq_department;
                var location = context.request.parameters.custrecord_me_rfq_location;
                var purchasing_approver = context.request.parameters.custrecord_me_rfq_validator;
                var deliver_date = context.request.parameters.custrecord_me_delivery_date;
                var memo = context.request.parameters.custrecord_me_rfq_memo;
                log.debug('prNumber', prNumber)
                log.debug('prDate', prDate)
                log.debug('businessUnit', businessUnit)
                log.debug('department', department)
                log.debug('location', location)
                log.debug('memo', memo)
                log.debug('purchasing_approver', purchasing_approver)

                var setPrNumber = newRec.setValue('custrecord_me_pr_number', prNumber);
                // var setPrDate = newRec.setValue('custrecord_me_pr_date', prDate);
                // var setBusinessUnit = newRec.setValue('custrecord_me_rfq_business_unit', businessUnit);
                // var setDepartment = newRec.setValue('custrecord_me_rfq_department', department);
                var setLocation = newRec.setValue('custrecord_me_rfq_location', location);
                // var setPurchasing = newRec.setValue('custrecord_me_rfq_validator', purchasing_approver);
                // var setDelDate = newRec.setValue('custrecord_me_rfq_validator', deliver_date);
                // var setMemo = newRec.setText('custrecord_me_rfq_validator', memo);

                var loadPr = record.load({
                    type: record.Type.PURCHASE_REQUISITION,
                    id: prNumber,
                });

                var getPrItemLine = loadPr.getLineCount('item');
                var prItemArr = [];

                for (let i = 0; i < getPrItemLine; i++) {
                    var getItem = loadPr.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i,
                    });

                    var getItemId = loadPr.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_item_id',
                        line: i,
                    });
                    var getQuantity = loadPr.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i,
                    });
                    var getDescription = loadPr.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: i,
                    });
                    var getRfq = loadPr.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_rfq_number',
                        line: i,
                    });

                    prItemArr.push({
                        item: getItem,
                        item_id: getItemId,
                        quantity: getQuantity,
                        description: getDescription,
                        rfq: getRfq,
                    });
                }

                log.debug('prItemArr', prItemArr);

                for (let i = 0; i < prItemArr.length; i++) {
                    var setItem = newRec.setSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_product_name',
                        value: prItemArr[i].item,
                        line: i,
                    });
                    var setItemId = newRec.setSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_item_id',
                        value: prItemArr[i].item_id,
                        line: i,
                    });
                    var setQuantity = newRec.setSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_quantity_item',
                        value: prItemArr[i].quantity,
                        line: i,
                    });
                    var setDescription = newRec.setSublistValue({
                        sublistId: 'recmachcustrecord_me_rfq_number_1',
                        fieldId: 'custrecord_me_description_item',
                        value: prItemArr[i].description,
                        line: i,
                    });
                    if (prItemArr[i].rfq) {
                        var setDescription = newRec.setSublistValue({
                            sublistId: 'recmachcustrecord_me_rfq_number_1',
                            fieldId: 'custrecord_me_ue_is_rfqed',
                            value: true,
                            line: i,
                        });
                    } else {
                        var setDescription = newRec.setSublistValue({
                            sublistId: 'recmachcustrecord_me_rfq_number_1',
                            fieldId: 'custrecord_me_ue_is_rfqed',
                            value: false,
                            line: i,
                        });
                    }
                }

                log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
            } catch (error) {

            }
        }
    }

    function beforeSubmit(context) {
        var rec = context.newRecord;

        var getPrNumber = rec.getValue('custrecord_me_pr_number');

        var getPrcItemLine1 = rec.getLineCount('recmachcustrecord_me_rfq_number_1');
        // var getPrcItemLine = rec.getLineCount('recmachcustrecord_me_rf_number_3');

        // for (let i = 0; i < getPrcItemLine; i++) {
        //     var getProductName = rec.getSublistValue({
        //         sublistId: 'recmachcustrecord_me_rf_number_3',
        //         fieldId: 'custrecord_me_product_name_1',
        //         line: i,
        //     });

        //     if (!getProductName) {
        //         rec.removeLine({
        //             sublistId: 'recmachcustrecord_me_rf_number_3',
        //             line: i,
        //             ignoreRecalc: true
        //         });
        //     }
        // }

        var getVendorMasterLine = rec.getLineCount('recmachcustrecord_me_rfq_number_2')
        var vendorWinner = [];

        for (let i = 0; i < getVendorMasterLine; i++) {
            var checkIsWinner = rec.getSublistValue({
                sublistId: 'recmachcustrecord_me_rfq_number_2',
                fieldId: 'custrecord_me_check_wineer',
                line: i,
            });
            if (checkIsWinner == true || checkIsWinner == 'true') {
                var getVendorId = rec.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_vendor_list',
                    line: i,
                });
                vendorWinner.push(getVendorId)
            }
        }
        if (vendorWinner.length == 1) {
            var setIsWinnerSelected = rec.setValue('custrecord_me_winner_selected', true)
        } else if (vendorWinner.length > 1) {
            throw "Anda Hanya Bisa Memilih 1 Pemenang"
        }
    }

    function afterSubmit(context) {
        var rec = context.newRecord;
        var recId = rec.id;

        var loadRfq = record.load({
            type: 'customrecord_me_csrec_rfq',
            id: recId,
        });

        var getRfqStatus = loadRfq.getText('custrecord_me_rfq_status');

        var getPrcItemLine = loadRfq.getLineCount('recmachcustrecord_me_rf_number_3');

        for (let i = 0; i < getPrcItemLine; i++) {
            var getProductName = loadRfq.getSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_product_name_1',
                line: i,
            });
            var getId = loadRfq.getSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'id',
                line: i,
            });

            if (!getProductName) {

                record.delete({
                    type: 'customrecord_me_csrec_rfq_child_3',
                    id: getId,
                });
                // loadRfq.removeLine({
                //     sublistId: 'recmachcustrecord_me_rf_number_3',
                //     line: i,
                //     ignoreRecalc: true
                // });
            }
        }

        var getPrNumber = loadRfq.getValue('custrecord_me_pr_number');
        // var getExchageRate = loadRfq.getValue('custrecord_me_ex_rates_rfq');
        var getCurr = loadRfq.getValue('custrecord_me_rfq_currency');


        var loadPr = record.load({
            type: record.Type.PURCHASE_REQUISITION,
            id: getPrNumber,
            isDynamic: true,
        });

        var getVendorMasterLine = loadRfq.getLineCount('recmachcustrecord_me_rfq_number_2')
        var vendorWinner = '';

        for (let i = 0; i < getVendorMasterLine; i++) {
            var checkIsWinner = loadRfq.getSublistValue({
                sublistId: 'recmachcustrecord_me_rfq_number_2',
                fieldId: 'custrecord_me_check_wineer',
                line: i,
            });
            if (checkIsWinner == true || checkIsWinner == 'true') {
                var getVendorId = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_2',
                    fieldId: 'custrecord_me_vendor_list',
                    line: i,
                });
                vendorWinner = getVendorId;
                break;
            }

        }

        var getItmPrcLine = loadRfq.getLineCount('recmachcustrecord_me_rf_number_3')
        var itemWinner = [];

        for (let i = 0; i < getItmPrcLine; i++) {
            var getVendorItemWinner = loadRfq.getSublistValue({
                sublistId: 'recmachcustrecord_me_rf_number_3',
                fieldId: 'custrecord_me_vendor_1',
                line: i,
            });

            if (vendorWinner == getVendorItemWinner) {
                var getItem = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_product_name_1',
                    line: i,
                });
                var getPrcBforeDisc = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_unit_price_vendor',
                    line: i,
                });
                var getPrcAftrDisc = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_vendor_price_after_disc',
                    line: i,
                });
                var getTotPrcAftrDisc = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_total_unit_price_after_dis',
                    line: i,
                });
                var getDiscAmount = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_discount_amount',
                    line: i,
                });
                var getDiscRate = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_percentage_rate',
                    line: i,
                });
                var getCurrRfqItmPrc = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_curr_item_prc',
                    line: i,
                });
                var getExRateItmPrc = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_ex_rate_itm_prc',
                    line: i,
                });
                var getQtyItm = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rf_number_3',
                    fieldId: 'custrecord_me_quantity_1',
                    line: i,
                });
                itemWinner.push({
                    item_id: getItem,
                    price_before_disc: getPrcBforeDisc,
                    price_after_disc: getPrcAftrDisc,
                    total_price_after_disc: getTotPrcAftrDisc,
                    discount_amount: getDiscAmount,
                    discount_rate: getDiscRate,
                    currency: getCurrRfqItmPrc,
                    ex_rate: getExRateItmPrc,
                    quantity: getQtyItm,
                })
            }

        }

        log.debug('itemWinner.length', itemWinner.length)

        var getPrItemLine = loadPr.getLineCount('item');
        log.debug('getPrItemLine',getPrItemLine)
        var getVendorMstrLine = loadRfq.getLineCount('recmachcustrecord_me_rfq_number_1');
        try {
            for (let i = 0; i < getVendorMstrLine; i++) {
                var getCheckedItem = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_check_item',
                    line: i,
                });
                var getItem = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_product_name',
                    line: i,
                });
                var getQuantityItem = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_quantity_item',
                    line: i,
                });
                var getItemIsRfqed = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_ue_is_rfqed',
                    line: i,
                });
                log.debug('item',getItem)

                for (let j = 0; j < getPrItemLine; j++) {
                    log.debug('item in loop',getItem)
                    loadPr.selectLine('item', j)
                    var getItemPr = loadPr.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: j,
                    });
                    if (getCheckedItem && itemWinner.length > 0) {
                        if (getItem == getItemPr) {


                            log.debug('getQuantityItem', getQuantityItem)
                            var getItemCountPr = loadPr.getLineCount('item');
                            var setQuantity = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: itemWinner[i].quantity,
                                line: j,
                            });
                            var setPopulateRfqId = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_rfq_number',
                                value: recId,
                                line: j,
                            });
                            var setVendorRfq = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_vendor_name',
                                value: vendorWinner,
                                line: j,
                            });
                            var setItemIsRfqed = loadRfq.setSublistValue({
                                sublistId: 'recmachcustrecord_me_rfq_number_1',
                                fieldId: 'custrecord_me_ue_is_rfqed',
                                value: true,
                                line: i,
                            });
                            var setPrcBfrDisc = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcolme_unitprice_bfr_purchase_disc',
                                value: itemWinner[i].price_before_disc,
                            });
                            var setDiscRate = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_discount_percentage',
                                value: itemWinner[i].discount_rate,
                            });
                            var setDiscAmount = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_discount_amount_purchase',
                                value: itemWinner[i].discount_amount,
                            });
                            var setPrcAftDisc = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_unit_price_after_discount',
                                value: itemWinner[i].price_after_disc,
                            });
                            var setTotAmount = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_amount_pr',
                                value: itemWinner[i].total_price_after_disc,
                            });
                            var setExRate = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_exchange_rate_rfq',
                                value: itemWinner[i].ex_rate,
                            });
                        }
                    }
                    log.debug('getItem == getItemPr',getItem + '=='+ getItemPr)
                    if (getCheckedItem && itemWinner.length <= 0) {


                        if (getItem == getItemPr) {
                            log.debug('ini kalau g ada winner')
                            var getItemCountPr = loadPr.getLineCount('item');
                            var setPopulateRfqId = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_rfq_number',
                                value: recId,
                                line: j,
                            });
                            var setQuantity = loadPr.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                value: getQuantityItem,
                                line: j,
                            });
                        }

                    }

                    loadPr.commitLine('item');
                }


            }

            var getRfqLineCount1 = loadRfq.getLineCount('recmachcustrecord_me_rfq_number_1')
            for (let i = getRfqLineCount1-1 ; i >= 0 ; i--) {
                var getCheckedItem = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'custrecord_me_check_item',
                    line: i,
                });
                var getLineId = loadRfq.getSublistValue({
                    sublistId: 'recmachcustrecord_me_rfq_number_1',
                    fieldId: 'id',
                    line: i,
                });
                log.debug('getLineId', getLineId)
                
                if (!getCheckedItem) {
                    log.debug('getCheckedItem',getCheckedItem + '- TYPE -' + typeof(getCheckedItem))
                    record.delete({
                        type: 'customrecord_me_csrec_rfq_child_1',
                        id: getLineId,
                    });
                }
                
            }
        } catch (error) {
            log.debug('error', error)
            var getPrLine = loadPr.getLineCount('item')
            for (let i = 0; i < itemWinner.length; i++) {
                for (let j = 0; j < getPrLine; j++) {
                    loadPr.selectLine('item', j);
                    var getItemIdPr = loadPr.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                    })
                    if (itemWinner[i].item_id == getItemIdPr) {
                        var setQuantity = loadPr.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: itemWinner[i].quantity,
                            line: i,
                        });
                        var setPopulateRfqId = loadPr.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_rfq_number',
                            value: recId,
                            line: i,
                        });
                        var setVendorRfq = loadPr.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_vendor_name',
                            value: vendorWinner,
                            line: i,
                        });
                        var setItemIsRfqed = loadRfq.setSublistValue({
                            sublistId: 'recmachcustrecord_me_rfq_number_1',
                            fieldId: 'custrecord_me_ue_is_rfqed',
                            value: true,
                            line: i,
                        });
                        var setPrcBfrDisc = loadPr.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcolme_unitprice_bfr_purchase_disc',
                            value: itemWinner[i].price_before_disc,
                        });
                        var setDiscRate = loadPr.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_discount_percentage',
                            value: itemWinner[i].discount_rate,
                        });
                        var setDiscAmount = loadPr.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_discount_amount_purchase',
                            value: itemWinner[i].discount_amount,
                        });
                        var setPrcAftDisc = loadPr.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_unit_price_after_discount',
                            value: itemWinner[i].price_after_disc,
                        });
                        var setTotAmount = loadPr.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_amount_pr',
                            value: itemWinner[i].total_price_after_disc,
                        });
                        var setExRate = loadPr.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_exchange_rate_rfq',
                            value: itemWinner[i].ex_rate,
                        });
                    }
                    loadPr.commitLine('item')
                }

            }
            // for (let i = 0; i < getVendorMstrLine; i++) {
            //     loadPr.selectLine('item', i)
            //     var getCheckedItem = loadRfq.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_rfq_number_1',
            //         fieldId: 'custrecord_me_check_item',
            //         line: i,
            //     });
            //     var getItemIsRfqed = loadRfq.getSublistValue({
            //         sublistId: 'recmachcustrecord_me_rfq_number_1',
            //         fieldId: 'custrecord_me_ue_is_rfqed',
            //         line: i,
            //     });

            //     if (getCheckedItem && itemWinner.length > 0) {
            //         var getItemCountPr = loadPr.getLineCount('item');
            //         var setPopulateRfqId = loadPr.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcol_me_rfq_number',
            //             value: recId,
            //             line: i,
            //         });
            //         var setVendorRfq = loadPr.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcol_me_vendor_name',
            //             value: vendorWinner,
            //             line: i,
            //         });
            //         var setItemIsRfqed = loadRfq.setSublistValue({
            //             sublistId: 'recmachcustrecord_me_rfq_number_1',
            //             fieldId: 'custrecord_me_ue_is_rfqed',
            //             value: true,
            //             line: i,
            //         });
            //         var setPrcBfrDisc = loadPr.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcolme_unitprice_bfr_purchase_disc',
            //             value: itemWinner[i].price_before_disc,
            //         });
            //         var setDiscRate = loadPr.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcol_me_discount_percentage',
            //             value: itemWinner[i].discount_rate,
            //         });
            //         var setDiscAmount = loadPr.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcol_me_discount_amount_purchase',
            //             value: itemWinner[i].discount_amount,
            //         });
            //         var setPrcAftDisc = loadPr.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcol_me_unit_price_after_discount',
            //             value: itemWinner[i].price_after_disc,
            //         });
            //         var setTotAmount = loadPr.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcol_me_amount_pr',
            //             value: itemWinner[i].total_price_after_disc,
            //         });
            //         var setExRate = loadPr.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcol_me_exchange_rate_rfq',
            //             value: itemWinner[i].ex_rate,
            //         });

            //     }

            //     loadPr.commitLine('item');

            // }
        }
        var getLineItemCount = loadPr.getLineCount('item');
        var countIsRfqed = 0
        var totalAmountRfq = 0
        for (let i = 0; i < getLineItemCount; i++) {
            loadPr.selectLine('item', i)
            var getRfqId = loadPr.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_rfq_number',
                line: i,
            });

            var getExRate = loadPr.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_exchange_rate_rfq',
                line: i,
            });
            var getTotAmount = loadPr.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_amount_pr',
                line: i,
            });

            var usdAmount = Number(getTotAmount) * Number(getExRate);
            totalAmountRfq += usdAmount;

            if (getRfqId && getTotAmount) {
                countIsRfqed++;
            }
            loadPr.commitLine('item');
        }
        var currencyForPr = null;

        if (itemWinner.length > 0) {
            currencyForPr = itemWinner[0].currency
        }
        if (countIsRfqed == getLineItemCount) {
            var setRfqCurr = loadPr.setValue('custbody_me_pr_currency', currencyForPr);
            var statusRfq = loadPr.setText('custbody_me_status_all_rfq', 'Complete');
            var totalRfq = loadPr.setValue('custbody_me_total_amt_rfq', totalAmountRfq);
        } else {
            var setRfqCurr = loadPr.setValue('custbody_me_pr_currency', currencyForPr);
            var statusRfq = loadPr.setText('custbody_me_status_all_rfq', 'Pending');
        }
        loadPr.save();
        loadRfq.save();
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit,

    }
});

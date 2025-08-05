/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function beforeSubmit(context) {
        var rec = context.newRecord;

        if (context.type == "create") {
            var getSubsidiary = rec.getValue({
                fieldId: 'custrecord_me_dissamble_pr_subsidiary'
            });
            var getDepartment = rec.getValue({
                fieldId: 'custrecord_me_disassemble_pr_department'
            });
            var getClass = rec.getValue({
                fieldId: 'custrecord_me_dissamble_pr_class'
            });
            var getLocation = rec.getValue({
                fieldId: 'custrecord_me_disassemble_pr_location'
            });

            // lebur product

            var createInvAdjLeburProduct = record.create({
                type: record.Type.INVENTORY_ADJUSTMENT,
                isDynamic: true
            });

            var setSubsidiary = createInvAdjLeburProduct.setValue({
                fieldId: 'subsidiary',
                value: getSubsidiary,
            })
            var setAccountInvAdj = createInvAdjLeburProduct.setValue({
                fieldId: 'account',
                value: 4047,
            })
            var setDepartment = createInvAdjLeburProduct.setValue({
                fieldId: 'department',
                value: getDepartment,
            })
            var setClass = createInvAdjLeburProduct.setValue({
                fieldId: 'class',
                value: getClass,
            })
            var setLocation = createInvAdjLeburProduct.setValue({
                fieldId: 'adjlocation',
                value: getLocation,
            })
            var getKodeAsal = rec.getValue({
                fieldId: 'custrecord_me_product_code',
            });
            // var getBeratAwal = rec.getSublistValue({
            //     sublistId: 'recmachcustrecord_me_dissamble_product_code',
            //     fieldId: 'custrecord_me_berat_awal_metal',
            //     line: i,
            // });
            // var getKodeRetur = rec.getSublistValue({
            //     sublistId: 'recmachcustrecord_me_dissamble_product_code',
            //     fieldId: 'custrecord_me_kode_retur',
            //     line: i,
            // });
            // var getBeratRetur = rec.getSublistValue({
            //     sublistId: 'recmachcustrecord_me_dissamble_product_code',
            //     fieldId: 'custrecord_me_berat_retur',
            //     line: i,
            // });

            createInvAdjLeburProduct.selectNewLine('inventory');
            var setItemLine = createInvAdjLeburProduct.setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'item',
                value: getKodeAsal,
            });

            var setAdjustByCt = createInvAdjLeburProduct.setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'adjustqtyby',
                value: -1,
            });

            var setDepartmentLine = createInvAdjLeburProduct.setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'department',
                value: getDepartment,
            });

            var setClassLine = createInvAdjLeburProduct.setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'class',
                value: getClass,
            });

            var setLocationLine = createInvAdjLeburProduct.setCurrentSublistValue({
                sublistId: 'inventory',
                fieldId: 'location',
                value: getLocation,
            });

            var inventoryDetail = createInvAdjLeburProduct.getCurrentSublistSubrecord({
                sublistId: 'inventory',
                fieldId: 'inventorydetail',
            });
            inventoryDetail.selectLine('inventoryassignment', 0);
            var quantityInvDetail = inventoryDetail.setCurrentSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'quantity',
                value: -1,
            });
            inventoryDetail.commitLine('inventoryassignment');

            createInvAdjLeburProduct.commitLine('inventory');
            var saveLeburBahan = createInvAdjLeburProduct.save();

            var setLeburProductTransaction = rec.setValue({
                fieldId: 'custrecord_me_lebur_product_code_transac',
                value: saveLeburBahan
            })

            var getMetalLine = rec.getLineCount('recmachcustrecord_me_dissamble_product_code');

            if (getMetalLine > 0) {

                var createInvAdj = record.create({
                    type: record.Type.INVENTORY_ADJUSTMENT,
                    isDynamic: true
                });

                var setSubsidiary = createInvAdj.setValue({
                    fieldId: 'subsidiary',
                    value: getSubsidiary,
                })
                var setAccountInvAdj = createInvAdj.setValue({
                    fieldId: 'account',
                    value: 4047,
                })
                var setDepartment = createInvAdj.setValue({
                    fieldId: 'department',
                    value: getDepartment,
                })
                var setClass = createInvAdj.setValue({
                    fieldId: 'class',
                    value: getClass,
                })
                var setLocation = createInvAdj.setValue({
                    fieldId: 'adjlocation',
                    value: getLocation,
                })

                for (let i = 0; i < getMetalLine; i++) {
                    var getKodeAsal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_dissamble_product_code',
                        fieldId: 'custrecord_me_kode_asal_metal',
                        line: i,
                    });
                    var getBeratAwal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_dissamble_product_code',
                        fieldId: 'custrecord_me_berat_awal_metal',
                        line: i,
                    });
                    var getKodeRetur = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_dissamble_product_code',
                        fieldId: 'custrecord_me_kode_retur',
                        line: i,
                    });
                    var getBeratRetur = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_dissamble_product_code',
                        fieldId: 'custrecord_me_berat_retur',
                        line: i,
                    });
                    var getBeratPcsRetur = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_dissamble_product_code',
                        fieldId: 'custrecord_me_qty_retur',
                        line: i,
                    });

                    createInvAdj.selectNewLine('inventory');
                    var setItemLine = createInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'item',
                        value: getKodeAsal,
                    });

                    var setDepartmentLine = createInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'department',
                        value: getDepartment,
                    });

                    var setClassLine = createInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'class',
                        value: getClass,
                    });

                    var setLocationLine = createInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'location',
                        value: getLocation,
                    });

                    var setAdjustByCt = createInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'adjustqtyby',
                        value: getBeratRetur,
                    });
                    var setAdjustByCt = createInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'custcol_me_qty_pcs_actual',
                        value: getBeratPcsRetur,
                    });
                    createInvAdj.commitLine('inventory');
                }
                var saveMetal = createInvAdj.save();

                var setMetalTransaction = rec.setValue({
                    fieldId: 'custrecord_me_lebur_metal_transaction',
                    value: saveMetal
                })
            }

            var getGemLine = rec.getLineCount('recmachcustrecord_me_child_dissamble_product');

            if (getGemLine > 0) {
                var createInvAdjGem = record.create({
                    type: record.Type.INVENTORY_ADJUSTMENT,
                    isDynamic: true
                });

                var setSubsidiary = createInvAdjGem.setValue({
                    fieldId: 'subsidiary',
                    value: getSubsidiary,
                });

                var setAccountInvAdj = createInvAdjGem.setValue({
                    fieldId: 'account',
                    value: 4047,
                })

                var setDepartment = createInvAdjGem.setValue({
                    fieldId: 'department',
                    value: getDepartment,
                });
                var setClass = createInvAdjGem.setValue({
                    fieldId: 'class',
                    value: getClass,
                })
                var setLocation = createInvAdjGem.setValue({
                    fieldId: 'adjlocation',
                    value: getLocation,
                })
                for (let i = 0; i < getGemLine; i++) {
                    var getKodeAsal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_kode_asal',
                        line: i,
                    });
                    var getWeightCode = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_weight_code',
                        line: i,
                    });
                    var getQtyAsal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_qty_asal',
                        line: i,
                    });
                    var getBeratAsal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_berat_asal',
                        line: i,
                    });
                    var getKodeReturGem = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_kode_retur_gem',
                        line: i,
                    });
                    var getQtyRetur = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_qty_retur',
                        line: i,
                    });
                    var getBeratReturGem = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_berat_retur_gem',
                        line: i,
                    });
                    var getBeratPcsReturGem = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_qty_retur',
                        line: i,
                    });


                    createInvAdjGem.selectNewLine('inventory');
                    var setItemLine = createInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'item',
                        value: getKodeAsal,
                    });

                    var setDepartmentLine = createInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'department',
                        value: getDepartment,
                    });

                    var setClassLine = createInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'class',
                        value: getClass,
                    });

                    var setLocationLine = createInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'location',
                        value: getLocation,
                    });

                    var setAdjustByCt = createInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'adjustqtyby',
                        value: getBeratReturGem,
                    });
                    var setAdjustByPcs = createInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'custcol_me_qty_pcs_actual',
                        value: getBeratPcsReturGem,
                    });
                    createInvAdjGem.commitLine('inventory');
                }
                var saveGem = createInvAdjGem.save();
                var setGemTransaction = rec.setValue({
                    fieldId: 'custrecord_me_lebur_gem_transaction',
                    value: saveGem
                })
            }
        }

        if (context.type == "edit") {

            var getSubsidiary = rec.getValue({
                fieldId: 'custrecord_me_dissamble_pr_subsidiary'
            });
            var getDepartment = rec.getValue({
                fieldId: 'custrecord_me_disassemble_pr_department'
            });
            var getClass = rec.getValue({
                fieldId: 'custrecord_me_dissamble_pr_class'
            });
            var getLocation = rec.getValue({
                fieldId: 'custrecord_me_disassemble_pr_location'
            });

            var getMetalInvAdj = rec.getValue({
                fieldId: 'custrecord_me_lebur_metal_transaction'
            });
            var getMetalLine = rec.getLineCount('recmachcustrecord_me_dissamble_product_code');

            if (getMetalLine > 0) {

                var updateInvAdj = record.load({
                    type: record.Type.INVENTORY_ADJUSTMENT,
                    id: getMetalInvAdj,
                    isDynamic: true
                });

                var setSubsidiary = updateInvAdj.setValue({
                    fieldId: 'subsidiary',
                    value: getSubsidiary,
                })
                var setAccountInvAdj = updateInvAdj.setValue({
                    fieldId: 'account',
                    value: 4047,
                })
                var setDepartment = updateInvAdj.setValue({
                    fieldId: 'department',
                    value: getDepartment,
                })
                var setClass = updateInvAdj.setValue({
                    fieldId: 'class',
                    value: getClass,
                })
                var setLocation = updateInvAdj.setValue({
                    fieldId: 'adjlocation',
                    value: getLocation,
                })

                for (let i = 0; i < getMetalLine; i++) {
                    var getKodeAsal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_dissamble_product_code',
                        fieldId: 'custrecord_me_kode_asal_metal',
                        line: i,
                    });
                    var getBeratAwal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_dissamble_product_code',
                        fieldId: 'custrecord_me_berat_awal_metal',
                        line: i,
                    });
                    var getKodeRetur = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_dissamble_product_code',
                        fieldId: 'custrecord_me_kode_retur',
                        line: i,
                    });
                    var getBeratRetur = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_dissamble_product_code',
                        fieldId: 'custrecord_me_berat_retur',
                        line: i,
                    });

                    // var getBeratPcsRetur = rec.getSublistValue({
                    //     sublistId: 'recmachcustrecord_me_dissamble_product_code',
                    //     fieldId: 'custrecord_me_qty_retur',
                    //     line: i,
                    // });

                    updateInvAdj.removeLine({
                        sublistId: 'inventory',
                        line: 0
                    })

                    updateInvAdj.selectNewLine('inventory');
                    var setItemLine = updateInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'item',
                        value: getKodeAsal,
                    });

                    var setDepartmentLine = updateInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'department',
                        value: getDepartment,
                    });

                    var setClassLine = updateInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'class',
                        value: getClass,
                    });

                    var setLocationLine = updateInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'location',
                        value: getLocation,
                    });

                    var setAdjustByCt = updateInvAdj.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'adjustqtyby',
                        value: getBeratRetur,
                    });
                    // var setAdjustByPcs = updateInvAdj.setCurrentSublistValue({
                    //     sublistId: 'inventory',
                    //     fieldId: 'custcol_me_qty_pcs_actual',
                    //     value: getBeratPcsRetur,
                    // });
                    updateInvAdj.commitLine('inventory');

                    var save = updateInvAdj.save();

                }
            }
            var getGemInvAdj = rec.getValue({
                fieldId: 'custrecord_me_lebur_gem_transaction'
            });
            var getGemLine = rec.getLineCount('recmachcustrecord_me_child_dissamble_product');

            if (getGemLine > 0) {
                var updateInvAdjGem = record.load({
                    type: record.Type.INVENTORY_ADJUSTMENT,
                    id: getGemInvAdj,
                    isDynamic: true
                });

                var setSubsidiary = updateInvAdjGem.setValue({
                    fieldId: 'subsidiary',
                    value: getSubsidiary,
                });
                var setAccountInvAdj = updateInvAdjGem.setValue({
                    fieldId: 'account',
                    value: 4047,
                })
                var setDepartment = updateInvAdjGem.setValue({
                    fieldId: 'department',
                    value: getDepartment,
                });
                var setClass = updateInvAdjGem.setValue({
                    fieldId: 'class',
                    value: getClass,
                })
                var setLocation = updateInvAdjGem.setValue({
                    fieldId: 'adjlocation',
                    value: getLocation,
                })
                for (let i = 0; i < getGemLine; i++) {
                    var getKodeAsal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_kode_asal',
                        line: i,
                    });
                    var getWeightCode = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_weight_code',
                        line: i,
                    });
                    var getQtyAsal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_qty_asal',
                        line: i,
                    });
                    var getBeratAsal = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_berat_asal',
                        line: i,
                    });
                    var getKodeReturGem = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_kode_retur_gem',
                        line: i,
                    });
                    var getQtyRetur = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_qty_retur',
                        line: i,
                    });
                    var getBeratReturGem = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_berat_retur_gem',
                        line: i,
                    });

                    var getBeratPcsReturGem = rec.getSublistValue({
                        sublistId: 'recmachcustrecord_me_child_dissamble_product',
                        fieldId: 'custrecord_me_qty_retur',
                        line: i,
                    });


                    updateInvAdjGem.removeLine({
                        sublistId: 'inventory',
                        line: 0
                    })
                    updateInvAdjGem.selectNewLine('inventory');
                    var setItemLine = updateInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'item',
                        value: getKodeAsal,
                    });

                    var setDepartmentLine = updateInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'department',
                        value: getDepartment,
                    });

                    var setClassLine = updateInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'class',
                        value: getClass,
                    });

                    var setLocationLine = updateInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'location',
                        value: getLocation,
                    });

                    var setAdjustByCt = updateInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'adjustqtyby',
                        value: getBeratReturGem,
                    });
                    var setAdjustByPcs = updateInvAdjGem.setCurrentSublistValue({
                        sublistId: 'inventory',
                        fieldId: 'custcol_me_qty_pcs_actual',
                        value: getBeratPcsReturGem,
                    });
                    updateInvAdjGem.commitLine('inventory');
                    var save = updateInvAdjGem.save();
                }
            }
        }

    }

    return {
        beforeSubmit: beforeSubmit,
    }
});

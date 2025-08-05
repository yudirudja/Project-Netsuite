/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/search', './config/me_config.js'], function (record, search, config) {

    function beforeSubmit(context) {

        var savedId = {
            work_order: "",
            adjustment: [],
            assembly_build: "",
        }

        try {

            var rec = context.newRecord;
            var recOld = context.oldRecord;

            var getIdAssembly = rec.getValue('custrecord_me_pemurnian_target');
            var memo = rec.getValue('custrecord_me_pemurnian_notes');
            var subsidiary = rec.getValue('custrecord_me_pemurnian_subsidiary');
            var department = rec.getValue('custrecord_me_pemurnian_department');
            var getClass = rec.getValue('custrecord_me_pemurnian_class');
            var location = rec.getValue('custrecord_me_pemurnian_location');
            var quantity = rec.getValue('custrecord_me_pemurnian_berat_akhir');
            var trandate = rec.getValue('custrecord_me_pemurnian_finish_date');

            var getWo = rec.getValue('custrecord_me_pemurnian_workorder_trx');
            var getAssembly = rec.getValue('custrecord_me_pemurnian_assembly_build');
            if (getAssembly) {
                var deleteAssemblyBuildOld = record.delete({
                    type: 'assemblybuild',
                    id: getAssembly
                })
            }



            log.debug(' department', department)
            log.debug(' getClass', getClass)

            var getChildLine = rec.getLineCount('recmachcustrecord_me_pemurnian_refinery_number');
            var getChildLineOld = recOld.getLineCount('recmachcustrecord_me_pemurnian_refinery_number');

            log.debug('getChildLine', getChildLine)

            var childPemurnianArrAll = [];
            var childPemurnianArrNew = [];
            var childPemurnianArrOld = [];

            for (let x = 0; x < getChildLine; x++) {
                var idAdjustment = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_inventory_adjustment_trx', x);
                var getBahanMetal = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_pemurnian_bahan_metal', x);
                var getBeratMetal = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_pemurnian_berat', x);
                var getReturMetal = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_pemurnian_retur', x);

                childPemurnianArrAll.push({
                    inv_adj_id: idAdjustment,
                    bahan_metal: getBahanMetal,
                    berat_metal: getBeratMetal,
                    retur_metal: getReturMetal,

                })

            }
            for (let x = getChildLineOld + 1; x < getChildLine; x++) {
                var getBahanMetal = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_pemurnian_bahan_metal', x);
                var getBeratMetal = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_pemurnian_berat', x);
                var getReturMetal = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_pemurnian_retur', x);

                childPemurnianArrNew.push({
                    bahan_metal: getBahanMetal,
                    berat_metal: getBeratMetal,
                    retur_metal: getReturMetal,

                })

            }

            for (let x = 0; x < getChildLineOld; x++) {
                var getBahanMetal = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_pemurnian_bahan_metal', x);
                var getBeratMetal = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_pemurnian_berat', x);
                var getReturMetal = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_pemurnian_retur', x);
                var getInvAdjId = rec.getSublistValue('recmachcustrecord_me_pemurnian_refinery_number', 'custrecord_me_inventory_adjustmnt_trx', x);
                childPemurnianArrOld.push({
                    bahan_metal: getBahanMetal,
                    berat_metal: getBeratMetal,
                    retur_metal: getReturMetal,
                    inv_adj_id: getInvAdjId,
                })

            }

            var createWo = record.load({
                type: 'workorder',
                id: getWo,
                isDynamic: true,
            });

            var setCustomForm = createWo.setValue({
                fieldId: 'customform',
                value: 194
            });
            var setSubsidiary = createWo.setValue({
                fieldId: 'subsidiary',
                value: Number(subsidiary),
            });
            var setAssemblyItem = createWo.setValue({
                fieldId: 'assemblyitem',
                value: getIdAssembly
            });
            var setClass = createWo.setValue({
                fieldId: 'class',
                value: Number(getClass),
            });
            var setDepartment = createWo.setValue({
                fieldId: 'department',
                value: Number(department),
            });
            var setLocation = createWo.setValue({
                fieldId: 'location',
                value: location,
            });
            var setGetOrderStatus = createWo.setValue({
                fieldId: 'orderstatus',
                value: 'B',
            });
            var setFirmed = createWo.setValue({
                fieldId: 'firmed',
                value: true,
            });
            var setMemo = createWo.setValue({
                fieldId: 'memo',
                value: memo,
            });
            var setQuantity = createWo.setValue({
                fieldId: 'quantity',
                value: quantity > 0 ? quantity : 0
            });
            var setDate = createWo.setValue({
                fieldId: 'trandate',
                value: trandate,
            });
            var setTipeWo = createWo.setValue({
                fieldId: 'custbody_me_list_wo',
                value: 6
            });

            log.debug('childPemurnian Arr', childPemurnianArrAll)

            var getItemWoLineCount = createWo.getLineCount('item');
            log.debug('getItemWoLineCount', getItemWoLineCount)
            if (getItemWoLineCount > 0) {
                for (let x = 0; x < getItemWoLineCount; x++) {
                    createWo.removeLine({
                        sublistId: 'item',
                        line: x,
                    });

                }

            }

            for (let x = 0; x < getChildLine; x++) {
                createWo.selectNewLine('item');

                var setItemChild = createWo.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: childPemurnianArrAll[x].bahan_metal
                });
                var setQuantityChild = createWo.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'bomquantity',
                    value: childPemurnianArrAll[x].berat_metal,
                });
                var setDepartmentChild = createWo.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'department',
                    value: department,
                });
                var setClassChild = createWo.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'class',
                    value: getClass,
                });

                createWo.commitLine('item');
            }
            // if (getChildLine !== getChildLineOld) {

            //     for (let x = childPemurnianArrOld.length + 1; x < childPemurnianArrNew.length; x++) {
            //         createWo.selectNewLine('item');

            //         var setItemChild = createWo.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'item',
            //             value: childPemurnianArrNew[x].bahan_metal
            //         });
            //         var setQuantityChild = createWo.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'custcol_me_qty_pcs_actual',
            //             value: childPemurnianArrNew[x].berat_metal,
            //         });
            //         var setDepartmentChild = createWo.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'department',
            //             value: department,
            //         });
            //         var setClassChild = createWo.setCurrentSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'class',
            //             value: getClass,
            //         });

            //         createWo.commitLine('item');
            //     }
            // }

            log.debug('createWo', createWo)

            var saveWo = createWo.save();
            savedId.work_order = saveWo;

            var setWoTrans = rec.setValue({
                fieldId: 'custrecord_me_pemurnian_workorder_trx',
                value: saveWo,
            })

            var createAssemblyBuild = record.transform({
                fromType: 'workorder',
                fromId: saveWo,
                toType: 'assemblybuild',
                isDynamic: true,
            });

            // var createAssemblyBuild = record.load({
            //     type: 'assemblybuild',
            //     fromId: getAssembly,
            //     isDynamic: true,
            // });

            var setCustomFormAb = createAssemblyBuild.setValue({
                fieldId: 'customform',
                value: 192,
            });
            var setSubsidiaryAb = createAssemblyBuild.setValue({
                fieldId: 'subsidiary',
                value: subsidiary,
            });
            var setDepartmentAb = createAssemblyBuild.setValue({
                fieldId: 'department',
                value: department,
            });
            var setClassAb = createAssemblyBuild.setValue({
                fieldId: 'class',
                value: getClass,
            });
            var setLocationAb = createAssemblyBuild.setValue({
                fieldId: 'location',
                value: location,
            });

            var setQuantityAB = createAssemblyBuild.setValue({
                fieldId: 'quantity',
                value: quantity,
            });
            var setAssemblyAB = createAssemblyBuild.setValue({
                fieldId: 'item',
                value: getIdAssembly,
            });

            var saveAb = createAssemblyBuild.save();
            savedId.assembly_build = saveAb;
            var setAbTrans = rec.setValue({
                fieldId: 'custrecord_me_pemurnian_assembly_build',
                value: saveAb,
            })

            var invAdjId = [];

            // for (let x = childPemurnianArrOld.length + 1; x < childPemurnianArrNew.length; x++) {
            //     var createInvAdj = record.create({
            //         type: 'inventoryadjustment',
            //         isDynamic: true,
            //     });

            //     var setSubsidiaryInvAdj = createInvAdj.setValue({
            //         fieldId: 'subsidiary',
            //         value: subsidiary,
            //     });
            //     var setDepartmentInvAdj = createInvAdj.setValue({
            //         fieldId: 'department',
            //         value: department,
            //     });
            //     var setClassInvAdj = createInvAdj.setValue({
            //         fieldId: 'class',
            //         value: getClass,
            //     });
            //     var setLocationInvAdj = createInvAdj.setValue({
            //         fieldId: 'adjlocation',
            //         value: location,
            //     });
            //     var loadAssemblyItem = record.load({
            //         type: 'assemblyitem',
            //         id: childPemurnianArrNew[x].bahan_metal,
            //     })
            //     var getCogsAccount = loadAssemblyItem.getValue('cogsaccount')

            //     var searchAcountAdj = createInvAdj.setValue({
            //         fieldId: 'account',
            //         value: config.account.adjustment,
            //     })

            //     createInvAdj.selectNewLine('inventory');

            //     var setSublistInvAdjItem = createInvAdj.setCurrentSublistValue({
            //         sublistId: 'inventory',
            //         fieldId: 'item',
            //         value: childPemurnianArrNew[x].bahan_metal,
            //     });

            //     var setSublistInvAdjPcsActual = createInvAdj.setCurrentSublistValue({
            //         sublistId: 'inventory',
            //         fieldId: 'adjustqtyby',
            //         value: childPemurnianArrNew[x].retur_metal,
            //     });
            //     var setSublistInvAdjDepartment = createInvAdj.setCurrentSublistValue({
            //         sublistId: 'inventory',
            //         fieldId: 'department',
            //         value: department,
            //     });
            //     var setSublistInvAdjClass = createInvAdj.setCurrentSublistValue({
            //         sublistId: 'inventory',
            //         fieldId: 'class',
            //         value: getClass,
            //     });
            //     var setSublistInvAdjLocation = createInvAdj.setCurrentSublistValue({
            //         sublistId: 'inventory',
            //         fieldId: 'location',
            //         value: location,
            //     });

            //     createInvAdj.commitLine('inventory');

            //     var saveInvAdj = createInvAdj.save();

            //     invAdjId.push(saveInvAdj);
            // }

            for (let x = 0; x < getChildLine; x++) {
                var createInvAdj = record.load({
                    type: 'inventoryadjustment',
                    id: childPemurnianArrAll[x].inv_adj_id,
                    isDynamic: true,
                });

                var setSubsidiaryInvAdj = createInvAdj.setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary,
                });
                var setDepartmentInvAdj = createInvAdj.setValue({
                    fieldId: 'department',
                    value: department,
                });
                var setClassInvAdj = createInvAdj.setValue({
                    fieldId: 'class',
                    value: getClass,
                });
                var setLocationInvAdj = createInvAdj.setValue({
                    fieldId: 'adjlocation',
                    value: location,
                });
                var loadAssemblyItem = record.load({
                    type: 'assemblyitem',
                    id: childPemurnianArrAll[x].bahan_metal,
                })
                var getCogsAccount = loadAssemblyItem.getValue('cogsaccount')

                var searchAcountAdj = createInvAdj.setValue({
                    fieldId: 'account',
                    value: config.account.adjustment,
                })

                
                var getAdjLine = createInvAdj.getLineCount('inventory');

                log.debug('getAdjLine', getAdjLine)

                if (getAdjLine > 0) {
                    for (let p = 0; p < getAdjLine; p++) {
                        createInvAdj.removeLine({
                            sublistId: 'inventory',
                            line: p
                        });
                    }
                }

                createInvAdj.selectNewLine('inventory');

                var setSublistInvAdjItem = createInvAdj.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'item',
                    value: childPemurnianArrAll[x].bahan_metal,
                });

                var setSublistInvAdjPcsActual = createInvAdj.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'adjustqtyby',
                    value: childPemurnianArrAll[x].retur_metal,
                });
                var setSublistInvAdjDepartment = createInvAdj.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'department',
                    value: department,
                });
                var setSublistInvAdjClass = createInvAdj.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'class',
                    value: getClass,
                });
                var setSublistInvAdjLocation = createInvAdj.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'location',
                    value: location,
                });

                createInvAdj.commitLine('inventory');

                var saveInvAdj = createInvAdj.save();

                // invAdjId.push(saveInvAdj);
            }

            log.debug('invAdjId', invAdjId)
            savedId.adjustment = invAdjId;

            for (let x = 0; x < invAdjId.length; x++) {
                // createWo.selectLine('recmachcustrecord_me_pemurnian_refinery_number', x);

                // var setItemChildPemurnian = rec.setCurrentSublistValue({
                //     sublistId: 'recmachcustrecord_me_pemurnian_refinery_number',
                //     fieldId: 'item',
                //     value: invAdjId[x]
                // });

                var setQuantityChildPemurnian = rec.setSublistValue({
                    sublistId: 'recmachcustrecord_me_pemurnian_refinery_number',
                    fieldId: 'custrecord_me_inventory_adjustmnt_trx',
                    value: invAdjId[x + getChildLineOld],
                    line: x
                });

                // createWo.commitLine('recmachcustrecord_me_pemurnian_refinery_number');
            }



        } catch (error) {
            if (savedId.assembly_build != "") {
                record.delete({
                    type: 'assemblybuild',
                    id: savedId.assembly_build
                });
            }
            // if (savedId.work_order != "") {
            //     record.delete({
            //         type: 'workorder',
            //         id: savedId.work_order
            //     });
            // }
            // if (savedId.adjustment.length > 0) {

            //     for (let x = 0; x < savedId.adjustment.length; x++) {
            //         record.delete({
            //             type: 'inventoryadjustment',
            //             id: savedId.inventoryadjustment,
            //         });
            //     }
            // }
            throw "ERROR: " + error;
        }

    }


    return {
        beforeSubmit: beforeSubmit,
    }
});

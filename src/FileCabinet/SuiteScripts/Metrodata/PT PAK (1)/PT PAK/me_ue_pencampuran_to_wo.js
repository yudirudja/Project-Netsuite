/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', './config/me_config.js'], function (record, search, config) {

    function beforeSubmit(context) {

        var savedId = {
            work_order: "",
            adjustment:[],
            assembly_build:"",
        }

        try {
            var rec = context.newRecord;

            var getIdAssembly = rec.getValue('custrecord_me_pencampuran_target');

            var memo = rec.getValue('custrecord_me_pencampuran_notes');
            var subsidiary = rec.getValue('custrecord_me_pencampuran_subsidiary');
            var department = rec.getValue('custrecord_me_pencampuran_department');
            var getClass = rec.getValue('custrecord_me_pencampuran_class');
            var location = rec.getValue('custrecord_me_pencampuran_location');
            var quantity = rec.getValue('custrecord_me_pencampuran_berat_akhir');
            var trandate = rec.getValue('custrecord_me_pencampuran_finish_date');

            log.debug(' department', department)
            log.debug(' getClass', getClass)

            var getChildLine = rec.getLineCount('recmachcustrecord_me_pencampuran_compound_num');

            log.debug('getChildLine', getChildLine)

            var childPencampuranArr = [];

            for (let x = 0; x < getChildLine; x++) {
                var getBahanMetal = rec.getSublistValue('recmachcustrecord_me_pencampuran_compound_num', 'custrecord_me_pencampuran_metal', x);
                var getBeratMetal = rec.getSublistValue('recmachcustrecord_me_pencampuran_compound_num', 'custrecord_me_pencampuran_brt_metal', x);
                var getReturMetal = rec.getSublistValue('recmachcustrecord_me_pencampuran_compound_num', 'custrecord_me_pencampuran_retur_metal', x);

                childPencampuranArr.push({
                    bahan_metal: getBahanMetal,
                    berat_metal: getBeratMetal,
                    retur_metal: getReturMetal,
                })

            }

            var createWo = record.create({
                type: 'workorder',
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

            log.debug('childPencampuran Arr', childPencampuranArr)

            for (let x = 0; x < childPencampuranArr.length; x++) {
                createWo.selectNewLine('item');

                var setItemChild = createWo.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: childPencampuranArr[x].bahan_metal
                });
                // var setQuantityChild = createWo.setCurrentSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'custcol_me_qty_pcs_actual',
                //     value: childPencampuranArr[x].berat_metal,
                // });
                var setQuantityChild = createWo.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'bomquantity',
                    value: childPencampuranArr[x].berat_metal,
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

            log.debug('createWo', createWo)

            var saveWo = createWo.save();

            savedId.work_order = saveWo;

            var createAssemblyBuild = record.transform({
                fromType: 'workorder',
                fromId: saveWo,
                toType: 'assemblybuild',
                isDynamic: true,
            });

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

            var invAdjId = [];

            for (let x = 0; x < childPencampuranArr.length; x++) {
                var createInvAdj = record.create({
                    type: 'inventoryadjustment',
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
                    id: childPencampuranArr[x].bahan_metal,
                })
                var getCogsAccount = loadAssemblyItem.getValue('cogsaccount')


                log.debug('accounts', config.account.adjustment)

                var searchAcountAdj = createInvAdj.setValue({
                    fieldId: 'account',
                    value: config.account.adjustment
                })

                createInvAdj.selectNewLine('inventory');

                var setSublistInvAdjItem = createInvAdj.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'item',
                    value: childPencampuranArr[x].bahan_metal,
                });

                var setSublistInvAdjPcsActual = createInvAdj.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'adjustqtyby',
                    value: childPencampuranArr[x].retur_metal,
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

                invAdjId.push(saveInvAdj);
            }

            savedId.adjustment = invAdjId;

            log.debug('invAdjId', invAdjId)


            for (let x = 0; x < invAdjId.length; x++) {
                // createWo.selectLine('recmachcustrecord_me_pencampuran_compound_num', x);

                // var setItemChildPencampuran = rec.setCurrentSublistValue({
                //     sublistId: 'recmachcustrecord_me_pencampuran_compound_num',
                //     fieldId: 'item',
                //     value: invAdjId[x]
                // });

                var setQuantityChildPencampuran = rec.setSublistValue({
                    sublistId: 'recmachcustrecord_me_pencampuran_compound_num',
                    fieldId: 'custrecord_me_inventory_adjustmnt_trx',
                    value: invAdjId[x],
                    line: x
                });

                // createWo.commitLine('recmachcustrecord_me_pencampuran_compound_num');
            }

            var setWoTrans = rec.setValue({
                fieldId: 'custrecord_me_pencampuran_wo_trx',
                value: saveWo,
            })
            var setAbTrans = rec.setValue({
                fieldId: 'custrecord_me_pencampuran_assembly_build',
                value: saveAb,
            })
        } catch (error) {

            if (savedId.work_order != "") {
                record.delete({
                    type: 'workorder',
                    id: savedId.work_order
                });
            }

            if (savedId.assembly_build != "") {
                record.delete({
                    type: 'assemblybuild',
                    id: savedId.assembly_build
                });
            }
            if (savedId.adjustment.length > 0) {

                for (let x = 0; x < savedId.adjustment.length; x++) {
                    record.delete({
                        type: 'inventoryadjustment',
                        id: savedId.inventoryadjustment,
                    }); 
                }
            }
            throw "ERROR: " + error;
        }


    }


    return {
        beforeSubmit: beforeSubmit,
    }
});

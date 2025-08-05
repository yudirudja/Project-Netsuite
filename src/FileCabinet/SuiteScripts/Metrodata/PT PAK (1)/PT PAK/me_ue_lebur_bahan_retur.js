/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function beforeSubmit(context) {
        var rec = context.newRecord;

        if (context.type == "create") {
            var getSubsidiary = rec.getValue({
                fieldId: 'custrecord_me_subsidary_bahan_lebur'
            });
            var getDepartment = rec.getValue({
                fieldId: 'custrecord_me_department_lebur'
            });
            var getClass = rec.getValue({
                fieldId: 'custrecord_me_class_bahan_lebur'
            });
            var getLocation = rec.getValue({
                fieldId: 'custrecord_me_location_bahan_lebur'
            });

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

            var getKodeAsal = rec.getValue({
                fieldId: 'custrecord_me_retur_bahan',
            });
            var getBeratRetur = rec.getValue({
                fieldId: 'custrecord_me_berat_lebur',
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

            createInvAdj.commitLine('inventory');

            var saveBahan = createInvAdj.save();
            log.debug("id adjustment", saveBahan)

            var setBahanTransaction = rec.setValue({
                fieldId: 'custrecord_me_lbr_bahan_transaction',
                value: saveBahan,
            })
        }

        if (context.type == "edit") {
            var getSubsidiary = rec.getValue({
                fieldId: 'custrecord_me_subsidary_bahan_lebur'
            });
            var getDepartment = rec.getValue({
                fieldId: 'custrecord_me_department_lebur'
            });
            var getClass = rec.getValue({
                fieldId: 'custrecord_me_class_bahan_lebur'
            });
            var getLocation = rec.getValue({
                fieldId: 'custrecord_me_location_bahan_lebur'
            });

            var getBahanTransaction = rec.getValue({
                fieldId: 'custrecord_me_lbr_bahan_transaction',
            })
            var updateInvAdj = record.load({
                type: record.Type.INVENTORY_ADJUSTMENT,
                id: getBahanTransaction,
                isDynamic: true
            });

            // var setSubsidiary = updateInvAdj.setValue({
            //     fieldId: 'subsidiary',
            //     value: getSubsidiary,
            // })
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

            var getKodeAsal = rec.getValue({
                fieldId: 'custrecord_me_retur_bahan',
            });
            var getBeratRetur = rec.getValue({
                fieldId: 'custrecord_me_berat_lebur',
            });

            updateInvAdj.removeLine({
                sublistId: 'inventory',
                line: 0,
                ignoreRecalc: true
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
            updateInvAdj.commitLine('inventory');

            log.debug("updateInvAdj", updateInvAdj);

            // updateInvAdj.commitLine('inventory');


            var saveBahan = updateInvAdj.save({
                ignoreMandatoryFields: true
            });
        }

    }

    return {
        beforeSubmit: beforeSubmit,
    }
});

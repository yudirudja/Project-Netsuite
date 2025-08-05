/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/record', 'N/search', 'N/format'], function(record, search, format) {

    function execute(context) {
        var objRecord = record.create({
            type: record.Type.ASSEMBLY_BUILD, 
        });

        var inventoryDetailSubRecord = objRecord.getSubRecord({
            fieldId: 'inventorydetail',
        })

        inventoryDetailSubRecord.selectNewLine({
            sublistId: 'inventoryassignment'
        })
        inventoryDetailSubRecord.setCurrentSublistValue({
            sublistId: 'inventoryassignment',
            fieldId: 'issueinventorynumber',
            value: '1'
        });
        inventoryDetailSubRecord.setCurrentSublistValue({
            sublistId: 'inventoryassignment',
            fieldId: 'inventorystatus',
            value: 'test'
        });
        inventoryDetailSubRecord.setCurrentSublistValue({
            sublistId: 'inventoryassignment',
            fieldId: 'quantity',
            value: 2,
        });

    }

    return {
        execute: execute
    }
});

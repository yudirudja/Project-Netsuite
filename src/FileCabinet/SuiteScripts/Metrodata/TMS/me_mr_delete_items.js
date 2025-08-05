/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/log'], function(record, search, log) {

    function getInputData() {
        // Return all items to be processed
        return search.create({
            type: search.Type.ITEM,
            filters: [],
            columns: ['internalid', 'type']
        });
    }

    function map(context) {
        var result = JSON.parse(context.value);
        var itemId = result.id;
        var itemType = result.values.type.value;

        var itemTypesMap = {
            "InvtPart": record.Type.INVENTORY_ITEM,
            "NonInvtPart": record.Type.NON_INVENTORY_ITEM,
            "Service": record.Type.SERVICE_ITEM,
            "Assembly": record.Type.ASSEMBLY_ITEM,
            "OthCharge": record.Type.OTHER_CHARGE_ITEM,
            "Kit": record.Type.KIT_ITEM,
            "GiftCert": record.Type.GIFT_CERTIFICATE_ITEM
            // Add more mappings as needed
        };

        var recordType = itemTypesMap[itemType];

        if (recordType) {
            try {
                record.delete({
                    type: recordType,
                    id: itemId
                });
                log.debug('Item Deleted', 'Item ID: ' + itemId + ' (Type: ' + recordType + ')');
            } catch (e) {
                log.error('Error Deleting Item', 'Item ID: ' + itemId + ' - Error: ' + e.message);
            }
        } else {
            log.error('Unknown Item Type', 'Item ID: ' + itemId + ' - Type: ' + itemType);
        }
    }

    function summarize(summary) {
        var type = 'MAP/REDUCE Summary';
        var title = 'Summary for Item Deletion';
        var details = '';

        summary.output.iterator().each(function(key, value) {
            details += key + ' was deleted\n';
            return true;
        });

        if (summary.inputSummary.error) {
            log.error(type + ' - Error in Input Stage', summary.inputSummary.error);
        }

        summary.mapSummary.errors.iterator().each(function(key, error) {
            log.error(type + ' - Error in Map Stage', key + ' : ' + error);
            return true;
        });

        log.audit({
            title: title,
            details: details
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };

});
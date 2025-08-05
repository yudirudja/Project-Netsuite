/**
 *@NApiVersion 2.1
 *@NScriptType MassUpdateScript
 */
 define(['N/record'], function(record) {

    function each(params) {
        try {
            // Get the internal ID of the item
            var itemId = params.id;

            // Attempt to delete the item by looping through possible item types
            var itemTypes = [
                record.Type.INVENTORY_ITEM,
                record.Type.NON_INVENTORY_ITEM,
                record.Type.SERVICE_ITEM,
                record.Type.ASSEMBLY_ITEM,
                record.Type.OTHER_CHARGE_ITEM,
                record.Type.KIT_ITEM,
                record.Type.GIFT_CERTIFICATE_ITEM
                // Add more types as needed
            ];

            for (var i = 0; i < itemTypes.length; i++) {
                try {
                    record.delete({
                        type: itemTypes[i],
                        id: itemId
                    });
                    log.debug('Item Deleted', 'Item ID: ' + itemId + ' (Type: ' + itemTypes[i] + ')');
                    break; // Break loop if delete is successful
                } catch (deleteError) {
                    // Log if this item type does not match, continue loop
                    log.debug('Delete Attempt Failed for Item Type', itemTypes[i] + ': ' + deleteError.message);
                }
            }

        } catch (e) {
            log.error('Error Deleting Item', 'Item ID: ' + itemId + ' - Error: ' + e.message);
        }
    }

    return {
        each: each
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/search'], function(search) {



    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        if (fieldId == 'custrecord_propassettype') {
            
            var getAssetLifetime = search.lookupFields({
                type: 'customrecord_ncfar_assettype',
                id: rec.getValue('custrecord_propassettype'),
                columns: ['custrecord_assettypelifetime']
            });
            log.debug('getAssetLifetime',getAssetLifetime)

            rec.setValue('custrecord_propassetlifetime', getAssetLifetime.custrecord_assettypelifetime);
        }
    }


    return {
        fieldChanged: fieldChanged,
    }
});

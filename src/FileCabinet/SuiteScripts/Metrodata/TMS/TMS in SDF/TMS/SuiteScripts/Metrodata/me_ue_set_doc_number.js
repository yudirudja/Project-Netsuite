/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function(record) {

    function afterSubmit(context) {

        var rec = context.newRecord;

        var recId = rec.id;
        
        var loadRec = record.load({
            type: record.Type.CHECK, 
            id: recId,
            isDynamic: true,
        })
        
        var getRecType = loadRec.getValue('recordType');
        log.debug("type record", getRecType);
        var getTransNumber = loadRec.getValue('transactionnumber');

        var setCheck = loadRec.setValue('tranid', getTransNumber);

        loadRec.save()
        
    }

    return {
        afterSubmit: afterSubmit
    }
});

/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function beforeLoad(context) {
        var oldRecord = context.oldRecord;
        var newRecord = context.newRecord;

        if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.VIEW) {
            if (!context.request) return true;
            var paramID = context.request.parameters.itemship
            log.debug("paramID", paramID)
            if (paramID) {
                var itemfulfilment = record.load({
                    type: record.Type.ITEM_FULFILLMENT, // Replace with the appropriate bill record type if needed
                    id: paramID,
                    isDynamic: true
                })
                var reffnumber = itemfulfilment.getValue('tranid')
                var date = itemfulfilment.getValue('trandate')
                

                if (reffnumber.length = 1) {
                    newRecord.setValue({
                        fieldId: 'custbody_me_item_fulfilment_number',
                        value: reffnumber
                    })

                    newRecord.setValue({
                        fieldId: 'custbody_me_ship_date',
                        value: date
                    })
                  // Added By Yudi
                    newRecord.setValue({
                        fieldId: 'custbody_me_related_item_fulfillment',
                        value: paramID
                    })
                  // Added By Yudi (End)
                    
                    log.debug('tes', reffnumber)
                }
            }
        }
    }

    return {
        beforeLoad: beforeLoad
    }
});

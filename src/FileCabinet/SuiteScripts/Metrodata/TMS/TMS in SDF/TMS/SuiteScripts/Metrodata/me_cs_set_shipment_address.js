/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/record'], function (record) {


    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        if (fieldId == 'shipaddresslist') {
            var getShiptoAddress = rec.getValue('shipaddresslist');
            log.debug('getShiptoAddress', getShiptoAddress)
            if (getShiptoAddress) {


                var custRec = record.load({
                    type: 'customer',
                    id: rec.getValue('entity'),
                });
                var getAddrLine = custRec.getLineCount('addressbook');
                for (let i = 0; i < getAddrLine; i++) {
                    var getInternalIdAddr = custRec.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'internalid',
                        line: i,
                    })

                    var getAddress = custRec.getSublistValue({
                        sublistId: 'addressbook',
                        fieldId: 'addressbookaddress_text',
                        line: i,
                    })

                    if (getShiptoAddress == getInternalIdAddr) {
                        var setShipAddress = rec.setValue('custbody_me_shipping_address', getAddress);
                        break;
                    }
                }
            }else{
                var setShipAddress = rec.setValue('custbody_me_shipping_address', null);
            }
        }
    }


    return {
        fieldChanged: fieldChanged,
    }
});

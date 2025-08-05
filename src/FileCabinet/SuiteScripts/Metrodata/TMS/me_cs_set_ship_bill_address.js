/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/search'], function (search) {


    function Address(params) {
        var customerSearchObj = search.create({
            type: "customer",
            filters:
                [
                    ["addresslabel", "is", params]
                ],
            columns:
                [
                    search.createColumn({ name: "address", label: "Address" })
                ]
        }).run().getRange({
            start: 0,
            end: 1,
        });

        var address = customerSearchObj[i].getValue(customerSearchObj[i].columns[0]);

        return address;

    }


    function fieldChanged(context) {
        var currentRec = context.currentRecord;
        var currentSublist = context.sublistId;
        var currentFieldId = context.fieldId;

        var getBilltoAddress = currentRec.getText('billaddresslist');
        var getShiptoAddress = currentRec.getText('shipaddresslist');

        if (currentFieldId == 'billaddresslist') {
            var getAddress = Address(getBilltoAddress);

            var setBillAddress = currentRec.setValue('custbody_me_billing_address', getAddress);
        }

        if (currentFieldId == 'billaddresslist') {
            var getAddress = Address(getShiptoAddress);
            var setShipAddress = currentRec.setValue('custbody_me_shipping_address', getAddress);
        }



    }

    return {
        fieldChanged: fieldChanged,
    }
});

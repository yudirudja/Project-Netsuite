/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function() {

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;
        if (fieldId == "custrecord_me_child_settle_prepay_amount") {
            var getForeignToForeignRate = rec.getValue('custrecord_me_foreign_to_foreign_rate')
            var getPrepayInitial = rec.getValue('custrecord_me_child_settle_prepay_amount');
            var ratePrepayToIdr = rec.getValue('custrecord_me_exrate_prepayment_to_idr');
            var ratePrepayAmount = rec.setValue({
                fieldId: 'custrecord_me_child_settle_prepay_idr',
                value: parseFloat(ratePrepayToIdr * getPrepayInitial),
                ignoreFieldChange: true,
            });
    
            var setForeignToForeign = rec.setValue({
                fieldId: 'custrecord_me_child_settle_amount',
                value: parseFloat(getForeignToForeignRate * getPrepayInitial),
                ignoreFieldChange: true,
            })
    
            var getSettleInitial = rec.getValue('custrecord_me_child_settle_amount');
            var rateSettleToIdr = rec.getValue('custrecord_me_exrate_settlement_to_idr');
            var rateSettleAmount = rec.setValue({
                fieldId: 'custrecord_me_child_settle_amount_idr',
                value: parseFloat(rateSettleToIdr * getSettleInitial),
                ignoreFieldChange: true,
            })
        }
    }
   

    return {
        fieldChanged: fieldChanged,
    }
});

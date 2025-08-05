/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function() {


    function pageInit(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        log.debug("INPUT PGE INIT")

    }
    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        log.debug("fieldId", fieldId)
        if (sublistId == "item" && fieldId == "taxtotal") {
            rec.setCurrentSublistValue({
                sublistId: sublistId,
                fieldId: "custcol_me_tx_manual_inpt_flg",
                value: true
            })
        }
    }


    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
    }
});

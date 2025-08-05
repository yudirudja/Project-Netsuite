/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([], function() {

    function fieldChanged(context) {
        
    }

    function sublistChanged(context) {
        currentRecord = context.newRecord;
        
    }

    return {
        fieldChanged: fieldChanged,
        sublistChanged: sublistChanged
    }
});

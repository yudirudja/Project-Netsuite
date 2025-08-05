/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function() {

    function beforeLoad(context) {
        var rec = context.newRecord

        if (context.type == 'create') {
            var setRemarksValue = rec.setValue('custbody_me_remarks_sales', '')
        }

    }


    return {
        beforeLoad: beforeLoad,

    }
});

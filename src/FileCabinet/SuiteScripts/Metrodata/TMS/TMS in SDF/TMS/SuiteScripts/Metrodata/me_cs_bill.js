/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function() {

    function pageInit(context) {
        var rec = context.currentRecord;
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        var currentFieldId = context.fieldId;

        const queryString = window.location.search;
        log.debug('queryString', queryString);
        if(queryString.indexOf('transform') != -1){
            const urlParams = new URLSearchParams(queryString);
            const transform = urlParams.get('transform')
            if(transform == 'purchord'){
                const po_id = urlParams.get('id')
                log.debug('data bill', {transform: transform, po_id: po_id})
                rec.setValue('custbody_me_related_po_bill', po_id)
            }
        }


    }

    

    return {
        pageInit: pageInit
    }
});

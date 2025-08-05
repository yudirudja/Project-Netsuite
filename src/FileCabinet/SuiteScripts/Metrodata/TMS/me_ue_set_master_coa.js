/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/search'], function (search) {

    function beforeSubmit(context) {
        var rec = context.newRec;

        var getSubAccountOf = rec.getValue('parent');

        var lookUpParent = search.lookupFields({
            type: search.Type.ACCOUNT,
            id: getSubAccountOf,
            columns: ['parent']
        });
        var setMasterData = rec.setValue('custrecord_me_master_parent', getSubAccountOf);
    }


    return {
        beforeSubmit: beforeSubmit,
    }
});

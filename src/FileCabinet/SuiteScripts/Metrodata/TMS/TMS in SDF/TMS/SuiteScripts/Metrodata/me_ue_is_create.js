/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define([], function () {

    function beforeLoad(context) {
        var rec = context.newRecord;

        var isCreate = false;

        if (context.type == 'create') {
            isCreate = true;
        }

        var setisCreate = rec.setValue('custbody_me_is_create', isCreate)
    }

    function beforeSubmit(context) {
        var rec = context.newRecord;

        var isCreate = false;

        var setisCreate = rec.setValue('custbody_me_is_create', isCreate)
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
    }
});

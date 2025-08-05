/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function () {

    function sublistChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        var getBuSublist = rec.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'class',
        });

        var setBuHeader = rec.setValue('class', getBuSublist);


    }

    function save(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        if (!rec.getValue('custbody_tms_so_body_department') || !rec.getValue('department')) {
            rec.setValue('custbody_tms_so_body_department', 124)
            rec.setValue('department', 124)
        }

    }

    return {
        sublistChanged: sublistChanged,
        save: save
    }
});


/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([], function () {

    function pageInit(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;
        var sublistId = context.sublistId;

        var getDepartmentField = rec.getField('department');

        getDepartmentField.isDisabled = true
    }

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;
        var sublistId = context.sublistId;

        if (fieldId == 'custbody_test_me_department') {
            
            var getDeptartmentPlaceholder = rec.getValue("custbody_test_me_department");
            log.debug("departemnt ID", getDeptartmentPlaceholder);
            var setDepartment = rec.setValue("department", getDeptartmentPlaceholder)
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
    }
});

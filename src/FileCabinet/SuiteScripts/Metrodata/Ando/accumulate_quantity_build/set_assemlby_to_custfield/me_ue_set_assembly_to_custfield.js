/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function() {


    function beforeSubmit(context) {
        let rec = context.newRecord;

        let get_assembly = rec.getValue("assemblyitem");

        let set_custfield_assembly = rec.setValue("custbody_me_assembly_item", get_assembly)
    }


    return {
        beforeSubmit: beforeSubmit,

    }
});

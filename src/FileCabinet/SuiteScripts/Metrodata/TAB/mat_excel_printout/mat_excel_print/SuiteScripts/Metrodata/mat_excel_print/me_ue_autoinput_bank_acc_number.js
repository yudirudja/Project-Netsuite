/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function() {


    function beforeSubmit(context) {
        let rec = context.newRecord;

        let get_bank_acc_num_shad = rec.getValue("sbankcompanyid")
        let set_bank_acc_num_shad = rec.setValue("custrecord_me_bank_acc_num_shadow", get_bank_acc_num_shad)
    }


    return {
        beforeSubmit: beforeSubmit,
    }
});

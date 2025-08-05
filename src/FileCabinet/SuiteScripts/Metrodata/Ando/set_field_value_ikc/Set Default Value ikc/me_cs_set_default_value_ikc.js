/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/format'], function (format) {

    function pageInit(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;

        let get_startoperation = rec.getValue("startoperation")
        if (!get_startoperation) {
            let set_startoperation = rec.setText("startoperation", "10")
        }
        let get_endoperation = rec.getValue("endoperation")
        if (!get_endoperation) {
            let set_endoperation = rec.setText("endoperation", "10")
        }
        let get_custbody54 = rec.getValue("custbody54")
        if (!get_custbody54) {
            let set_custbody54 = rec.setText("custbody54", '8:00 am')
        }

        let get_custbody55 = rec.getValue("custbody55")
        if (!get_custbody55) {
            let set_custbody55 = rec.setText("custbody55", "5:00 am")
        }

        let get_custbody_me_nama_operator = rec.getValue("custbody_me_nama_operator")
        if (!get_custbody_me_nama_operator) {
            let set_custbody_me_nama_operator = rec.setValue("custbody_me_nama_operator", "Ayu")
        }
        let get_custbody_me_stich_line_no = rec.getValue("custbody_me_stich_line_no")
        if (!get_custbody_me_stich_line_no) {
            let set_custbody_me_stich_line_no = rec.setValue("custbody_me_stich_line_no", "19")
        }
        let get_custbody_me_machine_no = rec.getValue("custbody_me_machine_no")
        if (!get_custbody_me_machine_no) {
            let set_custbody_me_machine_no = rec.setValue("custbody_me_machine_no", "19/20 D")
        }
        let get_custbody_table_no = rec.getValue("custbody_table_no")
        if (!get_custbody_table_no) {
            let set_custbody_table_no = rec.setValue("custbody_table_no", "20 D")
        }


    }



    return {
        pageInit: pageInit,
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/ui/serverWidget'], function(serverWidget) {

    function beforeLoad(context) {
        let rec = context.newRecord;
        let form = context.form;

        let hideFld = form.addField({
            id: 'custpage_hide_buttons',
            label: 'not shown - hidden',
            type: serverWidget.FieldType.INLINEHTML
        });

        var scr = "";
        scr += `jQuery("#tdbody_secondarycustpage_button_delegate").hide();`;
        scr += `jQuery("#tbl_secondarycustpage_button_delegate").hide();`;
        scr += `jQuery("#tbl_secondarycustpage_button_delegate").hide();`;   


        hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"

        
    }

    return {
        beforeLoad: beforeLoad,
    }
});

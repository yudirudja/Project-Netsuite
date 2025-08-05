/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/ui/serverWidget"], function(serverWidget) {

    function beforeLoad(context) {
        let rec = context.newRecord;
        if (context.type == 'view') {
            var hideFld = context.form.addField({
                id: 'custpage_hide_buttons',
                label: 'not shown - hidden',
                type: serverWidget.FieldType.INLINEHTML
            });
            var scr = "";
            // scr += `jQuery("a.dottedlink:contains('Remove')").hide();`;
            // scr += `jQuery("a.dottedlink:contains('Edit')").hide();`;
            // scr += `jQuery(".listheader:contains('Remove')").hide();`;
            scr += `jQuery("#issuecomponents").hide();`;
            scr += `jQuery("#entercompletion").hide();`;


            hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
        }
    }

    return {
        beforeLoad: beforeLoad,
    }
});

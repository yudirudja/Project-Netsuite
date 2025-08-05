/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(["N/runtime", "N/record", "N/url" , "N/ui/serverWidget"], function (runtime, record, url, serverWidget) {

    function beforeLoad(context) {


        var user = runtime.getCurrentUser();
        log.debug("user", user)
        // if (context.type == 'view') {
            var hideFld = context.form.addField({
                id: 'custpage_hide_buttons',
                label: 'not shown - hidden',
                type: serverWidget.FieldType.INLINEHTML
            });
            var scr = "";
            // scr += `jQuery("a.dottedlink:contains('Remove')").hide();`;
            // scr += `jQuery("a.dottedlink:contains('Edit')").hide();`;
            scr += `jQuery("#price1row0").hide();`;
            // scr += `jQuery(".listheader:contains('Edit')").hide();`;


            hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
        // }
        // var scr = "";
    }



    return {
        beforeLoad: beforeLoad,

    }
});

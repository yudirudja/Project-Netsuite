/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function(record) {

    function beforeLoad(context) {

        var rec = context.newRecord;

        if (context.type == 'view' ) {
            log.debug('test trigger ceckbox',"12345")
            if (!rec.getValue('custbody_test_inline_html_is_trigger')) {
                
                var loadInv = record.load({
                    type: 'invoice',
                    id: rec.id,  
                    isDynamic: true                 
                });
    
                loadInv.setValue('custbody_test_inline_html_is_trigger', true)
                loadInv.save();
            }
        }
    }


    return {
        beforeLoad: beforeLoad,

    }
});

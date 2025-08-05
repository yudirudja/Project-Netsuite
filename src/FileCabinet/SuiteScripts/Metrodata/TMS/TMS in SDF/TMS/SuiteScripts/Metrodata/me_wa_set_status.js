/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define([], function() {

    function onAction(context) {
        var rec = context.newRecord;

        var setStatus = rec.setValue('orderstatus','B');
        var getStatus = rec.getValue('orderstatus');
        log.debug('getStatus',getStatus)
    }

    return {
        onAction: onAction
    }

});

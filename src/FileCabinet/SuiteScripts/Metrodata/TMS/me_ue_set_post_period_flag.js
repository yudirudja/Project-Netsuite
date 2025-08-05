/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function() {

    function beforeSubmit(context) {
        var rec = context.newRecord;

        var getPostingPeriod = rec.getText('postingperiod');

        var setPostPeriod = rec.setValue('custbody_me_post_period', getPostingPeriod)
    }

    return {
        beforeSubmit: beforeSubmit,
    }
});

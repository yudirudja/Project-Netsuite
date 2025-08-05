/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function(record) {

    function afterSubmit(context) {
        var rec = context.newRecord;
      var id = rec.id;

      var load = record.load({
    type: record.Type.JOURNAL_ENTRY, 
    id: id,
});

        var getPostingPeriod = load.getText('postingperiod');

        var setPostPeriod = load.setText('custbody_me_post_period', getPostingPeriod)

      load.save()
    }

    return {
        afterSubmit: afterSubmit,
    }
});

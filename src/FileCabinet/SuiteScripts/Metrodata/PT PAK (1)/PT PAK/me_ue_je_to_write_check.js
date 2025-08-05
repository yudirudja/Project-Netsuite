/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', './config/me_config.js'], function (record, config) {

    function afterSubmit(context) {
        log.debug("context.type", context.type)
        if (context.type === 'create' || context.type === 'edit') {
            var rec = context.newRecord;

            var getFormId = rec.getValue('customform');

            if (getFormId == config.form.journal_entry_return_vp) {
                var getWriteCheck = rec.getValue('custbody_me_um_number');

                var recId = rec.id;

                var getLineCount = rec.getLineCount('line');

                var amount = 0;

                for (let i = 0; i < getLineCount; i++) {
                    var getLineAmount = rec.getSublistValue({
                        sublistId: "line",
                        fieldId: "credit",
                        line: i,
                    });

                    amount += Number(getLineAmount);
                }

                var loadWc = record.load({
                    type: 'check',
                    id: getWriteCheck,
                    isDynamic: true,
                });

                var getRefundAmount = loadWc.getValue('custbody_me_refund_amount');

                var getRefundId = loadWc.getValue('custbody_me_refund_transaction_vp');

                var totalAmount = Number(amount) + Number(getRefundAmount);

                getRefundId.push(recId);

                var setAmount = loadWc.setValue('custbody_me_refund_amount', totalAmount);

                var setAmountId = loadWc.setValue('custbody_me_refund_transaction_vp', getRefundId);

                var saveRec = loadWc.save();
            }
        }

    }

    return {
        afterSubmit: afterSubmit,
    }
});

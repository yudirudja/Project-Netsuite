/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', './library/moment.min.js'], function (record, search, moment) {

    function beforeSubmit(context) {
        var currentRecord = context.newRecord;

        var totalUangMuka = 0;

        var getCurrency = currentRecord.getValue('currency');
        var getTranId = currentRecord.getValue('tranid');
        var accountId = 0

        if (getCurrency == "1") {
            accountId = 4490;
        } else if (getCurrency == "2") {
            accountId = 4491;
        } else if (getCurrency == "6") {
            accountId = 4493;
        } else if (getCurrency == "7") {
            accountId = 4492;
        }

        var getLineCount = currentRecord.getLineCount('item');

        for (let x = 0; x < getLineCount; x++) {
            var itemTotalPrice = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                line: x
            });
            totalUangMuka += itemTotalPrice;
        }

        log.debug("amount", totalUangMuka);
        log.debug("accountId", accountId);
        log.debug("getTranId", getTranId);
        log.debug("context.type", context.type);
        var setAmountValue = currentRecord.setValue({
            fieldId: 'custbody_me_amount_uang_muka',
            value: totalUangMuka,
        })

        var setAccountMuka = currentRecord.setValue({
            fieldId: 'custbody_me_account_uang_muka',
            value: accountId,
        })
        var setTranId = currentRecord.setValue({
            fieldId: 'custbody_me_no_trans_uang_muka',
            value: getTranId,
        })

    }


    return {

        beforeSubmit: beforeSubmit
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/search', 'N/record', 'N/currency', './library/moment.min.js'], function(search, record, currency, moment) {

    function searchWriteCheck(data) {
        
    }

    function fieldChanged(context) {
        var currentRecord = context.currentRecord;

        var getWcPrepay = currentRecord.getValue('custbody_me_vendor_prepay')
        var getWcPrepayText = currentRecord.getText('custbody_me_vendor_prepay')


            var checkLoad = record.load({
                type: record.Type.CHECK, 
                id: getWcPrepay,
            });

            var amountUm = checkLoad.getValue('custbody_me_amount_uang_muka');
            var checkId = checkLoad.getValue('internalid');
            var currencyData = checkLoad.getValue('currency');
            var entityId = checkLoad.getValue('entity');

            // var getWriteCheck = search.lookupFields({
            //     type: search.Type.CHECK,
            //     id: getWcPrepay,
            //     columns: ['custbody_me_account_uang_muka', 'custbody_me_amount_uang_muka', 'custbody_me_no_trans_uang_muka', 'currency']
            // });
            // var accountUm =  getWriteCheck.custbody_me_account_uang_muka;
            // // var amountUm = getWriteCheck.custbody_me_amount_uang_muka;
            // // var transactionUm = getWriteCheck.custbody_me_no_trans_uang_muka;
            // // var currency = getWriteCheck.currency;

            // log.debug("accountUm",accountUm);
            log.debug("amountUm",amountUm);
            
            log.debug("currency",currencyData);
            
            
            var ratePUMToIdr = currency.exchangeRate({
                source: currencyData,
                target: 1,
                date: new Date(moment().format('M/D/YYYY'))
            });
            
            

            // var setVendUm = currentRecord.setValue({
            //     fieldId: 'custbody_me_vendor_prepay',
            //     value: checkId
            // });
            var setVendUmCurrency = currentRecord.setValue({
                fieldId: 'custbody_me_vendor_prepayment_um_curr',
                value: currencyData,
                ignoreFieldChange: true
            });
            var setVendUmOutstanding = currentRecord.setValue({
                fieldId: 'custbody_me_prepay_um_outstanding',
                value: amountUm,
                ignoreFieldChange: true
            });
            var setVendor = currentRecord.setValue({
                fieldId: 'custbody_me_vendor',
                value: entityId,
                ignoreFieldChange: true
            });

            // Set Exchange Rate settlement to IDR
            
            var getSettlementCurrency = currentRecord.getValue('custbody_me_child_settle_currency');
            var setPUMToIdr = currentRecord.setValue({
                fieldId: 'custbody_me_child_settle_ex_rpum_ridr',
                value: ratePUMToIdr,
                ignoreFieldChange: true,
            })
            var rateSettleToIdr = currency.exchangeRate({
                source: getSettlementCurrency,
                target: 1,
                date: new Date(moment().format('M/D/YYYY'))
            })

            var setSettleToIdr = currentRecord.setValue({
                fieldId: 'custbody_me_child_settle_ex_rstl_ridr',
                value: rateSettleToIdr,
                ignoreFieldChange: true,
            })



    }



    return {

        fieldChanged: fieldChanged,
    }
});

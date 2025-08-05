/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function() {

    function beforeSubmit(context) {
        var rec = context.newRecord;

        var lineCount = rec.getLineCount({
            sublistId: 'item'
        });

        var isBoundedZone = rec.getValue('custbody_me_bounded_zone');
        var getCurrency = rec.getValue('currency');

        var totalDpp = 0;
        var totalPpn = 0;

        for (let i = 0; i < lineCount; i++) {

            var getBoundedZoneAmount = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                line: i,
            })
            var ppnBounded = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_ppn_idr',
                line: i,
            })
            var getTaxRate = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'taxrate1',
                line: i,
            })

            var getBoundedAmountNumber = Number(getBoundedZoneAmount);
            // var getamountNumber = Number(amount);
            // var getTaxRatetNumber = Number(getTaxRate);

            if (isBoundedZone == '1' && getCurrency == 5) {
                totalDpp += Number(getBoundedAmountNumber);
                totalPpn += Number(ppnBounded)
            }
            if (isBoundedZone == '1' && getCurrency != 5) {
                totalDpp += Number(getBoundedAmountNumber);
                totalPpn += Number(ppnBounded)
            }
            if (isBoundedZone == '2' && getCurrency == 5) {
                totalDpp += Number(getBoundedAmountNumber);
                totalPpn += Number(ppnBounded)
            }
            if (isBoundedZone == '2' && getCurrency != 5) {
                totalDpp += Number(getBoundedAmountNumber);
                totalPpn += Number(ppnBounded)
            }
            
        }

        var setTotDpp = rec.setValue('custbody_me_tot_dpp', totalDpp);
        var setTotPpn = rec.setValue('custbody_me_tot_ppn', totalPpn);
    }

    return {
        beforeSubmit: beforeSubmit,

    }
});

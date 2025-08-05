/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/url', 'N/format', 'N/record', "N/runtime", 'N/currentRecord', 'N/error'], function (search, serverWidget, log, task, redirect, url, format, record, runtime, currentRecord, error) {

    function onRequest(context) {

        var getCurrentRecId = context.request.parameters.id;
        var getClearing1 = context.request.parameters.clearing1;
        var getClearing2 = context.request.parameters.clearing2;
        var getBillCredit = context.request.parameters.billCredit;
        var getChecks = context.request.parameters.checks;

        log.debug("getClearing1", getClearing1);
        log.debug("getClearing2", getClearing2);
        log.debug("getBillCredit", getBillCredit);

        if (getClearing1 != "") {
            var deleteClearing1 = record.delete({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing1,
            });
        }

        if (getClearing2 != "") {
            var deleteClearing2 = record.delete({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing2,
            });
        }

        if (getBillCredit != "") {
            var deleteBillCredit = record.delete({
                type: 'vendorcredit',
                id: getBillCredit,
            });
        }

        if (getChecks != "") {
            var totalSettlementAmount = 0;

            var searchChildSettlement = search.create({
                type: "customrecord_me_child_settle_multicrr_ap",
                filters:
                [
                   ["custrecord_me_settlement_multicrr_ap","anyof",getCurrentRecId]
                ],
                columns:
                [
                   search.createColumn({name: "custrecord_me_child_settle_prepay_amount", label: "ME - Prepayment Amount"})
                ]
             }).run().getRange({
                start:0,
                end:1000,
             });
             
             for (let x = 0; x < searchChildSettlement.length; x++) {
                var getAmount = searchChildSettlement[x].getValue(searchChildSettlement[x].columns[0])
                totalSettlementAmount += getAmount;
             }

             var loadCheck = record.load({
                type:'check',
                id: getChecks,
             });

             var getSettlementAmount = loadCheck.getValue('custbody_me_settlement_amount');
             var setSettlementAmount = loadCheck.setValue({
                fieldId: 'custbody_me_settlement_amount',
                value: Number(getSettlementAmount - totalSettlementAmount),
             });

             loadCheck.save()


        }
        var deleteCurrentRecord = record.delete({
            type: 'customtransaction_me_settlmnt_multicr_ap',
            id: getCurrentRecId,
        });

        redirect.redirect({
            url: 'https://8912038-sb1.app.netsuite.com/app/accounting/transactions/transactionlist.nl?Transaction_TYPE=Custom140',
        });
    }

    return {
        onRequest: onRequest
    }
});


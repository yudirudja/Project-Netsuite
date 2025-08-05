/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(['N/currency', './lib/moment.min.js', 'N/search', 'N/record', 'N/redirect'], function (currency, moment, search, record, redirect) {

    function searchInvoice(param) {

        var invoiceSearchObj = search.create({
            type: "invoice",
            filters:
            [
               ["type","anyof","CustInvc"], 
               "AND", 
               ["createdfrom","anyof",param], 
               "AND", 
               ["mainline","is","T"]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
         }).run().getRange({
            start:0,
            end: 1000,
         });

         var invArr = []

         for (let i = 0; i < invoiceSearchObj.length; i++) {
            var getInternalId = invoiceSearchObj[i].getValue(invoiceSearchObj[i].columns[0])

            invArr.push(getInternalId)
            
         }
         return invArr;
        
    }

    function onRequest(context) {
        var paramData = JSON.parse(context.request.parameters.custscript_me_param_inv);

        log.debug('paramData',paramData)

        var getInvoiceId = searchInvoice(paramData)

        for (let i = 0; i < getInvoiceId.length; i++) {
            var rec = record.load({
                type: 'invoice',
                id: getInvoiceId[i],
            });

            
            rec.save()
            
        }

        redirect.toRecord({
            type: record.Type.SALES_ORDER, 
            id: paramData,
        });



    }

    return {
        onRequest: onRequest
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
 define(['N/currency', './lib/moment.min.js', 'N/search', 'N/record'], function (currency, moment, search, record) {


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
         log.debug('invArr',invArr)
         return invArr;
        
    }

    function onAction(context) {
        var rec = context.newRecord;

        
        var getSoId = rec.getValue('internalid')
        log.debug('getSoId',getSoId)
        log.debug('rec.id',rec.id)


        var getInvoiceId = searchInvoice(rec.id)

        for (let i = 0; i < getInvoiceId.length; i++) {
            var rec = record.load({
                type: record.Type.INVOICE, 
                id: getInvoiceId[i],
                isDynamic: true,
            });

            rec.save()
            
        }



    }

    return {
        onAction: onAction
    }
});


/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record'], function(search, record) {

    function execute(context) {
        var purchaserequisitionSearchObj = search.create({
            type: "purchaserequisition",
            filters:
            [
               ["type","anyof","PurchReq"], 
               "AND", 
               ["custbody_me_bu_approver","anyof","@NONE@"], 
               "AND", 
               ["mainline","is","T"]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
         }).run().getRange({
            start: 0,
            end: 1000,
         });

         var idArr =[];
         for (let i = 0; i < purchaserequisitionSearchObj.length; i++) {
            var getInternalId = purchaserequisitionSearchObj[i].getValue(purchaserequisitionSearchObj[i].columns[0]);
            idArr.push(getInternalId);
         }

         for (let i = 0; i < idArr.length; i++) {
            var record_id = record.load({
                type: record.Type.PURCHASE_REQUISITION, 
                id: idArr[i],
                // isDynamic: true,
            });

            record_id.save();
            
         }
    }

    return {
        execute: execute
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record'], function(search, record) {

    function execute(context) {
        var inventoryitemSearchObj = search.create({
            type: "inventoryitem",
            filters:
            [
               ["type","anyof","InvtPart"], 
               "AND", 
               ["name","contains","Ã¸"]
            ],
            columns:
            [
               search.createColumn({name: "itemid", label: "Name"}),
               search.createColumn({name: "displayname", label: "Display Name"}),
               search.createColumn({name: "internalid", label: "Internal ID"}),
               search.createColumn({name: "purchasedescription", label: "Purchase Description"})
            ]
         }).run().getRange({
            start:0,
            end:1000
         });

         for (let i = 0; i < inventoryitemSearchObj.length; i++) {
            var loadItem = record.load({
                type: record.Type.INVENTORY_ITEM,
                id: inventoryitemSearchObj[i].getValue(inventoryitemSearchObj[i].columns[2]),                
            });

            var replaceTextName = (inventoryitemSearchObj[i].getValue(inventoryitemSearchObj[i].columns[0])).replace("Ã¸","ø")
            var replaceTextDisplayName = (inventoryitemSearchObj[i].getValue(inventoryitemSearchObj[i].columns[1])).replace("Ã¸","ø")
            // var replaceTextPurchDesc = (inventoryitemSearchObj[i].getValue(inventoryitemSearchObj[i].columns[3])).replace("Ã¸","ø")

            loadItem.setValue('itemid', replaceTextName)
            loadItem.setValue('displayname', replaceTextDisplayName)
            loadItem.setValue('purchasedescription', replaceTextDisplayName)

            loadItem.save()
         }

    }

    return {
        execute: execute
    }
});

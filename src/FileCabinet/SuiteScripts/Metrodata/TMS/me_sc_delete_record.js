/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record'], function (search, record) {

    function execute(context) {

        var itemfulfillmentSearchObj = search.create({
            type: "inventorytransfer",
            filters:
            [
                ["type","anyof","InvTrnfr"], 
                "AND", 
                ["mainline","is","T"]
             ],
            columns:
                [
                    //    search.createColumn({
                    //       name: "appliedtotransaction",
                    //       summary: "GROUP",
                    //       label: "Applied To Transaction"
                    //    }),
                    //    search.createColumn({
                    //     name: "type",
                    //     join: "appliedToTransaction",
                    //     summary: "GROUP",
                    //     label: "Type"
                    //  }),
                    //  search.createColumn({
                    //     name: "applyingtransaction",
                    //     summary: "GROUP",
                    //     label: "Applying Transaction"
                    //  }),
                    // search.createColumn({
                    //     name: "internalid",
                    //     summary: "GROUP",
                    //     label: "Internal ID"
                    // }),
                    // search.createColumn({name: "id", label: "ID"}),
                    search.createColumn({name: "internalid", label: "Internal ID"})
                ]
        }).run().getRange({
            start: 0,
            end: 1000
        });

        var idArr = []
        for (let i = 0; i < itemfulfillmentSearchObj.length; i++) {
            var getInternal = itemfulfillmentSearchObj[i].getValue(itemfulfillmentSearchObj[i].columns[0]);
            // var type = itemfulfillmentSearchObj[i].getText(itemfulfillmentSearchObj[i].columns[1]);

            idArr.push({
                getInternal: getInternal,
                // type:type
            })
        }
        
        log.debug('idArr',idArr)


        for (let i = 0; i < idArr.length; i++) {
            // if ((idArr[i].type).includes('Item Receipt')) {
            //     var loadRec = record.delete({
            //         type: record.Type.ITEM_RECEIPT, 
            //         id: idArr[i].getInternal,
            //         // isDynamic: true,
            //     });
            // }
            // if ((idArr[i].type).includes('Purchase Order')) {
            //     var loadRec = record.delete({
            //         type: record.Type.PURCHASE_ORDER, 
            //         id: idArr[i].getInternal,
            //         // isDynamic: true,
            //     });
            // }
            // if ((idArr[i].getInternal)) {
                log.debug('idArr[i].getInternal',idArr[i].getInternal)
                try {
                    
                    var loadRec = record.delete({
                        type: 'inventorytransfer',
                        id: idArr[i].getInternal,
                        // isDynamic: true,
                    });
                } catch (error) {
                    
                }
            // }
        }



    }

    return {
        execute: execute
    }
});

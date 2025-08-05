/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/error', 'N/record'], function (error, record) {

    function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        var line = context.line;

        log.debug("test1", line);

        var getItem = currentRecord.getCurrentSublistValue('item', 'item');

        log.debug("test2", getItem);
        log.debug("test2", getItem);

        // var getlineCount = currentRecord.getLineCount();
        if (getItem != "") {
            
        

        var itemMaster = record.load({
            type: record.Type.INVENTORY_ITEM,
            id: getItem,
            isDynamic: true,
        });
        log.debug("test3", "test3");
        
        var getUsd = itemMaster.getValue({
            fieldId: 'custitem_me_last_purchase_price_usd',
        });
        log.debug("getUsd", getUsd);
        var getHkd = itemMaster.getValue({
            fieldId: 'custitem_me_last_purchase_price_hkd',
        });
        log.debug("getHkd", getHkd);
        var getSgd = itemMaster.getValue({
            fieldId: 'custitem_me_last_purchase_price_sgd',
        });
        log.debug("getSgd", getSgd);
        var getIdr = itemMaster.getValue({
            fieldId: 'custitem_me_last_purchase_price_idr',
        }); 
        log.debug("getIdr", getIdr);
        
        if (sublistName === 'item' && (sublistFieldName === 'custcol_me_last_pur_price_usd')) {

            currentRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_last_pur_price_usd',
                value: getUsd,
            });
        }
            // currentRecord.setCurrentSublistValue({
            //     sublistId: 'item',
            //     fieldId: 'custcol_me_last_pur_price_hkd',
            //     value: getHkd == "" ? 0 : getHkd,
            // });

            // currentRecord.setCurrentSublistValue({
            //     sublistId: 'item',
            //     fieldId: 'custcol_me_last_pur_price_sgd',
            //     value: getSgd == "" ? 0 : getSgd,
            // });

            // currentRecord.setCurrentSublistValue({
            //     sublistId: 'item',
            //     fieldId: 'lastpurchaseprice',
            //     value: getIdr == "" ? 0 : getIdr,
            // });


    }

    }

    return {
        fieldChanged: fieldChanged,
    };

});


// function searchItem(params) {
//     data = [];
//     var itemSearchObj = search.create({
//         type: "item",
//         filters:
//             [
//                 ["transaction.type", "anyof", "VendBill"],
//                 "AND",
//                 ["type", "anyof", "NonInvtPart", "InvtPart"],
//                 "AND",
//                 ["internalid", "anyof", params]
//             ],
//         columns:
//             [
//                 search.createColumn({ name: "custitem_me_last_purchase_price_hkd", label: "ME - Last Purchase Price HKD" }),
//                 search.createColumn({ name: "custitem_me_last_purchase_price_idr", label: "ME - Last Purchase Price IDR" }),
//                 search.createColumn({ name: "custitem_me_last_purchase_price_sgd", label: "ME - Last Purchase Price SGD" }),
//                 search.createColumn({ name: "custitem_me_last_purchase_price_usd", label: "ME - Last Purchase Price USD" })
//             ]
//     }).run().getRange({
//         start: 0,
//         end: 1,
//     });

//     data.push({
//         hkd: itemSearchObj[0].getValue(itemSearchObj[0].columns[0]),
//         idr: itemSearchObj[0].getValue(itemSearchObj[0].columns[1]),
//         sgd: itemSearchObj[0].getValue(itemSearchObj[0].columns[2]),
//         usd: itemSearchObj[0].getValue(itemSearchObj[0].columns[3]),
//     });

//     return data;

// }
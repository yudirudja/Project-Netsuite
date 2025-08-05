/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define([], function() {

    function execute(context) {
        var result = [];
        var countDup = 0;
        var meChildSearch = search.create({
            type: "customrecord_me_gem_breakdown_line_list",
            filters:
            [
            ],
            columns:
            [
               search.createColumn({name: "custrecord_me_item_sku_code", label: "ME - SKU Item Code"}),
               search.createColumn({name: "custrecord_me_item_sku_price", label: "ME - Unit Price"}),
               search.createColumn({
                  name: "internalid",
                  join: "CUSTRECORD_ME_BEM_NUMBER",
                  sort: search.Sort.DESC,
                  label: "gem internal id"
               }),
               search.createColumn({
                  name: "internalid",
                  join: "CUSTRECORD_ME_ITEM_SKU_CODE",
                  sort: search.Sort.DESC,
                  label: "item internal id"
               }),
               search.createColumn({
                name: "custrecord_me_gem_break_parent",
                join: "CUSTRECORD_ME_BEM_NUMBER",
                label: "ME - Currency"
             }),
            ]
         }).run().getRange({
            start:0,
            end:1000,
         });

         for (let x = 0; x < meChildSearch.length; x++) {
             var itemId = meChildSearch[x].getValue(meChildSearch[x].columns[0]);
             var itemInternalId = meChildSearch[x].getValue(meChildSearch[x].columns[3]);
             var unitPrice = meChildSearch[x].getValue(meChildSearch[x].columns[1]);
             var currency = meChildSearch[x].getText(meChildSearch[x].columns[4]);

             for (let x = 0; x < result.length; x++) {
                if (result[x].item_id == itemId) {
                    countDup++;
                }
            }

             if (countDup<1) {
                result.push({
                    item_id: itemId,
                    unit_price: unitPrice,
                    currency: currency,
                });

                if ((currency).includes("Rupiah")) {
                    log.debug("check idr estimate rate",unitPrice);
                    var getInventoryItem = record.submitFields({
                        type: record.Type.INVENTORY_ITEM,
                        id: Number(itemId),
                        values: {
                            custitem_me_last_purchase_price_idr: Number(unitPrice),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
    
                }
                if ((currency).includes("Hong Kong Dollar")) {
                    log.debug("check hkd estimate rate", unitPrice);
                    var getInventoryItem = record.submitFields({
                        type: record.Type.INVENTORY_ITEM,
                        id: Number(itemId),
                        values: {
                            custitem_me_last_purchase_price_hkd: Number(unitPrice),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
    
                }
                if ((currency).includes("Singapore Dollar")) {
                    log.debug("check sgd estimate rate", unitPrice);
                    var getInventoryItem = record.submitFields({
                        type: record.Type.INVENTORY_ITEM,
                        id: Number(itemId),
                        values: {
                            custitem_me_last_purchase_price_sgd: Number(unitPrice),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
    
                }
                if ((currency).includes("US Dollar")) {
                    log.debug("check usd estimate rate", unitPrice);
                    var getInventoryItem = record.submitFields({
                        type: record.Type.INVENTORY_ITEM,
                        id: Number(itemId),
                        values: {
                            custitem_me_last_purchase_price_usd: Number(unitPrice),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                }

             }
            
         }

         
        
    }

    return {
        execute: execute
    }
});

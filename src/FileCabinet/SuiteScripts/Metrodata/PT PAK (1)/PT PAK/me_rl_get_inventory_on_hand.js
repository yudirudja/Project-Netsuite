/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(["N/search"], function(search) {

    function itemMasterSearch() {
        var itemSearchObjS = search.create({
            type: "item",
            filters:
            [
            ],
            columns:
            [
               search.createColumn({
                  name: "itemid",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({name: "type", label: "Type"}),
               search.createColumn({
                  name: "name",
                  join: "inventoryLocation",
                  label: "Name"
               }),
               search.createColumn({name: "locationaveragecost", label: "Location Average Cost"}),
               search.createColumn({name: "locationquantityonhand", label: "Location On Hand"}),
               search.createColumn({name: "locationquantityavailable", label: "Location Available"}),
               search.createColumn({name: "locationquantityintransit", label: "Location In Transit"}),
               search.createColumn({name: "locationquantitycommitted", label: "Location Committed"}),
               search.createColumn({name: "locationquantitybackordered", label: "Location Back Ordered"})
            ]
         });

         var itemMasterData = [];

         var startrow = 0;

         do {
            var itemSearchObj = itemSearchObjS.run().getRange({
                start: startrow,
                end: startrow + 1000
            });
            for (let i = 0; i < itemSearchObj.length; i++) {
               var itemId = itemSearchObj[i].getValue(itemSearchObj[i].columns[0])
               var itemText = itemSearchObj[i].getText(itemSearchObj[i].columns[0])
               var type = itemSearchObj[i].getValue(itemSearchObj[i].columns[1])
               var name = itemSearchObj[i].getValue(itemSearchObj[i].columns[2])
               var locationaveragecost = itemSearchObj[i].getValue(itemSearchObj[i].columns[3])
               var locationquantityonhand = itemSearchObj[i].getValue(itemSearchObj[i].columns[4])
               var locationquantityavailable = itemSearchObj[i].getValue(itemSearchObj[i].columns[5])
               var locationquantityintransit = itemSearchObj[i].getValue(itemSearchObj[i].columns[6])
               var locationquantitycommitted = itemSearchObj[i].getValue(itemSearchObj[i].columns[7])
               var locationquantitybackordered = itemSearchObj[i].getValue(itemSearchObj[i].columns[8])
   
               itemMasterData.push({
                   itemId: itemId,
                   type: type,
                   name: name,
                   locationaveragecost: Number(locationaveragecost),
                   locationquantityonhand: Number(locationquantityonhand),
                   locationquantityavailable: Number(locationquantityavailable),
                   locationquantityintransit: Number(locationquantityintransit),
                   locationquantitycommitted: Number(locationquantitycommitted),
                   locationquantitybackordered: Number(locationquantitybackordered),
                   name_combine: (itemId + " - " + name),
               })
   
           }
           startrow+=1000
         } while (itemSearchObj.length == 1000);

        log.debug("itemMasterData", itemMasterData);
        
        return itemMasterData;
    }

    function itemLocationConfigurationSearch() {
        var itemlocationconfigurationSearchObjs = search.create({
            type: "itemlocationconfiguration",
            filters:
            [
            ],
            columns:
            [
                search.createColumn({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
               }),
               search.createColumn({name: "item", label: "Item"}),
               search.createColumn({name: "location", label: "Location"}),
               search.createColumn({name: "custrecord_me_qty_committed_pcs", label: "ME - Qty Committed (Pcs)"}),
               search.createColumn({name: "custrecord_me_qty_available_pcs", label: "ME - Qty Available (Pcs)"}),
               search.createColumn({name: "custrecord_me_qty_intransit_pcs", label: "ME - Qty In Transit (Pcs)"}),
               search.createColumn({name: "custrecord_me_qty_back_order_pcs", label: "ME - Qty Back Order (Pcs)"}),
               search.createColumn({name: "custrecord_me_qty_onhand_pcs", label: "ME - Qty OnHand (Pcs)"})
            ]
        });

        var itemlocationconfigurationData = [];

        var startrow = 0;

        do {
            var itemlocationconfigurationSearchObj = itemlocationconfigurationSearchObjs.run().getRange({
                start: startrow,
                end: startrow + 1000
            });
            for (let i = 0; i < itemlocationconfigurationSearchObj.length; i++) {
                var name = itemlocationconfigurationSearchObj[i].getValue(itemlocationconfigurationSearchObj[i].columns[0])
                // var nameText = itemlocationconfigurationSearchObj[i].getText(itemlocationconfigurationSearchObj[i].columns[0])
                var location = itemlocationconfigurationSearchObj[i].getValue(itemlocationconfigurationSearchObj[i].columns[2])
                var locationText = itemlocationconfigurationSearchObj[i].getText(itemlocationconfigurationSearchObj[i].columns[2])
                var custrecord_me_qty_committed_pcs = itemlocationconfigurationSearchObj[i].getValue(itemlocationconfigurationSearchObj[i].columns[3])
                var custrecord_me_qty_available_pcs = itemlocationconfigurationSearchObj[i].getValue(itemlocationconfigurationSearchObj[i].columns[4])
                var custrecord_me_qty_intransit_pcs = itemlocationconfigurationSearchObj[i].getValue(itemlocationconfigurationSearchObj[i].columns[5])
                var custrecord_me_qty_back_order_pcs = itemlocationconfigurationSearchObj[i].getValue(itemlocationconfigurationSearchObj[i].columns[6])
                var custrecord_me_qty_onhand_pcs = itemlocationconfigurationSearchObj[i].getValue(itemlocationconfigurationSearchObj[i].columns[7])
                
                itemlocationconfigurationData.push({
                    name: name,
                    // nameText: nameText,
                    location: location,
                    location_text: locationText,
                    custrecord_me_qty_committed_pcs: custrecord_me_qty_committed_pcs,
                    custrecord_me_qty_available_pcs: custrecord_me_qty_available_pcs,
                    custrecord_me_qty_intransit_pcs: custrecord_me_qty_intransit_pcs,
                    custrecord_me_qty_back_order_pcs: custrecord_me_qty_back_order_pcs,
                    custrecord_me_qty_onhand_pcs: custrecord_me_qty_onhand_pcs,
                    // name_combine: (nameText + " - " + location),
                })
    
            }
            startrow+=1000;
        } while (itemlocationconfigurationSearchObj.length == 1000);
        
        log.debug("itemlocationconfigurationData", itemlocationconfigurationData);
        
        return itemlocationconfigurationData;
    }

    function _get(context) {
        
        var getItemMaster = itemMasterSearch();
        var getItemLocation = itemLocationConfigurationSearch();
        
        var finalData = [];

        
        for (let x = 0; x < getItemMaster.length; x++) {
            for (let i = 0; i < getItemLocation.length; i++) {
                if (getItemLocation[i].name == getItemMaster[x].name_combine) {
                    finalData.push({
                        item: getItemMaster[x].itemId,
                        location: getItemLocation[i].location_text,
                        location_average_cost: getItemMaster[x].locationaveragecost,
                        quantity_on_hand_ct: getItemMaster[x].locationquantityonhand,
                        quantity_onhand_pcs: getItemLocation[i].custrecord_me_qty_onhand_pcs,
                        quantity_available_ct: getItemMaster[x].locationquantityavailable,
                        quantity_available_pcs: getItemLocation[i].custrecord_me_qty_available_pcs,
                        quantity_intransit_ct: getItemMaster[x].locationquantityintransit,
                        quantity_intransit_pcs: getItemLocation[i].custrecord_me_qty_intransit_pcs,
                        quantity_committed_ct: getItemMaster[x].locationquantitycommitted,
                        quantity_committed_pcs: getItemLocation[i].custrecord_me_qty_committed_pcs,
                        quantity_backordered_ct: getItemMaster[x].locationquantitybackordered,
                        quantity_back_order_pcs: getItemLocation[i].custrecord_me_qty_back_order_pcs,
                    });
                }
            }
            
        }

        return finalData;
    }

    return {
        get: _get,

    }
});

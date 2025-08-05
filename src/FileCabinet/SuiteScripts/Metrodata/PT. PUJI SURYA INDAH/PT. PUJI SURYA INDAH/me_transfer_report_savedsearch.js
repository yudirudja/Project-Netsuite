/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define([], function() {
    
    function onRequest(context) {
        
        var requestparam = context.request.parameters;

        var vendorId = JSON.parse(requestparam.vendorId);

        log.debug('request param', requestparam)

        var vendorName = JSON.parse(requestparam.vendorName);
        var vendorNameString = ""
        if (vendorName.length == 0) {
            vendorNameString = "ALL"
        } else {
            for (v = 0; v < vendorName.length; v++) {
                if (vendorNameString != "") {
                    vendorNameString += " , ";
                }
                vendorNameString = vendorNameString + vendorName[v]
            }
        }
        log.debug('vendor name', vendorNameString)

        var locationId = JSON.parse(requestparam.locationId);
        var locationName = JSON.parse(requestparam.locationName);
        var LocationNameString = ""
        if (locationName.length == 0) {
            LocationNameString = "ALL"
        } else {
            for (v = 0; v < locationName.length; v++) {
                if (LocationNameString != "") {
                    LocationNameString += " , ";
                }
                LocationNameString = LocationNameString + locationName[v]

            }
        }

        var itemId = JSON.parse(requestparam.itemId);
        var itemName = JSON.parse(requestparam.itemName);
        var itemNameCode = []
        var itemNameString = ''

        // if (selectedValues.length === options.length) {
        //     output = "ALL";
        //   } else if (selectedValues.length > 0) {
        //     output = selectedValues.join(", ");
        //   } else {
        //     output = "Tidak ada pilihan yang dipilih";
        //   }
        if (itemName.length == 0) {
            itemNameCode = "ALL"
            for (v = 0; v < itemName.length; v++) {
                var text = itemName[v];
                if (text.length > 0) {
                    var result = text.split('-');
                }
                itemNameCode.push(result[0])
            }
        }

        var start = JSON.parse(requestparam.start);
        var end = JSON.parse(requestparam.end);
        var checkbox = JSON.parse(requestparam.view)
        var product = JSON.parse(requestparam.productName)
        if (product.length === 0) {
            product = "ALL"
        }


        var chckTampilPurch = JSON.parse(requestparam.tampilPurchase)

        log.debug('vendor Id', vendorId)
        log.debug("item", itemId)
        log.debug('item name', itemName)
        log.debug('item name code', itemNameCode)
        // log.debug('item name string',itemNameString)
        // log.debug('produk name', productName)
        // log.debug(' check', checkbox)

        var transferorderSearchObj = search.create({
            type: "transferorder",
            filters:
            [
               ["type","anyof","TrnfrOrd"], 
               "AND", 
               ["trandate","within",start,end],
               "AND",
               ["location","anyof",""],
            ],
            columns:
            [
               search.createColumn({name: "tranid", label: "Document Number"}),
               search.createColumn({name: "item", label: "Item"}),
               search.createColumn({
                  name: "tranid",
                  join: "fulfillingTransaction",
                  label: "Document Number"
               }),
               search.createColumn({name: "trandate", label: "Date"}),
               search.createColumn({
                  name: "trandate",
                  join: "fulfillingTransaction",
                  label: "Date"
               }),
               search.createColumn({name: "location", label: "Location"}),
               search.createColumn({name: "transferlocation", label: "To Location"}),
               search.createColumn({name: "quantityshiprecv", label: "Quantity Fulfilled/Received"}),
               search.createColumn({name: "custcol_me_qtycarton", label: "ME - Carton"}),
               search.createColumn({name: "custcol_me_qtypcs", label: "ME - Pcs"}),
               search.createColumn({
                  name: "custcol_me_qtycarton",
                  join: "fulfillingTransaction",
                  label: "ME - Carton"
               }),
               search.createColumn({
                  name: "custcol_me_qtypcs",
                  join: "fulfillingTransaction",
                  label: "ME - Pcs"
               }),search.createColumn({
                    name: "custcol_me_qtycarton",
                    join: "inventoryItem",
                    label: "ME - Carton"
             }),
            ]
         });
        
    }

    return {
        onRequest: onRequest
    }
});
 
 /*
 transferorderSearchObj.id="customsearch1680755088002";
 transferorderSearchObj.title="Custom ME - Transfer Order Report (copy)";
 var newSearchId = transferorderSearchObj.save();
 */
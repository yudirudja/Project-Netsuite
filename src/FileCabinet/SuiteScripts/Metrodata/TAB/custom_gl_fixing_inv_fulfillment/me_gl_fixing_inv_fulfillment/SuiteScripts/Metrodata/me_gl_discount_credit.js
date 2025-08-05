function customizeGlImpact(transactionRecord, standardLines, customLines) {
    /******* CUSTOM COLUMN FIELDS *******
     ____________________________________
     BASE AMOUNT
     * custcol_me_base_amt
     ____________________________________
     DISCOUNTS
     * custcol_me_disc1
     * custcol_me_disc2
     * custcol_me_disc3
     ____________________________________
     AMOUNT DISCOUNT
     * custcol_me_amt_disc1
     * custcol_me_amt_disc2
     * custcol_me_amt_disc3
     * custcol_me_amt_disc4
     ____________________________________
     AFTER DISCOUNTS [NET]
     * custcol_me_amt_afterdisc1
     * custcol_me_amt_afterdisc2
     * custcol_me_net_amt_afterdisc3
     * custcol_me_net_amt_afterdisc4
     ************************************/

    // Set the GL account for discounts
    var accdisc = 336; // account internal ID PROD
    // var accdisc = 969; // account internal ID SB

    var ar = 119;

    var recType = transactionRecord.getRecordType(); // Get the transaction type

    // Only apply for invoices
    if (recType === "invoice") {
        var numLines = standardLines.getCount(); // Count of standard GL lines
        var invoiceId = transactionRecord.getId(); // Get the invoice ID
        var lineItem = transactionRecord.getLineItemCount('item'); // Number of items on the transaction
        var totalDiscount = 0; // Variable to accumulate total discount

        // nlapiLogExecution('DEBUG', 'Available Methods', JSON.stringify(Object.getOwnPropertyNames(customLines)));

        var department = transactionRecord.getFieldValue('department');
        nlapiLogExecution('DEBUG', 'Department Value', department);

        var discountMap = {}; // Object to hold discounts categorized by Brand and Class

        for (var i = 1; i <= lineItem; i++) { // Loop through each item (1-based index)
            // Get the Item from the current line
            var itemId = transactionRecord.getLineItemValue('item', 'item', i); // Retrieve item internal ID
            var itemType = transactionRecord.getLineItemValue('item', 'itemtype', i); // Get the Item Type
            var brand = transactionRecord.getLineItemValue('item', 'cseg_me_brand', i);
            var itemClass = transactionRecord.getLineItemValue('item', 'class', i);

            // Log the item ID
            nlapiLogExecution('DEBUG', 'Item ID', 'Item ID: ' + itemId);

            // Determine the correct record type based on the item type
            var itemRecordType;
            switch (itemType) {
                case 'InvtPart': // Inventory Item
                    itemRecordType = 'inventoryitem';
                    break;
                case 'NonInvtPart': // Non-Inventory Item
                    itemRecordType = 'noninventoryitem';
                    break;
                case 'Service': // Service Item
                    itemRecordType = 'serviceitem';
                    break;
                case 'Assembly': // Assembly/Bill of Materials Item
                    itemRecordType = 'assemblyitem';
                    break;
                case 'Kit': // Kit/Package Item
                    itemRecordType = 'kititem';
                    break;
                default:
                    nlapiLogExecution('ERROR', 'Unknown Item Type', 'Item Type: ' + itemType);
                    continue; // Skip this item if the type is unrecognized
            }

            // Load the item record using the correct record type
            var itemRecord = nlapiLoadRecord(itemRecordType, itemId);

            // Get the Income Account ID from the item record
            var incomeAccountId = itemRecord.getFieldValue('incomeaccount'); // Get the internal ID of the income account

            // Log the income account for this item
            nlapiLogExecution('DEBUG', 'Income Account ID', 'Income Account ID: ' + incomeAccountId);

            var disc1 = Math.abs(parseFloat(transactionRecord.getLineItemValue('item', 'custcol_me_base_amt', i)) || 0);
            var disc2 = Math.abs(parseFloat(transactionRecord.getLineItemValue('item', 'custcol_me_net_amt_afterdisc4', i)) || 0);

            var resultdisc = (disc1 - disc2)

            // Create a unique key based on Brand and Class
            var key = (brand || "NoBrand") + "_" + (itemClass || "NoClass") + "_" + (incomeAccountId || "NoIncAcc");

            // Accumulate discounts into the map
            if (!discountMap[key]) {
                discountMap[key] = {
                    acc: incomeAccountId,
                    brand: brand,
                    itemClass: itemClass,
                    totalDiscount: 0
                };
            }

            discountMap[key].totalDiscount += resultdisc;
        }

        nlapiLogExecution("DEBUG", "Total Discount", "Discount Amount = " + JSON.stringify(discountMap));

        for (var key in discountMap) {
            if (discountMap.hasOwnProperty(key)) {
                var entry = discountMap[key];
                var totalDiscount = entry.totalDiscount;
                var incomeAccountId_ = entry.acc;

                if (totalDiscount > 0) {
                    // Create a custom GL line for credit (representing the total discount)
                    var creditLine = customLines.addNewLine();
                    creditLine.setAccountId(parseInt(incomeAccountId_)); // Set the discount account (Internal ID)
                    creditLine.setCreditAmount(totalDiscount); // Credit the discount account with total discount
                    //creditLine.setMemo('ME - Custom GL Discount by Account'); // Optional memo
                    entry.brand?creditLine.setSegmentValueId('cseg_me_brand', parseInt(brand)):"";
                    entry.itemClass?creditLine.setClassId(parseInt(entry.itemClass)):"";
                } else if (totalDiscount < 0) {
                    // Create a custom GL line for debit (representing the total discount)
                    var debitLine = customLines.addNewLine();
                    debitLine.setAccountId(parseInt(incomeAccountId_)); // Set the discount account (Internal ID)
                    debitLine.setDebitAmount(totalDiscount * -1); // Debit the discount account with total discount
                    //debitLine.setMemo('ME - Custom GL Discount by Account'); // Optional memo
                    entry.brand?debitLine.setSegmentValueId('cseg_me_brand', parseInt(brand)):"";
                    entry.itemClass?debitLine.setClassId(parseInt(entry.itemClass)):"";
                }

                if (totalDiscount > 0) {
                    // Create a debit line for positive discounts
                    var debitLine = customLines.addNewLine();
                    debitLine.setAccountId(!entry.itemClass || itemClass.class == '225'?338:accdisc); // Set the discount account
                    debitLine.setDebitAmount(totalDiscount);
                    //debitLine.setMemo("ME - Custom GL Discount by Brand and Class");
                    entry.brand?debitLine.setSegmentValueId("cseg_me_brand", parseInt(entry.brand)):"";
                    entry.itemClass?debitLine.setClassId(parseInt(entry.itemClass)):"";
                } else if (totalDiscount < 0) {
                    // Create a credit line for negative discounts
                    var creditLine = customLines.addNewLine();
                    creditLine.setAccountId(!entry.itemClass || itemClass.class == '225'?338:accdisc); // Set the discount account
                    creditLine.setCreditAmount(-totalDiscount); // Convert to positive for credit
                    //creditLine.setMemo("ME - Custom GL Discount by Brand and Class");
                    entry.brand?creditLine.setSegmentValueId("cseg_me_brand", parseInt(entry.brand)):"";
                    entry.itemClass?creditLine.setClassId(parseInt(entry.itemClass)):"";
                }
            }
        }
    }
}
/**
 * @apiversion 1.x
 * @type CustomGLLinesPlugin
 */
function customizeGlImpact(transactionRecord, standardLines, customLines) {
    try {

        var get_fulfillment = transactionRecord.getFieldValue('custbody_me_related_item_fulfillment');
        const id_voucher_acc = 1138;

        // var load_fulfillment = nlapiLoadRecord("itemfulfillment", get_fulfillment)

        var item_line = transactionRecord.getLineItemCount('item');

        // nlapiLogExecution("DEBUG", "item_line", item_line)

        var standartLineArr = []

        var gl_filtered = [];

        for (var i = 1; i <= item_line; i++) {
            var item = transactionRecord.getLineItemValue("item", "item", i);
            var item_type = transactionRecord.getLineItemValue("item", "itemtype", i);
            var voucher_amount = transactionRecord.getLineItemValue("item", "custcol_me_voucher", i);
            var brand = transactionRecord.getLineItemValue('item', 'cseg_me_brand', i);
            var item_categories = transactionRecord.getLineItemValue('item', 'class', i);
            // var class_ = (standardLines.getLine(i).getClassId()); //uncomment if it has purposes
            // var department = (standardLines.getLine(i).getDepartmentId()); //uncomment if it has purposes

            nlapiLogExecution("DEBUG", "item_type", item_type)

            var itemRecordType;
            switch (item_type) {
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
                    nlapiLogExecution('ERROR', 'Unknown Item Type', 'Item Type: ' + item_type);
                    continue; // Skip this item if the type is unrecognized
            }

            var get_item_income_acc = nlapiLookupField(itemRecordType, item, 'incomeaccount');
            standartLineArr.push({
                account_id: get_item_income_acc,
                voucher_amount: voucher_amount,
                brand: brand,
                item_categories: item_categories,
            })
            nlapiLogExecution("DEBUG", "account_id; voucher_amount; brand; item_categories", get_item_income_acc + "; " + voucher_amount + "; " + brand + "; " + item_categories)
        }
        nlapiLogExecution("DEBUG", "standartLineArr", standartLineArr)


        var param_arr = standartLineArr

        for (var i = 0; i < standartLineArr.length; i++) {
            var total_amount = Number(standartLineArr[i].voucher_amount)

            if (standartLineArr[i] == "") continue

            for (var j = i + 1; j < standartLineArr.length; j++) {
                if (standartLineArr[j] != "" && standartLineArr[i].brand == standartLineArr[j].brand && standartLineArr[i].item_categories == standartLineArr[j].item_categories) {
                    total_amount += Number(standartLineArr[j].voucher_amount)
                    standartLineArr[j] = ""
                }
            }
            nlapiLogExecution("DEBUG", "standartLineArr", standartLineArr)


            gl_filtered.push({
                account_id: standartLineArr[i].account_id,
                voucher_amount: total_amount,
                brand: standartLineArr[i].brand,
                item_categories: standartLineArr[i].item_categories,
            });
        }

        // for (var i = 0; i < gl_filtered.length; i++) {
        //     nlapiLogExecution("DEBUG", "account_id; voucher_amount; brand; item_categories", gl_filtered[i].account_id + "; " + gl_filtered[i].voucher_amount + "; " + gl_filtered[i].brand + "; " + gl_filtered[i].item_categories)

        // }

        for (var i = 0; i < gl_filtered.length; i++) {
            if (Number(gl_filtered[i].voucher_amount) != 0) {

                // if (Number(gl_filtered[i].voucher_amount) != 0) {
                var newLine = customLines.addNewLine();
                newLine.setAccountId(Number(id_voucher_acc));
                (Number(gl_filtered[i].voucher_amount)) > 0 ? newLine.setDebitAmount(Number(gl_filtered[i].voucher_amount)) : newLine.setCreditAmount(Math.abs(gl_filtered[i].voucher_amount));
                // newLine.setMemo(gl_filtered[i].item_categories);
                gl_filtered[i].item_categories?newLine.setClassId(parseInt(gl_filtered[i].item_categories)):""
                newLine.setSegmentValueId('cseg_me_brand', parseInt(gl_filtered[i].brand))

                var newLine = customLines.addNewLine();
                newLine.setAccountId(Number(gl_filtered[i].account_id));
                (Number(gl_filtered[i].voucher_amount)) > 0 ? newLine.setCreditAmount(Number(gl_filtered[i].voucher_amount)) : newLine.setDebitAmount(Math.abs(gl_filtered[i].voucher_amount));
                // newLine.setMemo(gl_filtered[i].item_categories);
                gl_filtered[i].item_categories?newLine.setClassId(parseInt(gl_filtered[i].item_categories)):""
                newLine.setSegmentValueId('cseg_me_brand', parseInt(gl_filtered[i].brand))

                // }
            }





        }



    } catch (error) {
        nlapiLogExecution("DEBUG", "ERROR", error)
    }


}

/**
 * @apiversion 1.x
 * @type CustomGLLinesPlugin
 */
function customizeGlImpact(transactionRecord, standardLines, customLines) {
    try {

        var get_fulfillment = transactionRecord.getFieldValue('custbody_me_related_item_fulfillment');
        const id_intransit = 216;

        var get_fulfill_gl = getCOGSAccountFromItemFulfillment(get_fulfillment);

        for (var i = 0; i < get_fulfill_gl.length; i++) {
            // if (Number(get_fulfill_gl[i].debit_amount) > 0) {
                    //=================debit==========================
                    var newLine = customLines.addNewLine();
                    newLine.setAccountId(Number(get_fulfill_gl[i].account_id));
                    newLine.setDebitAmount(Number(get_fulfill_gl[i].credit_amount));
                    // append old memo to new memo text
                    // newLine.setMemo(""); //uncomment if it's necessary
                    // newLine.setLocationId(Number(get_fulfill_gl[i].location));//uncomment if it's necessary
                    // newLine.setDepartmentId(Number(get_fulfill_gl[i].department)); //uncomment if it's necessary
                    // newLine.setClassId(Number(get_fulfill_gl[i].class_)); //uncomment if it's necessary
                    // newLine.setEntityId(Number(customer_master)); //uncomment if it's necessary
                    //================credit=========================
                    var newLine = customLines.addNewLine();
                    newLine.setAccountId(Number(id_intransit));
                    newLine.setCreditAmount(Number(get_fulfill_gl[i].credit_amount));
                    // append old memo to new memo text
                    // newLine.setLocationId(Number(get_fulfill_gl[i].location)); //uncomment if it's necessary
                    // newLine.setDepartmentId(Number(get_fulfill_gl[i].department)); //uncomment if it's necessary
                    // newLine.setClassId(Number(get_fulfill_gl[i].class_)); //uncomment if it's necessary
                    // newLine.setEntityId(Number(customer_master)); //uncomment if it's necessary
            // }

        }



    } catch (error) {
        nlapiLogExecution("DEBUG", "ERROR", error)
    }


}

function getCOGSAccountFromItemFulfillment(itemFulfillmentId) {
    var results = [];
    nlapiLogExecution('DEBUG', 'Item Fulfillment', itemFulfillmentId);

    var transSearch = nlapiSearchRecord('transaction', null,
        [
            ['internalid', 'is', itemFulfillmentId],
            'AND',
            ["type", "anyof", "ItemShip"],
            "AND",
            ["accounttype", "anyof", "COGS"],
            'AND',
            ['creditamount', 'greaterthan', 0]
        ],
        [
            new nlobjSearchColumn('account'),
            new nlobjSearchColumn('creditamount')
        ]
    );

    for (var i = 0; i < transSearch.length; i++) {
        account = transSearch[i].getValue('account');
        credit_amount = transSearch[i].getValue('creditamount');

        results.push({
            account_id: account,
            credit_amount: credit_amount,
        })
        
    }

    return results;
}

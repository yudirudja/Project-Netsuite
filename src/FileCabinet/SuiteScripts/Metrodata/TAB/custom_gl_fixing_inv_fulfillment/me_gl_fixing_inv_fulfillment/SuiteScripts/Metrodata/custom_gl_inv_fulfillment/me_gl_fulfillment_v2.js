/**
 * @apiversion 1.x
 * @type CustomGLLinesPlugin
 */
function customizeGlImpact(transactionRecord, standardLines, customLines) {
    try {

        var createdFr = transactionRecord.getFieldValue('createdfrom');
        const id_intransit = 216;

        var standartLineArr = []

        for (var i = 0; i < standardLines.getCount(); i++) {
            var credAmount = (standardLines.getLine(i).getCreditAmount());
            var accountId = (standardLines.getLine(i).getAccountId());
            var debAmount = (standardLines.getLine(i).getDebitAmount());
            var location = (standardLines.getLine(i).getLocationId());
            // var class_ = (standardLines.getLine(i).getClassId()); //uncomment if it has purposes
            // var department = (standardLines.getLine(i).getDepartmentId()); //uncomment if it has purposes

            var get_account_type = nlapiLookupField('account', 799,'type')

            if (get_account_type == "COGS") {
                standartLineArr.push({
                    account_id: accountId,
                    credit_amount: credAmount,
                    debit_amount: debAmount,
                    location: location,
                    // class_: class_, //uncomment if it has purposes
                    // department: department, //uncomment if it has purposes
                })

            }

            nlapiLogExecution("DEBUG", "standartLineArr", credAmount + '-' + accountId + '-' + debAmount)
        }
        for (var i = 0; i < standartLineArr.length; i++) {
            if (Number(standartLineArr[i].debit_amount) > 0) {
                    //=================debit==========================
                    var newLine = customLines.addNewLine();
                    newLine.setAccountId(Number(standartLineArr[i].account_id));
                    newLine.setCreditAmount(Number(standartLineArr[i].debit_amount));
                    // append old memo to new memo text
                    // newLine.setMemo(""); //uncomment if it has purposes
                    // newLine.setLocationId(Number(standartLineArr[i].location));//uncomment if it has purposes
                    // newLine.setDepartmentId(Number(standartLineArr[i].department)); //uncomment if it has purposes
                    // newLine.setClassId(Number(standartLineArr[i].class_)); //uncomment if it has purposes
                    // newLine.setEntityId(Number(customer_master)); //uncomment if it has purposes
                    //================credit=========================
                    var newLine = customLines.addNewLine();
                    newLine.setAccountId(Number(id_intransit));
                    newLine.setDebitAmount(Number(standartLineArr[i].debit_amount));
                    // append old memo to new memo text
                    // newLine.setLocationId(Number(standartLineArr[i].location)); //uncomment if it has purposes
                    // newLine.setDepartmentId(Number(standartLineArr[i].department)); //uncomment if it has purposes
                    // newLine.setClassId(Number(standartLineArr[i].class_)); //uncomment if it has purposes
                    // newLine.setEntityId(Number(customer_master)); //uncomment if it has purposes
            }

        }



    } catch (error) {
        nlapiLogExecution("DEBUG", "ERROR", error)
    }



}

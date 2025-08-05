function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try {
        //Get Data User who trigger the action

        var isApplied = false;

        var userData = nlapiGetUser();
        var userRole = nlapiGetRole()
        nlapiLogExecution("DEBUG", "1 Data User", userData + ' || User Role' + userRole)

        var idCustPayment = transactionRecord.getId();
        // var location = transactionRecord.getFieldValue('location')
        var adjCategory = transactionRecord.getFieldText('custbody_me_adjustment_category')//Internal Id = 2
        var typeItem = transactionRecord.getFieldText('custbody_me_type_item')//internal Id = 1
        var customer_master = transactionRecord.getFieldValue('entity')
        var department = transactionRecord.getFieldValue('department')
        var classs = transactionRecord.getFieldValue('class')
        var location_header = transactionRecord.getFieldValue('location')

        var customer_account = nlapiLookupField('customer', customer_master, 'custentity_me_income_account_customer');
        var line_count = nlapiGetLineItemCount('item');

        // var item = nlapiGetLineItemValue('item', 'item', 1)
        // nlapiLogExecution("DEBUG", "2 Data User", item)
        // var item_account = nlapiLookupField('customer', item, 'incomeaccount');
        // nlapiLogExecution("DEBUG", "3 Data User", item_account)

        var standartLineArr = []

        for (var i = 0; i < standardLines.getCount(); i++) {
            var credAmount = (standardLines.getLine(i).getCreditAmount());
            var accountId = (standardLines.getLine(i).getAccountId());
            var debAmount = (standardLines.getLine(i).getDebitAmount());
            var location = (standardLines.getLine(i).getLocationId());
            var class_ = (standardLines.getLine(i).getClassId());
            var department = (standardLines.getLine(i).getDepartmentId());

            standartLineArr.push({
                account_id: accountId,
                credit_amount: credAmount,
                debit_amount: debAmount,
                location: location,
                class_: class_,
                department: department,
            })

            nlapiLogExecution("DEBUG", "standartLineArr", credAmount + '-' + accountId + '-' + debAmount)
        }

        for (var i = 0; i < standartLineArr.length; i++) {
            if (standartLineArr[i].account_id == 54) {
                //=================debit==========================
                var newLine = customLines.addNewLine();
                newLine.setAccountId(Number(standartLineArr[i].account_id));
                newLine.setDebitAmount(Number(standartLineArr[i].credit_amount));
                // append old memo to new memo text
                newLine.setMemo(" Jurnal Balik Sales pada Default Account untuk Memposting Sales berdasarkan Customer Group dibuat Oleh Metrodata Team");
                newLine.setLocationId(Number(standartLineArr[i].location));
                newLine.setDepartmentId(Number(standartLineArr[i].department));
                newLine.setClassId(Number(standartLineArr[i].class_));
                newLine.setEntityId(Number(customer_master));
                //================credit=========================
                var newLine = customLines.addNewLine();
                newLine.setAccountId(Number(customer_account));
                newLine.setCreditAmount(Number(standartLineArr[i].credit_amount));
                // append old memo to new memo text
                newLine.setLocationId(Number(standartLineArr[i].location));
                newLine.setDepartmentId(Number(standartLineArr[i].department));
                newLine.setClassId(Number(standartLineArr[i].class_));
                newLine.setEntityId(Number(customer_master));
            }

        }


    } catch (error) {
        nlapiLogExecution("DEBUG", "error", error);
    }

}

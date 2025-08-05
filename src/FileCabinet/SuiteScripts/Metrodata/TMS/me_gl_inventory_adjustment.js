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


        var standartLineArr = []

        for (var i = 0; i < standardLines.getCount(); i++) {
            var credAmount = (standardLines.getLine(i).getCreditAmount());
            var accountId = (standardLines.getLine(i).getAccountId());
            var debAmount = (standardLines.getLine(i).getDebitAmount());
            var location = (standardLines.getLine(i).getLocationId());

            standartLineArr.push({
                account_id: accountId,
                credit_amount: credAmount,
                debit_amount: debAmount,
                location: location,
            })

            nlapiLogExecution("DEBUG", "standartLineArr", credAmount + '-' + accountId + '-' + debAmount)
        }

        if (adjCategory == 'Pengurangan' && typeItem == 'Raw Material') {


            for (var i = 0; i < standartLineArr.length; i++) {
                if (Number(standartLineArr[i].credit_amount) > 0) {
                    var newLine = customLines.addNewLine();
                    newLine.setAccountId(Number(standartLineArr[i].account_id));
                    newLine.setDebitAmount(Number(standartLineArr[i].credit_amount));
                    // append old memo to new memo text
                    newLine.setMemo("Journal Balik Otomatis Script Metrodata untuk membalik penggunaan Raw Material");
                    newLine.setLocationId(Number(standartLineArr[i].location));
                }
                if (Number(standartLineArr[i].debit_amount) > 0) {
                    var newLine = customLines.addNewLine();
                    newLine.setAccountId(Number(standartLineArr[i].account_id));
                    newLine.setCreditAmount(Number(standartLineArr[i].debit_amount));
                    // append old memo to new memo text
                    newLine.setMemo("Journal Balik Otomatis Script Metrodata untuk membalik penggunaan Raw Material");
                    newLine.setLocationId(Number(standartLineArr[i].location));
                }

            }
        }


    } catch (error) {
        nlapiLogExecution("DEBUG", "error", error);
    }

}

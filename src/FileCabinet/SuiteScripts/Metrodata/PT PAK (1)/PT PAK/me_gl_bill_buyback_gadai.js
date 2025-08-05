function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try {
        //Get Data User who trigger the action

        var isApplied = false;

        var userData = nlapiGetUser();
        var userRole = nlapiGetRole()
        nlapiLogExecution("DEBUG", "1 Data User", userData + ' || User Role' + userRole)

        var idCustPayment = transactionRecord.getId();

        // var pkpNonPKP = parseInt(transactionRecord.getFieldValue('custbody_me_invoice_pkp_non_pkp'))
        // nlapiLogExecution("DEBUG", "pkpNonPKP", pkpNonPKP);

        // var ppnAmount = parseFloat(transactionRecord.getFieldValue('custbody_me_ppn_sales_invoice'))
        // nlapiLogExecution("DEBUG", "ppnAmount", ppnAmount);

        // var invoiceNum = parseInt(transactionRecord.getFieldValue('custbody_me_invoice_custom_field'))
        // nlapiLogExecution("DEBUG", "invoiceNum", invoiceNum);

        // var datePayment = (transactionRecord.getFieldValue('trandate'))
        // nlapiLogExecution("DEBUG", "datePayment", datePayment);

        // var status = transactionRecord.getFieldValue('status')
        // nlapiLogExecution("DEBUG", "status", status);

        var entity = transactionRecord.getFieldValue('entity')
        nlapiLogExecution("DEBUG", "entity", entity);

        var accountRecievable = Number(transactionRecord.getFieldValue('account'))

        var getLineItem = transactionRecord.getLineItemCount('item');
        // nlapiLogExecution("DEBUG", "getLineInvoiceCount", getLineInvoiceCount);

        var dataItem = [];

        for (var x = 1; x <= getLineItem; x++) {
            var getItemType = transactionRecord.getLineItemValue('item', 'itemtype', x);
            var getItemId = transactionRecord.getLineItemValue('item', 'item', x);
            var getItemAmount = transactionRecord.getLineItemValue('item', 'amount', x);
            var getBuybackId = transactionRecord.getLineItemValue('item', 'custcol_me_buyback_category', x);
            nlapiLogExecution("DEBUG", "getItemId", getItemId);
            nlapiLogExecution("DEBUG", "getIsBuyback", getBuybackId);

            var recType = '';

            switch (getItemType) {
                case 'Assembly':
                    recType = 'assemblyitem';
                    break;
                case 'InvtPart':
                    recType = 'inventoryitem';
                    break;
                case 'NonInvtPart':
                    recType = 'noninventoryitem';
                    break;
                default:
                    break;
            }

            if (getBuybackId == 3) {
                dataItem.push({
                    item_id: getItemId,
                    item_type: recType,
                    item_amount: getItemAmount
                });
            }
        }

        nlapiLogExecution("DEBUG", "dataInvoices", dataItem);

        var isTrue = false;

        var standartLineArr = []

        for (var i = 0; i < standardLines.getCount(); i++) {
            var credAmount = (standardLines.getLine(i).getCreditAmount());
            var accountId = (standardLines.getLine(i).getAccountId());
            var debAmount = (standardLines.getLine(i).getDebitAmount());

            standartLineArr.push({
                account_id: accountId,
                credit_amount: credAmount,
                debit_amount: debAmount,
            })

        }

        nlapiLogExecution("DEBUG", "standardLines.getCount()", standardLines.getCount());

        var isUsedAmount = [];
        var amount = []
        var cogsAccount = []

        if (dataItem.length > 0) {
            for (var a = 0; a < dataItem.length; a++) {
                var loadRecord = nlapiLoadRecord(dataItem[a].item_type, dataItem[a].item_id);

                var getAssetAccount = Number(loadRecord.getFieldValue('assetaccount'));
                var getcogsAccount = Number(loadRecord.getFieldValue('cogsaccount'));
                var getincomeAccount = Number(loadRecord.getFieldValue('incomeaccount'));
                var getAverageCost = Number(loadRecord.getFieldValue('averagecost'));

                cogsAccount.push({
                    cogs:getcogsAccount,
                    asset: getAssetAccount,
                });

                if (getAverageCost === 0) {
                    getAverageCost = dataItem[a].item_amount;
                } else {
                    getAverageCost = (dataItem[a].item_amount + getAverageCost) / 2
                }

                var getItemAmount = dataItem[a].item_amount;
                // }

                // var newLine = customLines.addNewLine();
                // newLine.setDebitAmount((getItemAmount));
                // // newLine.setEntityId(Number(noDuplicateSearchInvoice[x].entity_id));
                // newLine.setAccountId(getincomeAccount);

                // nlapiLogExecution("DEBUG", "1 invoice", "Line Credit Revenue created")

                // var newLine = customLines.addNewLine();
                // newLine.setCreditAmount(getItemAmount);
                // // newLine.setEntityId(Number(entity));
                // newLine.setAccountId(3942);

                // nlapiLogExecution("DEBUG", "2 invoice", "Line Debit AR created")

                var debCogsAmount = 0;
                for (var i = 0; i < standartLineArr.length; i++) {
                    if (isUsedAmount.length > 0) {
                        for (var x = 0; x < isUsedAmount.length; x++) {
                            if (standartLineArr[i].account_id == getAssetAccount && isUsedAmount[x] != i) {
                                if (standartLineArr[i].credit_amount > 0) {
                                    amount.push({
                                        amount: standartLineArr[i].credit_amount
                                    })
                                } else if (standartLineArr[i].credit_amount == 0) {
                                    amount.push({
                                        amount: standartLineArr[i].debit_amount
                                    })
                                }
                                nlapiLogExecution("DEBUG", "standartLineArr[i].credit_amount", standartLineArr[i].credit_amount)
                                nlapiLogExecution("DEBUG", "standartLineArr[i].debit_amount", standartLineArr[i].debit_amount)
                                isUsedAmount.push(i);
                            }
                        }

                    } else {
                        if (standartLineArr[i].account_id == getAssetAccount) {
                            if (standartLineArr[i].credit_amount > 0) {
                                amount.push({
                                    amount: standartLineArr[i].credit_amount
                                })
                            } else if (standartLineArr[i].credit_amount == 0) {
                                amount.push({
                                    amount: standartLineArr[i].debit_amount
                                })
                            }
                            nlapiLogExecution("DEBUG", "standartLineArr[i].credit_amount1", standartLineArr[i].credit_amount)
                            nlapiLogExecution("DEBUG", "standartLineArr[i].debit_amount1", standartLineArr[i].debit_amount)
                            isUsedAmount.push(i);
                        }
                    }
                }

                
                isApplied = true;
                // }
            }

            for (var i = 0; i < cogsAccount.length; i++) {

                var newLine = customLines.addNewLine();
                newLine.setDebitAmount(Number(amount[i].amount));
                // newLine.setEntityId(Number(noDuplicateSearchInvoice[x].entity_id));
                newLine.setAccountId(3942);
    
                nlapiLogExecution("DEBUG", "3 invoice", "Line Credit Inventory created")
                var newLine = customLines.addNewLine();
                newLine.setCreditAmount(Number(amount[i].amount));
                // newLine.setEntityId(Number(noDuplicateSearchInvoice[x].entity_id));
                newLine.setAccountId(cogsAccount[i].asset);
    
                nlapiLogExecution("DEBUG", "4 invoice", "Line Debit COGS created")
    
            }
        }

    } catch (error) {
        nlapiLogExecution("DEBUG", "error", error);
    }

}

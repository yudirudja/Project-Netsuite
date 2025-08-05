function customizeGlImpact(transactionRecord, standardLines, customLines, book) {

    var currency = transactionRecord.getFieldValue('currency');
    var account = transactionRecord.getFieldValue('account');
    var applied = transactionRecord.getFieldValue('applied');
    var item = transactionRecord.getLineItemValue('item', 'item', 0);

    var accountUangMuka = 0;

    if (currency == 1) {
        accountUangMuka = 4490;
    } else if (currency == 2) {
        accountUangMuka = 4491;
    } else if (currency == 7) {
        accountUangMuka = 4492;
    } else if (currency == 6) {
        accountUangMuka = 4493;
    }

    var newLine1 = customLines.addNewLine();
    newLine1.setDebitAmount(applied);
    newLine1.setAccountId(Number(account));
    newLine1.setMemo("");

    var newLine = customLines.addNewLine();
    newLine.setCreditAmount(applied);
    newLine.setAccountId(Number(accountUangMuka));
    newLine.setMemo("");

} 
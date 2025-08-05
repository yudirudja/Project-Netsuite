/**
 *@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/redirect', 'N/encode', 'N/file','./lib/moment.min.js'], function (serverWidget, record, search, redirect, encode, file, moment) {

    const DATA = {
        category: 'custpage_category',
        start_date: 'custpage_start_date',
        end_date: 'custpage_end_date',
        is_account_parent: 'custpage_is_account_parent',

    }

    const RETAIN_EARNING_ACC_ID = 52;

    function formatCurrencyIntFromInt(number) {

        if (number == 0) {
            return "0";
        }

        let formattedString = number.toLocaleString(undefined, { minimumFractionDigits: 2 });
        return formattedString;
    }

    function addComa(number) {
        // Ensure the input is a number

        if (isNaN(number)) {
            log.debug('Is Not A Number', number)
            return '0.00';
        }

        // Convert the number to a string with exactly two decimal places
        var parts = Number(number).toFixed(2).split('.');
        // log.debug('Is parts A Number',parts)

        // Format the integer part with commas
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        var result = ''
        // if (parts.join('.').includes('0.00')) {
        if (parts[0] == 0 && parts[1].includes('00')) {
            result = '0.00'
        } else {
            result = parts.join('.')
        }

        // Rejoin the integer and decimal parts
        return result;
    }

    function addComaFiveDec(number) {
        // Ensure the input is a number
        if (isNaN(number)) {
            return '0.00';
        }

        // Convert the number to a string with exactly two decimal places
        var parts = Number(number).toFixed(5).split('.');

        // Format the integer part with commas
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Rejoin the integer and decimal parts
        return parts.join('.');
    }

    function balanceSheetSearch(params) {

        var result = [];


        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    // ["trandate", "within", params.start, params.end],
                    // "AND",
                    ["posting", "is", "T"],
                    "AND",
                    ["account.internalid", "noneof", "@NONE@"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "account",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                        label: "Account"
                    }),
                    search.createColumn({
                        name: "classnohierarchy",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                        label: "Business Unit (no hierarchy)"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        summary: "GROUP",
                        formula: "case when {account.name} like '%:%' then SUBSTR({account.name}, LENGTH({account.name}) - INSTR(REVERSE({account.name}), ':') + 2)||' - '||{classnohierarchy} else {account.name}||' - '||{classnohierarchy} end",
                        label: "Account Name + Business Unit"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Accounts Payable%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Equity%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Income%' then ({debitamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Other Income%' then ({debitamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Long Term Liability%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Other Current Liability%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Accounts Payable%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Income%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Other Income%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Long Term Liability%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Other Current Liability%' then ({debitamount})else 0 end",
                        label: "Debit"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Accounts Payable%' then ({creditamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Equity%' then ({creditamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Income%' then ({creditamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Other Income%' then ({creditamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Long Term Liability%' then ({creditamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Other Current Liability%' then ({creditamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Accounts Payable%' then ({creditamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Income%' then ({creditamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Other Income%' then ({creditamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Long Term Liability%' then ({creditamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Other Current Liability%' then ({creditamount}*-1)else 0 end",
                        label: "Credit"
                    }),
                    search.createColumn({
                        name: "number",
                        join: "account",
                        summary: "GROUP",
                        label: "Number"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        summary: "GROUP",
                        formula: "case when {account.name} like '%:%' then SUBSTR({account.name}, LENGTH({account.name}) - INSTR(REVERSE({account.name}), ':') + 2) ||' - 'else {account.name}||' - 'end",
                        label: "Account Name"
                    }),
                    search.createColumn({
                        name: "class",
                        summary: "GROUP",
                        label: "Business Unit"
                    })
                ]
        });

        var headerReportBalance = []
        var startrow = 0;

        do {
            var getbalanceSheet = transactionSearchObj.run().getRange({
                start: startrow,
                end: startrow + 1000
            });

            for (let i = 0; i < getbalanceSheet.length; i++) {
                var account_number = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[5]);
                var business_unit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[1]);
                var name_with_businss_unit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[6]);
                var name = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[2]);
                var debit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[3]);
                var credit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[4]);
                var account = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[0]);
                var account_text = getbalanceSheet[i].getText(getbalanceSheet[i].columns[0]);
                var bu_id = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[7]);

                result.push({
                    account_number: account_number,
                    business_unit: business_unit,
                    name: name,
                    opening_blnc: 0,
                    debit: parseFloat(debit),
                    credit: parseFloat(credit),
                    account: account,
                    account_text: account_text,
                    account_text_parent: account_text.split(':')[0],
                    bu_id: bu_id,
                });

                // if (headerReportBalance.length < 1) {
                //     headerReportBalance.push({
                //         account_number: account_number,
                //         business_unit: '',
                //         name: name,
                //         opening_blnc: 0,
                //         debit: parseFloat(debit),
                //         credit: parseFloat(credit),
                //         account: account,
                //         is_insert: false,
                //         insert_index: '',
                //         bu_id: ''
                //     });
                // } else if (headerReportBalance.some((data) => data.account != account)) {
                //     headerReportBalance.push({
                //         account_number: account_number,
                //         business_unit: '',
                //         name: name,
                //         opening_blnc: 0,
                //         debit: parseFloat(debit),
                //         credit: parseFloat(credit),
                //         account: account,
                //         is_insert: false,
                //         insert_index: '',
                //         bu_id: '',
                //     });
                // }

            }

            startrow += 1000
        } while (getbalanceSheet.length === 1000);

        log.debug("result", result)

        // for (let i = 0; i < headerReportBalance.length; i++) {
        //     var getDupAccount = result.filter((data) => data.account == headerReportBalance[i].account);
        //     var totalDebit = 0;
        //     var totalCredit = 0;
        //     for (let j = 0; j < getDupAccount.length; j++) {
        //         totalDebit += parseFloat(getDupAccount[j].debit);
        //         totalCredit += parseFloat(getDupAccount[j].credit);
        //     }
        //     headerReportBalance[i].debit = totalDebit;
        //     headerReportBalance[i].credit = totalCredit;
        // }

        // for (let i = 0; i < headerReportBalance.length; i++) {
        //     for (let j = 0; j < result.length; j++) {
        //         if (headerReportBalance[i].account == result[j].account && headerReportBalance[i].is_insert == false) {
        //             headerReportBalance[i].insert_index = j;
        //             headerReportBalance[i].is_insert = true;
        //         }
        //     }
        // }

        // for (let i = 0; i < headerReportBalance.length; i++) {
        //     result.splice(headerReportBalance[i].insert_index, 0, headerReportBalance[i])
        //     for (let j = 0; j < headerReportBalance.length; j++) {
        //         headerReportBalance[j].insert_index++

        //     }
        // }

        log.debug("result", result)

        return result
    }

    function balanceSheetSearchNonTrans(params) {

        var result = [];


        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    // ["trandate", "within", params.start, params.end],
                    // "AND",
                    ["posting", "is", "T"],
                    "AND",
                    ["account.internalid", "noneof", "@NONE@"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "account",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                        label: "Account"
                    }),
                    search.createColumn({
                        name: "classnohierarchy",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                        label: "Business Unit (no hierarchy)"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        summary: "GROUP",
                        formula: "case when {account.name} like '%:%' then SUBSTR({account.name}, LENGTH({account.name}) - INSTR(REVERSE({account.name}), ':') + 2)||' - '||{classnohierarchy} else {account.name}||' - '||{classnohierarchy} end",
                        label: "Account Name + Business Unit"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Accounts Payable%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Equity%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Income%' then ({debitamount}*-1) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Other Income%' then ({debitamount}*-1) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Long Term Liability%' then ({debitamount}) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Other Current Liability%' then ({debitamount}) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Accounts Payable%' then ({debitamount}) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Income%' then ({debitamount}) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Other Income%' then ({debitamount}) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Long Term Liability%' then ({debitamount}) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Other Current Liability%' then ({debitamount})else 0 end",
                        label: "Debit" * -1
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Accounts Payable%' then ({creditamount}*-1) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Equity%' then ({creditamount}*-1) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Income%' then ({creditamount}) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Other Income%' then ({creditamount}) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Long Term Liability%' then ({creditamount}*-1) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Other Current Liability%' then ({creditamount}*-1) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Accounts Payable%' then ({creditamount}*-1) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Income%' then ({creditamount}*-1) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Other Income%' then ({creditamount}*-1) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Long Term Liability%' then ({creditamount}*-1) when {custbody_me_post_period} not like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Other Current Liability%' then ({creditamount}*-1)else 0 end",
                        label: "Credit"
                    }),
                    search.createColumn({
                        name: "number",
                        join: "account",
                        summary: "GROUP",
                        label: "Number"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        summary: "GROUP",
                        formula: "case when {account.name} like '%:%' then SUBSTR({account.name}, LENGTH({account.name}) - INSTR(REVERSE({account.name}), ':') + 2) ||' - 'else {account.name}||' - 'end",
                        label: "Account Name"
                    }),
                    search.createColumn({
                        name: "class",
                        summary: "GROUP",
                        label: "Business Unit"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {custbody_me_post_period} like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Accounts Payable%' then ({debitamount}) when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Income%' then ({debitamount}*-1) when {custbody_me_post_period} like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Other Income%' then ({debitamount}*-1) when {custbody_me_post_period} like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Long Term Liability%' then ({debitamount}) when {custbody_me_post_period} like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Other Current Liability%' then ({debitamount}) when {custbody_me_post_period} like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Accounts Payable%' then ({debitamount}) when {custbody_me_post_period} like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Income%' then ({debitamount}) when {custbody_me_post_period} like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Other Income%' then ({debitamount}) when {custbody_me_post_period} like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Long Term Liability%' then ({debitamount}) when {custbody_me_post_period} like 'Adjust%' and {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Other Current Liability%' then ({debitamount})else 0 end",
                        label: "Debit"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        label: "Credit"
                    }),
                ]
        });

        var headerReportBalance = []
        var startrow = 0;

        do {
            var getbalanceSheet = transactionSearchObj.run().getRange({
                start: startrow,
                end: startrow + 1000
            });

            for (let i = 0; i < getbalanceSheet.length; i++) {
                var account_number = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[5]);
                var business_unit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[1]);
                var name_with_businss_unit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[6]);
                var name = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[2]);
                var debit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[3]);
                var credit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[4]);
                var account = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[0]);
                var account_text = getbalanceSheet[i].getText(getbalanceSheet[i].columns[0]);
                var bu_id = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[7]);
                var closing_trans_debit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[8]);
                var closing_trans_credit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[9]);

                result.push({
                    account_number: account_number,
                    business_unit: business_unit,
                    name: name,
                    opening_blnc: 0,
                    debit: parseFloat(debit),
                    credit: parseFloat(credit),
                    account: account,
                    account_text: account_text,
                    account_text_parent: account_text.split(':')[0],
                    bu_id: bu_id,
                    closing_trans: Number(closing_trans_debit) + Number(closing_trans_credit),
                });

                // if (headerReportBalance.length < 1) {
                //     headerReportBalance.push({
                //         account_number: account_number,
                //         business_unit: '',
                //         name: name,
                //         opening_blnc: 0,
                //         debit: parseFloat(debit),
                //         credit: parseFloat(credit),
                //         account: account,
                //         is_insert: false,
                //         insert_index: '',
                //         bu_id: ''
                //     });
                // } else if (headerReportBalance.some((data) => data.account != account)) {
                //     headerReportBalance.push({
                //         account_number: account_number,
                //         business_unit: '',
                //         name: name,
                //         opening_blnc: 0,
                //         debit: parseFloat(debit),
                //         credit: parseFloat(credit),
                //         account: account,
                //         is_insert: false,
                //         insert_index: '',
                //         bu_id: '',
                //     });
                // }

            }

            startrow += 1000
        } while (getbalanceSheet.length === 1000);

        log.debug("result", result)

        // for (let i = 0; i < headerReportBalance.length; i++) {
        //     var getDupAccount = result.filter((data) => data.account == headerReportBalance[i].account);
        //     var totalDebit = 0;
        //     var totalCredit = 0;
        //     for (let j = 0; j < getDupAccount.length; j++) {
        //         totalDebit += parseFloat(getDupAccount[j].debit);
        //         totalCredit += parseFloat(getDupAccount[j].credit);
        //     }
        //     headerReportBalance[i].debit = totalDebit;
        //     headerReportBalance[i].credit = totalCredit;
        // }

        // for (let i = 0; i < headerReportBalance.length; i++) {
        //     for (let j = 0; j < result.length; j++) {
        //         if (headerReportBalance[i].account == result[j].account && headerReportBalance[i].is_insert == false) {
        //             headerReportBalance[i].insert_index = j;
        //             headerReportBalance[i].is_insert = true;
        //         }
        //     }
        // }

        // for (let i = 0; i < headerReportBalance.length; i++) {
        //     result.splice(headerReportBalance[i].insert_index, 0, headerReportBalance[i])
        //     for (let j = 0; j < headerReportBalance.length; j++) {
        //         headerReportBalance[j].insert_index++

        //     }
        // }

        log.debug("result", result)

        return result
    }

    function retainedEarningSearch(params) {

        var getyearStart = moment(params.start,'D/M/YYYY');
        var getyearEnd = moment(params.end,'D/M/YYYY');

        var getMonthRetainedEStart = getyearStart.format('M');
        var lastYearRetainedEStart = getyearStart.subtract(1, 'years')
        log.debug('getMonthRetainedEStart',getMonthRetainedEStart)
        log.debug('lastYearRetainedEStart',lastYearRetainedEStart)

        var lastYear = lastYearRetainedEStart.format('YYYY');

        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    // ["accounttype", "anyof", "Income", "COGS", "Expense", "OthIncome", "OthExpense"],
                    //    "AND", 
                    //    ["trandate","within","1/1/2024","31/12/2024"], 
                    // "AND",
                    ["transactionnumbernumber", "isnotempty", ""],
                    "AND",
                    ["shipping", "is", "F"],
                    "AND",
                    ["taxline", "is", "F"],
                    "AND",
                    ["cogs", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'?"case when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Cost of Goods Sold%' then {amount} else 0 end":"0",
                        label: "Current Purchases"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'? "case when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY')  and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Income%' then {amount} else 0 end":"0",
                        label: "Current Sales"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'? "case when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Expense%' and {accounttype} not like '%Other Expense%' then {amount} else 0 end":"0",
                        label: "Current Overhead"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'? "case when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Other Income%' then {amount} else 0 end":"0",
                        label: "Current Other Income"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'? "case when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Other Expense%' and {transactionname} not like '%Currency Revaluation%' then {amount} when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Other Expense%' and {transactionname} like '%Currency Revaluation%' then ({amount}*-1) else 0 end":"0",
                        label: "Current Other Expense"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'?"case when {trandate} < TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Cost of Goods Sold%' then {amount} else 0 end":"case when {trandate} < TO_DATE(" + "'31/12/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Cost of Goods Sold%' then {amount} else 0 end",
                        label: "Current Purchases"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'?"case when {trandate} < TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Income%' then {amount} else 0 end":"case when {trandate} < TO_DATE(" + "'31/12/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Income%' then {amount} else 0 end",
                        label: "Current Sales"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'?"case when {trandate} < TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Expense%' and {accounttype} not like '%Other Expense%' then {amount} else 0 end":"case when {trandate} < TO_DATE(" + "'31/12/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Expense%' and {accounttype} not like '%Other Expense%' then {amount} else 0 end",
                        label: "Current Overhead"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'?"case when {trandate} < TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Other Income%' then {amount} else 0 end":"case when {trandate} < TO_DATE(" +"'31/12/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Other Income%' then {amount} else 0 end",
                        label: "Current Other Income"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart == '1'?"case when {trandate} < TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Other Expense%' and {transactionname} not like '%Currency Revaluation%' then {amount} when {trandate} < TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Other Expense%' and {transactionname} like '%Currency Revaluation%' then ({amount}*-1) else 0 end":"case when {trandate} < TO_DATE(" + "'31/12/" + lastYear + "'" + ", 'D/M/YYYY') AND {accounttype} like '%Other Expense%' and {transactionname} not like '%Currency Revaluation%' then {amount} when {trandate} < TO_DATE(" + "'31/12/" + lastYear + "'"  + ", 'D/M/YYYY') AND {accounttype} like '%Other Expense%' and {transactionname} like '%Currency Revaluation%' then ({amount}*-1) else 0 end",
                        label: "Current Other Expense"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart != '1'?"case when {custbody_me_post_period} like 'Adjust%' and {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') and {accounttype} like '%Cost of Goods Sold%' then {amount} else 0 end":"0",
                        label: "Current Purchases"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart != '1'?"case when {custbody_me_post_period} like 'Adjust%' and {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') and {accounttype} like '%Income%' then {amount} else 0 end":"0",
                        label: "Current Sales"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart != '1'?"case when {custbody_me_post_period} like 'Adjust%' and {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') and {accounttype} like '%Expense%' and {accounttype} not like '%Other Expense%' then {amount} else 0 end":"0",
                        label: "Current Overhead"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart != '1'?"case when {custbody_me_post_period} like 'Adjust%' and {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') and {accounttype} like '%Other Income%' then {amount} else 0 end":"0",
                        label: "Current Other Income"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: getMonthRetainedEStart != '1'?"case when {custbody_me_post_period} like 'Adjust%' and {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') and {accounttype} like '%Other Expense%' and {transactionname} not like '%Currency Revaluation%' then {amount} when {custbody_me_post_period} like 'Adjust%' and {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} >= TO_DATE(" + "'1/1/" + lastYear + "'" + ", 'D/M/YYYY') and {accounttype} like '%Other Expense%' and {transactionname} like '%Currency Revaluation%' then ({amount}*-1) else 0 end":"0",
                        label: "Current Other Expense"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') AND {account} like '%RETAINED EARNINGS%' then {debitamount}*-1 else 0 end",
                        label: "Posting Retained Earning"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {trandate} >= TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {trandate} <= TO_DATE(" + "'" + params.end + "'" + ", 'D/M/YYYY') AND {account} like '%RETAINED EARNINGS%' then {creditamount} else 0 end",
                        label: "Posting Retained Earning"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {account} like '%RETAINED EARNINGS%' then {debitamount}*-1 else 0 end",
                        label: "Posting Retained Earning"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') AND {account} like '%RETAINED EARNINGS%' then {creditamount} else 0 end",
                        label: "Posting Retained Earning"
                    }),
                ]
        });

        var retainedArr = []
        var startRow = 0;

        do {
            var getRetainedEarnings = transactionSearchObj.run().getRange({
                start: startRow,
                end: startRow + 1000
            })

            for (let i = 0; i < getRetainedEarnings.length; i++) {
                var purchases = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[0]);
                var sales = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[1]);
                var overhead = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[2]);
                var otherIncome = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[3]);
                var otherExpense = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[4]);
                var openingPurchases = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[5]);
                var openingsales = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[6]);
                var openingOverhead = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[7]);
                var openingOtherIncome = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[8]);
                var openingOtherExpense = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[9]);
                var closingPurchases = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[10]);
                var closingsales = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[11]);
                var closingOverhead = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[12]);
                var closingOtherIncome = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[13]);
                var closingOtherExpense = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[14]);
                var postedRetainedEarningsDebit = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[15]);
                var postedRetainedEarningsCredit = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[16]);
                var postedRetainedEarningsDebitOpening = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[17]);
                var postedRetainedEarningsCreditOpening = getRetainedEarnings[i].getValue(getRetainedEarnings[i].columns[18]);

                retainedArr.push({
                    retained_earning: ((Number(sales) - Number(purchases)) - Number(overhead)) + Number(otherIncome) + Number(otherExpense),
                    retained_earning_opening: ((Number(openingsales) - Number(openingPurchases)) - Number(openingOverhead)) + Number(openingOtherIncome) + Number(openingOtherExpense) + Number(postedRetainedEarningsDebitOpening) + Number(postedRetainedEarningsCreditOpening),
                    retained_earning_closing: ((Number(closingsales) - Number(closingPurchases)) - Number(closingOverhead)) + Number(closingOtherIncome) + Number(closingOtherExpense),
                    posted_retained_earning_debit: Number(postedRetainedEarningsDebit),
                    posted_retained_earning_credit: Number(postedRetainedEarningsCredit),
                })
                log.debug('retainedArr', {
                    sales:Number(sales),
                    purchases:Number(purchases),
                    otherIncome:Number(otherIncome),
                    overhead:Number(overhead),
                    otherExpense:Number(otherExpense),
                })
                log.debug('retainedArrOP', {
                    sales:Number(openingsales),
                    purchases:Number(openingPurchases),
                    otherIncome:Number(openingOtherIncome),
                    overhead:Number(openingOverhead),
                    otherExpense:Number(openingOtherExpense),
                })
            }
            startRow += 1000
        } while (getRetainedEarnings.length === 1000);
        log.debug('retainedArr', {retainedArr})
        return retainedArr;
    }

    function getBalanceAccountBU(params) {

        var balanceAccount = [];
        var balanceBusinessUnit = [];

        for (let i = 0; i < params.length; i++) {
            if (params[i].account && params[i].bu_id && !balanceAccount.includes(params[i].account)) {
                balanceAccount.push(params[i].account);

            }
            if (params[i].account && params[i].bu_id && !balanceBusinessUnit.includes(params[i].bu_id)) {
                balanceBusinessUnit.push(params[i].bu_id);

            }

        }

        var result = {
            balance_account: balanceAccount,
            balance_business_unit: balanceBusinessUnit,
        }

        return result;

    }

    function balanceSheetOpeningSearch(params, filter) {

        log.debug('filter', filter)

        var result = [];

        var filter = [

            ["posting", "is", "T"],

        ]

        // if (params.start) {
        //     filter.push("AND",
        //         ["trandate", "before", params.start],)
        // }
        if (filter.balance_account) {
            filter.push("AND",
                ["account", "anyof", filter.balance_account],)
        }
        if (filter.balance_business_unit) {
            filter.push("AND",
                ["class", "anyof", filter.balance_business_unit],)
        }

        var transactionSearchObj = search.create({
            type: "transaction",
            filters: filter,
            columns:
                [
                    search.createColumn({
                        name: "account",
                        summary: "GROUP",
                        label: "Account"
                    }),
                    search.createColumn({
                        name: "classnohierarchy",
                        summary: "GROUP",
                        label: "Business Unit (no hierarchy)"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        summary: "GROUP",
                        formula: "case when {account.name} like '%:%' then SUBSTR({account.name}, LENGTH({account.name}) - INSTR(REVERSE({account.name}), ':') + 2)||' - '||{classnohierarchy} else {account.name}||' - '||{classnohierarchy} end",
                        label: "Account Name + Business Unit"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Accounts Payable%' then ({debitamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Equity%' then ({debitamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Income%' then ({debitamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Other Income%' then ({debitamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Long Term Liability%' then ({debitamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Other Current Liability%' then ({debitamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Accounts Payable%' then ({debitamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Income%' then ({debitamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Other Income%' then ({debitamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} like '%Long Term Liability%' then ({debitamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {debitamount} is not null and {account.type} not like '%Other Current Liability%' then ({debitamount})else 0 end",
                        label: "Formula (Numeric)"
                    }),
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "case when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Accounts Payable%' then ({creditamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Equity%' then ({creditamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Income%' then ({creditamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Other Income%' then ({creditamount}) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Long Term Liability%' then ({creditamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Other Current Liability%' then ({creditamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Accounts Payable%' then ({creditamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Income%' then ({creditamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Other Income%' then ({creditamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} like '%Long Term Liability%' then ({creditamount}*-1) when {trandate} < TO_DATE(" + "'" + params.start + "'" + ", 'D/M/YYYY') and {creditamount} is not null and {account.type} not like '%Other Current Liability%' then ({creditamount}*-1)else 0 end",
                        label: "Formula (Numeric)"
                    }),
                    search.createColumn({
                        name: "number",
                        join: "account",
                        summary: "GROUP",
                        label: "Number"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        summary: "GROUP",
                        formula: "case when {account.name} like '%:%' then SUBSTR({account.name}, LENGTH({account.name}) - INSTR(REVERSE({account.name}), ':') + 2) ||' - 'else {account.name}||' - 'end",
                        label: "Account Name"
                    }),
                    search.createColumn({
                        name: "class",
                        summary: "GROUP",
                        label: "Business Unit"
                    })
                ]
        });

        var headerReportBalance = []
        var startrow = 0;

        do {
            var getbalanceSheet = transactionSearchObj.run().getRange({
                start: startrow,
                end: startrow + 1000
            });

            for (let i = 0; i < getbalanceSheet.length; i++) {
                var account_number = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[5]);
                var business_unit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[1]);
                var name_with_businss_unit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[6]);
                var name = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[2]);
                var debit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[3]);
                var credit = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[4]);
                var account = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[0]);
                var account_text = getbalanceSheet[i].getText(getbalanceSheet[i].columns[0]);
                var bu_id = getbalanceSheet[i].getValue(getbalanceSheet[i].columns[7]);

                result.push({
                    account_number: account_number,
                    business_unit: business_unit,
                    name: name_with_businss_unit,
                    debit: parseFloat(debit),
                    credit: parseFloat(credit),
                    opening_blnc: parseFloat(debit) + parseFloat(credit),
                    account: account,
                    account_text: account_text,
                    account_text_parent: account_text.split(':')[0],
                    bu_id: bu_id,
                });

                // if (headerReportBalance.length < 1) {
                //     headerReportBalance.push({
                //         account_number: account_number,
                //         business_unit: '',
                //         name: name,
                //         debit: parseFloat(debit),
                //         credit: parseFloat(credit),
                //         opening_blnc: parseFloat(debit) + parseFloat(credit),
                //         account: account,
                //         account_text: account_text,
                //         account_text_parent: account_text.split(':')[0],
                //         is_insert: false,
                //         insert_index: '',
                //         bu_id: '',
                //     });
                // } else if (headerReportBalance.some((data) => data.account != account)) {
                //     headerReportBalance.push({
                //         account_number: account_number,
                //         business_unit: '',
                //         name: name,
                //         debit: parseFloat(debit),
                //         credit: parseFloat(credit),
                //         opening_blnc: parseFloat(debit) + parseFloat(credit),
                //         account: account,
                //         account_text: account_text,
                //         account_text_parent: account_text.split(':')[0],
                //         is_insert: false,
                //         insert_index: '',
                //         bu_id: ''
                //     });
                // }

            }

            startrow += 1000
        } while (getbalanceSheet.length === 1000);

        log.debug("result Opening", result)

        // for (let i = 0; i < headerReportBalance.length; i++) {
        //     var getDupAccount = result.filter((data) => data.account == headerReportBalance[i].account);
        //     var totalDebit = 0;
        //     var totalCredit = 0;
        //     var totalOpeningBalance = 0;
        //     for (let j = 0; j < getDupAccount.length; j++) {
        //         totalDebit += parseFloat(getDupAccount[j].debit);
        //         totalCredit += parseFloat(getDupAccount[j].credit);
        //         totalOpeningBalance += parseFloat(getDupAccount[j].opening_blnc);
        //     }
        //     headerReportBalance[i].debit = totalDebit;
        //     headerReportBalance[i].credit = totalCredit;
        //     headerReportBalance[i].opening_blnc = totalOpeningBalance;
        // }

        // for (let i = 0; i < headerReportBalance.length; i++) {
        //     for (let j = 0; j < result.length; j++) {
        //         if (headerReportBalance[i].account == result[j].account && headerReportBalance[i].is_insert == false) {
        //             headerReportBalance[i].insert_index = j;
        //             headerReportBalance[i].is_insert = true;
        //         }
        //     }
        // }

        // for (let i = 0; i < headerReportBalance.length; i++) {
        //     result.splice(headerReportBalance[i].insert_index, 0, headerReportBalance[i])
        //     for (let j = 0; j < headerReportBalance.length; j++) {
        //         headerReportBalance[j].insert_index++

        //     }
        // }

        log.debug("result Opening", result)

        return result
    }

    function combine(balance, opening_balance) {

        log.debug('balance', balance)
        log.debug('opening_balance', opening_balance)

        for (let i = 0; i < balance.length; i++) {
            var getOpeningBalance = opening_balance.filter((data) => data.account == balance[i].account && data.bu_id == balance[i].bu_id)

            // log.debug('getOpeingBalance', getOpeningBalance)

            if (getOpeningBalance.length > 0) {
                balance[i].opening_blnc = getOpeningBalance[0].opening_blnc;
            } else {
                balance[i].opening_blnc = 0;
            }
        }

        var newArr = []

        for (let index = 0; index < balance.length; index++) {
            if (balance[index].business_unit != '') {
                newArr.push(balance[index])
            }

        }
        return newArr;
    }

    function isAccountParentClosingF(data) {

        var parent = [];

        for (let i = 0; i < data.length; i++) {
            // if (!(data[i].account_text).includes(':')) {
            //     parent.push(data[i]);
            //     continue;
            // }
            if (!(data[i].account_text).includes(':')) {
                var creditAmt = 0;
                var debitAmt = 0;
                var openingBlnc = 0;
                var closingBlnc = 0;
                var getDupTextPar = data.filter((data1) => data1.account_text_parent == data[i].account_text_parent)
                for (let j = 0; j < getDupTextPar.length; j++) {
                    creditAmt += getDupTextPar[j].credit;
                    debitAmt += getDupTextPar[j].debit;
                    openingBlnc += getDupTextPar[j].opening_blnc;
                    closingBlnc += getDupTextPar[j].closing_trans;
                }
                if (!parent.some((data1) => data1.account_text_parent == data[i].account_text_parent)) {
                    parent.push({
                        account_number: data[i].account_number,
                        business_unit: '',
                        name: data[i].name,
                        debit: parseFloat(debitAmt),
                        credit: parseFloat(creditAmt),
                        opening_blnc: parseFloat(openingBlnc),
                        account: data[i].account,
                        account_text: data[i].account_text,
                        account_text_parent: data[i].account_text_parent,
                        bu_id: data[i].bu_id,
                    })

                }

            }

        }
        return parent;
    }
    function isAccountParentF(data) {

        var parent = [];

        for (let i = 0; i < data.length; i++) {
            // if (!(data[i].account_text).includes(':')) {
            //     parent.push(data[i]);
            //     continue;
            // }
            if (!(data[i].account_text).includes(':')) {
                var creditAmt = 0;
                var debitAmt = 0;
                var openingBlnc = 0;
                var getDupTextPar = data.filter((data1) => data1.account_text_parent == data[i].account_text_parent)
                for (let j = 0; j < getDupTextPar.length; j++) {
                    creditAmt += getDupTextPar[j].credit;
                    debitAmt += getDupTextPar[j].debit;
                    openingBlnc += getDupTextPar[j].opening_blnc;
                }
                if (!parent.some((data1) => data1.account_text_parent == data[i].account_text_parent)) {
                    parent.push({
                        account_number: data[i].account_number,
                        business_unit: '',
                        name: data[i].name,
                        debit: parseFloat(debitAmt),
                        credit: parseFloat(creditAmt),
                        opening_blnc: parseFloat(openingBlnc),
                        account: data[i].account,
                        account_text: data[i].account_text,
                        account_text_parent: data[i].account_text_parent,
                        bu_id: data[i].bu_id,
                    })

                }

            }

        }
        return parent;
    }

    function accumulateParentChildDiffAcc(data) {

        var child_diff_acc_arr = []

        for (let i = 0; i < data.length; i++) {
            if ((data[i].account_number).includes('_')) {
                child_diff_acc_arr.push(data[i])
            }
        }

        for (let i = 0; i < data.length; i++) {
            var get_child_diff = child_diff_acc_arr.filter((dataF)=> dataF.account_number.split('_')[0] == data[i].account_number && dataF.business_unit == data[i].business_unit)
            for (let j = 0; j < get_child_diff.length; j++) {
                if (data[i].business_unit == get_child_diff[j].business_unit) {
                    data[i].opening_blnc += get_child_diff[j].opening_blnc
                    data[i].debit += get_child_diff[j].debit
                    data[i].credit += get_child_diff[j].credit
                }
                
            }
        }
        return data
        
    }

    function printHtmlNonClosing(form, final, context, param, get_retained_earning) {
        var reportGroup = form.addFieldGroup({
            id: 'report_group',
            label: 'Report Trial Balance Non Closing Transaction'
        });
        var salesReport = form.addField({
            id: 'custpage_sls_report',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Reprt Pnl',
            container: 'report_group'
        });

        salesReport.defaultValue = '<!DOCTYPE html> ' +
            '<html lang="en">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<h2 style= "text-align">Report Period ' + param.start + ' to ' + param.end + '</h2>' +
            '<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"/>' +
            // '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs4-4.6.0/jqc-1.12.4/dt-1.13.1/datatables.min.css"/>' +
            // '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css">' +
            '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js">' +
            '</script>' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
            '</script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js">' +
            '</script>' +
            '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css"/>' +
            '<script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js">' +
            '</script>' +
            // ' <link rel="stylesheet" href="https://cdn.datatables.net/1.10.21/css/dataTables.bootstrap4.min.css">' +
            //=============
            //  '<script src="https://cdn.datatables.net/1.10.21/js/dataTables.bootstrap4.min.js">' +
            //  '<script src="https://cdn.datatables.net/2.0.8/js/dataTables.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/dataTables.buttons.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.dataTables.js">' +
            //  '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js">' +
            //  '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js">' +
            //  '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.html5.min.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.print.min.js">' +
            //=============
            '<script src="https://code.jquery.com/jquery-3.3.1.js"></script>' +
            '<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/dataTables.buttons.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.flash.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.html5.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.print.min.js"></script>' +
            // '<script src="https://cdn.datatables.net/2.0.8/js/dataTables.js"></script>'+

            // '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
            '</script>' +

            '<script>$(document).ready(function () { $("#daTable").DataTable({ "pageLength": 2000, dom: "Bfrtip","buttons": ["excel", "pdfHtml5"]})})</script>' +
            '</head>';
        salesReport.defaultValue += '<body>';

        salesReport.defaultValue += '<style>' +
            '.table{border:1px solid black; margin-top: 5%}' +
            '.table-head-column{border:1px solid black; border-collapse: collapse; font-weight: bold;}' +
            '.table-row{border:1px solid black; border-collapse: collapse;}' +
            '.table-column{border:1px solid black; border-collapse: collapse;}' +
            '</style>' +
            // '<div>' +
            '<table style="width:200%; border:10px" id="daTable" class="table table-striped table-bordered table-hover dt-responsive" style="width:100%">' +
            '<thead class="thead-dark" style="font-weight: bold">' +
            '<tr >' +

            '<th scope="col">Main Account</th>' +
            '<th scope="col">Business Unit</th>' +
            '<th scope="col">Name</th>' +
            '<th scope="col">Opening balance</th>' +
            '<th scope="col">Debit</th>' +
            '<th scope="col">Credit</th>' +
            '<th scope="col">Closing Balance</th>';

        salesReport.defaultValue += '</tr>';
        salesReport.defaultValue += '</thead>';
        salesReport.defaultValue += '<tbody>';

        // for (let i = 0; i < getPnl.length; i++) {
        //     salesReport.defaultValue += 
        //     '<tr class="table-row">' +
        //     '<td class="table-column">'+getPnl[i].account+'</td>' +
        //     '<td class="table-column">'+getPnl[i].description+'</td>' +
        //     '<td class="table-column">ini amount 001</td>' +
        //     '</tr>';
        // }


        //==========================Penjualan=============================

        for (let p = 0; p < final.length; p++) {

            // if ((final[p].name).includes('RETAINED EARNINGS')) {
            //     continue;
            // }
            if ((!final[p].account_number || final[p].account_number == '- None -') && ((final[p].name).includes('Cost of Goods Sold') || (final[p].name).includes('PPN on Purchases ID') || (final[p].name).includes('PPN on Sales ID') || (final[p].name).includes('Rounding Gain/Loss')) ) {
                continue;
            }
            if ((final[p].account_number).includes('4000') || (final[p].account_number).includes('3200') || (final[p].account_number).includes('_1')) {
                continue;
            }
            // if ((final[p].name).includes('DIFF')) {
            //     continue;
            // }

            salesReport.defaultValue +=
                '<tr >' +
                '<td >' + final[p].account_number + '</td>' +
                '<td >' + ((final[p].business_unit).includes('- None -') || (final[p].business_unit).includes('None') ? '' : final[p].business_unit) + '</td>' +
                '<td >' + final[p].name + '</td>' +
                '<td >' + addComa(Number(final[p].opening_blnc)) + '</td>' +
                '<td >' + addComa(Math.abs(final[p].debit)) + '</td>' +
                '<td >' + addComa((Math.abs(final[p].credit))) + '</td>' +
                '<td >' + addComa(Number(final[p].opening_blnc) + Number(final[p].debit) + Number(final[p].credit)) + '</td>';
            salesReport.defaultValue += '</tr>';
        }
        // salesReport.defaultValue +=
        //     '<tr >' +
        //     '<td >325110</td>' +
        //     '<td > - </td>' +
        //     '<td >RETAINED EARNINGS</td>' +
        //     '<td >' + addComa(Number(get_retained_earning[0].retained_earning_opening)) + '</td>' +
        //     '<td >' + addComa(Math.abs(get_retained_earning[0].posted_retained_earning_debit)) + '</td>' +
        //     '<td >' + addComa(Math.abs((Number(get_retained_earning[0].retained_earning)) + Number(get_retained_earning[0].posted_retained_earning_credit))) + '</td>' +
        //     '<td >' + addComa(Number(get_retained_earning[0].retained_earning_opening) + Number(get_retained_earning[0].retained_earning) + Number(get_retained_earning[0].posted_retained_earning_debit) + Number(get_retained_earning[0].posted_retained_earning_credit)) + '</td>';
        // salesReport.defaultValue += '</tr>';

        salesReport.defaultValue += '</tbody>';
        salesReport.defaultValue += '</table>';
        salesReport.defaultValue += '</body>' +
            '</html>';
        context.response.writePage(form);
    }

    function printHtmlClosing(form, final, context, param, get_retained_earning) {

        var reportGroup = form.addFieldGroup({
            id: 'report_group',
            label: 'Report Trial Balance Closing Transaction'
        });
        var salesReport = form.addField({
            id: 'custpage_sls_report',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Reprt Pnl',
            container: 'report_group'
        });

        salesReport.defaultValue = '<!DOCTYPE html> ' +
            '<html lang="en">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<h2 style= "text-align">Report Period ' + param.start + ' to ' + param.end + '</h2>' +
            '<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"/>' +
            // '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs4-4.6.0/jqc-1.12.4/dt-1.13.1/datatables.min.css"/>' +
            // '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css">' +
            '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js">' +
            '</script>' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
            '</script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js">' +
            '</script>' +
            '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css"/>' +
            '<script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js">' +
            '</script>' +
            // ' <link rel="stylesheet" href="https://cdn.datatables.net/1.10.21/css/dataTables.bootstrap4.min.css">' +
            //=============
            //  '<script src="https://cdn.datatables.net/1.10.21/js/dataTables.bootstrap4.min.js">' +
            //  '<script src="https://cdn.datatables.net/2.0.8/js/dataTables.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/dataTables.buttons.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.dataTables.js">' +
            //  '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js">' +
            //  '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js">' +
            //  '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.html5.min.js">' +
            //  '<script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.print.min.js">' +
            //=============
            '<script src="https://code.jquery.com/jquery-3.3.1.js"></script>' +
            '<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/dataTables.buttons.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.flash.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.html5.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.print.min.js"></script>' +
            // '<script src="https://cdn.datatables.net/2.0.8/js/dataTables.js"></script>'+

            // '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
            '</script>' +

            '<script>$(document).ready(function () { $("#daTable").DataTable({ "pageLength": 2000, dom: "Bfrtip","buttons": ["excel", "pdfHtml5"]})})</script>' +
            '</head>';
        salesReport.defaultValue += '<body>';

        salesReport.defaultValue += '<style>' +
            '.table{border:1px solid black; margin-top: 5%}' +
            '.table-head-column{border:1px solid black; border-collapse: collapse; font-weight: bold;}' +
            '.table-row{border:1px solid black; border-collapse: collapse;}' +
            '.table-column{border:1px solid black; border-collapse: collapse;}' +
            '</style>' +
            // '<div>' +
            '<table style="width:200%; border:10px" id="daTable" class="table table-striped table-bordered table-hover dt-responsive" style="width:100%">' +
            '<thead class="thead-dark" style="font-weight: bold">' +
            '<tr >' +

            '<th scope="col">Main Account</th>' +
            '<th scope="col">Business Unit</th>' +
            '<th scope="col">Name</th>' +
            '<th scope="col">Opening balance</th>' +
            '<th scope="col">Debit</th>' +
            '<th scope="col">Credit</th>' +
            '<th scope="col">Closing Transaction</th>' +
            '<th scope="col">Closing Balance</th>';

        salesReport.defaultValue += '</tr>';
        salesReport.defaultValue += '</thead>';
        salesReport.defaultValue += '<tbody>';

        // for (let i = 0; i < getPnl.length; i++) {
        //     salesReport.defaultValue += 
        //     '<tr class="table-row">' +
        //     '<td class="table-column">'+getPnl[i].account+'</td>' +
        //     '<td class="table-column">'+getPnl[i].description+'</td>' +
        //     '<td class="table-column">ini amount 001</td>' +
        //     '</tr>';
        // }


        //==========================Penjualan=============================

        for (let p = 0; p < final.length; p++) {

            // if ((final[p].name).includes('RETAINED EARNINGS')) {
            //     continue;
            // }

            if ((!final[p].account_number || final[p].account_number == '- None -') && ((final[p].name).includes('Cost of Goods Sold') || (final[p].name).includes('PPN on Purchases ID') || (final[p].name).includes('PPN on Sales ID') || (final[p].name).includes('Rounding Gain/Loss')) ) {
                continue;
            }
            if ((final[p].account_number).includes('4000') || (final[p].account_number).includes('3200') || (final[p].account_number).includes('_1')) {
                continue;
            }
            // if ((final[p].name).includes('DIFF')) {
            //     continue;
            // }

            salesReport.defaultValue +=
                '<tr >' +
                '<td >' + final[p].account_number + '</td>' +
                '<td >' + ((final[p].business_unit).includes('- None -') || (final[p].business_unit).includes('None') ? '' : final[p].business_unit) + '</td>' +
                '<td >' + final[p].name + '</td>' +
                '<td >' + addComa(Number(final[p].opening_blnc)) + '</td>' +
                '<td >' + addComa(Math.abs(final[p].debit)) + '</td>' +
                '<td >' + addComa((Math.abs(final[p].credit))) + '</td>' +
                '<td >' + addComa(Number(final[p].closing_trans)) + '</td>' +
                '<td >' + addComa(Number(final[p].opening_blnc) + (Number(final[p].debit)) + (Number(final[p].credit)) + Number(final[p].closing_trans)) + '</td>';
            salesReport.defaultValue += '</tr>';
        }
        // salesReport.defaultValue +=
        //     '<tr >' +
        //     '<td >325110</td>' +
        //     '<td > - </td>' +
        //     '<td >RETAINED EARNINGS</td>' +
        //     '<td >' + addComa(Number(get_retained_earning[0].retained_earning_opening)) + '</td>' +
        //     '<td >' + addComa(Math.abs(get_retained_earning[0].posted_retained_earning_debit)) + '</td>' +
        //     '<td >' + addComa(Math.abs(Number(get_retained_earning[0].retained_earning) + Number(get_retained_earning[0].posted_retained_earning_credit))) + '</td>' +
        //     '<td >' + addComa((Number(get_retained_earning[0].retained_earning_closing))) + '</td>' +
        //     '<td >' + addComa(Number(get_retained_earning[0].retained_earning_opening) + Number(get_retained_earning[0].retained_earning) + Number(get_retained_earning[0].retained_earning_closing) + Number(get_retained_earning[0].posted_retained_earning_credit) + Number(get_retained_earning[0].posted_retained_earning_debit)) + '</td>';
        // salesReport.defaultValue += '</tr>';

        salesReport.defaultValue += '</tbody>';
        salesReport.defaultValue += '</table>';
        salesReport.defaultValue += '</body>' +
            '</html>';
        context.response.writePage(form);
    }

    function excelPrint(final, context) {
        var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
        xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
        xmlString += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
        xmlString += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
        xmlString += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
        xmlString += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

        xmlString += '<Styles>' +
            '<Style ss:ID="MyNumber">' +
            '<NumberFormat ss:Format="#,#"/>' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '</Style>' +
            '<Style ss:ID="MyCurr">' +
            '<NumberFormat ss:Format="#,#"/>' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignHeader">' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlign">' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderTop">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderLeft">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderRight">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderRightHeader">' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderLeftHeader">' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderTopLeft">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderTopRight">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomRightBase">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomLeftBase">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
            '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomHeader">' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottom">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomLeft">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
            '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBorderBottomRight">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
            '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenter">' +
            '<Font ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenterHeader">' +
            '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenterBorderTop">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenterBorderBottomHeader">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenterBorderBottom">' +
            '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
            '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" /></Borders>' +
            '</Style>' +
            '<Style ss:ID="Font"><Font ss:Size="7" ss:FontName="Arial"/></Style>' +
            '<Style ss:ID="FontRight"><Font ss:Size="7" ss:FontName="Arial"/><Alignment ss:Horizontal="Right"/></Style>' +
            '</Styles>'

        xmlString += '<Worksheet ss:Name="Sheet1">';
        xmlString += '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">';
        xmlString += '<PageSetup>';
        xmlString += '<PageMargins x:Bottom="0.75" x:Left="0.25" x:Right="0.25" x:Top="0.75"/>'
        xmlString += '</PageSetup>';
        xmlString += '</WorksheetOptions>';

        xmlString += '<Table>';

        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';


        xmlString += '<Row>' +
            '<Cell ss:StyleID="MyAlignBorderBottomLeftBase"><Data ss:Type="String">Main Account</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignCenterBorderBottomHeader"><Data ss:Type="String">Business Unit</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignCenterBorderBottomHeader"><Data ss:Type="String">Name</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignCenterBorderBottomHeader"><Data ss:Type="String">Opening balance</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignCenterBorderBottomHeader"><Data ss:Type="String">Debit</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignCenterBorderBottomHeader"><Data ss:Type="String">Credit</Data></Cell>' +
            '<Cell ss:StyleID="MyAlignBorderBottomRightBase"><Data ss:Type="String">Closing Balance</Data></Cell>' +
            '</Row>';

        if (final.length <= 0) {
            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyAlignCenterHeader" ss:MergeAcross="11"><Data ss:Type="String">TIDAK ADA DATA</Data></Cell>' +
                '</Row>';
        } else {
            for (let p = 0; p < final.length; p++) {
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="MyAlignBorderLeft"><Data ss:Type="String">' + final[p].account_number + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + final[p].business_unit + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + final[p].name + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + formatCurrencyIntFromInt(Number(final[p].opening_blnc)) + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + formatCurrencyIntFromInt(Number(final[p].debit)) + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + formatCurrencyIntFromInt((Number(final[p].credit))) + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlignBorderRight"><Data ss:Type="String">' + formatCurrencyIntFromInt(Number(final[p].opening_blnc) + Number(final[p].debit) - Number(final[p].credit)) + '</Data></Cell>' +
                    '</Row>';
            }
            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyAlignBorderBottomLeft"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderBottom"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderBottom"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderBottom"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderBottom"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderBottom"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderBottomRight"><Data ss:Type="String"></Data></Cell>' +
                '</Row>';

        }
        xmlString += '</Table></Worksheet></Workbook>';
        var strXmlEncoded = encode.convert({
            string: xmlString,
            inputEncoding: encode.Encoding.UTF_8,
            outputEncoding: encode.Encoding.BASE_64
        });

        // var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

        var objXlsFile = file.create({
            name: 'test balance sheet.xls',
            fileType: file.Type.EXCEL,
            contents: strXmlEncoded

        });

        context.response.writeFile({
            file: objXlsFile
        });
    }

    function parameters() {
        var form = serverWidget.createForm({ title: 'Trial Balance Report' });

        var reportGroup = form.addFieldGroup({
            id: 'filter_group',
            label: 'Filter'
        });

        var category = form.addField({
            id: DATA.category,
            type: serverWidget.FieldType.SELECT,
            label: 'Category',
            container: 'filter_group'
        });

        category.addSelectOption({
            value: '',
            text: ''
        });

        category.addSelectOption({
            value: '1',
            text: 'Non Closing Transaction'
        });
        category.addSelectOption({
            value: '2',
            text: 'Closing Transaction'
        });

        var startDate = form.addField({
            id: DATA.start_date,
            type: serverWidget.FieldType.DATE,
            label: 'From',
            container: 'filter_group'
        });
        startDate.isMandatory = true;
        var endDate = form.addField({
            id: DATA.end_date,
            type: serverWidget.FieldType.DATE,
            label: 'To',
            container: 'filter_group'
        });
        endDate.isMandatory = true;

        // var is_account_parent = form.addField({
        //     id: DATA.is_account_parent,
        //     type: serverWidget.FieldType.CHECKBOX,
        //     label: 'Is Main Account',
        //     container: 'filter_group'
        // });

        return form;
    }

    function onRequest(context) {
        var form = parameters();
        if (context.request.method === 'GET') {
            context.response.writePage(form);
        } else if (context.request.method === 'POST') {

            var req_param = context.request.parameters;

            var category = req_param[DATA.category];
            var startDate = req_param[DATA.start_date];
            var endDate = req_param[DATA.end_date];
            var isAccountParent = req_param[DATA.is_account_parent];

            var param = {
                start: startDate,
                end: endDate,
            }

            if (category == 1) {
                var get_balance_sheet = balanceSheetSearch(param)
                var get_retained_earning = retainedEarningSearch(param)
                var get_balance_sheet_account = getBalanceAccountBU(get_balance_sheet)
                var get_balance_sheet_opening = balanceSheetOpeningSearch(param, get_balance_sheet_account)
                var combine_saved_search = combine(get_balance_sheet, get_balance_sheet_opening)
                var is_account_parent = isAccountParentClosingF(combine_saved_search)
                log.debug('isAccountParent', (combine_saved_search.filter((data) => (data.account_text_parent).includes('CASH ON HAND'))[0]))
                if (isAccountParent == "T") {
                    var accumulate_diff_child_to_parent = accumulateParentChildDiffAcc(is_account_parent)
                    var print_excel = printHtmlNonClosing(form, accumulate_diff_child_to_parent, context, param, get_retained_earning)
                } else {
                    var accumulate_diff_child_to_parent = accumulateParentChildDiffAcc(combine_saved_search)
                    var print_excel = printHtmlNonClosing(form, accumulate_diff_child_to_parent, context, param, get_retained_earning)

                }
            }
            if (category == 2) {
                var get_balance_sheet = balanceSheetSearchNonTrans(param)
                var get_retained_earning = retainedEarningSearch(param)
                var get_balance_sheet_account = getBalanceAccountBU(get_balance_sheet)
                var get_balance_sheet_opening = balanceSheetOpeningSearch(param, get_balance_sheet_account)
                var combine_saved_search = combine(get_balance_sheet, get_balance_sheet_opening)
                var accumulate_diff_child_to_parent = accumulateParentChildDiffAcc(combine_saved_search)
                var print_excel = printHtmlClosing(form, accumulate_diff_child_to_parent, context, param, get_retained_earning)
            }
        }
        form.addSubmitButton('PRINT')
    }


    return {
        onRequest: onRequest
    }
});

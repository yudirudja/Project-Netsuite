/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search'], function (serverWidget, search) {

    const DATA = {
        field_period: 'custpage_period',
        field_subsidiary: 'custpage_subsidiary',
        field_location: 'custpage_location',
        field_kurs_trade: 'custpage_kurs_trade',
        field_kurs_buy: 'custpage_kurs_buy',
    }

    function getParameter() {
        var form = serverWidget.createForm({
            title: 'PNL Report'
        });

        var period = getPeriodSearch();

        var mainGroupField = form.addFieldGroup({
            id: 'main_group',
            label: 'Main'
        });

        var periodField = form.addField({
            id: DATA.field_period,
            type: serverWidget.FieldType.SELECT,
            label: 'Period',
            container: 'main_group'
        });
        periodField.addSelectOption({
            value: '',
            text: '',
        });
        for (let i = 0; i < period.length; i++) {
            periodField.addSelectOption({
                value: period[i].internal_id,
                text: period[i].period_name,
            });
        }
        var subidiaryField = form.addField({
            id: DATA.field_subsidiary,
            type: serverWidget.FieldType.SELECT,
            source: 'subsidiary',
            label: 'Subsidiary',
            container: 'main_group'
        });
        var locationField = form.addField({
            id: DATA.field_location,
            type: serverWidget.FieldType.SELECT,
            source: 'location',
            label: 'Location',
            container: 'main_group'
        });
        var kursTradeField = form.addField({
            id: DATA.field_kurs_trade,
            type: serverWidget.FieldType.FLOAT,
            label: 'Kurs Trade',
            container: 'main_group'
        });
        var kursBuyField = form.addField({
            id: DATA.field_kurs_buy,
            type: serverWidget.FieldType.FLOAT,
            label: 'Kurs Buy',
            container: 'main_group'
        });

        return form;
    }

    function getPeriodSearch() {

        var result = []

        var accountingperiodSearchObj = search.create({
            type: "accountingperiod",
            filters:
                [
                    ["isadjust", "is", "F"],
                    "AND",
                    ["isyear", "is", "F"],
                    "AND",
                    ["isquarter", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "periodname", label: "Name" }),
                    search.createColumn({
                        name: "enddate",
                        sort: search.Sort.DESC,
                        label: "End Date"
                    }),
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                ]
        }).run().getRange({
            start: 0,
            end: 1000
        });

        for (let x = 0; x < accountingperiodSearchObj.length; x++) {
            var periodName = accountingperiodSearchObj[x].getValue("periodname");
            var endDate = accountingperiodSearchObj[x].getValue("enddate");
            var internalId = accountingperiodSearchObj[x].getValue("internalid");

            result.push({
                period_name: periodName,
                end_date: endDate,
                internal_id: internalId,
            })
        }
        return result;
    }

    function getPnlSavedSearch(data) {

        log.debug("internal id", data)

        var result = [];

        var filter = [
            ["account", "anyof", "2526", "2630", "2829", "2929", "2933", "3029", "2937", "2941", "1122", "2527", "2631", "2830", "2930", "2934", "3030", "2938", "2942", "1123", "2528", "2632", "2831", "2931", "2935", "3031", "2939", "2943", "1124", "2529", "2633", "2832", "2932", "2936", "3032", "2940", "2944", "1125"],
            "AND",
            ["location", "noneof", "@NONE@"],
        ]

        filter.push(
            "AND",
            ["accountingperiod.internalid", "anyof", data],)

        var getPnl = search.create({
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
                        name: "location",
                        summary: "GROUP",
                        sort: search.Sort.ASC,
                        label: "Location"
                    }),
                    search.createColumn({
                        name: "amount",
                        summary: "SUM",
                        label: "Amount"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        summary: "GROUP",
                        formula: "SUBSTR({account}, LENGTH({account}) - INSTR(REVERSE({account}), ':') + 2)",
                        label: "Name"
                    }),
                    search.createColumn({
                        name: "number",
                        join: "account",
                        summary: "GROUP",
                        label: "Number"
                    }),
                ]
        });

        var startrow = 0

        do {
            var toResult = getPnl.run().getRange({
                start: startrow,
                end: startrow + 1000,
            });

            for (let x = 0; x < toResult.length; x++) {
                var getAccount = toResult[x].getText(toResult[x].columns[0]);
                var getLocation = toResult[x].getValue(toResult[x].columns[1]);
                var getLocationText = toResult[x].getText(toResult[x].columns[1]);
                var getAmount = toResult[x].getValue(toResult[x].columns[2]);
                var getAccountName = toResult[x].getValue(toResult[x].columns[3]);
                var getAccoutnNumber = toResult[x].getValue(toResult[x].columns[4]);
                result.push({
                    account: getAccoutnNumber,
                    description: getAccountName,
                    location: getLocation,
                    locationText: getLocationText,
                    amount: getAmount,
                });
            }

        } while (startrow.length === 1000);
        return result;
    }

    function printHtml(form, pnlData, context) {

        var reportGroup = form.addFieldGroup({
            id: 'report_group',
            label: 'Report'
        });
        var pnlReport = form.addField({
            id: 'custpage_pnl_report',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Reprt Pnl',
            container: 'report_group'
        });

        var count = 0;
        var locList = [];

        for (let i = 0; i < pnlData.length; i++) {
            if (!locList.some((data) => data.loc_id === pnlData[i].location) || locList.length < 1) {
                locList.push({
                    loc_id: pnlData[i].location,
                    loc_text: pnlData[i].locationText
                });
            }

        }

        log.debug("loclist", locList)

        pnlReport.defaultValue = '<style>' +
            '.table{border:1px solid black; border-collapse: collapse;}' +
            '.table-head-column{border:1px solid black; border-collapse: collapse; font-weight: bold;}' +
            '.table-row{border:1px solid black; border-collapse: collapse;}' +
            '.table-column{border:1px solid black; border-collapse: collapse;}' +
            '</style>' +
            '<table class="table" style="width:200%">' +
            '<tr class="table-row">' +
            '<th class="table-head-column">COA</th>' +
            '<th class="table-head-column">Description</th>';
        for (let i = 0; i < locList.length; i++) {
            pnlReport.defaultValue += '<th class="table-head-column">' + locList[i].loc_text + '</th>' +
                '<th class="table-head-column">%</th>';
        }
        pnlReport.defaultValue += '</tr>';

        // for (let i = 0; i < getPnl.length; i++) {
        //     pnlReport.defaultValue += 
        //     '<tr class="table-row">' +
        //     '<td class="table-column">'+getPnl[i].account+'</td>' +
        //     '<td class="table-column">'+getPnl[i].description+'</td>' +
        //     '<td class="table-column">ini amount 001</td>' +
        //     '</tr>';
        // }

        //===========I DAN J ADALAH POINTER UNTUK PRINT RESULT============
        var k = 0;
        var prevLocIdPnl = "";
        var count = 0;
        var tempArrSubTotal = [];
        var tempArrEachLine = [];
        var subTotalAmount = 0;

        //==========================Penjualan=============================
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-1001000</td>' +
            '<td class="table-column">Penjualan Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-1001000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0)
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-1002000</td>' +
            '<td class="table-column">Penjualan Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-1002000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-1003000</td>' +
            '<td class="table-column">Penjualan Loose Stone</td>';
        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-1003000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-1004000</td>' +
            '<td class="table-column">Penjualan Logam Mulia</td>';
        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-1004000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Penjualan (GRS)</td>';
        for (let i = 0; i < tempArrSubTotal.length; i++) {
            subTotalAmount += tempArrSubTotal[i][k];

            if (i == tempArrSubTotal.length - 1 && k < tempArrSubTotal[i].length - 1) {
                pnlReport.defaultValue += '<td class="table-column">' + subTotalAmount + '</td>' +
                    '<td class="table-column">31%</td>';
                k++;
                i = -1
                subTotalAmount = 0;
            } else if (i == tempArrSubTotal.length - 1 && k == tempArrSubTotal[i].length - 1) {
                pnlReport.defaultValue += '<td class="table-column">' + subTotalAmount + '</td>' +
                    '<td class="table-column">31%</td>';
                k = 0;
                subTotalAmount = 0
                break;
            }
        }
        tempArrSubTotal = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-1001000</td>' +
            '<td class="table-column">Penjualan Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-1001000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-1002000</td>' +
            '<td class="table-column">Penjualan Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-1002000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-1003000</td>' +
            '<td class="table-column">Penjualan Loose Stone</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-1003000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-1004000</td>' +
            '<td class="table-column">Penjualan Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-1004000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Penjualan (NET)</td>';
        for (let i = 0; i < tempArrSubTotal.length; i++) {
            subTotalAmount += tempArrSubTotal[i][k];

            if (i == tempArrSubTotal.length - 1 && k < tempArrSubTotal[i].length - 1) {
                pnlReport.defaultValue += '<td class="table-column">' + subTotalAmount + '</td>' +
                    '<td class="table-column">31%</td>';
                k++;
                i = -1
                subTotalAmount = 0;
            } else if (i == tempArrSubTotal.length - 1 && k == tempArrSubTotal[i].length - 1) {
                pnlReport.defaultValue += '<td class="table-column">' + subTotalAmount + '</td>' +
                    '<td class="table-column">31%</td>';
                k = 0;
                subTotalAmount = 0
                break;
            }
        }
        tempArrSubTotal = [];
        pnlReport.defaultValue += '</tr>';
        //==================================================================================
        //===========================================Potongan Penjualan=====================
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4001001</td>' +
            '<td class="table-column">Potongan Penjualan PL Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4001002</td>' +
            '<td class="table-column">Potongan Penjualan PL Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001002' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4001003</td>' +
            '<td class="table-column">Potongan Penjualan PL Loose Stone</td>';
        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001003' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4001004</td>' +
            '<td class="table-column">Potongan Penjualan PL Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001004' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    tempArrEachLine.push(Number(pnlData[i].amount));
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
                tempArrEachLine.push(0);
            }
            count = 0
        }
        tempArrSubTotal.push(tempArrEachLine);
        tempArrEachLine = [];
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Penjualan (GRS)</td>';
        for (let i = 0; i < tempArrSubTotal.length; i++) {
            subTotalAmount += tempArrSubTotal[i][k];

            if (i == tempArrSubTotal.length - 1 && k < tempArrSubTotal[i].length - 1) {
                pnlReport.defaultValue += '<td class="table-column">' + subTotalAmount + '</td>' +
                    '<td class="table-column">31%</td>';
                k++;
                i = -1
                subTotalAmount = 0;
            } else if (i == tempArrSubTotal.length - 1 && k == tempArrSubTotal[i].length - 1) {
                pnlReport.defaultValue += '<td class="table-column">' + subTotalAmount + '</td>' +
                    '<td class="table-column">31%</td>';
                k = 0;
                subTotalAmount = 0
                break;
            }
        }
        tempArrSubTotal = [];
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4001001</td>' +
            '<td class="table-column">Potongan Penjualan PL Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4001002</td>' +
            '<td class="table-column">Potongan Penjualan PL Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001002' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4001003</td>' +
            '<td class="table-column">Potongan Penjualan PL Loose Stone</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001003' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4001004</td>' +
            '<td class="table-column">Potongan Penjualan PL Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001004' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Penjualan (NET)</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        //====================================================================================
        //=====================================Retur Penjualan================================

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-3001000</td>' +
            '<td class="table-column">Retur Penjualan Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-3001000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-3002000</td>' +
            '<td class="table-column">Retur Penjualan Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-3002000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-3003000</td>' +
            '<td class="table-column">Retur Penjualan Loose Stone</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-3003000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-3004000</td>' +
            '<td class="table-column">Retur Penjualan Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-3004000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Penjualan (GRS)</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-3001000</td>' +
            '<td class="table-column">Retur Penjualan Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-3001000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-3002000</td>' +
            '<td class="table-column">Retur Penjualan Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-3002000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-3003000</td>' +
            '<td class="table-column">Retur Penjualan Loose Stone</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-3003000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-3004000</td>' +
            '<td class="table-column">Retur Penjualan Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-3004000' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Penjualan (NET)</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4001001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        //====================================================================================
        //===============================Potongan Diskon lainnya==============================

        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4002001</td>' +
            '<td class="table-column">Potongan Diskon Lainnya Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4002001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4002002</td>' +
            '<td class="table-column">Potongan Diskon Lainnya Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4002002' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4002003</td>' +
            '<td class="table-column">Potongan Diskon Lainnya Loose Stone</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4002003' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4002004</td>' +
            '<td class="table-column">Potongan Diskon Lainnya Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4002004' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Potongan Diskon Lainnya</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4002004' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        //====================================================================================
        //=====================================Potongan Extra================================
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4003001</td>' +
            '<td class="table-column">Potongan Extra Diskon Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4003001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4003002</td>' +
            '<td class="table-column">Potongan Extra Diskon Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4003002' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4003003</td>' +
            '<td class="table-column">Potongan Extra Diskon Loose Stone</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4003003' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4003004</td>' +
            '<td class="table-column">Potongan Extra Diskon Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4003004' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Potongan Extra Diskon</td>' +
            '<td class="table-column">ini amount 001</td>' +
            '</tr>';
        //====================================================================================
        //=====================================Potongan Welcome Voucher================================
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4004001</td>' +
            '<td class="table-column">Potongan Welcome Voucher Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4004001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4004002</td>' +
            '<td class="table-column">Potongan Welcome Voucher Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4004002' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4004003</td>' +
            '<td class="table-column">Potongan Welcome Voucher Loose Stone</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4004003' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4004004</td>' +
            '<td class="table-column">Potongan Welcome Voucher Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4004004' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Potongan Welcome Voucher</td>' +
            '<td class="table-column">ini amount 001</td>' +
            '</tr>';
        //====================================================================================
        //=====================================Potongan Voucher Lainnya================================
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4005001</td>' +
            '<td class="table-column">Potongan Voucher Lainnya Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4005001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4005002</td>' +
            '<td class="table-column">Potongan Voucher Lainnya Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4005002' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4005003</td>' +
            '<td class="table-column">Potongan Voucher Lainnya Loose Stone</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4005003' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4005004</td>' +
            '<td class="table-column">Potongan Voucher Lainnya Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4005004' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Potongan Voucher Lainnya</td>' +
            '<td class="table-column">ini amount 001</td>' +
            '</tr>';
        //====================================================================================
        //=====================================Potongan Voucher Birthday================================
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4006001</td>' +
            '<td class="table-column">Potongan Voucher Birthday Diamond Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4006001' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4006002</td>' +
            '<td class="table-column">Potongan Voucher Birthday Gold Jewelry</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4006002' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4006003</td>' +
            '<td class="table-column">Potongan Voucher Birthday Loose Stone</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4006003' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-4006004</td>' +
            '<td class="table-column">Potongan Voucher Birthday Logam Mulia</td>';

        for (let x = 0; x < locList.length; x++) {
            for (let i = 0; i < pnlData.length; i++) {
                if (pnlData[i].account == '4-4006004' && locList[x].loc_id == pnlData[i].location) {
                    pnlReport.defaultValue += '<td class="table-column">' + pnlData[i].amount + '</td>' +
                        '<td class="table-column">31%</td>';
                    count++;
                    break;
                }
            }
            if (count < 1) {
                pnlReport.defaultValue += '<td class="table-column"> - </td>' +
                    '<td class="table-column"> - </td>';
            }
            count = 0
        }
        pnlReport.defaultValue += '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Potongan Voucher Birthday</td>' +
            '<td class="table-column">ini amount 001</td>' +
            '</tr>';
        //====================================================================================
        //========================================Penjualan Gross=============================
        pnlReport.defaultValue +=
            '<tr class="table-row" style = "background-color: #e7f28a">' +
            '<td class="table-column"></td>' +
            '<td class="table-column">Pendapatan Penjualan Gross</td>' +
            '<td class="table-column">ini amount 001</td>' +
            '</tr>';
        //====================================================================================
        //=======================================Pendapatan===================================
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-2100000</td>' +
            '<td class="table-column">Pendapatan Bunga Titipan</td>' +
            '<td class="table-column">ini amount 001</td>' +
            '</tr>';
        pnlReport.defaultValue +=
            '<tr class="table-row">' +
            '<td class="table-column">4-2200000</td>' +
            '<td class="table-column">Pendapatan Jasa Perbaikan</td>' +
            '<td class="table-column">ini amount 001</td>' +
            '</tr>';


        pnlReport.defaultValue += '</table>';

        context.response.writePage(form);
    }

    function onRequest(context) {
        var form = getParameter();

        if (context.request.method === 'GET') {
            form.addSubmitButton({ label: 'Generate Report' });
            context.response.writePage(form);
        } else {
            var requestParam = context.request.parameters;
            var getPeriod = requestParam[DATA.field_period];
            var getLocation = requestParam[DATA.field_location];
            var getSubsidiary = requestParam[DATA.field_subsidiary];
            var getKursTrade = requestParam[DATA.field_kurs_trade];
            var getkursBuy = requestParam[DATA.field_kurs_trade];

            var getAllPeriod = getPeriodSearch();

            var paramSearch = [];

            for (let i = getAllPeriod.length - 1; i > 0; i--) {
                if (getAllPeriod[i].internal_id == getPeriod) {
                    paramSearch.push(getAllPeriod[i].internal_id);
                    break;
                } else {
                    paramSearch.push(getAllPeriod[i].internal_id);
                }
            }

            var getPnl = getPnlSavedSearch(paramSearch);

            var showPrint = printHtml(form, getPnl, context);

            log.debug("getPnl", getPnl);

        }

    }

    return {
        onRequest: onRequest
    }
});


/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */

define(['N/search', 'N/ui/serverWidget'], function (search, serverWidget) {

    function incomeStatementBrand(params) {

        let result = []

        let filter = [
            ["posting", "is", "T"],
            "AND",
            ["accounttype", "anyof", "COGS", "Income", "Expense", "OthExpense", "OthIncome"],
        ]

        if (params.startDate && params.endDate) {
            filter.push("AND",
                ["accountingperiod.startdate", "within", params.startDate, params.endDate])
        }

        if (params.subsidiary) {
            filter.push("AND",
                ["subsidiary", "anyof", params.subsidiary])
        }

        let get_income_statement = search.create({
            type: "transaction",
            filters: filter,
            columns:
                [
                    search.createColumn({
                        name: "postingperiod",
                        summary: "GROUP",
                        label: "Period"
                    }),
                    search.createColumn({
                        name: "account",
                        summary: "GROUP",
                        label: "Account"
                    }),
                    search.createColumn({
                        name: "amount",
                        summary: "SUM",
                        label: "Amount"
                    }),
                    // search.createColumn({
                    //     name: "formulanumeric",
                    //     summary: "SUM",
                    //     formula: `case when TO_DATE({accountingperiod.startdate},'D/M/YYYY') >= TO_DATE('${params.startDate}', 'D/M/YYYY') AND TO_DATE({accountingperiod.startdate},'D/M/YYYY') <= TO_DATE('${params.endDate}', 'D/M/YYYY') then {amount} else 0 end`,
                    //     label: "Amount"
                    // }),
                    search.createColumn({
                        name: "line.cseg_me_brand",
                        summary: "GROUP",
                        label: "ME - Brand"
                    }),
                    // search.createColumn({
                    //     name: "subsidiarynohierarchy",
                    //     summary: "GROUP",
                    //     label: "Subsidiary (no hierarchy)"
                    // }),
                ]
        });

        let startRow = 0;

        do {

            var getResult = get_income_statement.run().getRange({
                start: startRow,
                end: startRow + 1000
            });

            for (let i = 0; i < getResult.length; i++) {
                let posting_period = getResult[i].getText(getResult[i].columns[0])
                let account = getResult[i].getText(getResult[i].columns[1])
                let amount = getResult[i].getValue(getResult[i].columns[2])
                let brand = getResult[i].getText(getResult[i].columns[3])
                // let subsidiary = getResult[i].getValue(getResult[i].columns[4])

                result.push({
                    posting_period: posting_period,
                    account: account,
                    amount_account: amount,
                    brand: brand,
                    subsidiary: null,
                    amount: null,
                    name: null,
                    department: null,
                    class_: null,
                });

            }
            startRow += 1000

        } while (getResult.length === 1000);
        log.debug("result income Brand", result)
        return result
    }
    function incomeStatementItemCategories(params) {

        let result = []

        let filter = [
            ["posting", "is", "T"],
            "AND",
            ["accounttype", "anyof", "COGS", "Income", "Expense", "OthExpense", "OthIncome"],
        ]

        if (params.startDate && params.endDate) {
            filter.push("AND",
                ["accountingperiod.startdate", "within", params.startDate, params.endDate])
        }
        if (params.subsidiary) {
            filter.push("AND",
                ["subsidiary", "anyof", params.subsidiary])
        }

        let get_income_statement = search.create({
            type: "transaction",
            filters: filter,
            columns:
                [
                    search.createColumn({
                        name: "postingperiod",
                        summary: "GROUP",
                        label: "Period"
                    }),
                    search.createColumn({
                        name: "account",
                        summary: "GROUP",
                        label: "Account"
                    }),
                    search.createColumn({
                        name: "amount",
                        summary: "SUM",
                        label: "Amount"
                    }),
                    // search.createColumn({
                    //     name: "formulanumeric",
                    //     summary: "SUM",
                    //     formula: `case when TO_DATE({accountingperiod.startdate},'D/M/YYYY') >= TO_DATE('${params.startDate}', 'D/M/YYYY') AND TO_DATE({accountingperiod.startdate},'D/M/YYYY') <= TO_DATE('${params.endDate}', 'D/M/YYYY') then {amount} else 0 end`,
                    //     label: "Amount"
                    // }),
                    search.createColumn({
                        name: "class",
                        summary: "GROUP",
                        label: "Item Category"
                    }),
                    // search.createColumn({
                    //     name: "subsidiarynohierarchy",
                    //     summary: "GROUP",
                    //     label: "Subsidiary (no hierarchy)"
                    // }),
                ]
        });

        let startRow = 0;

        do {

            var getResult = get_income_statement.run().getRange({
                start: startRow,
                end: startRow + 1000
            });

            for (let i = 0; i < getResult.length; i++) {
                let posting_period = getResult[i].getText(getResult[i].columns[0])
                let account = getResult[i].getText(getResult[i].columns[1])
                let amount = getResult[i].getValue(getResult[i].columns[2])
                let item_categories = getResult[i].getText(getResult[i].columns[3])
                // let subsidiary = getResult[i].getValue(getResult[i].columns[4])

                result.push({
                    posting_period: posting_period,
                    account: account,
                    amount_account: amount,
                    item_categories: item_categories,
                    subsidiary: null,
                    amount: null,
                    name: null,
                    department: null,
                    class_: null,
                });

            }
            startRow += 1000

        } while (getResult.length === 1000);
        log.debug("result income item categories", result)
        return result
    }
    function incomeStatementSalesChannel(params) {

        let result = []

        let filter = [
            ["posting", "is", "T"],
            "AND",
            ["accounttype", "anyof", "COGS", "Income", "Expense", "OthExpense", "OthIncome"],
        ]

        if (params.startDate && params.endDate) {
            filter.push("AND",
                ["accountingperiod.startdate", "within", params.startDate, params.endDate])
        }

        if (params.subsidiary) {
            filter.push("AND",
                ["subsidiary", "anyof", params.subsidiary])
        }

        let get_income_statement = search.create({
            type: "transaction",
            filters: filter,
            columns:
                [
                    search.createColumn({
                        name: "postingperiod",
                        summary: "GROUP",
                        label: "Period"
                    }),
                    search.createColumn({
                        name: "account",
                        summary: "GROUP",
                        label: "Account"
                    }),
                    search.createColumn({
                        name: "amount",
                        summary: "SUM",
                        label: "Amount"
                    }),
                    // search.createColumn({
                    //     name: "formulanumeric",
                    //     summary: "SUM",
                    //     formula: `case when TO_DATE({accountingperiod.startdate},'D/M/YYYY') >= TO_DATE('${params.startDate}', 'D/M/YYYY') AND TO_DATE({accountingperiod.startdate},'D/M/YYYY') <= TO_DATE('${params.endDate}', 'D/M/YYYY') then {amount} else 0 end`,
                    //     label: "Amount"
                    // }),
                    search.createColumn({
                        name: "cseg_me_sales_cnl",
                        summary: "GROUP",
                        label: "ME - Sales Channel"
                    }),
                    // search.createColumn({
                    //     name: "subsidiarynohierarchy",
                    //     summary: "GROUP",
                    //     label: "Subsidiary (no hierarchy)"
                    // }),
                ]
        });

        let startRow = 0;

        do {

            var getResult = get_income_statement.run().getRange({
                start: startRow,
                end: startRow + 1000
            });

            for (let i = 0; i < getResult.length; i++) {
                let posting_period = getResult[i].getText(getResult[i].columns[0])
                let account = getResult[i].getText(getResult[i].columns[1])
                let amount = getResult[i].getValue(getResult[i].columns[2])
                let sales_channel = getResult[i].getText(getResult[i].columns[3])
                // let subsidiary = getResult[i].getValue(getResult[i].columns[4])

                result.push({
                    posting_period: posting_period,
                    account: account,
                    amount_account: amount,
                    sales_channel: sales_channel,
                    subsidiary: null,
                    amount: null,
                    name: null,
                    department: null,
                    class_: null,
                });

            }
            startRow += 1000

        } while (getResult.length === 1000);
        log.debug("result income sls channel", result)
        return result
    }

    function getPnlChild(params) {

        let result = []

        let get_pnl_child = search.create({
            type: "customrecord_me_custom_record_pnl_child",
            filters:
                [
                    ["custrecord_lines.custrecord_date", "within", params.startDate, params.endDate]
                ],
            columns:
                [
                    search.createColumn({
                        name: "custrecord_account",
                        summary: "GROUP",
                        label: "ACCOUNT"
                    }),
                    search.createColumn({
                        name: "custrecord_amount",
                        summary: "GROUP",
                        label: "AMOUNT"
                    }),
                    search.createColumn({
                        name: "custrecord_me_name",
                        summary: "GROUP",
                        label: "NAME"
                    }),
                    search.createColumn({
                        name: "custrecord_department",
                        summary: "GROUP",
                        label: "DEPARTMENT"
                    }),
                    search.createColumn({
                        name: "custrecord_class",
                        summary: "GROUP",
                        label: "CLASS"
                    }),
                    search.createColumn({
                        name: "custrecord_brand",
                        summary: "GROUP",
                        label: "BRAND"
                    }),
                    search.createColumn({
                        name: "custrecord_sales_channel",
                        summary: "GROUP",
                        label: "SALES CHANNEL"
                    }),
                    search.createColumn({
                        name: "custrecord6",
                        summary: "GROUP",
                        label: "SUBSIDIARY"
                    }),
                    search.createColumn({
                        name: "custrecord_item_categories",
                        summary: "GROUP",
                        label: "ITEM CATEGORIES"
                    }),
                ]
        });

        let startRow = 0;

        do {

            var getResult = get_pnl_child.run().getRange({
                start: startRow,
                end: startRow + 1000
            });

            for (let i = 0; i < getResult.length; i++) {
                let account = getResult[i].getText(getResult[i].columns[0])
                let amount = getResult[i].getValue(getResult[i].columns[1])
                let name = getResult[i].getValue(getResult[i].columns[2])
                let department = getResult[i].getText(getResult[i].columns[3])
                let class_ = getResult[i].getValue(getResult[i].columns[4])
                let brand = getResult[i].getText(getResult[i].columns[5])
                let sales_channel = getResult[i].getText(getResult[i].columns[6])
                let subsidiary = getResult[i].getValue(getResult[i].columns[7])
                let item_categories = getResult[i].getText(getResult[i].columns[8])

                result.push({
                    account: account,
                    amount: amount,
                    name: name,
                    department: department,
                    class_: class_,
                    brand: brand,
                    sales_channel: sales_channel,
                    subsidiary: subsidiary,
                    item_categories: item_categories,
                });

            }
            startRow += 1000

        } while (getResult.length === 1000);

        log.debug("result pnl", result)
        return result;

    }

    function combine(pnl_data, income_statement_data_brand, income_statement_data_item_categories, income_statement_data_sales_channel) {

        return [...pnl_data, ...income_statement_data_brand, ...income_statement_data_item_categories, ...income_statement_data_sales_channel];

    }

    function parameters() {
        var form = serverWidget.createForm('Report Record Pnl');
        form.addFieldGroup({ id: "filter", label: 'Filter' });

        var startdate = form.addField({
            id: "custpage_startdate",
            type: serverWidget.FieldType.DATE,
            label: "Start Date",
            container: 'filter'
        });
        startdate.isMandatory = true;

        var enddate = form.addField({
            id: "custpage_enddate",
            type: serverWidget.FieldType.DATE,
            label: "End Date",
            container: "filter"
        });
        enddate.isMandatory = true;
        var subsidiary = form.addField({
            id: "custpage_subsidiary",
            type: serverWidget.FieldType.SELECT,
            label: "Subsidiary",
            source: "subsidiary",
            container: "filter"
        });
        return form;
    }

    function HTML_Print(form, final, context, param) {

        let subsidiary_text = ""
        if (param.subsidiary) {


            let get_subsidiary_text = search.lookupFields({
                type: search.Type.SUBSIDIARY,
                id: param.subsidiary,
                columns: ['name']
            });


            if (get_subsidiary_text.name.includes(":")) {
                subsidiary_text = get_subsidiary_text.name.split(":")[1]
            } else {
                subsidiary_text = get_subsidiary_text.name
            }
        }

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
            '<h2 style= "text-align">Report Period ' + param.startDate + ' to ' + param.endDate + ' Subsidiary ' + subsidiary_text + '</h2>' +
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
            '<div style="overflow-x: auto; max-width: 100%;">' +
            '<table style="width: 100%; table-layout: auto; border-collapse: collapse; white-space: nowrap; border:10px" id="daTable" class="table table-striped table-bordered table-hover dt-responsive" >' +
            '<thead class="thead-dark" style="font-weight: bold">' +
            '<tr >' +

            '<th scope="col">Account</th>' +
            '<th scope="col">Amount</th>' +
            '<th scope="col">Amount Income Statement</th>' +
            '<th scope="col">Name</th>' +
            '<th scope="col">Department</th>' +
            '<th scope="col">Class</th>' +
            '<th scope="col">Item Categories</th>' +
            '<th scope="col">Subsidiary</th>' +
            '<th scope="col">Brand</th>' +
            '<th scope="col">Sales Channel</th>';


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
        let is_bu_kosng_exist = false;
        for (let p = 0; p < final.length; p++) {

            salesReport.defaultValue +=
                '<tr >' +
                '<td >' + final[p].account + '</td>' +
                '<td >' + (final[p].amount ? Number(final[p].amount) : "") + '</td>' +
                '<td >' + (final[p].amount_account ? Number(final[p].amount_account) : 0) + '</td>' +
                '<td >' + (final[p].name ? final[p].name : "") + '</td>' +
                '<td >' + (final[p].department ? final[p].department : "") + '</td>' +
                '<td >' + (final[p].class_ ? final[p].class_ : "") + '</td>' +
                '<td >' + (final[p].item_categories ? final[p].item_categories : "") + '</td>' +
                '<td >' + (final[p].subsidiary ? final[p].subsidiary : "") + '</td>' +
                '<td >' + (final[p].brand ? final[p].brand : "") + '</td>' +
                '<td >' + (final[p].sales_channel ? final[p].sales_channel : "") + '</td>';
            salesReport.defaultValue += '</tr>';

        }

        salesReport.defaultValue += '</tbody>';
        salesReport.defaultValue += '</table>';
        salesReport.defaultValue += '</div>';
        salesReport.defaultValue += '</body>' +
            '</html>';
        context.response.writePage(form);
    }

    function onRequest(context) {

        let form = parameters();

        let field_date_start = form.getField({ id: "custpage_startdate" });
        let field_date_end = form.getField({ id: "custpage_enddate" });
        let field_subsidiary = form.getField({ id: "custpage_subsidiary" });

        let startDate = context.request.parameters.custpage_startdate;
        let endDate = context.request.parameters.custpage_enddate;
        let subsidiary = context.request.parameters.custpage_subsidiary;

        let paramsObj = {
            startDate: startDate,
            endDate: endDate,
            subsidiary: subsidiary,
        }

        if (context.request.method === 'GET') {
            form.addSubmitButton({ label: 'Generate' });
            context.response.writePage(form);
        } else if (context.request.method === 'POST') {
            field_date_start.defaultValue = startDate
            field_date_start.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            field_date_end.defaultValue = endDate
            field_date_end.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            field_subsidiary.defaultValue = subsidiary
            field_subsidiary.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            let get_pnl_data = getPnlChild(paramsObj)
            let get_income_statement_brand = incomeStatementBrand(paramsObj)
            let get_income_statement_item_categories = incomeStatementItemCategories(paramsObj)
            let get_income_statement_sales_channel = incomeStatementSalesChannel(paramsObj)

            let combine_search = combine(get_pnl_data, get_income_statement_brand, get_income_statement_item_categories, get_income_statement_sales_channel)
            let print_html = HTML_Print(form, combine_search, context, paramsObj)


        }

    }

    return {
        onRequest: onRequest
    }
});

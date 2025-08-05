/**
 *@NApiVersion 2.1
*@NScriptType Suitelet
*/
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/redirect', 'N/encode', 'N/file'], function (serverWidget, record, search, redirect, encode, file,) {

    const DATA = {
        category: 'custpage_category',
        start_date: 'custpage_start_date',
        end_date: 'custpage_end_date',
        is_account_parent: 'custpage_is_account_parent',

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

    function getMonitoringUangMuka(param) {
        let result = []

        let filter = [
            ["taxline", "is", "F"],
            "AND",
            ["subsidiary", "anyof", "6"],
            "AND",
            ["mainline", "is", "T"],
            "AND",
            ["custbody_asl_pumnumtext", "isnotempty", ""],
            "AND",
            ["voided", "is", "F"],
            "AND",
            ["type", "anyof", "Check", "PurchOrd", "Deposit"],
            "AND",
            [[["customform", "anyof", "171", "145"], "AND", ["type", "anyof", "Check"], "AND", ["custbody_asl_pumnumtext", "isnotempty", ""]], "OR", [["customform", "anyof", "151", "172", "145"], "AND", ["type", "anyof", "Check", "Deposit"]], "OR", [["type", "anyof", "PurchOrd"], "AND", ["customform", "anyof", "148", "189"]], "OR", [["type", "anyof", "Check"], "AND", ["custbody_me_tipe_pum", "anyof", "2"]], "OR", [["type", "anyof", "Deposit"], "AND", ["custbody_asl_pumnumtext", "isnotempty", ""], "AND", ["customform", "anyof", "151", "172"]]]
        ];

        if (param.date_after) {
            filter.push("AND",
            ["trandate", "after", param.date_after],)
        }

        var search_monitoring_uang_muka = search.create({
            type: "check",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters: filter,
            columns:
                [
                    search.createColumn({
                        name: "custbody_asl_pumnumtext",
                        summary: "GROUP",
                        label: "NOMOR UM"
                    }),
                    search.createColumn({
                        name: "trandate",
                        summary: "MAX",
                        label: "TANGGAL UM"
                    }),
                    search.createColumn({
                        name: "entity",
                        summary: "MAX",
                        label: "NAMA"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        summary: "MAX",
                        formula: "CASE WHEN {type} = 'Purchase Order' AND {custbody_me_jba_sub_category_po} = 'Realisasi PUM' THEN {tranid} ELSE NULL END",
                        label: "NOMOR REALISASI"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        summary: "MAX",
                        formula: "CASE WHEN {type} = 'Deposit' THEN {tranid} WHEN {type} IN ('Bank Purchases', 'Check') AND {custbody_me_tipe_pum} = 'Penyelesaian' THEN {tranid} ELSE NULL END",
                        label: "NOMOR PENYELESAIAN"
                    }),
                    search.createColumn({
                        name: "custbody_asl_outstandingadv",
                        summary: "MAX",
                        label: "AMOUNT UM"
                    }),
                    search.createColumn({
                        name: "formulacurrency",
                        summary: "SUM",
                        formula: "CASE WHEN {type} = 'Purchase Order' AND {custbody_me_jba_sub_category_po} = 'Realisasi PUM' THEN {amount} ELSE NULL END",
                        label: "REALISASI"
                    }),
                    search.createColumn({
                        name: "formulacurrency",
                        summary: "SUM",
                        formula: "CASE WHEN {type} = 'Deposit' THEN {total} ELSE NULL END",
                        label: "PENGEMBALIAN"
                    }),
                    search.createColumn({
                        name: "formulacurrency",
                        summary: "MAX",
                        formula: "CASE WHEN {type} IN ('Bank Purchases', 'Check') AND {custbody_me_tipe_pum} = 'Penyelesaian' THEN ABS({total}) ELSE NULL  END",
                        label: "PENYELESAIAN"
                    }),
                    search.createColumn({
                        name: "formulacurrency",
                        summary: "MIN",
                        formula: "CASE WHEN TO_NUMBER(NVL((CASE WHEN {type} = 'Check' AND {custbody_me_tipe_pum} = 'Pengajuan'THEN {custbody_asl_outstandingadv} WHEN {type} = 'Deposit' THEN {custbody_asl_outstandingadv} ELSE NULL END), 0)) - (  TO_NUMBER( NVL( (CASE   WHEN {type} = 'Purchase Order' AND {custbody_me_jba_sub_category_po} = 'Realisasi PUM'   THEN {amount}   ELSE NULL END), 0)  ) + TO_NUMBER( NVL( (CASE   WHEN {type} = 'Deposit'   THEN {total}   ELSE NULL END), 0)  ) + TO_NUMBER( NVL( (CASE   WHEN {type} IN ('Bank Purchases', 'Check') AND {custbody_me_tipe_pum} = 'Penyelesaian'   THEN ABS({total})   ELSE NULL END), 0)  )) < 0    THEN 0    ELSE TO_NUMBER(  NVL( (CASE WHEN {type} = 'Check' AND {custbody_me_tipe_pum} = 'Pengajuan' THEN {custbody_asl_outstandingadv} WHEN {type} = 'Deposit' THEN {custbody_asl_outstandingadv} ELSE NULL END), 0)) - (  TO_NUMBER( NVL( (CASE   WHEN {type} = 'Purchase Order' AND {custbody_me_jba_sub_category_po} = 'Realisasi PUM'   THEN {amount}   ELSE NULL END), 0)  ) + TO_NUMBER( NVL( (CASE   WHEN {type} = 'Deposit'   THEN {total}   ELSE NULL END), 0)  ) + TO_NUMBER( NVL( (CASE   WHEN {type} IN ('Bank Purchases', 'Check') AND {custbody_me_tipe_pum} = 'Penyelesaian'   THEN ABS({total})   ELSE NULL END), 0)  )) END",
                        label: "OUTSTANDING "
                    }),
                    search.createColumn({
                        name: "memomain",
                        summary: "MAX",
                        label: "MEMO"
                    })
                ]
        });

        var pagedData = search_monitoring_uang_muka.runPaged({
            pageSize: 1000
        });

        pagedData.pageRanges.forEach(function (pageRange) {
            var page = pagedData.fetch({ index: pageRange.index });
            page.data.forEach(function (resultRow) {
                let columns = resultRow.columns;
                let nomor_um = resultRow.getValue(columns[0]);
                let tanggal_um = resultRow.getValue(columns[1]);
                let nama = resultRow.getValue(columns[2]);
                let nomor_realisasi = resultRow.getValue(columns[3]);
                let nomor_penyelesaian = resultRow.getValue(columns[4]);
                let amount_um = resultRow.getValue(columns[5]);
                let realisasi = resultRow.getValue(columns[6]);
                let pengmbalian = resultRow.getValue(columns[7]);
                let penyelesaian = resultRow.getValue(columns[8]);
                let outstanding = Number(amount_um) - (Number(realisasi) + Number(pengmbalian) + Number(penyelesaian));
                let memo = resultRow.getValue(columns[10]);

                result.push({
                    nomor_um: nomor_um,
                    tanggal_um: tanggal_um,
                    nama: nama,
                    nomor_realisasi: nomor_realisasi,
                    nomor_penyelesaian: nomor_penyelesaian,
                    amount_um: amount_um,
                    realisasi: realisasi,
                    pengmbalian: pengmbalian,
                    penyelesaian: penyelesaian,
                    outstanding: outstanding,
                    memo: memo,
                    details: [],
                });
            });
        });

        log.debug("resut", result)

        return result
    }
    function getMonitoringUangMukaChild(param) {
        let result = []

        let filter = [
            ["taxline", "is", "F"],
            "AND",
            ["subsidiary", "anyof", "6"],
            "AND",
            ["mainline", "is", "T"],
            "AND",
            ["custbody_asl_pumnumtext", "isnotempty", ""],
            "AND",
            ["voided", "is", "F"],
            "AND",
            ["type", "anyof", "Check", "PurchOrd", "Deposit"],
            "AND",
            [[["customform", "anyof", "171", "145"], "AND", ["type", "anyof", "Check"], "AND", ["custbody_asl_pumnumtext", "isnotempty", ""]], "OR", [["customform", "anyof", "151", "172", "145"], "AND", ["type", "anyof", "Check", "Deposit"]], "OR", [["type", "anyof", "PurchOrd"], "AND", ["customform", "anyof", "148", "189"]], "OR", [["type", "anyof", "Check"], "AND", ["custbody_me_tipe_pum", "anyof", "2"]], "OR", [["type", "anyof", "Deposit"], "AND", ["custbody_asl_pumnumtext", "isnotempty", ""], "AND", ["customform", "anyof", "151", "172"]]]
        ];

        if (param.date_after) {
            filter.push("AND",
            ["trandate", "after", param.date_after],)
        }

        var search_monitoring_uang_muka = search.create({
            type: "check",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters: filter,
            columns:
                [
                    search.createColumn({
                        name: "custbody_asl_pumnumtext",
                        label: "NOMOR UM"
                    }),
                    search.createColumn({
                        name: "trandate",
                        label: "TANGGAL UM"
                    }),
                    search.createColumn({
                        name: "entity",
                        label: "NAMA"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "CASE WHEN {type} = 'Purchase Order' AND {custbody_me_jba_sub_category_po} = 'Realisasi PUM' THEN {tranid} ELSE NULL END",
                        label: "NOMOR REALISASI"
                    }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "CASE WHEN {type} = 'Deposit' THEN {tranid} WHEN {type} IN ('Bank Purchases', 'Check') AND {custbody_me_tipe_pum} = 'Penyelesaian' THEN {tranid} ELSE NULL END",
                        label: "NOMOR PENYELESAIAN"
                    }),
                    search.createColumn({
                        name: "custbody_asl_outstandingadv",
                        label: "AMOUNT UM"
                    }),
                    search.createColumn({
                        name: "formulacurrency",
                        formula: "CASE WHEN {type} = 'Purchase Order' AND {custbody_me_jba_sub_category_po} = 'Realisasi PUM' THEN {amount} ELSE NULL END",
                        label: "REALISASI"
                    }),
                    search.createColumn({
                        name: "formulacurrency",
                        formula: "CASE WHEN {type} = 'Deposit' THEN {total} ELSE NULL END",
                        label: "PENGEMBALIAN"
                    }),
                    search.createColumn({
                        name: "formulacurrency",
                        formula: "CASE WHEN {type} IN ('Bank Purchases', 'Check') AND {custbody_me_tipe_pum} = 'Penyelesaian' THEN ABS({total}) ELSE NULL  END",
                        label: "PENYELESAIAN"
                    }),
                    search.createColumn({
                        name: "formulacurrency",
                        formula: "CASE WHEN TO_NUMBER(NVL((CASE WHEN {type} = 'Check' AND {custbody_me_tipe_pum} = 'Pengajuan'THEN {custbody_asl_outstandingadv} WHEN {type} = 'Deposit' THEN {custbody_asl_outstandingadv} ELSE NULL END), 0)) - (  TO_NUMBER( NVL( (CASE   WHEN {type} = 'Purchase Order' AND {custbody_me_jba_sub_category_po} = 'Realisasi PUM'   THEN {amount}   ELSE NULL END), 0)  ) + TO_NUMBER( NVL( (CASE   WHEN {type} = 'Deposit'   THEN {total}   ELSE NULL END), 0)  ) + TO_NUMBER( NVL( (CASE   WHEN {type} IN ('Bank Purchases', 'Check') AND {custbody_me_tipe_pum} = 'Penyelesaian'   THEN ABS({total})   ELSE NULL END), 0)  )) < 0    THEN 0    ELSE TO_NUMBER(  NVL( (CASE WHEN {type} = 'Check' AND {custbody_me_tipe_pum} = 'Pengajuan' THEN {custbody_asl_outstandingadv} WHEN {type} = 'Deposit' THEN {custbody_asl_outstandingadv} ELSE NULL END), 0)) - (  TO_NUMBER( NVL( (CASE   WHEN {type} = 'Purchase Order' AND {custbody_me_jba_sub_category_po} = 'Realisasi PUM'   THEN {amount}   ELSE NULL END), 0)  ) + TO_NUMBER( NVL( (CASE   WHEN {type} = 'Deposit'   THEN {total}   ELSE NULL END), 0)  ) + TO_NUMBER( NVL( (CASE   WHEN {type} IN ('Bank Purchases', 'Check') AND {custbody_me_tipe_pum} = 'Penyelesaian'   THEN ABS({total})   ELSE NULL END), 0)  )) END",
                        label: "OUTSTANDING "
                    }),
                    search.createColumn({
                        name: "memomain",
                        label: "MEMO"
                    })
                ]
        });

        var pagedData = search_monitoring_uang_muka.runPaged({
            pageSize: 1000
        });

        pagedData.pageRanges.forEach(function (pageRange) {
            var page = pagedData.fetch({ index: pageRange.index });
            page.data.forEach(function (resultRow) {
                let columns = resultRow.columns;
                let nomor_um = resultRow.getValue(columns[0]);
                let tanggal_um = resultRow.getValue(columns[1]);
                let nama = resultRow.getText(columns[2]);
                let nomor_realisasi = resultRow.getValue(columns[3]);
                let nomor_penyelesaian = resultRow.getValue(columns[4]);
                let amount_um = resultRow.getValue(columns[5]);
                let realisasi = resultRow.getValue(columns[6]);
                let pengmbalian = resultRow.getValue(columns[7]);
                let penyelesaian = resultRow.getValue(columns[8]);
                let outstanding = resultRow.getValue(columns[9]);;
                let memo = resultRow.getValue(columns[10]);

                result.push({
                    nomor_um: nomor_um,
                    tanggal_um: tanggal_um,
                    nama: nama,
                    nomor_realisasi: nomor_realisasi,
                    nomor_penyelesaian: nomor_penyelesaian,
                    amount_um: amount_um,
                    realisasi: realisasi,
                    pengmbalian: pengmbalian,
                    penyelesaian: penyelesaian,
                    outstanding: outstanding,
                    memo: memo,
                });
            });
        });

        log.debug("resut", result)

        return result
    }

    function printHtmlMonitoring(form, final, context) {

        log.debug("ini CLOSING", final)

        let reportGroup = form.addFieldGroup({
            id: 'report_group',
            label: 'Table'
        });
        let salesReport = form.addField({
            id: 'custpage_sls_report',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Reprt Pnl',
            container: 'report_group'
        });

        let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Report Monitoring Uang Muka</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"/>
            <link rel="stylesheet" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css"/>
            <style>
              /* Dynamic modal width to follow the content */
              .modal-dialog.dynamic-modal {
                  width: auto;
                  max-width: 100%;
                  margin: 0 auto;
              }
              .modal-content {
                  overflow-x: auto;
              }
            </style>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
            <script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js"></script>
            <script src="https://cdn.datatables.net/buttons/1.6.1/js/dataTables.buttons.min.js"></script>
            <script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.flash.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>
            <script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.html5.min.js"></script>
            <script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.print.min.js"></script>
            <script>
            // Client-side function to format numbers
            function addComaJS(number) {
                if (isNaN(number)) return "0.00";
                let parts = Number(number).toFixed(2).split(".");
                parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
                return (parts[0] === "0" && parts[1].includes("00")) ? "0.00" : parts.join(".");
            }
            // Function to generate a details table based on an array of objects
            function generateDetailsTable(data) {
                let html = '<table class="table table-bordered table-striped">';
                html += '<thead><tr>' +
                            '<th>Nomor UM</th>' +
                            '<th>Tanggal UM</th>' +
                            '<th>Nama</th>' +
                            '<th>Nomor Realisasi</th>' +
                            '<th>Nomor Penyelesaian</th>' +
                            '<th>Amount UM</th>' +
                            '<th>Realisasi</th>' +
                            '<th>Pengembalian</th>' +
                            '<th>Penyelesaian</th>' +
                            '<th>Outstanding</th>' +
                            '<th>Memo</th>' +
                        '</tr></thead>';
                html += '<tbody>';
                data.forEach(function(row) {
                    html += '<tr>' +
                                '<td>' + row.nomor_um + '</td>' +
                                '<td>' + row.tanggal_um + '</td>' +
                                '<td>' + row.nama + '</td>' +
                                '<td>' + (row.nomor_realisasi || "") + '</td>' +
                                '<td>' + (row.nomor_penyelesaian || "") + '</td>' +
                                '<td>' + addComaJS(Number(row.amount_um)) + '</td>' +
                                '<td>' + addComaJS(Number(row.realisasi)) + '</td>' +
                                '<td>' + addComaJS(Number(row.pengmbalian)) + '</td>' +
                                '<td>' + addComaJS(Number(row.penyelesaian)) + '</td>' +
                                '<td>' + addComaJS(Number(row.outstanding)) + '</td>' +
                                '<td>' + (row.memo || "") + '</td>' +
                            '</tr>';
                });
                html += '</tbody></table>';
                return html;
            }
            // When document is ready, initialize DataTable and bind click event for details
            $(document).ready(function () {
                var table = $("#daTable").DataTable({
                    pageLength: 2000,
                    dom: "Bfrtip",
                    buttons: ["excel", "pdfHtml5"]
                });
                $(".viewDetailsBtn").click(function () {
                    var index = $(this).data("index");
                    index = parseInt(index.toString().trim(), 10);
                    var details = detailsData[index].details;
                    var htmlTable = "";
                    if (details.length === 0) {
                        htmlTable = "No details available.";
                    } else {
                        htmlTable = generateDetailsTable(details);
                    }
                    $("#modalBody").html(htmlTable);
                    $("#detailsModal").modal("show");
                });
            });
            // Pass the full dataset from the server to the client-side
            var detailsData = ${JSON.stringify(final)};
            </script>
        </head>
        <body>
            <div class="container-fluid mt-3">
                <h2>Report Monitoring Uang Muka</h2>
                <div class="table-responsive" style="border:1px solid #ccc; padding:10px;">
                    <table id="daTable" class="table table-striped table-bordered dt-responsive" style="min-width:600px; white-space:nowrap;">
                        <thead class="thead-dark">
                            <tr>
                                <th>Nomor UM</th>
                                <th>Tanggal UM</th>
                                <th>Nama</th>
                                <th>Nomor Realisasi</th>
                                <th>Nomor Penyelesaian</th>
                                <th>Amount UM</th>
                                <th>Realisasi</th>
                                <th>Pengembalian</th>
                                <th>Penyelesaian</th>
                                <th>Outstanding</th>
                                <th>Memo</th>
                                <th>Detail</th>
                            </tr>
                        </thead>
                        <tbody>`;
        // Build main table rows using template literals:
        for (let p = 0; p < final.length; p++) {
            html += `<tr>
                        <td>${final[p].nomor_um}</td>
                        <td>${final[p].tanggal_um}</td>
                        <td>${final[p].nama}</td>
                        <td>${final[p].nomor_realisasi || ''}</td>
                        <td>${final[p].nomor_penyelesaian || ''}</td>
                        <td>${addComa(Number(final[p].amount_um))}</td>
                        <td>${addComa(Number(final[p].realisasi))}</td>
                        <td>${addComa(Number(final[p].pengmbalian))}</td>
                        <td>${addComa(Number(final[p].penyelesaian))}</td>
                        <td>${addComa(Number(final[p].outstanding))}</td>
                        <td>${final[p].memo || ''}</td>
                        <td><button type="button" class="btn btn-info viewDetailsBtn" data-index="${p}">View Details</button></td>
                        </tr>`;
        }
        html += `   </tbody>
                    </table>
                </div>
            </div>
            <!-- Modal for details -->
            <div class="modal fade" id="detailsModal" tabindex="-1" role="dialog" aria-labelledby="detailsModalLabel" aria-hidden="true">
                <div class="modal-dialog dynamic-modal" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="detailsModalLabel">Detail Information</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body" id="modalBody">Loading details...</div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>`;

        salesReport.defaultValue = html;
        context.response.writePage(form);
    }

    function insertChildToParent(parent, child) {


        for (let i = 0; i < child.length; i++) {
            let get_parent_index = parent.findIndex((user) => user.nomor_um === child[i].nomor_um)

            parent[get_parent_index].details.push(child[i])

        }

        return parent;
    }

    function parameters() {
        var form = serverWidget.createForm({ title: 'Report Monitoring Uang Muka' });

        let reportGroup = form.addFieldGroup({
            id: 'filter_group',
            label: 'Filter'
        });
        let salesReport = form.addField({
            id: 'custpage_date_after',
            type: serverWidget.FieldType.DATE,
            label: 'Date After',
            container: 'filter_group'
        });
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
            let date_after = req_param["custpage_date_after"]
            let param = {
                date_after: date_after
            }

            let get_data = getMonitoringUangMuka(param);
            let get_data_child = getMonitoringUangMukaChild(param)
            let insert_child_to_parent = insertChildToParent(get_data, get_data_child)
            let printout = printHtmlMonitoring(form, insert_child_to_parent, context)
        }
        form.addSubmitButton('PRINT')
    }


    return {
        onRequest: onRequest
    }
});

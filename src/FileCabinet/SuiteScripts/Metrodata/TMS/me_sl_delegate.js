/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/redirect", "N/ui/serverWidget", "N/task", "N/search", './config/me_config_yudi.js', 'N/file', 'N/url', './lib/moment.min.js', 'N/encode', 'N/format', 'N/record'],
    function (redirect, serverWidget, task, search, config, file, url, moment, encode, format, record) {

        function printHtml(form, params, context) {
            var reportGroup = form.addFieldGroup({
                id: 'report_group',
                label: 'Report'
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
                '<h2 style= "text-align">Report</h2>' +
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
                '<script src="https://cdn.datatables.net/1.10.21/js/dataTables.bootstrap4.min.js">' +
                // '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
                '</script>' +

                '<script>' +
                '$(document).ready(function () {' +
                '$("#daTable").DataTable();});' +
                '</script>' +
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
                '<th scope="col">Customer Name</th>' +
                '<th scope="col">Customer PO</th>' +
                '<th scope="col">Customer PO Date</th>' +
                '<th scope="col">QP</th>' +
                '<th scope="col">SO No.</th>' +
                '<th scope="col">SO Date</th>' +
                '<th scope="col">Product Name</th>' +
                '<th scope="col">LME</th>' +
                '<th scope="col">Premium</th>' +
                '<th scope="col">Mjp</th>' +
                '<th scope="col">Others</th>' +
                '<th scope="col">Unit Price</th>' +
                '<th scope="col">Currency</th>' +
                '<th scope="col">DO No.</th>' +
                '<th scope="col">DO Date</th>' + //
                '<th scope="col">Batch No.</th>' +
                '<th scope="col">Invoice Id</th>' +
                '<th scope="col">Invoice Date</th>' +
                '<th scope="col">Delivered.</th>' +
                '<th scope="col">Net Amount</th>' +
                '<th scope="col">VAT</th>' +
                '<th scope="col">Invoice Amount</th>' +
                '<th scope="col">Net Amount(USD)</th>' +
                '<th scope="col">VAT(USD)</th>' +
                '<th scope="col">Invoice Amount(USD)</th>' +
                '<th scope="col">VAT No.</th>' +
                '<th scope="col">Customer NPWP No.</th>' +
                '<th scope="col">Due Date</th>' +
                '<th scope="col">Business Unit</th>';

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

            for (let a = 0; a < params.length; a++) {
                for (let i = 0; i < params[a].do.length; i++) {

                    var netAmount = Number(Number(!params[a].do[i].inventory_detail_qty ? '0.00' : params[a].do[i].inventory_detail_qty) * Number(params[a].unit_price)).toFixed(2);
                    var vatAmount = ((params[a].currency).includes('US') ? '0.00' : Number((parseFloat(params[a].tax_rate) / 100) * Number(params[a].unit_price)).toFixed(2) * Number(params[a].do[i].inventory_detail_qty).toFixed(2));

                    var invoiceAmount = Number(Number(netAmount) + Number(vatAmount)).toFixed(2)

                    var netAmountUsd = 0;
                    var vatAmountUsd = 0;

                    if ((params[a].currency).includes('IDR')) {
                        netAmountUsd = netAmount * params[a].exchange_rate;
                        vatAmountUsd = vatAmount * params[a].exchange_rate;

                    } else if ((params[a].currency).includes('US')) {
                        netAmountUsd = netAmount;
                        vatAmountUsd = vatAmount;

                    }


                    var invoiceAmountUsd = Number((Number(netAmountUsd) + Number(vatAmountUsd))).toFixed(2)

                    salesReport.defaultValue +=
                        '<tr >' +
                        '<td >' + params[a].cust_name + '</td>' +
                        '<td >' + params[a].cust_po + '</td>' +
                        '<td >' + params[a].cust_po_date + '</td>' +
                        '<td >' + params[a].qp + '</td>' +
                        '<td >' + params[a].so_number + '</td>' +
                        '<td >' + params[a].so_date + '</td>' +
                        '<td >' + params[a].product_name + '</td>' +
                        '<td >' + addComa(params[a].lme) + '</td>' +
                        '<td >' + addComa(params[a].premium) + '</td>' +
                        '<td >' + addComa(params[a].mjp) + '</td>' +
                        '<td >' + addComa(params[a].others) + '</td>' +
                        '<td >' + addComa(params[a].unit_price) + '</td>' +
                        '<td >' + params[a].currency + '</td>' +
                        '<td >' + params[a].do[i].do_number + '</td>' +
                        '<td >' + params[a].do[i].do_date + '</td>' +
                        '<td >' + params[a].do[i].inv_number + '</td>' +
                        '<td >' + params[a].invoice_id + '</td>' +
                        '<td >' + params[a].invoice_date + '</td>' +
                        '<td >' + (!params[a].do[i].inventory_detail_qty ? 0 : params[a].do[i].inventory_detail_qty) + '</td>' +
                        '<td >' + addComa(netAmount) + '</td>' +
                        '<td >' + addComa(vatAmount) + '</td>' +
                        '<td >' + addComa(invoiceAmount) + '</td>' +
                        '<td >' + addComa(netAmountUsd) + '</td>' +
                        '<td >' + addComa(vatAmountUsd) + '</td>' +
                        '<td >' + addComa(invoiceAmountUsd) + '</td>' +
                        '<td >' + ((params[a].currency).includes('US') ? '-' : params[a].vat_no) + '</td>' +
                        '<td >' + params[a].cust_npwp + '</td>' +
                        '<td >' + params[a].due_date + '</td>' +
                        '<td >' + params[a].business_unit + '</td>';
                    salesReport.defaultValue += '</tr>';

                    // pnlReport.defaultValue += '</div>';
                }
            }
            salesReport.defaultValue += '</tbody>';
            salesReport.defaultValue += '</table>';
            salesReport.defaultValue += '</body>' +
                '</html>';
            context.response.writePage(form);
        }

        function printExcel(form, params, context) {
            // log.debug('header', header)
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
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderLeft">' +
                '<Font ss:Size="7" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '<Borders><Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderRight">' +
                '<Font ss:Size="7" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
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
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
                '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderTopRight">' +
                '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
                '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderBottomRightHeader">' +
                '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
                '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderBottomLeftHeader">' +
                '<Font ss:Size="7" ss:Bold="1" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
                '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderBottomRightBase">' +
                '<Font ss:Size="7" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
                '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderBottomLeftBase">' +
                '<Font ss:Size="7" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" />' +
                '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="Header">' +
                '<Font ss:Size="9" ss:Bold="1" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderBottomHeader">' +
                '<Font ss:Bold="1" ss:Size="7" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderBottom">' +
                '<Font ss:Size="7" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderBottomCenter">' +
                '<Font ss:Size="7" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderBottomCenterARight">' +
                '<Font ss:Size="7" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Right"/>' +
                '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignBorderBottomCenterACenter">' +
                '<Font ss:Size="7" ss:FontName="Arial"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '<Borders><Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="3" /></Borders>' +
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

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';

            // xmlString += '<Row>' +
            //     '<Cell ss:StyleID="Header" ss:MergeAcross="5"><Data ss:Type="String">' + header.location + ', SLS Retur' + ", " + header.conditioned_filter + '</Data></Cell>' +
            //     '</Row>';
            xmlString += '<Row>' +
                '<Cell ss:StyleID="Header" ss:MergeAcross="5"><Data ss:Type="String">Print : ' + moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss') + '</Data></Cell>' +
                '</Row>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Customer Name</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Customer PO</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Customer PO Date</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">QP</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">SO No.</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">SO Date</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Product Name</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">LME</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Premium</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Mjp</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Others</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Unit Price</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Currency</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">DO No</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">DO Date</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Batch No.</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Invoice Id</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Invoice Date</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Delivered</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Net Amount</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">VAT</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Invoice Amount</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Net Amount(USD)</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">VAT(USD)</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Invoice Amount(USD)</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">VAT No.</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Customer NPWP No.</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Due Date</Data></Cell>' +
                '<Cell ss:StyleID="MyAlignBorderTop"><Data ss:Type="String">Business Unit</Data></Cell>' +
                '</Row>';

            if (params.length <= 0) {
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="MyAlignCenterHeader" ss:MergeAcross="11"><Data ss:Type="String">TIDAK ADA DATA</Data></Cell>' +
                    '</Row>';
            } else {
                for (let a = 0; a < params.length; a++) {
                    for (let i = 0; i < params[a].do.length; i++) {

                        var netAmount = Number(Number(!params[a].do[i].inventory_detail_qty ? '0.00' : params[a].do[i].inventory_detail_qty) * Number(params[a].unit_price)).toFixed(2);
                        var vatAmount = ((params[a].currency).includes('US') ? '0.00' : Number((parseFloat(params[a].tax_rate) / 100) * Number(params[a].unit_price)).toFixed(2) * Number(params[a].do[i].inventory_detail_qty).toFixed(2));

                        var invoiceAmount = Number(Number(netAmount) + Number(vatAmount)).toFixed(2)

                        var netAmountUsd = 0;
                        var vatAmountUsd = 0;

                        if ((params[a].currency).includes('IDR')) {
                            netAmountUsd = Number(netAmount * params[a].exchange_rate).toFixed(2);
                            vatAmountUsd = Number(vatAmount * params[a].exchange_rate).toFixed(2);

                        } else if ((params[a].currency).includes('US')) {
                            netAmountUsd = netAmount;
                            vatAmountUsd = vatAmount;

                        }

                        var invoiceAmountUsd = Number((Number(netAmountUsd) + Number(vatAmountUsd))).toFixed(2)

                        xmlString += '<Row>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].cust_name + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].cust_po + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].cust_po_date + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].qp + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].so_number + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].so_date + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].product_name + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].lme + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].premium + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].mjp + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].others + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + params[a].unit_price + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].currency + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].do[i].do_number + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].do[i].do_date + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].do[i].inv_number + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].invoice_id + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].invoice_date + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + (!params[a].do[i].inventory_detail_qty ? 0 : params[a].do[i].inventory_detail_qty) + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + netAmount + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + vatAmount + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + invoiceAmount + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + netAmountUsd + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + vatAmountUsd + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="Number">' + invoiceAmountUsd + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + ((params[a].currency).includes('US') ? '-' : params[a].vat_no) + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].cust_npwp + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].due_date + '</Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter"><Data ss:Type="String">' + params[a].business_unit + '</Data></Cell>' +
                            '</Row>';
                    }
                }
            }
            xmlString += '</Table></Worksheet></Workbook>';
            var strXmlEncoded = encode.convert({
                string: xmlString,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });

            var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

            var objXlsFile = file.create({
                name: 'Sales Report' + now + '.xls',
                fileType: file.Type.EXCEL,
                contents: strXmlEncoded

            });

            context.response.writeFile({
                file: objXlsFile
            });
        }

        function parameters(context) {
            // throw 'DATA: ' + context.request.parameters.custscript_me_param.delegator;

            var paramData = JSON.parse(context.request.parameters.custscript_me_param);


            var form = serverWidget.createForm({
                title: 'Delegate Real Time'
            })

            var delegation = form.addFieldGroup({
                id: 'delegation',
                label: 'Filter'
            });

            var trans_number = form.addField({
                id: 'custpage_trans_num',
                type: serverWidget.FieldType.SELECT,
                source: 'transaction',
                label: "Transaction Number",
                container: 'delegation'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });
            trans_number.defaultValue = paramData.record_id;

            var delegator = form.addField({
                id: 'custpage_delegator',
                type: serverWidget.FieldType.SELECT,
                source: 'employee',
                label: "Delegator",
                container: 'delegation'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.DISABLED
            });

            delegator.defaultValue = paramData.delegator;

            var delegate_to = form.addField({
                id: 'custpage_delegate_to',
                type: serverWidget.FieldType.SELECT,
                source: 'employee',
                label: "Delegator",
                container: 'delegation'
            });

            var remarks = form.addField({
                id: 'custpage_remarks',
                type: serverWidget.FieldType.TEXT,
                label: "Remarks",
                container: 'delegation'
            });
            var record_type = form.addField({
                id: 'custpage_type',
                type: serverWidget.FieldType.TEXT,
                label: "Remarks",
                container: 'delegation'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });
            record_type.defaultValue = paramData.record_type;

            return form;
        }

        function onRequest(context) {

            if (context.request.method == 'GET') {
                var form = parameters(context)
                form.addSubmitButton({
                    label: 'Delegate'
                });

                context.response.writePage(form);
            } else {
                var req_param = context.request.parameters;

                var trans_number = req_param['custpage_trans_num'];
                var delegator = req_param['custpage_delegator'];
                var delegate_to = req_param['custpage_delegate_to'];
                var remarks = req_param['custpage_remarks'];
                var record_type = req_param['custpage_type'];

                var date_time = new Date();

                var formattedCurrentDate = format.format({
                    value: date_time,
                    type: format.Type.DATETIME
                });

                var param = {
                    trans_number: trans_number,
                    delegator: delegator,
                    delegate_to: delegate_to,
                    remarks: remarks,
                    date_time: formattedCurrentDate,
                    record_type: record_type,
                }

                try {
                    var createDelegateRec = record.create({
                        type: 'customrecord_me_csrec_delegate_real_time',
                    });
                    createDelegateRec.setValue('custrecord_me_transaction_number', param.trans_number)
                    createDelegateRec.setText('custrecord_me_delegate_date', param.date_time)
                    createDelegateRec.setValue('custrecord_me_delegator_user', param.delegator)
                    createDelegateRec.setValue('custrecord_me_delegate_to', param.delegate_to)
                    createDelegateRec.setValue('custrecord_me_remarks_delegation', param.remarks)
                    var saveDelegate = createDelegateRec.save();

                    redirect.toRecord({
                        type: param.record_type,
                        id: trans_number,
                    });

                    var loadTransRec = record.load({
                        type: param.record_type,
                        id: trans_number,
                    });

                    loadTransRec.setValue('custbody_me_delegate_real_time_so', param.delegate_to);
                    loadTransRec.save();
                } catch (error) {
                    record.delete({
                        type: 'customrecord_me_csrec_delegate_real_time',
                        id: saveDelegate,
                    });
                    throw error
                }
            }

        }

        return {
            onRequest: onRequest
        }
    });

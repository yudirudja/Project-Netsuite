/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/redirect", "N/ui/serverWidget", "N/task", "N/search", './config/me_config_yudi.js', 'N/file', 'N/url', './lib/moment.min.js', 'N/encode', './lib/jszip.min.js'],
   function (redirect, serverWidget, task, search, config, file, url, moment, encode, jszip) {

      const FILTER = {
         print_type : 'custpage_print_type',
         employee : 'custpage_employee',
         startdate : 'custpage_startdate',
         enddate : 'custpage_enddate'
      }

      const HEADER_COLUMN = {
         vendor_coa : 'Vendor Account',
         employee : 'Name',
         opening_balance : 'Opening Balance',
         debit : 'Debit',
         credit : 'Credit',
         total : 'Total',
         closing_balance : 'Closing Balance',
         opening_balance_idr : 'Opening Balance IDR',
         debit_idr : 'Debit IDR',
         credit_idr : 'Credit IDR',
         total_idr : 'Total IDR',
         closing_balance_idr : 'Closing Balance IDR'
      }

      var final_result = {}

      
      function addComa(number) {
         // Ensure the input is a number
         if (isNaN(number)) {
            return '0.00';
         }

         // Convert the number to a string with exactly two decimal places
         var parts = Number(number).toFixed(2).split('.');

         // Format the integer part with commas
         parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

         // Rejoin the integer and decimal parts
         return parts.join('.');
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

      function searchOpbalJE(params) {

         log.debug("param searchOpbalJE", params);
         var startdate = params.startdate
         var enddate = params.enddate
         var employee_arr = params.employee
      
         
         var filters = [
            ["type","anyof","Journal"], 
            "AND", 
            ["formulatext: {name}","isnotempty",""], 
            "AND", 
            ["account.number","is","133210"]
         ]

         if (startdate) {
            filters.push(
               "AND",
               ["trandate", "before", startdate]
            )
         }
         if(employee_arr.length > 0) {
            filters.push(
               "AND",
               ["name", "anyof", employee_arr]
            )
         }

         
         log.debug('searchPO filters', filters)

         var journalentrySearchObj = search.create({
            type: "journalentry",
            filters: filters,
            columns:
            [
               search.createColumn({
                  name: "internalid",
                  join: "vendorLine",
                  summary: "GROUP",
                  label: "Employee ID"
               }),
               search.createColumn({
                  name: "entityid",
                  join: "vendorLine",
                  summary: "GROUP",
                  label: "ID"
               }),
               search.createColumn({
                  name: "altname",
                  join: "vendorLine",
                  summary: "GROUP",
                  label: "Name"
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

               //5
               search.createColumn({
                  name: "creditamount",
                  summary: "SUM",
                  label: "Amount (Credit)"
               }),
               search.createColumn({
                  name: "debitamount",
                  summary: "SUM",
                  label: "Amount (Debit)"
               }),
               search.createColumn({
                  name: "fxamount",
                  summary: "SUM",
                  label: "Amount (Foreign Currency)"
               }),
               search.createColumn({
                  name: "creditfxamount",
                  summary: "SUM",
                  label: "Amount (Credit) (Foreign Currency)"
               }),
               search.createColumn({
                  name: "debitfxamount",
                  summary: "SUM",
                  label: "Amount (Debit) (Foreign Currency)"
               }),

               //10
               search.createColumn({
                  name: "currency",
                  summary: "GROUP",
                  label: "Currency"
               })
            ]
         });

         var startrow = 0;
         var data_opbal = {}
         do {

            var result = journalentrySearchObj.run().getRange({
               start: startrow,
               end: startrow + 1000
            });
            // log.debug('result searchPOBill', result)

            for (let i = 0; i < result.length; i++) {
               var vendor_account = result[i].getValue(result[i].columns[1])
               var employee = result[i].getValue(result[i].columns[0])
               var employee_name = result[i].getValue(result[i].columns[2])
               var amount = Number(result[i].getValue(result[i].columns[4]))
               var credit = Number(result[i].getValue(result[i].columns[5]))
               var debit = Number(result[i].getValue(result[i].columns[6]))
               var amount_fx = Number(result[i].getValue(result[i].columns[7]))
               var credit_fx = Number(result[i].getValue(result[i].columns[8]))
               var debit_fx = Number(result[i].getValue(result[i].columns[9]))

               // if(!data_opbal[employee]){
               //    data_opbal[employee] = {
               //       vendor_account: vendor_account,
               //       employee: employee,
               //       employee_name: employee_name,
               //       opbal_amount: amount,
               //       opbal_amount_fx: amount_fx
               //    }
               // }
               if(!final_result[employee]){
                  final_result[employee] = {
                     vendor_account: vendor_account,
                     employee: employee,
                     employee_name: employee_name,

                     opbal_amount: amount,
                     debit: 0, 
                     credit: 0,
                     total: 0,
                     closing_balance: amount,

                     opbal_amount_fx: amount_fx,
                     debit_fx: 0,
                     credit_fx: 0,
                     total_fx: 0,
                     closing_balance_fx: amount_fx,

                  }
               }
            }

            startrow += 1000;

         } while (result.length === 1000);

         log.debug('data_opbal', data_opbal)
         return data_opbal;

      }

      function searchJE(params) {

         log.debug("param searchJE", params);
         var startdate = params.startdate
         var enddate = params.enddate
         var employee_arr = params.employee
      
         
         var filters = [
            ["type","anyof","Journal"], 
            "AND", 
            ["formulatext: {name}","isnotempty",""], 
            "AND", 
            ["account.number","is","133210"]
         ]

         if (startdate && enddate) {
            filters.push(
               "AND",
               ["trandate", "within", startdate, enddate]
            )
         }
         if(employee_arr.length > 0) {
            filters.push(
               "AND",
               ["name", "anyof", employee_arr]
            )
         }

         
         log.debug('searchPO filters', filters)

         var journalentrySearchObj = search.create({
            type: "journalentry",
            filters: filters,
            columns:
            [
               search.createColumn({
                  name: "internalid",
                  join: "vendorLine",
                  summary: "GROUP",
                  label: "Employee ID"
               }),
               search.createColumn({
                  name: "entityid",
                  join: "vendorLine",
                  summary: "GROUP",
                  label: "ID"
               }),
               search.createColumn({
                  name: "altname",
                  join: "vendorLine",
                  summary: "GROUP",
                  label: "Name"
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

               //5
               search.createColumn({
                  name: "creditamount",
                  summary: "SUM",
                  label: "Amount (Credit)"
               }),
               search.createColumn({
                  name: "debitamount",
                  summary: "SUM",
                  label: "Amount (Debit)"
               }),
               search.createColumn({
                  name: "fxamount",
                  summary: "SUM",
                  label: "Amount (Foreign Currency)"
               }),
               search.createColumn({
                  name: "creditfxamount",
                  summary: "SUM",
                  label: "Amount (Credit) (Foreign Currency)"
               }),
               search.createColumn({
                  name: "debitfxamount",
                  summary: "SUM",
                  label: "Amount (Debit) (Foreign Currency)"
               }),

               //10
               search.createColumn({
                  name: "currency",
                  summary: "GROUP",
                  label: "Currency"
               })
            ]
         });

         var startrow = 0;
         var data_opbal = searchOpbalJE(params)
         do {

            var result = journalentrySearchObj.run().getRange({
               start: startrow,
               end: startrow + 1000
            });
            // log.debug('result searchPOBill', result)

            for (let i = 0; i < result.length; i++) {
               var vendor_account = result[i].getValue(result[i].columns[1])
               var employee = result[i].getValue(result[i].columns[0])
               var employee_name = result[i].getValue(result[i].columns[2])
               var amount = Number(result[i].getValue(result[i].columns[4])) || 0
               var credit = Number(result[i].getValue(result[i].columns[5])) || 0
               var debit = Number(result[i].getValue(result[i].columns[6])) || 0
               var amount_fx = Number(result[i].getValue(result[i].columns[7])) || 0
               var credit_fx = Number(result[i].getValue(result[i].columns[8])) || 0
               var debit_fx = Number(result[i].getValue(result[i].columns[9])) || 0
               var total = parseFloat(debit - credit)
               var total_fx = parseFloat(debit_fx - credit_fx)
               var opbal_amount = 0
               var opbal_amount_fx = 0
               // if(employee in data_opbal){
               //    opbal_amount = Number(data_opbal[employee].opbal_amount)
               //    opbal_amount_fx = Number(data_opbal[employee].opbal_amount_fx)
               // }

               // var closing_balance = Number(opbal_amount + total)
               // var closing_balance_fx = Number(opbal_amount_fx + total_fx)
               if(!final_result[employee]){
                  final_result[employee] = {
                     vendor_account: vendor_account,
                     employee: employee,
                     employee_name: employee_name,

                     opbal_amount: 0,
                     debit: debit, 
                     credit: credit,
                     total: total,
                     closing_balance: total,

                     opbal_amount_fx: 0,
                     debit_fx: debit_fx,
                     credit_fx: credit_fx,
                     total_fx: total_fx,
                     closing_balance_fx: total_fx,

                  }
               } else {
                  final_result[employee].debit += debit
                  final_result[employee].credit += credit
                  final_result[employee].total += amount
                  final_result[employee].closing_balance += amount
                  
                  final_result[employee].debit_fx += debit_fx
                  final_result[employee].credit_fx += credit_fx
                  final_result[employee].total_fx += amount_fx
                  final_result[employee].closing_balance_fx += amount_fx
               }
            }

            startrow += 1000;

         } while (result.length === 1000);
         log.debug('final_result', final_result)
         return final_result

      }

      function printHtml(final_data, param, context, form) {
         var reportGroup = form.addFieldGroup({
            id: 'report_group',
            label: 'Report'
         });
         var data_final = final_data
         var emplData = form.addField({
            id: 'custpage_po_report',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Report Employee Loan',
            container: 'report_group'
         });

         emplData.defaultValue = '<!DOCTYPE html> ' +
            '<html lang="en">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<h2 style= "text-align">Report Employee Loan ' + (param.startdate?param.startdate:"") + " to " + (param.enddate?param.enddate:"") + '</h2>' +
            '<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"/>' +
            '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js">' +
            '</script>' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
            '</script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js">' +
            '</script>' +
            '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css"/>' +
            '<script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js">' +
            '</script>' +
            '<script src="https://code.jquery.com/jquery-3.3.1.js"></script>' +
            '<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/dataTables.buttons.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.flash.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.html5.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.print.min.js"></script>' +
            '</script>' +

            '<script>$(document).ready(function () { $("#daTable").DataTable({ "pageLength": 50, dom: "Bfrtip","buttons": ["excel"]})})</script>' +
            '</head>';
         emplData.defaultValue += '<body>';

         emplData.defaultValue += '<style>' +
            '.table{border:1px solid black; margin-top: 5%}' +
            '.table-head-column{border:1px solid black; border-collapse: collapse; font-weight: bold;}' +
            '.table-row{border:1px solid black; border-collapse: collapse;}' +
            '.table-column{border:1px solid black; border-collapse: collapse;}' +
            '</style>' +
            '<table style="width:200%; border:10px" id="daTable" class="table table-striped table-bordered table-hover dt-responsive" style="width:100%">' +
            '<thead class="thead-dark" style="font-weight: bold">' +
            '<tr >'
            for(var bodyname in HEADER_COLUMN){
               emplData.defaultValue += '<th scope="col">' + HEADER_COLUMN[bodyname] + '</th>'
            }
            

         emplData.defaultValue += '</tr>';
         emplData.defaultValue += '</thead>';
         emplData.defaultValue += '<tbody>';

         for(var data in data_final){
            
            emplData.defaultValue += '<tr>' +
                     '<td>' + data_final[data].vendor_account + '</td>' +
                     '<td>' + data_final[data].employee_name + '</td>' +
                     '<td>' + addComa(data_final[data].opbal_amount) + '</td>' +
                     '<td>' + addComa(data_final[data].debit) + '</td>' +
                     '<td>' + addComa(data_final[data].credit) + '</td>' +
                     //5
                     '<td>' + addComa(data_final[data].total) + '</td>' +
                     '<td>' + addComa(data_final[data].closing_balance) + '</td>' +
                     '<td>' + addComa(data_final[data].opbal_amount_fx) + '</td>' +
                     '<td>' + addComa(data_final[data].debit_fx) + '</td>' +
                     '<td>' + addComa(data_final[data].credit_fx) + '</td>' +
                     //5
                     '<td>' + addComa(data_final[data].total_fx) + '</td>' +
                     '<td>' + addComa(data_final[data].closing_balance_fx) + '</td>' +
               '</tr>';
         }
               

         emplData.defaultValue += '</tbody>';
         emplData.defaultValue += '</table>';
         emplData.defaultValue += '</body>' +
            '</html>';
         context.response.writePage(form);
      }

      function parameters() {
         var form = serverWidget.createForm({
            title: 'Report Employee Loan'
         })

         var reportFilter = form.addFieldGroup({
            id: 'report_filter',
            label: 'Filter'
         });

         var printType = form.addField({
            id: FILTER.print_type,
            type: serverWidget.FieldType.SELECT,
            label: "Generate As",
            container: 'report_filter'
         })
         printType.isMandatory = true;
         printType.addSelectOption({
            value: '1',
            text: 'Page'
         });
         printType.defaultValue = 1

         var employee = form.addField({
            id: FILTER.employee,
            type: serverWidget.FieldType.MULTISELECT,
            source: 'vendor',
            label: "Employee",
            container: 'report_filter'
         });

         var startDate = form.addField({
            id: FILTER.startdate,
            type: serverWidget.FieldType.DATE,
            label: "Start Date",
            container: 'report_filter'
         })
         startDate.isMandatory = true;
         startDate.defaultValue = new Date();

         var endDate = form.addField({
            id: FILTER.enddate,
            type: serverWidget.FieldType.DATE,
            label: "End Date",
            container: 'report_filter'
         });

         endDate.isMandatory = true;
         endDate.defaultValue = new Date();
         
         

         return form;
      }

      function onRequest(context) {
         var form = parameters()

         if (context.request.method == 'GET') {
            
            context.response.writePage(form);
         } else {
            var param = context.request.parameters;
            
            
            var print_type = param[FILTER.print_type]
            var employee = param[FILTER.employee] || []
            var startdate = param[FILTER.startdate]
            var enddate = param[FILTER.enddate]

            var body_employee = form.getField(FILTER.employee)
            var body_startdate = form.getField(FILTER.startdate)
            var body_enddate = form.getField(FILTER.enddate)

            body_employee.defaultValue = employee
            body_startdate.defaultValue = startdate
            body_enddate.defaultValue = enddate

            var params = {
               print_type : print_type,
               employee : employee.length > 0 ? employee.split('\u0005') : [],
               startdate : startdate,
               enddate : enddate,
            }
            log.debug('params', params)

            var final_data = searchJE(params);
            var printHtmls = printHtml(final_data, params, context, form);

         }
         form.addSubmitButton({
            label: 'Generate'
         });
      }

      return {
         onRequest: onRequest
      }
   });

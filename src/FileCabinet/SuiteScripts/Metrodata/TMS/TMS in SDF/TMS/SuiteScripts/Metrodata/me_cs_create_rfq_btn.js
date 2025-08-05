/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define(['N/url', 'N/currentRecord', 'N/record','N/search'],
    function(url, currentRecord, record) {
   
   
       function onButtonClick(param){
           console.log('Printout CS kepanggils',JSON.stringify(param))
           try {
               var paramJson = JSON.stringify(param)
               console.log('Client script is running')
               var urlPrintout = url.resolveRecord({
                recordType: 'customrecord_me_csrec_rfq', 
                isEditMode: true,
                   params: {
                       'custrecord_me_pr_number': param.tran_id,
                       'custrecord_me_pr_date': param.tran_date,
                       'custrecord_me_rfq_business_unit': param.business_unit,
                       'custrecord_me_rfq_department': param.department,
                       'cost_center': param.department,
                       'custrecord_me_rfq_location': param.location,
                       'custrecord_me_ex_rates_rfq': param.rate,
                       'custrecord_me_rfq_validator': param.purchasing_app,
                       'custrecord_me_delivery_date': param.delivery_date,
                       'custrecord_me_rfq_memo': param.memo,
                   }
               })
               console.log(urlPrintout)
               window.open(urlPrintout)
           } catch (error) {
               console.log('Failed to running clientscript ' + error)
           }
       }
       function pageInit() {
           console.log('Printout CS kepanggil')
       }
   
       return {
           pageInit: pageInit,
           onButtonClick: onButtonClick
       }
   });
   
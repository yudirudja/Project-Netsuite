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
               var urlPrintout = url.resolveScript({
                   scriptId: 'customscript_me_sl_print_to',//Please make sure to replace this with the script ID of your Suitelet
                   deploymentId: 'customdeploy_me_sl_print_to',//Please make sure to replace this with the deployment ID of your Suitelet
                   params: {
                    custscript_me_param_do_in_so: paramJson,
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
   
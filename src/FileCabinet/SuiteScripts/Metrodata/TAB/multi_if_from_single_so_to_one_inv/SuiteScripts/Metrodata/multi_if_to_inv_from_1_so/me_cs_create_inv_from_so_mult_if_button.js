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
               console.log('Client script is running' + paramJson)
               var urlPrintout = url.resolveScript({
                   scriptId: 'customscript_me_sl_crt_inv_fr_so_mulif',//Please make sure to replace this with the script ID of your Suitelet
                   deploymentId: 'customdeploy_me_sl_crt_inv_fr_so_mulif',//Please make sure to replace this with the deployment ID of your Suitelet
                   params: {
                    custscript_me_param_crt_inv: paramJson,
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
   
//@ts-check
/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
// @ts-ignore
define(["N/record", "N/runtime", 'N/log'], function (record, runtime, log) {

    function getInputData() {
        var arrData = [];

        //Start : Get the parameters
        var scriptObj = runtime.getCurrentScript();
        var paramData = scriptObj.getParameter({ name: 'custscript_me_mr_sl_efaktur_page_params' });
        var parseData = JSON.parse(paramData); log.debug('parseData', parseData);
        return parseData;
    }

    function map(context) {
        try {
            var data = JSON.parse(context.value); log.debug('data', data);
            record.submitFields({ type: 'invoice', id: data.internalId, values: {"custbody_me_upload_xml": true} });
            return;
        } catch (error) {
            log.error('error', error);
        }
    }

    // function reduce(context) {

    // }

    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map,
        // reduce: reduce,
        summarize: summarize
    }
});

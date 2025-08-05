/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(['N/record', 'N/search', 'N/query', 'N/render', '../lib/moment.min.js', 'N/file', '../config/me_config.js', 'N/query', 'N/runtime'], function (record, search, query, render, moment, file, config, query, runtime) {

    function onRequest(context) {
        try {

        let is_show_logo = true;

        let jsonData = JSON.parse(context.request.parameters.custscript_me_param_transform_so_if);

        let load_so = record.transform({
            fromType: record.Type.SALES_ORDER,
            fromId: jsonData.record_id,
            toType: record.Type.ITEM_FULFILLMENT,
            isDynamic: true,
        });

        load_so.save()

    } catch (error) {
        throw error
            // if (error.includes("RCRD_HAS_BEEN_CHANGED")) {
            //      throw "Mohon untuk menunggu proses printout yang sebelumnya selesai sebelum mencetak printout selanjutnya."
            // }else{
            //     throw "Mohon untuk menunggu proses printout yang sebelumnya selesai sebelum mencetak printout selanjutnya."
            // }
    }
    }

    return {
        onRequest: onRequest
    }
});

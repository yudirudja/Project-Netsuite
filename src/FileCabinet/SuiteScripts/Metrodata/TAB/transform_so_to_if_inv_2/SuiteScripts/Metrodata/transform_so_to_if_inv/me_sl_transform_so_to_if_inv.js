/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(['N/record', 'N/search', 'N/query', 'N/render', '../lib/moment.min.js', 'N/file', '../config/me_config.js', 'N/query', 'N/runtime', "N/redirect"], function (record, search, query, render, moment, file, config, query, runtime, redirect) {

    function onRequest(context) {
        try {

        let is_show_logo = true;

        let jsonData = JSON.parse(context.request.parameters.custscript_me_param_transform_so_if);

        let load_so_if = record.transform({
            fromType: record.Type.SALES_ORDER,
            fromId: jsonData.record_id,
            toType: record.Type.ITEM_FULFILLMENT,
            isDynamic: true,
        });

        let save_if = load_so_if.save()
        let load_so_inv = record.transform({
            fromType: record.Type.SALES_ORDER,
            fromId: jsonData.record_id,
            toType: record.Type.INVOICE,
            isDynamic: true,
        });

        let save_inv = load_so_inv.save()

        redirect.toRecord({
            type: record.Type.ITEM_FULFILLMENT, 
            id: save_if,
        });

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

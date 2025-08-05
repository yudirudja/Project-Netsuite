/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/search", "N/record", "N/render", "N/runtime", 'N/'], function (search, record, render, runtime) {

    function onRequest(context) {
        var paramData = JSON.parse(context.request.parameters.custscript_me_param);
        log.debug("so id suitelet", inv_id)
        // var so_rec = record.load({
        //     type: 'salesorder',
        //     id: so_id
        // })
        // log.debug("so_rec", so_rec)

        var loadInvoice = record.load({
            type: record.Type.SALES_ORDER,
            id: 157,
            isDynamic: true,
        });

        log.debug('header', header)

        var templateFile = file.load({ id: config.pdf_id.export_inv });

        var renderer = render.create();

        renderer.templateContent = templateFile.getContents();

        // ==================== Start Olah Data ===================== //
        // Yang dibutuhkan untuk Printout

        renderer.addCustomDataSource({
            alias: "Record",
            format: render.DataSource.JSON,
            data: JSON.stringify({
                // header: param,
                data: paramData,
                // length: "finalData.length",
            }),
        });


        // ==================== Akhir Olah Data ===================== //

        //================ Start PrintOut ======================//


        var xml = renderer.renderAsString().replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1");;

        log.debug("xml", xml)
        log.debug("renderer exist", renderer);

        var pdf = render.xmlToPdf({
            xmlString: xml
        });

        var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

        // let current = new Date();
        // let cDate = current.getDate() + '-' + (current.getMonth() + 1) + '-' + current.getFullYear();
        // let cTime = (current.getHours() - 24) + ":" + current.getMinutes() + ":" + current.getSeconds();
        // let dateTime = cDate + ' ' + cTime;

        pdf.name = "Export Invoice" + now + ".pdf";

        context.response.writeFile(pdf, false);


        // renderer.setTemplateByScriptId("CUSTTMPL_TEST_BUTTON_PRINTOUT_SO");
        // var templatePdf = renderer.renderAsString();
        // context.response.renderPdf(templatePdf)
        // templatePdf.name = "test_button.pdf"
        // context.response.writeFile(templatePdf);

        log.debug("Remaining governance Total OnRequest Suitelet : " + runtime.getCurrentScript().getRemainingUsage());
    }

    return {
        onRequest: onRequest
    }
});

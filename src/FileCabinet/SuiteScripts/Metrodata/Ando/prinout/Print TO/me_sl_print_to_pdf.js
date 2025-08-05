/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/query', 'N/render', '../lib/moment.min.js', 'N/file', '../config/config.js', 'N/query', 'N/runtime'], function (record, search, query, render, moment, file, config, query, runtime) {


    function printPDF(data, context) {
        log.debug("data", data)
        // var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')


        var templateFile = file.load({
            id: 57714
        });
        var renderer = render.create();

        renderer.templateContent = templateFile.getContents();

        // ==================== Start Olah Data ===================== //
        // Yang dibutuhkan untuk Printout

        renderer.addCustomDataSource({
            alias: "record",
            format: render.DataSource.OBJECT,
            data: data
        });

        // ==================== Akhir Olah Data ===================== //

        //================ START PrintOut ======================//
        var xml = renderer.renderAsString();

        var pdf = render.xmlToPdf({
            xmlString: xml
        });
        pdf.name = "BON Printout.pdf";

        context.response.writeFile(pdf, true);
        var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
        log.debug('Remaining Usage FINALE:', remainingUsage);
        // var pdfFile = renderer.renderAsPdf()
        // var xml = renderer.renderAsString().replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1");

        // log.debug("xml", xml)
        // log.debug("renderer exist", renderer);

        // var pdf = render.xmlToPdf({ // gunakan ini jika mau di Save
        //     xmlString: xml
        // });
        // log.debug("pdf",pdf)

        // pdf.name = 'Sales Ordder ' + now + ".pdf";// gunakan ini jika mau di Save
        // context.response.renderPdf(pdfFile) // gunakan ini jika mau di Open new tab

        //================ END PrintOut ======================//

        // context.response.writeFile(pdfFile, true);// gunakan ini jika mau di Save
    }

    function onRequest(context) {

        try {

            let is_show_logo = true;

            let jsonData = JSON.parse(context.request.parameters.custscript_me_param_do_in_so);

            let load_to = record.load({
                type: 'transferorder',
                id: jsonData.record_id,
            })

            let date = load_to.getText("trandate");
            let no_bb = load_to.getValue("tranid");
            let divisi = load_to.getText("department");
            let class_ = load_to.getText("class");
            let to_location = load_to.getText("location");
            let from_location = load_to.getText("transferlocation");
            let apk = load_to.getText("employee");
            let penerima = load_to.getText("custbody49");
            let gudang = load_to.getText("custbody50");
            let ppc = load_to.getText("custbody51");


            // let get_subsidiary_data = search.lookupFields({
            //     type:'subsidiary',
            //     id: subsidiary,
            //     columns: ['address']
            // })

            let get_item_count = load_to.getLineCount('item')
            let data = {
                date: date,
                no_bb: no_bb,
                divisi: divisi,
                class_: class_,
                to_location: to_location,
                from_location: from_location,
                apk: apk,
                penerima: penerima,
                gudang: gudang,
                ppc: ppc,
                item: []
            }

            let kit_item = [];

            for (let i = 0; i < get_item_count; i++) {
                let kode_barang_id = load_to.getSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: i,
                });
                let kode_barang_text = load_to.getSublistText({
                    sublistId: "item",
                    fieldId: "item",
                    line: i,
                });
                let uraian_barang = load_to.getSublistValue({
                    sublistId: "item",
                    fieldId: "description",
                    line: i,
                });
                let warna = load_to.getSublistText({
                    sublistId: "item",
                    fieldId: "custcol4",
                    line: i,
                });
                let satuan = load_to.getSublistText({
                    sublistId: "item",
                    fieldId: "units",
                    line: i,
                });
                let jumlah_minta = load_to.getSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    line: i,
                });
                let jumlah_beri = load_to.getSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    line: i,
                });
                let diterima = load_to.getSublistValue({
                    sublistId: "item",
                    fieldId: "quantityreceived",
                    line: i,
                });
                let keterangan_1 = load_to.getSublistText({
                    sublistId: "item",
                    fieldId: "custcol_nomor_ik_1",
                    line: i,
                });
                let keterangan_2 = load_to.getSublistText({
                    sublistId: "item",
                    fieldId: "custcol_nomor_ik_2",
                    line: i,
                });
                let keterangan_3 = load_to.getSublistText({
                    sublistId: "item",
                    fieldId: "custcol_nomor_ik_3",
                    line: i,
                });
                let keterangan_4 = load_to.getSublistText({
                    sublistId: "item",
                    fieldId: "custcol_nomor_ik_4",
                    line: i,
                });
                let keterangan_5 = load_to.getSublistText({
                    sublistId: "item",
                    fieldId: "custcol_nomor_ik_5",
                    line: i,
                });

                let keterangan_arr = [keterangan_1.split("#")[1], keterangan_2.split("#")[1], keterangan_3.split("#")[1], keterangan_4.split("#")[1], keterangan_5.split("#")[1]];
                let keterangan_array_stringify = keterangan_arr.filter((data)=>data != null).map((data)=>data).join()

                data.item.push({
                    kode_barang_id: kode_barang_id,
                    kode_barang_text: kode_barang_text,
                    uraian_barang: uraian_barang,
                    warna: warna,
                    satuan: satuan,
                    jumlah_minta: jumlah_minta,
                    jumlah_beri: jumlah_beri,
                    diterima: diterima,
                    keterangan: keterangan_array_stringify,
                });
            }

            log.debug("data", data)

            let Stringify_data = JSON.stringify(data).replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1")

            let revert_stringify = JSON.parse(Stringify_data)

            data = revert_stringify


            printPDF(data, context)
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

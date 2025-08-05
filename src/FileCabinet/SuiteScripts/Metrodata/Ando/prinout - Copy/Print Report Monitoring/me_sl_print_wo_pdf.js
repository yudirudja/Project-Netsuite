/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/query', 'N/render', '../lib/moment.min.js', 'N/file', '../config/config.js', 'N/query', 'N/runtime', 'N/ui/serverWidget'], function (record, search, query, render, moment, file, config, query, runtime, serverWidget) {


    function printPDF(data, context, params) {
        log.debug("data", data)
        // var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

        let obj = {
            header: params,
            sublist: data
        }

        var templateFile = file.load({
            id: 57716
        });
        var renderer = render.create();

        renderer.templateContent = templateFile.getContents();

        // ==================== Start Olah Data ===================== //
        // Yang dibutuhkan untuk Printout

        renderer.addCustomDataSource({
            alias: "record",
            format: render.DataSource.OBJECT,
            data: obj
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

    function getHasilProd(params) {
        let result = []
        var workorderSearchObj = search.create({
            type: "workorder",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["type", "anyof", "WorkOrd"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "trandate", label: "Tanggal" }),
                    search.createColumn({ name: "createdfrom", label: "Sales Order No." }),
                    search.createColumn({ name: "tranid", label: "Instruksi Kerja" }),
                    search.createColumn({ name: "statusref", label: "Status" }),
                    search.createColumn({ name: "item", label: "Komponen" }),
                    search.createColumn({ name: "quantity", label: "Total" }),
                    search.createColumn({ name: "quantityshiprecv", label: "Hasil Produksi" }),
                    search.createColumn({
                        name: "formulanumeric",
                        formula: "{quantity}-{quantityshiprecv}",
                        label: "Sisa Produksi"
                    }),
                    search.createColumn({ name: "custbody3", label: "Size 1" }),
                    search.createColumn({ name: "custbody4", label: "Jumlah 1" }),
                    search.createColumn({ name: "custbody42", label: "H. Produksi 1" }),
                    search.createColumn({ name: "custbody30", label: "Sisa Produksi 1" }),
                    search.createColumn({ name: "custbody5", label: "Size 2" }),
                    search.createColumn({ name: "custbody6", label: "Jumlah 2" }),
                    search.createColumn({ name: "custbody41", label: "H. Produksi 2" }),
                    search.createColumn({ name: "custbody32", label: "Sisa Produksi 2" }),
                    search.createColumn({ name: "custbody7", label: "Size 3" }),
                    search.createColumn({ name: "custbody8", label: "Jumlah 3" }),
                    search.createColumn({ name: "custbody43", label: "H. Produksi 3" }),
                    search.createColumn({ name: "custbody34", label: "Sisa Produksi 3" }),
                    search.createColumn({ name: "custbody9", label: "Size 4" }),
                    search.createColumn({ name: "custbody10", label: "Jumlah 4" }),
                    search.createColumn({ name: "custbody44", label: "H. Produksi 4" }),
                    search.createColumn({ name: "custbody36", label: "Sisa Produksi 4" }),
                    search.createColumn({ name: "custbody11", label: "Size 5" }),
                    search.createColumn({ name: "custbody12", label: "Jumlah 5" }),
                    search.createColumn({ name: "custbody45", label: "H. Produksi 5" }),
                    search.createColumn({ name: "custbody38", label: "Sisa Produksi 5" }),
                    search.createColumn({ name: "custbody13", label: "Size 6" }),
                    search.createColumn({ name: "custbody14", label: "Jumlah 6" }),
                    search.createColumn({ name: "custbody46", label: "H. Produksi 6" }),
                    search.createColumn({ name: "custbody40", label: "Sisa Produksi 6" })
                ]
        });

        let start = 0;

        do {

            var toResult = workorderSearchObj.run().getRange({
                start: start,
                end: start + 1000,
            });

            for (let i = 0; i < toResult.length; i++) {
                let date = toResult[i].getValue(toResult[i].columns[0])
                let so_number = toResult[i].getValue(toResult[i].columns[1])
                let instruksi_kerja = toResult[i].getValue(toResult[i].columns[2])
                let status = toResult[i].getValue(toResult[i].columns[3])
                let komponen = toResult[i].getValue(toResult[i].columns[4])
                let total = toResult[i].getValue(toResult[i].columns[5])
                let hasil_produksi = toResult[i].getValue(toResult[i].columns[6])
                let sisa_produksi = toResult[i].getValue(toResult[i].columns[7])
                let size_1 = toResult[i].getValue(toResult[i].columns[8])
                let jumlah_1 = toResult[i].getValue(toResult[i].columns[9])
                let h_produksi_1 = toResult[i].getValue(toResult[i].columns[10])
                let sisa_produksi_1 = toResult[i].getValue(toResult[i].columns[11])
                let size_2 = toResult[i].getValue(toResult[i].columns[12])
                let jumlah_2 = toResult[i].getValue(toResult[i].columns[13])
                let h_produksi_2 = toResult[i].getValue(toResult[i].columns[14])
                let sisa_produksi_2 = toResult[i].getValue(toResult[i].columns[15])
                let size_3 = toResult[i].getValue(toResult[i].columns[16])
                let jumlah_3 = toResult[i].getValue(toResult[i].columns[17])
                let h_produksi_3 = toResult[i].getValue(toResult[i].columns[18])
                let sisa_produksi_3 = toResult[i].getValue(toResult[i].columns[19])
                let size_4 = toResult[i].getValue(toResult[i].columns[20])
                let jumlah_4 = toResult[i].getValue(toResult[i].columns[21])
                let h_produksi_4 = toResult[i].getValue(toResult[i].columns[22])
                let sisa_produksi_4 = toResult[i].getValue(toResult[i].columns[23])
                let size_5 = toResult[i].getValue(toResult[i].columns[24])
                let jumlah_5 = toResult[i].getValue(toResult[i].columns[25])
                let h_produksi_5 = toResult[i].getValue(toResult[i].columns[26])
                let sisa_produksi_5 = toResult[i].getValue(toResult[i].columns[27])
                let size_6 = toResult[i].getValue(toResult[i].columns[28])
                let jumlah_6 = toResult[i].getValue(toResult[i].columns[29])
                let h_produksi_6 = toResult[i].getValue(toResult[i].columns[30])
                let sisa_produksi_6 = toResult[i].getValue(toResult[i].columns[31])

                result.push({
                    date: date,
                    so_number: so_number,
                    instruksi_kerja: instruksi_kerja,
                    status: status,
                    komponen: komponen,
                    total: total,
                    hasil_produksi: hasil_produksi,
                    sisa_produksi: sisa_produksi,
                    size_1: size_1,
                    jumlah_1: jumlah_1,
                    h_produksi_1: h_produksi_1,
                    sisa_produksi_1: sisa_produksi_1,
                    size_2: size_2,
                    jumlah_2: jumlah_2,
                    h_produksi_2: h_produksi_2,
                    sisa_produksi_2: sisa_produksi_2,
                    size_3: size_3,
                    jumlah_3: jumlah_3,
                    h_produksi_3: h_produksi_3,
                    sisa_produksi_3: sisa_produksi_3,
                    size_4: size_4,
                    jumlah_4: jumlah_4,
                    h_produksi_4: h_produksi_4,
                    sisa_produksi_4: sisa_produksi_4,
                    size_5: size_5,
                    jumlah_5: jumlah_5,
                    h_produksi_5: h_produksi_5,
                    sisa_produksi_5: sisa_produksi_5,
                    size_6: size_6,
                    jumlah_6: jumlah_6,
                    h_produksi_6: h_produksi_6,
                    sisa_produksi_6: sisa_produksi_6,
                })

            }
            start += 1000

        } while (toResult.length === 1000);
    }

    function getHasilProdSql(params) {
        let sql = `SELECT
                	trans.id,

			sum(trans_woc.custbody42 + trans_woc.custbody41 + trans_woc.custbody43 + trans_woc.custbody44 + trans_woc.custbody45 + trans_woc.custbody46) as completed_quantity,
                	trans.trandate,
                	trans.tranid,
                	item_size1.itemid as size_1,
                	sum(trans.custbody42)/COUNT(itm.itemId) as h_produksi_1,
                	item_size2.itemid as size_2,
                	sum(trans.custbody41)/COUNT(itm.itemId) as h_produksi_2,
                	item_size3.itemid as size_3,
                	sum(trans.custbody43)/COUNT(itm.itemId) as h_produksi_3,
                	item_size4.itemid as size_4,
                	sum(trans.custbody44)/COUNT(itm.itemId) as h_produksi_4,
                	item_size5.itemid as size_5,
                	sum(trans.custbody45)/COUNT(itm.itemId) as h_produksi_5,
                	item_size6.itemid as size_6,
                	sum(NVL(trans.custbody46, 0))/COUNT(itm.itemId) as h_produksi_6,
                	bomrevcp.item,
                    	itemBom.itemid as item_assembly,
                	itm.itemId,
                	sum(bomrevcp.quantity)/COUNT(itm.itemId),
                	SUM(nvl(trans.custbody42,0)  + nvl(trans.custbody41,0) +nvl(trans.custbody43,0 ) +nvl(trans.custbody44 ,0) + nvl(trans.custbody45 ,0) + nvl(trans.custbody46,0))/COUNT(itm.itemId) as komponen_sampai_dengan_hari_ini,

                    	SUM((nvl(trans.custbody42,0)  + nvl(trans.custbody41,0) +nvl(trans.custbody43,0 ) +nvl(trans.custbody44 ,0) + nvl(trans.custbody45 ,0) + nvl(trans.custbody46,0))/bomrevcp.quantity)/COUNT(itm.itemId) as pasang_sampai_dgn_hari_ini,

                FROM
                	transaction as trans
		        left join NextTransactionLink as woc on trans.id = woc.previousdoc
		        left join transaction as trans_woc on woc.nextdoc = trans_woc.id
                join bom on bom.id = trans.billofmaterials
                join itemAssemblyItemBom as bomassembly on bom.id = bomassembly.billofmaterials
                join item as itembom on bomassembly.assembly = itembom.id
                join bomRevision as bomRev on trans.billofmaterialsrevision = bomRev.id
                join bomRevisionComponentMember as bomrevcp on bomrevcp.bomrevision = bomRev.id
                join item as itm on bomrevcp.item = itm.id
                left join item as item_size1 on trans.custbody3 = item_size1.id
                left join item as item_size2 on trans.custbody5 = item_size2.id
                left join item as item_size3 on trans.custbody7 = item_size3.id
                left join item as item_size4 on trans.custbody9 = item_size4.id
                left join item as item_size5 on trans.custbody11 = item_size5.id
                left join item as item_size6 on trans.custbody13 = item_size6.id
                where trans.type = 'WorkOrd' and trans_woc.trandate = TO_DATE('${params.date}','YYYY-MM-DD') and trans_woc.type = 'WOCompl' and itm.itemType in ('InvtPart','Assembly')
                GROUP BY trans.id, trans.trandate, trans.tranid, item_size1.itemid, item_size2.itemid, item_size3.itemid, item_size4.itemid, item_size5.itemid, item_size6.itemid, bomrevcp.item, itemBom.itemid, itm.itemId
                order by trans.id`;
        // 62924 ini internal id wo
        // (62949, 62924) ini internal id wo
        // ((nvl(trans.custbody42,0)  + nvl(trans.custbody41,0) +nvl(trans.custbody43,0 ) +nvl(trans.custbody44 ,0) + nvl(trans.custbody45 ,0) + nvl(trans.custbody46,0))*bomrevcp.quantity) as komponen_sampai_dgn_hari_ini,
        let sql_result = query.runSuiteQL(sql).asMappedResults();

        log.debug("result", sql_result)
        return sql_result
    }

    function getParameters(context) {
        var form = serverWidget.createForm({ title: 'laporan hasil' });
        var MAT_information = form.addFieldGroup({
            id: 'coretax_report',
            label: 'report'
        });

        var date = form.addField({
            id: 'custpage_date',
            type: serverWidget.FieldType.DATE,
            label: "Date",
            container: 'coretax_report'
        });
        date.isMandatory = true;

        return form;
    }

    function rapiinData(data) {

        let result = []

        for (let i = 0; i < data.length; i++) {
            let total_komponen_sd_hari_ini = 0;
            let total_komponen_hari_ini = 0;


            if (result.filter((param) => param.id == data[i].id).length < 1) {
                let get_duplicate = data.filter((param) => param.id == data[i].id);
                log.debug('get_duplicate', get_duplicate)
                for (let j = 0; j < get_duplicate.length; j++) {
                    total_komponen_sd_hari_ini += Number(get_duplicate[j].komponen_sampai_dengan_hari_ini)
                    total_komponen_hari_ini += Number(get_duplicate[j].completed_quantity)

                }

                result.push({
                    id: data[i].id,
                    tranid: data[i].tranid,
                    item_assembly: data[i].item_assembly,
                    total_komponen_hari_ini: total_komponen_hari_ini,
                    total_komponen_sd_hari_ini: total_komponen_sd_hari_ini,
                    total_pasang_hari_ini: (get_duplicate[0].completed_quantity?get_duplicate[0].completed_quantity:0),
                    total_pasang_sd_hari_ini: (get_duplicate[0].komponen_sampai_dengan_hari_ini? get_duplicate[0].komponen_sampai_dengan_hari_ini:0),
                    count: get_duplicate.length,
                    data_line: get_duplicate,
                });

            } else {
                continue;
            }

        }
        log.debug("result", result)
        return result;

    }

    function onRequest(context) {

        try {

            let form = getParameters(context);

            let field_date_start = form.getField({ id: 'custpage_date' });

            let params = context.request.parameters;
            let value_date = params['custpage_date'];

            let paramsObj = {
                date: moment(value_date, 'D/M/YYYY').format('YYYY-MM-DD'),
                day_date: moment(value_date, 'D/M/YYYY').format('dddd, D/M/YYYY'),
            }

            log.debug("parmsObj", paramsObj)

            if (context.request.method === 'GET') {
                form.addSubmitButton({ label: 'GET Report' });
                context.response.writePage(form);
                // form.clientScriptModulePath = 'SuiteScripts/METRODATA/me_sl_cs_settlement_multicurrency_ap.js';

            } else if (context.request.method === 'POST') {
                let data = getHasilProdSql(paramsObj);
                let rapiin_data = rapiinData(data)
                printPDF(rapiin_data, context, paramsObj);

            }


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

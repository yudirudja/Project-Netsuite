/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/search', 'N/record'], function (search, record) {

    function getBookedEnofa() {
        var transactionSearchObj = search.create({
            type: "customrecord_me_enofa_faktur_pajak",
            filters:
                [
                    ["custrecord_me_status_enofa_number", "anyof", "2"],
                    "AND",
                    ["custrecord_me_invoice_document_number.trandate", "within", "1/10/2024", "31/10/2024"]
                ],

            columns:
                [
                    search.createColumn({ name: "name", label: "Name" }),
                    search.createColumn({ name: "internalid", label: "Internal Id" }),
                    search.createColumn({ name: "custrecord_me_invoice_document_number", label: "ME - Invoice Document Number" }),
                    search.createColumn({ name: "custrecord_me_date_faktur_pajak", label: "ME - Date" }),
                    search.createColumn({ name: "custrecord_me_year_faktur_pajak", label: "ME - Year" }),
                    search.createColumn({ name: "custrecord_me_status_enofa_number", label: "ME - Status Faktur Pajak" })
                ]
        });

        let search_result_arr = [];
        let start_row = 0;


        do {
            var to_result = transactionSearchObj.run().getRange({
                start: start_row,
                end: start_row + 1000,
            })

            for (let i = 0; i < to_result.length; i++) {

                var fieldLookUp = search.lookupFields({
                    type: search.Type.INVOICE,
                    id: to_result[i].getValue(to_result[i].columns[2]),
                    columns: ['custbody_me_kode_obyek_pajak']
                });

                // log.debug('cek kode pajak', fieldLookUp.custbody_me_kode_obyek_pajak[0].text)

                // log.debug('data enofa', {
                //     invoice: to_result[i].getValue(to_result[i].columns[2]),
                //     enofa: to_result[i].getValue(to_result[i].columns[0])
                // })

                search_result_arr.push({
                    custbody_me_kode_objek_pajak_text: fieldLookUp.custbody_me_kode_obyek_pajak[0].text,
                    enofa_id: to_result[i].getValue(to_result[i].columns[1]),
                    enofa: to_result[i].getValue(to_result[i].columns[0]),
                    invoice: to_result[i].getValue(to_result[i].columns[2])
                })

            }
            if (to_result.length % 1000 === 0) {
                start_row += 1000
            }

        } while (to_result.length === 1000);

        log.debug("search_result_arr", search_result_arr)

        return search_result_arr;

    }

    function getInputData() {
        return getBookedEnofa();
    }

    function map(context) {
        let result = JSON.parse(context.value);
        // for (let i = 0; i < result.length; i++) {
        log.debug("result", result);
        var id = record.submitFields({
            type: record.Type.INVOICE,
            id: result.invoice,
            values: {
                custbody_me_nomor_enofa: result.enofa_id,
                custbody_me_nomor_faktur_pajak_sales: result.custbody_me_kode_objek_pajak_text + '.' + result.enofa,
            },
            options: {
                enableSourcing: false,
                ignoreMandatoryFields: true
            }
        });

        // }
    }

    function summarize(context) {
        context.output.iterator().each(function (key, value) {
            log.audit({
                title: 'Summary',
                details: key + ' ' + value
            });
            return true;
        });

        // Handle any map stage errors
        context.mapSummary.errors.iterator().each(function (key, error) {
            log.error({
                title: 'Map Error',
                details: key + ' caused error: ' + error
            });
            return true;
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    }
});

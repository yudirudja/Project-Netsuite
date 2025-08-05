/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record'], function(search, record) {

    function execute(context) {
        var customrecord_me_enofa_faktur_pajakSearchObj = search.create({
            type: "customrecord_me_enofa_faktur_pajak",
            filters:
            [
               ["custrecord_me_status_enofa_number","anyof","2"],
            //    "AND",
            //    ["internalid", 'anyof', "674"]
            ],
            columns:
            [
               search.createColumn({name: "name", label: "Name"}),
               search.createColumn({name: "internalid", label: "Internal Id"}),
               search.createColumn({name: "custrecord_me_invoice_document_number", label: "ME - Invoice Document Number"}),
               search.createColumn({name: "custrecord_me_date_faktur_pajak", label: "ME - Date"}),
               search.createColumn({name: "custrecord_me_year_faktur_pajak", label: "ME - Year"}),
               search.createColumn({name: "custrecord_me_status_enofa_number", label: "ME - Status Faktur Pajak"})
            ]
         }).run().getRange({
            start:0,
            end:1000
         });
         
         for (let i = 0; i < customrecord_me_enofa_faktur_pajakSearchObj.length; i++) {

            var fieldLookUp = search.lookupFields({
                type: search.Type.INVOICE,
                id: customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[2]),
                columns: ['custbody_me_kode_obyek_pajak']
            });

            log.debug('cek kode pajak', fieldLookUp.custbody_me_kode_obyek_pajak[0].text)

            log.debug('data enofa', {
                invoice: customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[2]),
                enofa: customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[0])
            })
            var id = record.submitFields({
                type: record.Type.INVOICE,
                id: customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[2]),
                values: {
                    custbody_me_nomor_enofa: customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[1]),
                    custbody_me_nomor_faktur_pajak_sales: fieldLookUp.custbody_me_kode_obyek_pajak[0].text + '.' + customrecord_me_enofa_faktur_pajakSearchObj[i].getValue(customrecord_me_enofa_faktur_pajakSearchObj[i].columns[0])
                },
                options: {
                    // enableSourcing: false,
                    ignoreMandatoryFields : true
                }
            });
            
         }
    }

    return {
        execute: execute
    }
});

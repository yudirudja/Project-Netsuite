/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record'], function(search, record) {


    function beforeSubmit(context) {
        var rec = context.newRecord;

        var get_internal = rec.getValue('id')
        var get_name = rec.getValue('name')
        var get_invoice = rec.getValue('custrecord_me_invoice_document_number')

        var fieldLookUp = search.lookupFields({
            type: search.Type.INVOICE,
            id: get_invoice,
            columns: ['custbody_me_kode_obyek_pajak']
        });

        var id = record.submitFields({
            type: record.Type.INVOICE,
            id: get_invoice,
            values: {
                custbody_me_nomor_enofa: get_internal,
                custbody_me_nomor_faktur_pajak_sales: fieldLookUp.custbody_me_kode_obyek_pajak[0].text + '.' + get_name
            },
            options: {
                // enableSourcing: false,
                ignoreMandatoryFields : true
            }
        });
    }


    return {
 
        beforeSubmit: beforeSubmit,

    }
});

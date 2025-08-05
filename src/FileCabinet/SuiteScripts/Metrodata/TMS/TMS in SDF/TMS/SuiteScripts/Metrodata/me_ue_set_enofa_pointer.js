/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function enofaSearch(data) {
        var enofa = search.create({
            type: "customrecord_me_enofa_faktur_pajak",
            filters:
                [
                    ["internalid", "anyof", data]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_me_status_enofa_number", label: "ME - Status Faktur Pajak" }),
                ]
        }).run().getRange({
            start: 0,
            end: 1,
        });

        var getResult = enofa[0].getText(enofa[0].columns[0]);
        log.debug('getResult', getResult)

        return getResult;
    }

    function enofaSearch2() {
        var enofa = search.create({
            type: "customrecord_me_enofa_faktur_pajak",
            filters:
                [
                    ["custrecord_me_status_enofa_number", "anyof", "1"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "created",
                        label: "Date Created"
                    }),
                    search.createColumn({ name: "name", sort: search.Sort.ASC, label: "Name" }),
                    search.createColumn({
                        name: "internalid",

                        label: "Internal ID"
                    })
                ]
        }).run().getRange({
            start: 0,
            end: 1,
        });

        var oldestOpenEnofa = enofa[0].getValue(enofa[0].columns[2]);

        return oldestOpenEnofa;
    }

    function beforeSubmit(context) {
        var rec = context.newRecord;
        var recOld = context.oldRecord;
        var invoiceId = rec.id;

        var getNomorEnofa = rec.getValue('custbody_me_nomor_enofa');
        var getNomorEnofaOld = context.type != 'create' ? recOld.getValue('custbody_me_nomor_enofa') : '';

        // var getStatusId = rec.getValue('status');
        if (context.type == 'edit') {


            var getStatus = rec.getText('status');

            log.debug('getStatus', getStatus)
            if (getNomorEnofa && (context.type == 'edit' && context.type != 'delete')) {
                //     var getEnofa = enofaSearch(getNomorEnofa)
                //     log.debug('getEnofa', getEnofa)
                //     if (getEnofa != 'Open') {
                //         throw "Nomor Enofa Telah Digunakan/Closed"
                //     }
                // }
                if (getStatus.includes('Rejected')) {
                    if (getNomorEnofa && (context.type == 'edit' && context.type != 'delete')) {
                        // var getEnofa = enofaSearch(getNomorEnofa)
                        // log.debug('getEnofa', getEnofa)
                        // if (getEnofa != 'Open') {
                        //     throw "Nomor Enofa Telah Digunakan/Closed"
                        // }
                        // var setEnofaRec = record.submitFields({
                        //     type: 'customrecord_me_enofa_faktur_pajak',
                        //     id: getNomorEnofaOld,
                        //     values: {
                        //         'custrecord_me_invoice_document_number': null,
                        //         'custrecord_me_status_enofa_number': 1,
                        //     }
                        // });

                        var setEnofaRecNew = record.submitFields({
                            type: 'customrecord_me_enofa_faktur_pajak',
                            id: getNomorEnofa,
                            values: {
                                'custrecord_me_invoice_document_number': null,
                                'custrecord_me_status_enofa_number': 1,
                            }
                        });

                        var getFakturPajakPj = rec.getValue('custbody_me_nomor_faktur_pajak_sales')
                        var setFakturPajakPj = rec.setValue('custbody_me_nomor_faktur_pajak_sales', getFakturPajakPj + ' - canceled')
                        var setEnofaReject = rec.setValue('custbody_me_nomor_enofa', null)
                    }
                } else {
                    if (getNomorEnofa && (context.type == 'edit' && context.type != 'delete')) {
                        if (getNomorEnofa != getNomorEnofaOld) {
                            var getEnofa = enofaSearch(getNomorEnofa)
                            log.debug('getEnofa', getEnofa)
                            if (getEnofa != 'Open') {
                                throw "Nomor Enofa Telah Digunakan/Closed"
                            }
                            var setEnofaRec = record.submitFields({
                                type: 'customrecord_me_enofa_faktur_pajak',
                                id: getNomorEnofaOld,
                                values: {
                                    'custrecord_me_invoice_document_number': null,
                                    'custrecord_me_status_enofa_number': 1,
                                }
                            });

                            var setEnofaRecNew = record.submitFields({
                                type: 'customrecord_me_enofa_faktur_pajak',
                                id: getNomorEnofa,
                                values: {
                                    'custrecord_me_invoice_document_number': invoiceId,
                                    'custrecord_me_status_enofa_number': 2,
                                }
                            });
                        }
                    }
                }
            }
        }

      if (context.type == 'create' && getNomorEnofa) {
        var getEnofa = enofaSearch(getNomorEnofa)
                            log.debug('getEnofa', getEnofa)
                            if (getEnofa != 'Open') {
                                throw "Nomor Enofa Telah Digunakan/Closed"
                            }
      }
    }
    function afterSubmit(context) {
        var rec = context.newRecord;
        var invoiceId = rec.id;
        if ((context.type != 'delete')) {


            var getNomorEnofa = rec.getValue('custbody_me_nomor_enofa');
            var getFakturPajak = rec.getValue('custbody_me_nomor_faktur_pajak_sales');
            var getSalesCategory = rec.getValue('custbody_me_sales_category');

            if (!getFakturPajak.includes('Canceled') && context.type !== 'edit' &&(getSalesCategory != '3'&&getSalesCategory != '4')) {
                try {
                    var setEnofaRec = record.submitFields({
                        type: 'customrecord_me_enofa_faktur_pajak',
                        id: getNomorEnofa,
                        values: {
                            'custrecord_me_invoice_document_number': invoiceId,
                            'custrecord_me_status_enofa_number': 2,
                        }
                    });
                } catch (error) {
                    var loadPr = record.load({
                        type: record.Type.INVOICE,
                        id: invoiceId,
                    });
                    // var getEnofa = rec.getText('custbody_me_nomor_enofa')
                    // var getKodePajak = rec.getValue('custbody_me_kode_obyek_pajak')
                    // var getStatus = rec.getValue('custbody_me_status_faktur_pajak')
                    var getboundedZone = loadPr.getValue('custbody_me_bounded_zone')

                    log.debug('context tipe', context.mode)

                    // if (context.mode  != 'edit') {
                    var setStatus = loadPr.setValue('custbody_me_status_faktur_pajak', 1);

                    if (getboundedZone == 1) {
                        var setKodeObj = loadPr.setText('custbody_me_kode_obyek_pajak', '070');
                    } else {
                        var setKodeObj = loadPr.setText('custbody_me_kode_obyek_pajak', '010');
                    }

                    var getEnofaSs = enofaSearch2();
                    var setEnofa = loadPr.setValue('custbody_me_nomor_enofa', getEnofaSs)
                    log.debug('getEnofa', getEnofaSs);

                    var setStatus = loadPr.setValue('approvalstatus', 2)
                    var getEnofaAfter = loadPr.getValue('custbody_me_nomor_enofa')
                    var getKodePajakAfter = loadPr.getText('custbody_me_kode_obyek_pajak')
                    var getStatusAfter = loadPr.getValue('custbody_me_status_faktur_pajak')

                    var getEnofaName = search.lookupFields({
                        type: "customrecord_me_enofa_faktur_pajak",
                        id: getEnofaAfter,
                        columns: ["name"]
                    });

                    // log.debug('getEnofaName', getEnofaName)

                    var setfakturPajak = loadPr.setValue('custbody_me_nomor_faktur_pajak_sales', getKodePajakAfter + '.' + getEnofaName.name);
                    loadPr.save()
                }

            }
        }
    }

    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit,
    }
});

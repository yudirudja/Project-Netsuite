/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define(['N/search'], function (search) {

    function enofaSearch() {
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
        log.debug('oldestOpenEnofa',oldestOpenEnofa)

        return oldestOpenEnofa;
    }

    function pageInit(context) {
        var rec = context.currentRecord;
        var sublistID = context.sublistId;
        var fieldID = context.fieldId;

        var getFakturPajak = rec.getValue('custbody_me_nomor_faktur_pajak_sales');
        var getSalesCategory = rec.getValue('custbody_me_sales_category');

        if (!getFakturPajak.includes('Canceled')&& (getSalesCategory == 1 || getSalesCategory == 2|| getSalesCategory == 5)) {
            var getEnofa = rec.getText('custbody_me_nomor_enofa')
            var getKodePajak = rec.getValue('custbody_me_kode_obyek_pajak')
            var getStatus = rec.getValue('custbody_me_status_faktur_pajak')
            var getboundedZone = rec.getValue('custbody_me_bounded_zone')

            log.debug('context tipe', context.mode )

            if (context.mode  != 'edit') {
                var setStatus = rec.setValue('custbody_me_status_faktur_pajak', 1);

                if (getboundedZone == 1) {
                    var setKodeObj = rec.setText('custbody_me_kode_obyek_pajak', '070');
                }else{
                    var setKodeObj = rec.setText('custbody_me_kode_obyek_pajak', '010');
                }

                var getEnofaSs = enofaSearch();
                var setEnofa = rec.setValue('custbody_me_nomor_enofa', getEnofaSs)
                log.debug('getEnofa', getEnofaSs);

                var getEnofaAfter = rec.getText('custbody_me_nomor_enofa')
                var getKodePajakAfter = rec.getText('custbody_me_kode_obyek_pajak')
                var getStatusAfter = rec.getText('custbody_me_status_faktur_pajak')

                var setfakturPajak = rec.setValue('custbody_me_nomor_faktur_pajak_sales', getKodePajakAfter + '.' + getEnofaAfter);
            }



        }
        if (!getFakturPajak.includes('Canceled') && (getSalesCategory == 3 || getSalesCategory == 4)) {
            var kodePajak = rec.setValue('custbody_me_kode_obyek_pajak', null);
            var statusFaktur = rec.setValue('custbody_me_status_faktur_pajak', 0);
            var enofaNumber = rec.setValue('custbody_me_nomor_enofa', null);
            var setfakturPajak = rec.setValue('custbody_me_nomor_faktur_pajak_sales', null);
        }

    }

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistID = context.sublistId;
        var fieldID = context.fieldId;

        var getEnofaNumber = rec.getText('custbody_me_nomor_enofa');
        var getKodeObjekPajak = rec.getText('custbody_me_kode_obyek_pajak');
        var getboundedZone = rec.getValue('custbody_me_bounded_zone')
        var getSalesCategory = rec.getValue('custbody_me_sales_category')

        // if (getEnofaNumber == '' || getKodeObjekPajak == '') {
        if ((fieldID === 'custbody_me_kode_obyek_pajak' && getEnofaNumber != '') || (fieldID === 'custbody_me_bounded_zone')) {
            var setfakturPajak = rec.setValue('custbody_me_nomor_faktur_pajak_sales', getKodeObjekPajak + '.' + getEnofaNumber);
        }
        if ((fieldID === 'custbody_me_nomor_enofa' && getEnofaNumber != '') || (fieldID === 'custbody_me_bounded_zone')) {
            var setfakturPajak = rec.setValue('custbody_me_nomor_faktur_pajak_sales', getKodeObjekPajak + '.' + getEnofaNumber);
        }
        if (fieldID === 'custbody_me_bounded_zone' && getboundedZone == 1) {
            var setStatus = rec.setText('custbody_me_kode_obyek_pajak', '070');
        }
        if (fieldID === 'custbody_me_bounded_zone' && getboundedZone != 1) {
            var setStatus = rec.setText('custbody_me_kode_obyek_pajak', '010');
        }
        if (fieldID === 'custbody_me_sales_category' && (getSalesCategory == 3 || getSalesCategory == 4)) {
            var kodePajak = rec.setValue('custbody_me_kode_obyek_pajak', null);
            var statusFaktur = rec.setValue('custbody_me_status_faktur_pajak', 0);
            var enofaNumber = rec.setValue('custbody_me_nomor_enofa', null);
            var setfakturPajak = rec.setValue('custbody_me_nomor_faktur_pajak_sales', null);
        }
        if (fieldID === 'custbody_me_sales_category' && (getSalesCategory == 1 || getSalesCategory == 2|| getSalesCategory == 5)) {
            var getEnofa = rec.getText('custbody_me_nomor_enofa')
            var getKodePajak = rec.getValue('custbody_me_kode_obyek_pajak')
            var getStatus = rec.getValue('custbody_me_status_faktur_pajak')
            var getboundedZone = rec.getValue('custbody_me_bounded_zone')

            log.debug('context tipe', context.mode )

            if (context.mode  != 'edit') {
                var setStatus = rec.setValue('custbody_me_status_faktur_pajak', 1);

                if (getboundedZone == 1) {
                    var setKodeObj = rec.setText('custbody_me_kode_obyek_pajak', '070');
                }else{
                    var setKodeObj = rec.setText('custbody_me_kode_obyek_pajak', '010');
                }

                var getEnofaSs = enofaSearch();
                var setEnofa = rec.setValue('custbody_me_nomor_enofa', getEnofaSs)
                log.debug('getEnofa', getEnofaSs);

                var getEnofaAfter = rec.getText('custbody_me_nomor_enofa')
                var getKodePajakAfter = rec.getText('custbody_me_kode_obyek_pajak')
                var getStatusAfter = rec.getText('custbody_me_status_faktur_pajak')

                var setfakturPajak = rec.setValue('custbody_me_nomor_faktur_pajak_sales', getKodePajakAfter + '.' + getEnofaAfter);
            }
        }
        // if (fieldID === 'custbody_me_nomor_enofa' && getKodeObjekPajak != '') {
        //     var setfakturPajak = rec.setValue('custbody_me_nomor_faktur_pajak_sales', getKodeObjekPajak + '.' + getEnofaNumber);
        // }
        // }
    }



    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
    }
});

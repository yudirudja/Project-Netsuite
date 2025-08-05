/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', './library/moment.min.js'], function(record, search, moment) {

    function beforeSubmit(context) {
        var currentRecord = context.newRecord;

        var sublistItemCount = currentRecord.getLineCount({
            sublistId: 'item',
        });

        var totalDiscEachItem = [];

        for (let i = 0; i < sublistItemCount; i++) {
            var potonganPl = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_potongan_pl_rp',
                line: i,
            });
            var potonganDiscLainnya = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_pot_disc_lainnya_rp',
                line: i,
            });
            var potonganExtraDisc = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_pot_extra_disc_rp',
                line: i,
            });
            var potonganWelcomeVoucher = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_potongan_voucher_rp',
                line: i,
            });
            var potonganVoucherLainnya = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_pot_voucher_lainnya_rp',
                line: i,
            });
            var potonganBirthdayVoucher = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_ptongan_vchr_birthday_rp',
                line: i,
            });

            var total_discount = Number(potonganPl) + Number(potonganDiscLainnya) + Number(potonganExtraDisc) + Number(potonganWelcomeVoucher) + Number(potonganVoucherLainnya) + Number(potonganBirthdayVoucher)
            
            var totalDiscountItem = currentRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_total_discount_per_item',
                value: total_discount,
                line: i,
            });

            var standartFieldTotalAmount = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                line: i,
            });

            var amountSebelumDiscount = currentRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_amount_before_discount',
                value: Number(standartFieldTotalAmount),
                line: i,
            });

            var amountAfterDiscount = currentRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                value: Number(standartFieldTotalAmount) - total_discount,
                line: i,
            });

            totalDiscEachItem.push(total_discount);
        }

        var total = 0;

        for (let x = 0; x < totalDiscEachItem.length; x++) {
            total += totalDiscEachItem[x];
        }

        var totalAllDiscount = currentRecord.setValue({
            fieldId: 'custbody_me_total_discount',
            value: total
        })

    }


    return {
        beforeSubmit: beforeSubmit,
    }
});

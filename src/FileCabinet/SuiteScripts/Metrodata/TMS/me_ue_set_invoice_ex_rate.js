/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/currency', './lib/moment.min.js', 'N/search', 'N/record'], function (currency, moment, search, record) {


    function afterSubmit(context) {

        if (context.type != 'delete') {


            var recContext = context.newRecord;

            var rec = record.load({
                type: 'invoice',
                id: recContext.id,
            });

            var itemLine = rec.getLineCount('item')

            for (let i = 0; i < itemLine; i++) {
                var getTaxAmt = rec.getSublistValue('item', 'tax1amt', i);
                log.debug('getTaxAmt', getTaxAmt)
                var setMeTaxAmout = rec.setSublistValue({ sublistId: 'item', fieldId: 'custcol_me_inv_tax_amout', value: getTaxAmt, line: i })

            }


            var getCurrency = rec.getText('currency');

            var getKursPajak = rec.getValue('custbody_me_ex_rate_pjk')

            var getLineItem = rec.getLineCount('item')

            for (let i = 0; i < getLineItem; i++) {

                var getLme = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_lme_final',
                    line: i
                });
                var getPremium = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_premium_final',
                    line: i
                });
                var getMjp = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_mjp_price',
                    line: i
                });
                var getOther = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_other_final',
                    line: i
                });
                var getQuantity = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                });
                var getKesepakatanKurs = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_kurs_kesepakatan',
                    line: i
                });
                var getTaxCodeId = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'taxcode',
                    line: i
                })
                // var getPremiumOtherFinal = rec.getSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'custcol_me_other_final',
                //     // line: i
                // })
                var getTaxCode = rec.getSublistText({
                    sublistId: 'item',
                    fieldId: 'taxcode',
                    line: i
                })
                var getOtherRate = rec.getSublistValue('item', "custcol_me_others_rate_final", i)


                if (getTaxCodeId) {
                    var getTaxRateText = search.lookupFields({
                        type: search.Type.SALES_TAX_ITEM,
                        id: getTaxCodeId,
                        columns: ['rate']
                    });

                    // log.debug('getTaxRateText', getTaxRateText.rate)

                    var getTaxRate = parseFloat(getTaxRateText.rate)

                    log.debug("data line", {
                        includes_idr: getCurrency.includes('IDR'),
                        includes_usd: getCurrency.includes('US'),
                        is_bounded_zone: rec.getText('custbody_me_bounded_zone'),
                        tax_code_include_ppn: getTaxCode.includes('PPN 0%'),
                        tax_code_include_undeff: getTaxCode.includes('UNDEF%'),
                    })
                    if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
                        if (rec.type == 'invoice') {
                            var setUnitPriceBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_unit_price_bounded_zone',
                                line: i,
                                value: (Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                // ignoreFieldChange: true
                            })
                            var setFakturPajakBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                line: i,
                                value: parseFloat((Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther))).toFixed(5) * Number(getQuantity)
                                // ignoreFieldChange: true
                            })
                            var setFakturPajakBoundedPpn = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_ppn_idr',
                                line: i,
                                value: parseFloat((Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther))).toFixed(5) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                                // ignoreFieldChange: true
                            })

                        }
                        var setTaxAmt = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'tax1amt',
                            line: i,
                            value: parseFloat((Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther))).toFixed(5) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                            // ignoreFieldChange: true
                        })
                    }
                    if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'No' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
                        if (rec.type == 'invoice') {
                            var setUnitPriceBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_unit_price_bounded_zone',
                                line: i,
                                value: parseFloat(Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * ((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp) + Number(!getOther ? 0 : getOther))),
                                // ignoreFieldChange: true
                            })
                            var setFakturPajakBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                line: i,
                                value: (parseFloat(Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * Number((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp) + Number(!getOther ? 0 : getOther)))).toFixed(5) * Number(getQuantity),
                                // ignoreFieldChange: true
                            })
                            var setFakturPajakBoundedPpn = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_ppn_idr',
                                line: i,
                                value: (parseFloat(Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * Number((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp) + Number(!getOther ? 0 : getOther)))).toFixed(5) * Number(getQuantity) * (0.11),
                                // ignoreFieldChange: true
                            })
                        }
                        var setTaxAmt = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'tax1amt',
                            line: i,
                            value: parseFloat((Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * Number((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp) + Number(!getOther ? 0 : getOther)))).toFixed(5) * Number(getQuantity) * (0.11),
                            // ignoreFieldChange: true
                        })
                    }
                    if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'No' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                        var setUnitPriceBounded = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_unit_price_bounded_zone',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                        var setFakturPajakBounded = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                        var setFakturPajakBoundedPpn = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_ppn_idr',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                    }
                    if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                        if (rec.type == 'invoice') {
                            var setUnitPriceBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_unit_price_bounded_zone',
                                line: i,
                                value: (Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                // ignoreFieldChange: true
                            })
                            var setFakturPajakBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                line: i,
                                value: parseFloat((Number(getKesepakatanKurs) + Number(getOtherRate)) * Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther))).toFixed(5) * Number(getQuantity),
                                // ignoreFieldChange: true
                            })
                            var setFakturPajakBoundedPpn = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_ppn_idr',
                                line: i,
                                value: parseFloat((Number(getKesepakatanKurs) + Number(getOtherRate)) * Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther))).toFixed(5) * Number(getQuantity) * (0.11),
                                // ignoreFieldChange: true
                            })
                        }
                        var setTaxAmt = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'tax1amt',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                    }
                    if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
                        log.debug('getTaxCode', (getTaxCode))
                        log.debug('test', (getTaxCode.includes('PPN 0%')))
                        if (rec.type == 'invoice') {
                            var setUnitPriceBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_unit_price_bounded_zone',
                                line: i,
                                value: Number((Number(getKursPajak) + Number(getOtherRate)) * Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)).toFixed(5)).toFixed(5),
                                // ignoreFieldChange: true
                            })
                            var totalAmount = rec.getSublistValue('item', 'amount', i)
                            var setFakturPajakBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                line: i,
                                value: (Number((Number(getKursPajak) + Number(getOtherRate)) * Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)).toFixed(5)).toFixed(5)) * Number(getQuantity),
                                // ignoreFieldChange: true
                            })
                            log.debug('parseFloat(Number(getKursPajak) + Number(getOtherRate)) * Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)).toFixed(5).toFixed(2) * Number(getQuantity', parseFloat(Number(getKursPajak) + Number(getOtherRate)) * Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)).toFixed(5).toFixed(5) * Number(getQuantity))

                            var setFakturPajakBoundedPpn = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_ppn_idr',
                                line: i,
                                value: (Number((Number(getKursPajak) + Number(getOtherRate)) * Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)).toFixed(5)).toFixed(5)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                                // ignoreFieldChange: true
                            })
                        }
                        var setTaxAmt = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'tax1amt',
                            line: i,
                            value: Number((Number(getKursPajak) + Number(getOtherRate)) * Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)).toFixed(5)).toFixed(5) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                            // ignoreFieldChange: true
                        })
                    }
                    if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'No' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
                        var setUnitPriceBounded = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_unit_price_bounded_zone',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                        var setFakturPajakBounded = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                        var setFakturPajakBoundedPpn = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_ppn_idr',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                        var setTaxAmt = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'tax1amt',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                    }
                    if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                        if (rec.type == 'invoice') {
                            var setUnitPriceBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_unit_price_bounded_zone',
                                line: i,
                                value: Number(Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                // ignoreFieldChange: true
                            })
                            var totalAmount = rec.getSublistValue('item', 'amount', i)
                            log.debug('totalAmount', totalAmount)
                            var setFakturPajakBounded = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                line: i,
                                value: Number(Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)).toFixed(5) * (Number(getKursPajak) + Number(getOtherRate))).toFixed(5) * Number(getQuantity),
                                // ignoreFieldChange: true
                            })
                            // var setFakturPajakBounded = rec.setSublistValue({
                            //     sublistId: 'item',
                            //     fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                            //     line: i,
                            //     value: parseFloat(Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                            //     // ignoreFieldChange: true
                            // })
                            log.debug('parseFloat(Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)).toFixed(2) * Number(getQuantity', parseFloat(Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity))
                            var setFakturPajakBoundedPpn = rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_ppn_idr',
                                line: i,
                                value: Number(Number(Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)).toFixed(5) * (Number(getKursPajak) + Number(getOtherRate))).toFixed(5) * Number(getQuantity) * (0.11),
                                // ignoreFieldChange: true
                            })
                        }
                        var setTaxAmt = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'tax1amt',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                    }
                    if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'No' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                        var setUnitPriceBounded = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_unit_price_bounded_zone',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                        var setFakturPajakBounded = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                        var setFakturPajakBoundedPpn = rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_ppn_idr',
                            line: i,
                            value: 0,
                            // ignoreFieldChange: true
                        })
                    }
                }
            }
            rec.save()
        }

    }

    return {
        afterSubmit: afterSubmit,
    }
});

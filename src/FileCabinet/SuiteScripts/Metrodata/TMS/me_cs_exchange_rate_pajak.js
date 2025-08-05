/**
 *@NApiVersion 2.1
*@NScriptType ClientScript
*/
define(['N/currency', './lib/moment.min.js', 'N/search'], function (currency, moment, search) {

    function searchKmkKurs(params) {
        log.debug('date', params)
        var getKurs = search.create({
            type: "customrecord_me_csrec_kurs_pajak",
            filters:
                [
                    ["custrecord_me_effective_date_pajak", "onorbefore", params]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "internal Id" }),
                    search.createColumn({ name: "scriptid", label: "Script ID" }),
                    search.createColumn({ name: "custrecord_me_exchange_rates", sort: search.Sort.ASC, label: "ME - Exchange Rates" }),
                    search.createColumn({ name: "custrecord_me_effective_date_pajak", label: "ME - Effective Date" })
                ]
        }).run().getRange({
            start: 0,
            end: 1
        });

        var result = {
            effective_date: getKurs[0].getValue(getKurs[0].columns[3]),
            kmk_number: getKurs[0].getValue(getKurs[0].columns[0]),
            rate: getKurs[0].getValue(getKurs[0].columns[2]),
        }

        log.debug('result', result)

        return result;
    }

    function pageInit(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;
        try {

            var getBoundedZone = rec.getValue('custbody_me_bounded_zone');
            var getDate = rec.getText('trandate')
            // var rate = currency.exchangeRate({
            //     source: 'IDP',
            //     target: 'USD',
            //     date: new Date(moment(getDate, 'D/M/YYYY').format('M/D/YYYY'))
            // });

            var getKmkKurs = searchKmkKurs(getDate)



            if (getBoundedZone == '1') {
                var setKursPajak = rec.setValue('custbody_me_ex_rate_pjk', getKmkKurs.rate);
                // var setKursPajakDate = rec.setValue('custbody_me_kmk_effective_date', getKmkKurs.effective_date);
                var setKursPajakNumber = rec.setValue('custbody_me_kmk_no', getKmkKurs.kmk_number);
            } else {
                var setKursPajak = rec.setValue('custbody_me_ex_rate_pjk', 1);
            }

        } catch (error) {
            var setKursPajak = rec.setValue('custbody_me_ex_rate_pjk', 1);
        }

        try {
            var getId = rec.getvalue('internalid')
        } catch (error) {
            var setIsCreate = rec.setValue('custbody_me_is_create', true);
        }

        log.debug('context.mode Page Init', context.mode)
    }

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        log.debug('context.mode field change', context.mode)
        var getBoundedZoneText = rec.getText('custbody_me_bounded_zone');
        var getCurrency = rec.getText('currency');
        var getIsCreate = rec.getValue('custbody_me_is_create');
        log.debug('Get Is Create', getIsCreate)
        log.debug('fieldId', fieldId)
        log.debug('getBoundedZoneText', getBoundedZoneText)
        var getBoundedZone = rec.getValue('custbody_me_bounded_zone');


        // if (getIsCreate) {
        if (fieldId == 'custbody_me_bounded_zone') {

            log.debug('getBoundedZoneText2', getBoundedZoneText)
            
            var getDate = rec.getText('trandate')
            // var rate = currency.exchangeRate({
            //     source: 'IDP',
            //     target: 'USD',
            //     date: new Date(moment(getDate, 'D/M/YYYY').format('M/D/YYYY'))
            // });

            var getKmkKurs = searchKmkKurs(getDate)
            
            if (getBoundedZone == '1') {
                var setKursPajak = rec.setValue('custbody_me_ex_rate_pjk', getKmkKurs.rate);
                // var setKursPajakDate = rec.setValue('custbody_me_kmk_effective_date', getKmkKurs.effective_date);
                var setKursPajakNumber = rec.setValue('custbody_me_kmk_no', getKmkKurs.kmk_number);
            } else {
                var setKursPajak = rec.setValue('custbody_me_ex_rate_pjk', 1);
            }

            log.debug('getBoundedZoneText2', getBoundedZoneText)
            if (((getBoundedZone == '1'))) {

                var getDate = rec.getText('trandate').toString();
                var getKmkKurs = searchKmkKurs(getDate);

                log.debug('getDate', getDate)
                // log.debug('getDate', moment(getDate, 'D/M/YYYY').format('M/D/YYYY'))

                // var rate = currency.exchangeRate({
                //     source: 'IDP',
                //     target: 'USD',
                //     date: new Date(moment(getDate, 'D/M/YYYY').format('M/D/YYYY'))
                // });


                var setKursPajak = rec.setValue('custbody_me_ex_rate_pjk', getKmkKurs.rate);
                // var setKursPajakDate = rec.setValue('custbody_me_kmk_effective_date', getKmkKurs.effective_date);
                var setKursPajakNumber = rec.setValue('custbody_me_kmk_no', getKmkKurs.kmk_number);
                var getKursPajak = rec.getValue('custbody_me_ex_rate_pjk');

                // log.debug("currency", getCurrency)

                // try {
                    var getItemLine = rec.getLineCount('item')
                    var itemLineNumber = Number(getItemLine)

                    for (let i = 0; i < itemLineNumber; i++) {
                        if (i == itemLineNumber - 1) {
                            // break;
                        } else {
                            rec.selectLine('item', i)


                            var getLme = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_lme_final',
                                line: i
                            });
                            var getPremium = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_premium_final',
                                line: i
                            });
                            var getMjp = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_mjp_price',
                                line: i
                            });
                            var getOther = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_other_final',
                                line: i
                            });
                            var getQuantity = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: i
                            });
                            var getKesepakatanKurs = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_kurs_kesepakatan',
                                line: i
                            });
                            var getTaxCodeId = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                line: i
                            })
                            var getTaxCodeText = rec.getCurrentSublistText({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                line: i
                            })
                            log.debug('get tax code', getTaxCodeText)
                            var getOtherRate = rec.getCurrentSublistValue('item', "custcol_me_others_rate_proforma");

                            // if (getTaxCodeId) {
                                var getTaxRateText = search.lookupFields({
                                    type: search.Type.SALES_TAX_ITEM,
                                    id: getTaxCodeId,
                                    columns: ['rate']
                                });

                                log.debug('getTaxRateText', getTaxRateText.rate)

                                var getTaxRate = parseFloat(getTaxRateText.rate)



                                if (getCurrency.includes('IDR') && !getTaxCodeText.includes('PPN 0%')) {
                                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_unit_price_bounded_zone',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                    })
                                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                                    })
                                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_ppn_idr',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (getTaxRate / 100),
                                    })
                                    var setTaxAmt = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'tax1amt',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (getTaxRate / 100),
                                    })
                                }
                                if (getCurrency.includes('IDR') && getTaxCodeText.includes('PPN 0%')) {
                                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_unit_price_bounded_zone',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                    })
                                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                                    })
                                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_ppn_idr',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (0.11),
                                    })
                                    var setTaxAmt = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'tax1amt',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (0.11),
                                    })
                                }

                                // var setFakturPajakBounded = rec.setCurrentSublistValue({
                                //     sublistId: 'item',
                                //     fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                //     line: i,
                                //     value: Number(getKursPajak) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                                // })

                                if (getCurrency.includes('US') && !getTaxCodeText.includes('PPN 0%')) {
                                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_unit_price_bounded_zone',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                    })
                                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                                    })
                                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_ppn_idr',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (getTaxRate / 100),
                                    })
                                    var setTaxAmt = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'tax1amt',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (getTaxRate / 100),
                                    })
                                }
                                if (getCurrency.includes('US') && getTaxCodeText.includes('PPN 0%')) {
                                    log.debug('INI INCLUDE 0% YESSSSS', 'TEST')
                                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_unit_price_bounded_zone',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                    })
                                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                                    })
                                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_me_ppn_idr',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (0.11),
                                    })
                                    var setTaxAmt = rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'tax1amt',
                                        line: i,
                                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (0.11),
                                    })
                                }
                            // }
                            rec.commitLine('item', i)
                        }
                    }

                
            }

            if (((getBoundedZone == '2'))) {

                var getDate = rec.getText('trandate')

                log.debug('getDate', getDate)
                log.debug('getDate', moment(getDate, 'D/M/YYYY').format('M/D/YYYY'))

                // var rate = currency.exchangeRate({
                //     source: 'IDP',
                //     target: 'USD',
                //     date: new Date(moment(getDate, 'D/M/YYYY').format('M/D/YYYY'))
                // });

                var setKursPajak = rec.setValue('custbody_me_ex_rate_pjk', 1);
                // var getKursPajak = rec.getValue('custbody_me_ex_rate_pjk');

                // log.debug("currency", getCurrency)

                try {
                    var getItemLine = rec.getLineCount('item')
                    var itemLineNumber = Number(getItemLine)

                    for (let i = 0; i < itemLineNumber; i++) {
                        if (i == itemLineNumber - 1) {
                            // break;
                        } else {
                            rec.selectLine('item', i)
                            var getLme = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_lme_final',
                                line: i
                            });
                            var getPremium = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_premium_final',
                                line: i
                            });
                            var getMjp = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_mjp_price',
                                line: i
                            });
                            var getOther = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_other_final',
                                line: i
                            });
                            var getQuantity = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: i
                            });
                            var getKesepakatanKurs = rec.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_me_kurs_kesepakatan',
                                line: i
                            });
                            var getTaxCode = rec.getCurrentSublistText({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                line: i
                            })
                            var getTaxRate = rec.getCurrentSublistText({
                                sublistId: 'item',
                                fieldId: 'taxrate1',
                                line: i
                            })

                            if (getCurrency.includes('IDR') && getTaxCode.includes('PPN 0%')) {
                                var setUnitPriceBounded = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_me_unit_price_bounded_zone',
                                    line: i,
                                    value: (Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                })
                                var setFakturPajakBounded = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                    line: i,
                                    value: (Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                                })
                                var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_me_ppn_idr',
                                    line: i,
                                    value: 0,
                                })
                            }
                            if (getCurrency.includes('IDR') && !getTaxCode.includes('PPN 0%')) {
                                var setUnitPriceBounded = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_me_unit_price_bounded_zone',
                                    line: i,
                                    value: (Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                })
                                var setFakturPajakBounded = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                    line: i,
                                    value: (Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                                })
                                var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_me_ppn_idr',
                                    line: i,
                                    value: (Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                                })
                                var setTaxAmt = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'tax1amt',
                                    // line: i,
                                    value: Number(Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100).toFixed(2),
                                })
                            }

                            // var setFakturPajakBounded = rec.setCurrentSublistValue({
                            //     sublistId: 'item',
                            //     fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                            //     line: i,
                            //     value: Number(getKursPajak) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                            // })

                            if (getCurrency.includes('US')) {
                                var setUnitPriceBounded = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_me_unit_price_bounded_zone',
                                    line: i,
                                    value: Number(getKursPajak) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                                })
                                var setFakturPajakBounded = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                                    line: i,
                                    value: Number(getKursPajak) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                                })
                                var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_me_ppn_idr',
                                    line: i,
                                    value: 0,
                                })
                            }

                            rec.commitLine('item', i)
                        }

                    }

                } catch (error) {

                }
            }

        }



        var getOtherF = rec.getCurrentSublistValue('item', 'custcol_me_other_final');
        var getOtherP = rec.getCurrentSublistValue('item', 'custcol_me_others_proforma');
        var getOthRateF = rec.getCurrentSublistValue('item', 'custcol_me_others_rate_final');
        var getOthRateP = rec.getCurrentSublistValue('item', 'custcol_me_others_rate_proforma');
        var getPreF = rec.getCurrentSublistValue('item', 'custcol_me_premium_final');
        var getPreP = rec.getCurrentSublistValue('item', 'custcol_me_premium_proforma');
        var getLmeF = rec.getCurrentSublistValue('item', 'custcol_me_lme_final');
        var getLmeP = rec.getCurrentSublistValue('item', 'custcol_me_lme_proforma');
        var getMjpF = rec.getCurrentSublistValue('item', 'custcol_me_mjp_price');
        var getMjpP = rec.getCurrentSublistValue('item', 'custcol_me_mjp_proforma');

        log.debug('INI KALAU SEMUA VALUE LMEBLABLABL 0', [getOtherF, getOtherP, getOthRateF, getOthRateP, getPreF, getPreP, getLmeF, getLmeP, getMjpF, getMjpP])

        if ((((fieldId == "custcol_me_kurs_kesepakatan") || ((fieldId == "taxcode")) || (fieldId == "quantity") || (fieldId == "custcol_me_lme_final") || (fieldId == "custcol_me_premium_final") || (fieldId == "custcol_me_mjp_price") || (fieldId == "custcol_me_other_final") || (fieldId == "custcol_me_others_rate_final")))) {

            var getKursPajak = rec.getValue('custbody_me_ex_rate_pjk')

            // var lineCount = rec.getLineCount('item');

            // for (let i = 0; i < lineCount; i++) {

            var getLme = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_lme_final',
                // line: i
            });
            var getPremium = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_premium_final',
                // line: i
            });
            var getMjp = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_mjp_price',
                // line: i
            });
            var getOther = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_other_final',
                // line: i
            });
            var getQuantity = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                // line: i
            });
            var getKesepakatanKurs = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_kurs_kesepakatan',
                // line: i
            });
            var getTaxCodeId = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'taxcode',
                // line: i
            })
            var getTaxCode = rec.getCurrentSublistText({
                sublistId: 'item',
                fieldId: 'taxcode',
                // line: i
            })
            var getOtherRate = rec.getCurrentSublistValue('item', "custcol_me_others_rate_final")
            // var getTaxRate = rec.getCurrentSublistText({
            //     sublistId: 'item',
            //     fieldId: 'taxrate1',
            //     // line: i
            // })
            if (getTaxCodeId) {
                var getTaxRateText = search.lookupFields({
                    type: search.Type.SALES_TAX_ITEM,
                    id: getTaxCodeId,
                    columns: ['rate']
                });

                log.debug('getTaxRateText', getTaxRateText.rate)

                var getTaxRate = parseFloat(getTaxRateText.rate)

                log.debug("tax rate", getTaxRate)
                if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                    })
                }
                if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'No' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: (Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * ((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp))),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: (Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * ((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp) + Number(!getOther ? 0 : getOther)) * Number(getQuantity)),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: (Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * ((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp)) + Number(!getOther ? 0 : getOther)) * Number(getQuantity) * (0.11),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: (Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * ((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp)) + Number(!getOther ? 0 : getOther)) * Number(getQuantity) * (0.11),
                    })
                }
                if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'No' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: 0,
                    })
                }
                if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (0.11),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: 0,
                    })
                }
                if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (!getTaxCode.includes('PPN 0%') || !getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                    })
                }
                if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'No' && (!getTaxCode.includes('PPN 0%') || !getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: 0,
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: 0,
                    })
                }
                if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (0.11),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: 0,
                    })
                }
                if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'No' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: 0,
                    })
                }
            }


            // }
        }

        if ((fieldId == "rate") || ((fieldId == "taxcode") && getOtherF == 0 && getOtherP == 0 && getOthRateF == 0 && getOthRateP == 0 && getPreF == 0 && getPreP == 0 && getLmeF == 0 && getLmeP == 0 && getMjpF == 0 && getMjpP == 0)) {

            log.debug('INI KALAU SEMUA VALUE LMEBLABLABL 0', 'TEST 123123123')
            var getKursPajak = rec.getValue('custbody_me_ex_rate_pjk')

            // var lineCount = rec.getLineCount('item');

            // for (let i = 0; i < lineCount; i++) {
            var getLme = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_lme_final',
                // line: i
            });
            var getPremium = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_premium_final',
                // line: i
            });
            var getMjp = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_mjp_price',
                // line: i
            });
            var getOther = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_other_final',
                // line: i
            });
            var getQuantity = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                // line: i
            });
            var getKesepakatanKurs = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_kurs_kesepakatan',
                // line: i
            });
            var getTaxCodeId = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'taxcode',
                // line: i
            })
            var getTaxCode = rec.getCurrentSublistText({
                sublistId: 'item',
                fieldId: 'taxcode',
                // line: i
            })
            var getUnitPrice = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                // line: i
            })
            // var getTaxRate = rec.getCurrentSublistText({
            //     sublistId: 'item',
            //     fieldId: 'taxrate1',
            //     // line: i
            // })
            if (getTaxCodeId) {
                var getTaxRateText = search.lookupFields({
                    type: search.Type.SALES_TAX_ITEM,
                    id: getTaxCodeId,
                    columns: ['rate']
                });

                log.debug('getTaxRateText', getTaxRateText.rate)

                var getTaxRate = parseFloat(getTaxRateText.rate)

                log.debug("getUnitPrice", getUnitPrice)
                log.debug("tax rate", getTaxRate)
                if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: Number(getUnitPrice),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: Number(getUnitPrice) * Number(getQuantity),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: Number((Number(getUnitPrice)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100)).toFixed(2),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: Number((Number(getUnitPrice)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100)).toFixed(2),
                    })
                }
                if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'No' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: (Number(getUnitPrice)),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: (Number(getUnitPrice)) * Number(getQuantity),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: Number(Number(getUnitPrice)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100).toFixed(2),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: Number(Number(getUnitPrice)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100).toFixed(2),
                    })
                }
                if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'No' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: 0,
                    })
                }
                if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: Number(getUnitPrice),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: Number(getUnitPrice) * Number(getQuantity),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: Number((Number(getUnitPrice)) * Number(getQuantity) * 0.11),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: 0,
                    })
                }
                if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (!getTaxCode.includes('PPN 0%') || !getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: Number(getKursPajak) * (Number(getUnitPrice)),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: Number(getKursPajak) * (Number(getUnitPrice)) * Number(getQuantity),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: Number(getKursPajak) * (Number(getUnitPrice)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: Number(getKursPajak) * (Number(getUnitPrice)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
                    })
                }
                if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'Yes' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: Number(getKursPajak) * (Number(getUnitPrice)),
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: Number(getKursPajak) * (Number(getUnitPrice)) * Number(getQuantity),
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: Number(getKursPajak) * (Number(getUnitPrice)) * Number(getQuantity) * (0.11),
                    })
                    var setTaxAmt = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        // line: i,
                        value: 0,
                    })
                }
                if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'No' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: 0,
                    })
                }
                if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'No' && (getTaxCode.includes('PPN 0%') && getTaxCode.includes('UNDEF'))) {
                    var setUnitPriceBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_unit_price_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBounded = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                        // line: i,
                        value: 0,
                    })
                    var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_ppn_idr',
                        // line: i,
                        value: 0,
                    })
                }
            }


            // }
        }

        // }
        // if ((((fieldId == "rate")))) {

        //     var getKursPajak = rec.getValue('custbody_me_ex_rate_pjk')

        //     // var lineCount = rec.getLineCount('item');

        //     // for (let i = 0; i < lineCount; i++) {

        //     var getLme = rec.getCurrentSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'custcol_me_lme_final',
        //         // line: i
        //     });
        //     var getPremium = rec.getCurrentSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'custcol_me_premium_final',
        //         // line: i
        //     });
        //     var getMjp = rec.getCurrentSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'custcol_me_mjp_price',
        //         // line: i
        //     });
        //     var getOther = rec.getCurrentSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'custcol_me_other_final',
        //         // line: i
        //     });
        //     var getQuantity = rec.getCurrentSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'quantity',
        //         // line: i
        //     });
        //     var getKesepakatanKurs = rec.getCurrentSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'custcol_me_kurs_kesepakatan',
        //         // line: i
        //     });
        //     var getTaxCodeId = rec.getCurrentSublistValue({
        //         sublistId: 'item',
        //         fieldId: 'taxcode',
        //         // line: i
        //     })
        //     var getTaxCode = rec.getCurrentSublistText({
        //         sublistId: 'item',
        //         fieldId: 'taxcode',
        //         // line: i
        //     })
        //     var getTaxCode = rec.getCurrentSublistText({
        //         sublistId: 'item',
        //         fieldId: 'taxcode',
        //         // line: i
        //     })
        //     var getOtherRate = rec.getCurrentSublistValue('item', "custcol_me_others_rate_final")
        //     // var getTaxRate = rec.getCurrentSublistText({
        //     //     sublistId: 'item',
        //     //     fieldId: 'taxrate1',
        //     //     // line: i
        //     // })
        //     if (getTaxCodeId) {
        //         var getTaxRateText = search.lookupFields({
        //             type: search.Type.SALES_TAX_ITEM,
        //             id: getTaxCodeId,
        //             columns: ['rate']
        //         });

        //         log.debug('getTaxRateText', getTaxRateText.rate)

        //         var getTaxRate = parseFloat(getTaxRateText.rate)

        //         log.debug("tax rate", getTaxRate)
        //         if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'Yes') {
        //             var setUnitPriceBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_unit_price_bounded_zone',
        //                 // line: i,
        //                 value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
        //             })
        //             var setFakturPajakBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_faktur_pajak_bounded_zone',
        //                 // line: i,
        //                 value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
        //             })
        //             var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_ppn_idr',
        //                 // line: i,
        //                 value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
        //             })
        //             var setTaxAmt = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'tax1amt',
        //                 // line: i,
        //                 value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
        //             })
        //         }
        //         if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'No' && (!getTaxCode.includes('PPN 0%') && !getTaxCode.includes('UNDEF'))) {
        //             var setUnitPriceBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_unit_price_bounded_zone',
        //                 // line: i,
        //                 value: (Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * ((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp)) + Number(!getOther ? 0 : getOther)),
        //             })
        //             var setFakturPajakBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_faktur_pajak_bounded_zone',
        //                 // line: i,
        //                 value: (Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * ((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp) + Number(!getOther ? 0 : getOther)) * Number(getQuantity)),
        //             })
        //             var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_ppn_idr',
        //                 // line: i,
        //                 value: (Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * ((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp)) + Number(!getOther ? 0 : getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
        //             })
        //             var setTaxAmt = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'tax1amt',
        //                 // line: i,
        //                 value: (Number(!getKesepakatanKurs ? 0 : getKesepakatanKurs) + Number(!getOtherRate ? 0 : getOtherRate)) * ((Number(!getLme ? 0 : getLme) + Number(!getPremium ? 0 : getPremium) + Number(!getMjp ? 0 : getMjp)) + Number(!getOther ? 0 : getOther)) * Number(getQuantity) * (parseFloat(getTaxRate) / 100),
        //             })
        //         }
        //         if (getCurrency.includes('IDR') && rec.getText('custbody_me_bounded_zone') == 'No' && (getTaxCode.includes('PPN 0%') || getTaxCode.includes('UNDEF'))) {
        //             var setUnitPriceBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_unit_price_bounded_zone',
        //                 // line: i,
        //                 value: 0,
        //             })
        //             var setFakturPajakBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_faktur_pajak_bounded_zone',
        //                 // line: i,
        //                 value: 0,
        //             })
        //             var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_ppn_idr',
        //                 // line: i,
        //                 value: 0,
        //             })
        //         }
        //         if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'Yes') {
        //             var setUnitPriceBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_unit_price_bounded_zone',
        //                 // line: i,
        //                 value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
        //             })
        //             var setFakturPajakBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_faktur_pajak_bounded_zone',
        //                 // line: i,
        //                 value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
        //             })
        //             var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_ppn_idr',
        //                 // line: i,
        //                 value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (11 / 100),
        //             })
        //             var setTaxAmt = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'tax1amt',
        //                 // line: i,
        //                 value: (Number(getKursPajak) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity) * (11 / 100),
        //             })
        //         }
        //         if (getCurrency.includes('US') && rec.getText('custbody_me_bounded_zone') == 'No') {
        //             var setUnitPriceBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_unit_price_bounded_zone',
        //                 // line: i,
        //                 value: (Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)),
        //             })
        //             var setFakturPajakBounded = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_faktur_pajak_bounded_zone',
        //                 // line: i,
        //                 value: (Number(getKesepakatanKurs) + Number(getOtherRate)) * (Number(getLme) + Number(getPremium) + Number(getMjp) + Number(getOther)) * Number(getQuantity),
        //             })
        //             var setFakturPajakBoundedPpn = rec.setCurrentSublistValue({
        //                 sublistId: 'item',
        //                 fieldId: 'custcol_me_ppn_idr',
        //                 // line: i,
        //                 value: 0,
        //             })
        //         }
        //     }


        //     // }
        // }


    }


    function sublistChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        if (sublistId == 'item') {

            var getKursPajak = rec.getValue('custbody_me_ex_rate_pjk')

            var lineCount = rec.getLineCount({ sublistId: sublistId });

            // for (let i = 0; i < lineCount; i++) {
            var getTotalAmount = rec.getSublistValue({
                sublistId: sublistId,
                fieldId: 'amount',
                line: i
            });

            var setFakturPajakBounded = rec.setSublistValue({
                sublistId: sublistId,
                fieldId: 'custcol_me_faktur_pajak_bounded_zone',
                line: i,
                value: Number(getKursPajak) * Number(getTotalAmount),
            })

            // }
        }


    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        // sublistChanged: sublistChanged
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/record', './lib/moment.min.js', 'N/search'], function (record, moment, search) {


    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistID = context.sublistId;
        var fieldID = context.fieldId;


        var mjpArr = [];
        var premiumArr = [];
        var lmeArr = [];
        var kursArr = [];
        // log.debug('fieldID', fieldID)
        var kursKesepaaktanVal = 1;
        if (sublistID == "item") {

            var getProformaFinal = rec.getValue('custbody_me_proforma_final')
            var getLoc = rec.getValue('location')

            // log.debug('getProformaId', getProformaFinal)
            var getCatPrice = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_price_category_item',
            });

            // var getProformaOrFinal = rec.getValue('custbody_me_proforma_final');
            var getItem = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
            });

            if (fieldID == "item") {

                var set_loc_item = rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    value: getLoc
                });
            }

            if (getCatPrice != "") {
                if (fieldID == 'custcol_me_kurs_kesepakatan_bulan') {
                    var lmeExecuted = rec.setValue('custbody_me_ex_lme_bln', true)
                }
                var loadCatItem = record.load({
                    type: "customrecord_me_csrec_master_category_sl",
                    id: getCatPrice,
                    // isDynamic: true,
                });

                var isFromLme = false;

                // log.debug('Getcatprice ' + sublistID + ' | ' + fieldID, loadCatItem)


                if (fieldID == "custcol_me_price_category_item" || fieldID == "item") {
                    try {
                        // log.debug('category ID', getCatPrice)
                        var getCustomer = rec.getValue('entity');
                        var getItemLine = rec.getCurrentSublistValue('item', 'item');

                        var getLineCountPremium = loadCatItem.getLineCount('recmachcustrecord_me_master_pricing_number')

                        for (let i = 0; i < getLineCountPremium; i++) {
                            var bulan_premium = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_pricing_number',
                                fieldId: 'custrecord_me_bulan_premium',
                                line: i
                            })
                            var bulan_customer = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_pricing_number',
                                fieldId: 'custrecord_me_customer_premium',
                                line: i
                            })
                            var bulan_item = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_pricing_number',
                                fieldId: 'custrecord_me_item_premium',
                                line: i
                            })

                            var harga_premium = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_pricing_number',
                                fieldId: 'custrecord_me_kurs__premium',
                                line: i
                            })

                            if (getCustomer == bulan_customer && getItemLine == bulan_item) {
                                premiumArr.push({
                                    bulan_premium: bulan_premium,
                                    bulan_customer: bulan_customer,
                                    bulan_item: bulan_item,
                                    // bulan_premium_text: bulan_premium_text,
                                    harga_premium: harga_premium,
                                });
                                break;
                            }

                        }
                        try {

                            // log.debug('premiumVal', premiumVal)
                            log.debug('premiumArr', premiumArr[0])

                            if (getProformaFinal == '1' && premiumArr.length > 0) {
                                var setPremium = rec.setCurrentSublistValue('item', "custcol_me_premium_proforma", premiumArr[0].harga_premium, true)
                            } else if (getProformaFinal == '2' && premiumArr.length > 0) {
                                var setPremiumFinal = rec.setCurrentSublistValue('item', "custcol_me_premium_final", premiumArr[0].harga_premium, true)
                            }
                            // var setKursKesepakatan = rec.setCurrentSublistValue('item', "custcol_me_kurs_kesepakatan", 0, true);

                            // var setMjp = rec.setCurrentSublistValue('item', "custcol_me_mjp_proforma", 0, true)
                            // var setMjpFinal = rec.setCurrentSublistValue('item', "custcol_me_mjp_price", 0, true)
                            // var setLme = rec.setCurrentSublistValue('item', "custcol_me_lme_proforma", 0, true)
                            // var setLmeFinal = rec.setCurrentSublistValue('item', "custcol_me_lme_final", 0, true)
                            // var setBulanKesepakatan = rec.setCurrentSublistValue('item', "custcol_me_kurs_kesepakatan_bulan", '', true)
                            // var setBulanLme = rec.setCurrentSublistValue('item', "custcol_me_lme_bulan", '', true)
                            // var setBulanMjp = rec.setCurrentSublistValue('item', "custcol_me_mjp_bulan", '', true)


                        } catch (error) {
                            var setPremium = rec.setCurrentSublistValue('item', "custcol_me_premium_proforma", 0, true)
                            var setPremium = rec.setCurrentSublistValue('item', "custcol_me_premium_final", 0, true)
                            // var setMjp = rec.setCurrentSublistValue('item', "custcol_me_mjp_proforma", 0, true)
                            // var setLme = rec.setCurrentSublistValue('item', "custcol_me_mjp_price", 0, true)
                            // var setLme = rec.setCurrentSublistValue('item', "custcol_me_lme_proforma", 0, true)
                            // var setLme = rec.setCurrentSublistValue('item', "custcol_me_lme_final", 0, true)
                            // var setBulanKesepakatan = rec.setCurrentSublistValue('item', "custcol_me_kurs_kesepakatan_bulan", '', true)
                            // var setBulanLme = rec.setCurrentSublistValue('item', "custcol_me_lme_bulan", '', true)
                            // var setBulanMjp = rec.setCurrentSublistValue('item', "custcol_me_mjp_bulan", '', true)
                        }
                    } catch (error) {
                        log.debug('error', error)
                    }
                }
                if (fieldID == "custcol_me_lme_bulan") {
                    var getBulan = rec.getCurrentSublistValue('item', 'custcol_me_lme_bulan')
                    try {


                        var getBulan = rec.getCurrentSublistValue('item', 'custcol_me_lme_bulan')
                        var getLineCountLme = loadCatItem.getLineCount('recmachcustrecord_me_master_pricing_number_3')

                        for (let i = 0; i < getLineCountLme; i++) {
                            var bulan_lme = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_pricing_number_3',
                                fieldId: 'custrecord_me_lme_bulan',
                                line: i
                            })

                            var harga_lme = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_pricing_number_3',
                                fieldId: 'custrecord_me_harga_lme',
                                line: i
                            })

                            var harga_kurs = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_price_number_4',
                                fieldId: 'custrecord_me_nilai_kurs',
                                line: i
                            })

                            lmeArr.push({
                                bulan_lme: bulan_lme,
                                // bulan_lme_text: bulan_lme_text,
                                harga_lme: harga_lme,
                                harga_kurs: harga_kurs,
                            })
                        }
                        log.debug('LME Array', lmeArr)

                        var getLmeValue = rec.getCurrentSublistValue('item', 'custcol_me_lme_bulan');

                        var arrId = ''

                        for (let i = 0; i < lmeArr.length; i++) {
                            if (getLmeValue == lmeArr[i].bulan_lme) {
                                arrId = i
                            }

                        }

                        // var setKesepakatanBulan = rec.getCurrentSublistValue('custcol_me_kurs_kesepakatan_bulan', getBulan)
                        try {
                            if (getProformaFinal == '1') {

                                var setLme = rec.setCurrentSublistValue('item', "custcol_me_lme_proforma", arrId?lmeArr[arrId].harga_lme:0, true)
                                // var setKesepakatanBulan = rec.setCurrentSublistValue('item', 'custcol_me_kurs_kesepakatan_bulan', getBulan, true)
                                // var setKesepakatanBulanAmt = rec.setCurrentSublistValue('item', 'custcol_me_kurs_kesepakatan_proforma', lmeArr[arrId].harga_kurs, true)
                            } else if (getProformaFinal == '2') {
                                var setLme = rec.setCurrentSublistValue('item', "custcol_me_lme_final", arrId?lmeArr[arrId].harga_lme:0, true)
                                // var setKesepakatanBulan = rec.setCurrentSublistValue('item', 'custcol_me_kurs_kesepakatan_bulan', getBulan, true)
                                // var setKesepakatanBulanAmt = rec.setCurrentSublistValue('item', 'custcol_me_kurs_kesepakatan', lmeArr[arrId].harga_kurs, true)
                            }
                            isFromLme = true;
                        } catch (error) {
                            if (getProformaFinal == '1') {

                                var setLme = rec.setCurrentSublistValue('item', "custcol_me_lme_proforma", 0, true)
                                var setKesepakatanBulan = rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_me_kurs_kesepakatan_bulan', value: getBulan, ignoreFieldChange: true })
                                // var setKesepakatanBulanAmt = rec.setCurrentSublistValue('item', 'custcol_me_kurs_kesepakatan_proforma', lmeArr[arrId].harga_kurs, true)
                            } else if (getProformaFinal == '2') {
                                var setLme = rec.setCurrentSublistValue('item', "custcol_me_lme_final", 0, true)
                                // var setKesepakatanBulan = rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_me_kurs_kesepakatan_bulan', value: getBulan, ignoreFieldChange: true })
                                // var setKesepakatanBulanAmt = rec.setCurrentSublistValue('item', 'custcol_me_kurs_kesepakatan', lmeArr[arrId].harga_kurs, true)
                            }
                            log.debug('error LME', error)
                            isFromLme = true;
                        }
                        // log.debug('rec.getValue(custbody_me_ex_lme_bln)',rec.getValue('custbody_me_ex_lme_bln'))
                        var lmeExecuted = rec.setValue('custbody_me_ex_lme_bln', false)
                    } catch (error) {
                        var setKesepakatanBulan = rec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_me_kurs_kesepakatan_bulan', value: getBulan, ignoreFieldChange: true })
                        log.debug('error', error)
                    }
                }
                if (fieldID == "custcol_me_mjp_bulan") {

                    try {


                        var getLineCountMjp = loadCatItem.getLineCount('recmachcustrecord_me_master_prcing_number_2')

                        for (let i = 0; i < getLineCountMjp; i++) {
                            var bulan_mjp = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_prcing_number_2',
                                fieldId: 'custrecord_me_mjp_bulan',
                                line: i
                            })

                            var harga_mjp = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_prcing_number_2',
                                fieldId: 'custrecord_me_harga_mjp',
                                line: i
                            })

                            mjpArr.push({
                                bulan_mjp: bulan_mjp,
                                // bulan_mjp_text: bulan_mjp_text,
                                harga_mjp: harga_mjp,
                            })
                        }

                        log.debug('MJP arr', mjpArr)

                        var getMjpValue = rec.getCurrentSublistValue('item', 'custcol_me_mjp_bulan');
                        var arrId = ''

                        for (let i = 0; i < mjpArr.length; i++) {
                            if (getMjpValue == mjpArr[i].bulan_mjp) {
                                arrId = i
                            }

                        }

                        try {
                            if (getProformaFinal == '1') {

                                var setMjp = rec.setCurrentSublistValue('item', "custcol_me_mjp_proforma", mjpArr[arrId].harga_mjp, true)
                            } else if (getProformaFinal == '2') {
                                var setLme = rec.setCurrentSublistValue('item', "custcol_me_mjp_price", mjpArr[arrId].harga_mjp, true)
                            }

                        } catch (error) {
                            if (getProformaFinal == '1') {

                                var setMjp = rec.setCurrentSublistValue('item', "custcol_me_mjp_proforma", 0, true)
                            } else if (getProformaFinal == '2') {
                                var setLme = rec.setCurrentSublistValue('item', "custcol_me_mjp_price", 0, true)
                            }
                            log.debug('error', error)
                        }
                    } catch (error) {
                        log.debug('error', error)
                    }

                }
                if (fieldID == "custcol_me_kurs_kesepakatan_bulan" ) {

                    try {


                        var getLineCountKurs = loadCatItem.getLineCount('recmachcustrecord_me_master_price_number_4')

                        for (let i = 0; i < getLineCountKurs; i++) {
                            var bulan_kurs = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_price_number_4',
                                fieldId: 'custrecord_me_bulan_kurs_sales',
                                line: i
                            })
                            var bulan_kurs_text = loadCatItem.getSublistText({
                                sublistId: 'recmachcustrecord_me_master_price_number_4',
                                fieldId: 'custrecord_me_bulan_kurs_sales',
                                line: i
                            })
                            var harga_kurs = loadCatItem.getSublistValue({
                                sublistId: 'recmachcustrecord_me_master_price_number_4',
                                fieldId: 'custrecord_me_nilai_kurs',
                                line: i
                            })

                            kursArr.push({
                                bulan_kurs: bulan_kurs,
                                bulan_kurs_text: bulan_kurs_text,
                                harga_kurs: harga_kurs,
                            })
                        }

                        log.debug('kurs', kursArr)

                        var getKursValue = rec.getCurrentSublistValue('item', 'custcol_me_kurs_kesepakatan_bulan');
                        var arrId = ''

                        for (let i = 0; i < kursArr.length; i++) {
                            if (getKursValue == kursArr[i].bulan_kurs) {
                                arrId = i
                            }
                        }

                        try {

                            if (rec.getValue('custbody_me_proforma_final') == "1") {
                                var setKursKesepakatan = rec.setCurrentSublistValue('item', "custcol_me_kurs_kesepakatan_proforma", kursArr[arrId].harga_kurs, true);
                                var setKursKesepakatan = rec.setCurrentSublistValue('item', "custcol_me_kurs_kesepakatan", 0, true);
                                kursKesepaaktanVal = kursArr[arrId].harga_kurs

                            } else if (rec.getValue('custbody_me_proforma_final') == "2") {
                                var setKursKesepakatan = rec.setCurrentSublistValue('item', "custcol_me_kurs_kesepakatan", kursArr[arrId].harga_kurs, true);
                                var setKursKesepakatan = rec.setCurrentSublistValue('item', "custcol_me_kurs_kesepakatan_proforma", 0, true);
                                kursKesepaaktanVal = kursArr[arrId].harga_kurs
                            }

                        } catch (error) {
                            if (rec.getValue('custbody_me_proforma_final') == "1") {
                                var setKursKesepakatan = rec.setCurrentSublistValue('item', "custcol_me_kurs_kesepakatan_proforma", 0, true);
                                kursKesepaaktanVal = kursArr[arrId].harga_kurs

                            } else if (rec.getValue('custbody_me_proforma_final') == "2") {
                                var setKursKesepakatan = rec.setCurrentSublistValue('item', "custcol_me_kurs_kesepakatan", 0, true);
                                kursKesepaaktanVal = kursArr[arrId].harga_kurs
                            }
                            log.debug('error', error)
                        }
                    } catch (error) {
                        log.debug('error', error)
                    }
                }

            }


            var getCurrency = rec.getText('currency');
            var getBoundedZone = rec.getText('custbody_me_bounded_zone')
            var getKursPajak = rec.getValue('custbody_me_ex_rate_pjk');

            var getQuantity = rec.getCurrentSublistValue('item', "quantity")

            var getLmeFinal = rec.getCurrentSublistValue('item', "custcol_me_lme_final")
            var getPremiumFinal = rec.getCurrentSublistValue('item', "custcol_me_premium_final")
            var getMjpFinal = rec.getCurrentSublistValue('item', "custcol_me_mjp_price")
            var getOtherFinalPremium = rec.getCurrentSublistValue('item', "custcol_me_other_final")
            var getKursKesepakatan = rec.getCurrentSublistValue('item', "custcol_me_kurs_kesepakatan")
            var getOtherRate = rec.getCurrentSublistValue('item', "custcol_me_others_rate_final")

            var getLmeProforma = rec.getCurrentSublistValue('item', "custcol_me_lme_proforma")
            var getPremiumProforma = rec.getCurrentSublistValue('item', "custcol_me_premium_proforma")
            var getMjpProforma = rec.getCurrentSublistValue('item', "custcol_me_mjp_proforma")
            var getOtherProformalPremium = rec.getCurrentSublistValue('item', "custcol_me_others_proforma")
            var getKursKesepakatanProforma = rec.getCurrentSublistValue('item', "custcol_me_kurs_kesepakatan_proforma")
            var getOtherRateProforma = rec.getCurrentSublistValue('item', "custcol_me_others_rate_proforma")

            var getTaxRate = rec.getCurrentSublistValue('item', 'taxrate1')

            // if (getLmeFinal && getPremiumFinal && getMjpFinal) {

            if (getCurrency.includes('IDR')) {

                if (getBoundedZone == 'Yes') {
                    if (fieldID == "custcol_me_lme_final") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_premium_final") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_mjp_price") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_other_final") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_kurs_kesepakatan") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_others_rate_final") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak) + Number(getOtherRate)), true)
                    }
                    if ((fieldID == "currency")) {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak) + Number(getOtherRate)), true)
                    }
                } else {
                    if (fieldID == "custcol_me_lme_final") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_premium_final") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_mjp_price") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_other_final") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_kurs_kesepakatan") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan) + Number(getOtherRate)), true)
                    }
                    if (fieldID == "custcol_me_others_rate_final") {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan) + Number(getOtherRate)), true)
                    }
                    if ((fieldID == "currency")) {
                        var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan) + Number(getOtherRate)), true)
                    }
                }
            } else if (!getCurrency.includes('IDR')) {
                var getKursKesepakatan = rec.getCurrentSublistValue('item', "custcol_me_kurs_kesepakatan")
                if (fieldID == "custcol_me_lme_final") {
                    var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)), true)
                }
                if (fieldID == "custcol_me_premium_final") {
                    var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)), true)
                }
                if (fieldID == "custcol_me_mjp_price") {
                    var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)), true)
                }
                if (fieldID == "custcol_me_other_final") {
                    var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)), true)
                }
                if (fieldID == "custcol_me_others_rate_final") {
                    var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)), true)
                }
                if ((fieldID == "currency")) {
                    var setUnitPrice = rec.setCurrentSublistValue('item', "rate", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)), true)
                }
            }
            if ((fieldID == "custcol_me_lme_final" || fieldID == "custcol_me_premium_final" || fieldID == "custcol_me_mjp_price" || fieldID == "custcol_me_other_final" || fieldID == "custcol_me_kurs_kesepakatan" || fieldID == "custcol_me_others_rate_final" || fieldID == "currency")) {
                if (getBoundedZone == "No") {
                    var setUnitPriceUsd = rec.setCurrentSublistValue('item', "custcol_me_unit_price_final_usd", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)), true)
                    var setAmountUsd = rec.setCurrentSublistValue('item', "custcol_me_amount_final_usd", ((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * Number(getQuantity)), true)
                    // var setAmountGrossUsd = rec.setCurrentSublistValue('item', "custcol_me_amount_final_usd", (((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * Number(getQuantity)) * parseFloat(getTaxRate)/100) + (((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * Number(getQuantity))), true)
                    var setUnitPriceIdr = rec.setCurrentSublistValue('item', "custcol_me_unit_price_final_idr", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan ? getKursKesepakatan : 0) + Number(getOtherRate ? getOtherRate : 0)), true)
                    var setAmountIdr = rec.setCurrentSublistValue('item', "custcol_me_amount_final_idr", (((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan ? getKursKesepakatan : 0) + Number(getOtherRate ? getOtherRate : 0))) * Number(getQuantity)), true)
                    var setAmountGrossIdr = rec.setCurrentSublistValue('item', "custcol_me_gross_amt_idr_final", ((((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan ? getKursKesepakatan : 0) + Number(getOtherRate ? getOtherRate : 0))) * Number(getQuantity))) + ((((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursKesepakatan ? getKursKesepakatan : 0) + Number(getOtherRate ? getOtherRate : 0))) * Number(getQuantity)) * parseFloat(getTaxRate)/100), true)
                    log.debug('getKursKesepakatan - getOtherRate', getKursKesepakatan + " - " + getOtherRate)
                }
                if (getBoundedZone == "Yes") {
                    var setUnitPriceUsd = rec.setCurrentSublistValue('item', "custcol_me_unit_price_final_usd", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)), true)
                    var setAmountUsd = rec.setCurrentSublistValue('item', "custcol_me_amount_final_usd", ((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * Number(getQuantity)), true)
                    // var setAmountGrossUsd = rec.setCurrentSublistValue('item', "custcol_me_amount_final_usd", (((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * Number(getQuantity) * parseFloat(getTaxRate)/100) + ((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * Number(getQuantity))), true)
                    var setUnitPriceIdr = rec.setCurrentSublistValue('item', "custcol_me_unit_price_final_idr", (Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak ? getKursPajak : 0) + Number(getOtherRate ? getOtherRate : 0)), true)
                    var setAmountIdr = rec.setCurrentSublistValue('item', "custcol_me_amount_final_idr", (((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak ? getKursPajak : 0) + Number(getOtherRate ? getOtherRate : 0))) * Number(getQuantity)), true)
                    var setAmountGrossIdr = rec.setCurrentSublistValue('item', "custcol_me_gross_amt_idr_final", ((((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak ? getKursPajak : 0) + Number(getOtherRate ? getOtherRate : 0))) * Number(getQuantity) * parseFloat(getTaxRate)/100) + (((Number(getMjpFinal) + Number(getPremiumFinal) + Number(getLmeFinal) + Number(getOtherFinalPremium)) * (Number(getKursPajak ? getKursPajak : 0) + Number(getOtherRate ? getOtherRate : 0))) * Number(getQuantity))), true)
                    log.debug('getKursKesepakatan - getOtherRate', getKursKesepakatan + " - " + getOtherRate)
                }
            }

            if ((fieldID == "custcol_me_lme_proforma" || fieldID == "custcol_me_premium_proforma" || fieldID == "custcol_me_mjp_proforma" || fieldID == "custcol_me_others_proforma" || fieldID == "custcol_me_kurs_kesepakatan_proforma" || fieldID == "custcol_me_others_rate_proforma" || fieldID == "currency")) {
                if (getBoundedZone == "No") {
                    var setUnitPriceUsd = rec.setCurrentSublistValue('item', "custcol_me_unit_price_proforma_usd", (Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)), true)
                    var setAmountUsd = rec.setCurrentSublistValue('item', "custcol_me_amount_proforma_usd", ((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * Number(getQuantity)), true)
                    // var setAmountGrossUsd = rec.setCurrentSublistValue('item', "custcol_me_amount_proforma_usd", ((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * Number(getQuantity)), true)
                    var setUnitPriceIdr = rec.setCurrentSublistValue('item', "custcol_me_unit_price_proforma_idr", (Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * (Number(getKursKesepakatanProforma ? getKursKesepakatanProforma : 0) + Number(getOtherRateProforma ? getOtherRateProforma : 0)), true)
                    var setAmountIdr = rec.setCurrentSublistValue('item', "custcol_me_amount_proforma_idr", (((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * (Number(getKursKesepakatanProforma ? getKursKesepakatanProforma : 0) + Number(getOtherRateProforma ? getOtherRateProforma : 0))) * Number(getQuantity)), true)
                    var setAmountGrossIdr = rec.setCurrentSublistValue('item', "custcol_me_gross_amt_idr_proforma", ((((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * (Number(getKursKesepakatanProforma ? getKursKesepakatanProforma : 0) + Number(getOtherRateProforma ? getOtherRateProforma : 0))) * Number(getQuantity)) * parseFloat(getTaxRate)/100) + ((((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * (Number(getKursKesepakatanProforma ? getKursKesepakatanProforma : 0) + Number(getOtherRateProforma ? getOtherRateProforma : 0))) * Number(getQuantity))), true)
                    log.debug('getKursKesepakatan - getOtherRateProforma', getKursKesepakatan + " - " + getOtherRateProforma)
                }
                if (getBoundedZone == "Yes") {
                    var setUnitPriceUsd = rec.setCurrentSublistValue('item', "custcol_me_unit_price_proforma_usd", (Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)), true)
                    var setAmountUsd = rec.setCurrentSublistValue('item', "custcol_me_amount_proforma_usd", ((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * Number(getQuantity)), true)
                    // var setAmountGrossUsd = rec.setCurrentSublistValue('item', "custcol_me_amount_proforma_usd", ((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * Number(getQuantity)), true)
                    var setUnitPriceIdr = rec.setCurrentSublistValue('item', "custcol_me_unit_price_proforma_idr", (Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * (Number(getKursPajak ? getKursPajak : 0) + Number(getOtherRateProforma ? getOtherRateProforma : 0)), true)
                    var setAmountIdr = rec.setCurrentSublistValue('item', "custcol_me_amount_proforma_idr", (((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * (Number(getKursPajak ? getKursPajak : 0) + Number(getOtherRateProforma ? getOtherRateProforma : 0))) * Number(getQuantity)), true)
                    var setAmountGrossIdr = rec.setCurrentSublistValue('item', "custcol_me_gross_amt_idr_proforma", ((((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * (Number(getKursPajak ? getKursPajak : 0) + Number(getOtherRateProforma ? getOtherRateProforma : 0))) * Number(getQuantity)) * parseFloat(getTaxRate)/100) + (((Number(getMjpProforma) + Number(getPremiumProforma) + Number(getLmeProforma) + Number(getOtherProformalPremium)) * (Number(getKursPajak ? getKursPajak : 0) + Number(getOtherRateProforma ? getOtherRateProforma : 0))) * Number(getQuantity)), true)
                    log.debug('getKursKesepakatan - getOtherRateProforma', getKursKesepakatan + " - " + getOtherRateProforma)
                }
            }


            var lmeExecuted = rec.setValue('custbody_me_ex_lme_bln', false)
        }

        if (fieldID == "custbody_me_proforma_final") {
            var getIsCreate = rec.getValue('custbody_me_is_create');
            if (getIsCreate == 'true') {

                if (fieldID == "custbody_me_proforma_final" && getProformaFinal == '2') {
                    var lineCount = rec.getLineCount('item')

                    for (let i = 0; i < lineCount; i++) {
                        rec.selectLine('item', i);
                        var get_premium_proforma = rec.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_premium_proforma',
                        });
                        var get_mjp_proforma = rec.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_mjp_proforma',
                        });
                        var get_lme_proforma = rec.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_lme_proforma',
                        });
                        var set_premium_final = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_premium_final',
                            value: get_premium_proforma,
                            ignoreFieldChange: true
                        });
                        var set_mjp_final = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_mjp_price',
                            value: get_mjp_proforma,
                            ignoreFieldChange: true
                        });
                        var set_lme_final = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_lme_final',
                            value: get_lme_proforma,
                            ignoreFieldChange: true
                        });
                        var set_premium_proforma = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_premium_proforma',
                            value: 0,
                            ignoreFieldChange: true
                        });
                        var set_mjp_proforma = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_mjp_proforma',
                            value: 0,
                            ignoreFieldChange: true
                        });
                        var set_lme_proforma = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_lme_proforma',
                            value: 0,
                            ignoreFieldChange: true
                        });



                        rec.commitLine('item', i)

                    }
                }
                if (fieldID == "custbody_me_proforma_final" && getProformaFinal == '1') {
                    var lineCount = rec.getLineCount('item')

                    for (let i = 0; i < lineCount; i++) {
                        rec.selectLine('item', i);
                        var get_premium_final = rec.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_premium_final',
                        });
                        var get_mjp_final = rec.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_mjp_price',
                        });
                        var get_lme_final = rec.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_lme_final',
                        });
                        var set_premium_proforma = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_premium_proforma',
                            value: get_premium_final,
                            // ignoreFieldChange: true
                        });
                        var set_mjp_proforma = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_mjp_proforma',
                            value: get_mjp_final,
                            // ignoreFieldChange: true
                        });
                        var set_lme_proforma = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_lme_proforma',
                            value: get_lme_final,
                            // ignoreFieldChange: true
                        });
                        var set_premium_final = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_premium_final',
                            value: 0,
                            // ignoreFieldChange: true
                        });
                        var set_mjp_final = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_mjp_price',
                            value: 0,
                            // ignoreFieldChange: true
                        });
                        var set_lme_final = rec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_me_lme_final',
                            value: 0,
                            // ignoreFieldChange: true
                        });

                        rec.commitLine('item', i)

                    }
                }
            }
        }
    }




    return {
        // sublistChanged: sublistChanged,
        // pageInit: pageInit,
        fieldChanged: fieldChanged,
    }
});

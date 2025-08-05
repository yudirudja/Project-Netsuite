/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(['N/ui/serverWidget', 'N/render', 'N/record', './config/me_config_yudi.js', 'N/file', './lib/moment.min.js', 'N/search', 'N/https'], function (serverWidget, render, record, config, file, moment, search, https) {

    function formatNumber(number) {
        // Ensure the input is a number
        log.debug('NUmber', number)
        if (isNaN(number)) {
            return '0.00000';
        }

        // Convert the number to a string with exactly two decimal places
        var parts = Number(number).toFixed(5).split('.');

        // Format the integer part with commas
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Rejoin the integer and decimal parts
        log.debug('parts', parts.join('.'));
        return parts.join('.');
    }
    function formatNumberTwoDec(number) {
        // Ensure the input is a number
        if (isNaN(number)) {
            return '0.00';
        }

        // Convert the number to a string with exactly two decimal places
        var parts = Number(number).toFixed(2).split('.');

        // Format the integer part with commas
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Rejoin the integer and decimal parts
        return parts.join('.');
    }


    function numberToWordsIdr(number) {
        const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

        function terbilang(n) {
            if (n < 12) {
                return satuan[n];
            } else if (n < 20) {
                return satuan[n - 10] + " Belas";
            } else if (n < 100) {
                return satuan[Math.floor(n / 10)] + " Puluh " + satuan[n % 10];
            } else if (n < 200) {
                return "Seratus " + terbilang(n - 100);
            } else if (n < 1000) {
                return satuan[Math.floor(n / 100)] + " Ratus " + terbilang(n % 100);
            } else if (n < 2000) {
                return "Seribu " + terbilang(n - 1000);
            } else if (n < 1000000) {
                return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
            } else if (n < 1000000000) {
                return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
            } else if (n < 1000000000000) {
                return terbilang(Math.floor(n / 1000000000)) + " Milyar " + terbilang(n % 1000000000);
            } else if (n < 1000000000000000) {
                return terbilang(Math.floor(n / 1000000000000)) + " Triliun " + terbilang(n % 1000000000000);
            }
        }

        function decimalToWords(decimalPart) {
            const satuanWithZero = ["Nol", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"];
            let word = "";
            for (let digit of decimalPart) {
                word += satuanWithZero[parseInt(digit)] + " ";
            }
            return word.trim();
        }

        const [integerPart, decimalPart] = number.toString().split(".");

        let words = terbilang(parseInt(integerPart));
        if (decimalPart) {
            words += " koma " + decimalToWords(decimalPart);
        }

        return words.replace(/\s+/g, ' ').trim();
    }

    function numberToWordsUsd(number) {
        const lessThan20 = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        const thousands = ["", "Thousand", "Million", "Billion", "Trillion"];

        function helper(n) {
            if (n === 0) return "";
            else if (n < 20) return lessThan20[n] + " ";
            else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
            else return lessThan20[Math.floor(n / 100)] + " Hundred " + helper(n % 100);
        }

        function convertToWords(num) {
            if (num === 0) return "Zero";

            let word = "";
            let i = 0;

            while (num > 0) {
                if (num % 1000 !== 0) {
                    word = helper(num % 1000) + thousands[i] + " " + word;
                }
                num = Math.floor(num / 1000);
                i++;
            }

            return word.trim();
        }

        function decimalToWords(decimalPart) {
            const lessThan10WithZero = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
            let word = "";
            for (let digit of decimalPart) {
                word += lessThan10WithZero[parseInt(digit)] + " ";
            }
            return word.trim();
        }

        const [integerPart, decimalPart] = number.toString().split(".");

        let words = convertToWords(parseInt(integerPart));
        if (decimalPart) {
            words += " Point " + decimalToWords(decimalPart);
        }

        return words;
    }

    function printDomesticPdf(params, context) {

        var templateFile = file.load({ id: config.pdf_id.domestic_inv });

        var renderer = render.create();

        renderer.templateContent = templateFile.getContents();

        // ==================== Start Olah Data ===================== //
        // Yang dibutuhkan untuk Printout

        renderer.addCustomDataSource({
            alias: "Record",
            format: render.DataSource.JSON,
            data: JSON.stringify({
                header: 'param',
                data: params,
                length: "finalData.length",
            }),
        });


        // ==================== Akhir Olah Data ===================== //

        //================ Start PrintOut ======================//


        var xml = renderer.renderAsString().replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1");;

        log.debug("xml", xml)
        log.debug("renderer exist", renderer);

        var pdf = render.xmlToPdf({ // gunakan ini jika mau di Save
            xmlString: xml
        });

        // var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

        // let current = new Date();
        // let cDate = current.getDate() + '-' + (current.getMonth() + 1) + '-' + current.getFullYear();
        // let cTime = (current.getHours() - 24) + ":" + current.getMinutes() + ":" + current.getSeconds();
        // let dateTime = cDate + ' ' + cTime;

        pdf.name = params.tran_id + ".pdf";// gunakan ini jika mau di Save

        context.response.writeFile(pdf, false);// gunakan ini jika mau di Save
        // context.response.renderPdf(xml)
    }
    function printForeignPdf(params, context) {

        var templateFile = file.load({ id: config.pdf_id.export_inv });

        var renderer = render.create();

        renderer.templateContent = templateFile.getContents();

        // ==================== Start Olah Data ===================== //
        // Yang dibutuhkan untuk Printout

        renderer.addCustomDataSource({
            alias: "Record",
            format: render.DataSource.JSON,
            data: JSON.stringify({
                header: 'param',
                data: params,
                length: "finalData.length",
            }),
        });


        // ==================== Akhir Olah Data ===================== //

        //================ Start PrintOut ======================//


        var xml = renderer.renderAsString().replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1");;

        log.debug("xml", xml)
        log.debug("renderer exist", renderer);

        var pdf = render.xmlToPdf({ // gunakan ini jika mau di Save
            xmlString: xml
        });

        // var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

        // let current = new Date();
        // let cDate = current.getDate() + '-' + (current.getMonth() + 1) + '-' + current.getFullYear();
        // let cTime = (current.getHours() - 24) + ":" + current.getMinutes() + ":" + current.getSeconds();
        // let dateTime = cDate + ' ' + cTime;

        pdf.name = params.tran_id + ".pdf";// gunakan ini jika mau di Save

        context.response.writeFile(pdf, false);// gunakan ini jika mau di Save
        // context.response.renderPdf(xml)
    }

    function testSendPostApi(params) {

        try {
            var url = 'https://eohk3agcjs4h9bz.m.pipedream.net'

            var headers = {
                'Content-Type': 'application/json'
            }

            var body = params;

            var sendHttp = https.post({
                url: url,
                body: JSON.stringify(body),
                headers: headers
            })
            log.debug('Post Response', sendHttp)
        } catch (error) {
            log.debug('Post Response', error.toString())
        }


    }

    function onRequest(context) {

        var jsonData = JSON.parse(context.request.parameters.custscript_me_param);

        log.debug('jsondata', jsonData)



        var recordLoadInv = record.load({
            type: 'invoice',
            id: jsonData.record_id,
        })

        var copperOrAlu = '';
        var isShowDueDate = true;
        var getTranId = recordLoadInv.getValue('tranid');
        var getTranDate = recordLoadInv.getText('trandate');
        var getCreatedFrom = recordLoadInv.getValue('createdfrom');
        var getIncoterms = recordLoadInv.getText('custbody_me_incoterms');
        var getCurrency = recordLoadInv.getText('currency');
        var getDueDate = recordLoadInv.getText('duedate');
        var getRemarks = recordLoadInv.getText('custbody_me_remarks_sales');
        var getProformaFinal = recordLoadInv.getText('custbody_me_proforma_final');
        var getBoundedZone = recordLoadInv.getText('custbody_me_bounded_zone');
        var getExRatePajak = recordLoadInv.getText('custbody_me_ex_rate_pjk');
        var getEtaSales = recordLoadInv.getText('custbody_me_eta_sales');
        var getAccountNumber = recordLoadInv.getValue('custbody_me_account_number_bank_1');

        var getTerms = recordLoadInv.getText('terms');
        if (getTerms.includes('LC_sight')) {
            isShowDueDate = false
        }
        var getBillingAddress = recordLoadInv.getText('custbody_me_billing_address');
        var getSalesCat = recordLoadInv.getText('custbody_me_sales_category');

        if (getSalesCat.includes('Copper')) {
            copperOrAlu = 'copper'
        } else if (getSalesCat.includes('Alumunium')) {
            copperOrAlu = 'alumunium'
        }

        var getDoId = recordLoadInv.getValue('custbody_me_delivery_order_number');
        var getDo = recordLoadInv.getText('custbody_me_delivery_order_number');

        var splitDoID = getDoId.toString().split(',');
        var splitDo = getDo.toString().split(',');

        log.debug('split', splitDo)

        var doAndDateArr = []

        if (splitDo[0] != '') {


            for (let i = 0; i < splitDo.length; i++) {
                var getDoDate = search.lookupFields({
                    type: search.Type.ITEM_FULFILLMENT,
                    id: splitDoID[i],
                    columns: ['trandate']
                });
                doAndDateArr.push({
                    do: (splitDo[i]).substring(18),
                    date: (i != splitDo.length - 1) ? moment(getDoDate.trandate, 'D/M/YYYY').format('MMMM D, YYYY') + ', ' : moment(getDoDate.trandate, 'D/M/YYYY').format('MMMM D, YYYY')
                });
            }
        }

        var getImage = recordLoadInv.getText('custbody_me_tms_logo');

        var currency = '';

        if (getCurrency.includes('US')) {
            currency = 'USD ';
        } else if (getCurrency.includes('IDR')) {
            currency = 'IDR ';
        }

        var getCustomer = recordLoadInv.getValue('entity');

        var loadCust = record.load({
            type: 'customer',
            id: getCustomer,
        });

        var getCustomerLine = loadCust.getLineCount('addressbook');
        var addressLine = []

        // for (let i = 0; i < getCustomerLine; i++) {
        var getItemName = loadCust.getSublistValue({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress_text',
            line: 0,
        });
        addressLine.push(getItemName);

        // }


        var loadSo = record.load({
            type: 'salesorder',
            id: getCreatedFrom,
        });

        var getPoNumber = loadSo.getValue('otherrefnum')
        var getPoDate = loadSo.getText('custbody_me_tanggal_po_sales')
        var getBankInvoice = recordLoadInv.getText('custbody_me_bank_invoice_1');
        var getBankInvoiceAddress = recordLoadInv.getValue('custbody_me_alamat_bank_1');
        var getAccountNumberBank = recordLoadInv.getValue('custbody_me_account_number_bank_1');
        var getVesselName = recordLoadInv.getValue('custbody_me_vessel_name');
        var getOnOrAbount = recordLoadInv.getText('custbody_me_on_or_about');
        var getToLoc = recordLoadInv.getValue('custbody_me_to_invoice');
        var getFromLoc = recordLoadInv.getValue('custbody_me_from_inv');
        var getDistributor = recordLoadInv.getValue('custbody_me_distributor');

        var getLine = recordLoadInv.getLineCount('item');
        var getTaxRateHeader = recordLoadInv.getSublistValue({
            sublistId: 'item',
            fieldId: 'taxrate1',
            line: 0,
        });



        var total_net_amount = 0;
        var ppn_amount = 0;
        var total_amount = 0;

        var sublistArr = []

        for (let i = 0; i < getLine; i++) {

            var getItemName = recordLoadInv.getSublistText({
                sublistId: 'item',
                fieldId: 'item',
                line: i,
            });
            var getItemMemo = recordLoadInv.getSublistText({
                sublistId: 'item',
                fieldId: 'memo',
                line: i,
            });

            var getKursKesepakatan_ = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_kurs_kesepakatan',
                line: i,
            });
            var getLmeProforma_ = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_lme_proforma',
                line: i,
            });
            var getMjpProforma_ = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_mjp_proforma',
                line: i,
            });
            var getOthersProforma_ = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_others_proforma',
                line: i,
            });
            var getRateProforma_ = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_others_rate_proforma',
                line: i,
            });
            var getPremiumProforma_ = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_premium_proforma',
                line: i,
            });
            var getQuantity = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i,
            });
            var getUnitPrice = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: i,
            });
            var getAmount = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                line: i,
            });
            var getTaxAmt = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'tax1amt',
                line: i,
            });
            var getTaxRate = recordLoadInv.getSublistValue({
                sublistId: 'item',
                fieldId: 'taxrate1',
                line: i,
            });
            var getUnit = recordLoadInv.getSublistText({
                sublistId: 'item',
                fieldId: 'units',
                line: i,
            });


            if (getProformaFinal.includes('Proforma')) {
                if (getCurrency.includes('IDR')) {
                    if (getBoundedZone.includes('No')) {
                        total_net_amount += (Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_)  + Number(getPremiumProforma_)) * (Number(getKursKesepakatan_) + Number(getRateProforma_)) * getQuantity;
                        ppn_amount += (((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_)  + Number(getPremiumProforma_)) * (Number(getKursKesepakatan_) + Number(getRateProforma_))) * getQuantity) * getTaxRate / 100;

                    } else if (getBoundedZone.includes('Yes')) {
                        total_net_amount += (Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_)  + Number(getPremiumProforma_)) * (Number(getExRatePajak) + Number(getRateProforma_)) * getQuantity;
                        ppn_amount += (((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_)  + Number(getPremiumProforma_)) * (Number(getExRatePajak) + Number(getRateProforma_))) * getQuantity) * getTaxRate / 100;

                    }
                } else if (getCurrency.includes('US')) {
                    if (getBoundedZone.includes('No')) {
                        total_net_amount += (Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_)) * getQuantity;

                    } else if (getBoundedZone.includes('Yes')) {
                        total_net_amount += (Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_)) * getQuantity;

                    }
                }

            } else if (getProformaFinal.includes('Final')) {
                total_net_amount += Number(getAmount);
                ppn_amount += Number(getTaxAmt);

            }


            if (getProformaFinal.includes('Proforma')) {
                if (getCurrency.includes('IDR')) {
                    if (getBoundedZone.includes('No')) {
                        sublistArr.push({
                            item_name: getItemName,
                            item_memo: getItemMemo,
                            quantity: getQuantity,
                            unit_price: formatNumber((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_)) * (Number(getKursKesepakatan_) +  Number(getRateProforma_))),
                            currency: currency,
                            unit: getUnit,
                            amount: formatNumberTwoDec(((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_)) * (Number(getKursKesepakatan_) +  Number(getRateProforma_)) * getQuantity)),
                        });

                    } else if (getBoundedZone.includes('Yes')) {
                        sublistArr.push({
                            item_name: getItemName,
                            item_memo: getItemMemo,
                            quantity: getQuantity,
                            unit_price: formatNumber((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_)) * (Number(getExRatePajak) +  Number(getRateProforma_))),
                            currency: currency,
                            unit: getUnit,
                            amount: formatNumberTwoDec(((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_)) * (Number(getExRatePajak) +  Number(getRateProforma_)) * getQuantity)),
                        });

                    }

                } else if (getCurrency.includes('US')) {
                    if (getBoundedZone.includes('No')) {
                        sublistArr.push({
                            item_name: getItemName,
                            item_memo: getItemMemo,
                            quantity: getQuantity,
                            unit_price: formatNumber((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_))),
                            currency: currency,
                            unit: getUnit,
                            amount: formatNumberTwoDec(((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_)) * getQuantity)),
                        });

                    } else if (getBoundedZone.includes('Yes')) {
                        sublistArr.push({
                            item_name: getItemName,
                            item_memo: getItemMemo,
                            quantity: getQuantity,
                            unit_price: formatNumber((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_))),
                            currency: currency,
                            unit: getUnit,
                            amount: formatNumberTwoDec(((Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getPremiumProforma_)) * getQuantity)),
                        });

                    }

                }

                // if (getBoundedZone.includes('No')) {
                //     sublistArr.push({
                //         item_name: getItemName,
                //         item_memo: getItemMemo,
                //         quantity: getQuantity,
                //         unit_price: formatNumber(Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getRateProforma_) + Number(getPremiumProforma_)) * (Number(getKursKesepakatan_) + Number(getOthersProforma_)),
                //         currency: currency,
                //         amount: formatNumberTwoDec(Number(getLmeProforma_) + Number(getMjpProforma_) + Number(getOthersProforma_) + Number(getRateProforma_) + Number(getPremiumProforma_)) * (Number(getKursKesepakatan_) + Number(getOthersProforma_)),
                //     });

            } else if (getProformaFinal.includes('Final')) {
                sublistArr.push({
                    item_name: getItemName,
                    item_memo: getItemMemo,
                    quantity: getQuantity,
                    unit_price: formatNumber(getUnitPrice),
                    currency: currency,
                    unit: getUnit,
                    amount: formatNumberTwoDec(getAmount),
                });

            }
        }

        var total = Number(total_net_amount) + Number(ppn_amount)

        var terbilang = ''

        if (currency.includes('IDR')) {
            terbilang = numberToWordsIdr(total)
        } else if (currency.includes('USD')) {
            terbilang = numberToWordsUsd(total)
        }

        var printData = {
            export_domestic: jsonData.tipe,
            tran_id: getTranId,
            tran_date: moment(getTranDate, 'D/M/YYYY').format('MMMM D, YYYY'),
            po_number: getPoNumber,
            bank_invoice: getBankInvoice,
            bank_invoice_address: getBankInvoiceAddress,
            account_number_bank: getAccountNumberBank,
            vessel_name: getVesselName,
            location_from: getFromLoc,
            location_to: getToLoc,
            // vessel_name: getVesselName,
            on_or_about: getOnOrAbount ? moment(getOnOrAbount, 'D/M/YYYY').format('MMMM D, YYYY') : getOnOrAbount,
            tms_image: getImage,
            distributor: getDistributor,
            tax_amt: formatNumberTwoDec(ppn_amount),
            total_net_amount: formatNumberTwoDec(total_net_amount),
            total_amount: formatNumberTwoDec(Number(total_net_amount) + Number(ppn_amount)),
            terbilang: currency.includes('USD') ? terbilang + ' Dollars' : terbilang + ' Rupiah',
            do_and_date: doAndDateArr,
            due_date: getDueDate ? moment(getDueDate, 'D/M/YYYY').format('MMMM D, YYYY') : getDueDate,
            po_date: (getPoDate) ? moment(getPoDate, 'D/M/YYYY').format('MMMM D, YYYY') : getPoDate,
            remarks: getRemarks.replaceAll('\r\n', '<br/>'),
            copper_or_alu: copperOrAlu,
            is_show_due_date: isShowDueDate,
            is_eta_sales_date: (getEtaSales) ? moment(getEtaSales, 'D/M/YYYY').format('MMMM D, YYYY') : getEtaSales,
            incoterms: getIncoterms,
            tax_rate: (getTaxRateHeader) + "%",
            account_number: getAccountNumber,
            terms: getTerms,
            line: sublistArr,
            line_address: getBillingAddress,
        }

        // testSendPostApi(printData);

        log.debug('printdata', printData)
        if (jsonData.tipe == 'foreign') {
            log.debug('ini print foreign')
            var printForeign = printForeignPdf(printData, context);

        } else if (jsonData.tipe == 'domestic') {
            log.debug('ini print foreign')
            var printDomestic = printDomesticPdf(printData, context);
        }

    }

    return {
        onRequest: onRequest
    }
});
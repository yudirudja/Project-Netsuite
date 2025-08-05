/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define([], function () {
    function searchExchageRate() {
        let search_exchange_rate = search.create({
            type: "customrecord_me_csrec_ex_rate_",
            filters:
                [
                    // ["custrecord_me_effective_date", "onorbefore", param.date],
                    // "AND",
                    // ["custrecord_me_source_currency", "anyof", param.currency],
                    // "AND",
                    ["custrecord_me_base_currency", "anyof", "1"]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_me_exchange_rates_curr", label: "ME - Exchange Rates" }),
                    search.createColumn({ name: "custrecord_me_base_currency", label: "ME - Base Currency" }),
                    search.createColumn({ name: "custrecord_me_effective_date", sort: search.Sort.ASC, label: "ME - Effective Date" }),
                    search.createColumn({ name: "custrecord_me_source_currency", label: "ME - Source Currency" })
                ]
        })

        let start_row = 0;

        let result = [];

        do {
            var toResult = search_exchange_rate.run().getRange({
                start: start_row,
                end: start_row + 1000,
            })

            for (let i = 0; i < toResult.length; i++) {
                let ex_rate = toResult[i].getValue(toResult[i].columns[0]);
                let base_currency = toResult[i].getValue(toResult[i].columns[1]);
                let effective_date = toResult[i].getValue(toResult[i].columns[2]);
                let source_currency = toResult[i].getValue(toResult[i].columns[3]);

                result.push({
                    ex_rate: ex_rate,
                    base_currency: base_currency,
                    effective_date: Math.floor(new Date(moment((effective_date), 'D/M/YYYY').format('YYYY-MM-DD')).getTime() / 1000),
                    source_currency: source_currency,
                });
            }
            // log.debug('result', result)

            if (toResult.length % 1000 === 0) {
                start_row += 1000
            }

        } while (toResult.length === 1000);
        return result;
    }

    function getTrans() {
        var result = []
        var invSearch = search.create({
            type: "transaction",
            //Isi Filter Sesuai invoice yang ingin di update (bisa menggunakan plugin Netsuite Savedsearch Dataset Export di Google Chrome)
            filters:
                // "CustInvc","VendBill", "VendCred", "CustCred", "FxReval", "CustRfnd", "Deposit", "ItemRcpt", "Journal", "CustPymt", "VPrep", "VPrepApp", "VendPymt"
                [
                    // ["type", "anyof", "VendBill", "VendCred", "VendPymt", "CustCred", "CustRfnd", "Deposit", "CustInvc", "ItemRcpt", "Journal", "CustPymt", "VPrep", "VPrepApp", "CustDep", "DepAppl"],
                    // "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["currency", "anyof", "5", "4", "2", "8", "6", "7"],
                    // "AND", 
                    // ["shipping","is","F"], 
                    // "AND", 
                    // ["cogs","is","F"], 
                    // "AND", 
                    // ["posting","is","T"], 
                    // "AND", 
                    // ["custbody_me_journal_entries_diff","anyof","@NONE@"], 
                    // "AND",
                    // ["custbody_me_spot_rate", "is", "0"]
                    // "AND",
                    // ["custbody_me_spot_rate", "isempty", ""],
                    // "AND",
                    // ["trandate", "onorbefore", "31/10/2024"], // Edit Tanggal Disini
                    "AND",
                    ["internalid", "anyof", 85131, 85131, 85300, 85300, 85332, 85334, 85336, 85337, 85339, 85341, 85344, 85345, 85348, 85349, 85349, 85350, 85352, 85357, 85358, 85359, 85360, 85362, 85363, 85365, 85367, 85369, 85370, 85372, 85374, 85376, 85377, 85380, 85382, 85385, 85388, 85389, 85391, 85394, 85396, 85399, 85401, 85402, 85404, 85405, 85407, 85412, 85413, 85415, 85418, 85421, 85422, 85428, 85431, 85433, 85435, 85436, 85442, 85443, 85446, 85449, 85451, 85453, 85456, 85461, 85466, 85466, 85466, 85469, 85585, 85585, 85585, 85585, 85585, 85586, 85586, 85586, 85586, 85586, 85588, 85588, 85589, 85589, 85590, 85590, 85590, 85591, 85592, 85592, 85592, 86110, 86111, 86114, 86465, 86465, 86465, 86465, 86476, 86476, 86476, 86476, 86481, 86481, 86481, 86481, 87839, 87839, 87839, 87840, 87840, 87840, 87840]
                ],
            columns:
                [

                    search.createColumn({ name: "internalid", label: "internal id" }),
                    search.createColumn({ name: "trandate", label: "Date" }),
                    search.createColumn({ name: "type", label: "Type" }),
                    search.createColumn({ name: "currency", label: "Currency" }),

                ]
        })

        let startrow = 0;

        do {
            var to_result = invSearch.run().getRange({
                start: startrow,
                end: startrow + 1000
            })
            for (let i = 0; i < to_result.length; i++) {
                let date = to_result[i].getValue(to_result[i].columns[1]);
                // log.debug('date', date)
                // log.debug('result', to_result[i].getValue(to_result[i].columns[0]) + '_____' + to_result[i].getValue(to_result[i].columns[1]))
                result.push({
                    id: to_result[i].getValue(to_result[i].columns[0]),
                    date: Math.floor(new Date(moment((date), 'D/M/YYYY').format('YYYY-MM-DD')).getTime() / 1000),
                    type: to_result[i].getText(to_result[i].columns[2]),
                    currency: to_result[i].getValue(to_result[i].columns[3]),
                    rate: 0,
                })
            }


            startrow += 1000

        } while (to_result.length == 1000);



        log.debug('result ', result)
        log.debug('result length', result.length)

        return result
    }

    function combine(getTransaction, getExchageRate) {
        for (let i = 0; i < getTransaction.length; i++) {

            var getCurrency = getExchageRate.filter((data) => data.source_currency == getTransaction[i].currency)

            // log.debug('getCUrrency', getCurrency)

            for (let j = 0; j < getCurrency.length; j++) {
                if (j == 0) {
                    if (getTransaction[i].date >= getCurrency[j].effective_date && getTransaction[i].date < getCurrency[j + 1].effective_date) {
                        // log.debug('j = 0',getCurrency[j].ex_rate)
                        getTransaction[i].rate = getCurrency[j].ex_rate
                    }
                } else if (j != 0 && j != getCurrency.length - 1) {
                    if (getTransaction[i].date >= getCurrency[j].effective_date && getTransaction[i].date < getCurrency[j + 1].effective_date) {
                        // log.debug('j != 0 && j != length',getCurrency[j].ex_rate)
                        getTransaction[i].rate = getCurrency[j].ex_rate
                    }
                } else if (j == getCurrency.length - 1) {
                    if (getTransaction[i].date >= getCurrency[j].effective_date) {
                        // log.debug('j == length',getCurrency[j].ex_rate)
                        getTransaction[i].rate = getCurrency[j].ex_rate
                    }
                }
            }
        }
        return getTransaction;
    }

    function execute() {
        let getTransaction = getTrans()
        let getExchageRate = searchExchageRate()
        let combines = combine(getTransaction, getExchageRate)

        for (let i = 0; i < 1; i++) {
            log.debug('combines', combines[i])
            if (combines[i].type == 'Bill Payment') {
                var loadInv = record.submitFields({
                    type: record.Type.VENDOR_PAYMENT,
                    id: combines[i].id,
                    values: {
                        "custbody_me_spot_rate": combines[i].rate
                    },
                });
            }
            if (combines[i].type == 'Bill') {
                var loadInv = record.submitFields({
                    type: record.Type.VENDOR_BILL,
                    id: combines[i].id,
                    values: {
                        "custbody_me_spot_rate": combines[i].rate
                    },
                });
            }
            if (combines[i].type == 'Journal') {
                var loadInv = record.submitFields({
                    type: record.Type.JOURNAL_ENTRY,
                    id: combines[i].id,
                    values: {
                        "custbody_me_spot_rate": combines[i].rate
                    },
                });
            }
        }
    }

    return {
        execute: execute
    }
});

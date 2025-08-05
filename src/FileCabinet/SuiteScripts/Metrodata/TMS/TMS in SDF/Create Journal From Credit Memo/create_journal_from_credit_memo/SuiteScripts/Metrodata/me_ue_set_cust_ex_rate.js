/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/search', "./lib/moment.min.js", "N/runtime"], function (search, moment, runtime) {

    function searchExchageRate(param) {
        let search_exchange_rate = search.create({
            type: "customrecord_me_csrec_ex_rate_",
            filters:
                [
                    ["custrecord_me_effective_date", "onorbefore", param.date],
                    "AND",
                    ["custrecord_me_source_currency", "anyof", param.currency],
                    "AND",
                    ["custrecord_me_base_currency", "anyof", "1"]
                ],
            columns:
                [
                    search.createColumn({ name: "custrecord_me_exchange_rates_curr", label: "ME - Exchange Rates" }),
                    search.createColumn({ name: "custrecord_me_base_currency", label: "ME - Base Currency" }),
                    search.createColumn({ name: "custrecord_me_effective_date", sort: search.Sort.DESC, label: "ME - Effective Date" }),
                    search.createColumn({ name: "custrecord_me_source_currency", label: "ME - Source Currency" })
                ]
        })

        let start_row = 0;

        let result = [];

        //  do {
        var toResult = search_exchange_rate.run().getRange({
            start: 0,
            end: 1,
        })

        for (let i = 0; i < toResult.length; i++) {
            let ex_rate = toResult[i].getValue(toResult[i].columns[0]);
            let base_currency = toResult[i].getValue(toResult[i].columns[1]);
            let effective_date = toResult[i].getValue(toResult[i].columns[2]);
            let source_currency = toResult[i].getValue(toResult[i].columns[3]);

            result.push({
                ex_rate: ex_rate,
                base_currency: base_currency,
                effective_date: effective_date,
                source_currency: source_currency,
            });
        }
        log.debug('result', result)

        //  if (toResult.length %1000 === 0) {
        //     start_row += 1000
        //  }

        //  } while (toResult.length === 1000);
        return result;
    }

    function beforeSubmit(context) {
        if (runtime.executionContext === runtime.ContextType.SUITELET || runtime.executionContext === runtime.ContextType.WEBSERVICES || runtime.executionContext === runtime.ContextType.SCHEDULED || runtime.executionContext === runtime.ContextType.MAP_REDUCE) {
            return;
        }
        let rec = context.newRecord;

        if (context.type != 'delete') {

            let get_date = rec.getValue('trandate');
            let get_currency = rec.getValue('currency');
            let get_journal_selisih = rec.getValue('custbody_me_generate_by_sys')
            let get_check_spot_rate = rec.getValue('custbody_me_change_spot_rate')
            log.debug('spotrate', get_check_spot_rate)

            if (!get_check_spot_rate && get_currency != 1) { // Sely tambahin kalo currency == 1 (USD) script gak berjalan

                let param = {
                    date: moment(new Date(get_date)).format('D/M/YYYY'),
                    currency: get_currency,
                }

                if (get_date && (get_journal_selisih == false || get_journal_selisih == 'false' || !get_journal_selisih)) {
                    let get_ex_rate = searchExchageRate(param);

                    let set_ex_rate_tms = rec.setValue('custbody_me_spot_rate', get_ex_rate[0].ex_rate);
                    let set_ex_rate_default = rec.setValue('exchangerate', Number(1 / get_ex_rate[0].ex_rate).toFixed(8));
                }
            }

        }
    }


    return {
        beforeSubmit: beforeSubmit,
    }
});

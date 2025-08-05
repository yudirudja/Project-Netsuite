/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
 define(["N/runtime", "N/task", "N/file", "N/search", 'N/record'], 
    function (runtime, task, file, search, record) {
        var data_coa = {}
        var data_journal = {}
        var data_cr = {}
        var list_coa_reval = []
        var list_currencies = []
        var scriptObj = runtime.getCurrentScript();

        function getCurrencyReval(param){
            var fxrevalSearchObj = search.create({
                type: "fxreval",
                filters:
                [
                    ["type","anyof","FxReval"], 
                    "AND", 
                    ["numbertext","startswith","CR/"], 
                    "AND", 
                    ["trandate","within",param.startdate, param.enddate],
                    "AND", 
                    ["accounttype","noneof","AcctRec","AcctPay"], 
                    "AND", 
                    ["mainline","is","F"]
                ],
                columns:
                [
                    search.createColumn({name: "ordertype", label: "Order Type"}),
                    search.createColumn({name: "mainline", label: "*"}),
                    search.createColumn({name: "trandate", label: "Date"}),
                    search.createColumn({name: "asofdate", label: "As-Of Date"}),
                    search.createColumn({name: "postingperiod", label: "Period"}),
                    //5
                    search.createColumn({name: "taxperiod", label: "Tax Period"}),
                    search.createColumn({name: "type", label: "Type"}),
                    search.createColumn({name: "tranid", label: "Document Number"}),
                    search.createColumn({name: "entity", label: "Name"}),
                    search.createColumn({name: "account", label: "Account"}),
                    //10
                    search.createColumn({name: "debitamount", label: "Amount (Debit)"}),
                    search.createColumn({name: "creditamount", label: "Amount (Credit)"}),
                    search.createColumn({name: "memo", label: "Memo"}),
                    search.createColumn({name: "amount", label: "Amount"}),
                    search.createColumn({name: "appliedtolinkamount", label: "Applied To Link Amount"}),
                    //15                    
                    search.createColumn({name: "amount", label: "Amount"}),
                    search.createColumn({name: "linefxrate", label: "Exchange Rate (Line)"}),
                    search.createColumn({name: "createdfrom", label: "Created From"}),                    
                    search.createColumn({name: "appliedtotransaction", label: "Applied To Transaction"})
                ]
            })
            
            
            var startrow = 0

            do {
                var result = fxrevalSearchObj.run().getRange(startrow, startrow + 1000)

                for (var i=0; i < result.length; i++){
                    var cr_id = result[i].id
                    var cr_tranid = result[i].getValue(result[i].columns[7])
                    var cr_trandate = result[i].getValue(result[i].columns[2])
                    var coa = result[i].getValue(result[i].columns[9])
                    var coa_name = result[i].getText(result[i].columns[9])
                    var debit = Number(result[i].getValue(result[i].columns[10])) || 0
                    var credit = Number(result[i].getValue(result[i].columns[11])) || 0
                    // if(i < 5){

                    //     log.debug('result coa reval ' + i, 
                    //         {
                    //             cr_id : cr_id,
                    //             cr_tranid : cr_tranid,
                    //             cr_trandate : cr_trandate,
                    //             coa : coa,
                    //             coa_name : coa_name,
                    //             debit : debit,
                    //             credit : credit,
                    //         }
                    //     )
                    // }
                    if(!data_coa[coa]){
                        data_coa[coa] = {
                            coa_id: coa,
                            coa_name: coa_name
                        }

                    }
                    if(cr_trandate == param.startdate){
                        data_coa[coa]["reval_id"] = cr_id
                        data_coa[coa]["reval_tranid"] = cr_tranid
                        data_coa[coa]["reval_trandate"] = cr_trandate
                        data_coa[coa]["net_gainloss_debit"] = debit
                        data_coa[coa]["net_gainloss_credit"] = credit
                    } else {
                        data_coa[coa]["reversal_id"] = cr_id
                        data_coa[coa]["reversal_tranid"] = cr_tranid
                        data_coa[coa]["reversal_trandate"] = cr_trandate
                    }
                }
                
                startrow += 1000
            } while (result.length == 1000);

            var idx = 0
            for(var coa in data_coa){
                idx += 1
                var reval_rec = record.load({type:'fxreval',id:data_coa[coa].reval_id})
                var count = reval_rec.getLineCount('foreignaccts')
                for(var f = 0; f < count; f++){
                    var coa = reval_rec.getSublistValue({
                        sublistId:'foreignaccts',
                        fieldId:'acct',
                        line:f
                    })
                    var fx_currency = reval_rec.getSublistValue({
                        sublistId:'foreignaccts',
                        fieldId:'kcurrency',
                        line:f
                    })
                    var fx_currency_txt = reval_rec.getSublistValue({
                        sublistId:'foreignaccts',
                        fieldId:'currency',
                        line:f
                    })
                    var fx_curr_balance = reval_rec.getSublistValue({
                        sublistId:'foreignaccts',
                        fieldId:'fcbal',
                        line:f
                    })
                    var base_curr_balance = reval_rec.getSublistValue({
                        sublistId:'foreignaccts',
                        fieldId:'bcbal',
                        line:f
                    })
                    var fx_exchange_rate = reval_rec.getSublistValue({
                        sublistId:'foreignaccts',
                        fieldId:'cfxrate',
                        line:f
                    })
                    var net_gainloss = reval_rec.getSublistValue({
                        sublistId:'foreignaccts',
                        fieldId:'netvar',
                        line:f
                    })
                    
                    data_coa[coa]["fx_currency"] = fx_currency
                    data_coa[coa]["fx_currency_txt"] = fx_currency_txt
                    data_coa[coa]["fx_curr_balance"] = fx_curr_balance
                    data_coa[coa]["base_curr_balance"] = base_curr_balance
                    data_coa[coa]["fx_exchange_rate"] = fx_exchange_rate
                    data_coa[coa]["net_gainloss"] = net_gainloss
                    // data_coa[coa]["coa_diff_blc"] = 0
                    // data_coa[coa]["coa_type"] = 'Non Bank'

                    if(list_currencies.indexOf(fx_currency) == -1) {
                        list_currencies.push(fx_currency)
                    }
                }

            }
        }

        function getCOADiff(){
            var accountSearchObj = search.create({
                type: "account",
                filters:
                [
                    ["custrecord_me_mapping_bank","noneof","@NONE@"]
                ],
                columns:
                [
                    search.createColumn({name: "custrecord_me_mapping_bank", label: "ME - Mapping Bank"}),
                    search.createColumn({
                        name: "balance",
                        join: "CUSTRECORD_ME_MAPPING_BANK",
                        label: "Balance"
                    })
                ]
            });
            
            
            var startrow = 0
            var arr_coa_diff = []
            var arr_coa_diff_parent = {}
            do {
                var result = accountSearchObj.run().getRange(startrow, startrow + 1000)
                for (var i=0; i < result.length; i++){
                    var coa_id = result[i].id
                    var coa_diff = result[i].getValue(result[i].columns[0])
                    arr_coa_diff.push(coa_diff)
                    if(!arr_coa_diff_parent[coa_diff]){
                        arr_coa_diff_parent[coa_diff] = coa_id
                    }
                    
                }
                
                startrow += 1000
            } while (result.length == 1000);
            return {arr_coa_diff: arr_coa_diff, arr_coa_diff_parent}
        }

        function getKursAkhirBulan(param){
            log.debug('list_currencies', list_currencies)
            var customrecord_me_csrec_ex_rate_SearchObj = search.create({
                type: "customrecord_me_csrec_ex_rate_",
                filters:
                [
                    ["custrecord_me_source_currency","anyof",list_currencies], 
                    "AND", 
                    ["custrecord_me_effective_date","within",param.startdate,param.startdate]
                ],
                columns:
                [
                    search.createColumn({name: "custrecord_me_base_currency", label: "ME - Base Currency"}),
                    search.createColumn({name: "custrecord_me_source_currency", label: "ME - Source Currency"}),
                    search.createColumn({name: "custrecord_me_exchange_rates_curr", label: "ME - Exchange Rate"}),
                    search.createColumn({name: "custrecord_me_effective_date", label: "ME - Effective Date"})
                ]
            });
            var result = customrecord_me_csrec_ex_rate_SearchObj.run().getRange(0,1000)
            var data_currencies = {}
            for(var i=0; i < result.length; i++){
                var currency = result[i].getValue({name: "custrecord_me_source_currency", label: "ME - Source Currency"})
                var exchangerate = Number(result[i].getValue({name: "custrecord_me_exchange_rates_curr", label: "ME - Exchange Rate"}))
                if(!data_currencies[currency]){
                    data_currencies[currency] = exchangerate
                }
            }
            log.debug('data_currencies', data_currencies)
            for(var j in data_coa){
                if(data_coa[j].fx_currency in data_currencies){
                    data_coa[j]["kurs_akhir_bulan"] = data_currencies[data_coa[j].fx_currency]
                }
            }
        }

        function getBalanceCOADiff(param){
            var arr_coa_diff = getCOADiff().arr_coa_diff
            var arr_coa_diff_parent = getCOADiff().arr_coa_diff_parent
            log.debug('result arr_coa_diff', arr_coa_diff)
            log.debug('result arr_coa_diff_parent', arr_coa_diff_parent)
            var startdate = param.startdate
            var month = startdate.split('/')[1]
            var year = startdate.split('/')[2]
            var transactionSearchObj = search.create({
                type: "transaction",
                filters:
                [
                    ["account","anyof",arr_coa_diff], 
                    "AND",
                    ["trandate","onorbefore",startdate]
                ],
                columns:
                [
                    search.createColumn({
                        name: "account",
                        summary: "GROUP",
                        label: "Account"
                    }),
                    search.createColumn({
                        name: "currency",
                        summary: "GROUP",
                        label: "Currency"
                    }),
                    search.createColumn({
                        name: "amount",
                        summary: "SUM",
                        label: "Amount"
                    }),
                    search.createColumn({
                        name: "fxamount",
                        summary: "SUM",
                        label: "Amount (Foreign Currency)"
                    })
                ]
            });

            var result = transactionSearchObj.run().getRange(0,1000)
            log.debug('getBalanceCOADiff()', result)
            for(var i=0; i < result.length; i++){
                var coa_diff = result[i].getValue(result[i].columns[0])
                var coa_diff_name = result[i].getText(result[i].columns[0])
                var parent_coa_diff = arr_coa_diff_parent[coa_diff]

                
                if(parent_coa_diff in data_coa){
                    data_coa[parent_coa_diff]["coa_diff"] = coa_diff
                    data_coa[parent_coa_diff]["coa_diff_name"] = coa_diff_name
                    data_coa[parent_coa_diff]["coa_type"] = 'Bank'
                    data_coa[parent_coa_diff]["coa_diff_blc"] = Number(result[i].getValue(result[i].columns[3]))
                }
            }

        }

        function formatDate(date){
            var yy = Number(date.getFullYear())
            var mm = date.getMonth() + 1
            var dd = date.getDate()

            return dd + '/' + mm + '/' + yy

        }

        function createJournal(data){
            log.debug('Data createJournal()', data)
            try {
                var COA_PEMBALIK = 837 // COA EVALUATION EXCHANGE RATE
    
                // Create Journal Reval End Period
    
                var rec_je_reval = record.create({
                    type: record.Type.JOURNAL_ENTRY,
                    isDynamic: true
                })
    
                rec_je_reval.setValue('currency', 1)
                rec_je_reval.setText('trandate', data.reval_trandate)
                rec_je_reval.setText('custbody_me_journal_category', 'Journal Accounting')
                rec_je_reval.setText('custbody_me_voucher_list', 'None')
                rec_je_reval.setValue('custbody_me_related_cr', data.reval_id)
                rec_je_reval.setValue('custbody_me_generate_by_sys', true)
                rec_je_reval.setValue('memo', 'Jurnal otomatis penyesuaian nilai USD antara exchange rate NetSuite dan exchange rate TMS untuk transaksi Currency Revaluation ' + data.reval_tranid)
                var list_coa = data.coa_arr
                var amount_coa_pembalik = 0

                for(var j=0; j < list_coa.length; j++){
                    var COA_DIFF = list_coa[j].coa_diff ? list_coa[j].coa_diff : list_coa[j].coa_id

                    amount_coa_pembalik += (list_coa[j].selisih_debit_usd)
                    amount_coa_pembalik -= (list_coa[j].selisih_credit_usd)

                    rec_je_reval.selectNewLine({
                        sublistId: 'line'
                    })
                    rec_je_reval.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        line: i,
                        value: COA_DIFF
                    })
                    rec_je_reval.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        line: i,
                        value: list_coa[j].selisih_debit_usd
                    })
                    rec_je_reval.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        line: i,
                        value: list_coa[j].selisih_credit_usd
                    })
                    rec_je_reval.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        line: i,
                        value: 'Jurnal otomatis penyesuaian nilai USD antara exchange rate NetSuite dan exchange rate TMS untuk transaksi Currency Revaluation ' + data.reval_tranid
                    })
                    rec_je_reval.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'class',
                        line: i,
                        value: 106 // ID None
                    })
                    rec_je_reval.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department',
                        line: i,
                        value: 124
                    })
                    rec_je_reval.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'location',
                        line: i,
                        value: 38 // ID Location None
                    })
                    rec_je_reval.commitLine('line')
                }

                // COA PEMBALIK REVAL    
                rec_je_reval.selectNewLine({
                    sublistId: 'line'
                })
                rec_je_reval.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 1,
                    value: COA_PEMBALIK
                })
                rec_je_reval.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    // line: 1,
                    value: amount_coa_pembalik < 0 ? Math.abs(amount_coa_pembalik) : 0
                })
                rec_je_reval.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    // line: 1,
                    value: amount_coa_pembalik > 0 ? Math.abs(amount_coa_pembalik) : 0
                })
                rec_je_reval.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    // line: 1,
                    value: 'Jurnal otomatis penyesuaian nilai USD antara exchange rate NetSuite dan exchange rate TMS untuk transaksi Currency Revaluation ' + data.reval_tranid
                })
                rec_je_reval.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 1,
                    value: 106 // ID None
                })
                rec_je_reval.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 1,
                    value: 124
                })
                rec_je_reval.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 1,
                    value: 38 // ID Location None
                })
                rec_je_reval.commitLine('line')

                var rec_je_reval_id = rec_je_reval.save()
                data_journal[data.reval_tranid] = rec_je_reval_id
    
    
    
                // Create Journal Reversal Start Next Period
                var rec_je_reversal = record.create({
                    type: record.Type.JOURNAL_ENTRY,
                    isDynamic: true
                })
    
                rec_je_reversal.setValue('currency', 1)
                rec_je_reversal.setText('trandate', data.reversal_trandate)
                rec_je_reversal.setText('custbody_me_journal_category', 'Journal Accounting')
                rec_je_reversal.setText('custbody_me_voucher_list', 'None')
                rec_je_reversal.setValue('custbody_me_related_cr', data.reversal_id)
                rec_je_reversal.setValue('custbody_me_generate_by_sys', true)
                rec_je_reversal.setValue('memo', 'Jurnal otomatis penyesuaian nilai USD antara exchange rate NetSuite dan exchange rate TMS untuk transaksi Currency Revaluation ' + data.reversal_tranid)
                
                var list_coa_reversal = data.coa_arr
                var amount_coa_pembalik_reversal = 0
                for(var k=0; k < list_coa_reversal.length; k++){
                    amount_coa_pembalik_reversal -= (list_coa_reversal[k].selisih_debit_usd)
                    amount_coa_pembalik_reversal += (list_coa_reversal[k].selisih_credit_usd)
                    
                    var COA_DIFF = list_coa[k].coa_diff ? list_coa[k].coa_diff : list_coa[k].coa_id

                    rec_je_reversal.selectNewLine({
                        sublistId: 'line'
                    })
                    rec_je_reversal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        line: k,
                        value: COA_DIFF
                    })                    
                    rec_je_reversal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        // line: 1,
                        value: list_coa_reversal[k].selisih_credit_usd
                    })
                    rec_je_reversal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        // line: 1,
                        value: list_coa_reversal[k].selisih_debit_usd
                    })
                    rec_je_reversal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'memo',
                        line: k,
                        value: 'Jurnal otomatis penyesuaian nilai USD antara exchange rate NetSuite dan exchange rate TMS untuk transaksi Currency Revaluation ' + data.reversal_tranid
                    })
                    rec_je_reversal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'class',
                        line: k,
                        value: 106 // ID None
                    })
                    rec_je_reversal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department',
                        line: k,
                        value: 124
                    })
                    rec_je_reversal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'location',
                        line: k,
                        value: 38 // ID Location None
                    })
                    rec_je_reversal.commitLine('line')

                }
    
    
                rec_je_reversal.selectNewLine({
                    sublistId: 'line'
                })
                rec_je_reversal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    // line: 1,
                    value: COA_PEMBALIK
                })
                rec_je_reversal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: k,
                    value: amount_coa_pembalik_reversal < 0 ? Math.abs(amount_coa_pembalik_reversal) : 0
                })
                rec_je_reversal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: k,
                    value: amount_coa_pembalik_reversal > 0 ? Math.abs(amount_coa_pembalik_reversal) : 0
                })
                rec_je_reversal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'memo',
                    // line: 1,
                    value: 'Jurnal otomatis penyesuaian nilai USD antara exchange rate NetSuite dan exchange rate TMS untuk transaksi Currency Revaluation ' + data.reversal_tranid
                })
                rec_je_reversal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    // line: 1,
                    value: 106 // ID None
                })
                rec_je_reversal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    // line: 1,
                    value: 124
                })
                rec_je_reversal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    // line: 1,
                    value: 38 // ID Location None
                })
                rec_je_reversal.commitLine('line')
                
                var rec_je_reversal_id = rec_je_reversal.save()
                data_journal[data.reversal_tranid] = rec_je_reversal_id
                
            } catch (error) {
                log.debug('Failed To Create Journal ' + data.reval_tranid, error)
                throw('Failed To Create Journal ' + data.reval_tranid + '. ' + error)
            }
        }

        function execute(context) {

            var paramData = scriptObj.getParameter({
                name: 'custscript_me_ss_unrealized_oth_acc'
            });
            log.debug("SS: paramData Schedule Script 1025", paramData);
            var parseData = JSON.parse(paramData);
            log.debug("SS: parseData Schedule Script 1027", paramData);
            var accountingperiods= parseData.accountingperiods
            
            var rec_accperiod = record.load({
                type: 'accountingperiod',
                id: accountingperiods
            })
            log.debug('rec_accperiod', rec_accperiod)
            var startdate = new Date (rec_accperiod.getValue('enddate'))
            var enddate = new Date (rec_accperiod.getValue('enddate'));
            enddate.setDate(enddate.getDate() + 1)
            // const nextDate = new Date(currentDate);
            // nextDate.setDate(currentDate.getDate() + 1);
            var param = {
                accountingperiods: accountingperiods,
                startdate: formatDate(startdate),
                enddate: formatDate(enddate)
            }

            log.debug('params', param)
            getCurrencyReval(param)
            log.debug('data_coa after currencyreval', data_coa)
            
        
            getBalanceCOADiff(param)
            log.debug('data_coa getBalanceCOADiff', data_coa)

            getKursAkhirBulan(param)
            log.debug('data_coa getKursAkhirBulan', data_coa)
            log.debug('Object.keys(data_coa)', Object.keys(data_coa))

            var idx = 0
            for(var coa in data_coa){
                var reval_id = data_coa[coa].reval_id
                var fx_curr_balance = Number(data_coa[coa].fx_curr_balance) 
                var kurs_akhir_bulan = Number(data_coa[coa].kurs_akhir_bulan) 
                var base_curr_balance = Number(data_coa[coa].base_curr_balance) 
                var coa_diff_blc = Number(data_coa[coa].coa_diff_blc) || 0
                var net_gainloss_debit = Number(data_coa[coa].net_gainloss_debit) 
                var net_gainloss_credit = Number(data_coa[coa].net_gainloss_credit) 
                var kontrol = Number(Math.abs((fx_curr_balance/kurs_akhir_bulan).toFixed(2) - base_curr_balance - coa_diff_blc).toFixed(2))
                data_coa[coa]["kontrol"] = Number(kontrol)
                data_coa[coa]["selisih_debit_usd"] = 0
                data_coa[coa]["selisih_credit_usd"] = 0 
                var selisih_control_debit = net_gainloss_debit - kontrol
                var selisih_control_credit = net_gainloss_credit - kontrol


                if(net_gainloss_debit == 0) selisih_control_debit = 0
                if(net_gainloss_credit == 0) selisih_control_credit = 0
                
                if(selisih_control_credit != 0){
                    selisih_control_credit < 0 ? data_coa[coa]["selisih_credit_usd"] = Math.abs(selisih_control_credit) : data_coa[coa]["selisih_debit_usd"] = Math.abs(selisih_control_credit)
                }
                if(selisih_control_debit != 0){
                    selisih_control_debit < 0 ? data_coa[coa]["selisih_debit_usd"] = Math.abs(selisih_control_debit) : data_coa[coa]["selisih_credit_usd"] = Math.abs(selisih_control_debit)
                }
                log.debug('Data COA 616', 
                    {
                        net_gainloss_debit : net_gainloss_debit,
                        net_gainloss_credit : net_gainloss_credit,
                        kontrol : kontrol,
                        selisih_control_debit : selisih_control_debit,
                        selisih_control_credit : selisih_control_credit,
                        data_coa : data_coa[coa],
                    }
                )

                // if((net_gainloss_debit - kontrol) < 0 && net_gainloss_debit != 0){
                //     data_coa[coa].selisih_debit_usd = Math.abs(net_gainloss_debit - kontrol)
                //     data_coa[coa].selisih_credit_usd = 0
                // } else if((net_gainloss_debit - kontrol) > 0 && net_gainloss_debit != 0){
                //     data_coa[coa].selisih_credit_usd = Math.abs(net_gainloss_debit - kontrol)
                //     data_coa[coa].selisih_debit_usd = 0
                // }

                // if((net_gainloss_credit - kontrol) < 0 && net_gainloss_credit != 0){
                //     data_coa[coa].selisih_debit_usd = Math.abs(net_gainloss_credit - kontrol)
                //     data_coa[coa].selisih_debit_usd = 0
                // } else if((net_gainloss_credit - kontrol) < 0 && net_gainloss_credit != 0){
                //     data_coa[coa].selisih_debit_usd = Math.abs(net_gainloss_credit - kontrol)
                //     data_coa[coa].selisih_debit_usd = 0
                // }

                idx += 1
                if(idx == 1){
                    log.debug('data_coa[coa]',data_coa[coa])
                }

                // Maaping COA based on its reval - reversal id
                if(!data_cr[reval_id]){
                    data_cr[reval_id] = {
                        reval_id: data_coa[coa].reval_id,
                        reval_trandate: data_coa[coa].reval_trandate,
                        reval_tranid: data_coa[coa].reval_tranid,
                        reversal_id: data_coa[coa].reversal_id,
                        reversal_trandate: data_coa[coa].reversal_trandate,
                        reversal_tranid: data_coa[coa].reversal_tranid,
                        coa_arr: []
                    }
                }
                data_cr[reval_id].coa_arr.push(data_coa[coa])

            }
            
            var idx_cr = 0
            if(Object.keys(data_cr).length > 0){
                log.debug('Object.keys(data_cr)', Object.keys(data_cr))
                for(var cr in data_cr){
                    idx_cr += 1
                    if(idx_cr == 1){
    
                        log.debug('data_cr[cr]', data_cr[cr])
                    }
                    createJournal(data_cr[cr])
                    log.debug('Created Journal ', data_journal)
                }
            }
            var remainingUsage0 = runtime.getCurrentScript().getRemainingUsage();
            log.debug('Remaining Usage EXECUTE FINAL:', remainingUsage0);
        }

    return {
        execute: execute
    }
});

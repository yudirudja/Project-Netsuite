/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
*/


define(['N/search','N/ui/serverWidget','N/log','N/task','N/redirect','N/url','N/format','N/record', "N/runtime",'N/encode','N/render','N/file','./lib/moment.min.js', 'N/encode'],
function (search, serverWidget, log, task, redirect, url, format, record, runtime, encode, render, file, moment, encode) {

    var BODY = {
        title: 'Report AR Rekap',
        print_report: 'custpage_print_report',
        start_date_ar_rekap: 'custpage_start_date_ar_rekap',
        end_date_ar_rekap: 'custpage_end_date_ar_rekap',
        customer_group: 'custpage_customer_group',
        customer: 'custpage_customer',
        sales: 'custpage_sales'
        
    }

    function getParameterForm(form){
        var fieldgroup = form.addFieldGroup({
            id: 'fieldgroupid',
            label: 'Primary Information'
        });

        var body_print_report = form.addField({
            id: BODY.print_report,
            type: serverWidget.FieldType.SELECT,
            label: 'Print Report'
        })
        body_print_report.addSelectOption({ value: '1', text: 'PDF' })
        body_print_report.addSelectOption({ value: '2', text: 'Excel' })
        body_print_report.defaultValue = 1
        body_print_report.isMandatory = true

        var body_start_date_ar_rekap = form.addField({
            id: BODY.start_date_ar_rekap,
            type: serverWidget.FieldType.DATE,
            label: 'Start Date',
        })
        body_start_date_ar_rekap.defaultValue = moment(new Date()).zone('+07:00').format('D/M/YY')
        
        var body_end_date_ar_rekap = form.addField({
            id: BODY.end_date_ar_rekap,
            type: serverWidget.FieldType.DATE,
            label: 'End Date',
        })
        body_end_date_ar_rekap.defaultValue = moment(new Date()).zone('+07:00').format('D/M/YY')

        var body_sales = form.addField({
            id: BODY.sales,
            type: serverWidget.FieldType.MULTISELECT,
            label: 'Sales',
        })
        body_sales.addSelectOption({value: '', text: ''})
        var list_sales = getSales()
        log.debug('list_sales length: ' + list_sales.length, list_sales)
        for(var s=0; s < list_sales.length; s++){
            body_sales.addSelectOption({
                value: list_sales[s].sales_id,
                text: list_sales[s].sales_name
            })
        }
        // body_sales.isMandatory = true

        var body_customer_group = form.addField({
            id: BODY.customer_group,
            type: serverWidget.FieldType.MULTISELECT,
            label: 'Customer Group',
        })
        // body_customer_group.addSelectOption({value: '', text: ''})
        // body_customer_group.addSelectOption({value: '@NONE@', text: '-None-'})
        // var list_customer_group = getCustomerGroup()
        // log.debug('list_customer_group length: ' + list_customer_group.length, list_customer_group)
        // for(var cg=0; cg < list_customer_group.length; cg++){
        //     body_customer_group.addSelectOption({
        //         value: list_customer_group[cg].cust_group_id,
        //         text: list_customer_group[cg].cust_group_name
        //     })
        // }

        var body_customer = form.addField({
            id: BODY.customer,
            type: serverWidget.FieldType.MULTISELECT,
            label: 'Customer',
        })
        // body_customer.addSelectOption({value: '', text: ''})
        // var list_customer = getCustomer()
        // log.debug('list_customer length: ' + list_customer.length, list_customer)
        // for(var c=0; c < list_customer.length; c++){
        //     body_customer.addSelectOption({
        //         value: list_customer[c].customer_id,
        //         text: list_customer[c].customer_name
        //     })
        // }


        return{
            form: form,
        }
    }

    function getCustomerGroup(){
        var custGroupSearch = search.create({
            type: "customer",
            filters:
            [
               ["custentity_me_group_customer_flag","is","T"]
            ],
            columns:
            [
               search.createColumn({name: "custentity_me_group_customer_flag", label: "ME - Group Customer"}),
               search.createColumn({
                  name: "entityid",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
        });
        
        var startrow = 0
        var custGroupArr = []

        do {
            var custGroupResult = custGroupSearch.run().getRange({
                start: startrow,
                end: startrow + 1000
            })
            
            for(var i=0; i < custGroupResult.length; i++){
                var custGroup_id = custGroupResult[i].getValue(custGroupResult[i].columns[2])
                var custGroup_name = custGroupResult[i].getValue(custGroupResult[i].columns[1])
                custGroupArr.push({
                    cust_group_id: custGroup_id,
                    cust_group_name: custGroup_name,
                })
                
            }
            startrow += 1000
            
        } while (custGroupResult.length == 1000);
        // log.debug('custGroupArr', custGroupArr)

        // log.debug('debitBaik', debitBaik)
        // log.debug('debitRusak', debitRusak)
        
        return custGroupArr
    }

    function getCustomer(){
        var customerSearch = search.create({
            type: "customer",
            filters:
            [
               ["custentity_me_group_customer_flag","is","F"], 
            ],
            columns:
            [
               search.createColumn({name: "custentity_me_group_customer_flag", label: "ME - Group Customer"}),
               search.createColumn({
                  name: "entityid",
                  sort: search.Sort.ASC,
                  label: "Name"
               }),
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
        });
        
        var startrow = 0
        var customerList = []

        do {
            var customerResult = customerSearch.run().getRange({
                start: startrow,
                end: startrow + 1000
            })
            // log.debug('customerResult', customerResult)
            
            for(var i=0; i < customerResult.length; i++){
                var customer_id = customerResult[i].getValue(customerResult[i].columns[2])
                var customer_name = customerResult[i].getValue(customerResult[i].columns[1])
                customerList.push({
                    customer_id: customer_id,
                    customer_name: customer_name,
                })
                
            }
            startrow += 1000
            
        } while (customerResult.length == 1000);

        // log.debug('debitBaik', debitBaik)
        // log.debug('customerList', customerList)
        
        return customerList

    }

    function getCustomerData(data){
        var cust_parent_data_obj = {}
        var cust_data_obj = {}
        var customerSearch = search.create({
            type: "customer",
            filters:
            [
               ["internalid","anyof","10046","10047","10052","10051"]
            ],
            columns:
            [
                
                search.createColumn({name: "internalid", label: "Internal ID"}),
                search.createColumn({
                    name: "entityid",
                    sort: search.Sort.ASC,
                    label: "Name"
                }),
                search.createColumn({
                    name: "internalid",
                    join: "parentCustomer",
                    label: "Internal ID"
                }),
                search.createColumn({
                    name: "entityid",
                    join: "parentCustomer",
                    label: "Name"
                }),
                search.createColumn({name: "companyname", label: "Company Name"})
                 
            ]
        });

        var startrow = 0
        var customerList = []

        do {
            var customerResult = customerSearch.run().getRange({
                start: startrow,
                end: startrow + 1000
            })
            // log.debug('customerResult', customerResult)
            
            for(var i=0; i < customerResult.length; i++){
                var customer_id = customerResult[i].getValue(customerResult[i].columns[0])
                var customer_name = customerResult[i].getValue(customerResult[i].columns[4]).split('-')[0]
                var customer_parent_id = customerResult[i].getValue(customerResult[i].columns[2]) || ''
                var customer_parent_name = customerResult[i].getValue(customerResult[i].columns[3]).split('-')[0] || ''
                if(!cust_data_obj[customer_id] && customer_parent_id != ''){
                    cust_data_obj[customer_id] = customer_name
                }
                if(!cust_parent_data_obj[customer_parent_id] && customer_parent_id != ''){
                    cust_parent_data_obj[customer_parent_id] = customer_parent_name
                }
                
            }
            startrow += 1000
            
        } while (customerResult.length == 1000);
        
        var cust_name = []
        for(var i in cust_data_obj){
            cust_name.push(cust_data_obj[i])
        }
        var cust_parent_name = []
        for(var i in cust_parent_data_obj){
            cust_parent_name.push(cust_parent_data_obj[i])
        }

        log.debug('Data Customer Final', {cust: cust_name, parent: cust_parent_name})
        return {
            cust_name: cust_name.join(','),
            cust_parent_name: cust_parent_name.join(',')
        }
    }
    
    function getSales(){
        var salesSearch = search.create({
            type: "customrecord_me_customer_sales_person",
            filters:[],
            columns:
            [
               search.createColumn({
                  name: "internalid",
                  join: "CUSTRECORD_ME_JOIN_SALES_PERSON",
                  summary: "GROUP",
                  label: "Internal ID"
               }),
               search.createColumn({
                  name: "custrecord_me_join_sales_person",
                  summary: "GROUP",
                  label: "ME - Join Customer Sales Person"
               })
            ]
        });

        var startrow = 0
        var sales_arr = []
        do {
            var salesResult = salesSearch.run().getRange({
                start: startrow,
                end: startrow + 1000
            })
            
            for(var i=0; i < salesResult.length; i++){
                var sales_id = salesResult[i].getValue(salesResult[i].columns[0])
                var sales_name = salesResult[i].getText(salesResult[i].columns[1])
                sales_arr.push({
                    sales_id: sales_id,
                    sales_name: sales_name
                })
            }

            startrow += 1000
            
        } while (salesResult.length == 1000);
        // log.debug('salesArr', sales_arr)

        return sales_arr
    }

    function getCollection(data){
        var startdate = data.startdate
        var enddate = data.enddate
        log.debug('startdate + enddate', startdate + '+' + enddate)
        var sales_id = data.sales_id
        var customer_id = data.customer_id
        var filters = [
            ["custrecord_me_child_collection_join.custrecord_me_collection_date","within",startdate,enddate],
            "AND", 
            ["custrecord_me_child_collection_trans.mainline","is","T"], 
            "AND", 
            ["formulatext: CASE WHEN {custrecord_me_child_collection_trans.type} LIKE 'Journal' AND NVL({custrecord_me_child_collection_trans.creditamount},0) != 0 THEN 'F'  ELSE 'T' END","is","T"],
            "AND", 
            ["custrecord_me_child_collection_join.custrecord_me_sales_name","noneof","@NONE@"]
        ]
        if(sales_id[0] != ''){
            filters.push(
                "AND", 
                ["custrecord_me_child_collection_join.custrecord_me_sales_name","anyof",sales_id]
            )
        }
        if(customer_id[0] != ''){
            filters.push(
                "AND", 
                ["custrecord_me_child_collection_cust","anyof",customer_id]                
            )
        }
        log.debug('filters getCollection', filters)
        var collectionSearch = search.create({
            type: "customrecord_me_child_collection",
            filters: filters,
            columns:
            [
                search.createColumn({
                    name: "custrecord_me_sales_name",
                    join: "CUSTRECORD_ME_CHILD_COLLECTION_JOIN",
                    label: "ME - Sales Name"
                }),
                search.createColumn({
                    name: "name",
                    join: "CUSTRECORD_ME_CHILD_COLLECTION_JOIN",
                    sort: search.Sort.ASC,
                    label: "ID"
                }),
                search.createColumn({
                    name: "custrecord_me_collection_date",
                    join: "CUSTRECORD_ME_CHILD_COLLECTION_JOIN",
                    label: "Date"
                }),
                search.createColumn({
                    name: "custrecord_me_child_collection_join",
                    sort: search.Sort.ASC,
                    label: "ME - Collection"
                }),
                search.createColumn({name: "custrecord_me_child_collection_trans", label: "ME - Transaction"}),
                
                //5
                search.createColumn({name: "custrecord_me_child_collection_amount", label: "ME - Amount"}),
                search.createColumn({name: "custrecord_me_child_collection_payment", label: "ME - Payment"}),
                search.createColumn({name: "custrecord_me_child_collection_ketbal", label: "ME - Keterangan Balance"}),
                search.createColumn({name: "custrecord_me_child_collection_checkadj", label: "ME - Adjustment"}),
                search.createColumn({name: "custrecord_me_child_collection_adjstamt", label: "ME - Adjustment Amount"}),
                
                //10
                search.createColumn({name: "custrecord_me_klaim_komisi", label: "ME - Sudah Klaim Komisi"}),
                search.createColumn({name: "custrecord_me_child_collection_cust", label: "ME - Customer"}),
                search.createColumn({
                    name: "custbody_me_je_purposes",
                    join: "CUSTRECORD_ME_CHILD_COLLECTION_TRANS",
                    label: "JE Purpose"
                }),
                search.createColumn({
                    name: "custbody_me_credit_memo_purposes",
                    join: "CUSTRECORD_ME_CHILD_COLLECTION_TRANS",
                    label: "CM Purpose"
                }),
                search.createColumn({
                    name: "paymentmethod",
                    join: "CUSTRECORD_ME_CHILD_COLLECTION_TRANS",
                    label: "Payment Method"
                }),

                //15
                search.createColumn({
                    name: "trandate",
                    join: "CUSTRECORD_ME_CHILD_COLLECTION_TRANS",
                    label: "Date"
                }),
                search.createColumn({
                   name: "custbody_me_credit_memo_list_tagihan",
                   join: "CUSTRECORD_ME_CHILD_COLLECTION_TRANS",
                   label: "ME - CM List Tagihan"
                })

            ]
        });

        var startrow = 0
        var sales_coll_obj = {}
        var collection_obj = {}
        var arr_cust_deposit = []
        var arr_cust_code = []
        var collection_obj = {}
        var inv_obj = {}
        var cm_return_obj= {}
        var je_extint_obj= {}
        var je_obj = {}
        var cm_other_obj = {}
        do {
            // Getting Data To Be Printed
            // 1. Getting Collection Record. This collection could include some transactions like invoice, customer deposit, credit memo, also journal entry
            // 2. Collection Record Result will be looped to get Customer Deposit ID, Related Invoices, Related Credit Memos (only credit memo with purpose of return)
            // 3. When Customer Deposit is existing, Getting all related Deposit Application to get Used Amount on some invoices.
            // 4. After knowing the relation between Customer Deposit and Invoices, next step is looping the result and injects the used amount based on payment method on Customer Deposit into the Data Invoices.
            
            
            
            // 1. Getting Collection Record
            var collectionResult = collectionSearch.run().getRange({
                start: startrow,
                end: startrow + 1000
            })

            log.debug('collectionResult length: ' + collectionResult.length, collectionResult)

            var cd_cash = 0
            var cd_check = 0
            var cd_transfer = 0
            var cm_return = 0
            var cm_pindah_return = 0
            var cm_rebate = 0
            var cm_koreksi = 0
            var cm_biaya_trf = 0
            var cm_materai = 0
            var je_adjustment = 0
            var je_susuk = 0
            var je_extint = 0
            var inv_final_balance = 0

            
            //2. Looping Collection Result
            for(var i=0; i < collectionResult.length; i++){
                log.debug('collectionResult ke ' + i, collectionResult[i])
                var coll_sales_id = collectionResult[i].getValue(collectionResult[i].columns[0]) || ''
                var coll_sales_name = collectionResult[i].getText(collectionResult[i].columns[0]) || ''
                var coll_id = collectionResult[i].getValue(collectionResult[i].columns[3])
                var coll_tranid = collectionResult[i].getText(collectionResult[i].columns[3])
                var coll_date = collectionResult[i].getValue(collectionResult[i].columns[2])
                var trx_id = collectionResult[i].getValue(collectionResult[i].columns[4])
                var trx_tranid = collectionResult[i].getText(collectionResult[i].columns[4])
                var trx_date = collectionResult[i].getValue(collectionResult[i].columns[15])
                var trx_amount = parseFloat(collectionResult[i].getValue(collectionResult[i].columns[5]))
                var trx_payment = parseFloat(collectionResult[i].getValue(collectionResult[i].columns[6]))
                var trx_customer_id = collectionResult[i].getValue(collectionResult[i].columns[11])
                var trx_customer_name = collectionResult[i].getText(collectionResult[i].columns[11])
                var trx_customer_code = collectionResult[i].getText(collectionResult[i].columns[11]).split('-')[0]
                var je_purpose_id = collectionResult[i].getValue(collectionResult[i].columns[12])
                var je_purpose_txt = collectionResult[i].getText(collectionResult[i].columns[12])
                var cm_purpose_id = collectionResult[i].getValue(collectionResult[i].columns[13])
                var cm_purpose_txt = collectionResult[i].getText(collectionResult[i].columns[13])
                var payment_method_id = collectionResult[i].getValue(collectionResult[i].columns[14])
                var payment_method_txt = collectionResult[i].getText(collectionResult[i].columns[14])
                var je_cm_list_tagihan = collectionResult[i].getValue(collectionResult[i].columns[16])
                
                if(!sales_coll_obj[coll_sales_id]){
                    sales_coll_obj[coll_sales_id] = {
                        sales_id: coll_sales_id,
                        sales_name: coll_sales_name,
                        total_invoice: {
                            invoice: 0,
                            cd_cash: 0,
                            cd_check: 0,
                            cd_transfer: 0,
                            cm_invoice: 0,
                            je_invoice: 0,
                        },
                        total_cm_return:{
                            cm_return: 0,
                            je_extint: 0
                        },
                        collection: []
                    }
                }
                
                if(!collection_obj[coll_id]){
                    collection_obj[coll_id] = {
                        coll_id: coll_id,
                        coll_tranid: coll_tranid,
                        coll_trandate: coll_date,
                        coll_customer: trx_customer_id,
                        coll_customer_name: trx_customer_name,
                        coll_customer_code: trx_customer_code,
                        coll_sales_id: coll_sales_id,
                        coll_sales_name: coll_sales_name,
                        invoice: [],
                        cm_pindah_return: 0,
                        cm_rebate: 0,
                        cm_koreksi: 0,
                        cm_bytrf: 0,
                        cm_materai: 0,
                        je_adjustment: 0,
                        je_susuk: 0,
                        je_titip: 0,
                        total_invoice: {
                            invoice: 0,
                            cd_cash: 0,
                            cd_check: 0,
                            cd_transfer: 0,
                            cm_invoice: 0,
                            je_invoice: 0,
                        },
                        cm_return: [],
                        je_extint: 0,
                        total_cm_return:{
                            cm_return: 0,
                            je_extint: 0
                        }
                    }
                }

                
                if(trx_tranid.indexOf('Customer Deposit') != -1){
                    // collecting ID CD for more detail information about Payment Method, Detail Amount, also related Invoice(s)
                    arr_cust_deposit.push({trx_id: trx_id, coll_id: coll_id})

                } else if(trx_tranid.indexOf('Invoice') != -1){
                    
                    
                    if(!inv_obj[coll_id + '_' + trx_id]){
                        inv_obj[coll_id + '_' + trx_id] = {
                            trx_id: trx_id,
                            trx_tranid: trx_tranid.split('#')[1],
                            trx_trandate: trx_date,
                            trx_amount: trx_amount,
                            trx_payment: trx_payment,
                            cd_cash: 0,
                            cd_check: 0,
                            cd_transfer: 0,
                            je_invoice: 0, // Taro paling bawah list invoice
                            inv_final_balance: 0,
                            coll_id: coll_id,
                            coll_tranid: coll_tranid
                        }
                    }
                    collection_obj[coll_id].total_invoice.invoice = parseFloat(collection_obj[coll_id].total_invoice.invoice) + trx_amount


                } else if((trx_tranid.indexOf('Credit Memo') != -1) && cm_purpose_id == 1){ // ID CM Purpose for Return
                    
                    if(!cm_return_obj[trx_id]){
                        cm_return_obj[trx_id] = {
                            trx_id: trx_id,
                            trx_tranid: trx_tranid.split('#')[1],
                            trx_trandate: trx_date,
                            trx_amount: trx_amount,
                            trx_payment: trx_payment,
                            cm_purpose_id: cm_purpose_id,
                            cm_purpose_txt: cm_purpose_txt,
                            je_extint: 0,
                            coll_id: coll_id,
                            coll_tranid: coll_tranid
                        }
                    }
                    collection_obj[coll_id].total_cm_return.cm_return = parseFloat(collection_obj[coll_id].total_cm_return.cm_return) + trx_amount

                } else if((trx_tranid.indexOf('Credit Memo') != -1) && cm_purpose_id != 1){ // ID CM Purpose for Return
                    
                    if(!cm_other_obj[coll_id + '_' + trx_id]){
                        cm_other_obj[coll_id + '_' + trx_id] = {
                            trx_id: trx_id,
                            trx_tranid: trx_tranid,
                            trx_trandate: trx_date,
                            trx_amount: trx_amount,
                            trx_payment: trx_payment,
                            cm_purpose_id: cm_purpose_id,
                            cm_purpose_txt: cm_purpose_txt,
                            coll_id: coll_id,
                            coll_tranid: coll_tranid
                        }
                    }
                    if(cm_purpose_txt.toLowerCase().indexOf('rebate') != -1){
                        collection_obj[coll_id].cm_rebate = parseFloat(collection_obj[coll_id].cm_rebate) + trx_payment
                        collection_obj[coll_id].total_invoice.cm_invoice = parseFloat(collection_obj[coll_id].total_invoice.cm_invoice) + trx_payment

                    } else if(cm_purpose_txt.toLowerCase().indexOf('koreksi') != -1){
                        collection_obj[coll_id].cm_koreksi = parseFloat(collection_obj[coll_id].cm_koreksi) + trx_payment
                        collection_obj[coll_id].total_invoice.cm_invoice = parseFloat(collection_obj[coll_id].total_invoice.cm_invoice) + trx_payment

                    } else if(cm_purpose_txt.toLowerCase().indexOf('biaya transfer') != -1){
                        collection_obj[coll_id].cm_bytrf = parseFloat(collection_obj[coll_id].cm_bytrf) + trx_payment
                        collection_obj[coll_id].total_invoice.cm_invoice = parseFloat(collection_obj[coll_id].total_invoice.cm_invoice) + trx_payment

                    } else if(cm_purpose_txt.toLowerCase().indexOf('materai') != -1){
                        collection_obj[coll_id].cm_materai = parseFloat(collection_obj[coll_id].cm_materai) + trx_payment
                        collection_obj[coll_id].total_invoice.cm_invoice = parseFloat(collection_obj[coll_id].total_invoice.cm_invoice) + trx_payment

                    }
                    
                } else if(trx_tranid.indexOf('Journal') != -1) {
                    
                    if(!je_obj[coll_id + '_' + trx_id]){
                        je_obj[coll_id + '_' + trx_id] = {    
                            trx_id: trx_id,
                            trx_tranid: trx_tranid.split('#')[1],
                            trx_trandate: trx_date,
                            trx_amount: trx_amount,
                            je_purpose_id: je_purpose_id,
                            je_purpose_txt: je_purpose_txt,
                            coll_id: coll_id,
                            coll_tranid: coll_tranid
                        }
                    }
                    if(je_purpose_txt.toLowerCase().indexOf('adjustment') != -1){
                        collection_obj[coll_id].je_adjustment = parseFloat(collection_obj[coll_id].je_adjustment) + trx_amount
                        collection_obj[coll_id].total_invoice.je_invoice = parseFloat(collection_obj[coll_id].total_invoice.je_invoice) + trx_amount

                    } else if(je_purpose_txt.toLowerCase().indexOf('susuk') != -1){
                        collection_obj[coll_id].je_susuk = parseFloat(collection_obj[coll_id].je_susuk) + trx_amount
                        collection_obj[coll_id].total_invoice.je_invoice = parseFloat(collection_obj[coll_id].total_invoice.je_invoice) + trx_amount

                    } else if(je_purpose_txt.toLowerCase().indexOf('ext/int') != -1){
                        if(!je_extint_obj[je_cm_list_tagihan]){
                            je_extint_obj[je_cm_list_tagihan] = trx_amount
                        } else {
                            je_extint_obj[je_cm_list_tagihan] = parseFloat(je_extint_obj[je_cm_list_tagihan]) + trx_amount
                        }
                    }
                    
                }
            }

            startrow += 1000
            
        } while (collectionResult.length == 1000);

        var data_cust_deposit = {}
        if(arr_cust_deposit.length > 0){
            var data_cust_deposit = getDepositApplication(arr_cust_deposit)
        }


        // Olah data antara Invoice dan Customer Deposit
        if(Object.keys(data_cust_deposit).length > 0){
            for(var key in inv_obj){
                var coll_id = inv_obj[key].coll_id
                // var combination = coll_id + '_' + key
                if(key in data_cust_deposit){
                    if(data_cust_deposit[key].payment_method.toLowerCase().indexOf('cash') !== -1){
                        // log.debug('payment method 467 cash ' + inv_obj[key].trx_tranid, data_cust_deposit[key].payment_method.toLowerCase().indexOf('cash' !== -1))
                    
                        inv_obj[key].cd_cash = parseFloat(inv_obj[key].cd_cash) + data_cust_deposit[key].trx_amount

                        collection_obj[coll_id].total_invoice.cd_cash = parseFloat(collection_obj[coll_id].total_invoice.cd_cash) + data_cust_deposit[key].trx_amount
                    
                    } else if(data_cust_deposit[key].payment_method.toLowerCase().indexOf('check') !== -1){
                    
                        inv_obj[key].cd_check = parseFloat(inv_obj[key].cd_check) + data_cust_deposit[key].trx_amount
                    
                        collection_obj[coll_id].total_invoice.cd_check = parseFloat(collection_obj[coll_id].total_invoice.cd_check) + data_cust_deposit[key].trx_amount

                    } else if(data_cust_deposit[key].payment_method.toLowerCase().indexOf('transfer') !== -1){
                        // log.debug('payment method 467 transfer ' + inv_obj[key].trx_tranid, data_cust_deposit[key].payment_method.toLowerCase().indexOf('cash' !== -1))
                        
                        inv_obj[key].cd_transfer = parseFloat(inv_obj[key].cd_transfer) + data_cust_deposit[key].trx_amount

                        collection_obj[coll_id].total_invoice.cd_transfer = parseFloat(collection_obj[coll_id].total_invoice.cd_transfer) + data_cust_deposit[key].trx_amount
                    
                    }
                }
            }
        }
        
        if(Object.keys(inv_obj).length > 0){
            for(var inv in inv_obj){
                for(var coll in collection_obj){
                    if(inv_obj[inv].coll_id == coll){
                        collection_obj[coll].invoice.push(inv_obj[inv])
                    }
                }
            }
        }

        // Olah data antara Credit Memo dan Journal Entry ExtInt
        if(Object.keys(je_extint_obj).length > 0){
            for(var key in cm_return_obj){
                var coll_id = cm_return_obj[key].coll_id
                if(key in je_extint_obj){
                    cm_return_obj[key].je_extint = parseFloat(je_extint_obj[key])
                    collection_obj[coll_id].total_cm_return.je_extint = parseFloat(collection_obj[coll].total_cm_return.je_extint) + parseFloat(je_extint_obj[key])
                }
            }
        }
        if(Object.keys(cm_return_obj).length > 0){
            for(var cm in cm_return_obj){
                for(var coll in collection_obj){
                    if(cm_return_obj[cm].coll_id == coll){
                        collection_obj[coll].cm_return.push(cm_return_obj[cm])
                    }
                }
            }
        }

        if(Object.keys(sales_coll_obj).length > 0){
            for(var sales in sales_coll_obj){
                for(var coll in collection_obj){
                    if(collection_obj[coll].invoice.length > 0){
                        for(var last_idx = 0; last_idx < collection_obj[coll].invoice.length; last_idx++){
                            if(last_idx+1 == collection_obj[coll].invoice.length){
                                var coll_adjust = parseFloat(collection_obj[coll].je_adjustment)
                                var coll_titip = parseFloat(collection_obj[coll].je_titip)
                                var coll_susuk = parseFloat(collection_obj[coll].je_susuk)
                                collection_obj[coll].invoice[last_idx].je_invoice = parseFloat(coll_adjust + coll_titip + coll_susuk)
                            }
                        }
                    }
                    if(sales == collection_obj[coll].coll_sales_id){

                        sales_coll_obj[sales].collection.push(collection_obj[coll])
                        
                        
                        sales_coll_obj[sales].total_invoice.invoice = parseFloat(sales_coll_obj[sales].total_invoice.invoice + collection_obj[coll].total_invoice.invoice) 
                        sales_coll_obj[sales].total_invoice.cd_cash = parseFloat(sales_coll_obj[sales].total_invoice.cd_cash + collection_obj[coll].total_invoice.cd_cash) 
                        sales_coll_obj[sales].total_invoice.cd_check = parseFloat(sales_coll_obj[sales].total_invoice.cd_check + collection_obj[coll].total_invoice.cd_check) 
                        sales_coll_obj[sales].total_invoice.cd_transfer = parseFloat(sales_coll_obj[sales].total_invoice.cd_transfer + collection_obj[coll].total_invoice.cd_transfer) 
                        sales_coll_obj[sales].total_invoice.cm_invoice = parseFloat(sales_coll_obj[sales].total_invoice.cm_invoice + collection_obj[coll].total_invoice.cm_invoice) 
                        sales_coll_obj[sales].total_invoice.je_invoice = parseFloat(sales_coll_obj[sales].total_invoice.je_invoice + collection_obj[coll].total_invoice.je_invoice) 
                        
                        
                        sales_coll_obj[sales].total_cm_return.cm_return = parseFloat(sales_coll_obj[sales].total_cm_return.cm_return + collection_obj[coll].total_cm_return.cm_return)
                        sales_coll_obj[sales].total_cm_return.je_extint = parseFloat(sales_coll_obj[sales].total_cm_return.je_extint + collection_obj[coll].total_cm_return.je_extint)
                    }
                    
                }
            }
        }
        log.debug('cm_other_obj', cm_other_obj)
        log.debug('je_obj', je_obj)
        log.debug('data_cust_deposit', data_cust_deposit)
        log.debug('je_extint_obj', je_extint_obj)
        log.debug('inv_obj', inv_obj)
        log.debug('cm_obj return', cm_return_obj)
        log.debug('collection_obj', collection_obj)
        log.debug('sales_coll_obj', sales_coll_obj)
        

        return {
            collection_obj: sales_coll_obj
        }
    }

    function getDepositApplication(data){
        log.debug('data getDepositApplication', data)
        var customer_deposit_ids = []
        var coll_for_custdep = {} //Nampung id collection mana yang terhubung dengan Customer Deposit
        for(var d = 0; d < data.length; d++){
            var cust_dep_id = data[d].trx_id
            var coll_id = data[d].coll_id

            customer_deposit_ids.push(cust_dep_id)
            coll_for_custdep[cust_dep_id] = coll_id
        }
        
        var filters =[
            ["type","anyof","DepAppl"], 
            "AND",
            ["createdfrom","anyof",customer_deposit_ids], 
            "AND", 
            [
                [["appliedtolinkamount","lessthan","0.00"]],
                "OR",
                [["appliedtolinkamount","greaterthan","0.00"]]
            ]
        ]

        log.debug('filters getdeposit application', filters)
        var depositappSearch = search.create({
            type: "depositapplication",
            filters: filters,
            columns:
            [
                search.createColumn({name: "trandate", label: "Date"}),
                search.createColumn({name: "appliedtolinkamount", label: "Applied To Link Amount"}),
                search.createColumn({name: "appliedtotransaction", label: "Applied To Transaction"}),
                search.createColumn({name: "createdfrom", label: "Created From"}),
                search.createColumn({
                    name: "paymentmethod",
                    join: "createdFrom",
                    label: "Payment Method"
                })
            ]
        });

        var startrow = 0
        var pageSize = 1000
        var depAppObjRes = {}

        do {

            var depAppResult = depositappSearch.run().getRange({
                start: startrow,
                end: startrow + pageSize
            })
            log.debug('depAppResult', depAppResult)

            for(var i = 0; i < depAppResult.length; i++){
                var cust_dep_id_result = depAppResult[i].getValue(depAppResult[i].columns[3])
                var trx_id = depAppResult[i].getValue(depAppResult[i].columns[2])
                var trx_tranid = depAppResult[i].getText(depAppResult[i].columns[2])
                var trx_amount = parseFloat(depAppResult[i].getValue(depAppResult[i].columns[1]))
                var payment_method = depAppResult[i].getText(depAppResult[i].columns[4])
                
                var coll_id_result = coll_for_custdep[cust_dep_id_result]
                if(!depAppObjRes[coll_id_result + '_' + trx_id]){
                    depAppObjRes[coll_id_result + '_' + trx_id] = {
                        trx_tranid: trx_tranid,
                        trx_amount: trx_amount,
                        payment_method: payment_method
                    }
                } else {
                    depAppObjRes[coll_id_result + '_' + trx_id].trx_amount = parseFloat(depAppObjRes[coll_id_result + '_' + trx_id].trx_amount)+ trx_amount
                }
            }
            
            startrow += pageSize
        } while (depAppResult.length == pageSize);
        
        log.debug('depAppObjRes', depAppObjRes)
         
        return depAppObjRes
    }


    function renderPDF(context,final_data){
        var templateFile = file.load('Templates/PDF Templates/Metrodata Template/me_sl_rekap_ar.xml');
        // log.debug('final_data', final_data)
        var jenis_report = final_data.jenis_report
        var renderer = render.create();
        
        renderer.setTemplateById(481454)
        
        
        renderer.templateContent = templateFile.getContents();
        
        renderer.addCustomDataSource({
            alias: "DATA",
            format: render.DataSource.JSON,
            data: JSON.stringify(final_data)
        });
        
        try {
            
            var xml2 = renderer.renderAsString()
            xml2.replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1");
            xml2.replace(' ,', ',');
            var pdf = render.xmlToPdf({
                xmlString: xml2
            });
            var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')
            
            pdf.name = 'Rekap AR ' + now + ".pdf";

            context.response.writeFile(pdf, false);
        } catch (error) {
            throw('Error rendering pas render banget' + error)
        }
    }

    function renderExcel(context, final_data){

        var data_items = final_data.data_items
        var jenis_report = final_data.jenis_report

        var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'; 
        xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
        xmlString += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
        xmlString += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
        xmlString += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
        xmlString += 'xmlns:html="http://www.w3.org/TR/REC-html40">'; 

        xmlString += '<Styles>' +
            '<Style ss:ID="MyNumber">' +
                '<NumberFormat ss:Format="#,#"/>' +
            '</Style>' +
            '<Style ss:ID="MyCurr">' +
                '<NumberFormat ss:Format="#,#"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlign">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenter">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
            '</Style>' +
        '</Styles>'

        xmlString += '<Worksheet ss:Name="Sheet1">';
        xmlString += '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">';
        xmlString += '<PageSetup>';
        xmlString += '<PageMargins x:Bottom="0.75" x:Left="0.25" x:Right="0.25" x:Top="0.75"/>'
        xmlString += '</PageSetup>';
        xmlString += '</WorksheetOptions>';

        xmlString += '<Table>';

        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="150"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="50"/>';

        

        if(jenis_report == 1){
            xmlString += '<Row>' + 
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Item Code </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Item Name </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Pack </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter" ss:MergeAcross="7"><Data ss:Type="String"> Gudang Baik </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Rata2 </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Excl </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Ak-Incl </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Ak-Excl </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter" ss:MergeAcross="7"><Data ss:Type="String"> Gudang Rusak </Data></Cell>' +
    
                        '</Row>';
    
            xmlString += '<Row>' + 
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> S.Awal </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> Debit </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> Credit </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> S.Akhir </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> S.Awal </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> Debit </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> Credit </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> S.Akhir </Data></Cell>' +
            '</Row>';
    
            // log.debug('data_items excel', data_items)
            for(var i = 0; i < data_items.length; i++){
                // log.debug('data_items[i]', data_items[i])
                xmlString += '<Row>' + 
                                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">'+ data_items[i].item_code +'</Data></Cell>' + 
                                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">'+ data_items[i].item_name +'</Data></Cell>' + 
                                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">'+ data_items[i].item_conversion +'</Data></Cell>' + 
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sawal_baik_ctn +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sawal_baik_pcs +'</Data></Cell>' +
    
                                '<Cell><Data ss:Type="Number">'+ data_items[i].debit_baik_ctn +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].debit_baik_pcs +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].credit_baik_ctn +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].credit_baik_pcs +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sakhir_baik_ctn +'</Data></Cell>' +
                                
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sakhir_baik_pcs +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].ratarata +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].exclude +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].ak_incl +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].ak_excl +'</Data></Cell>' +
                                
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sawal_rusak_ctn +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sawal_rusak_pcs +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].debit_rusak_ctn +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].debit_rusak_pcs +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].credit_rusak_ctn +'</Data></Cell>' +
                                
                                '<Cell><Data ss:Type="Number">'+ data_items[i].credit_rusak_pcs +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sakhir_rusak_ctn +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sakhir_rusak_pcs +'</Data></Cell>' +
                            '</Row>';
            }

        } else {
            xmlString += '<Row>' + 
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Item Code </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Item Name </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Pack </Data></Cell>' +
                            '<Cell ss:StyleID="MyAlignCenter" ss:MergeAcross="7"><Data ss:Type="String"> Gudang Baik </Data></Cell>' +
                            
                        '</Row>';
    
            xmlString += '<Row>' + 
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> S.Awal </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> Debit </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> Credit </Data></Cell>' +
                '<Cell ss:StyleID="MyAlign" ss:MergeAcross="1"><Data ss:Type="String"> S.Akhir </Data></Cell>' +
            '</Row>';
    
            log.debug('data_items excel', data_items)
            for(var i = 0; i < data_items.length; i++){
                log.debug('data_items[i]', data_items[i])
                xmlString += '<Row>' + 
                                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">'+ data_items[i].item_code +'</Data></Cell>' + 
                                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">'+ data_items[i].item_name +'</Data></Cell>' + 
                                '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">'+ data_items[i].item_conversion +'</Data></Cell>' + 
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sawal_baik_ctn +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sawal_baik_pcs +'</Data></Cell>' +
    
                                '<Cell><Data ss:Type="Number">'+ data_items[i].debit_baik_ctn +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].debit_baik_pcs +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].credit_baik_ctn +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].credit_baik_pcs +'</Data></Cell>' +
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sakhir_baik_ctn +'</Data></Cell>' +
                                
                                '<Cell><Data ss:Type="Number">'+ data_items[i].sakhir_baik_pcs +'</Data></Cell>' +
                            '</Row>';
            }
        }

        xmlString += '</Table></Worksheet></Workbook>';
        log.debug('xmlString', xmlString)
        var strXmlEncoded = encode.convert({
            string : xmlString,
            inputEncoding : encode.Encoding.UTF_8,
            outputEncoding : encode.Encoding.BASE_64
        });
        log.debug('strXmlEncoded', strXmlEncoded)

        var objXlsFile = file.create({
            name : 'Report Stock.xls',
            fileType : file.Type.EXCEL,
            contents : strXmlEncoded
        
        });
        log.debug('objXlsFile', objXlsFile)

        
        context.response.writeFile({
            file : objXlsFile
        });
    }

    function onRequest(context) {
        var forms = serverWidget.createForm({ title: BODY.title });

        var form = getParameterForm(forms).form

        
        var body_start_date_ar_rekap = form.getField({id: BODY.start_date_ar_rekap})
        var body_end_date_ar_rekap = form.getField({id: BODY.end_date_ar_rekap})
        var body_sales = form.getField({id: BODY.sales})
        var body_customer_group = form.getField({id: BODY.customer_group})
        var body_customer = form.getField({id: BODY.customer})
        

        
        //Get Parameters
        var params = context.request.parameters
        
        var print_report = params[BODY.print_report]
        var start_date_ar_rekap = params[BODY.start_date_ar_rekap]
        var end_date_ar_rekap = params[BODY.end_date_ar_rekap]
        var sales = params[BODY.sales]
        var customer_group = params[BODY.customer_group]
        var customer = params[BODY.customer]
        
        if  (context.request.method === 'GET') {
            form.addSubmitButton({ label: 'Print Report' });
            form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_sl_cs_rekap_ar.js';
            context.response.writePage(form);
        
        } else {
            customer_group = customer_group.split('\u0005').join(',')
            customer = customer.split('\u0005').join(',')
            var sales_id = sales.split('\u0005')
            var customer_id = customer.split('\u0005')
            log.debug('PARAMS 905' + params)
            // var sales_name = search.lookupFields({
            //     type: 'employee',
            //     id: sales,
            //     columns: ['entityid']
            // }).entityid

            var data = {
                startdate: start_date_ar_rekap,
                enddate: end_date_ar_rekap,
                sales: sales,
                sales_id: sales_id,
                customer_id: customer_id,
                // sales_name: sales_name,
                customer_group: customer_group,
                customer: customer,
            }

            log.debug('Parameter Data', data)

            var collectionData = getCollection(data).collection_obj
            var customerData = getCustomerData(data)
            var customer_name = customerData.cust_name
            var customer_parent_name = customerData.cust_parent_name
            log.debug('collectionData', collectionData)
            

            var sales_name = []
        
            var final_data = {
                startdate: start_date_ar_rekap,
                enddate: end_date_ar_rekap,
                sales: sales_name.join(','),
                customer_group: customer_parent_name,
                customer: customer_name,
                data_colls: []
            }
            if(Object.keys(collectionData).length > 0){
                // var i = 0
                for(var key in collectionData){
                    final_data.data_colls.push(collectionData[key])
                    // log.debug('collectionData[key] index ' + i, collectionData[key])
                    sales_name.push(collectionData[key].sales_name)
                    // i++
                }
            }
            
            log.debug('final_data', final_data)
            log.debug('final_data datacolls', final_data.data_colls.length)
            if(final_data.data_colls.length <= 0){
                throw('Data Tidak Ditemukan')
            }
            if(print_report == 1){
                log.debug('RENDER PDF')
                renderPDF(context,final_data)
            } else {
                log.debug('RENDER EXCEL')
                renderExcel(context,final_data)
            }
            
        }

        var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
        log.debug('Remaining Usage FINALE:', remainingUsage);
    }

    return {
        onRequest: onRequest
    }
})
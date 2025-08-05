/**
    *@NApiVersion 2.1
    *@NScriptType Suitelet
*/
define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/url', 'N/format', 'N/record', "N/runtime", './library/moment.min.js'],
    function (search, serverWidget, log, task, redirect, url, format, record, runtime, moment) {

        var DATA = {
            // head_isget: 'custpage_isget',
            head_vendor: 'custpage_vendor',
            head_subsidiary: 'custpage_subsidiary',
            head_period: 'custpage_period',


            // Data Multicurrency Transaction
            head_mc_currency: 'custpage_mc_currency',

            // Data Bill Payment Standard
            // Genuinely sing same currency as the bill selected
            // head_bp_coa_ap: 'custpage_bp_coa_ap',
            // head_bp_coa_ap_hid: 'custpage_bp_coa_ap_hid',
            // head_bp_currency: 'custpage_bp_currency',
            // head_bp_trandate: 'custpage_bp_trandate',
            // head_bp_exchange_rate: 'custpage_bp_exchange_rate',


            // CHILD
            vendor_sublist: 'custpage_vendor_sublist',
            sub_checkbox: 'checkbox',
            sub_billid: 'billid',
            sub_vendorid: 'vendorid',
            sub_mccurrency: 'mccurrency',
            sub_vendor_name: 'vendornamesub',
            sub_currency: 'currencysub',
            sub_subsidiary: 'subsidiarysub',
            sub_periode: 'periodesub',

        }

        var FLD_BP = {
            //HEADER
            head_entity: 'entity',
            head_account: 'account',
            head_subsidiary: 'subsidiary',
            head_trandate: 'trandate',
            head_currency: 'currency',
            head_exchangerate: 'exchangerate',
            head_class: 'class',
            head_department: 'department',
            head_location: 'location',
            head_cmcap: 'custbody_me_cmcap_id',

            //LINE
            child_parent: 'apply',
            child_amount: 'amount',
            child_bill_id: 'internalid',
            child_is_applied: 'apply'
        }

        var FLD_MAP = {
            head_vendor: 'vendor',
            head_tranid: 'tranid',
            head_trandate: 'trandate',
            head_postingperiod: 'postingperiod',
            head_currency: 'currency',

            head_subsidiary: 'subsidiary',
            head_department: 'department',
            head_class: 'class',
            head_location: 'location',
            head_bp_id: 'custbody_me_cmcap_bp_id',

            head_exchangerate: 'exchangerate',
            head_fotofo_exrate: 'custbody_me_foreign_to_foreign_ex_rate',
            head_bp_exrate: 'custbody_me_cmcap_bp_exchange_rate',
            head_bp_currency: 'custbody_me_cmcap_bill_currency',
            head_mc_coa_bank: 'custbody_me_cmcap_coa_bank',

            child_line: 'line',
            child_account: 'account',
            child_entity: 'entity',
            child_debit: 'debit',
            child_credit: 'credit',

            child_bill_id: 'custcol_me_cmcap_bill_id',
            child_bill_outstdg: 'custcol_me_cmcap_bill_outstand_amt'
        }

        var COA_ID = {
            HKD: 383,
            SGD: 384,
            USD: 233,
            BAK_CLEARING_IDR: 399,
            PAK_CLEARING_IDR: 1018,
            ACCOUNT_PAYABLE: 111
        }



        function getParameters(context) {
            var form = serverWidget.createForm({ title: 'Multicurrency AP' });
            var now = new Date()
            // Define Group Forms
            var filter_information = form.addFieldGroup({
                id: 'filter_information',
                label: 'filter'
            });
            var primary_information = form.addFieldGroup({
                id: 'primary_information',
                label: 'Primary Information'
            });
            var multicurrency_payment = form.addFieldGroup({
                id: 'mc_payment',
                label: 'Multicurrency'
            });
            var bill_payment = form.addFieldGroup({
                id: 'bill_payment',
                label: 'Bill Payment'
            });
            // Define body fields

            // var is_get = form.addField({
            //     id: DATA.head_isget,
            //     type: serverWidget.FieldType.CHECKBOX,
            //     label: 'metode',
            //     container: 'primary_information'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.HIDDEN
            // })



            var subsidiary = form.addField({
                id: DATA.head_subsidiary,
                type: serverWidget.FieldType.SELECT,
                label: 'Subsidiary',
                source: 'subsidiary',
                container: 'filter_information'
            })
            subsidiary.isMandatory = true
            var period = form.addField({
                id: DATA.head_period,
                type: serverWidget.FieldType.SELECT,
                label: 'Period',
                source: 'accountingperiod',
                container: 'filter_information'
            })
            period.isMandatory = true
            var vendor = form.addField({
                id: DATA.head_vendor,
                type: serverWidget.FieldType.SELECT,
                label: 'Vendor',
                source: 'vendor',
                container: 'filter_information'
            })
            vendor.isMandatory = true
            var currency = form.addField({
                id: DATA.head_mc_currency,
                type: serverWidget.FieldType.SELECT,
                label: 'Currency',
                source: 'currency',
                container: 'filter_information'
            })
            vendor.isMandatory = true

            // var bp_trandate = form.addField({
            //     id: DATA.head_bp_trandate,
            //     type: serverWidget.FieldType.DATE,
            //     label: 'trandate',
            //     container: 'primary_information'
            // })
            // bp_trandate.isMandatory = true
            // bp_trandate.defaultValue = now

            // var subsidiary = form.addField({
            //     id: DATA.head_subsidiary,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'subsidiary',
            //     source: 'subsidiary',
            //     container: 'primary_information'
            // })
            // subsidiary.isMandatory = true

            // var department = form.addField({
            //     id: DATA.head_department,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'department',
            //     source: 'department',
            //     container: 'primary_information'
            // })
            // department.isMandatory = true

            // var class_ = form.addField({
            //     id: DATA.head_class,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'class',
            //     source: 'classification',
            //     container: 'primary_information'
            // })
            // class_.isMandatory = true

            // var location = form.addField({
            //     id: DATA.head_location,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'location',
            //     source: 'location',
            //     container: 'primary_information'
            // })
            // location.isMandatory = true

            // var startdate = form.addField({
            //     id: DATA.head_startdate,
            //     type: serverWidget.FieldType.DATE,
            //     label: 'startdate',
            //     container: 'filter_information'
            // })
            // startdate.defaultValue = now

            // var enddate = form.addField({
            //     id: DATA.head_enddate,
            //     type: serverWidget.FieldType.DATE,
            //     label: 'enddate',
            //     container: 'filter_information'
            // })
            // enddate.defaultValue = now

            // var fotofo_exrate = form.addField({
            //     id: DATA.head_fotofo_exrate,
            //     type: serverWidget.FieldType.FLOAT,
            //     label: 'Foreign To Foreign ExRate',
            //     container: 'primary_information'
            // })
            // fotofo_exrate.isMandatory = true


            // Multicurrency Payment

            // var mc_coa_bank_hid = form.addField({
            //     id: DATA.head_mc_coa_bank_hid,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'mc coa bank',
            //     // source: 'account',
            //     container: 'mc_payment'
            // })
            // mc_coa_bank_hid.isMandatory = true

            // var mc_currency = form.addField({
            //     id: DATA.head_mc_currency,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'mc currency',
            //     source: 'currency',
            //     container: 'mc_payment'
            // })
            // mc_currency.isMandatory = true

            // var mc_exchange_rate = form.addField({
            //     id: DATA.head_mc_exchange_rate,
            //     type: serverWidget.FieldType.FLOAT,
            //     label: 'mc exchange rate',
            //     container: 'mc_payment'
            // })
            // mc_exchange_rate.isMandatory = true


            // Bill Payment

            // var bp_coa_ap_hid = form.addField({
            //     id: DATA.head_bp_coa_ap_hid,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'bp coa ap',
            //     // source: 'account',
            //     container: 'bill_payment'
            // })
            // bp_coa_ap_hid.isMandatory = true

            // var currency = form.addField({
            //     id: DATA.head_bp_currency,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'BP currency',
            //     source: 'currency',
            //     container: 'bill_payment'
            // })
            // currency.isMandatory = true

            // var bp_exchange_rate = form.addField({
            //     id: DATA.head_bp_exchange_rate,
            //     type: serverWidget.FieldType.FLOAT,
            //     label: 'bp exchange rate',
            //     container: 'bill_payment'
            // })
            // bp_exchange_rate.isMandatory = true

            // Define Form Sublist
            var vendor_sublist = form.addSublist({
                id: DATA.vendor_sublist,
                type: serverWidget.SublistType.LIST,
                label: 'Vendors'
            })

            var sub_checkbox = vendor_sublist.addField({
                id: DATA.sub_checkbox,
                type: serverWidget.FieldType.CHECKBOX,
                label: 'checkbox'
            })

            var sub_vendorname = vendor_sublist.addField({
                id: DATA.sub_vendor_name,
                type: serverWidget.FieldType.SELECT,
                label: 'Name Vendor',
                source: 'vendor'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            var sub_currency = vendor_sublist.addField({
                id: DATA.sub_currency,
                type: serverWidget.FieldType.SELECT,
                label: 'currency',
                source: 'currency'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            var sub_subsidiary = vendor_sublist.addField({
                id: DATA.sub_subsidiary,
                type: serverWidget.FieldType.SELECT,
                label: 'Subsidiary',
                source: 'subsidiary'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            var sub_periode = vendor_sublist.addField({
                id: DATA.sub_periode,
                type: serverWidget.FieldType.SELECT,
                label: 'Periode',
                source: 'accountingperiod'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            var daysInMonthLength = moment().daysInMonth();

            var currentMonth = moment().format("MM");
            var currentYear = moment().format("YYYY");


            // for (let x = 0; x < daysInMonthLength; x++) {
            //     let y = x + 1;
            //     // var daysInMonth = moment((y) + "/" + currentMonth).format("ddd");
            //     var dates = vendor_sublist.addField({
            //         id: 'daysub' + (x + 1),
            //         type: serverWidget.FieldType.TEXT,
            //         label: ((x + 1) + "/" + currentMonth + "/" + currentYear + " (" + moment(currentMonth + "/" + y + "/" + currentYear).format("ddd") + ")"),
            //     }).updateDisplayType({
            //         displayType: serverWidget.FieldDisplayType.INLINE
            //     })
            // }


            // var sub_billtranid = vendor_sublist.addField({
            //     id: DATA.sub_billtranid,
            //     type: serverWidget.FieldType.TEXT,
            //     label: 'Bill Doc#'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.HIDDEN
            // })

            // var sub_billtrandate = vendor_sublist.addField({
            //     id: DATA.sub_billtrandate,
            //     type: serverWidget.FieldType.DATE,
            //     label: 'bill trandate'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // })

            // var sub_billoutstdg = vendor_sublist.addField({
            //     id: DATA.sub_billoutstdg,
            //     type: serverWidget.FieldType.FLOAT,
            //     label: 'Bill Otstdg Amount'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // })

            // var sub_billcurrency = vendor_sublist.addField({
            //     id: DATA.sub_billcurrency,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'Bill Currency',
            //     source: 'currency'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // })

            // var sub_billpayment = vendor_sublist.addField({
            //     id: DATA.sub_billpayment,
            //     type: serverWidget.FieldType.CURRENCY,
            //     label: 'Bill Payment'
            // })
            // sub_billpayment.defaultValue = 0

            // var sub_billpaymentidr = vendor_sublist.addField({
            //     id: DATA.sub_billpaymentidr,
            //     type: serverWidget.FieldType.CURRENCY,
            //     label: 'Bill Payment IDR'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.DISABLED
            // })
            // sub_billpaymentidr.defaultValue = 0

            // var sub_mcpayment = vendor_sublist.addField({
            //     id: DATA.sub_mcpayment,
            //     type: serverWidget.FieldType.CURRENCY,
            //     label: 'Multicurrency Payment'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.DISABLED
            // })
            // sub_mcpayment.defaultValue = 0

            // var sub_mccurrency = vendor_sublist.addField({
            //     id: DATA.sub_mccurrency,
            //     type: serverWidget.FieldType.SELECT,
            //     label: 'MC currency',
            //     source: 'currency'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // })

            // var sub_mcpaymentidr = vendor_sublist.addField({
            //     id: DATA.sub_mcpaymentidr,
            //     type: serverWidget.FieldType.CURRENCY,
            //     label: 'Multicurrency Payment IDR'
            // }).updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.DISABLED
            // })
            // sub_mcpaymentidr.defaultValue = 0


            return form
        }


        function createBillPayment(data, mc_payment_id) {
            try {
                log.debug('data createBillPayment', data)
                var entity = data.vendor
                var subsidiary = data.subsidiary
                var class_ = data.class_
                var department = data.department
                var location = data.location
                var bp_exrate = Number(data.bp_exchange_rate)
                var bp_amount = parseFloat(data.bp_amount)
                var currency = data.bp_currency
                var coa_clearing = data.coa_bank_clearing
                var bp_coa_ap = data.bp_coa_ap
                var cmcap_id = mc_payment_id
                var data_bill = data.data_bill
                var trandate = data.bp_trandate
                var fotofo_exrate = data.fotofo_exrate
                try {
                    var rec_bp = record.create({
                        type: record.Type.VENDOR_PAYMENT,
                        isDynamic: true

                    })
                    log.debug('rec_bp 344', rec_bp)

                } catch (error) {
                    throw ('Error record.create: ' + error)
                }
                // log.debug('default value is set customform + entity + apacct', customform + ' + ' + entity + ' + '  + apacct)
                try {
                    rec_bp.setValue('customform', 121)
                    // log.debug('apacct setelah pilih customform sebelum set vendor', rec_bp.getValue('apacct'))

                    rec_bp.setValue('entity', entity)
                    // log.debug('apacct setelah set vendor sebelum set subsidiary', rec_bp.getValue('apacct'))

                    rec_bp.setValue({
                        fieldId: FLD_BP.head_subsidiary,
                        value: subsidiary
                    })
                    // log.debug('apacct setelah set subsidiary sebelum set apacct', rec_bp.getValue('apacct'))

                    rec_bp.setValue('apacct', bp_coa_ap)
                    // log.debug('apacct setelah set apacct', rec_bp.getValue('apacct'))

                } catch (error) {
                    throw ('385 ' + error)
                }
                var customform = rec_bp.getValue('customform')
                var entity = rec_bp.getValue('entity')
                var subsidiary = rec_bp.getValue('subsidiary')
                var apacct = rec_bp.getValue('apacct')
                // log.debug('apacct setelah semua value inti di set', rec_bp.getValue('apacct'))
                log.debug('default value is set customform + entity + subsidiary + apacct', customform + ' + ' + entity + ' + ' + subsidiary + ' + ' + apacct)
                rec_bp.setValue({
                    fieldId: FLD_BP.head_currency,
                    value: currency
                })
                rec_bp.setValue('account', coa_clearing)
                // log.debug('apacct setelah set currency dan coa clearing', rec_bp.getValue('apacct'))
                // log.debug('account set ' + rec_bp.getValue('account'), 'COA clearing: ' + coa_clearing)

                log.debug(
                    'New Data',
                    'customform ' + customform +
                    ' || entity ' + entity +
                    ' || subsidiary ' + subsidiary +
                    ' || apacct ' + apacct +
                    ' || currency ' + rec_bp.getValue('currency') +
                    ' || account ' + rec_bp.getValue('account')

                )

                rec_bp.setText({
                    fieldId: FLD_BP.head_trandate,
                    text: trandate
                })
                rec_bp.setValue({
                    fieldId: FLD_BP.head_class,
                    value: class_,
                    ignoreFieldChange: true
                })
                rec_bp.setValue({
                    fieldId: FLD_BP.head_department,
                    value: department,
                    ignoreFieldChange: true
                })
                rec_bp.setValue({
                    fieldId: FLD_BP.head_location,
                    value: location,
                    ignoreFieldChange: true
                })
                rec_bp.setValue({
                    fieldId: FLD_BP.head_exchangerate,
                    value: bp_exrate,
                    ignoreFieldChange: true
                })
                rec_bp.setValue({
                    fieldId: FLD_BP.head_cmcap,
                    value: cmcap_id,
                    ignoreFieldChange: true
                })
                rec_bp.setValue({
                    fieldId: FLD_MAP.head_fotofo_exrate,
                    value: fotofo_exrate,
                    ignoreFieldChange: true
                })
                var count = rec_bp.getLineCount(FLD_BP.child_parent)

                log.debug('count', count)
                var line_bill = -1

                for (var i = 0; i < count; i++) {
                    var line_bill_id = rec_bp.getSublistValue({
                        sublistId: FLD_BP.child_parent,
                        fieldId: FLD_BP.child_bill_id,
                        line: i
                    })

                    if (line_bill_id in data_bill) {
                        // var line_bill = rec_bp.getCurrentSublistIndex({
                        //     sublistId: FLD_BP.child_parent
                        // });
                        log.debug('Bill Ketemuid bill: ' + line_bill_id)

                        var lineNum = rec_bp.selectLine({
                            sublistId: FLD_BP.child_parent,
                            line: i
                        });
                        rec_bp.setCurrentSublistValue({
                            sublistId: FLD_BP.child_parent,
                            fieldId: FLD_BP.child_is_applied,
                            // line: lineNum,
                            value: true
                        })
                        var isApplied = rec_bp.getCurrentSublistValue('apply', 'apply')
                        log.debug('isApplied', isApplied)

                        rec_bp.setCurrentSublistValue({
                            sublistId: FLD_BP.child_parent,
                            fieldId: FLD_BP.child_amount,
                            // line: lineNum,
                            value: data_bill[line_bill_id].bill_payment
                        })
                        var amountApplied = rec_bp.getCurrentSublistValue('apply', 'amount')
                        log.debug('amountApplied', amountApplied)
                        lineNum.commitLine(FLD_BP.child_parent)
                    }
                }



                log.debug('rec_bp 215', rec_bp)
                var recbp_length = rec_bp.length
                var bp_id = rec_bp.save()


                return bp_id
            } catch (error) {
                throw ('Error Creating Bill Payment ' + error)
            }
        }

        function createMCPayment(data) {
            // Form Multicurrency Payment AP has Clearing as the Debit, and  Bank as Credit
            try {
                log.debug('data createMCPayment', data)
                var entity = data.vendor
                var subsidiary = data.subsidiary
                var class_ = data.class_
                var department = data.department
                var location = data.location
                var mc_exrate = data.mc_exchange_rate
                var mc_amount = parseFloat(data.mc_amount)
                var mc_coa_bank = data.mc_coa_bank
                var currency = data.mc_currency
                var coa_clearing = data.coa_bank_clearing
                var cmcap_id = data.cmcap_id
                var data_bill = data.data_bill
                var bp_exrate = Number(data.bp_exchange_rate)
                var bp_currency = data.bp_currency
                var trandate = data.bp_trandate
                var fotofo_exrate = data.fotofo_exrate

                var rec_mc = record.create({
                    type: 'customtransaction_me_multicur_invoice_ap',
                    isDynamic: true,

                })
                rec_mc.setValue('subsidiary', subsidiary)
                rec_mc.setValue({
                    fieldId: FLD_MAP.head_currency,
                    value: currency
                })
                rec_mc.setText({
                    fieldId: FLD_MAP.head_trandate,
                    text: trandate
                })
                var subsidiary = rec_mc.getValue('subsidiary')
                var currency = rec_mc.getValue('currency')
                var currencytxt = rec_mc.getText('currency')

                rec_mc.setValue({
                    fieldId: FLD_MAP.head_mc_coa_bank,
                    value: mc_coa_bank,
                    ignoreFieldChange: true
                })
                rec_mc.setValue({
                    fieldId: FLD_MAP.head_class,
                    value: class_,
                    ignoreFieldChange: true
                })
                rec_mc.setValue({
                    fieldId: FLD_MAP.head_department,
                    value: department,
                    ignoreFieldChange: true
                })
                rec_mc.setValue({
                    fieldId: FLD_MAP.head_location,
                    value: location,
                    ignoreFieldChange: true
                })

                rec_mc.setValue({
                    fieldId: FLD_MAP.head_fotofo_exrate,
                    value: fotofo_exrate,
                    ignoreFieldChange: true
                })
                rec_mc.setValue({
                    fieldId: FLD_MAP.head_bp_exrate,
                    value: bp_exrate,
                    ignoreFieldChange: true
                })
                rec_mc.setValue({
                    fieldId: FLD_MAP.head_bp_currency,
                    value: bp_currency,
                    ignoreFieldChange: true
                })

                rec_mc.setValue({
                    fieldId: FLD_MAP.head_exchangerate,
                    value: mc_exrate,
                    ignoreFieldChange: true
                })
                var exchangerate = rec_mc.getValue('exchangerate')
                log.debug('subsidiary + currency + currencytxt + exchangerate', subsidiary + ' + ' + currency + ' + ' + currencytxt + ' + ' + exchangerate)

                var count = data_bill.length

                log.debug('count', count)

                for (var i in data_bill) {
                    var bill_id = data_bill[i].bill_id
                    var bill_tranid = data_bill[i].bill_tranid
                    var bill_trandate = data_bill[i].bill_trandate
                    var bill_outstdg_amt = data_bill[i].bill_outstdg_amt
                    var mc_payment = data_bill[i].mc_payment
                    var mc_paymentidr = data_bill[i].mc_paymentidr

                    // L I N E   D E B I T
                    rec_mc.selectNewLine({
                        sublistId: FLD_MAP.child_line
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_bill_id,
                        value: bill_id
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_bill_outstdg,
                        value: bill_outstdg_amt
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_account,
                        value: coa_clearing
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_debit,
                        value: mc_payment
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_entity,
                        value: entity
                    })
                    rec_mc.commitLine({
                        sublistId: FLD_MAP.child_line
                    })


                    // L I N E   C R E D I T

                    rec_mc.selectNewLine({
                        sublistId: FLD_MAP.child_line
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_bill_id,
                        value: bill_id
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_bill_outstdg,
                        value: bill_outstdg_amt
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_account,
                        value: mc_coa_bank
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_credit,
                        value: mc_payment
                    })
                    rec_mc.setCurrentSublistValue({
                        sublistId: FLD_MAP.child_line,
                        fieldId: FLD_MAP.child_entity,
                        value: entity
                    })
                    rec_mc.commitLine({
                        sublistId: FLD_MAP.child_line
                    })



                }


                var recmc_length = rec_mc.getLineCount(FLD_MAP.child_line)
                log.debug('rec_mc 550 length: ' + recmc_length, rec_mc)
                var mc_id = rec_mc.save()

                // Update Each Bill
                for (var j in data_bill) {
                    log.debug('var j in data_bill', j)
                    var data_bill = search.lookupFields({
                        type: record.Type.VENDOR_BILL,
                        id: j,
                        columns: ['custbody_me_cmcap_id']
                    })

                    log.debug('data_bill create', data_bill)

                    var bill_cmcap = data_bill.custbody_me_cmcap_id
                    var new_bill_cmcap = [mc_id]
                    if (bill_cmcap.length > 0) {
                        for (var k = 0; k < bill_cmcap.length; k++) {
                            if (bill_cmcap[k].value != mc_id) {
                                new_bill_cmcap.push(bill_cmcap[k].value)
                            }
                        }
                    }

                    var rec_bill = record.submitFields({
                        type: record.Type.VENDOR_BILL,
                        id: j,
                        values: {
                            'custbody_me_cmcap_id': new_bill_cmcap.length > 0 ? new_bill_cmcap : ''
                        }
                    })
                    log.debug('Submit field BILL berhasil', rec_bill)
                }

                return mc_id
            } catch (error) {
                throw ('Error Creating Multicurrency Payment ' + error)
            }
        }

        function createPayment(data) {
            try {
                var data_bill = data.data_bill
                var mc_payment_id = createMCPayment(data)
                var bill_payment_id = createBillPayment(data, mc_payment_id)

                var rec_mc = record.submitFields({
                    type: 'customtransaction_me_multicur_invoice_ap',
                    id: mc_payment_id,
                    values: {
                        'custbody_me_cmcap_bp_id': bill_payment_id
                    }
                })
                redirect.toRecord({
                    type: 'customtransaction_me_multicur_invoice_ap',
                    id: mc_payment_id
                });
            } catch (error) {
                throw ('Failed to create payment. ' + error)
            }
        }

        function getVendors() {
            var vendorSearchObj = search.create({
                type: "vendor",
                filters:
                    [
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "name",
                            join: "mseSubsidiary",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "currency",
                            join: "VendorCurrencyBalance",
                            label: "Currency"
                        })
                    ]
            });

            var vendorArr = [];
            var startrow = 0;
            do {

                var vendorGetSearch = vendorSearchObj.run().getRange({
                    start: startrow,
                    end: startrow + 1000,
                });

                for (let i = 0; i < vendorGetSearch.length; i++) {
                    var idVendor = vendorGetSearch[i].id;
                    var nameVendor = vendorGetSearch[i].getValue(vendorGetSearch[i].columns[0]);
                    var nameSubsidiary = vendorGetSearch[i].getValue(vendorGetSearch[i].columns[1]);
                    var currency = vendorGetSearch[i].getValue(vendorGetSearch[i].columns[2]);

                    vendorArr.push({
                        id_vendor: idVendor,
                        name_vendor: nameVendor,
                        name_subsidiary: nameSubsidiary,
                        currency: currency,
                    });

                }
                startrow =+ 1000
            } while (vendorGetSearch.length == 1000);

            log.debug("vendorArr", vendorArr);

            return vendorArr;

        }

        function getBill(data) {
            log.debug('data gettingBill', data)
            var vendor = data.vendor
            var subsidiary = data.subsidiary
            var department = data.department
            var class_ = data.class_
            var location = data.location
            var currency = data.bp_currency
            var startdate = data.startdate
            var enddate = data.enddate
            var coa_ap = data.bp_coa_ap
            try {
                var filters = [
                    ["type", "anyof", "VendBill"],
                    "AND",
                    ["currency", "anyof", currency],
                    "AND",
                    ["status", "anyof", "VendBill:A"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["subsidiary", "anyof", subsidiary],
                    "AND",
                    ["account", "anyof", coa_ap]

                ]
                if (vendor) {
                    filters.push(
                        "AND",
                        ["name", "anyof", vendor]
                    )
                }
                if (startdate && enddate) {
                    filters.push(
                        "AND",
                        ["trandate", "within", startdate, enddate]
                    )
                }
                // if(subsidiary){
                //     filters.push(
                //         "AND", 
                //         ["subsidiary","anyof",subsidiary] 
                //     )
                // }
                // if(department){
                //     filters.push(
                //         "AND", 
                //         ["department","anyof",department] 
                //     )
                // }
                // if(class_){
                //     filters.push(
                //         "AND", 
                //         ["class","anyof",class_] 
                //     )
                // }
                // if(location){
                //     filters.push(
                //         "AND", 
                //         ["location","anyof",location] 
                //     )
                // }
                var billSearch = search.create({
                    type: "vendorbill",
                    filters: filters,
                    columns:
                        [
                            search.createColumn({ name: "tranid", label: "Document Number" }),
                            search.createColumn({ name: "trandate", label: "Date" }),
                            search.createColumn({ name: "currency", label: "Currency" }),
                            search.createColumn({ name: "total", label: "Amount (Transaction Total)" }),
                            search.createColumn({ name: "fxamountremaining", label: "Amount Remaining (Foreign Currency)" }),

                            search.createColumn({ name: "subsidiary", label: "Subsidiary" }),
                            search.createColumn({ name: "department", label: "Department" }),
                            search.createColumn({ name: "class", label: "Class" }),
                            search.createColumn({ name: "location", label: "Location" })
                        ]
                });


                var startrow = 0;
                var bill_arr = []
                do {
                    var bill_result = billSearch.run().getRange({
                        start: startrow,
                        end: startrow + 1000
                    })
                    log.debug('bill_result 785', bill_result)

                    for (var i = 0; i < bill_result.length; i++) {
                        var bill_id = bill_result[i].id
                        var bill_tranid = bill_result[i].getValue(bill_result[i].columns[0])
                        var bill_trandate = bill_result[i].getValue(bill_result[i].columns[1])
                        var bill_currency = bill_result[i].getValue(bill_result[i].columns[2])
                        var bill_total_amt = bill_result[i].getValue(bill_result[i].columns[3])
                        var bill_outstdg_amt = bill_result[i].getValue(bill_result[i].columns[4])
                        bill_arr.push({
                            bill_id: bill_id,
                            bill_tranid: bill_tranid,
                            bill_trandate: bill_trandate,
                            bill_currency: bill_currency,
                            bill_total_amt: bill_total_amt,
                            bill_outstdg_amt: bill_outstdg_amt
                        })
                    }
                } while (bill_result.length == 1000);

                log.debug('bill_arr', bill_arr)

                return bill_arr
            } catch (error) {
                throw ('Error When Getting Data Bill. ' + error)
            }

        }

        function onRequest(context) {
            var form = getParameters(context)
            // var head_isget = form.getField({id: DATA.head_isget})
            var head_vendor = form.getField({ id: DATA.head_vendor })
            var head_subsidiary = form.getField({ id: DATA.head_subsidiary })
            var head_mc_currency = form.getField({ id: DATA.head_mc_currency })
            var head_period = form.getField({ id: DATA.head_period })
            
            var vendor_sublist = form.getSublist({ id: DATA.vendor_sublist })
            var sub_periode = vendor_sublist.getField({ id: DATA.sub_periode })
            var sub_subsidiary = vendor_sublist.getField({ id: DATA.sub_subsidiary })
            var sub_currency = vendor_sublist.getField({ id: DATA.sub_currency })
            
            var params = context.request.parameters
            var vendor = params[DATA.head_vendor]
            var subsidiary = params[DATA.head_subsidiary]
            var mc_currency = params[DATA.head_mc_currency]
            var head_period = params[DATA.head_period]

            if (context.request.method === 'GET') {

                form.addSubmitButton({ label: 'Get Vendors' });
                // form.clientScriptModulePath = 'SuiteScripts/METRODATA/me_sl_tampil_report.js';


            } else {
                // head_isget.defaultValue = 'T'

                // head_vendor.defaultValue = vendor
                // head_vendor.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.INLINE
                // })

                // head_subsidiary.defaultValue = subsidiary
                // head_subsidiary.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.INLINE
                // })

                // head_mc_currency.defaultValue = mc_currency
                // head_mc_currency.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.INLINE
                // })
                // sub_periode.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.
                // })
                // sub_subsidiary.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.INLINE
                // })
                // sub_currency.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.INLINE
                // })
                
                // log.debug('mc_coa_bank + bp_coa_ap', mc_coa_bank + ' + ' + bp_coa_ap)
                // var mc_coa_bank_fix = params[DATA.head_mc_coa_bank] //reget value
                // var bp_coa_ap_fix = params[DATA.head_bp_coa_ap] //reget value
                // log.debug('mc_coa_bank_fix + bp_coa_ap_fix', mc_coa_bank_fix + ' + ' + bp_coa_ap_fix)
                
                var data = {
                    vendor: vendor,
                    subsidiary: subsidiary,
                    mc_currency: mc_currency,
                    period: head_period,
                    data_bill: {}
                }
                var checkedBill = []
                var checkedBillObj = {}
                
               
                var count = context.request.getLineCount({
                    group: DATA.vendor_sublist
                });
                
                log.debug("count sublist", count);


                for (var j = 0; j < count; j++) {
                    var is_checked = context.request.getSublistValue({
                        group: DATA.vendor_sublist,
                        name: DATA.sub_checkbox,
                        line: j
                    })
                    if (is_checked == 'T' || is_checked == true) {
                        var sub_vendor_id = context.request.getSublistValue({
                            group: DATA.vendor_sublist,
                            name: DATA.sub_vendorid,
                            line: j
                        })
                        var sub_vendor_periode = context.request.getSublistValue({
                            group: DATA.vendor_sublist,
                            name: DATA.sub_periode,
                            line: j
                        })
                        var sub_vendor_mcpayment = context.request.getSublistValue({
                            group: DATA.vendor_sublist,
                            name: DATA.sub_mcpayment,
                            line: j
                        })
                        var sub_vendor_subsidiary = context.request.getSublistValue({
                            group: DATA.vendor_sublist,
                            name: DATA.sub_subsidiary,
                            line: j
                        })

                        var sub_vendor_currency = context.request.getSublistValue({
                            group: DATA.vendor_sublist,
                            name: DATA.sub_currency,
                            line: j
                        })


                        if (!checkedBillObj[sub_vendor_id]) {
                            checkedBillObj[sub_vendor_id] = {
                                sub_vendor_id: sub_vendor_id,
                                sub_vendor_periode: sub_vendor_periode,
                                sub_vendor_mcpayment: sub_vendor_mcpayment,
                                sub_vendor_subsidiary: sub_vendor_subsidiary,
                                sub_vendor_currency: sub_vendor_currency,
                            }
                        }
                    }
                }
                log.debug('checkedBillObj 1137 ' + Object.keys(checkedBillObj).length, checkedBillObj)
                
                if (Object.keys(checkedBillObj).length <= 0) {
                    log.debug("hello world", "hello world")
                    // var data_bill = getBill(data)
                    var data_vendor = getVendors()
                    log.debug("data vendor length"+ data_vendor.length, data_vendor)
                    if (data_vendor.length > 0) {
                        for (var i = 0; i < data_vendor.length; i++) {
                            var id_vendor = data_vendor[i].id_vendor;
                            var name_vendor = data_vendor[i].name_vendor;
                            var name_subsidiary = data_vendor[i].name_subsidiary;
                            var currency = data_vendor[i].currency;
                            // log.debug("name_vendor", name_vendor);
                            
                            vendor_sublist.setSublistValue({
                                id: DATA.sub_vendorid,
                                line: 0,
                                value: "id_vendor"
                            })
                            vendor_sublist.setSublistValue({
                                id: DATA.sub_vendor_name,
                                line: 0,
                                value: "name_vendor" 
                            })
                            vendor_sublist.setSublistValue({
                                id: DATA.sub_subsidiary,
                                line: 0,
                                value: "name_subsidiary"
                            })
                            vendor_sublist.setSublistValue({
                                id: DATA.sub_currency,
                                line: 0,
                                value: "currency"
                            })
                        }
                    }
                    
                }
                log.debug('checkedBillObj 1175 ' + Object.keys(checkedBillObj).length, checkedBillObj)

                form.addSubmitButton({ label: 'Submit' });
                // form.clientScriptModulePath = 'SuiteScripts/METRODATA/me_sl_tampil_report.js';


                // for(var bill in checkedBillObj){
                //     checkedBill.push(checkedBillObj[bill])
                // }
                if (Object.keys(checkedBillObj).length > 0) {
                    data.data_bill = checkedBillObj

                    // var create_payment = createPayment(data)
                }

            }

            context.response.writePage(form);
            var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
            log.debug('Remaining Usage FINALE:', remainingUsage);

        }

        return {
            onRequest: onRequest
        }
    });
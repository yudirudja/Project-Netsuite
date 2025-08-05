/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/ui/serverWidget', 'N/runtime', 'N/search', 'N/error', 'N/format', './config/me_config.js'],
 function (record, serverWidget, runtime, search, error, format, config) {

     const ITEM_ID = {
         ITEM_PEMBELIAN_IDR: 864,
         ITEM_PEMBELIAN_USD: 861,
         ITEM_PEMBELIAN_HKD: 863,
         ITEM_PEMBELIAN_SGD: 862,
     }
     const COA_ID = {
         UM_PEMBELIAN_IDR: 4490,
         UM_PEMBELIAN_USD: 4491,
         UM_PEMBELIAN_SGD: 4492,
         UM_PEMBELIAN_HKD: 4493,
         AP_CLEARING: 4502,
         PAK_CLEARING_IDR: 4474,
         PAK_CLEARING_USD: 4475,
         PAK_CLEARING_SGD: 4476,
         PAK_CLEARING_HKD: 4477
     }

     const CURRENCIES = {
         IDR: 1,	//Indonesia Rupiah (IDR)	
         USD: 2,	//US Dollar (USD)	
         CAD: 3,	//Canadian Dollar	
         EUR: 4,	//Euro	
         GBP: 5,	//British pound	
         HKD: 6,	//Hongkong Dollar (HKD)	
         SGD: 7,	//Singapore Dollar (SGD)	
         JPY: 8,	//Japanese Yen	
         XAU: 9,	//Gram	
     }

     const FLD_BC = {
         //HEADER
         form_id: 199,
         head_entity: 'entity',
         head_account: 'account',
         head_subsidiary: 'subsidiary',
         head_trandate: 'trandate',
         head_currency: 'currency',
         head_exchangerate: 'exchangerate',
         head_class: 'class',
         head_department: 'department',
         head_location: 'location',
         head_stmcap: 'custbody_me_stmcap_cstrx',

         //LINE Apply
         child_item: 'item',
         child_quantity: 'quantity',
         child_rate: 'rate',
         child_amount: 'amount',
         child_department: 'department',
         child_class: 'class',
         child_location: 'location',
         child_bill_id: 'internalid',


         //LINE Apply
         child_apply: 'apply',
         child_amount: 'amount',
         child_bill_id: 'internalid',
         child_isapplied: 'apply'
     }


     const FLD_MAP = {
         id: 'customtransaction_me_clearing_vp_1',
         head_customer: 'custbody_me_trx_arisan_customer',
         head_check: 'custbody_me_vendor_prepay',
         head_tranid: 'tranid',
         head_trandate: 'trandate',
         head_postingperiod: 'postingperiod',
         head_currency: 'currency',
         head_coa_ap: 'custbody_me_stmcap_coa_ap',

         head_subsidiary: 'subsidiary',
         head_department: 'department',
         head_class: 'class',
         head_location: 'location',
         head_bc: 'custbody_me_bill_credit_settlement',
         head_stmcap: 'custbody_me_stmcap_cstrx',

         head_exchangerate: 'exchangerate',
         head_origexchangerate: 'origexchangerate',
         head_fotofo_exrate: 'custbody_me_child_settle_ftf_ex_rate',
         head_bc_exrate: 'custbody_me_child_settle_ex_rstl_ridr',
         // head_bc_currency: 'custbody_me_child_settle_ex_rstl_ridr',
         // head_bc_coa_bank: 'custbody_me_child_settle_ex_rstl_ridr',

         child_line: 'line',
         child_account: 'account',
         child_entity: 'entity',
         child_debit: 'debit',
         child_credit: 'credit'
     }

     const FLD_CSTRX = {
         id: 'customtransaction_me_settlmnt_multicr_ap',
         head_form_id: 188,
         head_vendor: 'custbody_me_vendor',
         head_check: 'custbody_me_vendor_prepay',
         head_tranid: 'tranid',
         head_trandate: 'trandate',
         head_postingperiod: 'postingperiod',
         head_currency: 'custbody_me_vendor_prepayment_um_curr',
         head_coa_ap: 'custbody_me_stmcap_coa_ap',
         head_check_outstdg_amt: 'custbody_me_stmcap_check_outstdg_amt',

         head_subsidiary: 'subsidiary',
         head_department: 'department',
         head_class: 'class',
         head_location: 'location',

         head_fotofo_exrate: 'custbody_me_child_settle_ftf_ex_rate',
         head_bc: 'custbody_me_bill_credit_settlement',

         head_mc_acc_record: 'custbody_me_child_settle_clearing_tran',
         head_mc_exrate: 'custbody_me_child_settle_ex_rpum_ridr',
         head_mc_currency: 'custbody_me_vendor_prepayment_um_curr',

         head_bc_acc_record: 'custbody_me_child_settle_clearing_tra2',
         head_bc_exrate: 'custbody_me_child_settle_ex_rstl_ridr',
         head_bc_currency: 'custbody_me_child_settle_currency',

         //LINE
         child_parent: 'recmachcustrecord_me_csrec_stmcap_parent',
         child_bill_id: 'custrecord_me_csrec_stmcap_bill_id',
         child_bill_trandate: 'custrecord_me_csrec_stmcap_bill_trandate',
         child_bill_vendor: 'custrecord_me_csrec_stmcap_bill_vendor',
         child_bill_currency: 'custrecord_me_csrec_stmcap_bill_currency',
         child_bill_origin_namt: 'custrecord_me_csrec_stmcap_bill_orig_amt',
         child_bill_outstdg_amt: 'custrecord_me_csrec_stmcap_bill_otsdgamt',
         child_mcpayment_amt: 'custrecord_me_csrec_stmcap_check_amount',
         child_mcpaymentidr_amt: 'custrecord_me_csrec_stmcap_check_amt_idr',
         child_mc_currency: 'custrecord_me_csrec_stmcap_check_currenc',
         child_bcpayment_amt: 'custrecord_me_csrec_stmcap_bc_amount',
         child_bcpaymentidr_amt: 'custrecord_me_csrec_stmcap_bc_amt_idr',
     }

     function updateBillCredit(data) {
         try {
             log.debug('data updateBillCredit', data)
             var bc_id = data.bc_id
             var customer = data.customer
             var subsidiary = data.subsidiary
             var department = data.department
             var class_ = data.class_
             var coa_clearing_idr = data.coa_clearing_idr
             var location = data.location
             var trandate = data.trandate
             var settlmnt_trandate = data.settlmnt_trandate
             var total_mcpayment = data.total_mc_payment_new
             var total_bcpayment = data.total_bc_payment_new
             var bc_coa_ar = data.bc_coa_ar
             var bc_currency = data.bc_currency
             var bc_exchange_rate = data.to_bc_exrate
             var data_bill = data.data_bill

             try {
                 var rec_bc = record.load({
                     type: record.Type.VENDOR_CREDIT,
                     id: bc_id,
                     isDynamic: true

                 })
                 log.debug('rec_bc 344', rec_bc)

             } catch (error) {
                 throw ('Error record.load: ' + error)
             }
             rec_bc.setText({
                 fieldId: FLD_BC.head_trandate,
                 text: settlmnt_trandate
             })
             rec_bc.setValue({
                 fieldId: FLD_BC.head_class,
                 value: class_,
                 ignoreFieldChange: true
             })
             rec_bc.setValue({
                 fieldId: FLD_BC.head_department,
                 value: department,
                 ignoreFieldChange: true
             })
             rec_bc.setValue({
                 fieldId: FLD_BC.head_location,
                 value: location,
                 ignoreFieldChange: true
             })
             rec_bc.setValue({
                 fieldId: FLD_BC.head_exchangerate,
                 value: bc_exchange_rate,
                 ignoreFieldChange: true
             })

             var line_count = rec_bc.getLineCount(FLD_BC.child_item)
             for (var d = line_count - 1; d >= 0; d--) {
                 rec_bc.removeLine({
                     sublistId: FLD_BC.child_item,
                     line: d,
                     ignoreRecalc: true
                 });
             }

             var currencytxt = rec_bc.getText(FLD_BC.head_currency)
             var item_um = 0
             if (currencytxt.toLowerCase().indexOf('usd') != -1) {
                 item_um = ITEM_ID.ITEM_PEMBELIAN_USD
             } else if (currencytxt.toLowerCase().indexOf('sgd') != -1) {
                 item_um = ITEM_ID.ITEM_PEMBELIAN_SGD
             } else if (currencytxt.toLowerCase().indexOf('hkd') != -1) {
                 item_um = ITEM_ID.ITEM_PEMBELIAN_HKD
             } else if (currencytxt.toLowerCase().indexOf('idr') != -1) {
                 item_um = ITEM_ID.ITEM_PEMBELIAN_IDR
             }
             rec_bc.selectNewLine({
                 sublistId: FLD_BC.child_item
             })
             rec_bc.setCurrentSublistValue({
                 sublistId: FLD_BC.child_item,
                 fieldId: FLD_BC.child_item,
                 value: item_um
             })
             rec_bc.setCurrentSublistValue({
                 sublistId: FLD_BC.child_item,
                 fieldId: FLD_BC.child_quantity,
                 value: 1
             })
             rec_bc.setCurrentSublistValue({
                 sublistId: FLD_BC.child_item,
                 fieldId: FLD_BC.child_rate,
                 value: total_bcpayment
             })
             rec_bc.setCurrentSublistValue({
                 sublistId: FLD_BC.child_item,
                 fieldId: FLD_BC.child_department,
                 value: department
             })
             rec_bc.setCurrentSublistValue({
                 sublistId: FLD_BC.child_item,
                 fieldId: FLD_BC.child_class,
                 value: class_
             })
             rec_bc.setCurrentSublistValue({
                 sublistId: FLD_BC.child_item,
                 fieldId: FLD_BC.child_location,
                 value: location
             })
             rec_bc.commitLine({
                 sublistId: FLD_BC.child_item
             })



             var count = rec_bc.getLineCount(FLD_BC.child_apply)

             log.debug('count', count)
             for (var i = 0; i < count; i++) {

                 var line_bill_id = rec_bc.getSublistValue({
                     sublistId: FLD_BC.child_apply,
                     fieldId: FLD_BC.child_bill_id,
                     line: i
                 })

                 if (line_bill_id in data_bill) {
                     var line_index = rec_bc.getCurrentSublistIndex({
                         sublistId: FLD_BC.child_apply
                     });
                     log.debug('line_bill', line_index + "____" + i)
                     log.debug('Bill Ketemu, id bill: ' + line_bill_id, data_bill[line_bill_id])

                     rec_bc.selectLine({
                         sublistId: FLD_BC.child_apply,
                         line: i
                     });

                     if (data_bill[line_bill_id].bc_payment_new > 0) {
                         rec_bc.setCurrentSublistValue({
                             sublistId: FLD_BC.child_apply,
                             fieldId: FLD_BC.child_isapplied,
                             value: true,
                             // ignoreFieldChange: true
                         })

                         rec_bc.setCurrentSublistValue({
                             sublistId: FLD_BC.child_apply,
                             fieldId: FLD_BC.child_amount,
                             value: Number(data_bill[line_bill_id].bc_payment_new),
                             // ignoreFieldChange: true
                         })
                         var isApplied1 = rec_bc.getCurrentSublistValue('apply', 'apply')
                         var amountApplied1 = rec_bc.getCurrentSublistValue('apply', 'amount')


                         log.debug('isApplied1 + amountApplied1', isApplied1 + ' | ' + amountApplied1)
                     } else if (data_bill[line_bill_id].bc_payment_new <= 0) {
                         rec_bc.setCurrentSublistValue({
                             sublistId: FLD_BC.child_apply,
                             fieldId: FLD_BC.child_isapplied,
                             value: false
                         })
                     }
                     var isApplied = rec_bc.getCurrentSublistValue('apply', 'apply')
                     var amountApplied = rec_bc.getCurrentSublistValue('apply', 'amount')


                     log.debug('isApplied + amountApplied', isApplied + ' | ' + amountApplied)
                     log.debug('total applied', rec_bc.getValue('applied'))
                     rec_bc.commitLine(FLD_BC.child_apply)

                 } else {
                     continue;
                 }
             }
             log.debug('total AKHIR amount item', rec_bc.getValue('usertotal'))
             log.debug('total AKHIR unapplied', rec_bc.getValue('unapplied'))
             log.debug('total AKHIR applied', rec_bc.getValue('applied'))

             count = rec_bc.getLineCount(FLD_BC.child_apply)
             for (var i = 0; i < count; i++) {
                 var isApplied = rec_bc.getSublistValue({
                     sublistId: FLD_BC.child_apply,
                     fieldId: FLD_BC.child_isapplied,
                     line: i
                 })
                 // log.debug('isApplied true get', isApplied)
                 if (isApplied || isApplied == 'T') {
                     var bill_id = rec_bc.getSublistValue({
                         sublistId: FLD_BC.child_apply,
                         fieldId: FLD_BC.child_bill_id,
                         line: i
                     })
                     var amount_applied = rec_bc.getSublistValue({
                         sublistId: FLD_BC.child_apply,
                         fieldId: FLD_BC.child_amount,
                         line: i
                     })
                     log.debug('bill_id', bill_id + ' | amount: ' + amount_applied + ' | isApplied: ' + isApplied)
                 }
             }



             log.debug('rec_bc 215', rec_bc)
             var recbc_length = rec_bc.length
             var bc_id = rec_bc.save()


             return bc_id
         } catch (error) {
             throw ('Error Updating Bill Credit ' + error)
         }
     }

     function updateMCPayment(data) {

         try {
             log.debug('data createMCPayment', data)
             var customer = data.customer
             var subsidiary = data.subsidiary
             var department = data.department
             var class_ = data.class_
             var coa_clearing_idr = data.coa_clearing_idr
             var location = data.location
             var trandate = data.trandate
             var settlmnt_trandate = data.settlmnt_trandate
             var fotofo_exrate = data.fotofo_exrate

             var total_mcpayment = data.total_mc_payment_new
             var total_bcpayment = data.total_bc_payment_new

             var mc_currency = data.mc_currency
             var mc_exchange_rate = data.from_mc_exrate
             var bc_coa_ar = data.bc_coa_ar
             var bc_currency = data.bc_currency
             var bc_exchange_rate = data.to_bc_exrate
             var mc_from_record = data.from_mc_record
             var mc_to_record = data.to_bc_record

             // Create Journal MC Payment FROM
             var rec_mc_from = record.load({
                 type: 'customtransaction_me_clearing_vp_1',
                 id: mc_from_record,
                 isDynamic: true

             })

             var currency = rec_mc_from.getValue('currency')
             var currencytxt = rec_mc_from.getText('currency')
             var coa_um = 0
             if (currencytxt.toLowerCase().indexOf('usd') != -1) {
                 coa_um = COA_ID.UM_PEMBELIAN_USD
             } else if (currencytxt.toLowerCase().indexOf('sgd') != -1) {
                 coa_um = COA_ID.UM_PEMBELIAN_SGD
             } else if (currencytxt.toLowerCase().indexOf('hkd') != -1) {
                 coa_um = COA_ID.UM_PEMBELIAN_HKD
             } else if (currencytxt.toLowerCase().indexOf('idr') != -1) {
                 coa_um = COA_ID.UM_PEMBELIAN_IDR
             }
             rec_mc_from.setValue({
                 fieldId: FLD_MAP.head_class,
                 value: class_,
                 ignoreFieldChange: true
             })
             rec_mc_from.setValue({
                 fieldId: FLD_MAP.head_department,
                 value: department,
                 ignoreFieldChange: true
             })
             rec_mc_from.setValue({
                 fieldId: FLD_MAP.head_location,
                 value: location,
                 ignoreFieldChange: true
             })
             rec_mc_from.setValue({
                 fieldId: FLD_MAP.head_exchangerate,
                 value: mc_exchange_rate
             })

             var line_count = rec_mc_from.getLineCount(FLD_MAP.child_line)
             for (var d = line_count - 1; d >= 0; d--) {
                 rec_mc_from.removeLine({
                     sublistId: FLD_MAP.child_line,
                     line: d,
                     ignoreRecalc: true
                 });
             }
             // L I N E   D E B I T
             rec_mc_from.selectNewLine({
                 sublistId: FLD_MAP.child_line
             })
             rec_mc_from.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_account,
                 value: COA_ID.AP_CLEARING
             })
             rec_mc_from.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_debit,
                 value: total_mcpayment
             })
             rec_mc_from.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_entity,
                 value: customer
             })
             rec_mc_from.commitLine({
                 sublistId: FLD_MAP.child_line
             })


             // L I N E   C R E D I T

             rec_mc_from.selectNewLine({
                 sublistId: FLD_MAP.child_line
             })
             rec_mc_from.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_account,
                 value: coa_um
             })
             rec_mc_from.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_credit,
                 value: total_mcpayment
             })
             rec_mc_from.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_entity,
                 value: customer
             })
             rec_mc_from.commitLine({
                 sublistId: FLD_MAP.child_line
             })

             var mc_from_id = rec_mc_from.save()



             // Create Journal MC Payment TO
             var rec_mc_to = record.load({
                 type: 'customtransaction_me_clearing_vp_1',
                 id: mc_to_record,
                 isDynamic: true

             })

             var currency = rec_mc_to.getValue('currency')
             var currencytxt = rec_mc_to.getText('currency')
             var coa_um = 0
             if (currencytxt.toLowerCase().indexOf('usd') != -1) {
                 coa_um = COA_ID.UM_PEMBELIAN_USD
             } else if (currencytxt.toLowerCase().indexOf('sgd') != -1) {
                 coa_um = COA_ID.UM_PEMBELIAN_SGD
             } else if (currencytxt.toLowerCase().indexOf('hkd') != -1) {
                 coa_um = COA_ID.UM_PEMBELIAN_HKD
             } else if (currencytxt.toLowerCase().indexOf('idr') != -1) {
                 coa_um = COA_ID.UM_PEMBELIAN_IDR
             }

             rec_mc_to.setValue({
                 fieldId: FLD_MAP.head_class,
                 value: class_,
                 ignoreFieldChange: true
             })
             rec_mc_to.setValue({
                 fieldId: FLD_MAP.head_department,
                 value: department,
                 ignoreFieldChange: true
             })
             rec_mc_to.setValue({
                 fieldId: FLD_MAP.head_location,
                 value: location,
                 ignoreFieldChange: true
             })
             rec_mc_to.setValue({
                 fieldId: FLD_MAP.head_exchangerate,
                 value: bc_exchange_rate
             })

             var line_count = rec_mc_to.getLineCount(FLD_MAP.child_line)
             for (var d = line_count - 1; d >= 0; d--) {
                 rec_mc_to.removeLine({
                     sublistId: FLD_MAP.child_line,
                     line: d,
                     ignoreRecalc: true
                 });
             }

             // L I N E   D E B I T
             rec_mc_to.selectNewLine({
                 sublistId: FLD_MAP.child_line
             })
             rec_mc_to.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_account,
                 value: coa_um
             })
             rec_mc_to.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_debit,
                 value: total_bcpayment
             })
             rec_mc_to.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_entity,
                 value: customer
             })
             rec_mc_to.commitLine({
                 sublistId: FLD_MAP.child_line
             })


             // L I N E   C R E D I T

             rec_mc_to.selectNewLine({
                 sublistId: FLD_MAP.child_line
             })

             rec_mc_to.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_account,
                 value: COA_ID.AP_CLEARING
             })
             rec_mc_to.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_credit,
                 value: total_bcpayment
             })
             rec_mc_to.setCurrentSublistValue({
                 sublistId: FLD_MAP.child_line,
                 fieldId: FLD_MAP.child_entity,
                 value: customer
             })
             rec_mc_to.commitLine({
                 sublistId: FLD_MAP.child_line
             })

             var mc_to_id = rec_mc_to.save()


             return { mc_from: mc_from_id, mc_to: mc_to_id }
         } catch (error) {
             throw ('Error Updating Multicurrency Payment ' + error)
         }
     }


     function beforeSubmit(context) {
         if (context.type != context.UserEventType.CREATE && runtime.executionContext !== runtime.ContextType.SUITELET) {
             var newRec = context.newRecord;
             var oldRec = context.oldRecord;
             var cstrx_id = oldRec.id
             var rec_type = newRec.type

             var check = newRec.getValue(FLD_CSTRX.head_check)
             var bc_id = newRec.getValue(FLD_CSTRX.head_bc)
             var subsidiary = newRec.getValue(FLD_CSTRX.head_subsidiary)
             var class_ = newRec.getValue(FLD_CSTRX.head_class)
             var department = newRec.getValue(FLD_CSTRX.head_department)
             var location = newRec.getValue(FLD_CSTRX.head_location)
             var trandate = newRec.getValue(FLD_CSTRX.head_trandate)

             var from_acc_record = newRec.getValue(FLD_CSTRX.head_mc_acc_record)
             var from_acc_exrate = Number(newRec.getValue(FLD_CSTRX.head_mc_exrate))
             var from_acc_currency = newRec.getValue(FLD_CSTRX.head_mc_currency)

             var to_acc_record = newRec.getValue(FLD_CSTRX.head_bc_acc_record)
             var to_acc_exrate = Number(newRec.getValue(FLD_CSTRX.head_bc_exrate))
             var to_acc_currency = newRec.getValue(FLD_CSTRX.head_bc_currency)

             var total_mc_payment_old = 0
             var total_bc_payment_old = 0

             var total_mc_payment_new = 0
             var total_bc_payment_new = 0
             var data_bill = {}

             var oldLineCount = oldRec.getLineCount(FLD_CSTRX.child_parent)
             for (var i = 0; i < oldLineCount; i++) {
                 var bill_id = parseFloat(oldRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_bill_id, i))
                 var mc_payment = parseFloat(oldRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_mcpayment_amt, i))
                 var bc_payment = parseFloat(oldRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_bcpayment_amt, i))
                 total_mc_payment_old += mc_payment
                 total_bc_payment_old += bc_payment
                 if (!data_bill[bill_id]) {
                     data_bill[bill_id] = {
                         bill_id: bill_id,
                         mc_payment_old: mc_payment,
                         bc_payment_old: bc_payment,
                         mc_payment_new: 0,
                         bc_payment_new: 0
                     }
                 }
             }

             if (context.type == context.UserEventType.DELETE) {
                 var data = {
                     type: 'DELETE',
                     cstrx_id: cstrx_id,
                     check: check,
                     bc_id: bc_id,
                     subsidiary: subsidiary,
                     class_: class_,
                     department: department,
                     location: location,
                     trandate: trandate,
                     total_mc_payment_old: total_mc_payment_old,
                     total_bc_payment_old: total_bc_payment_old,

                     from_acc_record: from_acc_record,
                     from_acc_exrate: from_acc_exrate,
                     from_acc_currency: from_acc_currency,

                     to_acc_record: to_acc_record,
                     to_acc_exrate: to_acc_exrate,
                     to_acc_currency: to_acc_currency,
                     data_bill: data_bill

                 }
                 log.debug('Object Data ' + data.type, data)

                 try {
                     // Update Payment Multicurrency
                     var update_from_rec = record.submitFields({
                         type: FLD_MAP.id,
                         id: from_acc_record,
                         values: {
                             'custbody_me_stmcap_cstrx': ''
                         }
                     })
                     var update_to_rec = record.submitFields({
                         type: FLD_MAP.id,
                         id: to_acc_record,
                         values: {
                             'custbody_me_stmcap_cstrx': ''
                         }
                     })
                     log.debug('Berhasil Update Payment MC case delete')

                     //Update Check
                     var check_rec = search.lookupFields({
                         type: search.Type.CHECK,
                         id: data.check,
                         columns: ["tranid", "custbody_me_stmcap_cstrx", 'custbody_me_settlement_amount']
                     })
                     log.debug('check_rec', check_rec)
                     var cstrx_arr = check_rec.custbody_me_stmcap_cstrx
                     var new_cstrx_arr = []
                     var new_settlement_amt = parseFloat(check_rec.custbody_me_settlement_amount)
                     new_settlement_amt -= parseFloat(data.total_mc_payment_old) || 0

                     if (cstrx_arr.length > 0) {
                         for (var i = 0; i < cstrx_arr.length; i++) {
                             if (cstrx_arr[i].value != data.cstrx_id) {

                                 new_cstrx_arr.push(cstrx_arr[i].value)
                             }
                         }
                     }

                     var update_check = record.submitFields({
                         type: record.Type.CHECK,
                         id: data.check,
                         values: {
                             'custbody_me_stmcap_cstrx': new_cstrx_arr,
                             'custbody_me_settlement_amount': new_settlement_amt
                         }
                     })
                     log.debug('Berhasil Update Check case delete')


                     // Update Check
                     for (var bill in data.data_bill) {
                         var bill_rec = search.lookupFields({
                             type: search.Type.VENDOR_BILL,
                             id: bill,
                             columns: ["tranid", "custbody_me_stmcap_cstrx"]
                         })
                         log.debug('bill_rec', bill_rec)
                         var cstrx_arr = bill_rec.custbody_me_stmcap_cstrx
                         var new_cstrx_arr = []
                         if (cstrx_arr.length > 0) {
                             for (var i = 0; i < cstrx_arr.length; i++) {
                                 if (cstrx_arr[i].value != data.cstrx_id) {
                                     new_cstrx_arr.push(cstrx_arr[i].value)
                                 }
                             }
                         }

                         var update_bill = record.submitFields({
                             type: record.Type.VENDOR_BILL,
                             id: bill,
                             values: {
                                 'custbody_me_stmcap_cstrx': new_cstrx_arr
                             }
                         })
                     }
                     log.debug('Berhasil Update Check case delete')

                     // Update Bill Credit
                     var update_bc = record.submitFields({
                         type: record.Type.VENDOR_CREDIT,
                         id: data.bc_id,
                         values: {
                             'custbody_me_stmcap_cstrx': ''
                         }
                     })
                     log.debug('Berhasil update Bill Credit case delete')

                     // Update CSTRX Settlement
                     var update_cstrx = record.submitFields({
                         type: FLD_CSTRX.id,
                         id: cstrx_id,
                         values: {
                             'custbody_me_child_settle_clearing_tran': '',
                             'custbody_me_child_settle_clearing_tra2': ''
                         }
                     })
                     log.debug('Berhasil update cstrx case delete ')


                     // Delete Payment
                     record.delete({
                         type: FLD_CSTRX.id,
                         id: data.from_acc_record,
                     })
                     record.delete({
                         type: FLD_CSTRX.id,
                         id: data.to_acc_record,
                     })
                     log.debug('Berhasil delete payment case delete')

                     // Delete Bill Credit
                     record.delete({
                         type: record.Type.VENDOR_CREDIT,
                         id: data.bc_id,
                     })
                     log.debug('Berhasil delete Bill Credit case delete')


                 } catch (error) {
                     throw ('Failed to Delete Record. ' + error)
                 }

             }

             if (context.type == context.UserEventType.EDIT) {
                 var newLineCount = newRec.getLineCount(FLD_CSTRX.child_parent)
                 for (var i = 0; i < newLineCount; i++) {
                     var bill_id = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_bill_id, i))
                     var mc_payment = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_mcpayment_amt, i))
                     var bc_payment = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_bcpayment_amt, i))
                     total_mc_payment_new += mc_payment
                     total_bc_payment_new += bc_payment
                     if (!data_bill[bill_id]) {
                         data_bill[bill_id] = {
                             bill_id: bill_id,
                             mc_payment_old: 0,
                             bc_payment_old: 0,
                             mc_payment_new: mc_payment,
                             bc_payment_new: bc_payment
                         }
                     } else {
                         data_bill[bill_id].mc_payment_new = data_bill[bill_id].mc_payment_new + mc_payment
                         data_bill[bill_id].bc_payment_new = data_bill[bill_id].bc_payment_new + bc_payment
                     }
                 }

                 var data = {
                     type: 'EDIT',
                     cstrx_id: cstrx_id,
                     check: check,
                     bc_id: bc_id,
                     subsidiary: subsidiary,
                     class_: class_,
                     department: department,
                     location: location,
                     settlmnt_trandate: trandate,
                     total_mc_payment_old: total_mc_payment_old,
                     total_bc_payment_old: total_bc_payment_old,
                     total_mc_payment_new: total_mc_payment_new,
                     total_bc_payment_new: total_bc_payment_new,

                     from_mc_record: from_acc_record,
                     from_mc_exrate: from_acc_exrate,
                     from_mc_currency: from_acc_currency,

                     to_bc_record: to_acc_record,
                     to_bc_exrate: to_acc_exrate,
                     to_bc_currency: to_acc_currency,
                     data_bill: data_bill

                 }
                 log.debug('Object Data ' + data.type, data)

                 try {

                     //Update Check
                     var check_rec = search.lookupFields({
                         type: search.Type.CHECK,
                         id: data.check,
                         columns: ["tranid", "custbody_me_stmcap_cstrx", 'custbody_me_settlement_amount']
                     })
                     log.debug('check_rec case edit', check_rec)
                     var new_settlement_amt = parseFloat(check_rec.custbody_me_settlement_amount)
                     new_settlement_amt -= parseFloat(data.total_mc_payment_old) || 0
                     new_settlement_amt += parseFloat(total_mc_payment_new) || 0


                     // Update Bill
                     for (var bill in data_bill) {
                         if (data_bill[bill].bc_payment_new == 0) {
                             var bill_rec = search.lookupFields({
                                 type: search.Type.VENDOR_BILL,
                                 id: bill,
                                 columns: ["tranid", "custbody_me_stmcap_cstrx"]
                             })
                             log.debug('bill_rec', bill_rec)
                             var cstrx_arr = bill_rec.custbody_me_stmcap_cstrx
                             var new_cstrx_arr = []
                             if (cstrx_arr.length > 0) {
                                 for (var i = 0; i < cstrx_arr.length; i++) {
                                     if (cstrx_arr[i].value != data.cstrx_id) {
                                         new_cstrx_arr.push(cstrx_arr[i].value)
                                     }
                                 }
                             }

                             var update_bill = record.submitFields({
                                 type: record.Type.VENDOR_BILL,
                                 id: bill,
                                 values: {
                                     'custbody_me_stmcap_cstrx': new_cstrx_arr
                                 }
                             })
                         } else if (data_bill[bill].bc_payment_old == 0) {
                             var bill_rec = search.lookupFields({
                                 type: search.Type.VENDOR_BILL,
                                 id: bill,
                                 columns: ["tranid", "custbody_me_stmcap_cstrx"]
                             })
                             log.debug('bill_rec bc payment old == 0', bill_rec)
                             var cstrx_arr = bill_rec.custbody_me_stmcap_cstrx
                             var new_cstrx_arr = [cstrx_id]
                             if (cstrx_arr.length > 0) {
                                 for (var i = 0; i < cstrx_arr.length; i++) {
                                     new_cstrx_arr.push(cstrx_arr[i].value)
                                 }
                             }

                             var update_bill = record.submitFields({
                                 type: record.Type.VENDOR_BILL,
                                 id: bill,
                                 values: {
                                     'custbody_me_stmcap_cstrx': new_cstrx_arr
                                 }
                             })
                         }
                     }
                     log.debug('Berhasil Update Vendor Bill case edit')


                     // Update Bill Credit
                     var update_bc = updateBillCredit(data)
                     log.debug('Berhasil update Bill Credit case edit')


                     // Update MC Payment
                     var update_bc = updateMCPayment(data)
                     log.debug('Berhasil update MC Payment case edit')

                     // Update Check
                     var update_check = record.submitFields({
                         type: record.Type.CHECK,
                         id: data.check,
                         values: {
                             'custbody_me_settlement_amount': new_settlement_amt
                         }
                     })
                     log.debug('Berhasil Update Check case edit')


                 } catch (error) {
                     throw ('Failed to Update Record. ' + error)
                 }
             }
         }
     }

     function saveClearing1(data, settlementId) {
         log.debug('Data SaveClearing 1', data)
         var recClearing1 = record.create({
             type: FLD_MAP.id,
             isDynamic: true,
         });

         recClearing1.setValue(FLD_MAP.head_subsidiary, data.classification_subsidiary);
         recClearing1.setValue(FLD_MAP.head_class, data.classification_class);
         recClearing1.setValue(FLD_MAP.head_location, data.classification_location);
         recClearing1.setValue(FLD_MAP.head_department, data.classification_department);
         recClearing1.setValue(FLD_MAP.head_currency, data.currency);

         recClearing1.setValue(FLD_MAP.head_stmcap, settlementId);
         var getSettlementId = recClearing1.getValue(FLD_MAP.head_stmcap);
         // getSettlementId.push(settlementId)

         // var setSettlementId = recClearing1.setValue({
         //     fieldId: 'custbody_me_stmcap_cstrx',
         //     value: getSettlementId,
         // })
         var dateSettlement = recClearing1.setText({
             fieldId: FLD_MAP.head_trandate,
             text: (data.settle_date),
         });
         var lineValue = data.total_mcpayment;
         // for (let i = 0; i < data.data_bill.length; i++) {
         //     lineValue += Number(data.data_bill[i].mcpayment);

         // }

         let accountId = 0;

         if (data.currency == CURRENCIES.IDR) {
             accountId = COA_ID.UM_PEMBELIAN_IDR;
         } else if (data.currency == CURRENCIES.USD) {
             accountId = COA_ID.UM_PEMBELIAN_USD;
         } else if (data.currency == CURRENCIES.SGD) {
             accountId = COA_ID.UM_PEMBELIAN_SGD
         } else if (data.currency == CURRENCIES.HKD) {
             accountId = COA_ID.UM_PEMBELIAN_HKD
         }

         recClearing1.setValue('exchangerate', data.exrate_pum_to_idr);

         // SET DEBIT
         recClearing1.selectNewLine(FLD_MAP.child_line);

         recClearing1.setCurrentSublistValue({
             sublistId: FLD_MAP.child_line,
             fieldId: FLD_MAP.child_account,
             value: COA_ID.AP_CLEARING,
         });
         recClearing1.setCurrentSublistValue({
             sublistId: FLD_MAP.child_line,
             fieldId: FLD_MAP.child_debit,
             value: lineValue,
         });
         recClearing1.commitLine(FLD_MAP.child_line);

         // SET CREDIT
         recClearing1.selectNewLine(FLD_MAP.child_line)

         recClearing1.setCurrentSublistValue({
             sublistId: FLD_MAP.child_line,
             fieldId: FLD_MAP.child_account,
             value: accountId,
         });

         recClearing1.setCurrentSublistValue({
             sublistId: FLD_MAP.child_line,
             fieldId: FLD_MAP.child_credit,
             value: lineValue,
         });
         recClearing1.commitLine(FLD_MAP.child_line);
         var saveClearing1 = recClearing1.save()

         return saveClearing1

     }

     function saveClearing2(data, settlementId) {
         log.debug('Data SaveClearing 2', data)
         var recClearing2 = record.create({
             type: FLD_MAP.id,
             isDynamic: true,
         });

         recClearing2.setValue(FLD_MAP.head_subsidiary, data.classification_subsidiary);
         recClearing2.setValue(FLD_MAP.head_class, data.classification_class);
         recClearing2.setValue(FLD_MAP.head_location, data.classification_location);
         recClearing2.setValue(FLD_MAP.head_department, data.classification_department);
         recClearing2.setValue(FLD_MAP.head_currency, data.settle_currency);
         var dateSettlement = recClearing2.setText({
             fieldId: FLD_MAP.head_trandate,
             text: (data.settle_date),
         });
         recClearing2.setValue(FLD_MAP.head_stmcap, settlementId);
         var getSettlementId = recClearing2.getValue(FLD_MAP.head_stmcap);
         // getSettlementId.push(settlementId)

         // var setSettlementId = recClearing2.setValue({
         //     fieldId: 'custbody_me_settlement_vendor_prpmt_re',
         //     value: getSettlementId,
         // })

         var lineValue = data.total_bcpayment;
         // for (let i = 0; i < data.data_bill.length; i++) {
         //     lineValue += Number(data.data_bill[i].subBillSettlementAmount);

         // }

         var accountIdDebit = 0;

         if (data.currency == CURRENCIES.IDR) {
             accountIdDebit = COA_ID.PAK_CLEARING_IDR;
         } else if (data.currency == CURRENCIES.USD) {
             accountIdDebit = COA_ID.PAK_CLEARING_USD;
         } else if (data.currency == CURRENCIES.SGD) {
             accountIdDebit = COA_ID.PAK_CLEARING_SGD
         } else if (data.currency == CURRENCIES.HKD) {
             accountIdDebit = COA_ID.PAK_CLEARING_HKD
         }

         var accountIdCred = 0;

         if (data.settle_currency == CURRENCIES.IDR) {
             accountIdCred = COA_ID.UM_PEMBELIAN_IDR;
         } else if (data.settle_currency == CURRENCIES.USD) {
             accountIdCred = COA_ID.UM_PEMBELIAN_USD;
         } else if (data.settle_currency == CURRENCIES.SGD) {
             accountIdCred = COA_ID.UM_PEMBELIAN_SGD
         } else if (data.settle_currency == CURRENCIES.HKD) {
             accountIdCred = COA_ID.UM_PEMBELIAN_HKD
         }

         //SET DEBIT
         recClearing2.setValue(FLD_MAP.head_exchangerate, data.settle_exrate_settle_to_idr);
         recClearing2.selectNewLine(FLD_MAP.child_line);

         recClearing2.setCurrentSublistValue({
             sublistId: FLD_MAP.child_line,
             fieldId: FLD_MAP.child_account,
             value: accountIdCred,
         });
         recClearing2.setCurrentSublistValue({
             sublistId: FLD_MAP.child_line,
             fieldId: FLD_MAP.child_debit,
             value: lineValue,
         });
         recClearing2.commitLine(FLD_MAP.child_line);

         // SET CREDIT
         recClearing2.selectNewLine(FLD_MAP.child_line)

         recClearing2.setCurrentSublistValue({
             sublistId: FLD_MAP.child_line,
             fieldId: FLD_MAP.child_account,
             value: COA_ID.AP_CLEARING,
         });

         recClearing2.setCurrentSublistValue({
             sublistId: FLD_MAP.child_line,
             fieldId: FLD_MAP.child_credit,
             value: lineValue,
         });
         recClearing2.commitLine(FLD_MAP.child_line);
         var saveClearing2 = recClearing2.save();

         return saveClearing2;
     }

     function saveBillCredit(data, settlementId) {
         log.debug('Data SaveBillCredit', data)

         var recBillCredit = record.create({
             type: record.Type.VENDOR_CREDIT,
             isDynamic: true,
         });

         recBillCredit.setValue(FLD_BC.head_entity, data.vendor);
         recBillCredit.setValue(FLD_BC.head_account, data.settle_account_ap);
         recBillCredit.setValue(FLD_BC.head_subsidiary, data.classification_subsidiary);
         recBillCredit.setValue(FLD_BC.head_currency, data.settle_currency);
         recBillCredit.setValue(FLD_BC.head_exchangerate, data.settle_exrate_settle_to_idr);
         recBillCredit.setValue(FLD_BC.head_department, data.classification_department);
         recBillCredit.setValue(FLD_BC.head_location, data.classification_location);
         recBillCredit.setValue(FLD_BC.head_class, data.classification_class);

         recBillCredit.setValue(FLD_BC.head_stmcap, settlementId);
         // var getSettlementId = recBillCredit.getValue('custbody_me_settlement_vendor_prpmt_re');
         // getSettlementId.push(settlementId)

         // var setSettlementId = recBillCredit.setValue({
         //     fieldId: 'custbody_me_settlement_vendor_prpmt_re',
         //     value: getSettlementId,
         // })

         var item_pembelian = -1
         if (data.settle_currency == CURRENCIES.IDR) {
             item_pembelian = ITEM_ID.ITEM_PEMBELIAN_IDR
         } else if (data.settle_currency == CURRENCIES.USD) {
             item_pembelian = ITEM_ID.ITEM_PEMBELIAN_USD
         } else if (data.settle_currency == CURRENCIES.SGD) {
             item_pembelian = ITEM_ID.ITEM_PEMBELIAN_SGD
         } else if (data.settle_currency == CURRENCIES.HKD) {
             item_pembelian = ITEM_ID.ITEM_PEMBELIAN_HKD
         }

         var lineValue = data.total_bcpayment;
         // for (let i = 0; i < data.data_bill.length; i++) {
         //     lineValue += Number(data.data_bill[i].subBillSettlementAmount);
         // }

         var lineItem = recBillCredit.selectLine({
             sublistId: FLD_BC.child_item,
             line: 0
         });

         recBillCredit.setCurrentSublistValue({
             sublistId: FLD_BC.child_item,
             fieldId: FLD_BC.child_item,
             value: item_pembelian
         });

         recBillCredit.setCurrentSublistValue({
             sublistId: FLD_BC.child_item,
             fieldId: FLD_BC.child_rate,
             value: lineValue,
         });
         recBillCredit.setCurrentSublistValue({
             sublistId: FLD_BC.child_item,
             fieldId: FLD_BC.child_amount,
             value: lineValue,
         });
         recBillCredit.setCurrentSublistValue({
             sublistId: FLD_BC.child_item,
             fieldId: FLD_BC.child_department,
             value: data.classification_department,
         });
         recBillCredit.setCurrentSublistValue({
             sublistId: FLD_BC.child_item,
             fieldId: FLD_BC.child_location,
             value: data.classification_location,
         });
         recBillCredit.setCurrentSublistValue({
             sublistId: FLD_BC.child_item,
             fieldId: FLD_BC.child_class,
             value: data.classification_class,
         });
         recBillCredit.commitLine(FLD_BC.child_item);



         var getLineCountBC = recBillCredit.getLineCount(FLD_BC.child_apply);
         log.debug("getLineCountBC", getLineCountBC)

         for (let x = 0; x < getLineCountBC; x++) {

             var getIdBill = recBillCredit.getSublistValue({
                 sublistId: FLD_BC.child_apply,
                 fieldId: 'doc',
                 line: x
             });
             for (let i = 0; i < data.data_bill.length; i++) {
                 if (data.data_bill[i].subBillId == getIdBill) {
                     log.debug('data.data_bill[i]', data.data_bill[i])
                     // log.debug("getIdBill", getIdBill + " == " + data.data_bill[i].subBillId)
                     // log.debug("getAMount", getIdBill + " == " + data.data_bill[i].subBillId + "__" + data.data_bill[i].subBillPrepaymentAmount)
                     recBillCredit.selectLine({
                         sublistId: FLD_BC.child_apply,
                         line: x
                     })
                     recBillCredit.setCurrentSublistValue({
                         sublistId: FLD_BC.child_apply,
                         fieldId: FLD_BC.child_isapplied,
                         value: true,
                     });
                     recBillCredit.setCurrentSublistValue({
                         sublistId: FLD_BC.child_apply,
                         fieldId: FLD_BC.child_amount,
                         value: Number(data.data_bill[i].subBillSettlementAmount),
                     });
                     recBillCredit.commitLine(FLD_BC.child_apply)
                 }

             }
         }

         var saveBillcredit = recBillCredit.save()

         return saveBillcredit;
     }


     function afterSubmit(context) {

         var newRec = context.newRecord;
         var oldRec = context.oldRecord;
         var cstrx_id = newRec.id
         var rec_type = newRec.type
         log.debug('Aftersubmint is triggered on : ' + runtime.executionContext)

         if (context.type == context.UserEventType.CREATE && runtime.executionContext !== runtime.ContextType.SUITELET) {
             log.debug('Aftersubmint is working on : ' + runtime.executionContext)
             var prepaymentCheck = newRec.getValue(FLD_CSTRX.head_check)
             var prepaymentVendor = newRec.getValue(FLD_CSTRX.head_vendor)
             var prepaymentCurrency = newRec.getValue(FLD_CSTRX.head_bc_currency)
             var prepaymentVendorOutstanding = newRec.getValue(FLD_CSTRX.head_check_outstdg_amt)
             var settlementForeignToForeignExchange = newRec.getValue(FLD_CSTRX.head_fotofo_exrate)
             var settlementExratePumToIdr = newRec.getValue(FLD_CSTRX.head_bc_exrate)
             var settlementCurrency = newRec.getValue(FLD_CSTRX.head_mc_currency)
             var settlementAccountAp = newRec.getValue(FLD_CSTRX.head_coa_ap)
             var settlementDate = newRec.getValue(FLD_CSTRX.head_trandate)
             var settlementExrateSettleToIdr = newRec.getValue(FLD_CSTRX.head_mc_exrate)
             var classificationSubsidiary = newRec.getValue(FLD_CSTRX.head_subsidiary)
             var classificationDepartment = newRec.getValue(FLD_CSTRX.head_department)
             var classificationLocation = newRec.getValue(FLD_CSTRX.head_location)
             var classificationClass = newRec.getValue(FLD_CSTRX.head_class)


             var dataFilter = {
                 checks: prepaymentCheck,
                 vendor: prepaymentVendor,
                 currency: prepaymentCurrency,
                 vendor_outstanding: prepaymentVendorOutstanding,
                 foreign_to_foreign_exchange: settlementForeignToForeignExchange,
                 exrate_pum_to_idr: settlementExratePumToIdr,
                 total_mcpayment: 0,
                 total_bcpayment: 0,
                 settle_currency: settlementCurrency,
                 settle_account_ap: settlementAccountAp,
                 settle_date: settlementDate,
                 settle_exrate_settle_to_idr: settlementExrateSettleToIdr,
                 classification_subsidiary: classificationSubsidiary,
                 classification_department: classificationDepartment,
                 classification_location: classificationLocation,
                 classification_class: classificationClass,
                 data_bill: [],
             }

             var count = newRec.getLineCount(FLD_CSTRX.child_parent)
             for (var i = 0; i < count; i++) {
                 var bill_id = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_bill_id, i))
                 // var inv_tranid = newRec.getSublistText(FLD_CSTRX.child_parent, FLD_CSTRX.child_bill_id, i)
                 var mcpayment = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_mcpayment_amt, i))
                 var bcpayment = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_bcpayment_amt, i))
                 var mcpaymentidr = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_mcpaymentidr_amt, i))
                 var bcpaymentidr = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_bcpaymentidr_amt, i))
                 var mc_currency = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_mc_currency, i))
                 var bc_currency = parseFloat(newRec.getSublistValue(FLD_CSTRX.child_parent, FLD_CSTRX.child_bill_currency, i))

                 log.debug(
                     'Data Payment Line' + i,
                     '| mcpayment : ' + mcpayment +
                     '| mcpaymentidr : ' + mcpaymentidr +
                     '| bcpayment : ' + bcpayment +
                     '| bcpaymentidr : ' + bcpaymentidr
                 )

                 // if(!dataFilter.data_bill[bill_id]){
                 dataFilter.data_bill.push({
                     bill_id: bill_id,
                     // bill_tranid: bill_tranid,
                     bill_currency: bc_currency,
                     mcpayment: mcpayment,
                     mc_currency: mc_currency,
                     bcpayment: bcpayment,
                     bc_currency: bc_currency
                 })
                 // }

                 dataFilter.total_mcpayment += mcpayment
                 dataFilter.total_bcpayment += bcpayment
             }

             if (dataFilter.data_bill.length > 0) {
                 try {
                     var checkedBill = dataFilter.data_bill
                     log.debug('Final Data', dataFilter)
                     var saveCr1 = saveClearing1(dataFilter, cstrx_id);
                     var saveCr2 = saveClearing2(dataFilter, cstrx_id);
                     var saveBillCred = saveBillCredit(dataFilter, cstrx_id);
                     // var saveRecordMulticurrAp = saveMulticurrAp(dataFilter, saveCr1, saveCr2, saveBillCred);
                     // var updateChecksRec = updatec(dataFilter, totalPrepaymentamount, cstrx_id);

                     // Update Bill 
                     for (var x = 0; x < checkedBill.length; x++) {

                         var bill_rec = search.lookupFields({
                             type: search.Type.VENDOR_BILL,
                             id: checkedBill[x].bill_id,
                             columns: ["tranid", "custbody_me_stmcap_cstrx"]
                         })
                         log.debug('bill_rec', bill_rec)
                         var cstrx_arr = bill_rec.custbody_me_stmcap_cstrx
                         var new_cstrx_arr = [cstrx_id]
                         if (cstrx_arr.length > 0) {
                             for (var i = 0; i < cstrx_arr.length; i++) {
                                 new_cstrx_arr.push(cstrx_arr[i].value)
                             }
                         }

                         var update_bill = record.submitFields({
                             type: record.Type.VENDOR_BILL,
                             id: checkedBill[x].bill_id,
                             values: {
                                 'custbody_me_stmcap_cstrx': new_cstrx_arr
                             }
                         })
                     }
                     log.debug('Berhasil Update Bill 1338')

                     // Update Check
                     var check_id = newRec.getValue(FLD_CSTRX.head_check)
                     var check_rec = search.lookupFields({
                         type: search.Type.CHECK,
                         id: check_id,
                         columns: ["tranid", "custbody_me_stmcap_cstrx"]
                     })
                     log.debug('check_rec 1380', check_rec)
                     var cstrx_arr = check_rec.custbody_me_stmcap_cstrx
                     var new_cstrx_arr = [cstrx_id]
                     if (cstrx_arr.length > 0) {
                         for (var t = 0; t < cstrx_arr.length; t++) {
                             new_cstrx_arr.push(cstrx_arr[t].value)
                         }
                     }

                     var update_bill = record.submitFields({
                         type: record.Type.CHECK,
                         id: check_id,
                         values: {
                             'custbody_me_stmcap_cstrx': new_cstrx_arr
                         }
                     })

                 } catch (error) {
                     record.delete({
                         type: FLD_CSTRX.id,
                         id: cstrx_id
                     })

                     log.debug('custom record is deleted because failed to processed payment.', error)
                     throw ('Error Making Settlement Vendor Prepayment. ' + error)
                 }


                 // // Update Bill Credit
                 // var update_cm = record.submitFields({
                 //     type: record.Type.VENDOR_CREDIT,
                 //     id: saveBillCred,
                 //     values: {
                 //         'custbody_me_stmcap_cstrx': saveRecordMulticurrAp
                 //     }
                 // })
                 // log.debug('Berhasil Update Bill Credit')

                 // // Update MC Payment
                 // var update_mcpayment_from = record.submitFields({
                 //     type: 'customtransaction_me_clearing_vp_1',
                 //     id: saveCr1,
                 //     values: {
                 //         'custbody_me_stmcap_cstrx': saveRecordMulticurrAp
                 //     }
                 // })
                 // var update_mcpayment_to = record.submitFields({
                 //     type: 'customtransaction_me_clearing_vp_1',
                 //     id: saveCr2,
                 //     values: {
                 //         'custbody_me_stmcap_cstrx': saveRecordMulticurrAp
                 //     }
                 // })
                 // log.debug('Berhasil Update Settlement Payment AP')



                 // isSettled = true
                 // if (isSettled == true) {
                 //     redirect.toRecord({
                 //         type: 'customtransaction_me_settlmnt_multicr_ap',
                 //         id: saveRecordMulticurrAp,
                 //     });
                 // }
             }
         }

         //===================================================Start Script Yudi Journal Selisih======================================================

         var loadCurrent = record.load({
             type: 'customtransaction_me_settlmnt_multicr_ap',
             id: newRec.id,
         });

         var getFromCurrency = loadCurrent.getValue({
             fieldId: 'custbody_me_vendor_prepayment_um_curr'
         });
         var getToCurrency = loadCurrent.getValue({
             fieldId: 'custbody_me_child_settle_currency'
         });

         var exchangeRateFrom = loadCurrent.getValue({
             fieldId: 'custbody_me_child_settle_ex_rpum_ridr'
         });
         var exchangeRateTo = loadCurrent.getValue({
             fieldId: 'custbody_me_child_settle_ex_rstl_ridr'
         });

         var transClearingFrom = loadCurrent.getValue({
             fieldId: "custbody_me_child_settle_clearing_tran",
         });

         var getAmountFrom = search.lookupFields({
             type: "customtransaction_me_clearing_vp_1",
             id: transClearingFrom,
             columns: ['amount']
         });

         var amountFrom = getAmountFrom.amount;

         var transClearingTo = loadCurrent.getValue({
             fieldId: "custbody_me_child_settle_clearing_tra2",
         });

         var getAmountTo = search.lookupFields({
             type: "customtransaction_me_clearing_vp_1",
             id: transClearingTo,
             columns: ['amount']
         });

         var amountTo = getAmountTo.amount;

         var selisih = Math.abs(parseFloat(amountTo).toFixed(0)) - Math.abs(parseFloat(amountFrom).toFixed(0));

         var subsidiary = loadCurrent.getValue({
             fieldId: 'subsidiary'
         });
         log.debug("subsidiary", subsidiary)
         var classs = loadCurrent.getValue({
             fieldId: 'class'
         });
         log.debug("classs", classs)
         var location = loadCurrent.getValue({
             fieldId: 'location'
         });
         log.debug("location", location)
         var department = loadCurrent.getValue({
             fieldId: 'department'
         });
         log.debug("department", department)

         var clearingTransBalanceFrom = loadCurrent.setValue({
             fieldId: 'custbody_me_idr_balance_clearing_trx_1',
             value: Math.abs(parseFloat(amountFrom).toFixed(0)),
         });
         var clearingTransBalanceTo = loadCurrent.setValue({
             fieldId: 'custbody_me_idr_balance_clearing_trx_2',
             value: Math.abs(parseFloat(amountTo).toFixed(0)),
         });
         var clearingTransBalanceTo = loadCurrent.setValue({
             fieldId: 'custbody_me_selisih_amount_ap_payment',
             value: Math.abs(parseFloat(selisih).toFixed(0)),
         });

         if (context.type == 'create') {
             if (parseInt(selisih) > 0) {
                 var createJournal = record.create({
                     type: record.Type.JOURNAL_ENTRY,
                     isDynamic: true
                 });

                 var setSubsidiary = createJournal.setValue({
                     fieldId: 'subsidiary',
                     value: subsidiary
                 });
                 var setStatus = createJournal.setValue({
                     fieldId: 'approvalstatus',
                     value: 2
                 });

                 createJournal.selectNewLine('line');
                 var setCreditAccount = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'account',
                     line: 1,
                     value: config.account.gain_or_loss,
                 });

                 var setCreditAmount = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'credit',
                     line: 1,
                     value: parseFloat(Math.abs(selisih)).toFixed(2),
                 });
                 var setCreditDepartment = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'department',
                     line: 1,
                     value: department,
                 });
                 var setCreditClass = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'class',
                     line: 1,
                     value: classs,
                 });
                 var setCreditLocation = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'location',
                     line: 1,
                     value: location,
                 });
                 createJournal.commitLine('line');
                 createJournal.selectNewLine('line');

                 var setDebitAccount = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'account',
                     line: 2,
                     value: config.account.ap_clearing,
                 });
                 var setDebitAmount = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'debit',
                     line: 2,
                     value: parseFloat(Math.abs(selisih)).toFixed(2),
                 });
                 var setDebitDepartment = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'department',
                     line: 2,
                     value: department,
                 });
                 var setDebitClass = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'class',
                     line: 2,
                     value: classs,
                 });
                 var setDebitLocation = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'location',
                     line: 2,
                     value: location,
                 });
                 createJournal.commitLine('line');
                 var saveJournal = createJournal.save();

                 var setJournal = loadCurrent.setValue({
                     fieldId: 'custbody_me_journal_selisih_ap_payment',
                     value: saveJournal,
                 })
                 // var setJournalLearing = loadBillPayment.setValue({
                 //     fieldId: 'custbody_me_journal_selisih_vend_payme',
                 //     value: saveJournal,
                 // })

             }
             if (parseInt(selisih) < 0) {
                 var createJournal = record.create({
                     type: record.Type.JOURNAL_ENTRY,
                     isDynamic: true
                 });

                 var setSubsidiary = createJournal.setValue({
                     fieldId: 'subsidiary',
                     value: subsidiary
                 });

                 var setStatus = createJournal.setValue({
                     fieldId: 'approvalstatus',
                     value: 2
                 });

                 createJournal.selectNewLine('line');
                 var setDebitAccount = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'account',
                     line: 1,
                     value: config.account.gain_or_loss,
                 });

                 var setDebitAmount = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'debit',
                     line: 1,
                     value: parseFloat(Math.abs(selisih)).toFixed(2),
                 });

                 var setDebitDepartment = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'department',
                     line: 1,
                     value: department,
                 });
                 var setDebitClass = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'class',
                     line: 1,
                     value: classs,
                 });
                 var setDebitLocation = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'location',
                     line: 1,
                     value: location,
                 });
                 createJournal.commitLine('line');
                 createJournal.selectNewLine('line');

                 var setCreditAccount = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'account',
                     line: 2,
                     value: config.account.ap_clearing,
                 });
                 var setCreditAmount = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'credit',
                     line: 2,
                     value: parseFloat(Math.abs(selisih)).toFixed(2),
                 });
                 var setCreditDepartment = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'department',
                     line: 2,
                     value: department,
                 });
                 var setCreditClass = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'class',
                     line: 2,
                     value: classs,
                 });
                 var setCreditLocation = createJournal.setCurrentSublistValue({
                     sublistId: 'line',
                     fieldId: 'location',
                     line: 2,
                     value: location,
                 });
                 createJournal.commitLine('line');
                 var saveJournal = createJournal.save();

                 var setJournal = loadCurrent.setValue({
                     fieldId: 'custbody_me_journal_selisih_ap_payment',
                     value: saveJournal,
                 })
                 // var setJournalLearing = loadBillPayment.setValue({
                 //     fieldId: 'custbody_me_journal_selisih_vend_payme',
                 //     value: saveJournal,
                 // })

             }
         }

         if (context.type == 'edit') {

             var getJournalId = loadCurrent.getValue({
                 fieldId: 'custbody_me_journal_selisih_ap_payment',
             });

             if (parseInt(selisih) > 0) {
                 var updateJournal = record.load({
                     type: 'journalentry',
                     id: getJournalId,
                 });

                 var getJournalLineCount = updateJournal.getLineCount('line');

                 for (let i = getJournalLineCount - 1; i >= 0; i--) {
                     updateJournal.removeLine({
                         sublistId: 'line',
                         line: i,
                     });
                 }

                 var setCreditAccount = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'account',
                     line: 1,
                     value: config.account.gain_or_loss,
                 });

                 var setCreditAmount = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'credit',
                     line: 1,
                     value: parseFloat(Math.abs(selisih)).toFixed(2),
                 });
                 var setCreditDepartment = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'department',
                     line: 1,
                     value: department,
                 });
                 var setCreditClass = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'class',
                     line: 1,
                     value: classs,
                 });
                 var setCreditLocation = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'location',
                     line: 1,
                     value: location,
                 });

                 var setDebitAccount = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'account',
                     line: 2,
                     value: config.account.ap_clearing,
                 });
                 var setDebitAmount = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'debit',
                     line: 2,
                     value: parseFloat(Math.abs(selisih)).toFixed(2),
                 });
                 var setDebitDepartment = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'department',
                     line: 2,
                     value: department,
                 });
                 var setDebitClass = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'class',
                     line: 2,
                     value: classs,
                 });
                 var setDebitLocation = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'location',
                     line: 2,
                     value: location,
                 });

                 updateJournal.removeLine({
                     sublistId: 'line',
                     line: 0,
                 });

                 var saveJournal = updateJournal.save();

                 var setJournal = loadCurrent.setValue({
                     fieldId: 'custbody_me_journal_selisih_ap_payment',
                     value: saveJournal,
                 })


             }
             if (parseInt(selisih) < 0) {
                 var updateJournal = record.load({
                     type: 'journalentry',
                     id: getJournalId,

                 });
                 var getJournalLineCount = updateJournal.getLineCount('line');

                 log.debug("getLineCount", getJournalLineCount)

                 for (let i = getJournalLineCount - 1; i >= 0; i--) {
                     updateJournal.removeLine({
                         sublistId: 'line',
                         line: i,
                     });
                 }
                 var getJournalLineCount = updateJournal.getLineCount('line');

                 log.debug("getLineCount", getJournalLineCount)

                 var setDebitDepartment = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'department',
                     line: 1,
                     value: department,
                 });
                 var setDebitClass = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'class',
                     line: 1,
                     value: classs,
                 });
                 var setDebitLocation = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'location',
                     line: 1,
                     value: location,
                 });
                 var setDebitAccount = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'account',
                     line: 1,
                     value: config.account.gain_or_loss,
                 });

                 var setDebitAmount = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'debit',
                     line: 1,
                     value: Math.abs(selisih),
                 });

                 var getDebit = updateJournal.getSublistValue({
                     sublistId: 'line',
                     fieldId: 'debit',
                     line: 1,
                 })
                 log.debug("getDebit", getDebit)

                 var setCreditDepartment = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'department',
                     line: 2,
                     value: department,
                 });
                 var setCreditClass = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'class',
                     line: 2,
                     value: classs,
                 });
                 var setCreditLocation = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'location',
                     line: 2,
                     value: location,
                 });
                 var setCreditAccount = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'account',
                     line: 2,
                     value: config.account.ap_clearing,
                 });
                 var setCreditAmount = updateJournal.setSublistValue({
                     sublistId: 'line',
                     fieldId: 'credit',
                     line: 2,
                     value: Math.abs(selisih),
                 });

                 var getCredit = updateJournal.getSublistValue({
                     sublistId: 'line',
                     fieldId: 'credit',
                     line: 2,
                 })
                 log.debug("getCredit", getCredit)

                 var getJournalLineCount = updateJournal.getLineCount('line');

                 log.debug("getLineCount", getJournalLineCount)

                 updateJournal.removeLine({
                     sublistId: 'line',
                     line: 0,
                 });

                 var saveJournal = updateJournal.save();

                 var setJournal = loadCurrent.setValue({
                     fieldId: 'custbody_me_journal_selisih_ap_payment',
                     value: saveJournal,
                 })
                 // var setJournalLearing = loadBillPayment.setValue({
                 //     fieldId: 'custbody_me_journal_selisih_vend_payme',
                 //     value: saveJournal,
                 // })

             }
         }
         var saveMcAp = loadCurrent.save();
         //===================================================Start Script Yudi Journal Selisih======================================================

     }

     return {
         beforeSubmit: beforeSubmit,
         afterSubmit: afterSubmit

     }
 });

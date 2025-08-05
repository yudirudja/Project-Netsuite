/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    const DATA = {
        id: 'customtransaction_me_settlmnt_multicr_ar',
        head_customer: 'custbody_me_trx_arisan_customer',
        head_deposit: 'custbody_me_stmcar_deposit',
        head_tranid: 'tranid',
        head_trandate: 'trandate',
        head_postingperiod: 'postingperiod',
        head_currency: 'currency',
        head_deposit_outstdg_amt: 'custbody_me_stmcar_deposit_outstdg_amt',
        head_subsidiary: 'subsidiary',
        head_department: 'department',
        head_class: 'class',
        head_location: 'location',

        head_fotofo_exrate: 'custbody_me_foreign_to_foreign_ex_rate',
        head_cm: 'custbody_me_stmcar_cm',
        head_mc_acc_record: 'custbody_me_stmcar_payment_ar_from',
        head_mc_exchange_rate: 'custbody_me_cmctf_from_acc_exrate',
        head_mc_currency: 'custbody_me_cmctf_from_currency',
        head_cm_acc_record: 'custbody_me_stmcar_payment_ar_to',
        head_cm_exchange_rate: 'custbody_me_cmctf_to_acc_exrate',
        head_cm_currency: 'custbody_me_cmctf_to_currency',

        //LINE
        inv_sublist: 'recmachcustrecord_me_stmcar_parent',
        sub_invid: 'custrecord_me_stmcar_inv_id',
        sub_invtrandate: 'custrecord_me_stmcar_inv_trandate',
        sub_inv_customer: 'custrecord_me_stmcar_inv_customer',
        sub_inv_currency: 'custrecord_me_stmcar_inv_cm_currency',
        sub_invoriginamt: 'custrecord_me_stmcar_inv_origin_amt',
        sub_invoutstdgamt: 'custrecord_me_stmcar_inv_outstdg_amt',
        sub_mcpayment: 'custrecord_me_stmcar_mcpayment_amt',
        sub_mcpaymentidr: 'custrecord_me_stmcar_mcpaymentidr_amt',
        sub_mc_currency: 'custrecord_me_stmcar_deposit_mc_currency',

        sub_cmpayment: 'custrecord_me_stmcar_cmpayment_amt',
        sub_cmpaymentidr: 'custrecord_me_stmcar_cmpaymentidr_amt'
    }


    function beforeSubmit(context) {
        log.debug("running", "running")
        var rec = context.newRecord;



        var getCountSublist = rec.getLineCount('recmachcustrecord_me_stmcar_parent');

        for (let i = 0; i < getCountSublist; i++) {

            // rec.selectLine('recmachcustrecord_me_stmcar_parent', i)


            var fotofo_exrate = Number(rec.getValue(DATA.head_fotofo_exrate))
            var mc_payment = parseFloat(rec.getSublistValue(DATA.inv_sublist, DATA.sub_mcpayment, i).toFixed(2)) || 0
            var mc_exrate = Number(rec.getValue(DATA.head_mc_exchange_rate))
            var cm_exrate = Number(rec.getValue(DATA.head_cm_exchange_rate))
            var mc_currency = Number(rec.getValue(DATA.head_mc_currency))
            var cm_currency = Number(rec.getValue(DATA.head_cm_currency))
            var inv_outstdg_amt = parseFloat(rec.getSublistValue(DATA.inv_sublist, DATA.sub_invoutstdgamt, i))



            if (mc_payment > 0) {
                // console.log('mc payment lebih dari 0')

                if (mc_currency == 1) {
                    rec.setSublistValue({
                        sublistId: DATA.inv_sublist,
                        fieldId: DATA.sub_mcpayment,
                        line: i,
                        value: parseFloat(mc_payment).toFixed(0),
                        ignoreFieldChange: true
                    })
                } else {
                    rec.setSublistValue({
                        sublistId: DATA.inv_sublist,
                        fieldId: DATA.sub_mcpayment,
                        line: i,
                        value: parseFloat(mc_payment).toFixed(2),
                        ignoreFieldChange: true
                    })

                }

                if (cm_currency == 1 || mc_currency == 1) {

                    if (cm_currency == 1) {
                        rec.setSublistValue({
                            sublistId: DATA.inv_sublist,
                            fieldId: DATA.sub_cmpayment,
                            line: i,
                            value: parseFloat(mc_payment * (mc_exrate / cm_exrate)).toFixed(0),
                            ignoreFieldChange: true
                        })
                    } else {
                        rec.setSublistValue({
                            sublistId: DATA.inv_sublist,
                            fieldId: DATA.sub_cmpayment,
                            line: i,
                            value: parseFloat(mc_payment * (mc_exrate / cm_exrate)).toFixed(2),
                            ignoreFieldChange: true
                        })
                    }

                } else {
                    rec.setSublistValue({
                        sublistId: DATA.inv_sublist,
                        fieldId: DATA.sub_cmpayment,
                        line: i,
                        value: parseFloat(mc_payment * fotofo_exrate).toFixed(2),
                        ignoreFieldChange: true
                    })
                }
                // rec.setSublistValue({
                //     sublistId: DATA.inv_sublist,
                //     fieldId: DATA.sub_mcpayment,
                //     value: parseFloat(mc_payment).toFixed(2),
                //     ignoreFieldChange :true
                // })

                // rec.setSublistValue({
                //     sublistId: DATA.inv_sublist,
                //     fieldId: DATA.sub_cmpayment,
                //     value: parseFloat(mc_payment*fotofo_exrate).toFixed(2),
                //     // ignoreFieldChange :true
                // })
                var cm_payment = parseFloat(rec.getSublistValue(DATA.inv_sublist, DATA.sub_cmpayment, i))
                // console.log('set cmpayment')
                rec.setSublistValue({
                    sublistId: DATA.inv_sublist,
                    fieldId: DATA.sub_cmpaymentidr,
                    line: i,
                    value: parseFloat(cm_payment * cm_exrate).toFixed(2),
                    // ignoreFieldChange: true
                })
                // console.log('set cmpaymentidr')

                rec.setSublistValue({
                    sublistId: DATA.inv_sublist,
                    fieldId: DATA.sub_mcpaymentidr,
                    line: i,
                    value: parseFloat(mc_payment * mc_exrate).toFixed(2),
                    // ignoreFieldChange: true
                })
                // console.log('set mcpaymentidr')

                // console.log('cm_payment idr exrate: ' + cm_exrate, rec.getSublistValue(DATA.inv_sublist, DATA.sub_cmpaymentidr, i))
            } else {

                rec.setSublistValue({
                    sublistId: DATA.inv_sublist,
                    fieldId: DATA.sub_mcpayment,
                    line: i,
                    value: 0,
                    ignoreFieldChange: true
                })
                rec.setSublistValue({
                    sublistId: DATA.inv_sublist,
                    fieldId: DATA.sub_cmpayment,
                    line: i,
                    value: 0,
                    // ignoreFieldChange :true
                })

                rec.setSublistValue({
                    sublistId: DATA.inv_sublist,
                    fieldId: DATA.sub_cmpaymentidr,
                    line: i,
                    value: 0,
                    // ignoreFieldChange: true
                })
                rec.setSublistValue({
                    sublistId: DATA.inv_sublist,
                    fieldId: DATA.sub_mcpaymentidr,
                    line: i,
                    value: 0,
                    // ignoreFieldChange: true
                })
            }

            var cm_payment = parseFloat(rec.getSublistValue(DATA.inv_sublist, DATA.sub_cmpayment, i)) || 0
            // console.log('cm_payment + inv_outstdg_amt', cm_payment + ' + ' + inv_outstdg_amt)
            if (cm_payment > inv_outstdg_amt) {
                // console.log('cm payment melebihi outstanding', fieldID)

                // rec.setSublistValue(DATA.inv_sublist, DATA.sub_cmpayment,0,true)
                // rec.setSublistValue(DATA.inv_sublist, DATA.sub_cmpaymentidr,0,true)
                // rec.setSublistValue(DATA.inv_sublist, DATA.sub_mcpayment,0,true)
                // rec.setSublistValue(DATA.inv_sublist, DATA.sub_mcpaymentidr,0,true)
                if (cm_payment > inv_outstdg_amt) {
                    throw ('Payment should not be more than Invoice Outstanding Amount!')
                }
            }
            // rec.commitLine('recmachcustrecord_me_stmcar_parent')
        }
    }

    return {
        beforeSubmit: beforeSubmit
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/record', './config/me_config_sely.js', './lib/moment.min.js', 'N/search', 'N/url', 'N/https','N/redirect'], 
function (record, config_ss, moment, search, url, https, redirect) {

    const ME_APPROVAL = {
        approve_proforma_price: 'Approve Proforma Price',
        pending_approval: 'Pending Approval',
        approved_final_price: 'Approved Final Price'
    }
    const FIELD_LINE_SO = {
        item_line_id: "custcol_me_line_id_custom",
        item_lme_bulan : "custcol_me_lme_bulan",
        item_mjp_bulan : "custcol_me_mjp_bulan",
        item_kurs_kesepakatan : "custcol_me_kurs_kesepakatan",
        item_lme_proforma : "custcol_me_lme_proforma",
        item_lme_final : "custcol_me_lme_final",
        item_mjp_price : "custcol_me_mjp_price",
        item_mjp_proforma : "custcol_me_mjp_proforma",
        item_other_final : "custcol_me_other_final",
        item_others_proforma : "custcol_me_others_proforma",
        item_others_rate_final : "custcol_me_others_rate_final",
        item_others_rate_proforma : "custcol_me_others_rate_proforma",
        item_price_category_item : "custcol_me_price_category_item",
        item_kurs_kesepakatan_bulan: "custcol_me_kurs_kesepakatan_bulan",
        item_taxcode: "taxcode",
        item_rate: "rate",
        item_unit_price_bounded_zone: "custcol_me_unit_price_bounded_zone",
        item_faktur_pajak_bounded_zone: "custcol_me_faktur_pajak_bounded_zone",
        item_premium_final: "custcol_me_premium_final",
        item_ppn_idr: "custcol_me_ppn_idr",

        item_amount_final_idr: "custcol_me_amount_final_idr",
        item_amount_final_usd: "custcol_me_amount_final_usd",
        item_unit_price_final_idr: "custcol_me_unit_price_final_idr",
        item_unit_price_final_usd: "custcol_me_unit_price_final_usd",
        item_gross_amt_idr_final: "custcol_me_gross_amt_idr_final",
    }
        

    function getInvoiceSO(so_id){
        var inv_search = search.create({
            type: "salesorder",
            filters:
            [
               ["type","anyof","SalesOrd"], 
               "AND", 
               ["applyinglinktype","anyof","OrdBill"], 
               "AND", 
               ["internalid","anyof",so_id]
            ],
            columns:
            [
               search.createColumn({name: "trandate", label: "Date"}),
               search.createColumn({name: "tranid", label: "Document Number"}),
               search.createColumn({name: "applyingtransaction", label: "Applying Transaction"}),
               search.createColumn({name: "applyinglinktype", label: "Applying Link Type"})
            ]
        });
        var startrow = 0
        var arr_inv = []
        do {
            var result = inv_search.run().getRange({
                start: startrow,
                end: startrow + 1000
            })
            // log.debug('result 244', result)

            for (var i = 0; i < result.length; i++) {
                var inv_id = result[i].getValue(result[i].columns[2])
                
                if(arr_inv.indexOf(inv_id) == -1){
                    arr_inv.push(inv_id)
                }
            }
            startrow += 1000

        } while (result.length == 1000);

        return arr_inv

    }
    
    function updateInvoice(data_so, inv_id){
        try {
            
            var data_item_so = data_so.data_item
            var inv_rec = record.load({
                type: record.Type.INVOICE,
                id: inv_id,
            })
            inv_rec.setValue("approvalstatus",2)
            inv_rec.setValue("custbody_me_proforma_final",2)
            var line_count = inv_rec.getLineCount('item')
            for(var i=0; i < line_count; i++){
                var item_line_id = inv_rec.getSublistValue("item", FIELD_LINE_SO.item_line_id, i)
                var idx = data_item_so.findIndex(data => data.item_line_id == item_line_id)
                if(idx > -1){
                    var item_line_id = data_item_so[idx].item_line_id
                    var item_lme_bulan = data_item_so[idx].item_lme_bulan
                    var item_mjp_bulan = data_item_so[idx].item_mjp_bulan
                    var item_kurs_kesepakatan = data_item_so[idx].item_kurs_kesepakatan
                    var item_lme_proforma = data_item_so[idx].item_lme_proforma
                    var item_lme_final = data_item_so[idx].item_lme_final
                    var item_mjp_price = data_item_so[idx].item_mjp_price
                    var item_mjp_proforma = data_item_so[idx].item_mjp_proforma
                    var item_other_final = data_item_so[idx].item_other_final
                    var item_others_proforma = data_item_so[idx].item_others_proforma
                    var item_others_rate_final = data_item_so[idx].item_others_rate_final
                    var item_others_rate_proforma = data_item_so[idx].item_others_rate_proforma
                    var item_price_category_item = data_item_so[idx].item_price_category_item
                    var item_kurs_kesepakatan_bulan = data_item_so[idx].item_kurs_kesepakatan_bulan
                    var item_taxcode = data_item_so[idx].item_taxcode
                    var item_rate = data_item_so[idx].item_rate
                    var item_unit_price_bounded_zone = data_item_so[idx].item_unit_price_bounded_zone
                    var item_faktur_pajak_bounded_zone = data_item_so[idx].item_faktur_pajak_bounded_zone
                    var item_premium_final = data_item_so[idx].item_premium_final
                    var item_ppn_idr = data_item_so[idx].item_ppn_idr

                    var item_amount_final_idr = data_item_so[idx].item_amount_final_idr
                    var item_amount_final_usd = data_item_so[idx].item_amount_final_usd
                    var item_unit_price_final_idr = data_item_so[idx].item_unit_price_final_idr
                    var item_unit_price_final_usd = data_item_so[idx].item_unit_price_final_usd
                    var item_gross_amt_idr_final = data_item_so[idx].item_gross_amt_idr_final

                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_lme_bulan, i, item_lme_bulan)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_mjp_bulan, i, item_mjp_bulan)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_kurs_kesepakatan, i, item_kurs_kesepakatan)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_lme_proforma, i, item_lme_proforma)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_lme_final, i, item_lme_final)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_mjp_price, i, item_mjp_price)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_mjp_proforma, i, item_mjp_proforma)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_other_final, i, item_other_final)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_others_proforma, i, item_others_proforma)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_others_rate_final, i, item_others_rate_final)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_others_rate_proforma, i, item_others_rate_proforma)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_price_category_item, i, item_price_category_item)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_kurs_kesepakatan_bulan, i, item_kurs_kesepakatan_bulan)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_taxcode, i, item_taxcode)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_rate, i, item_rate)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_unit_price_bounded_zone, i, item_unit_price_bounded_zone)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_faktur_pajak_bounded_zone, i, item_faktur_pajak_bounded_zone)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_premium_final, i, item_premium_final)
                    // inv_rec.setSublistValue("item", FIELD_LINE_SO.item_ppn_idr, i, item_ppn_idr)

                    // inv_rec.setSublistValue("item", FIELD_LINE_SO.item_amount_final_idr, i, item_amount_final_idr)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_amount_final_usd, i, item_amount_final_usd)
                    // inv_rec.setSublistValue("item", FIELD_LINE_SO.item_unit_price_final_idr, i, item_unit_price_final_idr)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_unit_price_final_usd, i, item_unit_price_final_usd)
                    inv_rec.setSublistValue("item", FIELD_LINE_SO.item_gross_amt_idr_final, i, item_gross_amt_idr_final)
                }
            }
            inv_rec.save()
            log.debug('Invoice berhasil diupdate id: ' + inv_id, data_so)
        } catch (error) {
            log.debug('Failed to update invoice id: ' + inv_id, {
                data_so: JSON.stringify(data_so),
                error: error
            })
            throw('Failed to update invoice id: ' + inv_id + " " + error)
        }
    }

    function beforeSubmit(context) {
        var newRec = context.newRecord;

        if (context.type == context.UserEventType.EDIT || context.type == context.UserEventType.CREATE) {
            var count = newRec.getLineCount('item')
            for(var m = 0; m < count; m++){
                var item_line_id = newRec.getSublistValue('item', FIELD_LINE_SO.item_line_id, m)
                var item_id = newRec.getSublistValue('item', 'item', m)
                if(!item_line_id || item_line_id == ""){
                    newRec.setSublistValue("item",FIELD_LINE_SO.item_line_id,m,(item_id + "_" + m))
                    log.debug('Update Line Item ID custpm', newRec.getSublistValue("item", FIELD_LINE_SO.item_line_id, m))
                }
            }
        }

        if (context.type == context.UserEventType.EDIT) {
            var is_final_so = false
            var so_id = newRec.id
            var so_proforma_final = newRec.getValue('custbody_me_proforma_final')
            var so_final_approved = newRec.getValue('custbody_me_approval_so_custom')
            if(so_final_approved == ME_APPROVAL.approved_final_price) is_final_so = true;
            if(is_final_so && so_proforma_final == 2){
                var so_data = {
                    so_id: so_id,
                    so_tranid: newRec.getValue('tranid'),
                    data_item: []
                }
                var line_count = newRec.getLineCount('item')
                for(var j = 0; j < line_count; j++){
                    var item_id = newRec.getSublistValue('item','item', j)
                    var item_name = newRec.getSublistText('item','item', j)
                    var item_qty = newRec.getSublistValue('item','quantity', j)
                    var item_line_id = newRec.getSublistValue('item', FIELD_LINE_SO.item_line_id,j)
                    var item_lme_bulan = newRec.getSublistValue('item', FIELD_LINE_SO.item_lme_bulan,j)
                    var item_mjp_bulan = newRec.getSublistValue('item', FIELD_LINE_SO.item_mjp_bulan,j)
                    var item_kurs_kesepakatan = newRec.getSublistValue('item', FIELD_LINE_SO.item_kurs_kesepakatan,j)
                    var item_lme_proforma = newRec.getSublistValue('item', FIELD_LINE_SO.item_lme_proforma,j)
                    var item_lme_final = newRec.getSublistValue('item', FIELD_LINE_SO.item_lme_final,j)
                    var item_mjp_price = newRec.getSublistValue('item', FIELD_LINE_SO.item_mjp_price,j)
                    var item_mjp_proforma = newRec.getSublistValue('item', FIELD_LINE_SO.item_mjp_proforma,j)
                    var item_other_final = newRec.getSublistValue('item', FIELD_LINE_SO.item_other_final,j)
                    var item_others_proforma = newRec.getSublistValue('item', FIELD_LINE_SO.item_others_proforma,j)
                    var item_others_rate_final = newRec.getSublistValue('item', FIELD_LINE_SO.item_others_rate_final,j)
                    var item_others_rate_proforma = newRec.getSublistValue('item', FIELD_LINE_SO.item_others_rate_proforma,j)
                    var item_price_category_item = newRec.getSublistValue('item', FIELD_LINE_SO.item_price_category_item,j) || ''
                    var item_kurs_kesepakatan_bulan = newRec.getSublistValue('item', FIELD_LINE_SO.item_kurs_kesepakatan_bulan,j)
                    var item_taxcode = newRec.getSublistValue('item', FIELD_LINE_SO.item_taxcode,j)
                    var item_rate = newRec.getSublistValue('item', FIELD_LINE_SO.item_rate,j)
                    var item_unit_price_bounded_zone = newRec.getSublistValue('item', FIELD_LINE_SO.item_unit_price_bounded_zone,j)
                    var item_faktur_pajak_bounded_zone = newRec.getSublistValue('item', FIELD_LINE_SO.item_faktur_pajak_bounded_zone,j)
                    var item_premium_final = newRec.getSublistValue('item', FIELD_LINE_SO.item_premium_final,j)
                    var item_ppn_idr = newRec.getSublistValue('item', FIELD_LINE_SO.item_ppn_idr,j)

                    var item_amount_final_idr = newRec.getSublistValue('item',FIELD_LINE_SO.item_amount_final_idr,j)
                    var item_amount_final_usd = newRec.getSublistValue('item',FIELD_LINE_SO.item_amount_final_usd,j)
                    var item_unit_price_final_idr = newRec.getSublistValue('item',FIELD_LINE_SO.item_unit_price_final_idr,j)
                    var item_unit_price_final_usd = newRec.getSublistValue('item',FIELD_LINE_SO.item_unit_price_final_usd,j)
                    var item_gross_amt_idr_final = newRec.getSublistValue('item',FIELD_LINE_SO.item_gross_amt_idr_final,j)

                    so_data.data_item.push({
                        item_id : item_id,
                        item_name : item_name,
                        item_qty : item_qty,
                        item_line_id : item_line_id,
                        item_lme_bulan : item_lme_bulan,
                        item_mjp_bulan : item_mjp_bulan,
                        item_kurs_kesepakatan : item_kurs_kesepakatan,
                        item_lme_proforma : item_lme_proforma,
                        item_lme_final : item_lme_final,
                        item_mjp_price : item_mjp_price,
                        item_mjp_proforma : item_mjp_proforma,
                        item_other_final : item_other_final,
                        item_others_proforma : item_others_proforma,
                        item_others_rate_final : item_others_rate_final,
                        item_others_rate_proforma : item_others_rate_proforma,
                        item_price_category_item : item_price_category_item,
                        item_kurs_kesepakatan_bulan : item_kurs_kesepakatan_bulan,
                        item_taxcode : item_taxcode,
                        item_rate : item_rate,
                        item_unit_price_bounded_zone : item_unit_price_bounded_zone,
                        item_faktur_pajak_bounded_zone : item_faktur_pajak_bounded_zone,
                        item_premium_final : item_premium_final,
                        item_ppn_idr : item_ppn_idr,
                        item_amount_final_idr : item_amount_final_idr,
                        item_amount_final_usd : item_amount_final_usd,
                        item_unit_price_final_idr : item_unit_price_final_idr,
                        item_unit_price_final_usd : item_unit_price_final_usd,
                        item_gross_amt_idr_final : item_gross_amt_idr_final
                    })
                }
                var list_inv = getInvoiceSO(so_id)
                if(list_inv.length > 0){
                    for(var i = 0; i < list_inv.length; i++){
                        var inv_id = list_inv[i]
                        updateInvoice(so_data, inv_id)
                    }
                }
            }
        }

    }

    function afterSubmit(context) {
        var newRec = context.newRecord

        var runSuitelet = redirect.toSuitelet({
            scriptId: 'customscript_me_sl_update_inv_value',
            deploymentId: 'customdeploy_me_sl_update_inv_value',
            parameters: {
                'custscript_me_param_inv':newRec.id
            } 
        });
        log.debug('runSuitelet',runSuitelet)
    }

    return {
        
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function() {

    

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;
        var sublistId = context.sublistId;

        if(sublistId == 'item'){
            if(fieldId == 'custcol_me_discount_percentage'){

                var disc_percent_header = Number(rec.getValue('custbody_me_disc_percentage_header'))
                var disc_percent_line = Number(rec.getCurrentSublistValue(sublistId,'custcol_me_discount_percentage'))
                log.debug('fieldchanged field ' + fieldId, {
                    disc_percent_header : disc_percent_header,
                    disc_percent_line : disc_percent_line
                })
                if((disc_percent_header != disc_percent_line) && disc_percent_header > 0){
                    alert('Discount Percentage on line should be same with the percentage on header!')
                    rec.setCurrentSublistValue(sublistId, 'custcol_me_discount_percentage', disc_percent_header)
                }
            }

            if(fieldId == 'custcol_me_discount_percentage' || fieldId == 'custcolme_unitprice_bfr_purchase_disc'){
                var unit_price_b4_disc = Number(rec.getCurrentSublistValue(sublistId, 'custcolme_unitprice_bfr_purchase_disc'))
                var disc_percent_line = Number(rec.getCurrentSublistValue(sublistId, 'custcol_me_discount_percentage'))
                log.debug('fieldchanged field ' + fieldId, {
                    unit_price_b4_disc : unit_price_b4_disc,
                    disc_percent_line : disc_percent_line
                })
                if(unit_price_b4_disc >= 0 && disc_percent_line >= 0){
                    var rate_amount = parseFloat(unit_price_b4_disc)-parseFloat(unit_price_b4_disc*disc_percent_line/100)
                    var disc_amount = parseFloat(unit_price_b4_disc*disc_percent_line/100)
                    log.debug('fieldchanged data ' + fieldId,
                        {rate_amount:rate_amount, disc_amount: disc_amount}
                    )
                    rec.setCurrentSublistValue(sublistId, 'custcol_me_discount_amount_purchase', disc_amount)
                    rec.setCurrentSublistValue(sublistId, 'custcol_me_discount_amount_purchase', disc_amount)
                    rec.setCurrentSublistValue(sublistId, 'rate', rate_amount)
                }
            }
        }

        if(fieldId == 'custbody_me_disc_percentage_header'){
            var disc_percent_header = Number(rec.getValue('custbody_me_disc_percentage_header'))
            var count = rec.getLineCount('item')
            for(var i = 0; i < count; i++){
                rec.selectLine('item', i)
                rec.setCurrentSublistValue('item', 'custcol_me_discount_percentage', disc_percent_header)
                rec.commitLine('item')
            }
        }
    }

    function postSourcing(context){
        var rec = context.currentRecord;
        var fieldId = context.fieldId;
        var sublistId = context.sublistId;
        if(sublistId == 'item'){
            
            if(fieldId == 'item'){
                var disc_percent_header = Number(rec.getValue('custbody_me_disc_percentage_header'))
                var item_id = rec.getCurrentSublistValue(sublistId, 'item')
                var item_rate = rec.getCurrentSublistValue(sublistId, 'rate')
                log.debug('postsourcing field ' + fieldId, {
                    disc_percent_header : disc_percent_header,
                    item_id : item_id
                })
                if(disc_percent_header && item_id){
                    rec.setCurrentSublistValue(sublistId, 'custcol_me_discount_percentage', disc_percent_header)
                }
                if(item_id && item_rate){
                    rec.setCurrentSublistValue(sublistId, 'custcolme_unitprice_bfr_purchase_disc', item_rate)
                }
            }
        }
    }
    

    return {
        fieldChanged: fieldChanged,
        postSourcing: postSourcing
    }
});

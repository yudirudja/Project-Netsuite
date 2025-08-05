/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

define(["N/record","N/runtime", "N/search"], function(record,runtime, search) {

    // function beforeLoad(context) {
        
    // }

    function beforeSubmit(context) {
        var newRec = context.newRecord;
        var lineCount = newRec.getLineCount('item')
        for(var i = 0; i < lineCount; i++){
            var is_fulfill = newRec.getSublistValue('item','item_received',i)
            if(is_fulfill == "T" || is_fulfill == true){
                var item_qty = Number(newRec.getSublistValue('item','quantity',i))
                var inv_det_rec = newRec.getSublistSubrecord('item','inventorydetail',i)
                var inv_det_qty = Number(inv_det_rec.getValue('totalquantity'))
                if(context.type == context.UserEventType.CREATE){
                    log.debug('comparasi data item dan inventory detail idx: ' + i,
                        {
                            item_qty : item_qty,
                            inv_det_rec : JSON.stringify(inv_det_rec),
                            inv_det_qty : inv_det_qty
                        }
                    )
                }
                if(item_qty != inv_det_qty){
                    newRec.setSublistValue('item','quantity',i, inv_det_qty, true)
                    var item_qty_2 = Number(rec.getSublistValue('item','quantity',i))
                    var inv_det_rec_2 = rec.getSublistSubrecord('item','inventorydetail',i)
                    var inv_det_qty_2 = Number(inv_det_rec.getValue('totalquantity'))
                    log.debug('comparasi data item dan inventory detail 222 idx: ' + i,
                        {
                            item_qty : item_qty_2,
                            inv_det_rec : JSON.stringify(inv_det_rec_2),
                            inv_det_qty : inv_det_qty_2
                        }
                    )
                }
            }
        }
        // throw 'No create dulu'

    }

    // function afterSubmit(context) {
        
    // }

    return {
        // beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        // afterSubmit: afterSubmit
    }
});

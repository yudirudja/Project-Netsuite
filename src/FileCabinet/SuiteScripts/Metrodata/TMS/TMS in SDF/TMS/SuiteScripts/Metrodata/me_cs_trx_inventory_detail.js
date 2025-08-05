/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/record","N/runtime", "N/search"], function(record,runtime, search) {
    var trigger_cs = false

    function saveRecord(context){
        var rec = context.currentRecord;
        var lineCount = rec.getLineCount('item')
        for(var i = 0; i < lineCount; i++){
            rec.selectLine('item', i)
            var is_fulfill = rec.getCurrentSublistValue('item','item_received')
            var item_qty = Number(rec.getCurrentSublistValue('item','quantity'))
            var inv_det_rec = rec.getCurrentSublistSubrecord('item','inventorydetail')
            var inv_det_qty = Number(inv_det_rec.getValue('totalquantity'))
            log.debug('comparasi data item dan inventory detail',
                {
                    item_qty : item_qty,
                    inv_det_rec : JSON.stringify(inv_det_rec),
                    inv_det_qty : inv_det_qty
                }
            )
            // throw 'No create dulu'
            
            if(item_qty != inv_det_qty){
                rec.setCurrentSublistValue('item','quantity', inv_det_qty, true)
                var item_qty_2 = Number(rec.getCurrentSublistValue('item','quantity'))
                var inv_det_rec_2 = rec.getCurrentSublistSubrecord('item','inventorydetail')
                var inv_det_qty_2 = Number(inv_det_rec.getValue('totalquantity'))
                log.debug('comparasi data item dan inventory detail 222',
                    {
                        item_qty : item_qty_2,
                        inv_det_rec : JSON.stringify(inv_det_rec_2),
                        inv_det_qty : inv_det_qty_2
                    }
                )
                rec.commitLine('item')
            }
        }
    }

    function pageInit(context){
        var rec = context.currentRecord;
        var created_from = rec.getValue('createdfrom')
        log.debug('rec.type', rec.type)
        if(rec.type == 'itemfulfillment'){
            const qparams = new URLSearchParams(window.location.search);
            console.log(window.location.search)
            console.log('qparams item fulfillment', qparams)
            var rec_so = search.lookupFields({
                type: search.Type.SALES_ORDER,
                id: created_from,
                columns: ["internalid"]
            })
            log.debug('rec_so pageinit is working', rec_so)
            if(Object.keys(rec_so).length > 0){
                trigger_cs = true
            }
            log.debug('trigger_cs pageinit', trigger_cs)
        } else if(rec.type == 'inventorytransfer'){
            trigger_cs = true
        } else if(rec.type == 'inventoryadjustment'){
            trigger_cs = true
        } 

    }


    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistID = context.sublistId;
        var fieldID = context.fieldId;
        log.debug('trigger_cs', trigger_cs)
        if(trigger_cs == true && sublistID == 'item' && fieldID == 'custcol_me_complete_quantity'){
            var inv_det_rec = rec.getCurrentSublistSubrecord({
                sublistId: 'item',
                fieldId: 'inventorydetail'
            })
            // log.debug('inv_det_rec validatefield', inv_det_rec)
            var inv_det_qty = Number(inv_det_rec.getValue('totalquantity'))
            var check_qty = rec.getCurrentSublistValue(sublistID, fieldID)
            log.debug('check_qty', check_qty)
            // log.debug('inv_det_rec quantity', inv_det_qty)
            var item_qty = rec.getCurrentSublistValue(sublistID, 'quantity')
            if(check_qty == true || check_qty == "T"){
                if(inv_det_rec && (item_qty != inv_det_qty)){
                    rec.setCurrentSublistValue(sublistID, 'quantity', inv_det_qty, true)
                    alert("Quantity sudah diupdate!")
                    rec.setCurrentSublistValue(sublistID, fieldID, false, true)
                    return true
                }
                alert("Quantity sudah diupdate!")
                rec.setCurrentSublistValue(sublistID, fieldID,  false, true)
                return true
            }
        }

        if(trigger_cs == true && sublistID == 'inventory' && fieldID == 'item' && rec.type == 'inventoryadjustment'){
            var item_id = rec.getCurrentSublistValue('inventory', 'item')
            var min_or_plus = rec.getText('custbody_me_adjustment_category')
            if(!min_or_plus || min_or_plus == ''){
                alert('Please choose the category adjustment first!')
                return false
            }
        }

        

        if(trigger_cs == true && sublistID == 'inventory' && fieldID == 'quantityonhand'){
            var qty_onhand = Math.abs(rec.getCurrentSublistValue('inventory', 'quantityonhand'))
            var min_or_plus = rec.getText('custbody_me_adjustment_category')
            
            if(min_or_plus.toLowerCase().indexOf('pengurangan') != -1 && rec.type == 'inventoryadjustment'){
                rec.setCurrentSublistValue('inventory', 'adjustqtyby', (qty_onhand * -1))
            } else {
                rec.setCurrentSublistValue('inventory', 'adjustqtyby', (qty_onhand))
            }
            

        }

    }
    
    function validateField(context){
        var rec = context.currentRecord;
        var sublistID = context.sublistId;
        var fieldID = context.fieldId;
        console.log('validate field item fulfillment is working')
        if(trigger_cs && sublistID == 'item' && fieldID == 'quantity'){
            var inv_det_rec = rec.getCurrentSublistSubrecord({
                sublistId: 'item',
                fieldId: 'inventorydetail'
            })
            log.debug('inv_det_rec validatefield', inv_det_rec)
            var inv_det_qty = Number(inv_det_rec.getValue('totalquantity'))
            var item_qty = Number(rec.getCurrentSublistValue(sublistID, fieldID))
            log.debug('inv_det_rec quantity', {inv_det_qty: inv_det_qty, item_qty: item_qty})
            if(inv_det_qty > 0 && (item_qty != inv_det_qty)){
                alert('Total quantity item harus sama dengan total quantity inventory detail!')
                rec.setCurrentSublistValue(sublistID, fieldID, inv_det_qty, true)
                return true
            }
        }

        if(fieldID == 'custbody_me_adjustment_category' && rec.type == 'inventoryadjustment'){
            var count_inventory = rec.getLineCount('inventory')
            if(count_inventory > 0){
                alert ('Please remove all item first, before change the category adjustment!')
                return false
            }
        }
        return true
    }

    function validateLine(context){
        var rec = context.currentRecord;
        var sublistID = context.sublistId;
        var fieldID = context.fieldId;
        if(sublistID == 'inventory' && trigger_cs){
            var item_id = rec.getCurrentSublistValue(sublistID, 'item')
            log.debug('rectype', rec.type + ' | itemid: ' + item_id)

            if(item_id){
                var item_rec = search.lookupFields({
                    type: search.Type.INVENTORY_ITEM,
                    id: item_id,
                    columns: ["name", "internalid", "type", "islotitem"]
                })
                log.debug('item_rec', item_rec)
                if(item_rec.islotitem == true){
                    var inv_det_rec = rec.getCurrentSublistSubrecord({
                        sublistId: 'inventory',
                        fieldId: 'inventorydetail'
                    })
                    
                    var inv_det_qty = Number(inv_det_rec.getValue('totalquantity'))
                    var item_qty = rec.getCurrentSublistValue(sublistID, 'adjustqtyby')
        
                    if(inv_det_rec && (item_qty != inv_det_qty)){
                        rec.setCurrentSublistValue(sublistID, 'adjustqtyby', inv_det_qty, true)
                        // return true
                    }
                }

            }

        }
        return true
    }

    
 

    return {
        // saveRecord: saveRecord,
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        validateField: validateField,
        validateLine: validateLine
        
    }
});

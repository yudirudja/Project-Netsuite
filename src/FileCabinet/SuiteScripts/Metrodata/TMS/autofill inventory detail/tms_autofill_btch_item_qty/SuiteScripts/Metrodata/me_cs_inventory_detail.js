/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/record", "N/runtime", "N/search"], function (record, runtime, search) {
    var parentRecord = false
    var rec_type = ''
    let total = 0;
    let item = "";
    function pageInit(context) {

        const qparams = new URLSearchParams(window.location.search);
        console.log('qparams inventory detail', qparams)
        console.log(window.location.search)
        if (qparams.has('subrecord_parent_tran_type') && qparams.get('subrecord_parent_tran_type') == 'itemship') {
            console.log('running in itemship')
            parentRecord = true;
            rec_type = qparams.get('subrecord_parent_tran_type')
        };
        if (qparams.has('subrecord_parent_tran_type') && qparams.get('subrecord_parent_tran_type') == 'invtrnfr') {
            console.log('running in invtrnfr')
            var item_id = qparams.get('item')
            var item_rec = search.lookupFields({
                type: search.Type.INVENTORY_ITEM,
                id: item_id,
                columns: ["name", "internalid", "type", "islotitem"]
            })
            console.log('item_rec', item_rec)
            if (item_rec.islotitem == true) {
                parentRecord = true;
            }
            rec_type = qparams.get('subrecord_parent_tran_type')
        };
        if (qparams.has('subrecord_parent_tran_type') && qparams.get('subrecord_parent_tran_type') == 'invadjst') {
            console.log('running in invadjst')
            var item_id = qparams.get('item')
            var item_rec = search.lookupFields({
                type: search.Type.INVENTORY_ITEM,
                id: item_id,
                columns: ["name", "internalid", "type", "islotitem"]
            })
            console.log('item_rec', item_rec)
            if (item_rec.islotitem == true) {
                parentRecord = true;
            }
            rec_type = qparams.get('subrecord_parent_tran_type')
        };
        console.log('rec_type', rec_type)
    }

    function saveRecord(context) {
        var rec = context.currentRecord;
        log.debug('rec.type', rec.type)
        var count = rec.getLineCount('inventoryassignment')
        var tot_count = 0
        for (var i = 0; i < count; i++) {
            rec.selectLine('inventoryassignment', i)
            var qty_lot = Number(rec.getCurrentSublistValue('inventoryassignment', 'quantity'))
            tot_count += qty_lot
        }
        log.debug('tot_count saverecord', tot_count)
        rec.setValue('quantity', tot_count, true)
        console.log('saverecord inventory detail')
        return true
    }


    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistID = context.sublistId;
        var fieldID = context.fieldId;
        var line = context.line
        if (parentRecord) {

            let item_head = (rec.getValue('item'))
            let quantity_head = Number(rec.getValue('quantity'))
            let sublist_line = rec.getLineCount('inventoryassignment')
            log.debug('sublist_line', sublist_line)
            if (item_head != item) {
                total = 0;
                item = item_head;
            }
            if (sublistID == "inventoryassignment" && fieldID == "quantityavailable") {
                var inventorynumber = rec.getCurrentSublistValue(sublistID, fieldID)
                var inventoryquantityavailable = rec.getCurrentSublistValue(sublistID, 'quantityavailable')
                var inventorylotquantityavailable = rec.getCurrentSublistValue(sublistID, 'lotquantityavailable')

                total += Number(inventoryquantityavailable)

                if (rec_type == 'invadjst') {
                    inventoryquantityavailable = (inventoryquantityavailable * -1)
                }
                log.debug('data inventory', {
                    inventorynumber: inventorynumber,
                    inventoryquantityavailable: inventoryquantityavailable,
                    inventorylotquantityavailable: inventorylotquantityavailable,
                    rec_type: rec_type
                })

                // for (let i = 0; i < sublist_line; i++) {
                //     rec.selectLine('inventoryassignment', i)
                //     let get_qty_available = rec.getCurrentSublistValue({
                //         sublistId: 'inventoryassignment',
                //         fieldId: 'quantityavailable'
                //     });
                //     log.debug('get_qty_available', get_qty_available)


                //     rec.commitLine('inventoryassignment')
                // }
                log.debug('data inventory 1', quantity_head + '___' + total + "_____" + inventoryquantityavailable)
                if (inventorynumber) {

                    if (Number(quantity_head) >= (Number(total)) && quantity_head - (total-inventoryquantityavailable) > 0) {
                        rec.setCurrentSublistValue(sublistID, 'quantity', inventoryquantityavailable, true)
                    } else if (Number(quantity_head) < (Number(total)) && quantity_head - (total-inventoryquantityavailable) > 0) {
                        rec.setCurrentSublistValue(sublistID, 'quantity', quantity_head - (total-inventoryquantityavailable), true)
                    } else {
                        rec.setCurrentSublistValue(sublistID, 'quantity', 0, true)
                    }
                }
            }
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord

    }
});

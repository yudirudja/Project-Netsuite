/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define(["N/record", "N/runtime", "N/search", "../lib/moment.min.js"], function (record, runtime, search, moment) {

    var parentRecord = false
    var rec_type = ''
    let total = 0;
    let item = "";

    function pageInit(context) {

        let rec = context.currentRecord;

        const qparams = new URLSearchParams(window.location.search);
        console.log('qparams inventory detail', qparams.get('subrecord_parent_tran_type'))

        if (qparams.get('subrecord_parent_tran_type') == 'itemship') {
            let get_quantity = rec.getValue("quantity");
            let get_line_count = rec.getLineCount("inventoryassignment");

            let inv_detail_arr = []

            let total_lot_qty = 0;

            for (let i = 0; i < get_line_count; i++) {
                rec.selectLine('inventoryassignment', i)
                let get_lot_id = rec.getSublistValue({
                    sublistId: "inventoryassignment",
                    fieldId: "issueinventorynumber",
                    line: i
                });
                let get_lot_qty = rec.getSublistValue({
                    sublistId: "inventoryassignment",
                    fieldId: "quantity",
                    line: i
                });
                total_lot_qty += Number(get_lot_qty)

                let get_lot_date_create = search.lookupFields({
                    type: search.Type.INVENTORY_NUMBER,
                    id: get_lot_id,
                    columns: ['custitemnumber_me_date_created_inv_num']
                });

                inv_detail_arr.push({
                    log_id: get_lot_id,
                    date: get_lot_date_create.custitemnumber_me_date_created_inv_num,
                    quantity: get_lot_qty,
                    line: i
                })

                console.log('get_lot_date_create', get_lot_date_create.custitemnumber_me_date_created_inv_num)
            }

            let sorted = inv_detail_arr.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(moment(b.date, "D/M/YYYY").format("M/D/YYYY")) - new Date(moment(a.date, "D/M/YYYY").format("M/D/YYYY"));
              });

              let selisih_qty = Math.abs(total_lot_qty - Number(get_quantity))

              if (selisih_qty != 0) {
                  for (let i = 0; i < sorted.length; i++) {
                    rec.selectLine("inventoryassignment",i)
                    let set_quantity = rec.setCurrentSublistValue({
                        sublistId: "inventoryassignment",
                        fieldId: "quantity",
                        line: sorted[i].line,
                        value: sorted[i].quantity - selisih_qty < 0? 0 : sorted[i].quantity - selisih_qty,
                    })
                    selisih_qty - sorted[i].quantity <= 0? selisih_qty = 0: selisih_qty -= sorted[i].quantity
                    rec.commitLine('inventoryassignment')

                    
                  }
                
              }

            console.log('inv_detail_arr', sorted)


        }
        
    }

    return {
        pageInit: pageInit,
    }
});

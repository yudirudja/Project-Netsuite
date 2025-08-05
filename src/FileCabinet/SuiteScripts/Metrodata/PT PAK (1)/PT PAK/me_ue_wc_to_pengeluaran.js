/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function () {

    function beforeSubmit(context) {
        var rec = context.newRecord;

        var mappingChildRecordPengeluaran = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], [15, 16, 17, 18, 19, 20, 21]];
        var arrayItems = [];
        var getLineCount = rec.getLineCount('item')
        for (let i = 0; i < getLineCount; i++) {
            var getItem = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i,
            })
            var getSubCategory = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_cashflow_category',
                line: i,
            })
            var getAmount = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                line: i,
            })
            arrayItems.push({
                item: getItem,
                sub_category: getSubCategory,
                amount: getAmount,
            });
        }




        for (let i = 0; i < mappingChildRecordPengeluaran[0].length; i++) {
            if (getSubCategory == mappingChildRecordPengeluaran[0][i]) {
                arrayItems.push({

                })
            }

        }



    }

    return {
        beforeSubmit: beforeSubmit,
    }
});

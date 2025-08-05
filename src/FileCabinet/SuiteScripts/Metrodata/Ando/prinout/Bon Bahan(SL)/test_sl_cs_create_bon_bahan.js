/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */

define(['N/url', 'N/search', 'N/format', 'N/record', 'N/runtime'], function (url, search, format, record, runtime) {
    const custpage_startdate = 'custpage_startdate'
    const custpage_enddate = 'custpage_enddate'
    const custpage_instruksi_kerja = 'custpage_instruksi_kerja'
    const custpage_sublist = 'custpage_sublist'
    const custpage_class = 'custpage_class'
    const sub_checkbox = 'sub_checkbox'
    const sub_ik = 'sub_ik'
    const sub_item = 'sub_item'
    const sub_bahan = 'sub_bahan'
    const sub_warna = 'sub_warna'
    const sub_quantity = 'sub_quantity'

    function pageInit(context) {
        console.log('client script test_sl_cs_create_bon_bahan')
    }


    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistName = context.sublistId;
        var fieldName = context.fieldId;
        console.log('fieldchanged test_sl_cs_create_bon_bahan ' + fieldName)
        // if(fieldName == custpage_startdate || fieldName == custpage_enddate){
        //     var startdate = rec.getText(custpage_startdate)
        //     var enddate = rec.getText(custpage_enddate)
        //     console.log('startdate + enddate', startdate + enddate)
        //     if(startdate && enddate){
        //         // startdate = format.parse({
        //         //     value: startdate,
        //         //     type: format.Type.DATE
        //         // });
        //         // enddate = format.parse({
        //         //     value: enddate,
        //         //     type: format.Type.DATE
        //         // });
        //         var data = {startdate: startdate, enddate: enddate}
        //         var list_ik = getIK(data)
        //         var ik_field = rec.getField(custpage_instruksi_kerja)
        //         ik_field.removeSelectOption({ value: null })
        //         if (Object.keys(list_ik).length > 0) {
        //             var default_ik = []
        //             for (var x in list_ik) {
        //                 // console.log('Insert data ' + x + ' ' + list_ik[x])
        //                 ik_field.insertSelectOption({
        //                     value: list_ik[x].value,
        //                     text: list_ik[x].text
        //                 })
        //                 default_ik.push(list_ik[x].value)
        //             }
        //             rec.setValue({
        //                 fieldId: custpage_instruksi_kerja,
        //                 value: default_ik,
        //                 ignoreFieldChange: true
        //             })
        //             ik_field.isDisabled = false
        //         }
        //     }
        // }

        // if(fieldName == custpage_class){
        //     var ik_class = rec.getValue(custpage_class)
        //     var startdate = rec.getText(custpage_startdate)
        //     var enddate = rec.getText(custpage_enddate)
        //     console.log('startdate + enddate', startdate + enddate)
        //     if(ik_class && startdate && enddate){
        //         var data = {startdate: startdate, enddate: enddate, ik_class: ik_class}
        //         var list_ik = getIK(data)
        //         var ik_field = rec.getField(custpage_instruksi_kerja)
        //         ik_field.removeSelectOption({ value: null })
        //         if (Object.keys(list_ik).length > 0) {
        //             var default_ik = []
        //             for (var x in list_ik) {
        //                 // console.log('Insert data ' + x + ' ' + list_ik[x])
        //                 ik_field.insertSelectOption({
        //                     value: list_ik[x].value,
        //                     text: list_ik[x].text
        //                 })
        //                 default_ik.push(list_ik[x].value)
        //             }
        //             rec.setValue({
        //                 fieldId: custpage_instruksi_kerja,
        //                 value: default_ik,
        //                 ignoreFieldChange: true
        //             })
        //             ik_field.isDisabled = false
        //         }
            
        //     } else if(!ik_class && startdate && enddate){
        //         var data = {startdate: startdate, enddate: enddate, ik_class: ''}
        //         var list_ik = getIK(data)
        //         var ik_field = rec.getField(custpage_instruksi_kerja)
        //         ik_field.removeSelectOption({ value: null })
        //         if (Object.keys(list_ik).length > 0) {
        //             var default_ik = []
        //             for (var x in list_ik) {
        //                 // console.log('Insert data ' + x + ' ' + list_ik[x])
        //                 ik_field.insertSelectOption({
        //                     value: list_ik[x].value,
        //                     text: list_ik[x].text
        //                 })
        //                 default_ik.push(list_ik[x].value)
        //             }
        //             rec.setValue({
        //                 fieldId: custpage_instruksi_kerja,
        //                 value: default_ik,
        //                 ignoreFieldChange: true
        //             })
        //             ik_field.isDisabled = false
        //         }
        //     }
        // }
        return true
    }

    function getIK(data){
        var startdate = data.startdate
        var enddate = data.enddate
        var ik_class = data.ik_class
        console.log('data getIK', data)
        var filters = [
            ["type","anyof","WorkOrd"], 
            "AND", 
            ["trandate","within",startdate,enddate], 
            "AND", 
            ["item.type","anyof","InvtPart"],
        ]
        if(ik_class && ik_class != ''){
            filters.push(
                "AND",
                ["class","anyof",ik_class]
            )
        }

        
        console.log('filters getIK', JSON.stringify(filters))

        var ik_search = search.create({
            type: "workorder",
            filters: filters,
            columns:
            [
               search.createColumn({name: "tranid", label: "Document Number"}),
               search.createColumn({name: "trandate", label: "Date"})
            ]
        });
        var startrow = 0
        var list_ik = {}

        do {
            var ik_result = ik_search.run().getRange(startrow, startrow + 1000)
            if(ik_result.length > 0){
                for(var i = 0; i < ik_result.length; i++){
                    var ik_id = ik_result[i].id
                    var ik_tranid = ik_result[i].getValue({name: "tranid", label: "Document Number"})

                    if(!list_ik[ik_id]){
                        list_ik[ik_id] = {value: ik_id, text: ik_tranid}
                    }
                }
            }
            
            startrow += 1000
        } while (ik_result.length == 1000);

        console.log('IK Result length: ' + Object.keys(list_ik).length, list_ik)

        return list_ik

    }

    

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
    }
});

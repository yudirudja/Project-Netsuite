/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/search", "../lib/moment.min.js"], function (search, moment) {

    function beforeSubmit(context) {

        let rec = context.newRecord;

        let bill_memo_arr = []

        let get_line = rec.getLineCount('apply')

        for (let i = 0; i < get_line; i++) {

            let get_is_checked = rec.getSublistValue({
                sublistId: "apply",
                fieldId: "apply",
                line: i,
            })
            let get_bill_id = rec.getSublistValue({
                sublistId: "apply",
                fieldId: "internalid",
                line: i,
            })
            let get_due_date = rec.getSublistValue({
                sublistId: "apply",
                fieldId: "duedate",
                line: i,
            })


            if ((get_is_checked == "T" || get_is_checked == true || get_is_checked == "true")) {
                let get_bill_memo = search.lookupFields({
                    type: search.Type.VENDOR_BILL,
                    id: get_bill_id,
                    columns: ['memo']
                });

                bill_memo_arr.push({
                    due_date: get_due_date,
                    bill_memo: get_bill_memo.memo
                })
            }

            // if ((get_is_checked == "T" || get_is_checked == true || get_is_checked == "true") && get_line > 1) {
            //     let get_bill_memo = search.lookupFields({
            //         type: search.Type.VENDOR_BILL,
            //         id: get_bill_id,
            //         columns: ['memo']
            //     });

            //     if (i != get_line - 1) {
            //         combine_all_memo += get_bill_memo.memo + ",";
            //     }else{
            //         combine_all_memo += get_bill_memo.memo;
            //     }
            // }

        }

        bill_memo_arr.sort((a, b) => {
            // Convert the date strings to Unix timestamps
            let timeA = moment(a.due_date, "DD/MM/YYYY").toDate().getTime();
            let timeB = moment(b.due_date, "DD/MM/YYYY").toDate().getTime();

            // Compare the timestamps
            return timeB - timeA; // Ascending order
        });

        let combine_memo = ""

        for (let i = 0; i < bill_memo_arr.length; i++) {
            if (i != bill_memo_arr.length - 1) {
                combine_memo += bill_memo_arr[i].bill_memo + ",";
            } else {
                combine_memo += bill_memo_arr[i].bill_memo;
            }

        }

        rec.setValue("custbody_me_memo_bill", combine_memo);



    }

    return {
        beforeSubmit: beforeSubmit,
    }
});

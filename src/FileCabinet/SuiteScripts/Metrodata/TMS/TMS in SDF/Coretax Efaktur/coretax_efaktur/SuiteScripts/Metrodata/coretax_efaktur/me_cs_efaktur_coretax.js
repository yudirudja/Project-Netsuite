//@ts-check
/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
// @ts-ignore
define(['N/log', 'N/currentRecord', 'N/search'], function (log, currentRecord, search) {

    const FORM_COMPONENT_IDS = {
        custpage_startdate: 'custpage_startdate',
        custpage_enddate: 'custpage_enddate',
        custpage_trxlist: 'custpage_trxlist'
    }



    function searchTranasctions(startDate, endDate) {

        let result = new Array()

        let invoiceSearchObj = search.create({
            type: "invoice",
            filters:
                [
                    ["trandate", "within", startDate, endDate],
                    "AND",
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "SUBSTR({transactionname}, INSTR({transactionname},'#') + 1)",
                        label: "Name"
                    }),
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });
        console.log("test4");

        for (let i = 0; i < invoiceSearchObj.length; i++) {
            let internal_id = invoiceSearchObj[i].getValue(invoiceSearchObj[i].columns[0])
            let name = invoiceSearchObj[i].getValue(invoiceSearchObj[i].columns[1])

            result.push({
                internal_id: internal_id,
                name: name
            })

        }
        return result;
    }

    function pageInit(context) {

        let rec = context.currentRecord;

        let startDate = rec.getText(FORM_COMPONENT_IDS.custpage_startdate)
        let endDate = rec.getText(FORM_COMPONENT_IDS.custpage_enddate)

        let field_trx = rec.getField(FORM_COMPONENT_IDS.custpage_trxlist);

        field_trx.removeSelectOption({ value: null });

        if (startDate && endDate) {
            let getTransaction = searchTranasctions(startDate, endDate)

            for (let i = 0; i < getTransaction.length; i++) {
                field_trx.insertSelectOption({
                    value: getTransaction[i].internal_id,
                    text: getTransaction[i].name
                })
            }

        }

    }

    function fieldChanged(context) {
        let rec = context.currentRecord;

        let startDate = rec.getText(FORM_COMPONENT_IDS.custpage_startdate)
        let endDate = rec.getText(FORM_COMPONENT_IDS.custpage_enddate)

        let field_trx = rec.getField(FORM_COMPONENT_IDS.custpage_trxlist);

        console.log(context.fieldId)

        if (startDate && endDate) {
            if (context.fieldId == FORM_COMPONENT_IDS.custpage_startdate) {
                let getTransaction = searchTranasctions(startDate, endDate)

                field_trx.removeSelectOption({ value: null });

                for (let i = 0; i < getTransaction.length; i++) {
                    field_trx.insertSelectOption({
                        value: getTransaction[i].internal_id,
                        text: getTransaction[i].name
                    })
                }
            }

            if (context.fieldId == FORM_COMPONENT_IDS.custpage_enddate) {
                let getTransaction = searchTranasctions(startDate, endDate)

                field_trx.removeSelectOption({ value: null });

                for (let i = 0; i < getTransaction.length; i++) {
                    field_trx.insertSelectOption({
                        value: getTransaction[i].internal_id,
                        text: getTransaction[i].name
                    })
                }
            }
        }
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
    }
});

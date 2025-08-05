/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function () {

    function pageInit(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;

        // if (fieldId == 'entity') {

            try {


                // rec.setValue('entity', 182)

                rec.selectNewLine({ sublistId: "item" })

                rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: 120,
                    ignoreFieldChange:false
                    // line:0
                });

                rec.commitLine('item')
                rec.selectNewLine({ sublistId: "item" })

                rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: 120,
                    ignoreFieldChange:false
                    // line:1
                });

                rec.commitLine('item')
            } catch (error) {
                log.debug("error", error)
            }
        // }
    }



    return {
        pageInit: pageInit,
    }
});

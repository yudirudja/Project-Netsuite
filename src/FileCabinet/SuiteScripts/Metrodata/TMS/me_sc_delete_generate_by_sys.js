/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define(['N/search', 'N/record'], function(search, record) {

    function execute(context) {
        var journalentrySearchObj = search.create({
            type: "journalentry",
            filters:
            [
               ["type","anyof","Journal"], 
               "AND", 
               ["custbody_me_generate_by_sys","is","T"], 
               "AND", 
               ["trandate","within","1/10/2024","31/10/2024"]
            ],
            columns:
            [
               search.createColumn({
                  name: "internalid",
                  summary: "GROUP",
                  label: "Internal ID"
               })
            ]
         });

         let start_row = 0
         do {
            var get_result = journalentrySearchObj.run().getRange({
                start: start_row,
                end: start_row + 1000,
            })

            for (let i = 0; i < get_result.length; i++) {
                let internal_id = get_result[i].getValue(get_result[i].columns[0]);


                record.delete({
                    type: 'journalentry',
                    id: internal_id,
                });

            }

            if (get_result.length % 1000 === 0) {
                start_row += 1000
            }

        } while (get_result.length === 1000);

    }

    return {
        execute: execute
    }
});

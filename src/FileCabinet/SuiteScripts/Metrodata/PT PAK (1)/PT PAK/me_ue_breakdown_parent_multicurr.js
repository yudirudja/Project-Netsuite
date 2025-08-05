/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', './library/moment.min.js'], function (record, search, moment) {

    function searchGemChild(id) {
        result = [];
        countDuplicate = 0;
        var gemChildSearch = search.create({
            type: "customrecord_me_gem_breakdown_list",
            filters:
                [
                    ["internalid", "anyof", id]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        join: "CUSTRECORD_ME_BEM_NUMBER",
                        sort: search.Sort.DESC,
                        label: "Internal ID"
                    }),
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let i = 0; i < gemChildSearch.length; i++) {
            var internalId = gemChildSearch[i].getValue(gemChildSearch[i].columns[0]);

            for (let x = 0; x < result.length; x++) {
                if (result[x].internal_id == internalId) {
                    countDuplicate++;
                }
            }
            if (countDuplicate < 1) {
                result.push({
                    internal_id: internalId,
                });
            }
            countDuplicate = 0;


        }

        return result;

    }

    function afterSubmit(context) {
        try {

            var currentRecord = context.newRecord;

            var getId = currentRecord.id;

            var getGemChild = searchGemChild(getId);
            for (let x = 0; x < getGemChild.length; x++) {
                var loadRecord = record.load({
                    type: 'customrecord_me_gem_breakdown_line_list',
                    id: getGemChild[x].internal_id,
                });

                var saveChildGem = loadRecord.save();

            }

        } catch (error) {
            log.debug("error", error);
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});

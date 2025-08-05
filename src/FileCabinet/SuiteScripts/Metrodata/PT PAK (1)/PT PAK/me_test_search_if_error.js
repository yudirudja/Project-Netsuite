/**
    *@NApiVersion 2.1
    *@NScriptType Suitelet
*/
define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/url', 'N/format', 'N/record', "N/runtime", './library/moment.min.js'],
    function (search, serverWidget, log, task, redirect, url, format, record, runtime, moment) {

        function onRequest(context) {
            var inventorybalanceSearchObj = search.create({
                type: "inventorybalance",
                filters:
                    [
                        ["item.type", "anyof", "Assembly"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "internalid",
                            join: "item",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "item",
                            sort: search.Sort.ASC,
                            label: "Design Code"
                        }),
                        search.createColumn({ name: "inventorynumber", label: "Product Code" }),
                        search.createColumn({ name: "location", label: "Location" }),
                        search.createColumn({ name: "status", label: "Status" }),
                        search.createColumn({ name: "onhand", label: "On Hand" }),
                        search.createColumn({ name: "available", label: "Available" }),
                        search.createColumn({
                            name: "averagecost",
                            join: "item",
                            label: "Unit Cost"
                        })
                    ]
            }).run().getRange({
                start: 0,
                end: 1000,
            });

            var test = [];

            for (let x = 0; x < inventorybalanceSearchObj.length; x++) {
                var bill_tranid = inventorybalanceSearchObj[i].getValue(inventorybalanceSearchObj[i].columns[0])
                var item = inventorybalanceSearchObj[i].getValue(inventorybalanceSearchObj[i].columns[1])
                var invenNumber = inventorybalanceSearchObj[i].getValue(inventorybalanceSearchObj[i].columns[2])
                var location = inventorybalanceSearchObj[i].getValue(inventorybalanceSearchObj[i].columns[3])
                var status = inventorybalanceSearchObj[i].getValue(inventorybalanceSearchObj[i].columns[4])

                test.push({
                    item: item,
                    invenNumber: invenNumber,
                    location: location,
                    status: status
                })

            }

            log.debug("test", test);

            return test;
        }

        return {
            onRequest: onRequest
        }
    });

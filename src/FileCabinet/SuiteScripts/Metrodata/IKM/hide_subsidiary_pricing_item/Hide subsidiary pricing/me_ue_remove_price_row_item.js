/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/record", "N/url", "N/ui/serverWidget", "../config/config.js", "N/search"], function (runtime, record, url, serverWidget, config, search) {


    function subsidiary(params) {
        let result = []
        if (params.length>0) {
            var subsidiarySearchObj = search.create({
                type: "subsidiary",
                filters:
                [
                   ["internalid","anyof",params]
                ],
                columns:
                [
                   search.createColumn({name: "tranprefix", label: "Transaction Prefix"}),
                   search.createColumn({name: "internalid", label: "Internal ID"})
                ]
             }).run().getRange({
                start:0,
                end:1000,
             });
    
             for (let i = 0; i < subsidiarySearchObj.length; i++) {
                let subsidiary_name = subsidiarySearchObj[i].getValue(subsidiarySearchObj[i].columns[0]);
                let subsidiary_id = subsidiarySearchObj[i].getValue(subsidiarySearchObj[i].columns[1]);
                result.push({
                    subsidiary_name: subsidiary_name,
                    subsidiary_id: subsidiary_id,
                });
                
             }
             
            }
            log.debug("sub_result", result)
         return result;
    }

    function getItemPriceLvl(id) {
        let result = []

        var itemSearchObj = search.create({
            type: "item",
            filters:
                [
                    ["internalid", "anyof", id]
                ],
            columns:
                [
                    search.createColumn({ name: "itemid", label: "Name" }),
                    search.createColumn({
                        name: "pricelevel",
                        join: "pricing",
                        label: "Price Level"
                    }),

                ]
        }).run().getRange({
            start: 0,
            end: 1000
        });

        for (let i = 0; i < itemSearchObj.length; i++) {
            let pricelvl_id = itemSearchObj[i].getValue(itemSearchObj[i].columns[1]);
            let pricelvl_name = itemSearchObj[i].getText(itemSearchObj[i].columns[1]);

            result.push({
                pricelvl_id: pricelvl_id,
                pricelvl_name: pricelvl_name,
            })

        }
        log.debug("result SS", result)
        return result
    }

    function beforeLoad(context) {

        let rec = context.newRecord;

        if (context.type != 'create') {

            let get_item_price_lvl = getItemPriceLvl(rec.id)

            // var rows = document.querySelectorAll("#price1_splits tr");
            // log.debug("rows", rows)

            let price_lvl_arr = []

            log.debug("user_attr", runtime.getCurrentUser())
            var user_role = runtime.getCurrentUser().role;
            var user_subsidiary = runtime.getCurrentUser().subsidiary;

            if (user_role != config.USER_ROLE.ADMINISTRATOR) {
                
                
                var load_role = record.load({
                    type: 'role', 
                    id: user_role,
                });
    
                let get_subsdiary = load_role.getValue("subsidiaryrestriction")
                let get_subsidiary_name = subsidiary(get_subsdiary)
                log.debug("get_subsidiary_name",get_subsidiary_name)


                var lookup_subsidiary = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: user_subsidiary,
                    columns: ['name', 'tranprefix'],
                });

                log.debug("lookup_subsidiary", lookup_subsidiary)


                let get_price1_length = rec.getLineCount("price1")

                for (let i = 0; i < get_price1_length; i++) {
                    let get_price_level = rec.getSublistValue({
                        sublistId: "price1",
                        fieldId: "pricelevel",
                        line: i,
                    })

                    let get_similarity = get_item_price_lvl.filter((data) => data.pricelvl_id == get_price_level)
                    // log.debug("get_similarity",get_similarity)
                    // log.debug("get_bool"+get_similarity[0].pricelvl_name,!get_subsidiary_name.some((data)=>get_similarity[0].pricelvl_name.includes(data.subsidiary_name)))

                    if (get_similarity.length > 0 && (get_subsidiary_name.length>0? !get_subsidiary_name.some((data)=>get_similarity[0].pricelvl_name.includes(data.subsidiary_name)):!get_similarity[0].pricelvl_name.includes(lookup_subsidiary.tranprefix))) {
                        price_lvl_arr.push({
                            price_lvl: get_similarity[0].pricelvl_name,
                            line: i
                        })

                    }

                }

                log.debug("price_lvl_arr", price_lvl_arr)

                var hideFld = context.form.addField({
                    id: 'custpage_hide_buttons',
                    label: 'not shown - hidden',
                    type: serverWidget.FieldType.INLINEHTML
                });
                var scr = "";
                // scr += `jQuery("a.dottedlink:contains('Remove')").hide();`;
                for (let i = 0; i < price_lvl_arr.length; i++) {
                    scr += `jQuery("#price1row${price_lvl_arr[i].line}").hide();`;

                }
                // scr += `jQuery(".listheader:contains('Edit')").hide();`;

                hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
            }
        }
    }



    return {
        beforeLoad: beforeLoad,

    }
});

/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/format", "N/search", "./config/me_config.js", './library/moment.min.js'], function (record, format, search, meconf, moment) {

    const TYPE = "itemfulfillment";
    const FIELD_DATE = meconf.DATE_FIELDS;
    const ERROR_CODE = {
        MISSING_REQ_FIELD: 'MISSING_REQ_FIELD',
        MISSING_REQ_VALUE: 'MISSING_REQ_VALUE',
        DUPLICATE_VALUE: 'DUPLICATE_VALUE',
        FIELD_MUST_BE_NUMBER: 'FIELD_MUST_BE_NUMBER',
        INVALID_RECORD_TYPE: 'INVALID_RECORD_TYPE',
        INVALID_VALUE: 'INVALID_VALUE',
        MISSING_REQ_OBJECT: 'MISSING_REQ_OBJECT'
    };

    const CUSTOMER_ADDRESS_FLD = [
        { key_name: 'addr1', fld_id: 'addr1' },
        { key_name: 'addr2', fld_id: 'addr2' },
        { key_name: 'city', fld_id: 'city' },
        { key_name: 'state', fld_id: 'state' },
        { key_name: 'zip', fld_id: 'zip' },
        { key_name: 'country', fld_id: 'country' }
    ];

    function doError(code, message, stack) {
        var error = {
            error: {
                code: code,
                message: message,
                stack: stack
            }
        };
        log.error("error", error);
        return error;
    }

    function createTransferOrder(context) {
        var applyLength = 0;
        var parentId = [];
        var userEnteredAmount = [];
        var inventoryDetailArr = [];
        try {
            if ('item' in context && Array.isArray(context.item)) {
                for (let i = 0; i < context.item.length; i++) {
                    var applyTransOrd = context.item[i];
                    applyLength = context.item.length;
                    for (const key in applyTransOrd) {
                        if (key == "item") {
                            parentId.push(applyTransOrd[key]);
                        }
                        if ('inventoryassignment' in context.item[i] && Array.isArray(context.item[i].inventoryassignment)) {
                            for (let x = 0; x < context.item[i].inventoryassignment.length; x++) {
                                var inventoryDetail = applyTransOrd.inventoryassignment[x];
                                var invStatus = "";
                                var invQuantity = 0
                                for (const key1 in inventoryDetail) {
                                    if (key1 == "inventorystatus") {
                                        invStatus = inventoryDetail[key1];
                                    }
                                    if (key1 == "quantity") {
                                        invQuantity = inventoryDetail[key1];
                                    }
                                }
                                inventoryDetailArr.push({
                                    item: applyTransOrd[key],
                                    inventory_status: invStatus,
                                    inventory_quantity: invQuantity,
                                });
                                invStatus = "";
                                invQuantity = 0;

                            }

                        }
                    }

                }
            }

            log.debug("parentId", parentId);

            // for (let x = 0; x < parentId.length; x++) {


            // var rec = record.transform({
            //   fromType: 'deposit',
            //   fromId: parentId[x],
            //   toType: 'customerpayment',
            // });

            var rec = record.create({
                type: 'itemfulfillment',
                isDynamic: true,
            });

            log.debug("sublistEditLength", rec.getLineCount({ sublistId: 'item' }));

            var sublistName = rec.getSublists();

            for (var fieldname in context) {
                if (context.hasOwnProperty(fieldname)) {
                    var isSublist = sublistName.indexOf(fieldname) > -1;
                    var isApply = (fieldname == "item");
                    var isObject = typeof context[fieldname] == "object";
                    if (!isSublist || !isObject) { //field biasa karena bukan sublist maupun object
                        if (FIELD_DATE.indexOf(fieldname) > -1) {
                            if (context[fieldname]) {
                                var dateString = format.parse({
                                    value: context[fieldname],
                                    type: format.Type.DATE
                                });
                                rec.setValue(fieldname, dateString);
                            }
                        }
                        else {
                            if (context[fieldname] || typeof context[fieldname] == "boolean") { rec.setValue(fieldname, context[fieldname]) };
                        }
                    }
                    else if (isSublist && isObject && isApply) { //field sublist dan ada object
                        var lineArr = context[fieldname];
                        var sublistEditLength = rec.getLineCount({ sublistId: 'item' });
                        log.debug("sublistLength", sublistEditLength);
                        for (let x = 0; x < parentId.length; x++) {
                            log.debug("parentId", parentId[x]);
                            log.debug("userEnteredAmount", userEnteredAmount[x]);
                            for (let i = 0; i < sublistEditLength; i++) {
                                log.debug('invoice internal id sublist', rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }))
                                if (rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }) == parentId[x]) {
                                    var lineNum = rec.selectLine({
                                        sublistId: "item",
                                        line: i
                                    });
                                    // log.debug('working on invoice line:' + i, rec.getSublistValue({
                                    //   sublistId: 'payment',
                                    //   fieldId: 'refnum',
                                    //   line: i
                                    // }));
                                    // rec.setCurrentSublistValue({
                                    //   sublistId: 'item',
                                    //   fieldId: 'paymentamount',
                                    //   line: i,
                                    //   value: userEnteredAmount[x],
                                    // });
                                    rec.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'binitem',
                                        line: i,
                                        value: true
                                    });
                                    var inventoryDetail = rec.getCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'inventorydetailreq'
                                    });

                                    if (inventoryDetail == "T" && inventoryDetailArr.length > 0) {
                                        for (let p = 0; p < inventoryDetailArr.length; p++) {
                                            if (inventoryDetailArr[p].item == parentId[x]) {
                                                var inventoryDetailRecord = rec.getCurrentSublistSubrecord({
                                                    sublistId: 'item',
                                                    fieldId: 'inventorydetail'
                                                });
                                                inventoryDetailRecord.selectNewLine({
                                                    sublistId: 'inventoryassignment'
                                                });
                                                inventoryDetailRecord.setCurrentSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'inventorystatus',
                                                    value: inventoryDetail[p].inventory_status,
                                                });
                                                inventoryDetailRecord.setCurrentSublistValue({
                                                    sublistId: 'inventoryassignment',
                                                    fieldId: 'quantity',
                                                    value: inventoryDetail[p].inventory_quantity,
                                                });

                                            }


                                        }

                                        inventoryDetailRecord.commitLine("inventoryassignment");
                                    }



                                    // rec.setSublistValue({
                                    //   sublistId: 'payment',
                                    //   fieldId: 'paymentamount',
                                    //   line: i,
                                    //   value: userEnteredAmount[x],
                                    // });
                                    lineNum.commitLine("item")
                                }

                                // var lineObj = lineArr[i];
                                // rec.selectNewLine(fieldname);
                                // for (var fldnameperline in lineObj) {
                                //   if (lineObj[fldnameperline]) {
                                //     rec.setCurrentSublistValue({
                                //       sublistId: fieldname,
                                //       fieldId: fldnameperline,
                                //       value: lineObj[fldnameperline]
                                //     });
                                //   }
                                // }
                                // rec.commitLine(fieldname)
                            }

                        }
                    } else if (isSublist && isObject && !isApply) {
                        var lineArr = context[fieldname];
                        for (var i = 0; i < lineArr.length; i++) {
                            var lineObj = lineArr[i];
                            rec.selectNewLine(fieldname);
                            for (var fldnameperline in lineObj) {
                                if (lineObj[fldnameperline]) {
                                    rec.setCurrentSublistValue({
                                        sublistId: fieldname,
                                        fieldId: fldnameperline,
                                        value: lineObj[fldnameperline]
                                    });
                                }
                            }
                            rec.commitLine(fieldname)
                        }
                    }
                }
            }
            // }


            var recId = rec.save();
            var entityid = null;
            var tranId = null;
            var id = null;
            var altname = null;
            var compname = null;
            var datecreated = null;
            if (recId) {

                var lufTrx = search.lookupFields({
                    type: TYPE,
                    id: recId,
                    columns: ["tranid", "internalid"]
                });
                tranId = lufTrx.tranid;
                // altname = lufTrx.altname;
                id = lufTrx.internalid;
                // datecreated = lufTrx.datecreated;
            }
            return {
                status_request: "Berhasil Create",
                tranid: tranId,
                id: id[0].value,
                // customer_name: altname,
                create_date: moment().add(14, "hours").format("DD/MM/YYYY, h:mm:ss a"),
            };
        } catch (ex) {
            return doError(ex.name, ex.message, ex.stack);
        }

    }

    function updateTransferOrder(context) {
        var applyLength = 0;
        var parentId = [];
        var userEnteredAmount = [];
        try {
            if ('payment' in context && Array.isArray(context.payment)) {
                for (let i = 0; i < context.payment.length; i++) {
                    var applyInvoice = context.payment[i];
                    applyLength = context.payment.length;
                    for (const key in applyInvoice) {
                        if (key == "id") {
                            parentId.push(applyInvoice[key]);
                        }
                        if (key === "paymentamount") {
                            userEnteredAmount.push(applyInvoice[key]);
                        }
                    }

                }
            }

            log.debug("parentId", parentId)

            for (let x = 0; x < parentId.length; x++) {


                // var rec = record.transform({
                //   fromType: 'deposit',
                //   fromId: parentId[x],
                //   toType: 'customerpayment',
                // });

                var rec = record.load({
                    type: 'itemfulfillment',
                    id: context.id,
                    isDynamic: true
                });


                var sublistName = rec.getSublists();

                for (var fieldname in context) {
                    if (context.hasOwnProperty(fieldname)) {
                        var isSublist = sublistName.indexOf(fieldname) > -1;
                        var isApply = (fieldname == "payment");
                        var isObject = typeof context[fieldname] == "object";
                        if (!isSublist || !isObject) { //field biasa karena bukan sublist maupun object
                            if (FIELD_DATE.indexOf(fieldname) > -1) {
                                if (context[fieldname]) {
                                    var dateString = format.parse({
                                        value: context[fieldname],
                                        type: format.Type.DATE
                                    });
                                    rec.setValue(fieldname, dateString);
                                }
                            }
                            else {
                                if (context[fieldname] || typeof context[fieldname] == "boolean") { rec.setValue(fieldname, context[fieldname]) };
                            }
                        }
                        else if (isSublist && isObject && isApply) { //field sublist dan ada object
                            var lineArr = context[fieldname];
                            var sublistEditLength = rec.getLineCount({ sublistId: 'payment' });
                            log.debug("sublistLength", sublistEditLength);
                            for (let x = 0; x < parentId.length; x++) {
                                log.debug("parentId", parentId[x]);
                                log.debug("userEnteredAmount", userEnteredAmount[x]);
                                for (let i = 0; i < sublistEditLength; i++) {
                                    log.debug('invoice internal id sublist', rec.getSublistValue({ sublistId: 'payment', fieldId: 'id', line: i }))
                                    if (rec.getSublistValue({ sublistId: 'payment', fieldId: 'id', line: i }) == parentId[x]) {
                                        var lineNum = rec.selectLine({
                                            sublistId: "payment",
                                            line: i
                                        });
                                        // log.debug('working on invoice line:' + i, rec.getSublistValue({
                                        //   sublistId: 'payment',
                                        //   fieldId: 'refnum',
                                        //   line: i
                                        // }));
                                        rec.setCurrentSublistValue({
                                            sublistId: 'payment',
                                            fieldId: 'paymentamount',
                                            line: i,
                                            value: userEnteredAmount[x],
                                        });
                                        rec.setCurrentSublistValue({
                                            sublistId: 'payment',
                                            fieldId: 'deposit',
                                            line: i,
                                            value: true
                                        });
                                        // rec.setSublistValue({
                                        //   sublistId: 'payment',
                                        //   fieldId: 'paymentamount',
                                        //   line: i,
                                        //   value: userEnteredAmount[x],
                                        // });
                                        lineNum.commitLine("payment")
                                    }

                                    // var lineObj = lineArr[i];
                                    // rec.selectNewLine(fieldname);
                                    // for (var fldnameperline in lineObj) {
                                    //   if (lineObj[fldnameperline]) {
                                    //     rec.setCurrentSublistValue({
                                    //       sublistId: fieldname,
                                    //       fieldId: fldnameperline,
                                    //       value: lineObj[fldnameperline]
                                    //     });
                                    //   }
                                    // }
                                    // rec.commitLine(fieldname)
                                }

                            }
                        } else if (isSublist && isObject && !isApply) {
                            var lineArr = context[fieldname];
                            for (var i = 0; i < lineArr.length; i++) {
                                var lineObj = lineArr[i];
                                rec.selectNewLine(fieldname);
                                for (var fldnameperline in lineObj) {
                                    if (lineObj[fldnameperline]) {
                                        rec.setCurrentSublistValue({
                                            sublistId: fieldname,
                                            fieldId: fldnameperline,
                                            value: lineObj[fldnameperline]
                                        });
                                    }
                                }
                                rec.commitLine(fieldname)
                            }
                        }
                    }
                }
            }

            var recId = rec.save();

            // if(context["isinactive"] == false){
            //   log.debug("IsInactive lewat", context["isinactive"])
            //     try {
            //       var rec_cust = record.submitFields({
            //         type: TYPE,
            //         id : context.id,
            //         values: {
            //             'isinactive': context["isinactive"]
            //         }
            //       })
            //     } catch (ex) {
            //       return doError(ex.name, ex.message, ex.stack);
            //     }
            // }
            var entityid = null;
            var altname = null;
            var tranId = null;
            var compname = null;
            var datecreated = null;
            if (recId) {

                var lufTrx = search.lookupFields({
                    type: TYPE,
                    id: recId,
                    columns: ["tranid", "internalid"]
                });
                tranId = lufTrx.tranid;
                // altname = lufTrx.altname;
                id = lufTrx.internalid;
                // datecreated = lufTrx.datecreated;
            }
            return {
                status_request: "Berhasil Update",
                tranid: tranId,
                id: id[0].value,
                // customer_name: altname,
                create_date: moment().add(14, "hours").format("DD/MM/YYYY, h:mm:ss a"),
            };
        } catch (ex) {
            return doError(ex.name, ex.message, ex.stack);
        }
    }

    function inactiveTransferOrder(context) {
        try {
            var rec_cust = record.submitFields({
                type: TYPE,
                id: context.id,
                values: {
                    'isinactive': true
                }
            })
            return {
                status_request: 'Berhasil Delete/Inactive'
            }
        } catch (ex) {
            return doError(ex.name, ex.message, ex.stack);
        }
    }

    function post(context) {
        try {
            if (Array.isArray(context)) {
                return doError(ERROR_CODE.MISSING_REQ_OBJECT, 'Missing a required object. Please use Object {} rather than [{}].');
            }
            log.debug('context', context)
            var type = context.type
            if (type == 'create') {
                var create = createTransferOrder(context)
                return create
            }
            if (type == 'update') {
                var update = updateTransferOrder(context)
                return update
            }
            if (type == 'inactive') {
                var inactive = inactiveTransferOrder(context)
                return inactive
            }

        } catch (ex) {
            return doError(ex.name, ex.message, ex.stack);
        }
    }


    return {
        post: post
    };
})
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/format", "N/search", "./config/me_config.js", './library/moment.min.js'], function (record, format, search, meconf, moment) {

    const TYPE = "itemreceipt";
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

    function createTransOrdToReceipt(context) {
        var applyLength = 0;
        var parentId = [];
        var userEnteredAmount = [];
        try {
            if ('item' in context && Array.isArray(context.item)) {
                for (let i = 0; i < context.item.length; i++) {
                    var applyInvoice = context.item[i];
                    applyLength = context.item.length;
                    for (const key in applyInvoice) {
                        if (key === "item") {
                            parentId.push(applyInvoice[key]);
                        }
                        if (key === "quantity") {
                            userEnteredAmount.push(applyInvoice[key]);
                        }
                    }

                }
            }

            log.debug("parentId", parentId)

            for (let x = 0; x < parentId.length; x++) {


                var rec = record.transform({
                    fromType: 'transferorder',
                    fromId: context.createdfrom,
                    toType: 'itemreceipt',
                });


                var sublistName = rec.getSublists();

                for (var fieldname in context) {
                    if (context.hasOwnProperty(fieldname)) {
                        var isSublist = sublistName.indexOf(fieldname) > -1;
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
                        else if (isSublist && isObject) { //field sublist dan ada object
                            var lineArr = context[fieldname];
                            var sublistEditLength = rec.getLineCount({ sublistId: 'item' });
                            log.debug("sublistLength", sublistEditLength);
                            for (let x = 0; x < parentId.length; x++) {
                                log.debug("parentId", parentId[x]);
                                log.debug("userEnteredAmount", userEnteredAmount[x]);
                                for (let i = 0; i < sublistEditLength; i++) {
                                    log.debug('invoice internal id sublist', rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }))
                                    if (rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }) == parentId[x]) {
                                        log.debug('working on invoice line:' + i, rec.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'item',
                                            line: i
                                        }));
                                        rec.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'quantity',
                                            line: i,
                                            value: userEnteredAmount[x],
                                        });
                                        rec.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'binitem',
                                            line: i,
                                            value: true
                                        });
                                        // rec.setSublistValue({
                                        //   sublistId: 'apply',
                                        //   fieldId: 'userenteredamount',
                                        //   line: i,
                                        //   value: userEnteredAmount[x],
                                        // });
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
                        }
                    }
                }
            }


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

    function updateTransOrdToReceipt(context) {
        try {


            var rec = record.load({
                type: 'itemreceipt',
                id: context.id,
                isDynamic: false
            })


            var sublistName = rec.getSublists();

            for (var fieldname in context) {
                if (context.hasOwnProperty(fieldname) && fieldname != "undepfunds") {
                    var isSublist = sublistName.indexOf(fieldname) > -1;
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
                    else if (isSublist && isObject) { //field sublist dan ada object
                        var lineArr = context[fieldname];
                        for (var i = 0; i < lineArr.length; i++) {
                            var lineObjLength = lineArr.length
                            var lineObj = lineArr[i];
                            // rec.selectNewLine(fieldname);
                            for (var fldnameperline in lineObj) {

                                // if (fldnameperline == "linesubrecupdate") {
                                //     var lineSubRec = lineObj[fldnameperline];
                                //     var lineUpdateSubRec = line.sort();
                                //     lineUpdate.reverse();
                                //     for (let i = 0; i < lineSubRec.length; i++) {
                                //         rec.removeCurrentSublistSubrecord({
                                //             sublistId: 'inventory',
                                //             fieldId: 'inventorydetail',
                                //             // line: i
                                //         });
                                //     }
                                // }

                                if (fldnameperline == "delete_sub_record_line") {
                                    var lineDelete = lineObj[fldnameperline];
                                    var inventoryDetailDelete = rec.getSublistSubrecord({
                                        sublistId: 'item',
                                        fieldId: 'inventorydetail',
                                        line: i,
                                    });
                                    log.debug("linedelete", lineDelete)
                                    lineDelete.sort();
                                    lineDelete.reverse();
                                    for (let j = 0; j < lineDelete.length; j++) {
                                        inventoryDetailDelete.removeLine({
                                            sublistId: 'inventoryassignment',
                                            line: lineDelete[j],
                                            // ignoreRecalc: true
                                        });
                                        
                                    }
                                    

                                }
                                if (fldnameperline == "invdetail") {
                                    var isDelete = false;
                                    var arrayFieldSub = lineObj[fldnameperline];
                                    for (let x = 0; x < arrayFieldSub.length; x++) {
                                        var subRec = arrayFieldSub[x];
                                        var inventoryDetail = rec.getSublistSubrecord({
                                            sublistId: 'item',
                                            fieldId: 'inventorydetail',
                                            line: i,
                                        });
                                        for (var fieldNameSubRec in subRec) {
                                            log.debug("fieldnameSubRec", subRec[fieldNameSubRec]);
                                            if (subRec[fieldNameSubRec] && isDelete == false) {
                                                // inventoryDetail.selectNewLine({
                                                //     sublistId: 'inventoryassignment'
                                                // });
                                                if (fieldNameSubRec == "inventorystatus") {
                                                    var statusInvDet = inventoryDetail.setSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'inventorystatus',
                                                        value: subRec[fieldNameSubRec],
                                                        line: x
                                                    });
                                                }
                                                if (fieldNameSubRec == "receiptinventorynumber") {
                                                    log.debug("issueinventorynumber", subRec[fieldNameSubRec]);
                                                    var serialLotNumberInvDet = inventoryDetail.setSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'receiptinventorynumber',
                                                        value: subRec[fieldNameSubRec],
                                                        line: x
                                                    });
                                                }
                                                if (fieldNameSubRec == "quantity") {
                                                    var quantityInvDetail = inventoryDetail.setSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'quantity',
                                                        value: subRec[fieldNameSubRec],
                                                        line: x,
                                                    });
                                                }
                                            }

                                        }
                                        isDelete = false;
                                        // inventoryDetail.commitLine('inventoryassignment');
                                    }
                                } else {
                                    var getLineCount = rec.getLineCount('item')
                                    for (let x = 0; x < getLineCount; x++) {
                                        if (lineObj[fldnameperline]) {
                                            rec.setSublistValue({
                                                sublistId: fieldname,
                                                fieldId: fldnameperline,
                                                value: lineObj[fldnameperline],
                                                line: x
                                            });
                                        }
                                    }
                                }
                            }
                            // rec.commitLine(fieldname)
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

    function inactiveTransOrdToReceipt(context) {
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
                var create = createTransOrdToReceipt(context)
                return create
            }
            if (type == 'update') {
                var update = updateTransOrdToReceipt(context)
                return update
            }
            if (type == 'inactive') {
                var inactive = inactiveTransOrdToReceipt(context)
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
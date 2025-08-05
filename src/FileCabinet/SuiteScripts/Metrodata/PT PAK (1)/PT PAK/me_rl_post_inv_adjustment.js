/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/format", "N/search", "./config/me_config.js", './library/moment.min.js'], function (record, format, search, meconf, moment) {

    const TYPE = "inventoryadjustment";
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
        try {

            var rec = record.create({
                type: 'inventoryadjustment',
                isDynamic: true,
            });


            var sublistName = rec.getSublists();

            for (var fieldname in context) {
                if (context.hasOwnProperty(fieldname)) {
                    var isSublist = sublistName.indexOf(fieldname) > -1;
                    var isApply = (fieldname == "inventory");
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
                    } else if (isSublist && isObject && isApply) { //field sublist dan ada object(Item Bertipe Assembly Serialized Number/Lot Number)
                        var lineArr = context[fieldname];
                        for (var i = 0; i < lineArr.length; i++) {
                            var lineObjLength = lineArr.length
                            var lineObj = lineArr[i];
                            // rec.selectNewLine(fieldname);
                            for (var fldnameperline in lineObj) {
                                if (fldnameperline == "invdetail") {
                                    var arrayFieldSub = lineObj[fldnameperline];
                                    for (let x = 0; x < arrayFieldSub.length; x++) {
                                        var subRec = arrayFieldSub[x];
                                        var inventoryDetail = rec.getCurrentSublistSubrecord({
                                            sublistId: 'inventory',
                                            fieldId: 'inventorydetail',
                                            line: i,
                                        });
                                        for (var fieldNameSubRec in subRec) {
                                            log.debug("fieldnameSubRec", subRec[fieldNameSubRec]);
                                            if (subRec[fieldNameSubRec]) {
                                                // inventoryDetail.selectNewLine({
                                                //     sublistId: 'inventoryassignment'
                                                // });
                                                if (fieldNameSubRec == "inventorystatus") {
                                                    var statusInvDet = inventoryDetail.setCurrentSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'inventorystatus',
                                                        value: subRec[fieldNameSubRec],
                                                    });
                                                }
                                                if (fieldNameSubRec == "receiptinventorynumber") {
                                                    log.debug("issueinventorynumber", subRec[fieldNameSubRec]);
                                                    var serialLotNumberInvDet = inventoryDetail.setCurrentSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'receiptinventorynumber',
                                                        value: subRec[fieldNameSubRec],
                                                    });
                                                }
                                                if (fieldNameSubRec == "quantity") {
                                                    var quantityInvDetail = inventoryDetail.setCurrentSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'quantity',
                                                        value: subRec[fieldNameSubRec],
                                                    });
                                                }
                                            }

                                        }
                                        inventoryDetail.commitLine('inventoryassignment');
                                    }
                                } else {
                                    if (lineObj[fldnameperline]) {
                                        rec.setCurrentSublistValue({
                                            sublistId: fieldname,
                                            fieldId: fldnameperline,
                                            value: lineObj[fldnameperline],
                                        });
                                    }
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
        try {

            var rec = record.load({
                type: "inventoryadjustment",
                id: context.id,
                isDynamic: true
            });

            var sublistName = rec.getSublists();

            for (var fieldname in context) {
                if (fieldname == "lineupdate") {
                    var line = context[fieldname];
                    var lineUpdateLength = context[fieldname].length;
                    var lineUpdate = line.sort();
                    lineUpdate.reverse();
                    for (let i = 0; i < lineUpdateLength; i++) {
                        rec.removeLine({
                            sublistId: 'inventory',
                            line: lineUpdate[i],
                        });
                    }
                } else if (context.hasOwnProperty(fieldname) && fieldname != "lineupdate") {
                    var isSublist = sublistName.indexOf(fieldname) > -1;
                    var isApply = (fieldname == "inventory");
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
                    } else if (isSublist && isObject && isApply) { //field sublist dan ada object(Item Bertipe Assembly Serialized Number/Lot Number)
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

                                if (fldnameperline == "invdetail") {
                                    var arrayFieldSub = lineObj[fldnameperline];
                                    for (let x = 0; x < arrayFieldSub.length; x++) {
                                        var subRec = arrayFieldSub[x];
                                        var inventoryDetail = rec.getCurrentSublistSubrecord({
                                            sublistId: 'inventory',
                                            fieldId: 'inventorydetail',
                                            line: i,
                                        });
                                        for (var fieldNameSubRec in subRec) {
                                            log.debug("fieldnameSubRec", subRec[fieldNameSubRec]);
                                            if (subRec[fieldNameSubRec]) {
                                                // inventoryDetail.selectNewLine({
                                                //     sublistId: 'inventoryassignment'
                                                // });
                                                if (fieldNameSubRec == "inventorystatus") {
                                                    var statusInvDet = inventoryDetail.setCurrentSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'inventorystatus',
                                                        value: subRec[fieldNameSubRec],
                                                    });
                                                }
                                                if (fieldNameSubRec == "receiptinventorynumber") {
                                                    log.debug("issueinventorynumber", subRec[fieldNameSubRec]);
                                                    var serialLotNumberInvDet = inventoryDetail.setCurrentSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'receiptinventorynumber',
                                                        value: subRec[fieldNameSubRec],
                                                    });
                                                }
                                                if (fieldNameSubRec == "quantity") {
                                                    var quantityInvDetail = inventoryDetail.setCurrentSublistValue({
                                                        sublistId: 'inventoryassignment',
                                                        fieldId: 'quantity',
                                                        value: subRec[fieldNameSubRec],
                                                    });
                                                }
                                            }

                                        }
                                        inventoryDetail.commitLine('inventoryassignment');
                                    }
                                } else {
                                    if (lineObj[fldnameperline]) {
                                        rec.setCurrentSublistValue({
                                            sublistId: fieldname,
                                            fieldId: fldnameperline,
                                            value: lineObj[fldnameperline],
                                        });
                                    }
                                }
                            }
                            rec.commitLine(fieldname)
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
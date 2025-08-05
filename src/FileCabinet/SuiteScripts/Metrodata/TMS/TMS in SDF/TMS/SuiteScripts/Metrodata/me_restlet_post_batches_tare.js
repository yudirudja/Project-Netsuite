/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/format", "N/search", './lib/moment.min.js'], function (record, format, search, moment) {

  const TYPE = "customrecord_me_csrec_batches_item";
  // const FIELD_DATE = DATE_FIELDS;
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

  function createBatches(context) {
    try {
      var rec = record.create({
        type: TYPE,
        isDynamic: true
      });

      var sublistName = rec.getSublists();

      for (var fieldname in context) {
        if (context.hasOwnProperty(fieldname)) {
          var isSublist = sublistName.indexOf(fieldname) > -1;
          var isObject = typeof context[fieldname] == "object";
          // ==== START Check if the field is date field ====
          var field = rec.getField({
            fieldId: fieldname
          });
          var fieldType = "";
          if (field) {
            fieldType = field.type;
          }
          // ==== END Check if the field is date field ====

          if (!isSublist || !isObject) { //field biasa karena bukan sublist maupun object
            if (fieldType.toLowerCase().indexOf("date") != -1) {
              if (context[fieldname]) {
                var dateString = format.parse({
                  value: context[fieldname],
                  type: format.Type.DATE
                });
                rec.setValue(fieldname, dateString);
              }
            } else {
              if (context[fieldname] || typeof context[fieldname] == "boolean" || lineObj[fldnameperline] == 0) {
                rec.setValue(fieldname, context[fieldname])
              };
            }
          } else if (isSublist && isObject) { //field sublist dan ada object
            var lineArr = context[fieldname];
            for (var i = 0; i < lineArr.length; i++) {
              var lineObj = lineArr[i];
              rec.selectNewLine(fieldname);
              for (var fldnameperline in lineObj) {

                // ==== START Check if the field sulist is date field ====
                var subField = rec.getSublistField({
                  sublistId: fieldname,
                  fieldId: fldnameperline,
                  line: i
                });
                var subFieldType = "";
                if (subField) {
                  subFieldType = subField.type;
                }
                // ==== END Check if the field sulist is date field ====

                if (subFieldType.toLowerCase().indexOf("date") != -1) {
                  if (lineObj[fldnameperline]) {
                    var dateString = format.parse({
                      value: lineObj[fldnameperline],
                      type: format.Type.DATE
                    });

                    rec.setCurrentSublistValue({
                      sublistId: fieldname,
                      fieldId: fldnameperline,
                      value: dateString
                    });
                  }
                } else if (lineObj[fldnameperline] || typeof lineObj[fldnameperline] == "boolean" || lineObj[fldnameperline] == 0) {
                  rec.setCurrentSublistValue({
                    sublistId: fieldname,
                    fieldId: fldnameperline,
                    value: lineObj[fldnameperline]
                  });
                }

              }
              rec.commitLine(fieldname);
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
      var batchNo = null;
      if (recId) {
        var lufTrx = search.lookupFields({
          type: TYPE,
          id: recId,
          columns: ["created", "internalid", "name"]
        });
        // altname = lufTrx.altname;
        id = lufTrx.internalid;
        datecreated = lufTrx.created;
        batchNo = lufTrx.name;
      }
      return {
        status_request: "Berhasil Create",
        internalid: recId,
        batchNo: batchNo,
        // customer_name: altname,
        create_date: moment().add(15, "hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function updateBatches(context) {
    log.debug('context.name', context.name)
    try {
      var rec = record.load({
        type: TYPE,
        id: context.name,
        isDynamic: false
      });

      var sublistName = rec.getSublists();

      for (var fieldname in context) {
        if (fieldname != 'name') {
          if (context.hasOwnProperty(fieldname)) {
            var isSublist = sublistName.indexOf(fieldname) > -1;
            var isObject = typeof context[fieldname] == "object";

            // ==== START Check if the field is date field ====
            var field = rec.getField({
              fieldId: fieldname
            });
            var fieldType = ''
            if (field) {
              fieldType = field.type
            }
            // ==== END Check if the field is date field ====

            if (!isSublist || !isObject) { //field biasa karena bukan sublist maupun object
              if (fieldType.toLowerCase().indexOf('date') != -1) {
                if (context[fieldname]) {
                  var dateString = format.parse({
                    value: context[fieldname],
                    type: format.Type.DATE
                  });
                  rec.setValue(fieldname, dateString);
                }
              } else {
                if (context[fieldname] || typeof context[fieldname] == "boolean" || lineObj[fldnameperline] == 0) {
                  rec.setValue(fieldname, context[fieldname]);
                }
              }
            }
            else if (isSublist && isObject) { //field sublist dan ada object
              var lineArr = context[fieldname];
              var removeLine = []
              for (var i = 0; i < lineArr.length; i++) {
                var lineObj = lineArr[i];
                if (Object.keys(lineArr[i]).length > 0) {
                  // rec.selectLine({sublistId: fieldname, line:i})
                  try {
                    if (lineObj["action"] == "remove") {
                      // When action remove, line unique key will be collected to be removed later
                      var line_index = -1

                      var line_lineuniquekey = rec.findSublistLineWithValue({
                        sublistId: fieldname,
                        fieldId: "lineuniquekey",
                        value: lineObj["lineuniquekey"],
                      });
                      var line_line = rec.findSublistLineWithValue({
                        sublistId: fieldname,
                        fieldId: "line",
                        value: lineObj["lineuniquekey"],
                      });
                      var line_child_id = rec.findSublistLineWithValue({
                        sublistId: fieldname,
                        fieldId: "id",
                        value: lineObj["lineuniquekey"],
                      });


                      if (line_lineuniquekey != -1) {
                        line_index = line_lineuniquekey
                      } else if (line_line != -1) {
                        line_index = line_line
                      } else if (line_child_id != -1) {
                        line_index = line_child_id
                      }

                      log.debug(
                        'nama line isexist sublist: ' + fieldname,
                        'line_lineuniquekey: ' + line_lineuniquekey +
                        'line_line: ' + line_line +
                        'line_child_id: ' + line_child_id +
                        'line_index: ' + line_index
                      )

                      if (removeLine != -1) {

                        removeLine.push(line_index);
                      }
                    } else if (lineObj["action"] == "update") {

                      var line_index = -1

                      var line_lineuniquekey = rec.findSublistLineWithValue({
                        sublistId: fieldname,
                        fieldId: "lineuniquekey",
                        value: lineObj["lineuniquekey"],
                      });
                      var line_line = rec.findSublistLineWithValue({
                        sublistId: fieldname,
                        fieldId: "line",
                        value: lineObj["lineuniquekey"],
                      });
                      var line_child_id = rec.findSublistLineWithValue({
                        sublistId: fieldname,
                        fieldId: "id",
                        value: lineObj["lineuniquekey"],
                      });



                      if (line_lineuniquekey != -1) {
                        line_index = line_lineuniquekey
                      } else if (line_line != -1) {
                        line_index = line_line
                      } else if (line_child_id != -1) {
                        line_index = line_child_id
                      }

                      log.debug(
                        'nama line isexist sublist: ' + fieldname,
                        'line_lineuniquekey: ' + line_lineuniquekey +
                        'line_line: ' + line_line +
                        'line_child_id: ' + line_child_id +
                        'line_index: ' + line_index
                      )

                      for (var fldnameperline in lineObj) {
                        if (fldnameperline == "action" || fldnameperline == "lineuniquekey") continue;

                        // ==== START Check if the field sulist is date field ====
                        var subField = rec.getSublistField({
                          sublistId: fieldname,
                          fieldId: fldnameperline,
                          line: line_index,
                        });
                        var subFieldType = "";
                        if (subField) {
                          subFieldType = subField.type;
                        }
                        // ==== END Check if the field sulist is date field ====

                        if (subFieldType.toLowerCase().indexOf("date") != -1) {
                          if (lineObj[fldnameperline]) {
                            var dateString = format.parse({
                              value: lineObj[fldnameperline],
                              type: format.Type.DATE,
                            });

                            rec.setSublistValue({
                              sublistId: fieldname,
                              fieldId: fldnameperline,
                              value: dateString,
                              line: line_index,
                            });
                          }
                        } else if (lineObj[fldnameperline] || typeof lineObj[fldnameperline] == "boolean" || lineObj[fldnameperline] == 0) {
                          rec.setSublistValue({
                            sublistId: fieldname,
                            fieldId: fldnameperline,
                            value: lineObj[fldnameperline],
                            line: line_index,
                          });
                        }
                      }

                    } else if (lineObj["action"] == "add") {

                      var line_index = rec.getLineCount(fieldname)
                      for (var fldnameperline in lineObj) {
                        if (fldnameperline == "action" || fldnameperline == "lineuniquekey") continue;

                        // ==== START Check if the field sulist is date field ====
                        var subField = rec.getSublistField({
                          sublistId: fieldname,
                          fieldId: fldnameperline,
                          line: line_index,
                        });
                        var subFieldType = "";
                        if (subField) {
                          subFieldType = subField.type;
                        }
                        // ==== END Check if the field sulist is date field ====

                        if (subFieldType.toLowerCase().indexOf("date") != -1) {
                          if (lineObj[fldnameperline]) {
                            var dateString = format.parse({
                              value: lineObj[fldnameperline],
                              type: format.Type.DATE,
                            });

                            rec.setSublistValue({
                              sublistId: fieldname,
                              fieldId: fldnameperline,
                              value: dateString,
                              line: line_index,
                            });
                          }
                        } else if (lineObj[fldnameperline] || typeof lineObj[fldnameperline] == "boolean" || lineObj[fldnameperline] == 0) {
                          rec.setSublistValue({
                            sublistId: fieldname,
                            fieldId: fldnameperline,
                            value: lineObj[fldnameperline],
                            line: line_index,
                          });
                        }

                      }
                    }
                  } catch (error) {
                    log.debug('Error action sublist. case ' + lineObj["action"], lineObj)
                    throw ('Error when taking action for sublist. ' + error)
                  }
                }
              }
              if (removeLine.length > 0) {
                log.debug('Array remove line ', removeLine)
                for (var j = removeLine.length - 1; j >= 0; j--) {
                  rec.removeLine({
                    sublistId: fieldname,
                    line: removeLine[j],
                    ignoreRecalc: true
                  })
                }
              }
            }
          }
        }
      }
      var recId = rec.save();

      var entityid = null;
      var altname = null;
      var tranId = null;
      var compname = null;
      var datecreated = null;
      if (recId) {
        var lufTrx = search.lookupFields({
          type: TYPE,
          id: recId,
          columns: ["created", "internalid", "name"]
        });
        // altname = lufTrx.altname;
        id = lufTrx.internalid;
        datecreated = lufTrx.created;
        batchNo = lufTrx.name;
      }
      return {
        status_request: "Berhasil Update",
        internalid: recId,
        batchNo: batchNo[0].text,
        // customer_name: altname,
        create_date: moment().add(15, "hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function inactiveBatches(context) {
    try {
      var rec_cust = record.submitFields({
        type: TYPE,
        id: context.id,
        values: {
          isinactive: true
        }
      });
      return {
        status_request: "Berhasil Delete/Inactive"
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function getInternalId(data, dataContext) {
    var filter = [];

    log.debug('data', data)
    for (let i = 0; i < data.length; i++) {
      if (filter.length <= 0) {
        filter.push(
          ["idtext", "is", data[i]]
        )
      } else {
        filter.push(
          "OR",
          ["idtext", "is", data[i]]
        );
      }
    }
    log.debug('filter', filter)

    var getBatch = search.create({
      type: "customrecord_me_csrec_batches_item",
      filters: filter,
      columns:
        [
          search.createColumn({ name: "name", label: "ID" }),
          search.createColumn({ name: "internalid", label: "Internal ID" })
        ]
    }).run().getRange({
      start: 0,
      end: 1000,
    })

    var batchIdArr = [];
    for (let i = 0; i < getBatch.length; i++) {
      var name = getBatch[i].getValue(getBatch[i].columns[0]);
      var internalId = getBatch[i].getValue(getBatch[i].columns[1]);

      batchIdArr.push({
        name: name,
        internal_id: internalId
      })
    }

    log.debug('batchIdArr', batchIdArr)

    for (let i = 0; i < dataContext.length; i++) {
      var getEquivalentBatchId = batchIdArr.filter((data) => data.name == dataContext[i].name)
      log.debug('getEquivalentBatchId', getEquivalentBatchId)

      dataContext[i].name = getEquivalentBatchId[0].internal_id;
    }
    return dataContext
  }

  function post(context) {
    try {
      if (Array.isArray(context)) {
        return doError(ERROR_CODE.MISSING_REQ_OBJECT, 'Missing a required object. Please use Object {} rather than [{}].');
      }
      log.debug("context", context);
      var type = context.type;
      if (type == "create") {
        var idCreateArr = [];
        var batchNoArr = []
        for (let i = 0; i < context.data.length; i++) {
          log.debug('context.data[i]', context.data[i])
          var create = createBatches(context.data[i])
          idCreateArr.push(create.internalid);
          batchNoArr.push(create.batchNo);

        }
        return {
          status_request: "Berhasil Update",
          batchNo: batchNoArr,
          internal_id: idCreateArr,
          // batchNo: batchNo[0].text,
          // customer_name: altname,
          create_date: moment().add(15, "hours").format("DD/MM/YYYY, h:mm:ss a"),
        };
      }
      if (type == "update") {

        var batchNumberArr = []
        for (let i = 0; i < context.data.length; i++) {
          batchNumberArr.push(context.data[i].name);
        }
        var getBatchesId = getInternalId(batchNumberArr, context.data)
        for (let i = 0; i < context.data.length; i++) {
          log.debug('getBatchesId[i]', getBatchesId[i])
          var update = updateBatches(getBatchesId[i])

        }
        var idArr = []
        for (let i = 0; i < getBatchesId.length; i++) {
          idArr.push(getBatchesId[i].name)
        }
        return {
          status_request: "Berhasil Update",
          batchNo: batchNumberArr,
          internal_id: idArr,
          // batchNo: batchNo[0].text,
          // customer_name: altname,
          create_date: moment().add(15, "hours").format("DD/MM/YYYY, h:mm:ss a"),
        };
      }
      if (type == "inactive") {
        var inactive = inactiveBatches(context)
        return inactive;
      }
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  return {
    post: post
  };
});
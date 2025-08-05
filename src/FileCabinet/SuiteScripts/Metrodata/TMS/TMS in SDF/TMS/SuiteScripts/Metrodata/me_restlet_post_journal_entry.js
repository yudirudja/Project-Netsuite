/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/format", "N/search", './lib/moment.min.js'], function (record, format, search, moment) {

  const TYPE = "journalentry";
  // const FIELD_DATE = meconf.DATE_FIELDS;
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

  function createJournalEntry(context) {
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
          if(field){
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
                    if(subField){
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
      var tranid = null;
      var id = null;
      var altname = null;
      var compname = null;
      var datecreated = null;
      if (recId) {
        var lufTrx = search.lookupFields({
          type: TYPE,
          id: recId,
          columns: ["trandate", "internalid", "tranid"]
        });
        // altname = lufTrx.altname;
        id = lufTrx.internalid;
        datecreated = lufTrx.trandate;
        tranId = lufTrx.tranid;
      }
      return {
        status_request: "Berhasil Create",
        internalid: recId,
        tranid : tranId,
        // customer_name: altname,
        create_date: moment().add(14, "hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function updateJournalEntry(context) {
    try {
      var rec = record.load({
        type: TYPE,
        id: context.id,
        isDynamic: false
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
          var fieldType = ''
          if(field){
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
              if (context[fieldname] || typeof context[fieldname] == "boolean" || lineObj[fldnameperline] == 0){
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
                    

                    if(line_lineuniquekey != -1){
                      line_index = line_lineuniquekey
                    } else if(line_line != -1){
                      line_index = line_line
                    } else if(line_child_id != -1){
                      line_index = line_child_id
                    }
                    
                  log.debug(
                    'nama line isexist sublist: ' + fieldname, 
                    'line_lineuniquekey: ' + line_lineuniquekey +
                    'line_line: ' + line_line +
                    'line_child_id: ' + line_child_id +
                    'line_index: ' + line_index 
                  )

                    if(removeLine != -1){

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



                    if(line_lineuniquekey != -1){
                      line_index = line_lineuniquekey
                    } else if(line_line != -1){
                      line_index = line_line
                    } else if(line_child_id != -1){
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
                      } else if ( lineObj[fldnameperline] || typeof lineObj[fldnameperline] == "boolean" || lineObj[fldnameperline] == 0 ) {
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
                      if ( fldnameperline == "action" || fldnameperline == "lineuniquekey") continue;
                      
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
                  throw('Error when taking action for sublist. ' + error)
                }
              }
            }
            if(removeLine.length > 0){
              log.debug('Array remove line ', removeLine)
              for(var j = removeLine.length-1; j >=0; j--){
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
      var recId = rec.save();

      var entityid = null;
      var altname = null;
      var tranid = null;
      var compname = null;
      var datecreated = null;
      if (recId) {
        var lufTrx = search.lookupFields({
          type: TYPE,
          id: recId,
          columns: ["trandate", "internalid", "tranid"]
        });
        // altname = lufTrx.altname;
        id = lufTrx.internalid;
        datecreated = lufTrx.trandate;
        tranId = lufTrx.tranid;
      }
      return {
        status_request: "Berhasil Update",
        internalid: recId,
        tranid: tranId,
        // customer_name: altname,
        create_date: moment().add(14, "hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function inactiveJournalEntry(context) {
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

  function post(context) {
    try {
      if (Array.isArray(context)) {
        return doError(ERROR_CODE.MISSING_REQ_OBJECT, 'Missing a required object. Please use Object {} rather than [{}].');
      }
      log.debug("context", context);
      var type = context.type;
      if (type == "create") {
        var create = createJournalEntry(context)
        return create;
      }
      if (type == "update") {
        var update = updateJournalEntry(context)
        return update;
      }
      if (type == "inactive") {
        var inactive = inactiveJournalEntry(context)
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
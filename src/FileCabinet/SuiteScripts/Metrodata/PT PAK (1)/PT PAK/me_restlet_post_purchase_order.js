/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/format", "N/search", "./config/me_config.js", './library/moment.min.js'], function (record, format, search, meconf, moment) {

  const TYPE = "purchaseorder";
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

  function createPurchaseOrder(context) {
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
                if (fldnameperline == "invdetail") {
                  var arrayFieldSub = lineObj[fldnameperline];
                  for (let x = 0; x < arrayFieldSub.length; x++) {
                    var subRec = arrayFieldSub[x];
                    var inventoryDetail = rec.getCurrentSublistSubrecord({
                      sublistId: 'item',
                      fieldId: 'inventorydetail',
                      line: i,
                    });
                    for (var fieldNameSubRec in subRec) {
                      log.debug("fieldnameSubRec", subRec[fieldNameSubRec]);
                      if (subRec[fieldNameSubRec]) {
                        inventoryDetail.setCurrentSublistValue({
                          sublistId: "inventoryassignment",
                          fieldId: fieldNameSubRec,
                          value: subRec[fieldNameSubRec],
                        });
                      }
                    }
                    inventoryDetail.commitLine("inventoryassignment");
                  }
                } else {
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
      if (recId) {
        var lufTrx = search.lookupFields({
          type: TYPE,
          id: recId,
          columns: ["tranid", "datecreated", "internalid"]
        });
        tranId = lufTrx.tranid;
        // altname = lufTrx.altname;
        id = recId;
        datecreated = lufTrx.datecreated;
      }
      return {
        status_request: "Berhasil Create",
        tranid: tranId,
        internalid: recId,
        // customer_name: altname,
        create_date: moment().add(15, "hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function createPrToPo(context) {
    try {
      var rec = record.transform({
        fromType: 'purchaserequisition',
        fromId: context.createdfrom,
        toType: TYPE,
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
            if (fieldname == 'apply') {
              var line_count = rec.getLineCount(fieldname)
              log.debug('linecount Apply', line_count)
              for (var i = 0; i < line_count; i++) {
                // rec.selectLine({ sublistId: fieldname, line: i })
                rec.setCurrentSublistValue({
                  sublistId: fieldname,
                  fieldId: fieldname,
                  value: false,
                  line: i
                })
                // rec.commitLine(fieldname)
              }
            }

            for (var i = 0; i < lineArr.length; i++) {
              var lineObj = lineArr[i];
              if (fieldname != 'item') {
                if (fieldname == 'apply') {
                  var line_index = rec.findSublistLineWithValue({
                    sublistId: fieldname,
                    fieldId: "internalid",
                    value: lineObj["internalid"],
                  });

                  // rec.selectLine({ sublistId: fieldname, line: line_index })

                  rec.setSublistValue({
                    sublistId: fieldname,
                    fieldId: "isbillable",
                    value: true,
                    line: line_index
                  })
                  rec.setSublistValue({
                    sublistId: fieldname,
                    fieldId: fieldname,
                    value: lineObj[fieldname],
                    line: line_index
                  })

                  // rec.commitLine(fieldname)

                } else {
                  // rec.selectNewLine(fieldname);
                  for (var fldnameperline in lineObj) {
                    // if (fldnameperline == "taxcode") {
                    //     rec.setCurrentSublistValue({
                    //         sublistId: 'item',
                    //         fieldId: 'taxcode',
                    //         value: 5
                    //     });
                    // }
                    if (fldnameperline == "invdetail") {
                      var arrayFieldSub = lineObj[fldnameperline];
                      for (let x = 0; x < arrayFieldSub.length; x++) {
                        var subRec = arrayFieldSub[x];
                        var inventoryDetail = rec.getCurrentSublistSubrecord({
                          sublistId: 'item',
                          fieldId: 'inventorydetail',
                          line: i,
                        });
                        for (var fieldNameSubRec in subRec) {
                          log.debug("fieldnameSubRec", subRec[fieldNameSubRec]);
                          if (subRec[fieldNameSubRec]) {
                            inventoryDetail.setCurrentSublistValue({
                              sublistId: "inventoryassignment",
                              fieldId: fieldNameSubRec,
                              value: subRec[fieldNameSubRec],
                            });
                          }
                        }
                        inventoryDetail.commitLine("inventoryassignment");
                      }
                    } else {

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

                          rec.setSublistValue({
                            sublistId: fieldname,
                            fieldId: fldnameperline,
                            value: dateString,
                            line: i
                          });
                        }
                      } else if (lineObj[fldnameperline] || typeof lineObj[fldnameperline] == "boolean" || lineObj[fldnameperline] == 0) {
                        rec.setSublistValue({
                          sublistId: fieldname,
                          fieldId: fldnameperline,
                          value: lineObj[fldnameperline],
                          line: i,
                        });
                      }
                    }
                  }
                  // rec.commitLine(fieldname);

                }
              }
            }
          }
        }
      }

      var recId = rec.save();

      var poLine = []

      var loadCurrentRec = record.load({
        type: TYPE,
        id: recId,
      });

      var getPoLineCount1 = loadCurrentRec.getLineCount('item');

      var isDupItem = false;
      var isDupLoc = false;

      var count = 0;

      var lineIndexArr = [];

      for (let i = 0; i < context.item.length; i++) {
        poLine.push(context.item[i]);
      }

      log.debug("poLine", poLine)

      for (let i = 0; i < poLine.length; i++) {
        for (let j = 0; j < getPoLineCount1; j++) {

          var getItem = loadCurrentRec.getSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            line: j,
          })
          var getLocation = loadCurrentRec.getSublistValue({
            sublistId: 'item',
            fieldId: 'location',
            line: j,
          })


          if (poLine[i].location == getLocation && poLine[i].item == getItem) {
            if (!lineIndexArr.includes(j)) {
              lineIndexArr.push(j)
            }
            var poLineObj = poLine[i]
            for (const subFldName in poLineObj) {

              loadCurrentRec.setSublistValue({
                sublistId: "item",
                fieldId: subFldName,
                value: poLineObj[subFldName],
                line: j,
              });
            }
          }
        }
      }

      log.debug('index not deleted', lineIndexArr)

      var getLineCountPo = loadCurrentRec.getLineCount('item')

      for (let i = getLineCountPo - 1; i >= 0; i--) {
        if (!lineIndexArr.includes(i)) {
          loadCurrentRec.removeLine({
            sublistId: 'item',
            line: i,
          });

        }

      }



      // var poLinePembanding = poLine;

      // for (let i = 0; i < poLine.length; i++) {
      //   for (let j = 0; j < poLinePembanding.length; j++) {
      //     if (poLine[i].location == poLinePembanding[j].location) {
      //       poLinePembanding[j].location = 0
      //       count++;
      //     }
      //   }
      //   if (count == poLine[i].length) {
      //     count = 0;
      //     isDupLoc = true;
      //     break;
      //   }
      // }
      // for (let i = 0; i < poLine.length; i++) {
      //   for (let j = 0; j < poLinePembanding.length; j++) {
      //     if (poLine[i].item == poLinePembanding[j].item) {
      //       poLinePembanding[j].item = 0
      //       count++;
      //     }
      //     if (count == poLine[i].length) {
      //       count = 0;
      //       isDupItem = true;
      //       break;
      //     }
      //   }
      // }

      // var indexLineArr = []

      // if (isDupItem === true) {
      //   for (let i = 0; i < poLine.length; i++) {
      //     var index_line = loadCurrentRec.findSublistLineWithValue({
      //       sublistId: 'item',
      //       fieldId: 'item',
      //       value: poLine[i].item
      //     });

      //     indexLineArr.push(index_line)

      //     var poLineObj = poLine[i]

      //     for (const subFldName in poLineObj) {

      //       loadCurrentRec.setSublistValue({
      //         sublistId: "item",
      //         fieldId: subFldName,
      //         value: poLineObj[subFldName],
      //         line: index_line,
      //       });

      //     }

      //   }
      // }

      // if (isDupLoc === true) {
      //   for (let i = 0; i < poLine.length; i++) {
      //     var index_line = loadCurrentRec.findSublistLineWithValue({
      //       sublistId: 'item',
      //       fieldId: 'location',
      //       value: poLine[i].location
      //     });
      //     indexLineArr.push(index_line)
      //     var poLineObj = poLine[i]


      //   }
      // }


      // for (let i = 0; i < indexLineArr.length; i++) {

      //   // var getRate = rec.getSublistValue({
      //   //   sublistId: 'item',
      //   //   fieldId: 'rate',
      //   //   line: i
      //   // })
      //   // var getTaxRate = loadCurrentRec.getSublistValue({
      //   //   sublistId: 'item',
      //   //   fieldId: 'taxrate1',
      //   //   line: i
      //   // })
      //   // if (getTaxRate === "" && getTaxRate === '' && getTaxRate !== 0) {
      //   log.debug("getTaxRate", getTaxRate)
      //   loadCurrentRec.removeLine({
      //     sublistId: 'item',
      //     line: indexLineArr[i],
      //   });
      //   // }
      // }

      loadCurrentRec.save()

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
          columns: ["tranid", "datecreated", "internalid"]
        });
        tranId = lufTrx.tranid;
        // altname = lufTrx.altname;
        id = lufTrx.internalid;
        datecreated = lufTrx.datecreated;
      }
      return {
        status_request: "Berhasil Create",
        tranid: tranId,
        internalid: recId,
        // customer_name: altname,
        create_date: moment().add(15, "hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function getInventoryDetail(data) {
    var inventorydetailSearchObj = search.create({
      type: "inventorydetail",
      filters: [["inventorynumber.inventorynumber", "is", data]],
      columns: [
        search.createColumn({
          name: "internalid",
          join: "inventoryNumber",
          summary: "GROUP",
          sort: search.Sort.ASC,
          label: "Internal ID",
        }),
        search.createColumn({
          name: "item",
          summary: "GROUP",
          label: "Item",
        }),
        search.createColumn({
          name: "inventorynumber",
          summary: "GROUP",
          label: " Number",
        }),
        search.createColumn({
          name: "name",
          join: "location",
          summary: "GROUP",
          label: "Name",
        }),
        search.createColumn({
          name: "quantityonhand",
          join: "inventoryNumber",
          summary: "GROUP",
          label: "On Hand",
        }),
      ],
    }).run().getRange(0, 1);
    log.debug("inventorydetailSearchObj", inventorydetailSearchObj);
    if (inventorydetailSearchObj.length > 0) {
      return inventorydetailSearchObj[0].getValue({
        name: "internalid",
        join: "inventoryNumber",
        summary: "GROUP",
        sort: search.Sort.ASC,
        label: "Internal ID",
      });
    } else {
      return false
    }
  }

  function updatePurchaseOrder(context) {
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
            if (fieldname == 'apply') {
              var line_count = rec.getLineCount(fieldname)
              log.debug('linecount Apply', line_count)
              for (var i = 0; i < line_count; i++) {
                rec.selectLine({ sublistId: fieldname, line: i })
                rec.setCurrentSublistValue({
                  sublistId: fieldname,
                  fieldId: fieldname,
                  value: false
                })
                rec.commitLine(fieldname)
              }
            }
            var removeLine = []
            for (var i = 0; i < lineArr.length; i++) {
              var lineObj = lineArr[i];
              if (fieldname == 'apply') {
                var line_index = rec.findSublistLineWithValue({
                  sublistId: fieldname,
                  fieldId: "internalid",
                  value: lineObj["internalid"],
                });


                rec.setSublistValue({
                  sublistId: fieldname,
                  fieldId: fieldname,
                  line: line_index,
                  value: lineObj[fieldname]
                })
                rec.setSublistValue({
                  sublistId: fieldname,
                  fieldId: "amount",
                  line: line_index,
                  value: lineObj["amount"]
                })


              } else {

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

                      log.debug(
                        'nama line isexist',
                        'line_lineuniquekey: ' + line_lineuniquekey +
                        'line_line: ' + line_line +
                        'line_child_id: ' + line_child_id
                      )

                      if (line_lineuniquekey != -1) {
                        line_index = line_lineuniquekey
                      } else if (line_line != -1) {
                        line_index = line_line
                      } else if (line_child_id != -1) {
                        line_index = line_child_id
                      }

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

                      log.debug(
                        'nama line isexist',
                        'line_lineuniquekey: ' + line_lineuniquekey +
                        'line_line: ' + line_line +
                        'line_child_id: ' + line_child_id
                      )

                      if (line_lineuniquekey != -1) {
                        line_index = line_lineuniquekey
                      } else if (line_line != -1) {
                        line_index = line_line
                      } else if (line_child_id != -1) {
                        line_index = line_child_id
                      }
                      log.debug('line_index', line_index)
                      for (var fldnameperline in lineObj) {
                        if (fldnameperline == "action" || fldnameperline == "lineuniquekey") continue;


                        if (fldnameperline == "invdetail") {
                          var arrayFieldSub = lineObj[fldnameperline];
                          var inventoryDetail = rec.getSublistSubrecord({
                            sublistId: "item",
                            fieldId: "inventorydetail",
                            line: line_index
                          });

                          var invDetailLineCount = inventoryDetail.getLineCount("inventoryassignment");
                          log.debug("invDetailLineCount", invDetailLineCount);
                          var new_inv_detail = lineObj[fldnameperline];

                          for (var y = invDetailLineCount - 1; y >= 0; y--) {
                            inventoryDetail.removeLine({
                              sublistId: "inventoryassignment",
                              line: y,
                            });
                          }

                          log.debug("inventoryDetail", inventoryDetail);
                          for (let x = 0; x < arrayFieldSub.length; x++) {
                            var subRec = arrayFieldSub[x];
                            log.debug("arrayFieldSub[x]", arrayFieldSub[x]);
                            var inv_detail_num_new = arrayFieldSub[x].receiptinventorynumber;
                            var id_inventory_number = getInventoryDetail(inv_detail_num_new);
                            log.debug("inv_detail_num_new", id_inventory_number);


                            for (var fieldNameSubRec in subRec) {
                              if (subRec[fieldNameSubRec]) {
                                if (fieldNameSubRec == "receiptinventorynumber") {
                                  inventoryDetail.setSublistValue({
                                    sublistId: "inventoryassignment",
                                    fieldId: fieldNameSubRec,
                                    value: inv_detail_num_new,
                                    line: x
                                  });
                                } else {
                                  inventoryDetail.setSublistValue({
                                    sublistId: "inventoryassignment",
                                    fieldId: fieldNameSubRec,
                                    value: subRec[fieldNameSubRec],
                                    line: x
                                  });
                                }

                                var new_value = inventoryDetail.getSublistValue({
                                  sublistId: "inventoryassignment",
                                  fieldId: fieldNameSubRec,
                                  line: x
                                });
                                log.debug(" new Value " + fieldNameSubRec, new_value);
                              }
                            }
                          }

                          var inventoryDetailNew = rec.getSublistSubrecord({
                            sublistId: "item",
                            fieldId: "inventorydetail",
                            line: line_index,
                          });
                          log.debug("inventoryDetail New", inventoryDetailNew);

                        } else {
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

                    } else if (lineObj["action"] == "add") {

                      var line_index = rec.getLineCount(fieldname)
                      for (var fldnameperline in lineObj) {
                        if (fldnameperline == "action" || fldnameperline == "lineuniquekey") continue;


                        if (fldnameperline == "invdetail") {
                          var arrayFieldSub = lineObj[fldnameperline];
                          var inventoryDetail = rec.getSublistSubrecord({
                            sublistId: "item",
                            fieldId: "inventorydetail",
                            line: line_index
                          });

                          var invDetailLineCount = inventoryDetail.getLineCount("inventoryassignment");
                          log.debug("invDetailLineCount", invDetailLineCount);
                          var new_inv_detail = lineObj[fldnameperline];

                          for (var y = invDetailLineCount - 1; y >= 0; y--) {
                            inventoryDetail.removeLine({
                              sublistId: "inventoryassignment",
                              line: y,
                            });
                          }
                          log.debug("inventoryDetail", inventoryDetail);

                          for (let x = 0; x < arrayFieldSub.length; x++) {
                            var subRec = arrayFieldSub[x];
                            log.debug("arrayFieldSub[x]", arrayFieldSub[x]);
                            var inv_detail_num_new = arrayFieldSub[x].receiptinventorynumber;
                            var id_inventory_number = getInventoryDetail(inv_detail_num_new);
                            log.debug("inv_detail_num_new", id_inventory_number);


                            for (var fieldNameSubRec in subRec) {
                              if (subRec[fieldNameSubRec]) {
                                if (fieldNameSubRec == "receiptinventorynumber") {
                                  inventoryDetail.setSublistValue({
                                    sublistId: "inventoryassignment",
                                    fieldId: fieldNameSubRec,
                                    value: inv_detail_num_new,
                                    line: x
                                  });
                                } else {
                                  inventoryDetail.setSublistValue({
                                    sublistId: "inventoryassignment",
                                    fieldId: fieldNameSubRec,
                                    value: subRec[fieldNameSubRec],
                                    line: x
                                  });
                                }

                                var new_value = inventoryDetail.getSublistValue({
                                  sublistId: "inventoryassignment",
                                  fieldId: fieldNameSubRec,
                                  line: x
                                });
                                log.debug(" new Value " + fieldNameSubRec, new_value);
                              }
                            }

                          }

                          var inventoryDetailNew = rec.getSublistSubrecord({
                            sublistId: "item",
                            fieldId: "inventorydetail",
                            line: line_index,
                          });
                          log.debug("inventoryDetail New", inventoryDetailNew);

                        } else {
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
                    }
                  } catch (error) {
                    log.debug('Error action sublist. case ' + lineObj["action"], lineObj)
                    throw ('Error when taking action for sublist. ' + error)
                  }
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
          columns: ["tranid", "datecreated", "internalid"]
        });
        tranId = lufTrx.tranid;
        // altname = lufTrx.altname;
        id = lufTrx.internalid;
        datecreated = lufTrx.datecreated;
      }
      return {
        status_request: "Berhasil Update",
        tranid: tranId,
        internalid: recId,
        // customer_name: altname,
        create_date: moment().add(15, "hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function inactivePurchaseOrder(context) {
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
      var createdFrom = -1;

      if (context.createdfrom) {
        createdFrom = 1;
      }

      if (type == "create" && createdFrom === -1) {
        var create = createPurchaseOrder(context);
        return create;
      }
      if (type == "create" && createdFrom === 1) {
        var create = createPrToPo(context);
        return create;
      }
      if (type == "update") {
        var update = updatePurchaseOrder(context);
        return update;
      }
      if (type == "inactive") {
        var inactive = inactivePurchaseOrder(context);
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
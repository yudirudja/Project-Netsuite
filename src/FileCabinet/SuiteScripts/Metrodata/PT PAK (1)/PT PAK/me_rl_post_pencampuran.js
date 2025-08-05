/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/format", "N/search", "./config/me_config.js", './library/moment.min.js'], function (record, format, search, meconf, moment) {

  const TYPE = "customrecord_me_compound_trx_produksi";
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

  function createPeleburan(context) {
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
          if (!isSublist || !isObject) { //field biasa karena bukan sublist maupun object
            // if (FIELD_DATE.indexOf(fieldname) > -1) {
            // if (context[fieldname]) {
            //   var dateString = format.parse({
            //     value: context[fieldname],
            //     type: format.Type.DATE
            //   });
            //   rec.setValue(fieldname, dateString);
            // }
            if (fieldname == "custrecord_me_pencampuran_finish_date") {
              var formatedDateTime = format.parse({
                value: new Date(moment(context[fieldname]).subtract(7, "hours").format("M/D/YYYY HH:mm:ss")),
                type: format.Type.DATETIME,
              });
              rec.setValue(fieldname, formatedDateTime);
            } else if (fieldname != "custrecord_me_pencampuran_finish_date") {
              if (context[fieldname] || typeof context[fieldname] == "boolean") { rec.setValue(fieldname, context[fieldname]) };
            }
          }
          else if (isSublist && isObject) { //field sublist dan ada object
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

      var recId = rec.save();
      var entityid = null;
      var id = null;
      var altname = null;
      var compname = null;
      var datecreated = null;
      if (recId) {

        var lufTrx = search.lookupFields({
          type: TYPE,
          id: recId,
          columns: ["name", "internalid"]
        });
        entityid = lufTrx.entityid;
        // altname = lufTrx.altname;
        id = lufTrx.internalid;
        // datecreated = lufTrx.datecreated;
      }
      return {
        status_request: "Berhasil Create",
        entityid: entityid,
        id: id,
        // customer_name: altname,
        create_date: moment().add(14, "hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }

  }

  function updatePeleburan(context) {
    try {

      var rec = record.load({
        type: TYPE,
        id: context.id,
        isDynamic: true
      });

      var recId = 0;

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
            } else if (fieldname == "custrecord_me_pencampuran_finish_date") {
              var formatedDateTime = format.parse({
                value: new Date(moment(context[fieldname]).subtract(7, "hours").format("M/D/YYYY HH:mm:ss")),
                type: format.Type.DATETIME,
              });
              rec.setValue(fieldname, formatedDateTime);
            } else {
              if (context[fieldname] || typeof context[fieldname] == "boolean") {
                if (fieldname == "id") {
                  recId = context[fieldname];
                }
                rec.setValue(fieldname, context[fieldname]);
              }
            }
          }
          else if (isSublist && isObject) { //field sublist dan ada object
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
        // var subListId = 0
        if (fieldname == "recmachcustrecord_me_pencampuran_compound_num_edit") {
          var subArr = context[fieldname];

          for (let x = 0; x < subArr.length; x++) {
            var subId = "";
            var compoundNumber = "";
            var bahanMetal = "";
            var beratMetal = "";
            var returMetal = "";
            var invenAdjTrans = "";

            subObj = subArr[x];
            for (const fieldNameLine in subObj) {
              if (fieldNameLine == "customrecord_me_compound_trx_produksi_ch_id") {
                subId = subObj[fieldNameLine];
                // subListId = subObj[fieldNameLine];
              }
              // if (fieldNameLine == "custrecord_me_pencampuran_compound_num") {
              //   compoundNumber = subObj[fieldNameLine];
              // }
              if (fieldNameLine == "custrecord_me_pencampuran_metal") {
                bahanMetal = subObj[fieldNameLine];
              }
              if (fieldNameLine == "custrecord_me_pencampuran_brt_metal") {
                beratMetal = subObj[fieldNameLine];
              }
              if (fieldNameLine == "custrecord_me_pencampuran_retur_metal") {
                returMetal = subObj[fieldNameLine];
              }
              if (fieldNameLine == "custrecord_me_inventory_adjustmnt_trx") {
                invenAdjTrans = subObj[fieldNameLine];
              }
              record.submitFields({
                type: 'customrecord_me_compound_trx_produksi_ch',
                id: subId,
                values: {
                  // custrecord_me_pencampuran_compound_num: compoundNumber,
                  custrecord_me_pencampuran_metal: bahanMetal,
                  custrecord_me_pencampuran_brt_metal: beratMetal,
                  custrecord_me_pencampuran_retur_metal: returMetal,
                  custrecord_me_inventory_adjustmnt_trx: invenAdjTrans,
                },
                options: {
                  enableSourcing: false,
                  ignoreMandatoryFields: true,
                }
              });
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
      var compname = null;
      var datecreated = null;
      if (recId) {

        var lufTrx = search.lookupFields({
          type: TYPE,
          id: recId,
          columns: ["name"]
        });
        entityid = lufTrx.name;
        // altname = lufTrx.altname;
        // datecreated = lufTrx.datecreated;
      }
      return {
        status_request: "Berhasil Update",
        entityid: entityid,
        // customer_name: altname,
        create_date: moment().add(14, "hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function inactivePeleburan(context) {
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
        var create = createPeleburan(context)
        return create
      }
      if (type == 'update') {
        var update = updatePeleburan(context)
        return update
      }
      if (type == 'inactive') {
        var inactive = inactivePeleburan(context)
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
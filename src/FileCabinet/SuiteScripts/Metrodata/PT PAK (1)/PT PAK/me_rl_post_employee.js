/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/format", "N/search", "./config/me_config.js", './library/moment.min.js'], function (record, format, search, meconf, moment) {

    const TYPE = "employee";
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
  
    function createCustomer(context){
        try {
          var rec = record.create({
            type: TYPE,
            isDynamic: true
          });
          log.debug('fields', rec.getFields())
    
          var sublistName = rec.getSublists();
    
          for (var fieldname in context) {
            if (context.hasOwnProperty(fieldname)) {
              var isSublist = sublistName.indexOf(fieldname) > -1;
              var isObject = typeof context[fieldname] == "object";
              var field = rec.getField({
                fieldId: fieldname
              });
              log.debug('field 59', field)
              var fieldType = ''
              if(field){
                fieldType = field.type
              }
              
              log.debug('fieldType', fieldType)
              if (!isSublist || !isObject) { //field biasa karena bukan sublist maupun object
                // if (FIELD_DATE.indexOf(fieldname) > -1) {
                //   if (context[fieldname]) {
                //     var dateString = format.parse({
                //       value: context[fieldname],
                //       type: format.Type.DATE
                //     });
                //     rec.setValue(fieldname, dateString);
                //   }
                // }
                if (fieldType.toLowerCase().indexOf('date') != -1) {
                  if (context[fieldname]) {
                    var dateString = format.parse({
                      value: context[fieldname],
                      type: format.Type.DATE
                    });
                    rec.setValue(fieldname, dateString);
                  }
                }
                else {
                  if (context[fieldname] || typeof context[fieldname] == "boolean") rec.setValue(fieldname, context[fieldname]);
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
    
          // Insert Address Sublist
          var address = context.address;
          for (var i in address) {
            var addressData = address[i];
            var currentAddressCount = rec.getLineCount({
              sublistId: 'addressbook'
            });
            if (currentAddressCount >= Number(addressData.addrline)) {
              rec.selectLine({
                sublistId: 'addressbook',
                line: Number(addressData.addrline) - 1
              });
              var addressSubrecord = rec.getCurrentSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress'
              });
            } else {
              rec.selectNewLine('addressbook');
              var addressSubrecord = rec.getCurrentSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress'
              });
            }
            for (var fldName in addressData) {
              if (addressData.hasOwnProperty(fldName)) {
                for (var x = 0; x < CUSTOMER_ADDRESS_FLD.length; x++) {
                  if (fldName == CUSTOMER_ADDRESS_FLD[x].key_name) {
                    addressSubrecord.setValue({
                      fieldId: CUSTOMER_ADDRESS_FLD[x].fld_id,
                      value: addressData[fldName]
                    });
                    break;
                  }
                }
              }
            }
            rec.commitLine('addressbook');
          }
    
          var recId = rec.save();
          var entityid = null;
          var altname = null;
          var compname = null;
          var datecreated = null;
          if (recId) {
  
            var lufTrx = search.lookupFields({
              type: TYPE,
              id: recId,
              columns: ["entityid", "datecreated", "internalid"]
            });
            entityid = lufTrx.entityid;
            internalid = lufTrx.internalid;
            datecreated = lufTrx.datecreated;
          }
          return {
            status_request: "Berhasil Create",
            entityid: entityid,
            internalid : internalid[0].value,
            create_date: moment().add(14, "hours").format("DD/MM/YYYY, h:mm:ss a"),
          };
        } catch (ex) {
          return doError(ex.name, ex.message, ex.stack);
        }
          
    }
  
    function updateCustomer(context){
      try {
        
        var rec = record.load({
          type: TYPE,
          id: context.id,
          isDynamic: true
        });
        log.debug('fields', rec.getFields())
  
        var sublistName = rec.getSublists();
  
        for (var fieldname in context) {
  
  
          if (context.hasOwnProperty(fieldname)) {
            var isSublist = sublistName.indexOf(fieldname) > -1;
            var isObject = typeof context[fieldname] == "object";
            var field = rec.getField(fieldname)
            var field = rec.getField({
                fieldId: fieldname
              });
              log.debug('field 59', field)
              var fieldType = ''
              if(field){
                fieldType = field.type
              }
            if (!isSublist || !isObject) { //field biasa karena bukan sublist maupun object
              // if (FIELD_DATE.indexOf(fieldname) > -1) {
              //   if (context[fieldname]) {
              //     var dateString = format.parse({
              //       value: context[fieldname],
              //       type: format.Type.DATE
              //     });
              //     rec.setValue(fieldname, dateString);
              //   }
              // }
              if (fieldType.toLowerCase().indexOf('date') != -1) {
                if (context[fieldname]) {
                  var dateString = format.parse({
                    value: context[fieldname],
                    type: format.Type.DATE
                  });
                  rec.setValue(fieldname, dateString);
                }
              }
              else {
                if (context[fieldname] || typeof context[fieldname] == "boolean") rec.setValue(fieldname, context[fieldname]);
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
  
        // Insert Address Sublist
        var address = context.address;
        for (var i in address) {
          var addressData = address[i];
          var currentAddressCount = rec.getLineCount({
            sublistId: 'addressbook'
          });
          if (currentAddressCount >= Number(addressData.addrline)) {
            rec.selectLine({
              sublistId: 'addressbook',
              line: Number(addressData.addrline) - 1
            });
            var addressSubrecord = rec.getCurrentSublistSubrecord({
              sublistId: 'addressbook',
              fieldId: 'addressbookaddress'
            });
          } else {
            rec.selectNewLine('addressbook');
            var addressSubrecord = rec.getCurrentSublistSubrecord({
              sublistId: 'addressbook',
              fieldId: 'addressbookaddress'
            });
          }
          for (var fldName in addressData) {
            if (addressData.hasOwnProperty(fldName)) {
              for (var x = 0; x < CUSTOMER_ADDRESS_FLD.length; x++) {
                if (fldName == CUSTOMER_ADDRESS_FLD[x].key_name) {
                  addressSubrecord.setValue({
                    fieldId: CUSTOMER_ADDRESS_FLD[x].fld_id,
                    value: addressData[fldName]
                  });
                  break;
                }
              }
            }
          }
          rec.commitLine('addressbook');
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
            columns: ["entityid", "datecreated","internalid"]
          });
          entityid = lufTrx.entityid;
          internalid = lufTrx.internalid;
          datecreated = lufTrx.datecreated;
        }
        return {
          status_request: "Berhasil Update",
          entityid: entityid,
          internalid : internalid[0].value,
          create_date: moment().add(14, "hours").format("DD/MM/YYYY, h:mm:ss a"),
        };
      } catch (ex) {
        return doError(ex.name, ex.message, ex.stack);
      }
    }
  
    function inactiveCustomer(context){
      try {
        var rec_cust = record.submitFields({
          type: TYPE,
          id : context.id,
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
        if(type == 'create'){
          var create = createCustomer(context)
          return create
        }
        if(type == 'update'){
          var update = updateCustomer(context)
          return update
        }
        if(type == 'inactive'){
          var inactive = inactiveCustomer(context)
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
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

define(["N/record", "N/format", "N/search", "./config/me_config.js", './library/moment.min.js'], function (record, format, search, meconf, moment) {

  const TYPE = "workorder";
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

  function createWorkOrder(context) {
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
      var tranId = null;
      var id = null;
      var altname = null;
      var compname = null;
      var datecreated = null;
      if (recId) {

        var lufTrx = search.lookupFields({
          type: TYPE,
          id: recId,
          columns: ["datecreated","tranid", "internalid"]
        });
        tranId = lufTrx.tranid;
        // altname = lufTrx.altname;
        id = lufTrx.internalid;
        datecreated = lufTrx.datecreated;
      }
      return {
        status_request: "Berhasil Create",
        tranid: tranId,
        id: id[0].value,
        // customer_name: altname,
        create_date: moment().add(14,"hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }

  }

  function updateWorkOrder(context) {
    try {

      var rec = record.load({
        type: TYPE,
        id: context.id,
        isDynamic: true
      });

      var sublistName = rec.getSublists();

      for (var fieldname in context) {


        if (context.hasOwnProperty(fieldname)) {
          var isSublist = sublistName.indexOf(fieldname) > -1;
          var isObject = typeof context[fieldname] == "object";
          if ((!isSublist || !isObject)) { //field biasa karena bukan sublist maupun object
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
        if (fieldname == "recmachcustrecord_me_wo_number_edit") {

          var subArr = context[fieldname];
          
          
          for (let x = 0; x < subArr.length; x++) {
            var subId = 0;
            var process="";
            var beratAwalBefore="";
            var beratAwalAfter = "";
            var beratAkhir = "";
            var susut = "";
            var susutPrsn = "";
            var beratKembali = "";
            var admin = "";
            var tukangPengrajin = "";
            var ongkosTukang = "";
            var tanggalMulai = "";
            var tanggalAkhir = "";
            var linkProcess = "";
            var trxPenggunaanBahan = "";
            var trxPenguranganBahan = "";
            var trxReturBahan = "";
            var trxPenambahanBahan = "";
            var mutasiGem = "";
            var itemFulfiilment = "";
            var itemReceipt = "";
            subObj = subArr[x];
            for (var fieldNameLine in subObj) {
              if (fieldNameLine == 'customrecord_me_routing_process_wo_spk_id') {
                subId = subObj[fieldNameLine];
              }

              if (fieldNameLine == 'custrecord_me_routing_process') {
                process = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_berat_awal_before') {
                beratAwalBefore = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_berat_awal_after') {
                beratAwalAfter = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_berat_akhir') {
                beratAkhir = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_berat_susut') {
                susut = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_berat_kmbli') {
                beratKembali = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_admin_spk') {
                admin = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_pengrajin_spk') {
                tukangPengrajin = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_ongkos_tukang') {
                ongkosTukang = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_tanggal_mulai') {
                tanggalMulai = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_tanggal_akhir') {
                tanggalAkhir = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_link_process') {
                linkProcess = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_penggunaan_bahan') {
                trxPenggunaanBahan = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_retur_bahan_pengembalian') {
                trxReturBahan = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_penambahan_bahan_trx') {
                trxPenambahanBahan = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_mutasi_gem') {
                mutasiGem = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_item_fulfillment_setting') {
                itemFulfiilment = subObj[fieldNameLine]
              }

              if (fieldNameLine == 'custrecord_me_item_receipt_setting') {
                itemReceipt = subObj[fieldNameLine]
              }
              record.submitFields({
                type: 'customrecord_me_routing_process_wo_spk',
                id: subId,
                values: {
                  custrecord_me_routing_process: process,
                  custrecord_me_berat_awal_before:beratAwalBefore,
                  custrecord_me_berat_awal_after:beratAwalAfter,
                  custrecord_me_berat_akhir:beratAkhir,
                  custrecord_me_berat_susut:susut,
                  custrecord_me_berat_kmbli:beratKembali,
                  custrecord_me_admin_spk:admin,
                  custrecord_me_pengrajin_spk:tukangPengrajin,
                  custrecord_me_ongkos_tukang:ongkosTukang,
                  custrecord_me_tanggal_mulai:tanggalMulai,
                  custrecord_me_tanggal_akhir:tanggalAkhir,
                  custrecord_me_link_process:linkProcess,
                  custrecord_me_penggunaan_bahan:trxPenggunaanBahan,
                  custrecord_me_retur_bahan_pengembalian:trxReturBahan,
                  custrecord_me_penambahan_bahan_trx:trxPenambahanBahan,
                  custrecord_me_mutasi_gem:mutasiGem,
                  custrecord_me_item_fulfillment_setting:itemFulfiilment,
                  custrecord_me_item_receipt_setting:itemReceipt,
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields : true
                }
              })
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
          columns: ["datecreated","tranid", "internalid"]
        });
        tranId = lufTrx.tranid;
        // altname = lufTrx.altname;
        id = lufTrx.internalid;
        datecreated = lufTrx.datecreated;
      }
      return {
        status_request: "Berhasil Update",
        tranid: tranId,
        id: id[0].value,
        // customer_name: altname,
        create_date: moment().add(14,"hours").format("DD/MM/YYYY, h:mm:ss a"),
      };
    } catch (ex) {
      return doError(ex.name, ex.message, ex.stack);
    }
  }

  function inactiveWorkOrder(context) {
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
        var create = createWorkOrder(context)
        return create
      }
      if (type == 'update') {
        var update = updateWorkOrder(context)
        return update
      }
      if (type == 'inactive') {
        var inactive = inactiveWorkOrder(context)
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
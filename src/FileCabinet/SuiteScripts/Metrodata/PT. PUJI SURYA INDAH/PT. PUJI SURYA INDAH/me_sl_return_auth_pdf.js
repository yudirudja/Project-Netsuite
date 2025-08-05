/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/search', 'N/render', 'N/file', 'N/record', 'N/encode', 'N/format', 'N/task', 'N/redirect', 'N/ui/serverWidget'], function (search, render, file, record, encode, format, task, redirect, serverWidget) {


   function searchCreditMemo(params) {

   }


   function onRequest(context) {
      var returnAuthSearch = search.create({
         type: "transaction",
         filters:
            [
               ["type", "anyof", "RtnAuth"],
               "AND",
               ["trandate", "within", "1/5/2023", "13/6/2023"],
               "AND",
               ["customer.entityid", "isnotempty", ""]
            ],
         columns:
            [
               //0
               search.createColumn({ name: "tranid", label: "Document Number" }),
               //1
               search.createColumn({ name: "trandate", label: "Date" }),
               //2
               search.createColumn({
                  name: "parent",
                  join: "customer",
                  label: "Top Level Parent"
               }),
               //3
               search.createColumn({
                  name: "formulatext",
                  formula: "case when lower({location}) like '%baik%' then 'B' when lower({location}) like '%rusak%' then 'K' end",
                  label: "BK"
               }),
               //4
               search.createColumn({ name: "location", label: "Location" }),
               //5
               search.createColumn({ name: "creditamount", label: "Amount (Credit)" }),
               //6
               search.createColumn({
                  name: "custitem_me_amt",
                  join: "item",
                  label: "ME - Amount"
               }),
               //7
               search.createColumn({
                  name: "formulatext",
                  formula: "REGEXP_SUBSTR({customer.parent}, '[^-]+', 1, 1)",
                  label: "Group"
               }),
               //8
               search.createColumn({ name: "salesrep", label: "Sales Rep" }),
               //9
               search.createColumn({ name: "custbody_me_no_doc_return_customer", label: "ME - No. Document Return Customer" }),
               //10
               search.createColumn({ name: "custbody_me_jrnl_entry_list_tagihan", label: "ME - JE List Tagihan" }),
               //11
               search.createColumn({ name: "item", label: "Item" }),
               //12
               search.createColumn({ name: "custcol_me_fulfillcarton", label: "ME - Qty Carton Fulfill" }),
               //13
               search.createColumn({ name: "custcol_me_fulfillpcs", label: "ME - Qty Pcs Fulfill" }),
               //14
               search.createColumn({ name: "custcol_me_bonusa_fulfillcarton", label: "ME - Bonus Carton" }),
               //15
               search.createColumn({ name: "custcol_me_bonusa_fulfillpcs", label: "ME - Bonus Pcs" }),
               //16
               search.createColumn({ name: "custcol_me_rate_carton", label: "ME - Rate Before Disc. (CTN)" }),
               //17
               search.createColumn({ name: "custcol_me_rate_before_disc_pcs", label: "ME - Rate Before Disc. (PCS)" }),
               //18
               search.createColumn({ name: "netamount", label: "Amount (Net)" }),
               //19
               search.createColumn({ name: "custcol_me_expired_date", label: "ME - Expired Date" }),
               //20
               search.createColumn({ name: "custcol_me_lf_keterangan_alasan_retur", label: "ME - Keterangan Alasan Retur" }),
               //21
               search.createColumn({ name: "custbody_me_status_upld_ret_cust", label: "ME - Status Return Customer" }),
               //22
               search.createColumn({
                  name: "formulatext",
                  formula: "REGEXP_SUBSTR({custbody_me_list_return_auth},  '[^-]*-(.*)', 1, 1, NULL, 1)",
                  label: "Formula (Text)"
               }),
               //23
               search.createColumn({ name: "custbody_me_fp_tglfaktur", label: "ME - Tanggal Faktur" }),
               //24
               search.createColumn({ name: "custbody_me_fp_kodetransaksi", label: "ME - Kode Transaksi Faktur Pajak" }),
               //25
               search.createColumn({ name: "custcol_me_fprj_ra", label: "ME - Return Authorization" }),
               //26
               search.createColumn({ name: "internalid", label: "Internal ID" }),
            ]
      }).run().getRange({
         start: 0,
         end: 1000,
      });

      var dataSet = [];
      var dataSet2 = [];
      var dataSet3 = [];
      var dataSetObjList = {};
      var dataSet2ObjList = {};
      var dataSet3ObjList = {};
      var dataSetObj = {};
      var itemLineObj = {};
      var subItemLineObj = {};
      var countDuplicate = 0;
      var countDuplicateItemLine = 0;
      var merge = {}

      for (var i = 0; i < returnAuthSearch.length; i++) {
         var internalId = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[26]);
         var docNum = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[0]);
         var date = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[1]);
         var customerName = returnAuthSearch[i].getText(returnAuthSearch[i].columns[2]);
         var baikRusak = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[3]);
         var itemAmount = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[5]);
         var group = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[7]);
         var salesRep = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[8]);
         var docNumReturnCustomer = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[9]);
         var item = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[11]);
         var itemText = returnAuthSearch[i].getText(returnAuthSearch[i].columns[11]);
         var qtyCartonFulfill = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[12]);
         var qtyPcsFulfill = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[13]);
         var bonusCtn = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[14]);
         var bonusPcs = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[15]);
         var rateBeforeDics = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[16]);
         var expireDate = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[19]);
         var alasanRetur = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[20]);

         log.debug("docnum", docNum);

         // if (!dataSetObj.docNum) {
         // dataSetObj = {
         //    docNum: docNum,
         //    date: date,
         //    customer_name: customerName,
         //    item_line: [],
         // };
         // if (dataSet.length == 0) {
         //    // dataSetObj = {
         //    //    docNum: docNum,
         //    //    date: date,
         //    //    customer_name: customerName,
         //    //    item_line: [],
         //    // };
         //    // dataSet.push(dataSetObj);

         // } else {
         for (var p = 0; p < dataSet.length; p++) {
            if (dataSet[p].docNum == docNum) {
               countDuplicate++;
            }
         }
         for (var x = 0; x < dataSet2.length; x++) {
            if (dataSet2[x].docNum == docNum) {
               countDuplicateItemLine++;
            }
         }

         // }
         // }
         if (countDuplicate == 0) {
            dataSetObj[internalId] = {
               docNum: docNum,
               date: date,
               customer_name: customerName,
               item_line: [],
            };
            dataSet.push(dataSetObj);
           dataSetObjList[internalId] = Object.assign({}, dataSetObj[internalId])
           
         }
         countDuplicate = 0
         
         if (countDuplicateItemLine == 0) {
            itemLineObj[internalId] = {
               docNum: docNum,
               docNumReturnCustomer: docNumReturnCustomer,
               // item: itemText,
               baik_rusak: baikRusak,
               group: group,
               sales_rep: salesRep,
               sub_item_line: [],
            }
            dataSet2.push(itemLineObj);
            dataSet2ObjList[internalId] = Object.assign({}, itemLineObj[internalId]);
         }
         countDuplicateItemLine = 0;
         
         // if(!subItemLineObj[item]){
         subItemLineObj[internalId] = {
            docNum: docNum,
            item: itemText,
            docNumReturnCustomer: docNumReturnCustomer,
            qtyCartonFulfill: qtyCartonFulfill,
            qtyPcsFulfill: qtyPcsFulfill,
            bonusCtn: bonusCtn == "" ? 0 : bonusCtn,
            bonusPcs: bonusPcs == "" ? 0 : bonusPcs,
            rateBeforeDics: rateBeforeDics,
            expireDate: expireDate,
            alasanRetur: alasanRetur,
         }
         dataSet3.push(subItemLineObj);
         dataSet3ObjList[item + "_" + internalId] = Object.assign({}, subItemLineObj[internalId]);
         // itemLineObj[docNumReturnCustomer].sub_item_line.push(subItemLineObj[item]);
         // }

         // if (condition) {

         // }

      }
      log.debug("dataset", dataSet);
      log.debug("dataSet3ObjList", dataSet3ObjList);

      for (const key in dataSet2ObjList) {
         for (const key1 in dataSet3ObjList) {
            if (dataSet2ObjList[key].docNum == dataSet3ObjList[key1].docNum) {
               dataSet2ObjList[key].sub_item_line.push(dataSet3ObjList[key1]);
            }
         }

      }

      for (const key in dataSetObjList) {
         for (const key1 in dataSet2ObjList) {
            if (dataSetObjList[key].docNum == dataSet2ObjList[key1].docNum) {
               dataSetObjList[key].item_line.push(dataSet2ObjList[key1]);
            }
         }
      }

      // for (var o = 0; o < dataSet2.length; o++) {
      //    for (var p = 0; p < dataSet3.length; p++) {
      //       if (dataSet2[o].docNum == dataSet3[p].docNum) {
      //          dataSet2[o].sub_item_line.push(dataSet3[p]);
      //       } else {
      //          continue;
      //       }
      //    }
      // }
      // for (var o = 0; o < dataSet.length; o++) {
      //    for (var p = 0; p < dataSet2.length; p++) {
      //       if (dataSet[o].docNum == dataSet2[p].docNum) {
      //          dataSet[o].item_line.push(dataSet2[p]);
      //       } else {
      //          continue;
      //       }
      //    }
      // }

      // var data1 = [];
      // var data2 = [];

      // for (var t = 0; t < dataSet.length; t++) {
      //    data1.push(dataSet[t])
      // }
      // for (var c = 0; c < dataSet2.length; c++) {
      //    data2.push(dataSet2[c])
      // }

      // log.debug("data1", data1);
      // log.debug("data2", data2);

      // var listIterated = [];
      // var boolIterated = false;

      // for (var p = 0; p < dataSet.length; p++) {
      //    listIterated.push(dataSet[p].docNum);
      //    for (var a = 0; a < listIterated.length; a++) {
      //       if (dataSet[p].docNum == listIterated) {
      //          continue;
      //       } else {
      //          for (var k = 0; k < dataSet2.length; k++) {
      //             if (dataSet[p].docNum == dataSet2[k].docNum) {
      //                dataSet[p].item_line.push(dataSet2[k]);
      //             }
      //          }
      //       }
      //    }
      // }


      // var m = 0;
      // var o = m + 1;


      // while (m < dataSet.length && o < dataSet2.length) {
      //    if (dataSet[m].docNum == dataSet2[o].docNum) {
      //       dataSet[m].item_line.push(dataSet2[o]);
      //       listIterated.push(dataSet[m].docNum);
      //       if (o < dataSet2.length) {
      //          o++;
      //       } else {
      //          for (var l = 0; l < listIterated.length; l++) {
      //             if (listIterated[l] == dataSet[m].docNum) {
      //                m++;
      //             }
      //          }
      //       }
      //    }
      // }



      // for (var p = 0; p < dataSet.length; p++) {
      //    for (var k = 0; k < dataSet3.length; k++) {
      //       if (dataSet.docNum == dataSet2.docNum) {
      //          dataSet[p].item_line.push(dataSet2[k]);
      //       }

      //    }
      // }

      log.debug("dataset", dataSet);
      log.debug("dataset Obj List", dataSetObjList);
      // log.debug("dataset2", dataSet2);
      // log.debug("dataset3", dataSet3);

      var templateFile = file.load({ id: 752457 });

      var renderer = render.create();

      renderer.templateContent = templateFile.getContents();

      // ==================== Start Olah Data ===================== //
      // Yang dibutuhkan untuk Printout

      renderer.addCustomDataSource({
         alias: "Record",
         format: render.DataSource.OBJECT,
         data: dataSetObjList,
      });


      // ==================== Akhir Olah Data ===================== //

      //================ Start PrintOut ======================//


      var xml = renderer.renderAsString();

      log.debug("xml", xml)
      log.debug("renderer exist", renderer);

      var pdf = render.xmlToPdf({
         xmlString: xml
      });

      // var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

      pdf.name = "Report Transfer Order from.pdf";
      context.response.writeFile(pdf, false);



   }

   return {
      onRequest: onRequest
   }
});

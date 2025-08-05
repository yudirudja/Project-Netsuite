/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {


  function beforeSubmit(context) {
    var newRec = context.newRecord;

    var recId = newRec.id;

    var setStatus = newRec.setValue("orderstatus", "B")

    var getItemLine = newRec.getLineCount('item');





  }
  function afterSubmit(context) {
    var newRec = context.newRecord;
    var recId = newRec.id;



    // var sublistLength = loadSo.getLineCount('item');

    // for (let i = 0; i < sublistLength; i++) {
    //     var isClosed =  loadSo.getValue('isClosed')
    //     if (isClosed == false) {
    //         var 
    //     }

    // }

    if (context.type == 'edit') {

      var loadSo = record.load({
        type: record.Type.SALES_ORDER,
        id: recId,
      });

      var getItemLine = newRec.getLineCount('item');
      var itemArr = []

      for (let i = 0; i < getItemLine; i++) {

        var getItem = loadSo.getSublistValue({
          sublistId: 'item',
          fieldId: 'item',
          line: i,
        });
        var getLmeFinal = loadSo.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_me_lme_final',
          line: i,
        });
        var getPremiumFinal = loadSo.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_me_premium_final',
          line: i,
        });
        var getMjpFinal = loadSo.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_me_mjp_price',
          line: i,
        });
        var getOtherFinal = loadSo.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_me_other_final',
          line: i,
        });

        itemArr.push({
          item: getItem,
          lme_final_amount: (!getLmeFinal?0: parseFloat(getLmeFinal).toFixed(2)),
          premium_final_amount: (!getPremiumFinal?0: parseFloat(getPremiumFinal).toFixed(2)),
          mjp_final_amount: (!getMjpFinal?0: parseFloat(getMjpFinal).toFixed(2)),
          other_final_amount: (!getOtherFinal?0: parseFloat(getOtherFinal).toFixed(2)),
        })

      }



      var getApplyingLine = loadSo.getLineCount('links');

      var invoiceArr = []

      for (let i = 0; i < getApplyingLine; i++) {
        var getInvoice = loadSo.getSublistValue({
          sublistId: 'links',
          fieldId: 'id',
          line: i
        });

        var getType = loadSo.getSublistValue({
          sublistId: 'links',
          fieldId: 'type',
          line: i
        });
        log.debug('getInvoice', getInvoice)
        log.debug('getType', getType)

        if (getType.includes('Invoice')) {
          invoiceArr.push(getInvoice);
        }

      }

      log.debug('invoiceArr', invoiceArr)

      for (let i = 0; i < invoiceArr.length; i++) {
        var loadInvoice = record.load({
          type: record.Type.INVOICE,
          id: invoiceArr[i],
        });

        var getInvItemLine = loadInvoice.getLineCount('item')

        for (let j = 0; j < getInvItemLine; j++) {
          var getItem = loadInvoice.getSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            line: j,
          });

          var getEquivalent = itemArr.filter((data) => data.item == getItem)
          
          if (getEquivalent.length>0) {
            var gsetLmeFinal =  loadInvoice.setSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_me_lme_final',
              line: j,
              value: getEquivalent[0].lme_final_amount
            });
            var gsetPremiumFinal =  loadInvoice.setSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_me_premium_final',
              line: j,
              value: getEquivalent[0].premium_final_amount
            });
            var gsetMjpFinal =  loadInvoice.setSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_me_mjp_price',
              line: j,
              value: getEquivalent[0].mjp_final_amount
            });
  
            var gsetOtherFinal =  loadInvoice.setSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_me_other_final',
              line: j,
              value: getEquivalent[0].other_final_amount
            });
  
          }

        }
        loadInvoice.save()
        
      }




    }

    // if (context.type == 'create') {

    //   var loadSo = record.load({
    //     type: record.Type.SALES_ORDER,
    //     id: recId,
    //     isDynamic: true,
    //   });

    //   var createInv = record.transform({
    //     fromType: record.Type.SALES_ORDER,
    //     fromId: recId,
    //     toType: record.Type.INVOICE,
    //     isDynamic: true,
    //   });
    //   createInv.save();

    // }

  }

  return {
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit
  }
});

/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/search", "./lib/moment.min.js"],
    function (search, moment) {
      
function pageInit(context) {
            var rec = context.currentRecord;
            var fieldId = context.fieldId;
            var sublistId = context.sublistId;
          console.log("validate line executing….")

            // if (context.mode == 'create') {


            //     let get_date = rec.getValue('trandate');
            //     let get_currency = rec.getValue('currency');

            //     let param = {
            //         date: moment(new Date(get_date)).format('D/M/YYYY'),
            //         currency: get_currency,
            //     }

            //     if (get_date) {
            //         let get_ex_rate = searchExchageRate(param);

            //         let set_ex_rate_tms = rec.setValue('custbody_me_spot_rate', get_ex_rate[0].ex_rate);
            //         let set_ex_rate_default = rec.setValue('exchangerate', get_ex_rate[0].ex_rate)
            //     }
            // }
            // try {


                let get_ex_rate_field = rec.getField("custbody_me_spot_rate")
                let get_is_change_spot_rate = rec.getValue('custbody_me_change_spot_rate')
              log.debug('get_is_change_spot_rate', 1535)
                if (get_is_change_spot_rate == true || get_is_change_spot_rate == "true") {
                    get_ex_rate_field.isDisabled = false
                }
                if (get_is_change_spot_rate == false || get_is_change_spot_rate == "false" || get_is_change_spot_rate == "") {
                    get_ex_rate_field.isDisabled = true
                }

            // } catch (error) {
            //     log.error('error', error)
            // }



        }

      function fieldChanged(context) {
            var rec = context.currentRecord;
            var fieldId = context.fieldId;
            var sublistId = context.sublistId;

            // if (fieldId == 'trandate') {
                // let get_date = rec.getValue('trandate');
                // let get_currency = rec.getValue('currency');

                // let param = {
                //     date: moment(new Date(get_date)).format('D/M/YYYY'),
                //     currency: get_currency,
                // }

                // if (get_date) {
                //     let get_ex_rate = searchExchageRate(param);

                //     let set_ex_rate_tms = rec.setValue('custbody_me_spot_rate', get_ex_rate[0].ex_rate);
                //     let set_ex_rate_default = rec.setValue('exchangerate', Number(1 / get_ex_rate[0].ex_rate).toFixed(8));
                // }
            // }

          try {
            

            if (fieldId == 'custbody_me_spot_rate') {
                let get_ex_rate_tms = rec.getValue('custbody_me_spot_rate');

                let calculate = 1 / get_ex_rate_tms

                // rec.setValue('custbody_me_spot_rate', calculate);

                let set_ex_rate_default = rec.setValue('exchangerate', calculate)
            }

            if (fieldId = 'custbody_me_change_spot_rate') {
                let get_ex_rate_field = rec.getField("custbody_me_spot_rate")
                let get_is_change_spot_rate = rec.getValue('custbody_me_change_spot_rate')
              log.debug('get_is_change_spot_rate', get_is_change_spot_rate)
                if (get_is_change_spot_rate == true || get_is_change_spot_rate == "true") {
                    get_ex_rate_field.isDisabled = false
                }
                if (get_is_change_spot_rate == false || get_is_change_spot_rate == "false" || get_is_change_spot_rate == "") {
                    get_ex_rate_field.isDisabled = true
                }
            }
          } catch (error) {
            log.error('Error', error)
          }

        }
      
  function validateField(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;
        var sublistId = context.sublistId;



       if (fieldId === 'exchangerate') {    
           // Custom validation logic
           // If validation fails, confirm would normally be called, but is auto-canceled now
           window.confirm = function() {
            return false;
        };
       }

       // Restore the original confirm function after validation
       window.confirm = function(message) {
           return window.confirm(message);  // This restores the original behavior.
       };

       return true; // Allow the field change
    
  }

    return {
pageInit: pageInit,
            fieldChanged: fieldChanged,
        validateField: validateField,
    }
});
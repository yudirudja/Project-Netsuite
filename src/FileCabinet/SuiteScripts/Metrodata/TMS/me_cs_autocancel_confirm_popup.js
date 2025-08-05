/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define([], function () {


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

        validateField: validateField,
    }
});
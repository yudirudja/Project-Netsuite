function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try {
        //Get Data User who trigger the action

        const ACCRUED_ACC = 111;

        var isApplied = false;

        var userData = nlapiGetUser();
        var userRole = nlapiGetRole()
        nlapiLogExecution("DEBUG", "1 Data User", userData + ' || User Role' + userRole)

        var idCustPayment = transactionRecord.getId();
        // var location = transactionRecord.getFieldValue('location')
        var adjCategory = transactionRecord.getFieldText('custbody_me_adjustment_category')//Internal Id = 2
        var typeItem = transactionRecord.getFieldText('custbody_me_type_item')//internal Id = 1
        var customer_master = transactionRecord.getFieldValue('entity')
        var department = transactionRecord.getFieldValue('department')
        var classs = transactionRecord.getFieldValue('class')
        var location_header = transactionRecord.getFieldValue('location')
        var created_from = transactionRecord.getFieldValue('createdfrom');
        var ex_rate = transactionRecord.getFieldValue('exchangerate');

        var loadPo = nlapiLoadRecord('purchaseorder', created_from)

        var po_item_line = loadPo.getLineItemCount('item');

        var item_po_array = [];
        var cust_gl_val = [];

        for (var i = 1; i <= po_item_line; i++) {

            var get_item_id = loadPo.getLineItemValue('item', 'item', i)
            var get_item_rate = loadPo.getLineItemValue('item', 'rate', i)
            item_po_array.push({
                get_item_id: get_item_id,
                get_item_rate: parseFloat(get_item_rate),
            })
            nlapiLogExecution("DEBUG", "item_po_array", get_item_id + "_" + get_item_rate)

        }

        var curr_line_count = transactionRecord.getLineItemCount('item');

        for (var i = 1; i <= curr_line_count; i++) {
            var get_curr_item_chck_box = transactionRecord.getLineItemValue('item', 'itemreceive', i);
            var get_curr_item_id = transactionRecord.getLineItemValue('item', 'item', i);
            var get_curr_item_qty = transactionRecord.getLineItemValue('item', 'quantity', i);
            var get_curr_item_loc = transactionRecord.getLineItemValue('item', 'location', i);
            var get_generate_accrual_item = nlapiLookupField('noninventoryitem', get_curr_item_id, 'generateaccruals');
            nlapiLogExecution("DEBUG", "get_curr_item_id - get_curr_item_qty - get_generate_accrual_item", get_curr_item_id + "_" + get_curr_item_qty + '_' + get_generate_accrual_item)
            var item_account = '';
            try {
                var item_account_id = nlapiLookupField('noninventoryitem', get_curr_item_id, 'expenseaccount');
                if (item_account_id) {
                    item_account = item_account_id
                }
                nlapiLogExecution("DEBUG", "noninventoryitem", item_account)
            } catch (error) {
                item_account=''
                nlapiLogExecution("DEBUG", "error lookup Item Non Inventory", error)
            }
            try {
                var item_account_id  = nlapiLookupField('otherchargeitem', get_curr_item_id, 'expenseaccount');
                if (item_account_id) {
                    item_account = item_account_id
                }
                nlapiLogExecution("DEBUG", "otherchargeitem", item_account)
            } catch (error) {
                item_account=''
                nlapiLogExecution("DEBUG", "error lookup Item otherchargeitem", error)
            }
            try {
                var item_account_id  = nlapiLookupField('serviceitem', get_curr_item_id, 'expenseaccount');
                if (item_account_id) {
                    item_account = item_account_id
                }
                nlapiLogExecution("DEBUG", "serviceitem", item_account)
            } catch (error) {
                item_account=''
                nlapiLogExecution("DEBUG", "error lookup Item serviceitem", error)
            }


            for (var j = 0; j < item_po_array.length; j++) {
                if (item_po_array[j].get_item_id == get_curr_item_id && item_account != '' && (get_generate_accrual_item == 'F' || !get_generate_accrual_item) && get_curr_item_qty && get_curr_item_chck_box) {
                    cust_gl_val.push({
                        line_id_item: i,
                        exp_account: item_account,
                        location: get_curr_item_loc,
                        value: parseFloat(get_curr_item_qty) * parseFloat(item_po_array[j].get_item_rate) * parseFloat(ex_rate),
                    });
                  nlapiLogExecution("DEBUG", "account", item_account +'_'+ (parseFloat(get_curr_item_qty) * parseFloat(item_po_array[j].get_item_rate) * parseFloat(ex_rate) ))
                }

            }

        }


        // var customer_account = nlapiLookupField('customer', customer_master, 'custentity_me_income_account_customer');
        // var line_count = nlapiGetLineItemCount('item');

        // var item = nlapiGetLineItemValue('item', 'item', 1)
        // nlapiLogExecution("DEBUG", "2 Data User", item)
        // var item_account = nlapiLookupField('customer', item, 'incomeaccount');
        // nlapiLogExecution("DEBUG", "3 Data User", item_account)

        // var standartLineArr = []

        // for (var i = 0; i < standardLines.getCount(); i++) {
        //     var credAmount = (standardLines.getLine(i).getCreditAmount());
        //     var accountId = (standardLines.getLine(i).getAccountId());
        //     var debAmount = (standardLines.getLine(i).getDebitAmount());
        //     var location = (standardLines.getLine(i).getLocationId());
        //     var class_ = (standardLines.getLine(i).getClassId());
        //     var department = (standardLines.getLine(i).getDepartmentId());

        //     standartLineArr.push({
        //         account_id: accountId,
        //         credit_amount: credAmount,
        //         debit_amount: debAmount,
        //         location: location,
        //         class_: class_,
        //         department: department,
        //     })

        //     nlapiLogExecution("DEBUG", "standartLineArr", credAmount + '-' + accountId + '-' + debAmount)
        // }

        for (var i = 0; i < cust_gl_val.length; i++) {
            // if (cust_gl_val[i].account_id == 54) {
                //=================debit==========================
                var newLine = customLines.addNewLine();
                newLine.setAccountId(Number(cust_gl_val[i].exp_account));
                newLine.setDebitAmount(Number(cust_gl_val[i].value));
                // append old memo to new memo text
                newLine.setMemo(cust_gl_val[i].line_id_item);
                newLine.setLocationId(Number(cust_gl_val[i].location));
                newLine.setDepartmentId(Number(department));
                newLine.setClassId(Number(classs));
                newLine.setEntityId(Number(customer_master));
                //================credit=========================
                var newLine = customLines.addNewLine();
                newLine.setAccountId(Number(ACCRUED_ACC));
                newLine.setCreditAmount(Number(cust_gl_val[i].value));
                // append old memo to new memo text
                newLine.setLocationId(Number(cust_gl_val[i].location));
                newLine.setDepartmentId(Number(department));
                newLine.setClassId(Number(classs));
                newLine.setEntityId(Number(customer_master));
            // }

        }


    } catch (error) {
        nlapiLogExecution("DEBUG", "error", error);
    }

}

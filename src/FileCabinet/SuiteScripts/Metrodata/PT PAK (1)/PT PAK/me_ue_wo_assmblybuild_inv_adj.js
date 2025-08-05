/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function(record) {

    function beforeSubmit(context) {
        var rec = context.newRecord;

        var getCustomForm = rec.getValue('customform');
        var getCreatedFrom = rec.getValue('createdfrom')
        var getSubsidiary = rec.getValue('subsidiary')
        var getClass = rec.getValue('class')
        var getLocation = rec.getValue('location');
        var getDepartment = rec.getValue('department');

        if (getCustomForm == '195') {

            var loadRecordWO = record.load({
                type: 'workorder',
                id: getCreatedFrom,
            })

            var getCustomer = loadRecordWO.getValue('entity')
            
            var createInvAdj = record.create({
                type: 'inventoryadjustment',
                isDynamic: true,
            });
            var setSubsidiary = createInvAdj.setValue({
                fieldId: 'subsidiary',
                value: getSubsidiary
            })
            var setClass = createInvAdj.setValue({
                fieldId: 'class',
                value: getClass,
            });
            var setLocation = createInvAdj.setValue({
                fieldId: 'adjlocation',
                value: getLocation,
            });
            var setDepartment = createInvAdj.setValue({
                fieldId: 'department',
                value: getDepartment,
            });
            var setCustForm = createInvAdj.setValue({
                fieldId: 'customform',
                value: 177,
            });
            var setCust = createInvAdj.setValue({
                fieldId: 'customer',
                value: getCustomer,
            });

        }
    }


    return {
        beforeSubmit: beforeSubmit,
    }
});

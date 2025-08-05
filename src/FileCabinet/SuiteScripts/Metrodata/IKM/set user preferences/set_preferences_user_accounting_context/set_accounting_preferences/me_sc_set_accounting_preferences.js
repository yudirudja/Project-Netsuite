/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */

define(['N/config', 'N/log'], function (config, log) {
    function execute() {
        // Load the Company Preferences record
        var compPrefs = config.load({
            type: config.Type.USER_PREFERENCES 
        });
        log.debug('compPrefs', compPrefs);

        // Update a specific preference field (e.g. DATEFORMAT)
        let accounting_id = compPrefs.getValue({
            fieldId: 'ACCOUNTING_CONTEXT',
        });
        log.debug('accounting_id' + accounting_id);
        compPrefs.setText({
            fieldId: 'ACCOUNTING_CONTEXT',
            value: 'IKM'
        });

        // Save the changes
        var recordId = compPrefs.save();
        log.debug('Company Preferences updated', 'Saved record id: ' + recordId);
    }

    return {
        execute: execute
    };
});
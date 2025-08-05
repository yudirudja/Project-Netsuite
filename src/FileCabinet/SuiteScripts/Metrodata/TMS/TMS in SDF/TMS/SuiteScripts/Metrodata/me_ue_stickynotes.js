/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record'], function(search, record) {

   

    function beforeSubmit(context) {
        var newRec = context.newRecord;
        var newRec_type = newRec.type;
        if(context.type != 'delete' && newRec_type == 'customrecord_stick_note'){
            var record_type = newRec.getValue('custrecord_sn_record_type_script_id')
            var record_id = newRec.getValue('custrecord_sn_record_id')
            var messages = newRec.getValue('custrecord_sn_message')
            var subject_email = newRec.getValue('custrecord_sn_record_name')

            var rec_data = search.lookupFields({
                type: record_type,
                id: record_id,
                columns:["tranid"]
            })
            if(messages.indexOf(rec_data.tranid) == -1){
                newRec.setValue('custrecord_sn_message', rec_data.tranid + ': ' + messages)
            }
            if(subject_email.indexOf(rec_data.tranid) == -1){
                
                var new_subject_email = subject_email.split(":")[0] + ' ' + rec_data.tranid + ': ' + subject_email.split(":")[1]
                log.debug('new_subject_email ' + newRec_type, new_subject_email)
                newRec.setValue('custrecord_sn_record_name', new_subject_email)
            }
            log.debug('rec_data', rec_data)
        }
        
        if(context.type != 'delete' && newRec_type == 'customrecord_stick_note_reply'){
            var parent_id = newRec.getValue('custrecord_snr_note')
            var messages = newRec.getValue('custrecord_snr_reply')
            log.debug('data reply note', 
                {
                    parent_id : parent_id,
                    messages : messages
                }
            )
            var parent_rec = search.lookupFields({
                type: 'customrecord_stick_note',
                id: parent_id,
                columns:["custrecord_sn_record_type_script_id", 'custrecord_sn_record_id','custrecord_sn_record_name']
            })
            log.debug('parent_rec', parent_rec)
            var rec_data = search.lookupFields({
                type: parent_rec.custrecord_sn_record_type_script_id,
                id: parent_rec.custrecord_sn_record_id,
                columns:["tranid"]
            })
            if(messages.indexOf(rec_data.tranid) == -1){
                newRec.setValue('custrecord_snr_reply', rec_data.tranid + ': ' + messages)
            }


            var subject_email = parent_rec.custrecord_sn_record_name
            if(subject_email.indexOf(rec_data.tranid) == -1){
                var new_subject_email = subject_email.split(":")[0] + ' ' + rec_data.tranid + ': ' + subject_email.split(":")[1]
                log.debug('new_subject_email ' + newRec_type, new_subject_email)
                if(parent_rec.custrecord_sn_record_name.indexOf(rec_data.tranid) == -1){
                    record.submitFields({
                        type: 'customrecord_stick_note',
                        id: parent_id,
                        values: {
                            custrecord_sn_record_name: new_subject_email
                        }
                    })
                }
            }
        }
    }


    return {
        beforeSubmit: beforeSubmit
    }
});

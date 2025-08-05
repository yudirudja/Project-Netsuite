/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define([], function() {

    function onRequest(context) {
        let send = email.send({
            author: 4,
            recipients: "yulianuswyr@gmail.com",
            cc: [ 'yulianus.rudja@mii.co.id'],
            subject: `PT. Anak Bahagia Indonesia Sales Invoice:`,
            body: `test`,
            // attachments: data.file,
          });
    }

    return {
        onRequest: onRequest
    }
});

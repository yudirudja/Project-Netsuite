/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/redirect", "N/ui/serverWidget", "N/task", "N/search"],
    function (redirect, serverWidget, task, search) {
        
        function onRequest(context) {
            var form = serverWidget.createForm({
                title: 'Generator Nomor Faktur Pajak'
            });
            if (context.request.method === 'GET') {
                form.addSubmitButton({
                    label: 'Generate'
                });

                var startNumber = form.addField({
                    id: 'custpage_startnumber',
                    type: serverWidget.FieldType.TEXT,
                    label: "Nomor Faktur (Start Number)"
                }).isMandatory = true;

                var createDate = form.addField({
                    id: 'custpage_createdate',
                    type: serverWidget.FieldType.DATE,
                    label: "Date"
                });
                createDate.isMandatory = true;
                createDate.defaultValue = new Date();

                var endNumber = form.addField({
                    id: 'custpage_endnumber',
                    type: serverWidget.FieldType.TEXT,
                    label: "Nomor Faktur (End Number)"
                });
                endNumber.isMandatory = true;

                form.clientScriptModulePath = 'SuiteScripts/Metrodata/me_cs_behavior_enofagen.js';
                context.response.writePage(form);
            } else {

                var reportGroup = form.addFieldGroup({
                    id: 'loading_notif',
                    label: 'Generating'
                });
                var loadingAnimate = form.addField({
                    id: 'custpage_loading_123',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' ',
                    container: 'loading_notif'
                });
                loadingAnimate.defaultValue = "<div style='font-size: 25px;'>Generating In Progress... <a href='https://9089437.app.netsuite.com/app/common/custom/custrecordentrylist.nl?rectype=155' style='color: blue; text-decoration: none;'>Click Here</a> to redirect to Enofa Record List Page</div>" 

                var startNumber = context.request.parameters.custpage_startnumber;
                log.debug("startNumber", startNumber);
                var endNumber = context.request.parameters.custpage_endnumber;
                log.debug("endNumber", endNumber);
                var createDate = context.request.parameters.custpage_createdate;

                var params = JSON.stringify({
                    startNumber: startNumber,
                    endNumber: endNumber,
                    createDate: createDate,
                });

                var enofaTask = task.create({
                    taskType: task.TaskType.SCHEDULED_SCRIPT,
                    params: { custscript_me_data_fp_enofagenerator: params },
                    scriptId: "customscript_me_ss_enofa_generator",
                    deploymentId: "customdeploy_me_ss_enofa_generator",
                });

                var enofaTaskId = enofaTask.submit();
                context.response.writePage(form);
                // redirect.redirect({
                //     url: '/app/common/custom/custrecordentrylist.nl?rectype=142'
                // });
            }
        }

        return {
            onRequest: onRequest
        }
    });
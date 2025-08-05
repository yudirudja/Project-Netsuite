/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/task'], function(task) {


    function beforeSubmit(context) {
        var rec = context.newRecord;
        executeScheduled()
        
    }

    function executeScheduled() {
        var scriptTask = task.create({
          taskType: task.TaskType.SCHEDULED_SCRIPT,
          scriptId: "customscript_me_ue_updt_empl_ctr_pr",
          deploymentId: "customdeploy_me_ue_updt_empl_ctr_pr"
        });
    
        var scriptTaskId = scriptTask.submit();
    
        log.debug("scriptTaskId", scriptTaskId);
      }

    return {
        beforeSubmit: beforeSubmit,
    }
});

/**
 *@NApiVersion 2.1
 *@NScriptType WorkflowActionScript
 */
define(['N/record', 'N/email', 'N/file', 'N/search', 'N/runtime', "N/url", "N/render", "N/config", "../config/me_config.js"], function (record, email, file, search, runtime, url, render, config, config_cust) {

  function getFileAttachment(id) {



    let load_invoice = record.load({
      type: record.Type.INVOICE,
      id: id,
      isDynamic: true,
    });

    let get_internal_id = load_invoice.getValue("internalid")
    let get_tranid = load_invoice.getValue("tranid")
    let get_subsidiary = load_invoice.getText("subsidiary")
    let get_entity = load_invoice.getValue("entity")
    let get_terms = load_invoice.getText("terms")
    let get_date = load_invoice.getText("trandate")
    let get_otherrefnum = load_invoice.getValue("otherrefnum")
    let get_total = load_invoice.getValue("total")
    let get_duedate = load_invoice.getValue("duedate")
    let get_custbody_me_fp_gdrive_link = load_invoice.getValue("custbody_me_fp_gdrive_link")
    let search_entity = search.lookupFields({
      type: search.Type.CUSTOMER,
      id: get_entity,
      columns: ['altname', 'email']
    });

    var domain = url.resolveDomain({
      hostType: url.HostType.APPLICATION,
    });

    let rec_url = 'https://' + domain + url.resolveRecord({
      recordType: 'invoice',
      recordId: parseInt(id),
      isEditMode: false
    });

    let result = {
      rec_url: rec_url,
      internal_id: id,
      tranid: get_tranid,
      subsidiary: get_subsidiary,
      cust_name: search_entity.altname,
      cust_email: search_entity.email,
      terms: get_terms,
      date: get_date,
      otherrefnum: get_otherrefnum,
      total: get_total,
      duedate: get_duedate,
      custbody_me_fp_gdrive_link: get_custbody_me_fp_gdrive_link,
      file: []
    }
    log.debug("result", result)
    let get_attachment_line = load_invoice.getLineCount("recmachcustrecord7")

    let file_id_arr = new Array();

    var transactionFile = render.transaction({
      entityId: id,
      printMode: render.PrintMode.PDF
    });

    result.file.push(transactionFile)

    for (let i = 0; i < get_attachment_line; i++) {
      let get_file_attachment_id = load_invoice.getSublistValue({
        sublistId: "recmachcustrecord7",
        fieldId: "custrecord_me_file_attachment",
        line: i
      });

      let file_obj = file.load({ id: get_file_attachment_id });

      result.file.push(file_obj)
    }


    return result
  }

  function sendEmail(data) {

    let load_company_info = config.load({ type: config.Type.COMPANY_INFORMATION });
    log.debug("load_company_info", load_company_info.getValue('custrecord_me_cc'))

    //ini untuk sementara testing di SB'
    var current_user_email = runtime.getCurrentUser().email;

    if ((data.terms).includes("Cash Before Delivery")) {
      let send = email.send({
        author: config_cust.finance_receivable_emply_id,
        recipients: data.cust_email,
        cc: [load_company_info.getValue('custrecord_me_cc')],
        subject: `PT. Anak Bahagia Indonesia Sales Invoice: ${data.tranid} - ${data.cust_name}`,
        body: `
    <p>       
    Dear Sir/Madam, ${data.cust_name}
    </p>
    <p>
    Hope this email find you well
    </p>
    <p>
    Your payment has been received to our account.<br/>
    Please find attachment to the invoice and the items will proceed accordingly.<br/>
    If you have any further questions, do not hesitate to let us know.
    </p>
    <p>
    Thank you for the attention and cooperation.
    </p>
    <p>
    Best Regards
    </p>
    <p>
    ${data.subsidiary}
    </p>
    <a href=${data.rec_url}>View Record</a>`,
        attachments: data.file,
      });

      log.debug("send", send)
    } else {
      let send = email.send({
        author: config_cust.finance_receivable_emply_id,
        recipients: data.cust_email,
        cc: [load_company_info.getValue('custrecord_me_cc')],
        subject: `PT. Anak Bahagia Indonesia Sales Invoice: ${data.tranid} - ${data.cust_name}`,
        body: `<p>
                      Dear Sir/Madam, ${data.cust_name}
                      <br />

                      <br />
                      Hope this email find you well
                      <br />

                      <br />
                      Sales Invoice #${data.tranid}
                    </p>
                    <figure class="table">
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              Date
                            </td>
                            <td>
                              : ${data.date}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              PO #
                            </td>
                            <td>
                              : ${data.otherrefnum}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Invoice Number #
                            </td>
                            <td>
                              : ${data.tranid}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Total
                            </td>
                            <td>
                              : ${data.total}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Due Date
                            </td>
                            <td>
                              : ${data.duedate}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </figure>
                    <p>
                      If you have any further questions, do not hesitate to let us know.
                      <br />

                      <br />
                      Thank you for the attention and cooperation.
                      <br />

                      <br />
                      Best Regards
                      <br />
                      ${data.subsidiary}
                    </p>
                    <p>
                      ${data.custbody_me_fp_gdrive_link ? `<a href=${data.custbody_me_fp_gdrive_link}>*Attached Documents</a>` : ``}
                    </p>
                    <p>
                      <a href=${data.rec_url}>View Record</a>
                    </p>`,
        attachments: data.file,

      });
    }



  }

  function onAction(scriptContext) {

    log.debug("test", "123")

    let rec = scriptContext.newRecord;

    let get_file_attachment = getFileAttachment(rec.id)

    let send_email = sendEmail(get_file_attachment)



  }

  return {
    onAction: onAction
  }
});

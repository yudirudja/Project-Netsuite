/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/search', 'N/render', 'N/file', 'N/record', 'N/encode', 'N/format', 'N/task', 'N/redirect', 'N/ui/serverWidget'], function (search, render, file, record, encode, format, task, redirect, serverWidget) {



    function searchCreditMemo(params) {

        var creditMemoData = [];

        var creditmemoSearchObj = search.create({
            type: "creditmemo",
            filters:
                [
                    ["type", "anyof", "CustCred"],
                    "AND",
                    ["trandate", "within", "2/5/2023", "13/6/2023"],
                    "AND",
                    ["createdfrom.type", "anyof", "RtnAuth"],
                    "AND",
                    ["appliedtotransaction.type", "anyof", "RtnAuth"],
                    "AND",
                    ["custbody_me_jrnl_entry_list_tagihan.accounttype", "anyof", "AcctRec"]
                ],
            columns:
                [
                    //0
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    //1
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    //2
                    search.createColumn({
                        name: "formulatext",
                        formula: "REGEXP_SUBSTR({customer.parent}, '[^-]+', 1, 1)",
                        label: "Customer Group"
                    }),
                    //3
                    search.createColumn({ name: "netamount", label: "Amount (Net)" }),
                    //4
                    search.createColumn({ name: "amountpaid", label: "Amount Paid" }),
                    //5
                    search.createColumn({ name: "taxamount", label: "Amount (Tax)" }),
                    //6
                    search.createColumn({ name: "grossamount", label: "Amount (Gross)" }),
                    //7
                    search.createColumn({
                        name: "formulanumeric",
                        formula: "({grossamount} + {taxamount}) * -1",
                        label: "Tax Amount + Amount"
                    }),
                    //8
                    search.createColumn({ name: "appliedtotransaction", label: "Applied To Transaction" }),
                    //9
                    search.createColumn({
                        name: "type",
                        join: "appliedToTransaction",
                        label: "Type"
                    }),
                    //10
                    search.createColumn({
                        name: "formulatext",
                        formula: "REGEXP_REPLACE({createdFrom}, '.*#', '')",
                        label: "Created From(Return Auth)"
                    }),
                    //11
                    search.createColumn({
                        name: "amount",
                        join: "CUSTBODY_ME_JRNL_ENTRY_LIST_TAGIHAN",
                        label: "ext/int"
                    }),
                    //12
                    search.createColumn({ name: "custbody_me_jrnl_entry_list_tagihan", label: "ME - JE List Tagihan" })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let p = 0; p < creditmemoSearchObj.length; p++) {
            var internalId = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[0]);
            var documentNumber = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[1]);
            var customerGroup = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[2]);
            var amountNet = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[3]);
            var amountPaid = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[4]);
            var amountTax = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[5]);
            var amountGross = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[6]);
            var amountTaxPlusAmount = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[7]);
            var appliedToTransactions = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[8]);
            // var createdFromRA = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[9]);
            var createdFromRA = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[10]);
            var extInt = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[11]);
            var jeListTagihan = creditmemoSearchObj[p].getValue(creditmemoSearchObj[p].columns[12]);

            var data = {
                internal_id: internalId,
                document_number: documentNumber,
                customer_group: customerGroup,
                amount_net: amountNet,
                amount_paid: amountPaid,
                amount_tax: amountTax,
                amount_gross: amountGross,
                amount_tax_plus_amount: amountTaxPlusAmount,
                applied_to_transaction: appliedToTransactions,
                created_from_ra: createdFromRA,
                ext_int: extInt,
                je_list_tagihan: jeListTagihan,
            }

            creditMemoData.push(data);
        }

        return creditMemoData;
    }

    function searchInvoiceApplyingToCreditMemo(params) {

        var invoiceApplyingCreditMemoData = [];

        var invoiceSearchObj = search.create({
            type: "creditmemo",
            filters:
                [
                    ["type", "anyof", "CustCred"],
                    "AND",
                    ["trandate", "within", "2/5/2023", "13/6/2023"],
                    "AND",
                    ["createdfrom.type", "anyof", "RtnAuth"],
                    "AND",
                    ["appliedtotransaction.type", "anyof", "CustInvc"],
                    "AND",
                    ["custbody_me_jrnl_entry_list_tagihan.accounttype", "anyof", "AcctRec"]
                ],
            columns:
                [
                    //0
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    //1
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    //2
                    search.createColumn({
                        name: "formulatext",
                        formula: "REGEXP_SUBSTR({customer.parent}, '[^-]+', 1, 1)",
                        label: "Customer Group"
                    }),
                    //3
                    search.createColumn({ name: "amountpaid", label: "Amount Paid" }),
                    //4
                    search.createColumn({ name: "taxamount", label: "Amount (Tax)" }),
                    //5
                    search.createColumn({ name: "grossamount", label: "Amount (Gross)" }),
                    //6
                    search.createColumn({
                        name: "formulanumeric",
                        formula: "({grossamount} + {taxamount}) * -1",
                        label: "Tax Amount + Amount"
                    }),
                    //7
                    search.createColumn({ name: "appliedtotransaction", label: "Applied To Transaction" }),
                    //8
                    search.createColumn({
                        name: "formulatext",
                        formula: "REGEXP_REPLACE({appliedtotransaction}, '.*#', '')",
                        label: "Applied to Transaction (Invoice)"
                    }),
                    //9
                    search.createColumn({
                        name: "type",
                        join: "appliedToTransaction",
                        label: "Type"
                    }),
                    //10
                    search.createColumn({
                        name: "formulatext",
                        formula: "REGEXP_REPLACE({createdFrom}, '.*#', '')",
                        label: "Created From(Return Auth)"
                    }),
                    //11
                    search.createColumn({
                        name: "amount",
                        join: "CUSTBODY_ME_JRNL_ENTRY_LIST_TAGIHAN",
                        label: "Amount"
                    }),
                    //12
                    search.createColumn({ name: "custbody_me_jrnl_entry_list_tagihan", label: "ME - JE List Tagihan" })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let p = 0; p < invoiceSearchObj.length; p++) {
            var internalId = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[0]);
            var documentNumber = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[1]);
            var customerGroup = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[2]);
            var amountPaid = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[3]);
            var amountTax = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[4]);
            var amountGross = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[5]);
            var amountTaxPlusAmount = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[6]);
            var appliedToTransactions = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[7]);
            var appliedToTransactionsInvoice = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[8]);
            // var createdFromRA = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[9]);
            var createdFromRA = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[10]);
            var extInt = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[11]);
            var jeListTagihan = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[12]);

            var data = {
                inv_internal_id: internalId,
                inv_document_number: documentNumber,
                inv_customer_group: customerGroup,
                inv_amount_paid: amountPaid,
                inv_amount_tax: amountTax,
                inv_amount_gross: amountGross,
                inv_amount_tax_plus_amount: amountTaxPlusAmount,
                inv_applied_to_transactions: appliedToTransactions,
                inv_applied_to_transactions_invoice: appliedToTransactionsInvoice,
                inv_created_from_ra: createdFromRA,
                inv_ext_int: extInt,
                inv_je_list_tagihan: jeListTagihan,
            }

            invoiceApplyingCreditMemoData.push(data);

        }

        return invoiceApplyingCreditMemoData;
    }

    function searchInvoices(params) {

        var invoiceData = [];

        var invoiceSearchObj = search.create({
            type: "invoice",
            filters:
                [
                    ["type", "anyof", "CustInvc"],
                    "AND",
                    ["trandate", "within", "2/5/2023", "13/6/2023"]
                ],
            columns:
                [
                    search.createColumn({ name: "custbody_me_fp_tglfaktur", label: "ME - Tanggal Faktur" }),
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "custbody_me_fp_nomorfaktur", label: "ME - Nomor Faktur Pajak" })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let p = 0; p < invoiceSearchObj.length; p++) {
            var tanggalFaktur = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[0]);
            var documentNumber = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[1]);
            var noFakturPajak = invoiceSearchObj[p].getValue(invoiceSearchObj[p].columns[2]);


            var data = {
                document_number: documentNumber,
                tanggal_faktur: tanggalFaktur,
                no_faktur_pajak: noFakturPajak,
            }

            invoiceData.push(data);

        }

        return invoiceData;

    }

    function merge(creditMemo, invoiceApplyingCreditMemo, invoice, dataSetObjList) {
        for (const key in dataSetObjList) {

            for (let p = 0; p < invoiceApplyingCreditMemo.length; p++) {
                if (dataSetObjList[key].docNum == invoiceApplyingCreditMemo[p].inv_created_from_ra) {
                    dataSetObjList[key].no_dpp_ppn = invoiceApplyingCreditMemo[p].inv_applied_to_transactions_invoice;
                    dataSetObjList[key].paid = invoiceApplyingCreditMemo[p].inv_amount_paid;
                }
            }

            for (let x = 0; x < creditMemo.length; x++) {
                if (dataSetObjList[key].docNum == creditMemo[x].created_from_ra) {
                    dataSetObjList[key].total = creditMemo[x].amount_tax_plus_amount;



                }


            }

            for (let o = 0; o < dataSetObjList[key].item_line.length; o++) {

                for (let p = 0; p < invoiceApplyingCreditMemo.length; p++) {
                    if (dataSetObjList[key].item_line[o].docNum == invoiceApplyingCreditMemo[p].inv_created_from_ra) {

                    }
                }

                for (let x = 0; x < creditMemo.length; x++) {
                    if (dataSetObjList[key].item_line[o].docNum == creditMemo[x].created_from_ra) {
                        dataSetObjList[key].item_line[o].ext_int = creditMemo[x].ext_int;
                        dataSetObjList[key].item_line[o].netto = creditMemo[x].amount_net;
                        dataSetObjList[key].item_line[o].ppn = creditMemo[x].amount_tax;
                    } else {
                        dataSetObjList[key].item_line[o].ext_int = 123;
                    }


                }

                // for (let j = 0; j < invoice.length; j++) {
                //     if (dataSetObjList[key].item_line[o].docNum == creditMemo[x].created_from_ra) {

                //     }
                //     dataSetObjList[key].item_line[o].tanggal_faktur_pajak = invoice[j].tanggal_faktur;
                //     dataSetObjList[key].item_line[o].nomor_faktur_pajak = invoice[j].no_faktur_pajak;


                // }
                // if (dataSetObjList[key].item_line[o].docNum == ) {
                //     dataSetObjList[key].item_line[o].ext_int = creditMemo[o].ext_int;
                // }else{
                //     dataSetObjList[key].item_line[o].ext_int = 123
                // }


            }

        }
        return dataSetObjList;
    }

    function onRequest(context) {
        var returnAuthSearch = search.create({
            type: "transaction",
            filters:
                [
                    ["type", "anyof", "RtnAuth"],
                    "AND",
                    ["trandate", "within", "1/5/2023", "13/6/2023"],
                    "AND",
                    ["customer.entityid", "isnotempty", ""],
                    "AND",
                    ["taxitem", "anyof", "6262"]
                ],
            columns:
                [
                    //0
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    //1
                    search.createColumn({ name: "trandate", label: "Date" }),
                    //2
                    search.createColumn({
                        name: "parent",
                        join: "customer",
                        label: "Top Level Parent"
                    }),
                    //3
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when lower({location}) like '%baik%' then 'B' when lower({location}) like '%rusak%' then 'K' end",
                        label: "BK"
                    }),
                    //4
                    search.createColumn({ name: "location", label: "Location" }),
                    //5
                    search.createColumn({ name: "creditamount", label: "Amount (Credit)" }),
                    //6
                    search.createColumn({
                        name: "custitem_me_amt",
                        join: "item",
                        label: "ME - Amount"
                    }),
                    //7
                    search.createColumn({
                        name: "formulatext",
                        formula: "REGEXP_SUBSTR({customer.parent}, '[^-]+', 1, 1)",
                        label: "Group"
                    }),
                    //8
                    search.createColumn({ name: "salesrep", label: "Sales Rep" }),
                    //9
                    search.createColumn({ name: "custbody_me_no_doc_return_customer", label: "ME - No. Document Return Customer" }),
                    //10
                    search.createColumn({ name: "custbody_me_jrnl_entry_list_tagihan", label: "ME - JE List Tagihan" }),
                    //11
                    search.createColumn({ name: "item", label: "Item" }),
                    //12
                    search.createColumn({ name: "custcol_me_fulfillcarton", label: "ME - Qty Carton Fulfill" }),
                    //13
                    search.createColumn({ name: "custcol_me_fulfillpcs", label: "ME - Qty Pcs Fulfill" }),
                    //14
                    search.createColumn({ name: "custcol_me_bonusa_fulfillcarton", label: "ME - Bonus Carton" }),
                    //15
                    search.createColumn({ name: "custcol_me_bonusa_fulfillpcs", label: "ME - Bonus Pcs" }),
                    //16
                    search.createColumn({ name: "custcol_me_rate_carton", label: "ME - Rate Before Disc. (CTN)" }),
                    //17
                    search.createColumn({ name: "custcol_me_rate_before_disc_pcs", label: "ME - Rate Before Disc. (PCS)" }),
                    //18
                    search.createColumn({ name: "netamount", label: "Amount (Net)" }),
                    //19
                    search.createColumn({ name: "custcol_me_expired_date", label: "ME - Expired Date" }),
                    //20
                    search.createColumn({ name: "custcol_me_lf_keterangan_alasan_retur", label: "ME - Keterangan Alasan Retur" }),
                    //21
                    search.createColumn({ name: "custbody_me_status_upld_ret_cust", label: "ME - Status Return Customer" }),
                    //22
                    search.createColumn({
                        name: "formulatext",
                        formula: "REGEXP_SUBSTR({custbody_me_list_return_auth},  '[^-]*-(.*)', 1, 1, NULL, 1)",
                        label: "Formula (Text)"
                    }),
                    //23
                    search.createColumn({ name: "custbody_me_fp_tglfaktur", label: "ME - Tanggal Faktur" }),
                    //24
                    search.createColumn({ name: "custbody_me_fp_kodetransaksi", label: "ME - Kode Transaksi Faktur Pajak" }),
                    //25
                    search.createColumn({ name: "custcol_me_fprj_ra", label: "ME - Return Authorization" }),
                    //26
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    //27
                    search.createColumn({ name: "netamount", label: "Amount (Net)" }),
                    //28
                    search.createColumn({ name: "custcol_me_disc_a1_rp_so", label: "ME - Disc A (1) Rp" }),
                    //29
                    search.createColumn({ name: "custcol_me_disc_a1a_percent_so", label: "ME - Disc A (1a) %" }),
                    //30
                    search.createColumn({ name: "custcol_me_disc_a1b_percent_so", label: "ME - Disc A (1b) %" }),
                    //31
                    search.createColumn({ name: "custcol_me_disc_a2_rp_so", label: "ME - Disc A (2) Rp " }),
                    //32
                    search.createColumn({ name: "custcol_me_disc_a2a_percent_so", label: "ME - Disc A (2a) %" }),
                    //33
                    search.createColumn({ name: "custcol_me_disc_a2b_percent_so", label: "ME - Disc A (2b) %" }),
                    //34
                    search.createColumn({ name: "custcol_me_disc_a3_rp_so", label: "ME - Disc A (3) Rp" }),
                    //35
                    search.createColumn({ name: "custcol_me_disc_a3a_percent_so", label: "ME - Disc A (3a) %" }),
                    //36
                    search.createColumn({ name: "custcol_me_disc_a3b_percent_so", label: "ME - Disc A (3b) %" }),
                    //37
                    search.createColumn({ name: "custcol_me_disc_b1_percent_so", label: "ME - Disc B (1) %" }),
                    //38
                    search.createColumn({ name: "custcol_me_disc_b1_rp_so", label: "ME - Disc B (1) Rp" }),
                    //39
                    search.createColumn({ name: "custcol_me_disc_b2_percent_so", label: "ME - Disc B (2) %" }),
                    //40
                    search.createColumn({ name: "custcol_me_disc_b2_rp_so", label: "ME - Disc B (2) Rp" }),
                    //41
                    search.createColumn({ name: "custcol_me_disc_b3_percent_so", label: "ME - Disc B (3) %" }),
                    //42
                    search.createColumn({ name: "custcol_me_disc_b3_rp_so", label: "ME - Disc B (3) Rp" })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        var dataSet = [];
        var dataSet2 = [];
        var dataSet3 = [];
        var dataSetObjList = {};
        var dataSet2ObjList = {};
        var dataSet3ObjList = {};
        var dataSetObj = {};
        var itemLineObj = {};
        var subItemLineObj = {};
        var countDuplicate = 0;
        var countDuplicateItemLine = 0;
        // var merge = {}

        for (var i = 0; i < returnAuthSearch.length; i++) {
            var internalId = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[26]);
            var docNum = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[0]);
            var date = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[1]);
            var customerName = returnAuthSearch[i].getText(returnAuthSearch[i].columns[2]);
            var baikRusak = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[3]);
            var itemAmount = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[5]);
            var group = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[7]);
            var salesRep = returnAuthSearch[i].getText(returnAuthSearch[i].columns[8]);
            var docNumReturnCustomer = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[9]);
            var item = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[11]);
            var itemText = returnAuthSearch[i].getText(returnAuthSearch[i].columns[11]);
            var qtyCartonFulfill = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[12]);
            var qtyPcsFulfill = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[13]);
            var bonusCtn = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[14]);
            var bonusPcs = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[15]);
            var rateBeforeDics = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[16]);
            var expireDate = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[19]);
            var alasanRetur = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[20]);
            var amountNet = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[27]);
            var discA1 = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[28]);
            var discA1a = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[29]);
            var discA1b = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[30]);
            var discA2 = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[31]);
            var discA2a = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[32]);
            var discA2b = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[33]);
            var discA3 = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[34]);
            var discA3a = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[35]);
            var discA3b = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[36]);
            var discB1a = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[37]);
            var discB1 = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[38]);
            var discB2a = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[39]);
            var discB2 = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[40]);
            var discB3a = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[41]);
            var discB3 = returnAuthSearch[i].getValue(returnAuthSearch[i].columns[42]);

            log.debug("docnum", docNum);

            // if (!dataSetObj.docNum) {
            // dataSetObj = {
            //    docNum: docNum,
            //    date: date,
            //    customer_name: customerName,
            //    item_line: [],
            // };
            // if (dataSet.length == 0) {
            //    // dataSetObj = {
            //    //    docNum: docNum,
            //    //    date: date,
            //    //    customer_name: customerName,
            //    //    item_line: [],
            //    // };
            //    // dataSet.push(dataSetObj);

            // } else {
            for (var p = 0; p < dataSet.length; p++) {
                if (dataSet[p].docNum == docNum) {
                    countDuplicate++;
                }
            }
            for (var x = 0; x < dataSet2.length; x++) {
                if (dataSet2[x].docNumReturnCustomer == docNumReturnCustomer) {
                    countDuplicateItemLine++;
                }
            }

            // }
            // }
            if (countDuplicate == 0) {
                dataSetObj[internalId] = {
                    docNum: docNum,
                    date: date,
                    customer_name: customerName,
                    total: 0,
                    paid: 0,
                    balance: 0,
                    no_dpp_ppn: "",
                    item_line: [],
                };
                dataSet.push(dataSetObj);
                dataSetObjList[internalId] = Object.assign({}, dataSetObj[internalId])

            }
            countDuplicate = 0

            if (countDuplicateItemLine == 0) {
                itemLineObj[internalId] = {
                    docNum: docNum,
                    docNumReturnCustomer: docNumReturnCustomer,
                    // item: itemText,
                    baik_rusak: baikRusak,
                    group: group,
                    sales_rep: salesRep,
                    ext_int: 0,
                    netto: 0,
                    ppn: 0,
                    tanggal_faktur_pajak: "",
                    nomor_faktur_pajak: "",
                    sub_item_line: [],
                }
                dataSet2.push(itemLineObj);
                dataSet2ObjList[docNumReturnCustomer + "_" + internalId] = Object.assign({}, itemLineObj[internalId]);
            }
            countDuplicateItemLine = 0;

            // if(!subItemLineObj[item]){
            subItemLineObj[internalId] = {
                docNum: docNum,
                item: itemText,
                docNumReturnCustomer: docNumReturnCustomer,
                qtyCartonFulfill: qtyCartonFulfill,
                qtyPcsFulfill: qtyPcsFulfill,
                bonusCtn: bonusCtn == "" ? 0 : bonusCtn,
                bonusPcs: bonusPcs == "" ? 0 : bonusPcs,
                rateBeforeDics: rateBeforeDics,
                expireDate: expireDate,
                alasanRetur: alasanRetur,
                amount_net: Math.abs(amountNet),
                discA1: discA1,
                discA1a: discA1a,
                discA1b: discA1b,
                discA2: discA2,
                discA2a: discA2a,
                discA2b: discA2b,
                discA3: discA3,
                discA3a: discA3a,
                discA3b: discA3b,
                discB1a: discB1a,
                discB1: discB1,
                discB2a: discB2a,
                discB2: discB2,
                discB3a: discB3a,
                discB3: discB3,
            }
            dataSet3.push(subItemLineObj);
            dataSet3ObjList[item + "_" + internalId] = Object.assign({}, subItemLineObj[internalId]);
            // itemLineObj[docNumReturnCustomer].sub_item_line.push(subItemLineObj[item]);
            // }

            // if (condition) {

            // }

        }
        log.debug("dataset", dataSet);
        log.debug("dataSet3ObjList", dataSet3ObjList);

        for (const key in dataSet2ObjList) {
            for (const key1 in dataSet3ObjList) {
                if (dataSet2ObjList[key].docNum == dataSet3ObjList[key1].docNum) {
                    dataSet2ObjList[key].sub_item_line.push(dataSet3ObjList[key1]);
                }
            }

        }

        for (const key in dataSetObjList) {
            for (const key1 in dataSet2ObjList) {
                if (dataSetObjList[key].docNum == dataSet2ObjList[key1].docNum) {
                    dataSetObjList[key].item_line.push(dataSet2ObjList[key1]);
                }
            }

        }

        var getCreditMemo = searchCreditMemo("dummy");
        var getInvoiceApplyingCreditMemo = searchInvoiceApplyingToCreditMemo(getCreditMemo);
        var getInvoice = searchInvoices(getCreditMemo);
        log.debug("getcreditmemo", getCreditMemo);
        var merged = merge(getCreditMemo, getInvoiceApplyingCreditMemo, getInvoice, dataSetObjList);



        // for (var o = 0; o < dataSet2.length; o++) {
        //    for (var p = 0; p < dataSet3.length; p++) {
        //       if (dataSet2[o].docNum == dataSet3[p].docNum) {
        //          dataSet2[o].sub_item_line.push(dataSet3[p]);
        //       } else {
        //          continue;
        //       }
        //    }
        // }
        // for (var o = 0; o < dataSet.length; o++) {
        //    for (var p = 0; p < dataSet2.length; p++) {
        //       if (dataSet[o].docNum == dataSet2[p].docNum) {
        //          dataSet[o].item_line.push(dataSet2[p]);
        //       } else {
        //          continue;
        //       }
        //    }
        // }

        // var data1 = [];
        // var data2 = [];

        // for (var t = 0; t < dataSet.length; t++) {
        //    data1.push(dataSet[t])
        // }
        // for (var c = 0; c < dataSet2.length; c++) {
        //    data2.push(dataSet2[c])
        // }

        // log.debug("data1", data1);
        // log.debug("data2", data2);

        // var listIterated = [];
        // var boolIterated = false;

        // for (var p = 0; p < dataSet.length; p++) {
        //    listIterated.push(dataSet[p].docNum);
        //    for (var a = 0; a < listIterated.length; a++) {
        //       if (dataSet[p].docNum == listIterated) {
        //          continue;
        //       } else {
        //          for (var k = 0; k < dataSet2.length; k++) {
        //             if (dataSet[p].docNum == dataSet2[k].docNum) {
        //                dataSet[p].item_line.push(dataSet2[k]);
        //             }
        //          }
        //       }
        //    }
        // }


        // var m = 0;
        // var o = m + 1;


        // while (m < dataSet.length && o < dataSet2.length) {
        //    if (dataSet[m].docNum == dataSet2[o].docNum) {
        //       dataSet[m].item_line.push(dataSet2[o]);
        //       listIterated.push(dataSet[m].docNum);
        //       if (o < dataSet2.length) {
        //          o++;
        //       } else {
        //          for (var l = 0; l < listIterated.length; l++) {
        //             if (listIterated[l] == dataSet[m].docNum) {
        //                m++;
        //             }
        //          }
        //       }
        //    }
        // }



        // for (var p = 0; p < dataSet.length; p++) {
        //    for (var k = 0; k < dataSet3.length; k++) {
        //       if (dataSet.docNum == dataSet2.docNum) {
        //          dataSet[p].item_line.push(dataSet2[k]);
        //       }

        //    }
        // }

        log.debug("dataset", dataSet);
        log.debug("dataset Obj List", JSON.stringify(dataSetObjList));
        // log.debug("dataset2", dataSet2);
        // log.debug("dataset3", dataSet3);

        var finalData = [];

        for (const key in dataSetObjList) {
            finalData.push(merged[key]);
        }

        log.debug("Final Data", finalData);

        var templateFile = file.load({ id: 752457 });

        var renderer = render.create();

        renderer.templateContent = templateFile.getContents();

        // ==================== Start Olah Data ===================== //
        // Yang dibutuhkan untuk Printout

        renderer.addCustomDataSource({
            alias: "Record",
            format: render.DataSource.JSON,
            data: JSON.stringify({
                data: finalData
            }),
        });


        // ==================== Akhir Olah Data ===================== //

        //================ Start PrintOut ======================//


        var xml = renderer.renderAsString().replace(/&(?!(#\\d+|\\w+);)/g, "&amp;$1");;

        log.debug("xml", xml)
        log.debug("renderer exist", renderer);

        var pdf = render.xmlToPdf({
            xmlString: xml
        });

        // var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

        pdf.name = "Report Transfer Order from.pdf";
        context.response.writeFile(pdf, false);


    }

    return {
        onRequest: onRequest
    }
});

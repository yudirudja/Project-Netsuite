//@ts-check
/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
// @ts-ignore
define(["N/runtime", "N/log", "N/ui/serverWidget", "N/format", "N/search", "N/config", "N/task", "N/file"],
    function (runtime, log, serverWidget, format, search, config, task, file) {

        const FORM_COMPONENT_IDS = {
            fieldgroupid: 'fieldgroupid',
            custpage_startdate: 'custpage_startdate',
            custpage_enddate: 'custpage_enddate',
            custpage_type: 'custpage_type',
            // custpage_bynomorfaktur: 'custpage_bynomorfaktur',
            custpage_fld_vendor: 'custpage_fld_vendor',
            custpage_filtertglproses: 'custpage_filtertglproses',
            custpage_sebagaiacuan: 'custpage_sebagaiacuan',
            custpage_startnomor: 'custpage_startnomor',
            custpage_endnomor: 'custpage_endnomor',
            custpage_depo: 'custpage_depo',
            custpage_trxlist: 'custpage_trxlist',
            custpage_inv_start: 'custpage_inv_start',
            custpage_inv_end: 'custpage_inv_end',
        };
        const LIST_VALUE_TYPE_PENARIKAN = [
            { value: '', text: '' },
            { value: '1', text: 'Lapor DJP ' },
            { value: '2', text: 'Sebagai Acuan' }
        ];
        const LIST_VALUE_TYPE = [
            { value: '', text: '' },
            { value: '1', text: 'Keluaran' },
            { value: '2', text: 'Keluaran Lainnya' },
            { value: '3', text: 'Retur Keluaran' },
            { value: '4', text: 'Masukan' },
            { value: '5', text: 'Masukan Lainnya' },
            { value: '6', text: 'Retur Masukan' },
        ];
        const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const FORM_INV_INVENTORY = ['134']; // customform: ME - Invoice = 117 SB, 134 PROD
        const PRODUK_HADIAH = ['41', '71'] // customlist: ME - Produk : 97 - HADIAH = 41 SB & PROD, ME - Produk : 98 - Hadiah = 71 PROD

        function getForm() {
            var form = serverWidget.createForm('Export XML CoreTax');
            form.addFieldGroup({ id: FORM_COMPONENT_IDS.fieldgroupid, label: 'Parameter XML CoreTax' });

            var startdate = form.addField({
                id: FORM_COMPONENT_IDS.custpage_startdate,
                type: serverWidget.FieldType.DATE,
                label: "Start Date",
                container: 'fieldgroupid'
            });
            // startdate.isMandatory = true;

            var enddate = form.addField({
                id: FORM_COMPONENT_IDS.custpage_enddate,
                type: serverWidget.FieldType.DATE,
                label: "End Date",
                container: FORM_COMPONENT_IDS.fieldgroupid
            });
            // enddate.isMandatory = true;

            // var depo = form.addField({
            //     id: FORM_COMPONENT_IDS.custpage_depo,
            //     type: serverWidget.FieldType.SELECT,
            //     label: "Depo",
            //     source: "customlist_me_clist_location",
            //     container: FORM_COMPONENT_IDS.fieldgroupid
            // });

            // var filtertglproses = form.addField({
            //     id: FORM_COMPONENT_IDS.custpage_filtertglproses,
            //     type: serverWidget.FieldType.CHECKBOX,
            //     label: "Filter Tanggal Proses",
            //     container: FORM_COMPONENT_IDS.fieldgroupid
            // });

            // var startnomor = form.addField({
            //     id: FORM_COMPONENT_IDS.custpage_startnomor,
            //     type: serverWidget.FieldType.TEXT,
            //     label: "Filter End Start",
            //     container: FORM_COMPONENT_IDS.fieldgroupid
            // });
            // var endnomor = form.addField({
            //     id: FORM_COMPONENT_IDS.custpage_endnomor,
            //     type: serverWidget.FieldType.TEXT,
            //     label: "Filter End Nomor",
            //     container: FORM_COMPONENT_IDS.fieldgroupid
            // });

            var currentDateDMYhm = new Date(); //currentDate output: 2024/3/7 04:55:19
            var currentDateDMYhmText = format.format({ type: format.Type.DATETIME, value: currentDateDMYhm });
            //currentDateDMYhmText output: 2024/3/7 11:55:19 (+7 karena timezone preference user Asia/Bangkok)
            var currentDateDMY = format.parse({ type: 'date', value: currentDateDMYhmText.substring(0, currentDateDMYhmText.indexOf(' ')) });
            //currentDateDMY output: 2024/3/7  (tidak +7 lagi karena hanya provide string tanggal)
            // currentDateDMY.setDate(1); startdate.defaultValue = currentDateDMY;
            // currentDateDMY.setMonth(currentDateDMY.getMonth() + 1); currentDateDMY.setDate(0); enddate.defaultValue = currentDateDMY;

            // var trxlist = form.addField({
            //     id: FORM_COMPONENT_IDS.custpage_trxlist,
            //     type: serverWidget.FieldType.MULTISELECT,
            //     label: "List Transaksi",
            //     // source: "transaction",
            //     container: 'fieldgroupid'
            // });

            var startNumber = form.addField({
                id: 'custpage_inv_start',
                type: serverWidget.FieldType.SELECT,
                source: 'invoice',
                label: "Invoice Start"
            });
            // endNumber.isMandatory = true;
            var endNumber = form.addField({
                id: 'custpage_inv_end',
                type: serverWidget.FieldType.SELECT,
                source: 'invoice',
                label: "Invoice End"
            });

            var includeProforma = form.addField({
                id: 'custpage_check_proforma',
                type: serverWidget.FieldType.CHECKBOX,
                label: "Includes Proforma"
            });

            // form.addField({
            //     id: FORM_COMPONENT_IDS.custpage_fld_vendor,
            //     type: serverWidget.FieldType.MULTISELECT,
            //     label: "Vendor",
            //     source: "vendor",
            //     container: FORM_COMPONENT_IDS.fieldgroupid
            // });
            return form;
        }

        function addZero(string) {

            if (string) {
                let strLength = string.length
                let addAmountOfZero = 21 - strLength

                for (let i = 0; i <= addAmountOfZero; i++) {
                    string += "0";

                }

            }

            return string
        }

        function pointZeroToZero(number) {

            if (number == '.00') {
                return 0
            }
            return number
        }

        function exportFakturKeluaran(context, tin, paramsObj) {

            let result = new Array()

            let filter = [
                ["type", "anyof", "CustInvc"],
                "AND",
                ["mainline", "is", "F"],
                "AND",
                ["taxline", "is", "F"],
                "AND",
                ["cogs", "is", "F"],
                "AND",
                ["shipping", "is", "F"],
                "AND",
                ["customgl", "is", "F"],
                "AND",
                [[["currency", "anyof", "5"]], "OR", [["currency", "anyof", "1"], "AND", ["custbody_me_bounded_zone", "anyof", "1"]]],
                "AND",
                ["custbody_me_upload_xml", "is", "F"]
            ]

            if (paramsObj.invStart && paramsObj.invEnd) {
                filter.push("AND",
                    ["internalidnumber", "between", paramsObj.invStart, paramsObj.invEnd],)
            }
            if (paramsObj.startDate && paramsObj.endDate) {
                filter.push("AND",
                    ["trandate", "within", paramsObj.startDate, paramsObj.endDate],)
            }
            if (paramsObj.isCheckedProforma == true || paramsObj.isCheckedProforma == 'T'|| paramsObj.isCheckedProforma == 'true') {
                filter.push("AND",
                    ["custbody_me_proforma_final", "anyof", "2", "1"],)
            } else {
                filter.push("AND",
                    ["custbody_me_proforma_final", "anyof", "2"],)
            }

            var fpS = search.create({
                type: "transaction",
                filters: filter,
                columns:
                    [
                        search.createColumn({
                            name: "formulatext",
                            formula: "TO_CHAR({trandate}, 'YYYY-MM-DD')",
                            label: "TaxInvoiceDate"
                        }),
                        search.createColumn({
                            name: "custentity_me_trx_code",
                            join: "customer",
                            label: "TrxCode"
                        }),
                        search.createColumn({
                            name: "custentity_me_keterangan_tambahan",
                            join: "customer",
                            label: "AddInfo"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "''",
                            label: "CustomDoc"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "SUBSTR({transactionname}, INSTR({transactionname}, '#') +1)",
                            label: "RefDesc"
                        }),
                        search.createColumn({
                            name: "custentity_me_cap_fasilitas",
                            join: "customer",
                            label: "FacilityStamp"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "''",
                            label: "SellerIDTKU"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "case when {customer.custentity_me_jenis_id_pembeli} like '%TIN%' then REGEXP_REPLACE({customer.vatregnumber}, '[^a-zA-Z0-9]+', '') else '0000000000000000' end",
                            label: "BuyerTin"
                        }),
                        search.createColumn({
                            name: "custentity_me_jenis_id_pembeli",
                            join: "customer",
                            label: "BuyerDocument"
                        }),
                        search.createColumn({
                            name: "custentity_me_country",
                            join: "customer",
                            label: "BuyerCountry"
                        }),
                        search.createColumn({
                            name: "custentity_me_buyer_document_number",
                            join: "customer",
                            label: "BuyerDocumentNumber"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "{customer.companyname}||{customer.firstname} || {customer.lastname}",
                            label: "BuyerName"
                        }),
                        search.createColumn({
                            name: "custentity_me_cust_alamat_npwp",
                            join: "customer",
                            label: "BuyerAddress"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "''",
                            label: "BuyerEmail"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "case when {customer.custentity_me_jenis_id_pembeli} like '%TIN%' then REGEXP_REPLACE({customer.vatregnumber}, '[^a-zA-Z0-9]+', '') else '0000000000000000' end",
                            label: "BuyerIDTKU"
                        }),
                        search.createColumn({
                            name: "custitem_me_opt",
                            join: "item",
                            label: "OPT(Line)"
                        }),
                        search.createColumn({
                            name: "custitem_me_hs_code",
                            join: "item",
                            label: "Code(Line)"
                        }),
                        search.createColumn({ name: "displayname", join: "item", label: "Name(Line)" }),
                        search.createColumn({
                            name: "custitem_me_satuan_ukur",
                            join: "item",
                            label: "Unit(Line)"
                        }),
                        search.createColumn({
                            name: "formulacurrency",
                            formula: "case when {currency} like '%IDR%' then {custcol_me_unit_price_bounded_zone} when {currency} like '%USD%' and {custbody_me_bounded_zone} like 'Yes' and {custcol_me_unit_price_bounded_zone}>0 then {custcol_me_unit_price_bounded_zone} end",
                            label: "Price"
                        }),
                        search.createColumn({ name: "quantity", label: "Qty" }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "0",
                            label: "Total Discount"
                        }),
                        search.createColumn({ name: "custcol_me_faktur_pajak_bounded_zone", label: "TaxBase" }),
                        search.createColumn({ name: "custcol_me_dpp_nilai_lain", label: "OtherTaxBase" }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "12",
                            label: "VATRate"
                        }),
                        search.createColumn({
                            name: "formulacurrency",
                            formula: "case when {currency} like '%IDR%' then {custcol_me_ppn_idr} when {currency} like '%USD%' and {custbody_me_bounded_zone} like 'Yes' then {custcol_me_ppn_idr} end",
                            label: "VAT"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "0",
                            label: "STLGRate"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "0",
                            label: "STLG"
                        }),
                        search.createColumn({
                            name: "internalid", label: "Internal ID"
                        }),
                    ]
            });
            log.debug("fpS", fpS)

            var startRow = 0

            do {
                var fpSR = fpS.run().getRange(startRow, startRow + 1000);
                for (let i = 0; i < fpSR.length; i++) {
                    let TaxInvoiceDate = fpSR[i].getValue(fpSR[i].columns[0]);
                    let TrxCode = fpSR[i].getText(fpSR[i].columns[1]);
                    let AddInfo = fpSR[i].getText(fpSR[i].columns[2]);
                    let CustomDoc = fpSR[i].getValue(fpSR[i].columns[3]);
                    let RefDesc = fpSR[i].getValue(fpSR[i].columns[4]);
                    let FacilityStamp = fpSR[i].getValue(fpSR[i].columns[5]);
                    let SellerIDTKU = fpSR[i].getValue(fpSR[i].columns[6]);
                    let BuyerTin = fpSR[i].getValue(fpSR[i].columns[7]);
                    let BuyerDocument = fpSR[i].getText(fpSR[i].columns[8]);
                    let BuyerCountry = fpSR[i].getText(fpSR[i].columns[9]);
                    let BuyerDocumentNumber = fpSR[i].getValue(fpSR[i].columns[10]);
                    let BuyerName = fpSR[i].getValue(fpSR[i].columns[11]);
                    let BuyerAddress = fpSR[i].getValue(fpSR[i].columns[12]);
                    let BuyerEmail = fpSR[i].getValue(fpSR[i].columns[13]);
                    let BuyerIDTKU = fpSR[i].getValue(fpSR[i].columns[14]);
                    let OPT = fpSR[i].getText(fpSR[i].columns[15]);
                    let Code = fpSR[i].getValue(fpSR[i].columns[16]);
                    let Name = fpSR[i].getValue(fpSR[i].columns[17]);
                    let Unit = fpSR[i].getText(fpSR[i].columns[18]);
                    let Price = fpSR[i].getValue(fpSR[i].columns[19]);
                    let Qty = fpSR[i].getValue(fpSR[i].columns[20]);
                    let TotalDiscount = fpSR[i].getValue(fpSR[i].columns[21]);
                    let TaxBase = fpSR[i].getValue(fpSR[i].columns[22]);
                    let OtherTaxBase = fpSR[i].getValue(fpSR[i].columns[23]);
                    let VATRate = fpSR[i].getValue(fpSR[i].columns[24]);
                    let VAT = fpSR[i].getValue(fpSR[i].columns[25]);
                    let STLGRate = fpSR[i].getValue(fpSR[i].columns[26]);
                    let STLG = fpSR[i].getValue(fpSR[i].columns[27]);
                    let internalId = fpSR[i].getValue(fpSR[i].columns[28]);

                    let getIndexDuplicate = result.findIndex((data) => data.RefDesc == RefDesc)

                    if (getIndexDuplicate == -1) {
                        result.push({
                            internalId: internalId,
                            TaxInvoiceDate: TaxInvoiceDate,
                            TrxCode: TrxCode,
                            AddInfo: AddInfo,
                            CustomDoc: CustomDoc,
                            RefDesc: RefDesc,
                            FacilityStamp: FacilityStamp,
                            SellerIDTKU: SellerIDTKU,
                            BuyerTin: BuyerTin,
                            BuyerDocument: BuyerDocument,
                            BuyerCountry: BuyerCountry,
                            BuyerDocumentNumber: BuyerDocumentNumber,
                            BuyerName: BuyerName,
                            BuyerAddress: BuyerAddress,
                            BuyerEmail: BuyerEmail,
                            BuyerIDTKU: BuyerIDTKU,
                            line: [
                                {
                                    OPT: OPT,
                                    Code: Code,
                                    Name: Name,
                                    Unit: Unit,
                                    Price: Price,
                                    Qty: Qty,
                                    TotalDiscount: TotalDiscount,
                                    TaxBase: TaxBase,
                                    OtherTaxBase: OtherTaxBase,
                                    VATRate: VATRate,
                                    VAT: VAT,
                                    STLGRate: STLGRate,
                                    STLG: STLG,
                                }
                            ],
                        });
                    } else {
                        result[getIndexDuplicate].line.push({
                            OPT: OPT,
                            Code: Code,
                            Name: Name,
                            Unit: Unit,
                            Price: Price,
                            Qty: Qty,
                            TotalDiscount: TotalDiscount,
                            TaxBase: TaxBase,
                            OtherTaxBase: OtherTaxBase,
                            VATRate: VATRate,
                            VAT: VAT,
                            STLGRate: STLGRate,
                            STLG: STLG,
                        });
                    }
                };

                startRow += 1000;
            } while (fpSR.length === 1000);

            executeMapReduce(result)

            log.debug("result", result)

            let xmlString = `<?xml version="1.0" encoding="utf-8" ?>
            <TaxInvoiceBulk xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="TaxInvoice.xsd">
            <TIN>${tin}</TIN>
            <ListOfTaxInvoice>`

            for (let i = 0; i < result.length; i++) {
                xmlString += `<TaxInvoice>
                        <TaxInvoiceDate>${result[i].TaxInvoiceDate}</TaxInvoiceDate>
                        <TaxInvoiceOpt>Normal</TaxInvoiceOpt>
                        <TrxCode>${result[i].TrxCode}</TrxCode>
                        <AddInfo>${result[i].AddInfo}</AddInfo>
                        <CustomDoc>${result[i].CustomDoc}</CustomDoc>
                        <RefDesc>${result[i].RefDesc}</RefDesc>
                        <FacilityStamp>${result[i].FacilityStamp}</FacilityStamp>
                        <SellerIDTKU>${addZero(tin)}</SellerIDTKU>
                        <BuyerTin>${result[i].BuyerTin}</BuyerTin>
                        <BuyerDocument>${result[i].BuyerDocument}</BuyerDocument>
                        <BuyerCountry>${result[i].BuyerCountry}</BuyerCountry>
                        <BuyerDocumentNumber>${result[i].BuyerDocumentNumber}</BuyerDocumentNumber>
                        <BuyerName>${result[i].BuyerName}</BuyerName>
                        <BuyerAdress>${result[i].BuyerAddress}</BuyerAdress>
                        <BuyerEmail>${result[i].BuyerEmail}</BuyerEmail>
                        <BuyerIDTKU>${addZero(result[i].BuyerIDTKU)}</BuyerIDTKU>
                        <ListOfGoodService>`

                for (let j = 0; j < result[i].line.length; j++) {
                    xmlString += `<GoodService>
                                <Opt>${result[i].line[j].OPT}</Opt>
                                <Code>${result[i].line[j].Code}</Code>
                                <Name>${result[i].line[j].Name}</Name>
                                <Unit>${result[i].line[j].Unit}</Unit>
                                <Price>${pointZeroToZero(result[i].line[j].Price)}</Price>
                                <Qty>${result[i].line[j].Qty}</Qty>
                                <TotalDiscount>${pointZeroToZero(result[i].line[j].TotalDiscount)}</TotalDiscount>
                                <TaxBase>${pointZeroToZero(result[i].line[j].TaxBase)}</TaxBase>
                                <OtherTaxBase>${pointZeroToZero(result[i].line[j].OtherTaxBase)}</OtherTaxBase>
                                <VATRate>${result[i].line[j].VATRate}</VATRate>
                                <VAT>${pointZeroToZero(result[i].line[j].VAT)}</VAT>
                                <STLGRate>${result[i].line[j].STLGRate}</STLGRate>
                                <STLG>${result[i].line[j].STLG}</STLG>
                            </GoodService>`
                }
                xmlString += `
                        </ListOfGoodService>
                        </TaxInvoice>`;
            }
            xmlString += `</ListOfTaxInvoice></TaxInvoiceBulk>`


            let formatedXml = escapeXML(xmlString)

            let titleXml = "e-Faktur Keluaran"

            var xmlFile = file.create({
                name: titleXml + '.xml',
                fileType: file.Type.XMLDOC,
                contents: formatedXml
            });

            context.response.writeFile({
                file: xmlFile,
                // file: zipFile,
                // file: pdfFile,
                isInline: false
            });

        }

        function executeMapReduce(param) {

            var scriptTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: "customscript_me_mr_sl_efaktur_page",//belum dibuat Map Reduce
                deploymentId: "customdeploy_me_mr_sl_efaktur_page",//Belum Dibuat Map Reduce
                params: {
                    'custscript_me_mr_sl_efaktur_page_params': JSON.stringify(param),
                }
            });

            var scriptTaskId = scriptTask.submit();

            log.debug("scriptTaskId", scriptTaskId);

        }

        function onRequest(context) {
            var scriptObj = runtime.getCurrentScript();
            var form = getForm();
            // form.clientScriptModulePath = 'SuiteScripts/Metrodata/coretax_efaktur/me_cs_efaktur_coretax.js'; // replace with your actual client script path
            if (context.request.method === 'GET') {
                form.addSubmitButton({ label: 'Export' });
                context.response.writePage(form);
            } else {
                log.audit("onRequest: START TIME", format.format({ type: "datetime", value: new Date(), timezone: "ASIA/BANGKOK" }));
                let startDate = context.request.parameters.custpage_startdate;
                let endDate = context.request.parameters.custpage_enddate;
                let invStart = context.request.parameters.custpage_inv_start;
                let invEnd = context.request.parameters.custpage_inv_end;
                let isCheckedProforma = context.request.parameters.custpage_check_proforma;
                // let bynomorfaktur = context.request.parameters.custpage_bynomorfaktur;
                // let trxlist = context.request.parameters.custpage_trxlist.split("\u0005");

                // log.debug("trxlist", trxlist);

                // let startnomor = context.request.parameters.custpage_startnomor;
                // let endnomor = context.request.parameters.custpage_endnomor;
                let paramsObj = {
                    startDate: startDate,
                    endDate: endDate,
                    invStart: invStart,
                    invEnd: invEnd,
                    isCheckedProforma: isCheckedProforma,
                }; log.debug("paramsObj", paramsObj);

                // let formatted_startDate = format.parse({
                //     type: format.Type.DATE,
                //     value: startDate
                // });
                let fileWritten = null;

                var companyinfo = config.load({
                    type: config.Type.COMPANY_INFORMATION
                });

                var tin = companyinfo.getValue("employerid");
                fileWritten = exportFakturKeluaran(context, tin, paramsObj);


                log.audit("onRequest: END TIME", format.format({ type: "datetime", value: new Date(), timezone: "ASIA/BANGKOK" }));
                return;
            }

            log.debug('Remaining governance Total : ' + scriptObj.getRemainingUsage());
            return;
        }



        function escapeXML(string) {
            string = string.replace(/&/g, '&amp');
            // string = string.replace(/&/g, '&gt');
            // string = string.replace(/>/g, '&lt');
            // string = string.replace(/'/g, '&apos');
            // string = string.replace(/"/g, '&quot');
            return string;
        }


        function formatDate(currentDate) {
            //currentDate output: 2024/3/7 04:55:19
            currentDate = format.format({
                type: format.Type.DATETIME,
                value: currentDate
            });
            //currentDate output: 2024/3/7 11:55:19 (+7 karena timezone preference user Asia/Bangkok)
            currentDate = format.parse({
                type: 'date',
                value: currentDate.substring(0, currentDate.indexOf(' '))
            });
            //currentDate output: 2024/3/7  (tidak +7 lagi karena hanya provide string tanggal)

            return currentDate;
        }

        return {
            onRequest: onRequest
        }
    });

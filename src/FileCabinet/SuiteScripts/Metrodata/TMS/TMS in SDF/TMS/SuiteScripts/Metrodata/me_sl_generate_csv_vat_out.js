/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/redirect", "N/ui/serverWidget", "N/task", "N/search", './config/me_config_yudi.js', 'N/file', 'N/url'],
    function (redirect, serverWidget, task, search, config, file, url) {


        function removeLineBreak(str) {
            let newstr = "";
            for (let i = 0; i < str.length; i++) {
                if (!(str[i] == "\n" || str[i] == "\r")) {
                    newstr += str[i];
                }
            }

            var removeComma = newstr.replace(/,/g, '')
            log.debug('newstr', removeComma)
            return removeComma;
        }

        function searchDataCsv(params) {

            var header = [];
            var line = [];
            var result = [];

            var filter = [
                ["type", "anyof", "CustInvc"],
                "AND",
                ["taxline", "is", "F"],
                "AND",
                ["custbody_me_nomor_faktur_pajak_sales", "doesnotcontain", "canceled"],
                "AND",
                ["custbody_me_status_faktur_pajak", "anyof", "1"],
                "AND",
                ["taxline", "is", "F"],
                "AND",
                ["cogs", "is", "F"],
                "AND",
                ["custbody_me_proforma_final", "anyof", "2"],
                "AND",
                ["custbody_me_sales_category", "noneof", "4", "3"]
            ]

            if (params.inv_start && params.inv_end) {
                filter.push("AND",
                    ["internalidnumber", "between", params.inv_start, params.inv_end],)
            }
            if (params.start_date && params.end_date) {
                filter.push("AND",
                    ["trandate", "within", params.start_date, params.end_date],)
            }

            var invoiceSearchObj = search.create({
                type: "invoice",
                filters: filter,
                columns:
                    [
                        search.createColumn({ name: "transactionname", label: "Transaction Name" }),
                        search.createColumn({ name: "mainline", label: "*" }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "SUBSTR({custbody_me_kode_obyek_pajak}, 0,2)",
                            label: "KD_Jenis Transaksi"
                        }),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "case when {custbody_me_status_faktur_pajak} like 'Normal' then 0 else 1 end",
                            label: "FG_Pengganti"
                        }),
                        search.createColumn({ name: "custbody_me_nomor_faktur_pajak_sales", label: "Nomor_faktur" }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "SUBSTR({trandate}, INSTR({trandate}, '/') + 1, INSTR({trandate}, '/', 1, 2) - INSTR({trandate}, '/') - 1 )",
                            label: "Masa_Pajak"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "SUBSTR({trandate}, INSTR({trandate}, '/', -1) + 1)",
                            label: "Tahun_Pajak"
                        }),
                        search.createColumn({ name: "trandate", label: "Tanggal_faktur" }),
                        search.createColumn({
                            name: "vatregnumber",
                            join: "customer",
                            label: "NPWP"
                        }),
                        search.createColumn({
                            name: "formulatext",
                            formula: "case when {customer.companyname} is not null then {customer.companyname} else {customer.firstname} || ' ' || {customer.lastname} end",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "address",
                            join: "customer",
                            label: "Alamat_lengkap"
                        }),
                        search.createColumn({ name: "custbody_me_tot_dpp", label: "ME - Total Dpp" }),
                        search.createColumn({ name: "custbody_me_tot_ppn", label: "ME - Total Ppn" }),
                        search.createColumn({ name: "tranid", label: "Referensi" }),
                        search.createColumn({
                            name: "custentity_me_jalan_csv_vat_out",
                            join: "customer",
                            label: "ME - JALAN"
                        }),
                        search.createColumn({
                            name: "custentity_me_blok_csv_vat_out",
                            join: "customer",
                            label: "ME - BLOK"
                        }),
                        search.createColumn({
                            name: "custentity_me_nomor_csv_vat_out",
                            join: "customer",
                            label: "ME - Nomor"
                        }),
                        search.createColumn({
                            name: "custentity_me_rt_csv_vat_out",
                            join: "customer",
                            label: "ME - RT"
                        }),
                        search.createColumn({
                            name: "custentity_me_rw_csv_vat_out",
                            join: "customer",
                            label: "ME - RW"
                        }),
                        search.createColumn({
                            name: "custentity_me_kecamatan_csv_vat_out",
                            join: "customer",
                            label: "ME - KECAMATAN"
                        }),
                        search.createColumn({
                            name: "custentity_me_kelurahan_csv_vat_out",
                            join: "customer",
                            label: "ME - KELURAHAN"
                        }),
                        search.createColumn({
                            name: "custentity_me_kabupaten_csv_vat_out",
                            join: "customer",
                            label: "ME - KABUPATEN"
                        }),
                        search.createColumn({
                            name: "custentity_me_propinsi_csv_vat_out",
                            join: "customer",
                            label: "ME - PROPINSI"
                        }),
                        search.createColumn({
                            name: "custentity_me_pos_csv_vat_out",
                            join: "customer",
                            label: "ME - KODE POS"
                        }),
                        search.createColumn({
                            name: "custentity_me_notelp_csv_vat_out",
                            join: "customer",
                            label: "ME - NOMOR TELEPON"
                        }),
                        search.createColumn({ name: "item", label: "Nama_Item" }),
                        search.createColumn({ name: "custcol_me_unit_price_bounded_zone", label: "Harga_Satuan" }),
                        search.createColumn({ name: "quantity", label: "Jumlah_barang" }),
                        search.createColumn({
                            name: "formulacurrency",
                            formula: "{custcol_me_faktur_pajak_bounded_zone}",
                            label: "Harga Total"
                        }),
                        search.createColumn({ name: "custcol_me_faktur_pajak_bounded_zone", label: "DPP" }),
                        search.createColumn({ name: "custcol_me_ppn_idr", label: "PPN" })
                    ]
            });

            var startrow = 0;

            do {
                var toResult = invoiceSearchObj.run().getRange({
                    start: startrow,
                    end: startrow + 1000
                });

                for (let i = 0; i < toResult.length; i++) {
                    var id = toResult[i].getValue(toResult[i].columns[0]);
                    var name = toResult[i].getText(toResult[i].columns[0]);
                    var mainline = toResult[i].getValue(toResult[i].columns[1]);
                    var kd_jenis_transaksi = toResult[i].getValue(toResult[i].columns[2]);
                    var fg_pengganti = toResult[i].getValue(toResult[i].columns[3]);
                    var nomor_faktur = toResult[i].getValue(toResult[i].columns[4]);
                    var masa_pajak = toResult[i].getValue(toResult[i].columns[5]);
                    var tahun_pajak = toResult[i].getValue(toResult[i].columns[6]);
                    var tanggal_faktur = toResult[i].getValue(toResult[i].columns[7]);
                    var npwp = toResult[i].getValue(toResult[i].columns[8]);
                    var cust_name = toResult[i].getValue(toResult[i].columns[9]);
                    var cust_alamat = toResult[i].getValue(toResult[i].columns[10]);
                    var jumlah_dpp = toResult[i].getValue(toResult[i].columns[11]);
                    var jumlah_ppn = toResult[i].getValue(toResult[i].columns[12]);
                    var referensi = toResult[i].getValue(toResult[i].columns[13]);
                    var cust_jalan = toResult[i].getValue(toResult[i].columns[14]);
                    var cust_blok = toResult[i].getValue(toResult[i].columns[15]);
                    var cust_nomor = toResult[i].getValue(toResult[i].columns[16]);
                    var cust_rt = toResult[i].getValue(toResult[i].columns[17]);
                    var cust_rw = toResult[i].getValue(toResult[i].columns[18]);
                    var cust_kecamatan = toResult[i].getValue(toResult[i].columns[19]);
                    var cust_kelurahan = toResult[i].getValue(toResult[i].columns[20]);
                    var cust_kabupaten = toResult[i].getValue(toResult[i].columns[21]);
                    var cust_provinsi = toResult[i].getValue(toResult[i].columns[22]);
                    var cust_kode_post = toResult[i].getValue(toResult[i].columns[23]);
                    var cust_nomor_telepon = toResult[i].getValue(toResult[i].columns[24]);
                    var nama_item = toResult[i].getText(toResult[i].columns[25]);
                    var harga_satuan = toResult[i].getValue(toResult[i].columns[26]);
                    var jumlah_barang = toResult[i].getValue(toResult[i].columns[27]);
                    var harga_total = toResult[i].getValue(toResult[i].columns[28]);
                    var dpp = toResult[i].getValue(toResult[i].columns[29]);
                    var     ppn = toResult[i].getValue(toResult[i].columns[30]);

                    if (mainline == '*') {
                        header.push({
                            id: id,
                            kd_jenis_transaksi: kd_jenis_transaksi,
                            fg_pengganti: fg_pengganti,
                            nomor_faktur: nomor_faktur,
                            masa_pajak: masa_pajak,
                            tahun_pajak: tahun_pajak,
                            tanggal_faktur: tanggal_faktur,
                            npwp: npwp,
                            cust_name: cust_name,
                            cust_alamat: removeLineBreak(cust_alamat),
                            jumlah_dpp: 0,
                            jumlah_ppn: 0,
                            referensi: referensi,

                            npwp_lt: npwp,
                            cust_name_lt: cust_name,
                            cust_jalan: cust_jalan,
                            cust_blok: cust_blok,
                            cust_nomor: cust_nomor,
                            cust_rt: cust_rt,
                            cust_rw: cust_rw,
                            cust_kecamatan: cust_kecamatan,
                            cust_kelurahan: cust_kelurahan,
                            cust_kabupaten: cust_kabupaten,
                            cust_provinsi: cust_provinsi,
                            cust_nomor_telepon: cust_nomor_telepon,
                            cust_kode_post: cust_kode_post,


                            line: [],
                        })
                    }
                    if (mainline != '*') {
                        log.debug("Line Csv",{
                            id: id,
                            kode_objek: 0,
                            nama_item: nama_item,
                            harga_satuan: harga_satuan,
                            jumlah_barang: jumlah_barang,
                            harga_total: harga_total,
                            dpp: dpp,
                            ppn: ppn,
                            tarik_ppnbm: 0,
                            ppnbm: 0,
                        })
                        line.push({
                            id: id,
                            kode_objek: 0,
                            nama_item: nama_item,
                            harga_satuan: harga_satuan,
                            jumlah_barang: Math.abs(jumlah_barang),
                            harga_total: harga_total,
                            dpp: dpp,
                            ppn: ppn,
                            tarik_ppnbm: 0,
                            ppnbm: 0,
                        })
                    }

                }

                startrow += 1000;

            } while (toResult.length === 1000);

            for (let i = 0; i < header.length; i++) {
                for (let j = 0; j < line.length; j++) {
                    if (header[i].id == line[j].id) {
                        header[i].line.push(line[j])
                    }
                }
                result.push(header[i])
            }

            for (let i = 0; i < result.length; i++) {
                var totalDpp = 0;
                var totalPpn = 0;
                for (let j = 0; j < result[i].line.length; j++) {
                    totalDpp += Number(result[i].line[j].dpp);
                    totalPpn += Number(result[i].line[j].ppn);
                    
                }

                result[i].jumlah_dpp = totalDpp;
                result[i].jumlah_ppn = totalPpn;
                
            }

            return result;

        }

        function generateCsv(data) {

            log.debug('data', data)

            var csvContent = 'FK,KD_JENIS_TRANSAKSI,FG_PENGGANTI,NOMOR_FAKTUR,MASA_PAJAK,TAHUN_PAJAK,TANGGAL_FAKTUR,NPWP,NAMA,ALAMAT_LENGKAP,JUMLAH_DPP,JUMLAH_PPN,JUMLAH_PPNBM,ID_KETERANGAN_TAMBAHAN,FG_UANG_MUKA,UANG_MUKA_DPP,UANG_MUKA_PPN,UANG_MUKA_PPNBM,REFERENSI,KODE_OBYEK_PENDUKUNG\n';
            csvContent += 'LT,NPWP,NAMA,JALAN,BLOK,NOMOR,RT,RW,KELURAHAN,KECAMATAN,KABUPATEN,PROPINSI,NOMOR_TELEPON,KODE_POS\n';
            csvContent += 'OF,KODE_OBJEK,NAMA,HARGA_SATUAN,JUMLAH_BARANG,HARGA_TOTAL,DISKON,DPP,PPN,TARIF_PPNBM,PPNBM\n';


            for (let i = 0; i < data.length; i++) {
                csvContent += 'FK,' + data[i].kd_jenis_transaksi + ',' + data[i].fg_pengganti + ',' + data[i].nomor_faktur + ',' + data[i].masa_pajak + ',' + data[i].tahun_pajak + ',' + data[i].tanggal_faktur + ',' + data[i].npwp + ',' + data[i].cust_name + ',' + data[i].cust_alamat + ',' + data[i].jumlah_dpp + ',' + data[i].jumlah_ppn + ',' + 0 + ',' + 0 + ',' + 0 + ',' + 0 + ',' + 0 + ',' + 0 + ',' + data[i].referensi + ',' + 0 + "\r\n";

                csvContent += 'LT,' + data[i].npwp_lt + ',' + data[i].cust_name_lt + ',' + data[i].cust_jalan + ',' + data[i].cust_blok + ',' + data[i].cust_nomor + ',' + data[i].cust_rt + ',' + data[i].cust_rw + ',' + data[i].cust_kelurahan + ',' + data[i].cust_kecamatan + ',' + data[i].cust_kabupaten + ',' + data[i].cust_provinsi + ',' + data[i].cust_nomor_telepon + ',' + data[i].cust_kode_post + "\r\n";

                for (let j = 0; j < data[i].line.length; j++) {

                    csvContent += 'OF,' + data[i].line[j].kode_objek + ',' + data[i].line[j].nama_item + ',' + data[i].line[j].harga_satuan + ',' + data[i].line[j].jumlah_barang + ',' + data[i].line[j].harga_total + ',' + 0 + ',' + data[i].line[j].dpp + ',' + data[i].line[j].ppn + ',' + data[i].line[j].tarik_ppnbm + ',' + data[i].line[j].ppnbm + "\r\n";

                }
            }

            var createCsv = file.create({
                name: 'VAT_OUT.csv', // Name of the file
                fileType: file.Type.CSV, // Type of the file
                contents: csvContent, // CSV content as a string
                folder: config.folder_id.csv_vat_out, // Folder ID where you want to save the file
                description: 'created in: ' + new Date() // Optional description
            });
            var fileId = createCsv.save();

            var filePath = file.load({
                id: fileId
            });

            var pathUrl = filePath.url;

            return pathUrl
        }

        function onRequest(context) {
            var form = serverWidget.createForm({
                title: 'Export CSV (PPN KELUARAN) - VAT OUT'
            });
            if (context.request.method === 'GET') {


                var startDate = form.addField({
                    id: 'custpage_start_date',
                    type: serverWidget.FieldType.DATE,
                    label: "Start Date"
                })
                // startDate.defaultValue = new Date();


                var endDate = form.addField({
                    id: 'custpage_end_date',
                    type: serverWidget.FieldType.DATE,
                    label: "End Date"
                });
                // endDate.isMandatory = true;
                // endDate.defaultValue = new Date();

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
                // endNumber.isMandatory = true;

                context.response.writePage(form);
            } else {
                var startDate = context.request.parameters.custpage_start_date;
                log.debug("startNumber", startNumber);
                var endDate = context.request.parameters.custpage_end_date;
                log.debug("endNumber", endNumber);
                var invStart = context.request.parameters.custpage_inv_start;
                var invEnd = context.request.parameters.custpage_inv_end;

                var params = {
                    start_date: startDate,
                    end_date: endDate,
                    inv_start: invStart,
                    inv_end: invEnd,
                }

                var getDataCsv = searchDataCsv(params);

                var createCsv = generateCsv(getDataCsv);

                if (createCsv) {
                    var suiteletURL = url.resolveScript({
                        scriptId: 'customscript_me_sl_csv_vat_out',
                        deploymentId: 'customdeploy_me_sl_csv_vat_out',
                        params: null
                    });
                    context.response.write("<h3>Success Download CSV File</h3><a href='" + suiteletURL + "'>Back</a><script type='text/javascript'>window.open('" + createCsv + "','_blank');</script>");
                    /*response.writeFile({
                        file : csvFile
                     });*/
                }
            }
                          form.addSubmitButton({
                    label: 'Generate'
                });
        }

        return {
            onRequest: onRequest
        }
    });

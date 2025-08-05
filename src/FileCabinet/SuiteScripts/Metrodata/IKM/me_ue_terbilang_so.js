/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function(record) {

    function numberToWordsIdr(number_) {
        var number = Number(number_).toFixed(2)
        const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];

        function terbilang(n) {
            if (n < 12) {
                return satuan[n];
            } else if (n < 20) {
                return satuan[n - 10] + " Belas";
            } else if (n < 100) {
                return satuan[Math.floor(n / 10)] + " Puluh " + satuan[n % 10];
            } else if (n < 200) {
                return "Seratus " + terbilang(n - 100);
            } else if (n < 1000) {
                return satuan[Math.floor(n / 100)] + " Ratus " + terbilang(n % 100);
            } else if (n < 2000) {
                return "Seribu " + terbilang(n - 1000);
            } else if (n < 1000000) {
                return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
            } else if (n < 1000000000) {
                return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
            } else if (n < 1000000000000) {
                return terbilang(Math.floor(n / 1000000000)) + " Milyar " + terbilang(n % 1000000000);
            } else if (n < 1000000000000000) {
                return terbilang(Math.floor(n / 1000000000000)) + " Triliun " + terbilang(n % 1000000000000);
            }
        }

        function decimalToWords(decimalPart) {
            const decimalNum = parseInt(decimalPart);  // Convert decimal string to number
            return terbilang(decimalNum).trim();  // Use terbilang function for proper formatting
        }

        const [integerPart, decimalPart] = number.toString().split(".");

        let words = terbilang(parseInt(integerPart));
        if (parseInt(decimalPart) > 0) {
            words += " koma " + decimalToWords(decimalPart);
        }

        return words.replace(/\s+/g, ' ').trim();
    }

    function afterSubmit(context) {
        let rec = context.newRecord;

        let record_load = record.load({
            type: 'salesorder',
            id: rec.id
        })
        let get_total_amount = record_load.getValue("total");
        log.debug("get_total_amount",get_total_amount)
        log.debug("get_total_amount terbilang",numberToWordsIdr(Number(get_total_amount)))

        let set_terbilang = record_load.setValue('custbody_me_nilai_terbilang', numberToWordsIdr(Number(get_total_amount)) + " Rupiah")
        record_load.save()
    }

    return {

        afterSubmit: afterSubmit
    }
});

/**
 *@NApiVersion 2.1
*@NScriptType Suitelet
*/

define(['N/search','N/ui/serverWidget','N/log','N/record', "N/runtime",'N/encode','N/render','N/file','./lib/moment.min.js'],
    function (search, serverWidget, log, record, runtime, encode, render, file, moment) {

    const FILTER = {
        print_type : 'custpage_print_type',
        monthdate : 'custpage_monthdate',
        yeardate : 'custpage_yeardate',
        business_unit : 'custpage_business_unit'
    }

    const HEADER_COLUMN = {
        description : 'Description',
        scr : 'SCR',
        cdw_1 : 'CDW 1',
        cdw_2 : 'CDW 2',
        nug_1 : 'NUG 1',
        nug_2 : 'NUG 2',
        copper_total : 'Copper Total',
        aln_1 : 'ALN 1',
        aln_2 : 'ALN 2',
        aln_3 : 'ALN 3',
        ald : 'ALD',
        al_total : 'AL Total',
        hq : 'HQ',
        tms_total : 'TMS Total'
    }

    const COANUMBER_NAME = { // TOTAL SALES

        501110 : 'SALES DOMESTIC',
        501210 : 'SALES EXPORT',
        501310 : 'SALES MATERIAL DOMESTIC',
        501410 : 'SALES MATERIAL EXPORT',
        501510 : 'SALES SIDE PRODUCT',
        501610 : 'PRODUCTION FEE',
        503110 : 'SALES RETURN',
        602110 : 'OUT MUTATION AMONG DIVISION',
        TSA: 'TOTAL SALES',

        603110: 'BEGINNING R/M',
        603210: 'RAW MATERIAL IMPORT',
        603250: 'FORWARDING, CLEARANCE EXPENSE',
        603310: 'RAW MATERIAL LOCAL',
        603410: 'IN MUTATION AMONG DIVISION',
        603610: 'ADJUSTMENT OF RAW MATERIAL',
        RMA: 'RAW MATERIAL AVAILABLE',
        603910: 'ENDING R/M',
        RMU: 'RAW MATERIAL USED',
        604110: 'BEGINNING WIP',
        CCO: 'CONVERTION COST',
        WIA: 'WORK IN PROCESS AVAILABLE',
        604910: 'ENDING WIP',
        WIU: 'WORK IN PROCESS USED',
        605110: 'BEGINNING F/G',
        605610: 'ADJUSTMENT OF FINISHED GOODS',
        FGA: 'FINISHED GOODS AVAILABLE',
        605910: 'ENDING F/G',
        601100: 'COST OF GOOD SOLD',
        GPS: 'GROSS PROFIT ON SALES',
        71: 'DIRECT SELLING COST',
        MIC: 'MARGINAL INCOME',
        78: 'INDIRECT SELLING EXPENSE',
        77: 'GENERAL & ADMINISTRATION EXPENSE',
        OPI: 'OPERATING INCOME',
        81: 'NON OPERATING INCOME',
        82: 'NON OPERATING EXPENSE',
        NIBT: 'NET INCOME BEFORE TAX',
        940101: 'CURRENT INCOME TAX',
        940201: 'DEFERED TAX',
        NIAT: 'NET INCOME AFTER TAX',
    }
    var FINALDATA_COANUMBER = {
        "COA_501110": {},
        "COA_501210": {},
        "COA_501310": {},
        "COA_501410": {},
        "COA_501510": {},

        "COA_501610": {},
        "COA_503110": {},
        "COA_602110": {},
        "COA_TSA": {},
        "COA_603110": {},

        "COA_603210": {},
        "COA_603250": {},
        "COA_603310": {},
        "COA_603410": {},
        "COA_603610": {},

        "COA_RMA": {},
        "COA_603910": {},
        "COA_RMU": {},
        "COA_604110": {},
        "COA_CCO": {},

        "COA_WIA": {},
        "COA_604910": {},
        "COA_WIU": {},
        "COA_605110": {},
        "COA_605610": {},

        "COA_FGA": {},
        "COA_605910": {},
        "COA_601100": {},
        "COA_GPS": {},
        "COA_71": {},

        "COA_MIC": {},
        "COA_78": {},
        "COA_77": {},
        "COA_OPI": {},
        "COA_81": {},

        "COA_82": {},
        "COA_NIBT": {},
        "COA_940101": {},
        "COA_940201": {},
        "COA_NIAT": {},
    }

    var checking_data = {61:{}, 68: {}}
    
    
    var arr_month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    var arr_endingdate = [31,[28,29],31,30,31,30,31,31,30,31,30,31]
    function getMonthYear(){
        var year = new Date().getFullYear()
        log.debug('year', year)
        var arr_year = []

        for(var y=0; y < 10; y++){
            arr_year.push(year-y)
        }
        log.debug('data filter tahun bulan', {arr_month:arr_month, arr_year: arr_year})
        return {
            arr_month: arr_month,
            arr_year: arr_year
        }
    }

    function addComa(number) {
        // Ensure the input is a number
        if (isNaN(number)) {
            return '0.00';
        }

        // Convert the number to a string with exactly two decimal places
        var parts = Number(number).toFixed(2).split('.');

        // Format the integer part with commas
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Rejoin the integer and decimal parts
        return parts.join('.');
    }

    function addComaFiveDec(number) {
        // Ensure the input is a number
        if (isNaN(number)) {
            return '0.00';
        }

        // Convert the number to a string with exactly two decimal places
        var parts = Number(number).toFixed(5).split('.');

        // Format the integer part with commas
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Rejoin the integer and decimal parts
        return parts.join('.');
    }

    function searchTrxCOA(params) {
        
        // log.debug('FINALDATA_COANUMBER awal', FINALDATA_COANUMBER)

        var monthdate = params.monthdate
        var yeardate = params.yeardate
        var filters = [
            ["posting","is","T"], 
            "AND", 
            ["accounttype","anyof","OthIncome","Expense","COGS","OthExpense","Income"], 
            "AND", 
            ["formulanumeric: EXTRACT(YEAR FROM{trandate})","equalto",yeardate], 
            "AND", 
            ["formulanumeric: EXTRACT(MONTH FROM{trandate})","equalto",monthdate],
            "AND", 
            ["formulanumeric: CASE  WHEN {account.number} LIKE 501110 THEN 1 WHEN {account.number} LIKE 501210 THEN 1 WHEN {account.number} LIKE 501310 THEN 1 WHEN {account.number} LIKE 501410 THEN 1 WHEN {account.number} LIKE 501510 THEN 1 WHEN {account.number} LIKE 501610 THEN 1 WHEN {account.number} LIKE 503110 THEN 1 WHEN {account.number} LIKE 602110 THEN 1 WHEN {account.number} LIKE 603110 THEN 1 WHEN {account.number} LIKE 603210 THEN 1 WHEN {account.number} LIKE 603250 THEN 1 WHEN {account.number} LIKE 603310 THEN 1 WHEN {account.number} LIKE 603410 THEN 1 WHEN {account.number} LIKE 603610 THEN 1 WHEN {account.number} LIKE 603910 THEN 1 WHEN {account.number} LIKE 604110 THEN 1 WHEN {account.number} LIKE 604910 THEN 1 WHEN {account.number} LIKE 605110 THEN 1 WHEN {account.number} LIKE 605610 THEN 1 WHEN {account.number} LIKE 605910 THEN 1 WHEN {account.number} LIKE 601100 THEN 1 WHEN {account.number} LIKE '71%' THEN 1 WHEN {account.number} LIKE '78%' THEN 1 WHEN {account.number} LIKE '77%' THEN 1 WHEN {account.number} LIKE '81%' THEN 1 WHEN {account.number} LIKE '82%' THEN 1 WHEN {account.number} LIKE '61%' THEN 1 WHEN {account.number} LIKE '68%' THEN 1 WHEN {account.number} LIKE 940101 THEN 1 WHEN {account.number} LIKE 940201 THEN 1 ELSE 0 END","equalto","1"
            ]
        ]
        
        log.debug('filters searchTrxCOA', filters)
        
        var trxSearch = search.create({
            type: "transaction",
            filters: filters,
            columns:
            [
                search.createColumn({
                    name: "account",
                    summary: "GROUP",
                    label: "Account"
                }),
                search.createColumn({
                    name: "name",
                    join: "account",
                    summary: "GROUP",
                    label: "Name"
                }),
                search.createColumn({
                    name: "number",
                    join: "account",
                    summary: "GROUP",
                    label: "Number"
                }),
                search.createColumn({
                    name: "accounttype",
                    summary: "GROUP",
                    label: "Account Type"
                }),
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'SCR' THEN {amount} ELSE 0 END ",
                    label: "SCR"
                }),

                // 5
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'CDW1' THEN  {amount} ELSE 0 END ",
                    label: "CDW1"
                }),
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'CDW2' THEN {amount} ELSE 0 END ",
                    label: "CDW2"
                }),
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'NUG1' THEN {amount} ELSE 0 END ",
                    label: "NUG1"
                }),
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'NUG2' THEN {amount} ELSE 0 END ",
                    label: "NUG2"
                }),
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'ALN1' THEN {amount} ELSE 0 END ",
                    label: "ALN1"
                }),

                //10
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'ALN2' THEN {amount} ELSE 0 END ",
                    label: "ALN2"
                }),
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'ALN3' THEN {amount} ELSE 0 END ",
                    label: "ALN3"
                }),
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'ALD' THEN {amount} ELSE 0 END ",
                    label: "ALD"
                }),
                search.createColumn({
                    name: "formulacurrency",
                    summary: "SUM",
                    formula: "CASE WHEN {classnohierarchy} LIKE 'HO' THEN {amount} ELSE 0 END ",
                    label: "HQ"
                 })
            ]
        });
        var acc_trx_obj = {}

        var startrow = 0;

        do {

            var result = trxSearch.run().getRange({
                start: startrow,
                end: startrow + 1000
            });
            log.debug('result searchTrx', result)

            for (let i = 0; i < result.length; i++) {
                // log.debug('result[i] ' + i, result[i])
                var account_type = result[i].getValue(result[i].columns[3])
                var account_number = result[i].getValue(result[i].columns[2])
                var account_real_number = result[i].getValue(result[i].columns[2])
                
                var name_length = (result[i].getValue(result[i].columns[1]).split(":")).length
                var account_name = result[i].getValue(result[i].columns[1]).split(":")[(name_length-1)]
                var account_id = result[i].getValue(result[i].columns[0])
                var bu_SCR = Number(result[i].getValue(result[i].columns[4])) || 0
                var bu_CDW1 = Number(result[i].getValue(result[i].columns[5])) || 0
                var bu_CDW2 = Number(result[i].getValue(result[i].columns[6])) || 0
                var bu_NUG1 = Number(result[i].getValue(result[i].columns[7])) || 0
                var bu_NUG2 = Number(result[i].getValue(result[i].columns[8])) || 0
                var bu_ALN1 = Number(result[i].getValue(result[i].columns[9])) || 0
                var bu_ALN2 = Number(result[i].getValue(result[i].columns[10])) || 0
                var bu_ALN3 = Number(result[i].getValue(result[i].columns[11])) || 0
                var bu_ALD = Number(result[i].getValue(result[i].columns[12])) || 0
                var bu_HQ = Number(result[i].getValue(result[i].columns[13])) || 0
                var copper_total_line = Number(bu_SCR + bu_CDW1 + bu_CDW2 + bu_NUG1 + bu_NUG2)
                var al_total_line = Number(bu_ALN1 + bu_ALN2 + bu_ALN3 + bu_ALD)
                var tms_total_line = Number(copper_total_line + al_total_line + bu_HQ)

                

                if(account_number.indexOf('71') == 0 || account_number.indexOf('78') == 0 || account_number.indexOf('77') == 0 || account_number.indexOf('81') == 0 || account_number.indexOf('82') == 0){
                    account_number = account_number.slice(0,2)
                }

                // COA CCO
                if(account_number.indexOf('61') == 0 || account_number.indexOf('68') == 0){
                    
                    account_number = 'CCO'
                    account_name = COANUMBER_NAME[account_name]
                }

                if(account_type.toLowerCase().indexOf('income') == -1 && account_real_number.indexOf('68') == -1){
                    if(account_real_number.indexOf('68') == 0){
                        log.debug('Masuk cuy nilainya')
                    }
                    bu_SCR = bu_SCR * -1
                    bu_CDW1 = bu_CDW1 * -1
                    bu_CDW2 = bu_CDW2 * -1
                    bu_NUG1 = bu_NUG1 * -1
                    bu_NUG2 = bu_NUG2 * -1
                    bu_ALN1 = bu_ALN1 * -1
                    bu_ALN2 = bu_ALN2 * -1
                    bu_ALN3 = bu_ALN3 * -1
                    bu_ALD = bu_ALD * -1
                    bu_HQ = bu_HQ * -1
                    copper_total_line = copper_total_line * -1
                    al_total_line = al_total_line * -1
                    tms_total_line = tms_total_line * -1
                    
                }
                
                if(!acc_trx_obj[account_number]){
                    acc_trx_obj[account_number] = {
                        account_type : account_type,
                        account_name : COANUMBER_NAME[account_number],
                        account_number : account_number,
                        bu_SCR : bu_SCR,
                        bu_CDW1 : bu_CDW1,
                        bu_CDW2 : bu_CDW2,
                        bu_NUG1 : bu_NUG1,
                        bu_NUG2 : bu_NUG2,
                        copper_total : copper_total_line,
                        bu_ALN1 : bu_ALN1,
                        bu_ALN2 : bu_ALN2,
                        bu_ALN3 : bu_ALN3,
                        bu_ALD : bu_ALD,
                        al_total: al_total_line,
                        bu_HQ : bu_HQ,
                        tms_total: tms_total_line,
                    }
                } else {
                    acc_trx_obj[account_number].bu_SCR += bu_SCR
                    acc_trx_obj[account_number].bu_CDW1 += bu_CDW1
                    acc_trx_obj[account_number].bu_CDW2 += bu_CDW2
                    acc_trx_obj[account_number].bu_NUG1 += bu_NUG1
                    acc_trx_obj[account_number].bu_NUG2 += bu_NUG2
                    acc_trx_obj[account_number].copper_total += copper_total_line
                    acc_trx_obj[account_number].bu_ALN1 += bu_ALN1
                    acc_trx_obj[account_number].bu_ALN2 += bu_ALN2
                    acc_trx_obj[account_number].bu_ALN3 += bu_ALN3
                    acc_trx_obj[account_number].bu_ALD += bu_ALD
                    acc_trx_obj[account_number].al_total += al_total_line
                    acc_trx_obj[account_number].bu_HQ += bu_HQ
                    acc_trx_obj[account_number].tms_total += tms_total_line
                }
                
            }

            startrow += 1000;

        } while (result.length === 1000);

        if(Object.keys(acc_trx_obj).length > 0){
            log.debug('FINALDATA_COANUMBER length: ' + Object.keys(FINALDATA_COANUMBER).length, FINALDATA_COANUMBER)
            log.debug('acc_trx_obj length' + Object.keys(acc_trx_obj).length, acc_trx_obj)

            for(var coa_num in FINALDATA_COANUMBER){
                // log.debug('coa_num in FINALDATA_COANUMBER', coa_num)
                coa_num = coa_num.replace('COA_', '')
                // log.debug(coa_num + ' isexist in acctrxobj: ',  coa_num in acc_trx_obj)
                FINALDATA_COANUMBER['COA_' + coa_num] = {
                    account_number: coa_num,
                    account_name: COANUMBER_NAME[coa_num],
                    bu_SCR : 0,
                    bu_CDW1 : 0,
                    bu_CDW2 : 0,
                    bu_NUG1 : 0,
                    bu_NUG2 : 0,
                    copper_total : 0,
                    bu_ALN1 : 0,
                    bu_ALN2 : 0,
                    bu_ALN3 : 0,
                    bu_ALD : 0,
                    al_total: 0,
                    bu_HQ : 0,
                    tms_total: 0
                }
                if(coa_num in acc_trx_obj){
                    log.debug('Data COA exist', acc_trx_obj[coa_num])
                    FINALDATA_COANUMBER['COA_' + coa_num] = acc_trx_obj[coa_num]
                }
            }
        } 
        setCOASummary()
        // log.debug('FINALDATA_COANUMBER', FINALDATA_COANUMBER)

        
        return acc_trx_obj;

    }

    function setCOASummary(){
        for(var coa_num in FINALDATA_COANUMBER){

            // SET CCO 
            if(!FINALDATA_COANUMBER.COA_CCO["bold"]){
                FINALDATA_COANUMBER.COA_CCO["bold"] = true
                FINALDATA_COANUMBER.COA_CCO["isenter"] = true
            }
            if(!FINALDATA_COANUMBER.COA_940201["bold"]){
                FINALDATA_COANUMBER.COA_940201["bold"] = false
                FINALDATA_COANUMBER.COA_940201["isenter"] = true
            }
            
            // SET TSA - TOTAL SALES
            if(coa_num == "COA_501110" || coa_num == "COA_501210" || coa_num == "COA_501310" || coa_num == "COA_501410" || coa_num == "COA_501510" || coa_num == "COA_501610" || coa_num == "COA_503110" || coa_num == "COA_602110"){
                for(var bu in FINALDATA_COANUMBER[coa_num]){
                    if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                    if(!FINALDATA_COANUMBER.COA_TSA["bold"]){
                        FINALDATA_COANUMBER.COA_TSA["bold"] = true
                        FINALDATA_COANUMBER.COA_TSA["isenter"] = true
                    }

                    if(!FINALDATA_COANUMBER.COA_TSA[bu]){
                        FINALDATA_COANUMBER.COA_TSA["account_name"] = COANUMBER_NAME['TSA']
                        FINALDATA_COANUMBER.COA_TSA[bu] = Number(FINALDATA_COANUMBER[coa_num][bu])
                    } else {
                        FINALDATA_COANUMBER.COA_TSA[bu] += Number(FINALDATA_COANUMBER[coa_num][bu])
                    }
                }
            }
    
            // SET RMA - RAW MATERIAL AVAILABLE
            if(coa_num == "COA_603110" || coa_num == "COA_603210" || coa_num == "COA_603250" || coa_num == "COA_603310" || coa_num == "COA_603410" || coa_num == "COA_603610"){
                for(var bu in FINALDATA_COANUMBER[coa_num]){
                    if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                    if(!FINALDATA_COANUMBER.COA_RMA["bold"]){
                        FINALDATA_COANUMBER.COA_RMA["bold"] = true
                        FINALDATA_COANUMBER.COA_RMA["isenter"] = false
                    }
                    if(!FINALDATA_COANUMBER.COA_RMA[bu]){
                        FINALDATA_COANUMBER.COA_RMA["account_name"] = COANUMBER_NAME['RMA']
                        FINALDATA_COANUMBER.COA_RMA[bu] = Number(FINALDATA_COANUMBER[coa_num][bu])
                    } else {
                        FINALDATA_COANUMBER.COA_RMA[bu] += Number(FINALDATA_COANUMBER[coa_num][bu])
                    }
                }
            }
    
            // SET RMU - RAW MATERIAL USED
            for(var bu in FINALDATA_COANUMBER.COA_RMA){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_RMU["bold"]){
                    FINALDATA_COANUMBER.COA_RMU["bold"] = true
                    FINALDATA_COANUMBER.COA_RMU["isenter"] = true
                }
                FINALDATA_COANUMBER.COA_RMU[bu] = Number(FINALDATA_COANUMBER.COA_RMA[bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_603910"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_RMU[bu] += Number(FINALDATA_COANUMBER["COA_603910"][bu])
            }
    
            // SET WIA - WORK IN PROCESS AVAILABLE
            for(var bu in FINALDATA_COANUMBER.COA_RMU){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_WIA["bold"]){
                    FINALDATA_COANUMBER.COA_WIA["bold"] = true
                    FINALDATA_COANUMBER.COA_WIA["isenter"] = false
                }
                FINALDATA_COANUMBER.COA_WIA[bu] = Number(FINALDATA_COANUMBER.COA_RMU[bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_604110"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_WIA[bu] += Number(FINALDATA_COANUMBER["COA_604110"][bu])
            }
            for(var bu in FINALDATA_COANUMBER.COA_CCO){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_WIA[bu] += Number(FINALDATA_COANUMBER.COA_CCO[bu])
            }
    
            // SET WIU - WORK IN PROCESS USED
            for(var bu in FINALDATA_COANUMBER.COA_WIA){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_WIU["bold"]){
                    FINALDATA_COANUMBER.COA_WIU["bold"] = true
                    FINALDATA_COANUMBER.COA_WIU["isenter"] = true
                }
                FINALDATA_COANUMBER.COA_WIU[bu] = Number(FINALDATA_COANUMBER.COA_WIA[bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_604910"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_WIU[bu] += Number(FINALDATA_COANUMBER["COA_604910"][bu])
            }
    
            // SET FGA - FINISHED GOOD AVAILABLE
            for(var bu in FINALDATA_COANUMBER.COA_WIU){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_FGA["bold"]){
                    FINALDATA_COANUMBER.COA_FGA["bold"] = true
                    FINALDATA_COANUMBER.COA_FGA["isenter"] = false
                }
                FINALDATA_COANUMBER.COA_FGA[bu] = Number(FINALDATA_COANUMBER.COA_WIU[bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_605110"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_FGA[bu] += Number(FINALDATA_COANUMBER["COA_605110"][bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_605610"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_FGA[bu] += Number(FINALDATA_COANUMBER["COA_605610"][bu])
            }
    
            // SET 601100 - COST OF GOOD SOLD
            for(var bu in FINALDATA_COANUMBER.COA_FGA){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_601100["bold"]){
                    FINALDATA_COANUMBER.COA_601100["bold"] = true
                    FINALDATA_COANUMBER.COA_601100["isenter"] = true
                }
                FINALDATA_COANUMBER["COA_601100"][bu] = Number(FINALDATA_COANUMBER.COA_FGA[bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_605910"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER["COA_601100"][bu] += Number(FINALDATA_COANUMBER["COA_605910"][bu])
            }
            // log.debug('FINALDATA_COANUMBER 586', FINALDATA_COANUMBER)

            // SET GPS - GROSS PROFIT ON SALES
            for(var bu in FINALDATA_COANUMBER.COA_TSA){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_GPS["bold"]){
                    FINALDATA_COANUMBER.COA_GPS["bold"] = true
                    FINALDATA_COANUMBER.COA_GPS["isenter"] = true
                }
                FINALDATA_COANUMBER.COA_GPS[bu] = Number(FINALDATA_COANUMBER.COA_TSA[bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_601100"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_GPS[bu] += Number(FINALDATA_COANUMBER["COA_601100"][bu])
            }
    
            // SET MIC - MARGINAL INCOME
    
            for(var bu in FINALDATA_COANUMBER.COA_GPS){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_MIC["bold"]){
                    FINALDATA_COANUMBER.COA_MIC["bold"] = true
                    FINALDATA_COANUMBER.COA_MIC["isenter"] = true
                }
                FINALDATA_COANUMBER.COA_MIC[bu] = Number(FINALDATA_COANUMBER.COA_GPS[bu])
            }   
            for(var bu in FINALDATA_COANUMBER["COA_71"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_MIC[bu] += Number(FINALDATA_COANUMBER["COA_71"][bu])
            } 
    
            // SET OPI - OPERATING INCOME
    
            for(var bu in FINALDATA_COANUMBER.COA_MIC){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_OPI["bold"]){
                    FINALDATA_COANUMBER.COA_OPI["bold"] = true
                    FINALDATA_COANUMBER.COA_OPI["isenter"] = true
                }
                FINALDATA_COANUMBER.COA_OPI[bu] = Number(FINALDATA_COANUMBER.COA_MIC[bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_78"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_OPI[bu] += Number(FINALDATA_COANUMBER["COA_78"][bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_77"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_OPI[bu] += Number(FINALDATA_COANUMBER["COA_77"][bu])
            }
    
            // SET NIBT - NET INCOME BEFORE TAX
    
            for(var bu in FINALDATA_COANUMBER.COA_OPI){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_NIBT["bold"]){
                    FINALDATA_COANUMBER.COA_NIBT["bold"] = true
                    FINALDATA_COANUMBER.COA_NIBT["isenter"] = true
                }
                FINALDATA_COANUMBER.COA_NIBT[bu] = Number(FINALDATA_COANUMBER.COA_OPI[bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_81"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_NIBT[bu] += Number(FINALDATA_COANUMBER["COA_81"][bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_82"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_NIBT[bu] += Number(FINALDATA_COANUMBER["COA_82"][bu])
            }

            // SET NIAT - NET INCOME AFTER TAX
    
            for(var bu in FINALDATA_COANUMBER.COA_NIBT){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                if(!FINALDATA_COANUMBER.COA_NIAT["bold"]){
                    FINALDATA_COANUMBER.COA_NIAT["bold"] = true
                    FINALDATA_COANUMBER.COA_NIAT["isenter"] = true
                }
                FINALDATA_COANUMBER.COA_NIAT[bu] = Number(FINALDATA_COANUMBER.COA_NIBT[bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_940101"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_NIAT[bu] += Number(FINALDATA_COANUMBER["COA_940101"][bu])
            }
            for(var bu in FINALDATA_COANUMBER["COA_940201"]){
                if(bu == 'account_type' || bu == 'account_number' || bu == 'account_name' || bu == 'bold' || bu == 'isenter') continue;
                FINALDATA_COANUMBER.COA_NIAT[bu] += Number(FINALDATA_COANUMBER["COA_940201"][bu])
            }
        }
    }

    function printHtml(final_data, param, context, form) {
        var reportGroup = form.addFieldGroup({
            id: 'report_group',
            label: 'Report'
        });
        var data_final = final_data
        var incomeStatement = form.addField({
            id: 'custpage_po_report',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Report Purchase Order',
            container: 'report_group'
        });

        incomeStatement.defaultValue = '<!DOCTYPE html> ' +
            '<html lang="en">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<h2 style= "text-align">Report Income Statement ' + arr_month[param.monthdate] + " " + param.yeardate + '</h2>' +
            '<link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"/>' +
            '<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js">' +
            '</script>' +
            '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js">' +
            '</script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js">' +
            '</script>' +
            '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.css"/>' +
            '<script src="https://cdn.datatables.net/1.10.21/js/jquery.dataTables.min.js">' +
            '</script>' +
            '<script src="https://code.jquery.com/jquery-3.3.1.js"></script>' +
            '<script src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/dataTables.buttons.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.flash.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>' +
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.html5.min.js"></script>' +
            '<script src="https://cdn.datatables.net/buttons/1.6.1/js/buttons.print.min.js"></script>' +
            '</script>' +

            '<script>$(document).ready(function () { $("#daTable").DataTable({ "pageLength": 50, dom: "Bfrtip","buttons": ["excel"]})})</script>' +
            '</head>';
        incomeStatement.defaultValue += '<body>';

        incomeStatement.defaultValue += '<style>' +
            '.table{border:1px solid black; margin-top: 5%}' +
            '.table-head-column{border:1px solid black; border-collapse: collapse; font-weight: bold;}' +
            '.table-row{border:1px solid black; border-collapse: collapse;}' +
            '.table-column{border:1px solid black; border-collapse: collapse;}' +
            '</style>' +
            '<table style="width:200%; border:10px" id="daTable" class="table table-striped table-bordered table-hover dt-responsive" style="width:100%">' +
            '<thead class="thead-dark" style="font-weight: bold">' +
            '<tr >'
            for(var bodyname in HEADER_COLUMN){
                incomeStatement.defaultValue += '<th >' + HEADER_COLUMN[bodyname] + '</th>'
            }
            

        incomeStatement.defaultValue += '</tr>';
        incomeStatement.defaultValue += '</thead>';
        incomeStatement.defaultValue += '<tbody>';

        for(var coa_number in FINALDATA_COANUMBER){
            log.debug('FINALDATA_COANUMBER[coa_number] ' + coa_number, FINALDATA_COANUMBER[coa_number])
            var account = FINALDATA_COANUMBER[coa_number]
            
           
            incomeStatement.defaultValue += '<tr>' +
                '<td>' + (account.account_name ? coa_number + '-' + account.account_name : coa_number) + '</td>' +
                '<td>' + addComa(account.bu_SCR) + '</td>' +
                '<td>' + addComa(account.bu_CDW1) + '</td>' +
                '<td>' + addComa(account.bu_CDW2) + '</td>' +
                '<td>' + addComa(account.bu_NUG1) + '</td>' +
                '<td>' + addComa(account.bu_NUG2) + '</td>' +
                '<td>' + addComa(account.copper_total) + '</td>' +
                '<td>' + addComa(account.bu_ALN1) + '</td>' +
                '<td>' + addComa(account.bu_ALN2) + '</td>' +
                '<td>' + addComa(account.bu_ALN3) + '</td>' +
                '<td>' + addComa(account.bu_ALD) + '</td>' +
                '<td>' + addComa(account.al_total) + '</td>' +
                '<td>' + addComa(account.bu_HQ) + '</td>' +
                '<td>' + addComa(account.tms_total) + '</td>' +
            '</tr>';
        }

        incomeStatement.defaultValue += '</tbody>';
        incomeStatement.defaultValue += '</table>';
        incomeStatement.defaultValue += '</body>' +
            '</html>';
        context.response.writePage(form);
    }

    function printExcel(final_data, param, context, form){
        
        if(Object.keys(checking_data).length > 0){
            for(var check in checking_data){
                log.debug('checking data ' + check + '| length: ' + Object.keys(checking_data[check]).length, checking_data[check])
            }
        }
        
        var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss')

        var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'; 
        xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
        xmlString += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
        xmlString += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
        xmlString += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
        xmlString += 'xmlns:html="http://www.w3.org/TR/REC-html40">'; 

        xmlString += '<Styles>' +
            '<Style ss:ID="MyNumber">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<NumberFormat ss:Format="#,##0"/>' +
            '</Style>' +
            '<Style ss:ID="MyCurr">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<NumberFormat ss:Format="#,##0"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlign">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignBold">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<Font ss:Bold="1"/>' +
            '</Style>' +
            '<Style ss:ID="MyAlignCenter">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '<Font ss:Bold="1"/>' +
            '</Style>' +
        '</Styles>'

        xmlString += '<Worksheet ss:Name="Sheet1">';
        xmlString += '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">';
        xmlString += '<PageSetup>';
        xmlString += '<PageMargins x:Bottom="0.75" x:Left="0.25" x:Right="0.25" x:Top="0.75"/>'
        xmlString += '</PageSetup>';
        xmlString += '</WorksheetOptions>';

        xmlString += '<Table>';

        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="150"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="100"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';

        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';

        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
        xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';

        
        var column_length = Object.keys(HEADER_COLUMN).length
        // === Header Column START ===
        xmlString += '<Row>' 
        xmlString += '<Cell ss:StyleID="MyAlignCenter" ss:MergeAcross="13"><Data ss:Type="String">' + 'PT. TEMBAGA MULIA SEMANAN TBK.' + 	'</Data></Cell>'										
        xmlString += '</Row>';

        xmlString += '<Row>' 
        xmlString += '<Cell ss:StyleID="MyAlignCenter" ss:MergeAcross="13"><Data ss:Type="String">' + ' ' + 	'</Data></Cell>'										
        xmlString += '</Row>';
        
        var endingdate = arr_endingdate[(param.monthdate-1)]
        if(param.monthdate == 2){
            endingdate = param.yeardate%4 == 0? arr_endingdate[1][1] : arr_endingdate[1][0]
        }
        var month_title_header = 'For Month Ending ' + endingdate + ' ' + arr_month[(param.monthdate-1)] + ' ' + param.yeardate													

        xmlString += '<Row>' 										
        xmlString += '<Cell ss:StyleID="MyAlignCenter" ss:MergeAcross="13"><Data ss:Type="String">' + month_title_header + 	'</Data></Cell>'										
        xmlString += '</Row>';

        xmlString += '<Row>' 
        for(var head_col in HEADER_COLUMN){
            xmlString += '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + HEADER_COLUMN[head_col] + '</Data></Cell>'
        }
        xmlString += '</Row>';
        
        xmlString += '<Row>' 
        for(var head_col in HEADER_COLUMN){
            if(head_col == "description"){
                xmlString += '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + ' ' + '</Data></Cell>'
            } else {
                xmlString += '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + arr_month[(param.monthdate-1)] + '</Data></Cell>'
            }
        }
        xmlString += '</Row>';
        // === Header Column END ===


        // === List Data START ===
        
        xmlString += '<Row> </Row>'  
        
        for(var coa_number in FINALDATA_COANUMBER){
            log.debug('FINALDATA_COANUMBER[coa_number] ' + coa_number, FINALDATA_COANUMBER[coa_number])
            var account = FINALDATA_COANUMBER[coa_number]
            
            if (account.bold == true) {
                xmlString += '<Row ss:StyleID="MyAlignBold">'
            } else {
                xmlString += '<Row>'
            }

    xmlString += '<Cell><Data ss:Type="String">' + (account.account_name ? account.account_number + '-' + account.account_name : account.account_number) + '</Data></Cell>' +
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_SCR.toFixed(2) +'</Data></Cell>' + 
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_CDW1.toFixed(2) +'</Data></Cell>' + 
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_CDW2.toFixed(2) +'</Data></Cell>' + 
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_NUG1.toFixed(2) +'</Data></Cell>' + 

                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_NUG2.toFixed(2) +'</Data></Cell>' +
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.copper_total.toFixed(2) +'</Data></Cell>' +
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_ALN1.toFixed(2) +'</Data></Cell>' +
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_ALN2.toFixed(2) +'</Data></Cell>' +
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_ALN3.toFixed(2) +'</Data></Cell>' +

                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_ALD.toFixed(2) +'</Data></Cell>' +
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.al_total.toFixed(2) +'</Data></Cell>' +
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.bu_HQ.toFixed(2) +'</Data></Cell>' +
                '<Cell ss:StyleID="MyCurr"><Data ss:Type="Number">'+ account.tms_total.toFixed(2) +'</Data></Cell>' +
            '</Row>';
            if(account.isenter == true){
                xmlString += '<Row> </Row>'  
            }
        }

        
        // === List Data END ===

        xmlString += '</Table></Worksheet></Workbook>';
        // log.debug('xmlString', xmlString)
        var strXmlEncoded = encode.convert({
            string : xmlString,
            inputEncoding : encode.Encoding.UTF_8,
            outputEncoding : encode.Encoding.BASE_64
        });
        // log.debug('strXmlEncoded', strXmlEncoded)

        var objXlsFile = file.create({
            name : 'Income Statement' + ' ' + now + '.xls',
            fileType : file.Type.EXCEL,
            contents : strXmlEncoded
        });
        // log.debug('objXlsFile', objXlsFile)

        
        context.response.writeFile({
            file : objXlsFile
        });
        
    }
    
    function parameters() {
        var form = serverWidget.createForm({
            title: 'Report Income Statement'
        })

        var reportFilter = form.addFieldGroup({
            id: 'report_filter',
            label: 'Filter'
        });

        var printType = form.addField({
            id: FILTER.print_type,
            type: serverWidget.FieldType.SELECT,
            label: "Generate As",
            container: 'report_filter'
        })
        printType.isMandatory = true;
        printType.addSelectOption({
            value: '1',
            text: 'Page'
        });
        printType.defaultValue = 1


        var arr_year = getMonthYear().arr_year
        var arr_month = getMonthYear().arr_month
        var now = new Date()
        var now_month = Number(now.getMonth())
        var now_year = Number(now.getFullYear())

        log.debug('data parameters', {
            now : now,
            now_month : now_month,
            now_year : now_year
        })

        var yeardate = form.addField({
            id: FILTER.yeardate,
            type: serverWidget.FieldType.SELECT,
            label: "Year Date",
            container: 'report_filter'
        })
        for(var y=0; y < arr_year.length; y++){
            yeardate.addSelectOption({value: arr_year[y], text: arr_year[y]})
        };
        yeardate.defaultValue = now_year

        var monthdate = form.addField({
            id: FILTER.monthdate,
            type: serverWidget.FieldType.SELECT,
            label: "Month Date",
            container: 'report_filter'
        });
        for(var m=0; m < arr_month.length; m++){
            monthdate.addSelectOption({value: m, text: arr_month[m]})
        };
        monthdate.defaultValue = now_month
        log.debug('selectoption monthdate', monthdate.getSelectOptions())
        // var texts = form.addField({
        //     id: 'custpage_random_text',
        //     type: serverWidget.FieldType.TEXT,
        //     label: "text",
        //     container: 'report_filter'
        // });
        // var currentDate = moment().zone("+07:00").format('YYYYMMDD');
        // texts.defaultValue = currentDate

        return form;
    }

    function onRequest(context) {
        var form = parameters()

        if (context.request.method == 'GET') {
            
            context.response.writePage(form);
        } else {
            var param = context.request.parameters;
            var print_type = param[FILTER.print_type]
            var yeardate = param[FILTER.yeardate]
            var monthdate = Number(param[FILTER.monthdate]) + 1
            
            var body_monthdate = form.getField(FILTER.monthdate)
            var body_yeardate = form.getField(FILTER.yeardate)
            body_monthdate.defaultValue = monthdate
            body_yeardate.defaultValue = yeardate

            var params = {
                print_type : print_type,
                monthdate : monthdate,
                yeardate : yeardate
            }
            log.debug('params', params)

            var final_data = {
                print_type : print_type,
                monthdate : monthdate,
                yeardate : yeardate,
                detail_coa: {
                    coa_tsa:{},
                    coa_rma:{},
                    coa_rmu:{},
                }
            }
            
            var final_data = searchTrxCOA(params);
            var printHtmls = printExcel(final_data, params, context, form);

        }
        form.addSubmitButton({
            label: 'Generate'
        });
    }

    return {
        onRequest: onRequest
    }
});

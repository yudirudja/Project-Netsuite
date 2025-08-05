/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(["N/search", 'N/runtime', 'N/query'], function (search, runtime, query) {

    function search_fam_asset(params) {

        var search_asset = search.create({
            type: "customrecord_ncfar_asset",
            filters:
                [
                    ["custrecord_assetsourcetrn.mainline", "is", "F"],
                    "AND",
                    ["custrecord_assetsourcetrn.taxline", "is", "F"],
                    "AND",
                    ["custrecord_assetsourcetrn.cogs", "is", "F"],
                    "AND",
                    ["custrecord_assetsourcetrn.shipping", "is", "F"],
                    "AND",
                    ["internalid", "anyof", "2580"]
                ],
            columns:
                [
                    search.createColumn({ name: "altname", label: "name" }),
                    search.createColumn({ name: "custrecord_assetdepartment", label: "Department" }),
                    search.createColumn({
                        name: "item",
                        join: "CUSTRECORD_ASSETSOURCETRN",
                        label: "Item"
                    }),
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when {custrecord_assetsourcetrn.amount} < 1000000 then 'Non LVA' when  {custrecord_assetsourcetrn.amount} >= 1000000 and  {custrecord_assetsourcetrn.amount} < 2000000 then 'LVA' when {custrecord_assetsourcetrn.amount} >= 2000000 then 'FA' end",
                        label: "Asset Accounting Type"
                    }),
                    search.createColumn({ name: "custrecord_assetpurchasedate", label: "Purchase Date" }),
                    search.createColumn({
                        name: "formulatext",
                        formula: "case when {custrecord_assetstatus} not like 'DISPOSED' then 'ACTIVE' else 'DISPOSED' END",
                        label: "Asset Status"
                    }),
                    search.createColumn({ name: "custrecord_assetlocation", label: "Location" }),
                    search.createColumn({ name: "custrecord_assetdescr", label: "Asset Description" }),
                    search.createColumn({ name: "custrecord_assetsourcetrn", label: "Parent Transaction" })
                ]
        });

        var startRow = 0
        let data_asset_arr = []
        do {
            let toResult = search_asset.run().getRange({
                start: startRow,
                end: startRow + 1000
            });

            for (let i = 0; i < toResult.length; i++) {
                let name = fpSR[i].getValue(fpSR[i].columns[0]);
                let departmnet = fpSR[i].getValue(fpSR[i].columns[1]);
                let item = fpSR[i].getValue(fpSR[i].columns[2]);
                let asset_id = fpSR[i].getValue(fpSR[i].columns[3]);
                let asset_accounting_type = fpSR[i].getValue(fpSR[i].columns[4]);
                let purchase_date = fpSR[i].getValue(fpSR[i].columns[5]);
                let asset_status = fpSR[i].getValue(fpSR[i].columns[6]);
                let location = fpSR[i].getValue(fpSR[i].columns[7]);
                let asset_description = fpSR[i].getValue(fpSR[i].columns[8]);
                let parent_transaction = fpSR[i].getValue(fpSR[i].columns[9]);

                data_asset_arr.push({
                    name: name,
                    departmnet: departmnet,
                    item: item,
                    asset_id: asset_id,
                    asset_accounting_type: asset_accounting_type,
                    purchase_date: purchase_date,
                    asset_status: asset_status,
                    location: location,
                    asset_description: asset_description,
                    parent_transaction: parent_transaction,
                });
            }
            startRow += 1000

        } while (toResult.length === 1000);

    }

    function search_item_description(data, parent_item_receipt, id_parent_transaction) { // not using this because it has posility to get timeout error when merge the memo amount to main DATASET (if there are a lot of data)

        let script = runtime.getCurrentScript()
        // let result = [];

        // for (let i = 0; i < data.length; i++) {
        //     if (data[i].parent_transaction_type != "Item Receipt") {
        //         result.push(data[i])
        //     }
        //     if (data[i].parent_transaction_type == "Item Receipt" && !ss_parameter.includes(data[i].parent_transaction)) {
        //         ss_parameter.push(data[i].parent_transaction)
        //     }

        // }

        let filter = [
            ["type", "anyof", "ItemRcpt"],
            "AND",
            ["mainline", "is", "F"],
            "AND",
            ["taxline", "is", "F"],
            "AND",
            ["cogs", "is", "F"],
            "AND",
            ["shipping", "is", "F"],
        ]

        if (id_parent_transaction.length > 0) {
            "AND",
                ["internalid", "anyof", id_parent_transaction]
        }

        var search_item_memo = search.create({
            type: "itemreceipt",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters: filter,
            columns:
                [
                    search.createColumn({ name: "internalId", label: "internal id" }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({
                        name: "memo",
                        join: "appliedToTransaction",
                        label: "Memo"
                    }),
                    search.createColumn({ name: "location", label: "Location" }),
                ]
        });

        let data_asset_arr = [];

        // Use runPaged with a page size of 1000
        var pagedData = search_item_memo.runPaged({ pageSize: 1000 });

        pagedData.pageRanges.forEach(function (pageRange) {
            var page = pagedData.fetch({ index: pageRange.index });
            page.data.forEach(function (resultRow) {
                var columns = resultRow.columns;

                let id = resultRow.getValue(columns[0]);
                let item = resultRow.getValue(columns[1]);
                let memo = resultRow.getValue(columns[2]);
                let location = resultRow.getValue(columns[3]);

                // log.debug("testing", {
                //     parent_transaction:  id,
                //     item:  item,
                //     asset_desc:  memo,
                //     location: location
                // })

                let get_duplicate = parent_item_receipt.filter((e) => e.parent_transaction == id && e.item == item && memo.includes(e.asset_description) && e.location_id == location);
                log.debug("get_duplicate", get_duplicate)

                if (get_duplicate.length > 0) {
                    data.push(get_duplicate[0])
                }
                if (script.getRemainingUsage() < 50) {
                    log.error('Low governance usage', 'Exiting early to avoid error');
                    return { status: 'partial', message: 'Execution stopped early due to usage limits.' };
                }
            });
        });
        return data;
    }
    function search_item_descriptionV2(data, parent_item_receipt, id_parent_transaction) {// using this because it doesnt have to merge memo to main DATASET because it Get only FAM Asset with Item Receipt as Parent Transaction(if there are a lot of data)

        log.debug("id_parent_transaction", id_parent_transaction)

        let script = runtime.getCurrentScript()
        let result = [];

        // for (let i = 0; i < data.length; i++) {
        //     if (data[i].parent_transaction_type != "Item Receipt") {
        //         result.push(data[i])
        //     }
        //     if (data[i].parent_transaction_type == "Item Receipt" && !ss_parameter.includes(data[i].parent_transaction)) {
        //         ss_parameter.push(data[i].parent_transaction)
        //     }

        // }

        let sql = `SELECT
                    Asset.name as id,
                    Asset.altname as name,
                    department.name as department,
                    custrecord_assetsubsidiary as subsidiary,
                    transactionLine.item as item,
                    item.itemId as item_code,
                    Asset.id as asset_id,
                    fam_type.name as asset_type,
                    CASE 
                      WHEN transactionLine.netAmount < 1000000 THEN 'Non LVA' 
                      WHEN transactionLine.netAmount >= 1000000 AND transactionLine.netAmount < 2000000 THEN 'LVA' 
                      WHEN transactionLine.netAmount >= 2000000 THEN 'FA' 
                    END as asset_accounting_type,
                    CASE 
                      WHEN Asset.custrecord_assetstatus NOT LIKE 'DISPOSED' THEN 'ACTIVE' 
                      ELSE 'DISPOSED' 
                    END as asset_status,
                    Asset.custrecord_assetpurchasedate as purchase_date,
                    location.name as location,
                    Asset.custrecord_assetlocation as location_id,
                    Asset.custrecord_assetdescr as asset_description,
                   Asset.custrecord_assetsourcetrn as parent_transaction,
                    transaction.type as parent_transaction_type,
                    Asset.isInactive as is_inactive,

                  FROM
                    CUSTOMRECORD_NCFAR_ASSET as Asset
                  JOIN
                    transaction ON Asset.custrecord_assetsourcetrn = transaction.id
                  JOIN
                    transactionLine ON transaction.id = transactionLine.transaction AND transactionLine.mainLine = 'F'
                  JOIN
                    PreviousTransactionLineLink AS ptll ON transactionLine.transaction = ptll.nextdoc AND ptll.NextLine = transactionLine.id
                  JOIN
                    transaction as PT ON PT.id = ptll.previousdoc
                  JOIN
                    transactionLine as ptl ON ptl.transaction = ptll.previousdoc AND ptl.id = ptll.previousLine
                  JOIN
                    department ON department.id = Asset.custrecord_assetdepartment
                  JOIN
                    location ON location.id = Asset.custrecord_assetlocation 
                  JOIN
                    CUSTOMRECORD_NCFAR_ASSETTYPE as fam_type ON fam_type.id = Asset.custrecord_assettype
                  JOIN
                    item ON item.id = transactionLine.item
                  WHERE 
                    
                    transactionLine.lineSequenceNumber = Asset.custrecord_assetsourcetrnline AND
                    Asset.custrecord_assetlocation = transactionLine.location AND
                    transaction.type = 'ItemRcpt'`

        // ptl.memo
        // INSTR(ptl.memo, Asset.custrecord_assetdescr) > 0 
        let pagedResults = query.runSuiteQLPaged({
            query: sql,
            pageSize: 1000 // adjust the page size as needed
        });

        pagedResults.pageRanges.forEach(function (pageRange) {
            let page = pagedResults.fetch({ index: pageRange.index });
            let rows = page.data.asMappedResults();
            result.push(...rows);
        });

        return [...data, ...result];
    }

    function search_fam_asset_v2() { //only get data if parent transaction is not Item Receipt )

        var search_asset = search.create({
            type: "customrecord_ncfar_asset",
            filters: [
                ["custrecord_assetsourcetrn.mainline", "is", "F"],
                "AND",
                ["custrecord_assetsourcetrn.taxline", "is", "F"],
                "AND",
                ["custrecord_assetsourcetrn.cogs", "is", "F"],
                "AND",
                ["custrecord_assetsourcetrn.shipping", "is", "F"],
                "AND",
                ["custrecord_assetsourcetrn.type", "noneof", "ItemRcpt"]
                // "AND",
                // ["internalid", "anyof", "2580"]
            ],
            columns: [
                search.createColumn({ name: "altname", label: "name" }),
                search.createColumn({ name: "custrecord_assetdepartment", label: "Department" }),
                search.createColumn({
                    name: "item",
                    join: "CUSTRECORD_ASSETSOURCETRN",
                    label: "Item"
                }),
                search.createColumn({ name: "internalid", label: "Internal ID" }),
                search.createColumn({
                    name: "formulatext",
                    formula: "case when {custrecord_assetsourcetrn.amount} < 1000000 then 'Non LVA' when {custrecord_assetsourcetrn.amount} >= 1000000 and {custrecord_assetsourcetrn.amount} < 2000000 then 'LVA' when {custrecord_assetsourcetrn.amount} >= 2000000 then 'FA' end",
                    label: "Asset Accounting Type"
                }),
                search.createColumn({ name: "custrecord_assetpurchasedate", label: "Purchase Date" }),
                search.createColumn({
                    name: "formulatext",
                    formula: "case when {custrecord_assetstatus} not like 'DISPOSED' then 'ACTIVE' else 'DISPOSED' END",
                    label: "Asset Status"
                }),
                search.createColumn({ name: "custrecord_assetlocation", label: "Location" }),
                search.createColumn({ name: "custrecord_assetdescr", label: "Asset Description" }),
                search.createColumn({ name: "custrecord_assetsourcetrn", label: "Parent Transaction" }),
                search.createColumn({
                    name: "type",
                    join: "CUSTRECORD_ASSETSOURCETRN",
                    label: "Type"
                }),
                search.createColumn({ name: "custrecord_assetsubsidiary", label: "Subsidiary" }),
                search.createColumn({ name: "name", label: "ID" }),
                search.createColumn({ name: "isinactive", label: "Inactive" }),
                search.createColumn({
                    name: "linesequencenumber",
                    join: "CUSTRECORD_ASSETSOURCETRN",
                    label: "Line Sequence Number"
                }),
                search.createColumn({ name: "custrecord_assetsourcetrnline", label: "Parent Transaction Line" }),
                search.createColumn({ name: "custrecord_assettype", label: "Asset Type" }),
            ]
        });

        var parent_item_receipt = [];
        var data_asset_arr = [];
        var id_parent_transaction = [];

        // Use runPaged() with a pageSize of 1000 (max allowed)
        var pagedData = search_asset.runPaged({ pageSize: 1000 });

        pagedData.pageRanges.forEach(function (pageRange) {
            var page = pagedData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                var columns = result.columns;

                let name = result.getValue(columns[0]);
                let department = result.getText(columns[1]);
                let subsidiary = result.getValue(columns[11]);
                let item = result.getValue(columns[2]);
                let item_code = result.getText(columns[2]);
                let asset_id = result.getValue(columns[3]);
                let asset_type = result.getText(columns[16]);
                let asset_accounting_type = result.getValue(columns[4]);
                let purchase_date = result.getValue(columns[5]);
                let asset_status = result.getValue(columns[6]);
                let location = result.getText(columns[7]);
                let location_id = result.getValue(columns[7]);
                let asset_description = result.getValue(columns[8]);
                let parent_transaction = result.getValue(columns[9]);
                let parent_transaction_type = result.getText(columns[10]);
                let id = result.getValue(columns[12]);
                let isinactive = result.getValue(columns[13]);
                let parent_transaction_sequence_number = result.getValue(columns[14]);
                let sequence_number_transaction = result.getValue(columns[15]);

                if (!data_asset_arr.some((data) => data.location_id == location_id && data.id == id )) {
                    id_parent_transaction.push(parent_transaction)
                    if (parent_transaction_sequence_number == sequence_number_transaction) {
                        data_asset_arr.push({
                            id: id,
                            name: name,
                            department: department,
                            subsidiary: subsidiary,
                            item: item,
                            item_code: item_code,
                            asset_id: asset_id,
                            asset_type: asset_type,
                            asset_accounting_type: asset_accounting_type,
                            asset_status: asset_status,
                            purchase_date: purchase_date,
                            location: location,
                            location_id: location_id,
                            asset_description: asset_description,
                            parent_transaction: parent_transaction,
                            parent_transaction_type: parent_transaction_type,
                            is_inactive: isinactive ? "T" : "F",
                        });
                        
                    }

                }


            });
        });

        log.debug("parent_item_receipt", parent_item_receipt)

        // Return or process data_asset_arr as needed
        return { data_asset_arr: data_asset_arr, parent_item_receipt: parent_item_receipt, id_parent_transaction: id_parent_transaction };
    }

    function _get(context) {
        var id = context.id;
        var type = context.type;
        var is_inactive = context.is_inactive;
        var main_line = context.mainline;
        var pages = (context.pages ? context.pages : 1);
        var itemid = context.itemid;
        var startRow = 0;
        var pageSize = 1000;


        let get_fam_asset = search_fam_asset_v2();
        let get_item_description = search_item_descriptionV2(get_fam_asset.data_asset_arr, get_fam_asset.parent_item_receipt, get_fam_asset.id_parent_transaction);

        log.debug("get_fam_asset", get_fam_asset.data_asset_arr)
        // log.debug("get_item_description", get_item_description)

        // executeMapReduce(get_item_description)

        return JSON.stringify(get_item_description);
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

    return {
        get: _get
    }
});
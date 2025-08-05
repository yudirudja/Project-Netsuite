/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
 define(["N/search"], function (search) {
    const SAVED_SEARCH = "customsearch_me_search_inv_adj"
    function _get(context) {
        var id = context.id;
        var type = context.type;
        var tranid = context.tranid;
        var is_inactive = context.is_inactive;
        var main_line = context.mainline;
        var pages = (context.pages ? context.pages : 1);
        var itemid = context.itemid;
        var startRow = 0;
        var pageSize = 1000;
        var trandateStart = context.trandate_start;
        var trandateEnd = context.trandate_end;
        var savedSearch = search.load({
            id: SAVED_SEARCH
        });

        var filters = savedSearch.filterExpression;
        if (id) {
            if (filters.length > 0) {
                filters.push("AND");
            }
            filters.push(['internalid', search.Operator.ANYOF, id]);
        }
        if (is_inactive) {
            if (filters.length > 0) {
                filters.push("AND");
            }
            filters.push(['isinactive', search.Operator.IS, is_inactive]);
        }

      if (trandateStart&&trandateEnd) {
            if (filters.length > 0) {
                filters.push("AND");
            }
            filters.push(['trandate','within', trandateStart,trandateEnd]);
        }
      
      if (tranid) {
            if (filters.length > 0) {
                filters.push("AND");
            }
            filters.push(['numbertext','is', tranid]);
        }
        log.debug("filters", filters);
        if (filters.length > 0) savedSearch.filterExpression = filters;



        var newArray = [];
        do {
            var savedSearchResult = savedSearch.run().getRange({
                start: startRow + ((pages - 1) * 1000),
                end: startRow + (pages * 1000)
            });
            for (var i = 0; i < savedSearchResult.length; i++) {
                var newObject = {};
                var result = savedSearchResult[i];
                for (var y = 0; y < result.columns.length; y++) {
                    var column_label = result.columns[y].label;
                    if (result.getText(result.columns[y]) === null) {
                        newObject[column_label] = result.getValue(result.columns[y]);
                    } else {
                        newObject[column_label] = result.getText(result.columns[y])
                    }
                }
                newArray.push(newObject);
            }
            startRow += pageSize
        } while (savedSearchResult.length === pageSize);
        return newArray;
    }

    return {
        get: _get
    }
});
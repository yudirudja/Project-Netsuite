/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */
define(['N/currentRecord'], function(currentRecord) {
    function pageInit(scriptContext) {
        try {
            var sublistId = 'itempricing'; // Sublist ID for Item Pricing

            setTimeout(function() {
                var rows = document.querySelectorAll(`[id^="${sublistId}_row"]`);
                rows.forEach(function(row) {
                    var priceLevelCell = row.querySelector(`[id*="${sublistId}_pricelevel"]`);
                    if (priceLevelCell && !priceLevelCell.innerText.includes('IKM1')) {
                        row.style.display = 'none'; // Hide all rows except IKM1
                    }
                });
            }, 1000); // Delay to allow sublist to render

        } catch (e) {
            console.log('Error hiding sublist rows:', e.message);
        }
    }

    return {
        pageInit: pageInit
    };
});

/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */


define(['N/record', 'N/error', 'N/search', 'N/runtime', './lib/moment.min'],
    /**
     * @param {record} record
     * @param {error} error
     * @param {search} search
     * @param {runtime} runtime
     * @param {moment} moment
     **/
    function (record, error, search, runtime, moment) {
        var returnValues = {};

        function doError(code, message, stack) {
            var error = {
                error: {
                    code: code,
                    message: message,
                    stack: stack
                }
            };
            log.error("error", error);
            return error;
        }

        function get(context) {
            var eventRouter = {
                'customer': doCustomerSearch
            };

            return eventRouter['customer'](context);
        }

        function doCustomerSearch(context) {
            try {
                var id = context.id; //sama
                var pages = (context.pages ? context.pages : 1);
                var startRow = 0;
                var pageSize = 1000;
                var columnArray =
                    [
                        search.createColumn({
                            name: "address1",
                            join: "Address",
                            label: "Address 1"
                        }),
                        search.createColumn({
                            name: "address2",
                            join: "Address",
                            label: "Address 2"
                        }),
                        search.createColumn({
                            name: "zipcode",
                            join: "Address",
                            label: "Zip Code"
                        }),
                        search.createColumn({
                            name: "city",
                            join: "Address",
                            label: "City"
                        }),
                        search.createColumn({ name: "entityid"}),
                        search.createColumn({ name: "vatregnumber"}),
                        search.createColumn({ name: "altname"}),
                        search.createColumn({ name: "isperson"}),
                        search.createColumn({ name: "firstname"}),
                        search.createColumn({ name: "lastname"}),
                        search.createColumn({ name: "companyname"}),
                        search.createColumn({ name: "email"}),
                        search.createColumn({ name: "phone"}),
                        search.createColumn({ name: "isinactive"}),
                        search.createColumn({ name: "custentity_me_autopedia_nik"})
                    ]
                // create saved search
                var customerSearch = search.create({
                    type: search.Type.CUSTOMER,
                    columns: columnArray,
                    filters: []
                });

                //filters
                var filters = customerSearch.filters;
                if (id) {
                    var idfilter = search.createFilter({
                        name: 'entityid',
                        operator: search.Operator.IS,
                        values: id //sama
                    });
                    filters.push(idfilter);
                }

                // declare array
                var newObject = [];

                do {
                    // run saved search
                    var customerSearchResultSet = customerSearch.run();

                    // always return max 1000 rows
                    var customerSearchResult = customerSearchResultSet.getRange({
                        start: startRow + ((pages - 1) * 1000),
                        end: startRow + (pages * 1000)
                    });

                    for (var i = 0; i < customerSearchResult.length; i++) {
                        var result = customerSearchResult[i];
                        var customer_internalid = result.id;
                        var customer_ID = result.getValue('vatregnumber');
                        var customer_name = result.getValue('altname');
                        var customer_isperson = result.getValue('isperson');
                        var customer_firstname = result.getValue('firstname');
                        var customer_lastname = result.getValue('lastname');
                        var customer_company = result.getValue('companyname');
                        var customer_email = result.getValue('email');
                        var customer_phone = result.getValue('phone');
                        var customer_billaddr1 = result.getValue({
                            name: "address1",
                            join: "Address"
                        });
                        var customer_billaddr2 = result.getValue({
                            name: "address2",
                            join: "Address"
                        });
                        var customer_city = result.getValue({
                            name: "city",
                            join: "Address"
                        });
                        var customer_zip = result.getValue({
                            name: "zipcode",
                            join: "Address"
                        });
                        var customer_isinactive = result.getValue('isinactive');
                        var customer_nik = result.getValue('custentity_me_autopedia_nik');
                        var customer_entityid = result.getValue('entityid');


                        //var locationAreaFinanceText = result.getText('custrecord3');

                        // add new array
                        newObject.push({
                            Internal_id: customer_internalid,
                            Entity_id: customer_entityid,
                            ID: customer_ID,
                            Name: customer_name,
                            Is_person: customer_isperson,
                            First_name: customer_firstname,
                            Last_name: customer_lastname,
                            Company: customer_company,
                            Email: customer_email,
                            Phone: customer_phone,
                            Address_1: customer_billaddr1,
                            Address_2: customer_billaddr2,
                            City: customer_city,
                            Zip: customer_zip,
                            Is_Inactive: customer_isinactive,
                            NIK: customer_nik
                        });
                    }
                    startRow += pageSize
                } while (customerSearchResult.length === pageSize);
                return newObject;
            } catch (error) {
                return doError(error.name, error.message, error.stack)
            }
        }

        returnValues.get = get;
        return returnValues;
    })
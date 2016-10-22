var app = angular.module('reportsApp', ['ngResource', 'chart.js','ui.bootstrap','angularUtils.directives.dirPagination', 'ui.tree', 'daterangepicker']).config(function(treeConfig) {
  treeConfig.defaultCollapsed = true; // collapse nodes by default
});;

app.factory('Notes', ['$resource', function($resource) {
return $resource('/testview/api/reports/:id', null,
    {
        'update': { method:'PUT' }
    });
}]);

app.filter('unique', function () {
    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {

                    var resolveSearch = function(object, keyString){
                        if(typeof object == 'undefined'){
                            return object;
                        }
                        var values = keyString.split(".");
                        var firstValue = values[0];
                        keyString = keyString.replace(firstValue + ".", "");
                        if(values.length > 1){
                            return resolveSearch(object[firstValue], keyString);
                        } else {
                            return object[firstValue];
                        }
                    }

                    return resolveSearch(item, filterOn);
                } else {
                    return item;
                }
            };

            angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    if(typeof item != 'undefined'){
                        newItems.push(item);
                    }
                }

            });
            items = newItems;
        }
        return items;
    };
});


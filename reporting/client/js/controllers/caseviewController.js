app.controller('caseviewController', ['$scope', '$http', '$resource', '$location', function($scope, $http, $resource, $location) {


    // base restful SERVICE url
    var Report = $resource('reports/api/reports');

    $scope.loading = false;

    var es = [];
    var ukr = [];
    var end = [];

    // the total cases for each folder
    var num_of_cases_ES = 0;
    var num_of_cases_UKR = 0;
    var num_of_cases_END = 0;

    // getting the cycles
    Report.query(function(results) {
        $scope.platforms = results;
    });


    // function called when "Get Case" is clicked
    $scope.getCases = function() {
        $scope.loading = true;

        // show progress loading 
        $http.get('/caseview/api/cases/' + $scope.cycleName).success(function(results) {
            
            if (results[0].msg == 'None Found') {
                alert('None Found');
            } else {
                // clearing the arrays
                es = [];
                ukr = [];
                end = [];
                $scope.testcases = results;
                num_of_cases_ES = 0;
                num_of_cases_UKR = 0;
                num_of_cases_END = 0;
                //ES - El Segundo Folder
                //UK - UKR Folder
                //En - End User Folder
                for (var i = 0; i < results.length; i++) {
                    if (results[i].CF_ITEM_NAME.substring(0, 2).toUpperCase() == 'ES'.toUpperCase()) {
                        es.push(results[i]);
                        num_of_cases_ES++;
                    } else if (results[i].CF_ITEM_NAME.substring(0, 2).toUpperCase() == 'UK'.toUpperCase()) {
                        ukr.push(results[i]);
                        num_of_cases_UKR++;
                    } else if (results[i].CF_ITEM_NAME.substring(0, 2).toUpperCase() == 'EN'.toUpperCase()) {
                        end.push(results[i]);
                        num_of_cases_END++;
                    }
                }

                // go through all the results and get all the Features for a particular folder,(ES,UKR,END_USER)
                // then, put them in a array of strings, each element is feature name, taking care of duplicates
                var featuresES = []; // list of objects of features
                var featuresUKR = [];
                var featuresEND = [];
                for (var i = 0; i < es.length; i++) {
                    if (featuresES.indexOf(es[i].Feature) == -1) {
                        featuresES.push(es[i].Feature);
                    }
                }
                for (var i = 0; i < ukr.length; i++) {
                    if (featuresUKR.indexOf(ukr[i].Feature) == -1) {
                        featuresUKR.push(ukr[i].Feature);
                    }
                }
                for (var i = 0; i < end.length; i++) {
                    if (featuresEND.indexOf(end[i].Feature) == -1) {
                        featuresEND.push(end[i].Feature);
                    }
                }

                // go through all the results and get all the Test Procedures For a Particular folder, then put them in array of strings
                var proceduresES = [];
                var proceduresUKR = [];
                var proceduresEND = [];
                for (var i = 0; i < es.length; i++) {
                    if (proceduresES.indexOf(es[i].TEST_PROCEDURE) == -1) {
                        proceduresES.push(es[i].TEST_PROCEDURE);
                    }
                }
                for (var i = 0; i < ukr.length; i++) {
                    if (proceduresUKR.indexOf(ukr[i].TEST_PROCEDURE) == -1) {
                        proceduresUKR.push(ukr[i].TEST_PROCEDURE);
                    }
                }
                for (var i = 0; i < end.length; i++) {
                    if (proceduresEND.indexOf(end[i].TEST_PROCEDURE) == -1) {
                        proceduresEND.push(end[i].TEST_PROCEDURE);
                    }
                }


                // creating a leaf object for each folders, the cases are going to be get added on the nodes [] 
                // under each feature
                var featuresES_WITH_CASES = [];
                var featuresUKR_WITH_CASES = [];
                var featuresEND_WITH_CASES = [];
                for (var i = 0; i < featuresES.length; i++) {
                    var obj = { 'title': featuresES[i], 'nodes': [], 'size': 0 };
                    featuresES_WITH_CASES.push(obj);
                }
                for (var i = 0; i < featuresUKR.length; i++) {
                    var obj = { 'title': featuresUKR[i], 'nodes': [], 'size': 0 };
                    featuresUKR_WITH_CASES.push(obj);
                }
                for (var i = 0; i < featuresEND.length; i++) {
                    var obj = { 'title': featuresEND[i], 'nodes': [], 'size': 0 };
                    featuresEND_WITH_CASES.push(obj);
                }

                // creating a leaf object for each folders, the cases are going to be get added on the nodes [] 
                // under each feature
                var proceduresES_WITH_CASES = [];
                var proceduresUKR_WITH_CASES = [];
                var proceduresEND_WITH_CASES = [];
                for (var i = 0; i < proceduresES.length; i++) {
                    var obj = { 'title': proceduresES[i], 'nodes': [], 'size': 0 };
                    proceduresES_WITH_CASES.push(obj);
                }
                for (var i = 0; i < proceduresUKR.length; i++) {
                    var obj = { 'title': proceduresUKR[i], 'nodes': [], 'size': 0 };
                    proceduresUKR_WITH_CASES.push(obj);
                }
                for (var i = 0; i < proceduresEND.length; i++) {
                    var obj = { 'title': proceduresEND[i], 'nodes': [], 'size': 0 };
                    proceduresEND_WITH_CASES.push(obj);
                }

                // using the array of string populated above, matching the folder a partciular case with the string in array,
                // adding it to array of objects('title' : ___   
                //                               'nodes' :  ) to take care of the leaves
                for (var i = 0; i < es.length; i++) {
                    for (var k = 0; k < proceduresES_WITH_CASES.length; k++) {
                        if (proceduresES_WITH_CASES[k].title == es[i].TEST_PROCEDURE) {
                            var caseObj = { 'title': es[i].TESTCASE };
                            proceduresES_WITH_CASES[k].nodes.push(caseObj);
                        }
                    }
                }
                for (var i = 0; i < ukr.length; i++) {
                    for (var k = 0; k < proceduresUKR_WITH_CASES.length; k++) {
                        if (proceduresUKR_WITH_CASES[k].title == ukr[i].TEST_PROCEDURE) {
                            var caseObj = { 'title': ukr[i].TESTCASE };
                            proceduresUKR_WITH_CASES[k].nodes.push(caseObj);
                        }
                    }
                }
                for (var i = 0; i < end.length; i++) {
                    for (var k = 0; k < proceduresEND_WITH_CASES.length; k++) {
                        if (proceduresEND_WITH_CASES[k].title == end[i].TEST_PROCEDURE) {
                            var caseObj = { 'title': end[i].TESTCASE };
                            proceduresEND_WITH_CASES[k].nodes.push(caseObj);
                        }
                    }
                }

                //using the array of string populated above, matching the folder a partciular case with the string in array,
                // adding it to array of objects('title' : ___   
                //                               'nodes' :  ) to take care of the leaves
                for (var i = 0; i < es.length; i++) {
                    for (var k = 0; k < featuresES_WITH_CASES.length; k++) {
                        if (featuresES_WITH_CASES[k].title == es[i].Feature) {
                            var caseObj = { 'title': es[i].TESTCASE };
                            featuresES_WITH_CASES[k].nodes.push(caseObj);
                        }
                    }
                }
                for (var i = 0; i < ukr.length; i++) {
                    for (var k = 0; k < featuresUKR_WITH_CASES.length; k++) {
                        if (featuresUKR_WITH_CASES[k].title == ukr[i].Feature) {
                            var caseObj = { 'title': ukr[i].TESTCASE };
                            featuresUKR_WITH_CASES[k].nodes.push(caseObj);
                        }
                    }
                }
                for (var i = 0; i < end.length; i++) {
                    for (var k = 0; k < featuresEND_WITH_CASES.length; k++) {
                        if (featuresEND_WITH_CASES[k].title == end[i].Feature) {
                            var caseObj = { 'title': end[i].TESTCASE };
                            featuresEND_WITH_CASES[k].nodes.push(caseObj);
                        }
                    }
                }

                // populating how many cases there are for each features
                for (var i = 0; i < featuresES.length; i++) {
                    featuresES_WITH_CASES[i].size = featuresES_WITH_CASES[i].nodes.length;
                }
                for (var i = 0; i < featuresUKR.length; i++) {
                    featuresUKR_WITH_CASES[i].size = featuresUKR_WITH_CASES[i].nodes.length;
                }
                for (var i = 0; i < featuresEND.length; i++) {
                    featuresEND_WITH_CASES[i].size = featuresEND_WITH_CASES[i].nodes.length;
                }

                // populating how many cases there are for each TEST procedures
                for (var i = 0; i < proceduresES.length; i++) {
                    proceduresES_WITH_CASES[i].size = proceduresES_WITH_CASES[i].nodes.length;
                }
                for (var i = 0; i < proceduresUKR.length; i++) {
                    proceduresUKR_WITH_CASES[i].size = proceduresUKR_WITH_CASES[i].nodes.length;
                }
                for (var i = 0; i < proceduresEND.length; i++) {
                    proceduresEND_WITH_CASES[i].size = proceduresEND_WITH_CASES[i].nodes.length;
                }



                function compare(a, b) {
                    if (a.title < b.title)
                        return -1;
                    if (a.title > b.title)
                        return 1;
                    return 0;
                }

                featuresES_WITH_CASES.sort(compare);
                featuresUKR_WITH_CASES.sort(compare);
                featuresEND_WITH_CASES.sort(compare);
                proceduresES_WITH_CASES.sort(compare);
                proceduresUKR_WITH_CASES.sort(compare);
                proceduresEND_WITH_CASES.sort(compare);


                //console.log(JSON.stringify(featuresES_WITH_CASES, null, "    "));
                //
                if ($scope.sortByValue == 'feature') {
                    $scope.data = [{
                        'title': 'ES',
                        'nodes': featuresES_WITH_CASES,
                        'size': num_of_cases_ES
                    }, {

                        'title': 'UKR',
                        'nodes': featuresUKR_WITH_CASES,
                        'size': num_of_cases_UKR
                    }, {
                        'title': 'End User',
                        'nodes': featuresEND_WITH_CASES,
                        'size': num_of_cases_END
                    }];
                } else {
                    $scope.data = [{
                        'title': 'ES',
                        'nodes': proceduresES_WITH_CASES,
                        'size': num_of_cases_ES
                    }, {

                        'title': 'UKR',
                        'nodes': proceduresUKR_WITH_CASES,
                        'size': num_of_cases_UKR
                    }, {
                        'title': 'End User',
                        'nodes': proceduresEND_WITH_CASES,
                        'size': num_of_cases_END
                    }];
                }
                $scope.totalCase = num_of_cases_ES + num_of_cases_UKR + num_of_cases_END;
                $scope.chosenCycle = $scope.cycleName;
                    
            }

            $scope.loading = false;

        });

    }


    $scope.changeSelect = function(type) {
        if($scope.cycle != undefined){
            $scope.cycleType = $scope.cycle.cycleType;
            $scope.cycleName = $scope.cycle.cycleName;
        }

    }
    $scope.sortByValue = 'feature';


    // code for tree
    $scope.toggle = function(scope) {
        scope.toggle();
    };

    $scope.collapseAll = function() {
        $scope.$broadcast('angular-ui-tree:collapse-all');
    };

    $scope.expandAll = function() {
        $scope.$broadcast('angular-ui-tree:expand-all');
    };


    // initial empty tree
    $scope.data = [{
        'title': 'ES',
        'nodes': [],
        'size': 0
    }, {
        'title': 'UKR',
        'nodes': [],
        'size': 0
    }, {
        'title': 'End User',
        'nodes': [],
        'size': 0

    }];



}]);

app.controller('trendController', ['$scope', '$resource', '$location', function($scope, $resource, $location) {

    console.log($scope.platform);
    // default Configuration for Graph
    $scope.series = ['QC', 'USER'];
    $scope.options = {
        responsive: true,
        maintainAspectRatio: false,

    };

    Chart.defaults.global.colours = [
        '#E90808', // red
        '#201BF9' // blue
    ];

    // default date Range values
    $scope.date_comp = { startDate: null, endDate: null };
    $scope.date_reg = { startDate: null, endDate: null };

    // used to populate Platform Select
    $scope.platforms = ['H2X', 'HR2X', 'Client', 'Genie', 'Dre'];

    // array used for populating charts

    var copyOfResults = [];
    var regressionQC = [];
    var regressionUSER = [];
    var regressionCycleList = [];

    var comprehensiveQC = [];
    var comprehensiveUSER = [];
    var comprehensiveCycleList = [];

    // 
    var regressionObjects = [];
    var comprehensiveObjects = [];


    // used to temporarily store and pop for checkboxes
    var tempRegressionQC = [];
    var tempRegressionUSER = [];
    var tempComprehensiveQC = [];
    var tempComprehensiveUSER = [];
    var tempRegressionQC_all = [];
    var tempRegressionUSER_all = [];
    var tempComprehensiveQC_all = [];
    var tempComprehensiveUSER_all = [];

    var tempComprehensiveLabel = [];
    var tempComprehensiveLabel_all = [];
    var tempRegressionLabel = [];
    var tempRegressionLabel_all = [];

    var regression_switch = [];
    var comprehensive_switch = [];



    $scope.changePlatformSelection = function() {

        if (this.platform != null) {
            console.log('Selected - ' + this.platform);

            copyOfResults = [];
            regressionQC = [];
            regressionUSER = [];
            regressionCycleList = [];

            comprehensiveQC = [];
            comprehensiveUSER = [];
            comprehensiveCycleList = [];
            // 
            regressionObjects = [];
            comprehensiveObjects = [];

            tempRegressionQC = [];
            tempRegressionUSER = [];
            tempComprehensiveUSER = [];
            tempComprehensiveQC = [];

            tempRegressionQC_all = [];
            tempRegressionUSER_all = [];
            tempComprehensiveQC_all = [];
            tempComprehensiveUSER_all = [];

            tempComprehensiveLabel = [];
            tempComprehensiveLabel_all = [];
            tempRegressionLabel = [];
            tempRegressionLabel_all = [];

            regression_switch = [];
            comprehensive_switch = [];

            console.log('in trendController client');

            // base restful SERVICE url
            // 
            var Report = $resource('trendview/api/reports/' + this.platform);
            // getting data from the server DB, the results holds the list from the server RESPONSE
            Report.query(function(results) {
                if (results.length == 0) {
                    $scope.platform = null;
                    alert('None Found');

                } else {

                    $scope.reports = results;

                    //console.log('results length is ' + results.length);
                    copyOfResults = results.slice();
                    //console.log('copyofresults length is ' + copyOfResults.length);

                    // divided them by cycle type
                    for (var i = 0; i < copyOfResults.length; i++) {
                        console.log(results[i]._id + ': ' + results[i].startDate);
                        console.log(results[i]._id + ': ' + new Date(results[i].startDate).getTime() / 1000 + '\n\n');
                        if (results[i].cycleType == 'regression') {
                            regressionObjects.push(results[i]);
                        } else if (results[i].cycleType == 'comprehensive') {
                            comprehensiveObjects.push(results[i]);
                        } else {
                            console.log('Should not be..');
                        }
                    }



                    if (regressionObjects.length != 0) {
                        regressionObjects.sort(compareDates); // sorted by Dates
                        $scope.date_reg = { startDate: moment(regressionObjects[0].startDate, "MM-DD-YYYY"), endDate: moment(regressionObjects[regressionObjects.length - 1].startDate, "MM-DD-YYYY") };
                        for (var i = 0; i < regressionObjects.length; i++) {
                            regressionCycleList.push(regressionObjects[i]._id);
                            // converting to hours
                            regressionQC.push(Math.floor(regressionObjects[i].sum_qc / 3600));
                            regressionUSER.push(Math.floor(regressionObjects[i].sum_tester / 3600));
                        }
                    }

                    if (comprehensiveObjects.length != 0) {

                        comprehensiveObjects.sort(compareDates); // sorted by Dates
                        $scope.date_comp = { startDate: moment(comprehensiveObjects[0].startDate, "MM-DD-YYYY"), endDate: moment(comprehensiveObjects[comprehensiveObjects.length - 1].startDate, "MM-DD-YYYY") };

                        for (var i = 0; i < comprehensiveObjects.length; i++) {
                            comprehensiveCycleList.push(comprehensiveObjects[i]._id);
                            // converting to hours
                            comprehensiveQC.push(Math.floor(comprehensiveObjects[i].sum_qc / 3600));
                            comprehensiveUSER.push(Math.floor(comprehensiveObjects[i].sum_tester / 3600));
                        }
                    }



                    $scope.labels3 = comprehensiveCycleList;


                    // used to populate table for Graph by Checkbox
                    $scope.compObjs = comprehensiveObjects;
                    $scope.regObjs = regressionObjects;


                    $scope.data3 = [
                        comprehensiveQC,
                        comprehensiveUSER
                    ];

                    $scope.labels4 = regressionCycleList;
                    $scope.data4 = [
                        regressionQC,
                        regressionUSER
                    ];


                    // initially setting the array to be all true
                    // 

                    for (var i = 0; i < regressionQC.length; i++) {
                        console.log()
                        // switch are the checkboxes
                        regression_switch[i] = true;
                    }

                    console.log('regression SIZE is ******************    ' + regression_switch.length);



                    for (var i = 0; i < comprehensiveQC.length; i++) {
                        comprehensive_switch[i] = true;
                    }


                    tempRegressionQC = angular.copy(regressionQC);
                    tempRegressionUSER = angular.copy(regressionUSER);
                    tempComprehensiveQC = angular.copy(comprehensiveQC);
                    tempComprehensiveUSER = angular.copy(comprehensiveUSER);


                    // used for graph by checkboxes
                    $scope.regression_check = [
                        tempRegressionQC,
                        tempRegressionUSER
                    ];
                    $scope.comprehensive_check = [
                        tempComprehensiveQC,
                        tempComprehensiveUSER
                    ]


                    // master copy 
                    tempRegressionQC_all = angular.copy(regressionQC);
                    tempRegressionUSER_all = angular.copy(regressionUSER);
                    tempComprehensiveQC_all = angular.copy(comprehensiveQC);
                    tempComprehensiveUSER_all = angular.copy(comprehensiveUSER);
                    /*var tempRegressionQC = regressionQC.slice();
                var tempRegressionUSER = regressionUSER.slice();
                var tempComprehensiveQC = comprehensiveQC.slice();
                var tempComprehensiveUSER = comprehensiveUSER.slice();
*/
                    $scope.tempRegression = [
                        tempRegressionQC_all,
                        tempRegressionUSER_all
                    ];

                    $scope.tempComprehensive = [
                        tempComprehensiveQC_all,
                        tempComprehensiveUSER_all
                    ]


                    $scope.tempRegressionLabel_all = angular.copy(regressionCycleList);
                    $scope.tempComprehensiveLabel_all = angular.copy(comprehensiveCycleList);

                    $scope.tempRegressionLabel = angular.copy(regressionCycleList);
                    $scope.tempComprehensiveLabel = angular.copy(comprehensiveCycleList);


                }
            }); // end of Report.query()

        }



        // function called when checkbox for Regression is checked/unchecked

        $scope.regressionCheckbox = function(name, index) {

            // flipping the switch 
            regression_switch[index] = !regression_switch[index];

            // clear the data
            $scope.tempRegressionLabel = [];
            $scope.regression_check[0] = [];
            $scope.regression_check[1] = [];
            for (var i = 0; i < regression_switch.length; i++) {
                if (regression_switch[i] == true) {
                    $scope.tempRegressionLabel.push($scope.tempRegressionLabel_all[i]);
                    $scope.regression_check[0].push($scope.tempRegression[0][i]);
                    $scope.regression_check[1].push($scope.tempRegression[1][i]);
                }
            }
        }

        // function called when checkbox for Comprehensive is checked/unchecked
        $scope.comprehensiveCheckbox = function(name, index) {
            // flipping the switch 
            comprehensive_switch[index] = !comprehensive_switch[index];

            // clear the data
            $scope.tempComprehensiveLabel = [];
            $scope.comprehensive_check[0] = [];
            $scope.comprehensive_check[1] = [];
            for (var i = 0; i < comprehensive_switch.length; i++) {
                if (comprehensive_switch[i] == true) {
                    $scope.tempComprehensiveLabel.push($scope.tempComprehensiveLabel_all[i]);
                    $scope.comprehensive_check[0].push($scope.tempComprehensive[0][i]);
                    $scope.comprehensive_check[1].push($scope.tempComprehensive[1][i]);
                }
            }
        }

        // function that displays the Date Range Graph
        $scope.getDateRangeGraphComp = function() {
            console.log('startDate : ' + $scope.date_comp.startDate + '      endDate : ' + $scope.date_comp.endDate);
            console.log('mockDate :' + new Date('07/11/2016').getTime() + '\n\n');

            // clear
            comprehensiveQC = [];
            comprehensiveUSER = [];
            comprehensiveCycleList = [];
            dateTimeStamp = 0;


            for (var i = 0; i < comprehensiveObjects.length; i++) {
                var dateTimeStamp = new Date(comprehensiveObjects[i].startDate).getTime();
                // if they are in the dateRange 
                if ($scope.date_comp.startDate <= dateTimeStamp &&
                    dateTimeStamp <= $scope.date_comp.endDate) {
                    comprehensiveCycleList.push(comprehensiveObjects[i]._id);
                    comprehensiveQC.push(Math.floor(comprehensiveObjects[i].sum_qc / 3600));
                    comprehensiveUSER.push(Math.floor(comprehensiveObjects[i].sum_tester / 3600));
                }
            }

            $scope.labels3 = comprehensiveCycleList;
            $scope.data3 = [
                comprehensiveQC,
                comprehensiveUSER
            ];

            $scope.labels4 = regressionCycleList;
            $scope.data4 = [
                regressionQC,
                regressionUSER
            ];

        }

        // function that displays the Date Range Graph
        $scope.getDateRangeGraphReg = function() {
            console.log('startDate : ' + $scope.date_reg.startDate + '      endDate : ' + $scope.date_reg.endDate);
            console.log('mockDate :' + new Date('07/11/2016').getTime() + '\n\n');
            // clear
            regressionQC = [];
            regressionUSER = [];
            regressionCycleList = [];
            dateTimeStamp = 0;

            for (var i = 0; i < regressionObjects.length; i++) {
                var dateTimeStamp = new Date(regressionObjects[i].startDate).getTime();
                // if they are in the dateRange 
                if ($scope.date_reg.startDate <= dateTimeStamp &&
                    dateTimeStamp <= $scope.date_reg.endDate) {
                    regressionCycleList.push(regressionObjects[i]._id);
                    regressionQC.push(Math.floor(regressionObjects[i].sum_qc / 3600));
                    regressionUSER.push(Math.floor(regressionObjects[i].sum_tester / 3600));
                }
            }
            $scope.labels4 = regressionCycleList;
            $scope.data4 = [
                regressionQC,
                regressionUSER
            ];
        }

    }

    // used to sort the objects by Date
    function compareDates(a, b) {
        var dateA = new Date(a.startDate),
            dateB = new Date(b.startDate);
        return dateA - dateB;
    }

}]);

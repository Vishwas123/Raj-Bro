app.controller('progressController', ['$scope', '$http', '$resource', '$location', function($scope, $http, $resource, $location) {

    // base restful SERVICE url
    var Cycles = $resource('progressview/api/cycles');
    var TestInfo = $resource('progressview/api/reports', {}, {
        gettest: { method: 'POST', isArray: true }
    });
    var AvgInfo = $resource('progressview/api/avg', {}, {
        getavg: { method: 'POST', isArray: true }
    });

    // initially setting the sortKey to testId
    $scope.sortKey = 'DIFFERENCE';

    // when true, looading GIF will show
    $scope.loading = false;


    // getting the cycles for the dropdown
    Cycles.query(function(results) {
        $scope.platforms = results;

    });


    // initializing the variables
    var count_passed = 0;
    var count_failed = 0;
    var count_norun = 0;
    var count_notcompleted = 0;
    var error_count = 0;


    // totalTimeCompleted/ totalTime  =======>   progress
    $scope.totalTimeCompleted = 0;  // SUM of all the test completed in this particular cycle
    $scope.totalTime = 0;           // SUM of average of all tests in cycle


    // variables for El Segundo
    $scope.total_completed_es = 0;
    $scope.total_expected_mongo_es = 0; // AVG of all the runs for a test from All the Reports 
    $scope.total_expected_qc_es = 0; // AVG of all the runs for a test from QC Database
    var count_passed_es = 0;
    var count_failed_es = 0;
    var count_norun_es = 0;
    var count_notcompleted_es = 0;

    // variables for UKR
    $scope.total_completed_ukr = 0;
    $scope.total_expected_mongo_ukr = 0; // AVG of all the runs for a test from All the Reports 
    $scope.total_expected_qc_ukr = 0; // AVG of all the runs for a test from QC Database     
    var count_passed_ukr = 0;
    var count_failed_ukr = 0;
    var count_norun_ukr = 0;
    var count_notcompleted_ukr = 0;


    // function called when get progress is clicked
    $scope.getTests = function() {

        // show progress loading 
        $scope.loading = true;

        // GET request to QC DB.   server/controller/progressContorller.js - getTests();
        $http.get('/progressview/api/tests/' + $scope.cycleName).success(function(results) {

            // clearing the variables
            resetCount(); // resets the count variables for all 
            var list_of_test_ids = [];
            var list_of_test_names = [];
            if (results[0].msg == 'None Found') {
                alert('None Found');
            } else {

                $scope.testProcedures = results;
                for (var i = 0; i < results.length; i++) {
                    // push the test ids to the array to be used to query from mongoDB
                    list_of_test_ids.push(results[i].TC_TEST_ID);
                    list_of_test_names.push(results[i].TS_NAME);                  
                    testCounter(results[i]);
                }

                // $scope.totalTime == TOTAL DURATION of the cycle. ES + UKR time from QC
                $scope.totalTime = Math.ceil($scope.totalTime / 3600);         

                // using the list of test_ids from QC Database, get the testinfo 
                // from mongo reports DB
                // 
                // not really saving, it is getting request
                // 
                TestInfo.gettest({}, {
                    testids: list_of_test_ids,
                    testnames: list_of_test_names,
                    cyclename: $scope.cycleName
                }, function(results) {
                    // results = data from mongODB
                    for (var i = 0; i < results.length; i++) {
                        for (var j = 0; j < $scope.testProcedures.length; j++) {
                            if ($scope.testProcedures[j].TS_NAME == results[i].testname) {
                                // TOTAL_TIME_STRING is to display in Hrs and Mins
                                // TOTAL_TIME is to be used for sorting key 
                                $scope.testProcedures[j].TOTAL_TIME_STRING = convert_To_Hrs_And_Mins(results[i].total_time)
                                $scope.testProcedures[j].TOTAL_TIME = results[i].total_time;
                                $scope.testProcedures[j].TESTER = results[i].testerid;
                                // !!!! results[i].totalTime === Each Report's time


                            }
                        }
                    }

                    $scope.total_expected_qc_es = Math.ceil($scope.total_expected_qc_es / 3600);
                    $scope.totalTimeCompleted = Math.round($scope.totalTimeCompleted / 3600);
                    
           
                    // Pie Graph - Total Hours Done vs Total Hours Left
                    $scope.labels2 = ["Hours Left", "Hours Done"];
                    $scope.data2 = [$scope.totalTime - $scope.totalTimeCompleted, $scope.totalTimeCompleted];
                    $scope.totalDoneProgress = Math.round($scope.totalTimeCompleted / $scope.totalTime * 100);
                    $scope.totalLeftProgress = 100 - $scope.totalDoneProgress;

                });

                AvgInfo.getavg({}, { testids: list_of_test_ids }, function(results) {

                    for (var i = 0; i < results.length; i++) {
                        for (var j = 0; j < $scope.testProcedures.length; j++) {

                            if ($scope.testProcedures[j].TC_TEST_ID == results[i]._id) {
                                /* Set the Expected value from the result
                                 * EXPECTED_STRING is to display in Hrs and Mins
                                 * EXPECTED is to be used for sorting key  */
                                $scope.testProcedures[j].EXPECTED_MONGO = results[i].avg_total;
                                $scope.testProcedures[j].EXPECTED_STRING_MONGO = convert_To_Hrs_And_Mins(results[i].avg_total);

                                // set the difference of the Expected VS Actual
                                var difference_mongo = $scope.testProcedures[j].EXPECTED - $scope.testProcedures[j].TOTAL_TIME;
                                $scope.testProcedures[j].DIFFERENCE = difference_mongo;
                                // DIFFERENCE_STRING is to display in Hrs and Mins
                                // DIFFERENCE is to be used for sorting key                                
                                $scope.testProcedures[j].DIFFERENCE_STRING = convert_To_Hrs_And_Mins(difference_mongo);

                                // tracking total_expected
                                $scope.total_expected_mongo_es += results[i].avg_total;
                            }
                        }
                    }
                    $scope.total_completed_es = Math.round($scope.total_completed_es / 3600);
                    $scope.total_expected_mongo_es = Math.ceil($scope.total_expected_mongo_es / 3600);
/*                    $scope.test_toggle = true;*/
                    // console.log(JSON.stringify(results, null, "    "));
                });


                // Total Count = ES count + UKR count
                $scope.count_passed = count_passed;
                $scope.count_failed = count_failed;
                $scope.count_norun = count_norun;
                $scope.count_notcompleted = count_notcompleted;
                $scope.error_count = error_count;

                // ES count
                $scope.count_passed_es = count_passed_es;
                $scope.count_failed_es = count_failed_es;
                $scope.count_norun_es = count_norun_es;
                $scope.count_notcompleted_es = count_notcompleted_es;

                // UKR count
                $scope.count_passed_ukr = count_passed_ukr;
                $scope.count_failed_ukr = count_failed_ukr;
                $scope.count_norun_ukr = count_norun_ukr;
                $scope.count_notcompleted_ukr = count_notcompleted_ukr;

                // Total's Pie Chart Data
                $scope.labels = ["Failed", "Passed", "No Run", "Not Completed"];
                $scope.data = [count_failed, count_passed, count_norun, count_notcompleted];

                // Total number of Tests (ES + UKR)
                $scope.total = count_passed + count_failed + count_norun + count_notcompleted;
                $scope.chosenCycle = $scope.cycleName;


            } // end of else

            // Resets the Loading GIF
            $scope.loading = false;
        });

    }

    // all the functions
    // increments counter depending on which folder that test belongs to
    var testCounter = function(obj) {

        $scope.totalTime += obj.avg_qc;          

        if (startsWith(obj.FOLDER, 'ES')) {
            $scope.total_expected_qc_es += obj.avg_qc;
            if (obj.TC_STATUS == 'Passed') {
                count_passed_es++;
                count_passed++;
            } else if (obj.TC_STATUS == 'Failed') {
                count_failed_es++;
                count_failed++;
            } else if (obj.TC_STATUS == 'No Run') {
                count_norun_es++;
                count_norun++;
            } else if (obj.TC_STATUS == 'Not Completed') {
                count_notcompleted_es++;
                count_notcompleted++;
            }
        } else if (startsWith(obj.FOLDER, 'UKR')) {
            $scope.total_expected_qc_ukr += obj.avg_qc;            
            if (obj.TC_STATUS == 'Passed') {
                count_passed_ukr++;
                count_passed++;
            } else if (obj.TC_STATUS == 'Failed') {
                count_failed_ukr++;
                count_failed++;
            } else if (obj.TC_STATUS == 'No Run') {
                count_norun_ukr++;
                count_norun++;
            } else if (obj.TC_STATUS == 'Not Completed') {
                count_notcompleted_ukr++;
                count_notcompleted++;
            }
        } else {

            error_count++;
        }

    }

    var startsWith = function(str, prefix) {
        if (str.length < prefix.length)
            return false;
        for (var i = prefix.length - 1;
            (i >= 0) && (str[i] === prefix[i]); --i)
            continue;
        return i < 0;
    }

    // resets all the count
    var resetCount = function() {
        count_passed_end_user = 0;
        count_failed_end_user = 0;
        count_norun_end_user = 0;
        count_notcompleted_end_user = 0;
        count_passed_es = 0;
        count_failed_es = 0;
        count_norun_es = 0;
        count_notcompleted_es = 0;
        count_passed_ukr = 0;
        count_failed_ukr = 0;
        count_norun_ukr = 0;
        count_notcompleted_ukr = 0;
        count_passed = 0;
        count_failed = 0;
        count_norun = 0;
        count_notcompleted = 0;
    }


    // function called when Cycle Selection changes
    $scope.changeSelect = function(type) {
        $scope.cycleType = $scope.cycle.cycleType;
        $scope.cycleName = $scope.cycle.cycleName;
    }

    // this is the sort(keyname) function called in <th> in tableview.html
    // to toggle a switch
    $scope.sort = function(keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //function called to expand/collapse individual table
    $scope.toggle = function(table) {

        if (table == 'ES') {
            $scope.es_toggle = !$scope.es_toggle; // used for showing <tbody> 
            $scope.es_change = !$scope.es_change; // used for glyphicon toggle + / - 
        } else if (table == 'UKR') {
            $scope.ukr_toggle = !$scope.ukr_toggle;
            $scope.ukr_change = !$scope.ukr_change;
        } else if (table == 'END_USER') {
            $scope.end_toggle = !$scope.end_toggle;
            $scope.end_change = !$scope.end_change;
        }
    }


    // function to convert seconds into String of "_ hrs _ mins"
    var convert_To_Hrs_And_Mins = function(secs) {
        var total_seconds = Math.abs(secs);
        var total_minutes = total_seconds / 60;
        var seconds = total_seconds % 60;
        var hours = Math.floor(total_minutes / 60);
        var minutes = Math.floor(total_minutes % 60);

        if (minutes < 10) {

            return (hours + ":0" + minutes);
        } else {

            return (hours + ":" + minutes);
        }
    }

    // used for pie graphs
    $scope.labels = [];
    $scope.data = [];
    $scope.labels2 = [];
    $scope.data2 = [];
    $scope.options = {
        responsive: false,
        tooltipEvents: [],
        showTooltips: true,
        tooltipCaretSize: 0,
        onAnimationComplete: function() {
            this.showTooltip(this.segments, true);
        },
        maintainAspectRatio: false,
    };

    Chart.defaults.global.colours = [
        '#d9534f', // red - failed
        '#5cb85c', // green - passed
        '#5bc0de', // skyblue - info
        '#ec971f' //  orange - warning


    ];





}]);

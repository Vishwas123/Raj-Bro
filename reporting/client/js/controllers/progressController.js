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

    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    // initializing the variables
    var count_passed = 0;
    var count_failed = 0;
    var count_norun = 0;
    var count_notcompleted = 0;
    var error_count = 0;
    $scope.isDisabled = true;


    // totalTimeCompleted/ totalTime  =======>   progress
    $scope.totalTimeCompleted = 0; // SUM of all the test completed in this particular cycle
    $scope.totalTime = 0; // SUM of average of all tests in cycle
    $scope.totalActualTimeCompleted = 0;


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

    // Array of Arrays
    // [ [day1_QC, day1_tester],  
    //   [day2_QC, day2_tester] ]

    var day_by_day_progress = [];

    var test_active_date = [1, 1, 1, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 0, 0,
        1, 1, 1, 1, 1, 0, 0
    ]; // mock date for SUPERMAN 

    var date_label = [];
    var date_to_index = []; // { date:___ , index: i}

    var daily_progress_data = []; // Progress each day calculated by EXPECTED_QC
    var daily_progress_actual_data = []; // Progress each day calculated by Actual time Completed from Tester Report(report.total_time)

    var currentProgress = 0;
    var currentProgressActual = 0;

    var data3_master = [];
    var series3_master = [];
    var colors3_master = [];
    var data3_status = [true, true, true];

    var data4_status = [true, true, true];
    var data4_master = [];
    var series4_master = [];
    var colors4_master = [];

    var checking_duplicates = [];

    // function called when get progress is clicked
    $scope.getTests = function() {



        // show progress loading 
        $scope.loading = true;
        $scope.isDisabled = true;



        // GET request to QC DB.   server/controller/progressContorller.js - getTests();
        $http.get('/progressview/api/tests/' + $scope.cycleName).success(function(qc_results) {

            // clearing the variables
            resetCount(); // resets the count variables for all 
            var list_of_test_ids = [];
            var list_of_test_names = [];
            if (qc_results[0].msg == 'None Found') {
                alert('None Found');
            } else {

                // number of days if it's 30 days then it's for 30 days. 
                // This needs to be calculated by number of active days from CPE Dashboard

                day_by_day_progress.push(new Array(30).fill(0)); // QC Actual
                day_by_day_progress.push(new Array(30).fill(0)); // Tester
                day_by_day_progress.push(new Array(30).fill(0)); // QC Expected


                $scope.testProcedures = qc_results;

                // startdate and end date
                $scope.startDate = $scope.cycle.startDate;
                $scope.endDate = $scope.cycle.endDate;
                $scope.startDay = weekday[new Date($scope.startDate).getDay()];
                $scope.endDay = weekday[new Date($scope.endDate).getDay()];



                // populate labels  
                // start from start Date
                var label_date_pointer = new Date($scope.startDate);
                var indexCount = 0;
                for (var i = 0; i < test_active_date.length; i++) {
                    // 1 = active , 2 = skip
                    if (test_active_date[i] == 1) {
                        date_label.push(label_date_pointer.toString().slice(0, 15));
                        date_to_index.push({
                            date: label_date_pointer.toString().slice(0, 15),
                            index: indexCount
                        });
                        //console.log('date: ' + date_to_index[indexCount].date + ' index : ' + date_to_index[indexCount].index);
                        indexCount++; // only increment for active days
                    }
                    label_date_pointer.setDate(label_date_pointer.getDate() + 1);
                }

                for (var i = 0; i < qc_results.length; i++) {
                    // push the test ids to the array to be used to query from mongoDB
                    list_of_test_ids.push(qc_results[i].TC_TEST_ID);
                    list_of_test_names.push(qc_results[i].TS_NAME);
                    testCounter(qc_results[i]);
                }
                // $scope.totalTime == TOTAL DURATION of the cycle. ES + UKR time from QC
                $scope.totalTime = Math.ceil($scope.totalTime / 3600);

                // using the list of test_ids from QC Database, get the testinfo 
                // from mongo reports DB



                TestInfo.gettest({}, {
                    testids: list_of_test_ids,
                    testnames: list_of_test_names,
                    cyclename: $scope.cycleName
                }, function(reports) {
                    // reports = data from mongODB


                    // $scope.testProcedure = object from QC
                    // results = mongoDB result
                    for (var j = 0; j < $scope.testProcedures.length; j++) {
                        $scope.testProcedures[j].EXPECTED_QC = $scope.testProcedures[j].avg_qc;
                        $scope.testProcedures[j].EXPECTED_STRING_QC = convert_To_Hrs_And_Mins($scope.testProcedures[j].avg_qc);
                    }
                    for (var i = 0; i < reports.length; i++) {
                        for (var j = 0; j < $scope.testProcedures.length; j++) {
                            // ***** needs to check for runid too. 
                            // In some cases, there are multiple copies of test procedure in different folder
                            // Ex. Cloud On & Cloud Off


                            if ($scope.testProcedures[j].populated == true) {
                                // if (it's already in the check array , 
                                //                 &&
                                //     if they both have the same cycle_id)  {
                                //     take it out from all the places that this report was used to 
                                //   } else {
                                //      console.log('im contuning');
                                //      continue;
                                //   }
                                //     
                                console.log('im contuning');
                                continue;
                            }

                            if ($scope.testProcedures[j].TS_NAME == reports[i].testname) {

                                $scope.testProcedures[j].date_sort = (new Date(new Date(parseInt(reports[i].original_id.toString().substring(0, 8), 16) * 1000) - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
                                $scope.testProcedures[j].date = new Date(parseInt(reports[i].original_id.toString().substring(0, 8), 16) * 1000).toString().slice(0, 15);
                                console.log('**********');
                                console.log('date sort  ' + $scope.testProcedures[j].date_sort);
                                console.log('date ' + $scope.testProcedures[j].date);
                                console.log('**********');
                                //$scope.testProcedures[j].date = reports[i].date;

                                var procedureDate = new Date(parseInt(reports[i].original_id.toString().substring(0, 8), 16) * 1000).toString(0, 15);
                                var startDate = new Date($scope.startDate).toISOString().slice(0, 10);

                                /* console.log(reports[i].testname);
                                console.log('Procedures date ' + $scope.testProcedures[j].date);
                                console.log('start Date ' + new Date($scope.startDate).toString().slice(0, 15));
                                console.log('Searched Date-s Index : ' + searchForIndexByDate($scope.testProcedures[j].date));
*/
                                /*                                var timeDiff = Math.abs(new Date(procedureDate).getTime() -  new Date(startDate).getTime()  );
                                                                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                                                                console.log(diffDays);*/

                                /*                                var test = [[1,2]];
                                                                console.log('****************************************'+ test[0]);
                                                                test[0][0] = test[0][0] + 2;
                                                                console.log('****************************************'+ test[0]);*/
                                var index = searchForIndexByDate($scope.testProcedures[j].date);
                                if (index == -1) {

                                    console.log($scope.testProcedures[j].TS_NAME);
                                    console.log('unable to find the index');
                                } else {

                                    day_by_day_progress[0][index] = day_by_day_progress[0][index] + (reports[i].duration_time / 3600); //  QC Actual
                                    day_by_day_progress[1][index] = day_by_day_progress[1][index] + (reports[i].total_time / 3600); // Tester
                                    day_by_day_progress[2][index] = day_by_day_progress[2][index] + ($scope.testProcedures[j].avg_qc / 3600); // Tester                                

                                }

                                addToDailyProgess(index, $scope.testProcedures[j].avg_qc, reports[i].total_time);

                                // TOTAL_TIME_STRING is to display in Hrs and Mins
                                // TOTAL_TIME is to be used for sorting key 
                                $scope.testProcedures[j].TOTAL_TIME_STRING = convert_To_Hrs_And_Mins(reports[i].total_time)
                                $scope.testProcedures[j].TOTAL_TIME = reports[i].total_time;



                                // total time completed shouldn't be SUM of actuals, it should be sum of expected
                                //$scope.totalTimeCompleted += reports[i].total_time;
                                $scope.totalTimeCompleted += $scope.testProcedures[j].avg_qc;
                                $scope.totalActualTimeCompleted += reports[i].total_time;
                                $scope.testProcedures[j].TESTER = reports[i].testerid;
                                // !!!! reports[i].totalTime === Each Report's time
                                if (startsWith($scope.testProcedures[j].FOLDER, 'ES')) {
                                    $scope.total_completed_es += $scope.testProcedures[j].avg_qc;
                                    // total time completed shouldn't be SUM of actuals, it should be sum of expected
                                    //$scope.total_completed_es += $scope.testProcedures[j].TOTAL_TIME;
                                } else if (startsWith($scope.testProcedures[j].FOLDER, 'UKR')) {
                                    // total time completed shouldn't be SUM of actuals, it should be sum of expected                                    
                                    //$scope.total_completed_ukr += $scope.testProcedures[j].TOTAL_TIME;
                                    $scope.total_completed_ukr += $scope.testProcedures[j].avg_qc;
                                }
                                $scope.testProcedures[j].populated = true;
                                break;
                            }

                        } // end of inner for loop

                    } // end of big for loop 

                    $scope.total_expected_qc_es = Math.round($scope.total_expected_qc_es / 3600);
                    $scope.total_expected_qc_ukr = Math.round($scope.total_expected_qc_ukr / 3600);
                    $scope.totalTimeCompleted = Math.round($scope.totalTimeCompleted / 3600);
                    $scope.totalActualTimeCompleted = Math.round($scope.totalActualTimeCompleted / 3600);


                    // Pie Graph - Total Hours Done vs Total Hours Left
                    $scope.labels2 = ["Hours Left", "Hours Done"];
                    $scope.data2 = [$scope.totalTime - $scope.totalTimeCompleted, $scope.totalTimeCompleted];
                    $scope.totalDoneProgress = Math.round($scope.totalTimeCompleted / $scope.totalTime * 100);
                    $scope.totalLeftProgress = 100 - $scope.totalDoneProgress;

                    $scope.daily_progress.sort(function(a, b) {
                        return a.index - b.index
                    });


                    for (var i = 0; i < $scope.daily_progress.length; i++) {
                        daily_progress_data.push(currentProgress + $scope.daily_progress[i].amount);
                        daily_progress_actual_data.push(currentProgressActual + $scope.daily_progress[i].actual);
                        currentProgress += $scope.daily_progress[i].amount;
                        currentProgressActual += $scope.daily_progress[i].actual;

                    }

                    // needs integration with CPE DASHBOARD 
                    // only select days
                    $scope.labels3 = date_label;


                    /* Progress Over Time Line Graph */

                    var goalLine = [];
                    for (var i = 1; i <= 30; i++) {
                        goalLine.push(($scope.totalTime / 30) * i);
                    }

                    $scope.data3 = [daily_progress_actual_data, goalLine, daily_progress_data];
                    $scope.series3 = ['Progress(Actual)', 'Goal', 'Progress(Expected)'];
                    $scope.colors3 = ['#0024FF', '#ff6384', '#009D0B'];

                    data3_master = angular.copy($scope.data3);
                    series3_master = angular.copy($scope.series3);
                    colors3_master = angular.copy($scope.colors3);

                    /* end of Progress Over Time Line Graph */




                    /* Daily Report Bar Graph */
                    $scope.series4 = ['QC Actual', 'Tester Duration', 'QC Expected'];
                    $scope.colors4 = ['#FF4E00', '#5BFE72', '#9445FF'];
                    $scope.data4 = day_by_day_progress;

                    data4_master = angular.copy($scope.data4);
                    series4_master = angular.copy($scope.series4);
                    colors4_master = angular.copy($scope.colors4);


                    /* End of Daily Report Bar Graph */

                    $scope.offAmount = (goalLine[daily_progress_data.length - 1] - daily_progress_data[daily_progress_data.length - 1]).toFixed(2);

                });

                /** Function to get average of all the runs from the Reports made to MongoDB */
                AvgInfo.getavg({}, { testids: list_of_test_ids }, function(mongo_avg_results) {

                    for (var i = 0; i < mongo_avg_results.length; i++) {
                        for (var j = 0; j < $scope.testProcedures.length; j++) {
                            if ($scope.testProcedures[j].CF_ITEM_NAME != "P3") {
                                if ($scope.testProcedures[j].TC_TEST_ID == mongo_avg_results[i]._id) {
                                    /* Set the Expected value from the result
                                     * EXPECTED_STRING is to display in Hrs and Mins
                                     * EXPECTED is to be used for sorting key  */
                                    $scope.testProcedures[j].EXPECTED_MONGO = mongo_avg_results[i].avg_total;
                                    $scope.testProcedures[j].EXPECTED_STRING_MONGO = convert_To_Hrs_And_Mins(mongo_avg_results[i].avg_total);

                                    if (startsWith($scope.testProcedures[j].FOLDER, 'ES')) {
                                        $scope.total_expected_mongo_es += mongo_avg_results[i].avg_total;
                                    } else if (startsWith($scope.testProcedures[j].FOLDER, 'UKR')) {
                                        $scope.total_expected_mongo_ukr += mongo_avg_results[i].avg_total;
                                    }

                                    // set the difference of the Expected VS Actual
                                    if ($scope.testProcedures[j].TOTAL_TIME) {


                                        var difference = $scope.testProcedures[j].EXPECTED_QC - $scope.testProcedures[j].TOTAL_TIME;
                                        $scope.testProcedures[j].DIFFERENCE = difference;
                                        // DIFFERENCE_STRING is to display in Hrs and Mins
                                        // DIFFERENCE is to be used for sorting key 
                                        if ($scope.testProcedures[j].DIFFERENCE) {
                                            $scope.testProcedures[j].DIFFERENCE_STRING = convert_To_Hrs_And_Mins(difference);

                                        }

                                    }


                                    // tracking total_expected
                                }
                            }
                        }
                    }
                    $scope.total_completed_es = Math.round($scope.total_completed_es / 3600);
                    $scope.total_completed_ukr = Math.round($scope.total_completed_ukr / 3600);


                    $scope.total_expected_mongo_es = Math.round($scope.total_expected_mongo_es / 3600);
                    $scope.total_expected_mongo_ukr = Math.round($scope.total_expected_mongo_ukr / 3600);
                    /*                    $scope.test_toggle = true;*/
                    // console.log(JSON.stringify(results, null, "    "));
                });

                for (var i = 0; i < $scope.testProcedures.length; i++) {
                    if ($scope.testProcedures[i].CF_ITEM_NAME != "P3") {
                        if (startsWith($scope.testProcedures[i].FOLDER, 'ES')) {
                            $scope.test_es.push($scope.testProcedures[i]);
                        } else if (startsWith($scope.testProcedures[i].FOLDER, 'UKR')) {
                            $scope.test_ukr.push($scope.testProcedures[i]);
                        }
                    }
                }

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
            $scope.isDisabled = false;

        });


    }

    // add each testProcedure's duration to progress 
    //  @params   {number}  index  - day of the progress to  Day 1 = index 0
    //  @params   {number}  amount - Progress calculated by EXPECTED_QC
    //  @params   {number}  actual - Progress calculated by Actual Time
    var addToDailyProgess = function(index, amount, actual) {
        //console.log('in addToDailyProgress');
        var index_at = -1;
        for (var i = 0; i < $scope.daily_progress.length; i++) {
            if ($scope.daily_progress[i].index === index) {
                index_at = i;
            }
        }
        if (index_at == -1) {
            var dailyObj = {
                index: index,
                amount: amount / 3600,
                actual: actual / 3600
            };
            $scope.daily_progress.push(dailyObj);
        } else {
            $scope.daily_progress[index_at].amount += (amount / 3600);
            $scope.daily_progress[index_at].actual += (actual / 3600);
        }
    }

    // all the functions
    // increments counter depending on which folder that test belongs to
    var testCounter = function(obj) {
        $scope.totalTime += obj.avg_qc;
        if (obj.CF_ITEM_NAME != "P3") {
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
                error_count++; // error Count is Tests that are not in ES, UKR
            }
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

        $scope.totalTimeCompleted = 0;
        $scope.totalActualTimeCompleted = 0;
        $scope.totalTime = 0;
        $scope.total_completed_es = 0;
        $scope.total_expected_mongo_es = 0;
        $scope.total_expected_qc_es = 0;
        $scope.total_completed_ukr = 0;
        $scope.total_expected_mongo_ukr = 0;
        $scope.total_expected_qc_ukr = 0;
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
        $scope.testProcedures = [];
        $scope.test_es = [];
        $scope.test_ukr = [];
        day_by_day_progress = [];
        $scope.daily_progress = [];
        daily_progress_data = [];
        daily_progress_actual_data = [];
        currentProgress = 0;
        currentProgressActual = 0;
        date_label = [];
        date_to_index = [];
        data3_status = [true, true, true];
        data4_status = [true, true, true];
        data3_master = [];
        series3_master = [];
        colors3_master = [];
        data4_master = [];
        series4_master = [];
        colors4_master = [];
        checking_duplicates = [];
    }


    // function called when Cycle Selection changes
    $scope.changeSelect = function(type) {
        if ($scope.cycle != undefined) {
            $scope.isDisabled = false;
            $scope.cycleType = $scope.cycle.cycleType;
            $scope.cycleName = $scope.cycle.cycleName;
        } else {
            $scope.isDisabled = true;
        }
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

    // turn on/off data in progress graph
    $scope.toggleLineGraph = function(index) {
        var temp_data3 = [];
        var temp_series3 = [];
        var temp_colors3 = [];


        data3_status[index] = !data3_status[index];

        for (var i = 0; i < data3_status.length; i++) {

            if (data3_status[i] === true) {
                temp_data3.push(data3_master[i]);
                temp_series3.push(series3_master[i]);
                temp_colors3.push(colors3_master[i]);
            }
        }

        $scope.data3 = temp_data3;
        $scope.series3 = temp_series3;
        $scope.colors3 = temp_colors3;
    }

    // turn on/off data in progress graph
    $scope.toggleBarGraph = function(index) {
        var temp_data4 = [];
        var temp_series4 = [];
        var temp_colors4 = [];


        data4_status[index] = !data4_status[index];

        for (var i = 0; i < data4_status.length; i++) {

            if (data4_status[i] === true) {
                temp_data4.push(data4_master[i]);
                temp_series4.push(series4_master[i]);
                temp_colors4.push(colors4_master[i]);
            }
        }
        $scope.data4 = temp_data4;
        $scope.series4 = temp_series4;
        $scope.colors4 = temp_colors4;
    }

    // function to convert seconds into String of "_ hrs _ mins"
    var convert_To_Hrs_And_Mins = function(secs) {
        var total_seconds = Math.abs(secs);
        var total_minutes = total_seconds / 60;
        var seconds = total_seconds % 60;
        var hours = Math.floor(total_minutes / 60);
        var minutes = Math.round(total_minutes % 60);

        if (minutes < 10) {
            return (hours + ":0" + minutes);
        } else {
            return (hours + ":" + minutes);
        }
    }

    var searchForIndexByDate = function(date) {
        console.log('date in function ' + date);
        console.log('date_to_index_ ' + date_to_index[0].date);
        for (var i = 0; i < date_to_index.length; i++) {
            if (date_to_index[i].date === date) {
                return date_to_index[i].index;
            }
        }

        return -1;
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
        animation: false,
        maintainAspectRatio: false
    };
    $scope.options2 = {
        animation: false,
        scales: {
            yAxes: [{
                ticks: {
                    min: 0,
                    beginAtZero: true,
                    max: 1400
                }
            }]
        },
        title: {
            display: true,
            text: 'Chart.js Line Chart - Legend'
        }

    };

    Chart.defaults.global.colours = [
        '#d9534f', // red - failed
        '#5cb85c', // green - passed
        '#5bc0de', // skyblue - info
        '#ec971f' //  orange - warning
    ];






    /** line graph end */

}]);

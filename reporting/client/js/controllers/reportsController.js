app.controller('reportsController', ['$scope', '$resource', '$location', '$window', '$uibModal', function($scope, $resource, $location, $window, $uibModal) {

    // base restful SERVICE url
    var Report = $resource('reports/api/reports');

    //initially setting the test ID from the URL data
    //http://localhost:3000/reports#?testname=test&testid=1&runid=2&duration=10800&testerid=kenny&test_instance_id=40000
    var testname = $location.search().testname;
    var testid = $location.search().testid;
    var runid = $location.search().runid;
    var duration = $location.search().duration;
    var testerid = $location.search().testerid;
    var test_instance_id = $location.search().test_instance_id;


    // setting the scope variables with variables extracted from the URL
    $scope.testname = $location.search().testname;
    $scope.testid = testid;
    $scope.duration = duration;
    $scope.runid = runid;
    $scope.testerid = testerid;
    $scope.test_instance_id = test_instance_id;




    // modal code from here

    $scope.animationsEnabled = true;

    $scope.open = function(size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'reportHelper.html',
            size: size,
            controller: function($scope, $uibModalInstance) {
                $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };
            }
        });



    };

    // modal code up to here



    // these two arrays are used to populate the drop down for "Hours" and "Minutes"
    var minutes = [];
    for (var i = 0; i < 60; i += 15) {
        minutes.push({ 'seconds': i * 60, 'min': i });
    };
    $scope.minutes = minutes;

    var hours = [];
    for (var i = 0; i < 200; i++) {
        hours.push({ 'seconds': i * 3600, 'hr': i });
    };
    $scope.hours = hours;


    // function to update the time for each of the categories.
    $scope.update = function(type) {

        if (type == 'setup') {
            $scope.setup = $scope.setup_h + $scope.setup_m;
        } else if (type == 'test') {
            $scope.testing = $scope.test_h + $scope.test_m;
        } else if (type == 'error') {
            $scope.error = $scope.error_h + $scope.error_m;
        } else if (type == 'misc') {
            $scope.misc = $scope.misc_h + $scope.misc_m;
        }

    }

    // watching the $scope total variable to keep track of the total updates
    $scope.$watch('total', function convertToHrsMins() {
        var total_seconds = $scope.total;
        var total_minutes = total_seconds / 60;
        var seconds = total_seconds % 60;
        var hours = Math.floor(total_minutes / 60);
        var minutes = Math.floor(total_minutes % 60);
        $scope.total_hr = hours + " hours " + minutes + " minutes";
    });


    // With the passed in Duration time, it converts to Hours and MInutes, to populate the Duration Time(QC)
    $scope.initDurationHoursAndMinutes = function() {
        var total_seconds = $scope.duration;
        var total_minutes = total_seconds / 60;
        var seconds = total_seconds % 60;
        var hours = Math.floor(total_minutes / 60);
        var minutes = Math.floor(total_minutes % 60);

        $scope.total_duration = hours + " hours " + minutes + " minutes " + seconds + " secs";
    }


    $scope.timeChange = function() {
        console.log('timeChange function');
    }


    // not in used, but it is used for each manual input time
    $scope.updateSeconds = function(type) {
        if (type == 'setup') {
            $scope.setup_h = 0;
            $scope.setup_m = 0;
        } else if (type == 'test') {
            $scope.test_h = 0;
            $scope.test_m = 0;
        } else if (type == 'error') {
            $scope.error_h = 0;
            $scope.error_m = 0;
        } else if (type == 'misc') {
            $scope.misc_h = 0;
            $scope.misc_m = 0;
        }

    }

    //  called when selection for 
    //  Platform / Project / Cycle is called
    //  @Params type = indicates caller - platform, project, cycle

    $scope.changeSelect = function(type) {
        if (type == 'platform') {
            console.log('platform is : ' + $scope.platform);
        } else if (type == 'project') {
            console.log('project is : ' + $scope.project);
        } else if (type == 'cycle') {
            //$scope.cycleType = $scope.cycle[0].cycleType;
            if ($scope.cycle != undefined) {
                $scope.cycleType = $scope.cycle.cycleType;
                $scope.cycleName = $scope.cycle.cycleName;
                $scope.startDate = $scope.cycle.startDate;
                $scope.dateRange = $scope.cycle.dateRange;
                $scope.endDate = $scope.cycle.endDate;
                console.log('a ' + $scope.cycle.cycleName);
                console.log('b ' + $scope.cycle.cycleType);
                console.log('c ' + $scope.cycle.startDate);
                console.log('d ' + $scope.cycle.dateRange);
                console.log('e ' + $scope.cycle.endDate);
            }
        }

    }




    // getting data from the server DB, the results holds the list from the server RESPONSE
    Report.query(function(results) {
        $scope.platforms = results;
        //console.log('query function in client controller');
        //console.log(results);

        console.log('scope platform is ' + JSON.stringify($scope.platforms, null, "    "));

    });


    $scope.reports = [];

    // function called when "Submit" 
    $scope.addReport = function() {
        var reportsObj = new Report();
        // setting the data to the objects
        reportsObj.testname = $scope.testname;
        reportsObj.testid = $scope.testid;
        reportsObj.runid = $scope.runid;
        reportsObj.testerid = $scope.testerid;
        reportsObj.duration_time = $scope.duration;
        reportsObj.total_time = $scope.total;
        reportsObj.setup_time = $scope.setup;
        reportsObj.testing_time = $scope.testing;
        reportsObj.error_time = $scope.error;
        reportsObj.misc_time = $scope.misc;
        reportsObj.platform = $scope.platform;
        reportsObj.project = $scope.project;
        reportsObj.cycle = [{
            "cycleName": $scope.cycle.cycleName,
            "cycleType": $scope.cycle.cycleType,
            "startDate": $scope.cycle.startDate,
            "dateRange": $scope.cycle.dateRange,
            "endDate": $scope.cycle.endDate
        }];
        reportsObj.notes = $scope.notes;
        var nd = new Date(new Date() - new Date().getTimezoneOffset()*60000);
//new Date(new Date(parseInt(reports[i]._id.toString().substring(0, 8), 16) * 1000) - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
        reportsObj.date = nd;
        reportsObj.test_instance_id = $scope.test_instance_id;




        reportsObj.$save(function(result) {
            // JSON got from callback
            // clearing the field
            /*$scope.testid = '';
            $scope.duration = '';*/
            $scope.setup = '';
            $scope.error = '';
            $scope.testing = '';
            $scope.misc = '';
            $scope.notes = '';
            alert("Report Has Been Submitted");
        });


    }

}]);

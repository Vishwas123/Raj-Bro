app.controller('editReportController', ['$scope', '$resource', '$location', '$window', '$uibModal', function($scope, $resource, $location, $window, $uibModal) {

    // base restful SERVICE url
    var Report = $resource('/editreport/api/reports/');


    // getting data from the server DB, the results holds the list from the server RESPONSE
    Report.query(function(results) {
        $scope.platforms = results;
        //console.log('query function in client controller');
        //console.log(results);

        console.log('scope platform is ' + $scope.platforms);

    });

    //initially setting the test ID from the URL data
    //http://localhost:3000/#/?testname=test&testid=1&runid=2&duration=10800&testerid=kenny
    var obj_id = $location.search().obj_id;


    var EditReport = $resource('/editreport/api/reports/:id', { id: obj_id }, {isArray:false});
    console.log('obj id is = ------- ' + obj_id);
    EditReport.query(function(results) {
        console.log('query function in edit');
        console.log('results is : ' + JSON.stringify(results));
        console.log('result testname : ' + results.testname);
        $scope.testname = results.testname;
        $scope.testid = results.testid;
        $scope.duration = results.duration_time;
        $scope.runid = results.runid;
        $scope.testerid = results.testerid;
        $scope.obj_id = obj_id;
        $scope.total = results.total_time;
        $scope.setup = results.setup_time;
        $scope.testing = results.testing_time;
        $scope.error = results.error_time;
        $scope.misc = results.misc_time;
        $scope.notes = results.notes;
        $scope.platform = results.platform;
        $scope.project = results.project;

        // cycle is not needed because user needs to select CYCLE All the time
        //$scope.cycle = results.cycle;   
        console.log(JSON.stringify(results.cycle));
        $scope.initDurationHoursAndMinutes();

    });

    // save edit
    $scope.saveEdit = function(obj_id) {
        //console.log('save report id is : ' + obj_id);

        var updateReport = $resource('/editreport/api/reports/update/:id', { id: obj_id });
        var report = new updateReport();


        report.testname = $scope.testname;
        report.testid = $scope.testid;
        report.runid = $scope.runid;
        report.testerid = $scope.testerid;
        report.duration_time = $scope.duration;
        report.total_time = $scope.total;
        report.setup_time = $scope.setup;
        report.testing_time = $scope.testing;
        report.error_time = $scope.error;
        report.misc_time = $scope.misc;
        report.notes = $scope.notes;
        report.platform = $scope.platform;
        report.project = $scope.project;
        report.cycle = $scope.cycle;


        report.$save(function(result) {
            //console.log("Report Has Been Modified123123123");
            //console.log('result is ' + JSON.stringify(result));
            alert("Report Has Been Submitted");
            $window.location.href = "http://localhost:3000/testview";
        });



    }

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

    $scope.$watch('total', function convertToHrsMins() {
        var total_seconds = $scope.total;
        var total_minutes = total_seconds / 60;
        var seconds = total_seconds % 60;
        var hours = Math.floor(total_minutes / 60);
        var minutes = Math.floor(total_minutes % 60);
        $scope.total_hr = hours + " hours " + minutes + " minutes";


    });

    $scope.initDurationHoursAndMinutes = function() {
        console.log('in duration function');
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
            $scope.a = this;
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


    $scope.reports = [];

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
            "cycleType": $scope.cycle.cycleType
        }];
        reportsObj.notes = $scope.notes;

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

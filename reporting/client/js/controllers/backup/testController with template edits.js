app.controller('testController', ['$scope', '$resource', '$location', function($scope, $resource, $location) {

    var Report = $resource('/testview/api/reports');
    console.log('testController client');

    // initially setting the sortKey to testId
    $scope.sortKey = 'testname';

    // this is the sort(keyname) function called in <th> in tableview.html
    // to toggle a switch
    $scope.sort = function(keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.delete = function(id) {
        /*      $http.put('/deleteReport/').success(function(res) {
                    console.log(res);
                });*/
        var deleteReport = $resource('/testview/api/reports/:id', { id: id });
        deleteReport.delete();
        location.reload();
    };





    /* Code For Edit */
    $scope.selected = [];
    $scope.edit = function(report) {

        console.log('editing report id is : ' + report._id);
        $scope.selected = angular.copy(report);
    }

    $scope.saveEdit = function(report, index) {
        console.log('save report id is : ' + report._id);
        var obj = { total_time: 4000 };
        var updateReport = $resource('/testview/api/reports/update/:id', { id: report._id });
        var report = new updateReport();
        console.log('index is ' + index);

        report.duration_time = $scope.selected.duration_time;
        report.total_time = $scope.selected.total_time;
        report.setup_time = $scope.selected.setup_time;
        report.testing_time = $scope.selected.testing_time;
        report.error_time = $scope.selected.error_time;
        report.misc_time = $scope.selected.misc_time;
        report.notes = $scope.selected.notes;

        $scope.reports[index].duration_time = $scope.selected.duration_time;
        $scope.reports[index].total_time = $scope.selected.total_time;
        $scope.reports[index].setup_time = $scope.selected.setup_time;
        $scope.reports[index].testing_time = $scope.selected.testing_time;
        $scope.reports[index].error_time = $scope.selected.error_time;
        $scope.reports[index].misc_time = $scope.selected.misc_time;
        $scope.reports[index].notes = $scope.selected.notes;
        $scope.reports[index].$save(function(result) {
            console.log("Report Has Been Modified");
            alert("Report Has Been Submitted");
        });


        $scope.reset();
        //$scope.report
    }

    $scope.reset = function() {
        $scope.selected = [];

    }

    // gets the template to ng-include for a table row / item
    $scope.getTemplate = function(report) {
        //console.log('in getTemplate ' + report);
        if (report._id === $scope.selected._id) return 'edit';
        else return 'display';
    };

    /* Code For Edit */


    $scope.refresh = function() {
        location.reload();
    }



    Report.query(function(results) {
        var start = window.performance.webkitNow();


        $scope.reports = results;

        // pagination stuff

        $scope.totalItems = 64;
        $scope.itemsPerPage = 10
        $scope.currentPage = 1;

        $scope.setPage = function(pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
        };

        $scope.maxSize = 5;
        $scope.bigTotalItems = 175;
        $scope.bigCurrentPage = 1;


        // pagination stuff 

        // array used to populate categories for filtering purposes
        var id_categories = [];
        var project_categories = [];
        var platform_categories = [];
        var cycle_categories = [];
        for (var i = 0; i < results.length; i++) {
            var testid = results[i].testid;
            var project = results[i].project;
            var platform = results[i].platform;
            var cycle = results[i].cycle;

            if (id_categories.indexOf(testid) == -1) {
                id_categories.push(testid);
            }

            if (project_categories.indexOf(project) == -1) {
                project_categories.push(project);
            }

            if (platform_categories.indexOf(platform) == -1) {
                platform_categories.push(platform);
            }

            if (cycle_categories.indexOf(cycle) == -1) {
                cycle_categories.push(cycle);
            }

        }

        $scope.id_categories = id_categories;
        $scope.project_categories = project_categories;

        /*        for ( var i = 0 ; i < $scope.project_categories.length ; i++){
                    console.log('projectcateogires ' + $scope.project_categories[i]);
                }*/
        $scope.platform_categories = platform_categories;
        $scope.cycle_categories = cycle_categories;


    });







}]);

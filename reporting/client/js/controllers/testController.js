app.controller('testController', ['$scope', '$resource', '$window', '$location', function($scope, $resource, $window, $location) {

    var Report = $resource('/testview/api/reports');
    
    // when true, looading GIF will show
    $scope.loading = true;


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

        var deleteReport = $resource('/testview/api/reports/:id', { id: id });
        deleteReport.delete();
        location.reload();
    };

    /* Code For Edit */
    $scope.edit = function(report) {
        $window.location.href = "http://localhost:3000/editreport/#?obj_id=" + report._id;
    }



    $scope.refresh = function() {
        location.reload();
    }



    Report.query(function(results) {

        $scope.reports = results;

        for(var i = 0; i < $scope.reports.length; i++) {
            $scope.reports[i].date = new Date(parseInt($scope.reports[i]._id.toString().substring(0,8),16)*1000).toISOString().slice(0,10);
            //$scope.reports[i].date = new 
        }


        // array used to populate categories for filtering purposes
        var id_categories = [];
        var project_categories = [];
        var platform_categories = [];
        var cycle_categories = [];
        for (var i = 0; i < results.length; i++) {
            var testid = results[i].testid;
            var project = results[i].project;
            var platform = results[i].platform;
            var cycle = results[i].cycle[0].cycleName;

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

        id_categories.sort(function(a, b) {
            return a - b; });
        console.log('length of id categories are ' + id_categories.length);
        project_categories.sort();
        platform_categories.sort();
        cycle_categories.sort();


        $scope.id_categories = id_categories;
        $scope.project_categories = project_categories;

        /*        for ( var i = 0 ; i < $scope.project_categories.length ; i++){
                    console.log('projectcateogires ' + $scope.project_categories[i]);
                }*/
        $scope.platform_categories = platform_categories;
        $scope.cycle_categories = cycle_categories;
              $scope.loading = false;
      
    });







    
}]);

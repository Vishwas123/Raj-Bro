app.controller('avgController', ['$scope', '$resource', '$location', function($scope, $resource, $location) {

    // base restful SERVICE url
    var Report = $resource('avgview/api/reports');

    // array used for populating charts
    var avg_duration = [];
    var avg_total = [];
    var testList = [];
    var copyOfResults = [];

    // initially setting the sortKey to testId
    $scope.sortKey = 'testname';

    // this is the sort(keyname) function called in <th> in tableview.html
    // to toggle a switch
    $scope.sort = function(keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    // getting data from the server DB, the results holds the list from the server RESPONSE
    Report.query(function(results) {

        $scope.reports = results;
        copyOfResults = results.slice();

        // initially display first 10 items
        for(var i = 0; i < 10;i++){
            avg_duration.push(results[i].avg_duration);
            avg_total.push(results[i].avg_total);
            testList.push(results[i].test_name);
        }

    });

    // function called when page is selected
    $scope.pageChangeHandler = function(num) {

        avg_duration = [];
        avg_total = [];
        testList = [];
        for(var i = (num-1)*10; i < num*10 && i < copyOfResults.length;i++){
            avg_duration.push(copyOfResults[i].avg_duration);
            avg_total.push(copyOfResults[i].avg_total);
            testList.push(copyOfResults[i].test_name);
        }

        $scope.labels = testList;
        $scope.data = [
            avg_duration,
            avg_total
        ];
    };


    // data used for 
    $scope.labels = testList;
    $scope.series = ['AVG_DURATION', 'AVG_TOTAL'];

    $scope.data = [
        avg_duration,
        avg_total
    ];

    $scope.options = {

        maintainAspectRatio: false
    };


    Chart.defaults.global.colours = [
        '#E90808', // red
        '#201BF9' // blue

    ];

    Chart.defaults.global.scaleFontSize = 15;
    Chart.defaults.global.tooltipXPadding = 40;

}]);

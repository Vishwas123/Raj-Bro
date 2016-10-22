app.controller('tableController', ['$scope', '$resource', '$location', function($scope, $resource, $location) {

    var Report = $resource('/tableview/api/reports');
    
    console.log('tableController client');

    // initially setting the sortKey to testId
    $scope.sortKey = 'testid';

    // this is the sort(keyname) function called in <th> in tableview.html
    // to toggle a switch
    $scope.sort = function(keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.delete = function(id) {
/*    	$http.put('/deleteReport/').success(function(res) {
    		console.log(res);
    	});*/
    	var deleteReport = $resource('/tableview/api/reports/:id', { id: id});
    	deleteReport.delete();
        location.reload();
    };


    

    $scope.refresh =  function() {
        location.reload();
    }



    Report.query(function(results) {
        console.log('client/tableController query function');
        $scope.reports = results;

        // array used to populate categories for filtering purposes
        var categories = [];
        for(var i =0; i<results.length;i++){
            var testid = results[i].testid;
            if(categories.indexOf(testid) == -1){
                categories.push(testid);
            }
        }
        $scope.categories = categories;
    });


}]);

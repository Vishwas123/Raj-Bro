app.controller('planningController', ['$scope', '$http', '$resource', '$window', '$location', '$uibModal', function($scope, $http, $resource, $location, $window, $uibModal) {




    // TODO : 
    // 1) Make Input for "Get Folders" , this will be used to query for that particular cycle's folder structure from QC, 
    //     Need to send it as a req.params when querying 
    // 2) Prevent users to "Get Folder" if that cycle was already imported into MongoDB
    // 3) SAVING NODE
    //      Iterate through each node, update each of the nodes' parents , 
    //      SEt the node's template to "save_name" which is the name of this new Template you're saving as
    //      Insert that Template to the Template's collection
    // 4) When I delete, or add new Test Procedure, the total time should reflect the changes.
    //      
    var Nodes = $resource('/planningview/api/nodes');
    var AvgInfo = $resource('planningview/api/avg/', {}, {
        getavg: { method: 'POST', isArray: true }
    });
    var Templates = $resource('/planningview/api/templates/');
    // getting the cycles for the dropdown
    Templates.query(function(results) {
        console.log(JSON.stringify(results));
        $scope.templates = results;

    });

     // when true, looading GIF will show
    $scope.loading = false;

    $scope.isDisabled = true;
    var all = [];

    var linearArray = [];
    var list_of_tests = [];
    $scope.total_avg_seconds = 0;
    $scope.total_avg_hours = 0;
 
    $scope.remove = function(scope) {   
        var nodeData = scope.$modelValue;
        console.log('remove');
        console.log(nodeData.average);
        scope.remove();
    };


    $scope.newSubItem = function(scope) {
        var nodeData = scope.$modelValue;
        $scope.open('lg', nodeData);
        /*        console.log('ttttttttttttt ' + JSON.stringify(obj));
                if(obj) {
                    nodeData.nodes.push(obj);
                }   */
        /*        nodeData.nodes.push({
                    id: nodeData.id * 10 + nodeData.nodes.length,
                    title: nodeData.title + '.' + (nodeData.nodes.length + 1),
                    nodes: []
                });*/
    };

    $scope.toggle = function(scope) {
        scope.toggle();
    };

    $scope.moveLastToTheBeginning = function() {
        var a = $scope.data.pop();
        $scope.data.splice(0, 0, a);
    };


    /** modal code start here */




    $scope.open = function(size, nodeData) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'reportHelper.html',
            size: size,
            controller: function($scope, $uibModalInstance) {
                $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };
                $scope.saveNode = function() {
                    /*                    alert('add type : ' + $scope.node_type);
                                        alert('name is : ' + $scope.node_name);*/
                    var id = new Date().getTime();
                    var title = $scope.node_name;
                    var node_path = '';
                    var node_parent_id = nodeData.id;
                    var nodes = [];
                    var template = "";
                    var type = '';
                    var average;

                    if ($scope.node_type == 'Folder' || $scope.node_type == 'Test Set') {
                        type = $scope.node_type;
                    } else if ($scope.node_type == 'Test Procedure') {
                        type = $scope.node_type;
                        //  id = $scope.node_test.
                        title = $scope.node_test.TS_NAME;
                        average = $scope.node_test.avg_qc;
                    } else if ($scope.node_type == 'Test Procedure New') {
                        type = 'Test Procedure';
                        average = $scope.node_test_time;
                    } else {
                        console.log('?? not supposed to be here');
                    }

                    obj = {
                        "id": id,
                        "title": title,
                        "node_path": "",
                        "node_parent_id": node_parent_id,
                        "nodes": [],
                        "template": "",
                        "type": type,
                        "average": average
                    };

                    nodeData.nodes.push(obj);
                    $uibModalInstance.dismiss('cancel');
                }
                $scope.type_selected = function(node_type) {
                    if (node_type == 'Test Procedure') {
                        // this gets the Tests
                        $http.get('/planningview/api/qctests/').success(function(qc_results) {
                            //console.log('qc_results' + JSON.stringify(qc_results,null, "      " ));
                            $scope.tests = qc_results;
                        });
                    }
                }
            }
        });

    };


    /** modal code end here */

    // function that gets called when there's a change in the template selection
    $scope.changeSelect = function(template) {
        if (template != undefined) {
           $scope.isDisabled = false; 
           console.log(template);
        } else{
            $scope.isDisabled = true;
        }

    }

    $scope.changeNode = function(node) {
        console.log(node.$modelValue);

        console.log(node);
        $scope.currentNode = node.$modelValue;
        $scope.currentNodeText = node.$modelValue.title;

    }

    $scope.saveChange = function() {

        $scope.currentNode.title = $scope.currentNodeText;
        $scope.currentNode = null;
        $scope.currentNodeText = null;
    }

    $scope.clearNode = function() {
        $scope.currentNode = null;
        $scope.currentNodeText = null;
    }

    $scope.collapseAll = function() {
        $scope.$broadcast('angular-ui-tree:collapse-all');
    };

    $scope.expandAll = function() {
        $scope.$broadcast('angular-ui-tree:expand-all');
    };




    // function called when "Load Template" is clicked
    $scope.getNodes = function() {
        // console.log('get Nodes function');
        // mock for now
        $scope.loading=true;
        $scope.current_template = $scope.template.template_name; // this is the selected template from the list
        
        list_of_test_ids = [];
        linearArray = [];   
        //TDOD: need to pass in the selected Template as the parameter, and look up from that. 
        Nodes.query(function(results) {
            all = [];
            var index_of_root;

            // TODO : Each template object in the Templates Collection should have another key that has the value of the name of root node.
            for (var i = 0; i < results.length; i++) {
                if (results[i].node_name == 'Superman 0xC35 (Comprehensive)') {
                    var obj = {
                        'id': results[i].node_qc_id,
                        'title': results[i].node_name,
                        'node_path': results[i].node_path,
                        'node_parent_path': results[i].node_parent_path,
                        'node_parent_id': results[i].node_parent_id,
                        'nodes': [],
                        'template': results[i].template,
                        'type': results[i].type
                    };
                    all.push(obj);
                    //linearArray
                    index_of_root = i;
                }
            }
            /*console.log('*******************' + JSON.stringify(results[0]));
            var obj = {
                'id': results[0].node_qc_id,
                'title': results[0].node_name,
                'node_path': results[0].node_path,
                'node_parent_path': results[0].node_parent_path,
                'node_parent_id': results[0].node_parent_id,
                'nodes': [],
                'template': results[0].template,
                'type': results[0].type
            };*/
            for (var i = 0; i < results.length; i++) {

                if (results[i].type == 'Test Procedure') {
                    list_of_test_ids.push(results[i].node_qc_id);
                }

                var obj = {
                    'id': results[i].node_qc_id,
                    'title': results[i].node_name,
                    'node_path': results[i].node_path,
                    'node_parent_path': results[i].node_parent_path,
                    'node_parent_id': results[i].node_parent_id,
                    'nodes': [],
                    'template': results[i].template,
                    'type': results[i].type
                };
                insertFolder(all[0], obj);
                linearArray.push(obj);
                if (i == results.length - 1) {
                    AvgInfo.getavg({}, { testids: list_of_test_ids }, function(qc_results) {
                        for (var i = 0; i < qc_results.length; i++) {
                            for (var k = 0; k < linearArray.length; k++) {
                                if (qc_results[i].RN_TEST_ID == linearArray[k].id) {

                                    linearArray[k].average = qc_results[i].avg_qc;
                                    $scope.total_avg_seconds += qc_results[i].avg_qc;
                                }
                            }

                        }
                        $scope.total_avg_hours = $scope.total_avg_seconds / 3600;
                    });
                }
            }

            $scope.data = all;
            $scope.loading=false;
        });


    }

    // this will be used to keep the folders
    var insertFolder = function(root, folderToInsert) {
        /*  console.log('1111111111111111111111111111111111111111111111');
              console.log('root is ' + JSON.stringify(root,null, "       "));
              console.log('node to insert' + JSON.stringify(folderToInsert, null, "       "));
*/

        if (root.id == folderToInsert.node_parent_id) {
            root.nodes.push(folderToInsert);
            /*        console.log('insert here');*/
        } else {
            // if not , then call this function with it's child 

            for (var i = 0; i < root.nodes.length; i++) {
                insertFolder(root.nodes[i], folderToInsert);
            }
        }


    }
/*
    $scope.saveNodes = function() {
        console.log('save_name ' + $scope.save_name);
        console.log('current_template ' + $scope.current_template);
        if ($scope.save_name == $scope.current_template) {
            // *****************TODO: Also, need to check if there are exisiting template with the name already in the DB ********************************
            alert('Name cannot be same as current Template');
        } else {


            var templateObj = new Templates();
            templateObj.template_name = $scope.save_name;
            templateObj.$save(function(result) {
                
            })
            // create
            console.log('??');
            all = [];
            all = angular.copy($scope.data);
            linearArray = [];
            traverseTree(all[0]);
           // console.log('linear Array length is : ' + linearArray.length);
            for (var i = 0; i < linearArray.length; i++) {
                console.log(linearArray[i]);
                var nodesObj = new Nodes();

                nodesObj.node_name = linearArray[i].title;
                nodesObj.node_path = linearArray[i].node_path;
                nodesObj.node_qc_id = linearArray[i].id;
                nodesObj.parent_path = linearArray[i].node_parent_path;
                nodesObj.parent_id = linearArray[i].node_parent_id;

                //nodesObj.template       =  $scope.selectedTemplate;



                // TODO : 8/30/16   need to create a each object and then save it into the database either by 
                /*            "_id": ObjectId("57bf77eaa41ec26bae8947a1"),
                                "node_name": "CORE",
                                "node_path": "AAAAAFAAFAAMAAFAAAAFDAABAABAADAAA",
                                "node_qc_id": 414608,
                                "node_parent_path": "AAAAAFAAFAAMAAFAAAAFDAABAABAAD",
                                "node_parent_id": 414607,
                                "template": "Template 1"*/
                /*            nodesObj.node_name = ;
                            nodesObj.node_path = ;
                            nodesObj.node_qc_id = ;
                            nodesObj.parent_path = ;
                            nodesObj.parent_id = ;
                            nodesObj.template = ;




                // the template is going to something to be considered later, 
                // they can either modify, or save it as a new template... that should be the deal. 
                //  
            }

        }

    }*/

    // TODO: Create input box for cycle name, pass it to the request, and use that name to pull folders from QC
    // function called when Get Folders is called
    // 
    // get Data from QC and insert into mongoDB
    // 
    $scope.getDataFromQC = function() {

        list_of_tests = [];

        // this gets the folders
        $http.get('/planningview/api/folders/').success(function(qc_results) {
            console.log('qc_results' + qc_results);
            for (var i = 0; i < qc_results.length; i++) {
                var nodesObj = new Nodes();
                nodesObj.node_name = qc_results[i].CF_ITEM_NAME;
                nodesObj.node_path = qc_results[i].CF_ITEM_PATH;
                nodesObj.node_qc_id = qc_results[i].CF_ITEM_ID;
                nodesObj.node_parent_id = qc_results[i].CF_FATHER_ID;
                nodesObj.template = "Template 1";
                nodesObj.type = "Folder";
                nodesObj.$save(function(results) {
                    console.log('Report has been Submitted : ' + i);
                });
            }

            // this gets the Test Sets
            $http.get('/planningview/api/testsets/').success(function(qc_results) {
                console.log('qc_results' + qc_results);
                for (var i = 0; i < qc_results.length; i++) {
                    var nodesObj = new Nodes();

                    nodesObj.node_name = qc_results[i].CY_CYCLE;
                    nodesObj.node_path = "";
                    nodesObj.node_qc_id = qc_results[i].CY_CYCLE_ID;
                    nodesObj.node_parent_id = qc_results[i].CF_ITEM_ID;
                    nodesObj.template = "Template 1";
                    nodesObj.type = "Test Set";
                    nodesObj.$save(function(results) {
                        console.log('Report has been Submitted : ' + i);
                    });

                }


                // this gets the Tests
                $http.get('/planningview/api/tests/').success(function(qc_results) {
                    console.log('qc_results' + qc_results);
                    for (var i = 0; i < qc_results.length; i++) {
                        var nodesObj = new Nodes();
                        nodesObj.node_name = qc_results[i].TS_NAME;
                        nodesObj.node_path = "";
                        nodesObj.node_qc_id = qc_results[i].TC_TEST_ID;
                        nodesObj.node_parent_id = qc_results[i].TC_CYCLE_ID;
                        nodesObj.template = "Template 1";
                        nodesObj.type = "Test Procedure";
                        nodesObj.$save(function(results) {
                            console.log('Report has been Submitted : ' + i);
                        });

                    }


                });


            });
        });



    }

/*

    var traverseTree = function(root) {
        linearArray.push(root);
        if (root.nodes.length == 0) {
            return;
        } else {
            for (var i = 0; i < root.nodes.length; i++) {
                root.nodes[i].node_parent_path = root.node_path;
                root.nodes[i].node_parent_id = root.id;
                traverseTree(root.nodes[i]);
            }
        }
    }

*/

    var insertTest = function(root, testToInsert) {

    }




}]);

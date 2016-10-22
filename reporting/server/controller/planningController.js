var Report = require('../models/reports');
var Platform = require('../models/platforms');
var Nodes = require('../models/nodes');
var Template = require('../models/templates');
var sql = require('mssql');
var url = require('url');

var SQL_CONFIG = {
    user: 'td',
    password: 'tdtdtd',
    server: '10.23.200.176',
    database: 'default_ird_lab_db'
};

module.exports.getNodes = function(req, res) {
    // get data from MONGOOSE
    console.log("get Nodes function in server/planningController");

    // TODO:   var templateName = req.params.templateName 
    //         Nodes.find( { template: templateName } );
    Nodes.find({}, function(err, results) {
        if (err) {
            console.log('err');
        } else {
            console.log('results in serverside' + JSON.stringify(results, null, "       "));
            res.json(results);
        }
        //console.log('results is  *********************************' + results);
    });


}

module.exports.saveNodes = function(req, res) {

    console.log("save nodes function in server/planningController");



    console.log(req.body) // the bodyParser can parse the body from the request
    var node = new Nodes(req.body);
    node.save(function(err, result) {
        // pass the data to res so that the client can use this
        // This basically is a callback
        res.json(result);
    });

}

module.exports.getTestFolders = function(req, res) {
    sql.connect(SQL_CONFIG).then(function() {


            console.log('before running getTests Query');


            // Query #26

            var sQuery = "SELECT f1.* FROM CYCL_FOLD f1 ";
            sQuery += "JOIN ";
            sQuery += "(SELECT CF_ITEM_PATH as path ";
            sQuery += "     FROM CYCL_FOLD ";
            sQuery += "     WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 ";
            sQuery += "ON f1.CF_ITEM_PATH like ('%' + path + '%') ";



            //console.log(sQuery + ' \n');
            new sql.Request().query(sQuery).then(function(recordSet) {
                if (recordSet.length != 0) {
                    console.log('in record set' + JSON.stringify(recordSet, null, "    "));
                    console.log(recordSet.length);
                    res.json(recordSet);
                } else {
                    var noneFound = [{ "msg": "None Found" }];
                    res.json(noneFound);
                }
            }).catch(function(err) {
                console.log(err.message);

            })

        }) // end of sql.connect
}

module.exports.getTestSets = function(req, res) {
    sql.connect(SQL_CONFIG).then(function() {



            console.log('before running getTestsSets Query');


            // Query #27

            var sQuery = "SELECT CY_CYCLE_ID, CY_CYCLE, j1.CF_ITEM_ID,  j1.CF_ITEM_NAME,j1.CF_ITEM_PATH  ";
            sQuery += "FROM CYCLE ";
            sQuery += "JOIN  (SELECT f1.CF_ITEM_ID, ";
            sQuery += "              f1.CF_ITEM_NAME,  ";
            sQuery += "              f1.CF_ITEM_PATH,";
            sQuery += "              f1.CF_FATHER_ID";
            sQuery += "       FROM CYCL_FOLD f1  ";
            sQuery += "       JOIN (SELECT CF_ITEM_PATH as path ";
            sQuery += "             FROM CYCL_FOLD ";
            sQuery += "             WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2   ";
            sQuery += "        ON f1.CF_ITEM_PATH like ('%' + path + '%') ";
            sQuery += "           ) as j1   ";
            sQuery += "                                  ON CYCLE.CY_FOLDER_ID = j1.CF_ITEM_ID";

            //console.log(sQuery + ' \n');
            new sql.Request().query(sQuery).then(function(recordSet) {
                if (recordSet.length != 0) {
                    console.log('in record set' + JSON.stringify(recordSet, null, "    "));
                    console.log(recordSet.length);
                    res.json(recordSet);
                } else {
                    var noneFound = [{ "msg": "None Found" }];
                    res.json(noneFound);
                }
            }).catch(function(err) {
                console.log(err.message);

            })

        }) // end of sql.connect
}

module.exports.getTests = function(req, res) {
    sql.connect(SQL_CONFIG).then(function() {



            console.log('before running getTests Query');

            // Query #28               
        var sQuery   = " SELECT c2.CF_ITEM_NAME as 'FOLDER', last_sub.*  FROM( ";
            sQuery      += "SELECT TS_NAME, g1.*";
            sQuery      += "FROM TEST JOIN(SELECT TC_CYCLE_ID,";
            sQuery      += "                      TC_TEST_ID,";
            sQuery      += "                      TC_STATUS,";
            sQuery      += "                      TC_TESTER_NAME, ";
            sQuery      += "                      TC_EXEC_DATE,";
            sQuery      += "                      TC_EXEC_TIME,";
            sQuery      += "                      TC_TESTCYCL_ID, ";
            sQuery      += "                      TC_TEST_CONFIG_ID,";
            sQuery      += "                      t2.*";
            sQuery      += "                FROM TESTCYCL JOIN(SELECT CY_CYCLE_ID,";
            sQuery      += "                                          CY_CYCLE,";
            sQuery      += "                                          CY_OPEN_DATE,";
            sQuery      += "                                          CY_STATUS,";
            sQuery      += "                                          j1.CF_ITEM_ID,";
            sQuery      += "                                          j1.CF_ITEM_NAME,  ";
            sQuery      += "                                          j1.CF_ITEM_PATH,  ";
            sQuery      += "                                          SUBSTRING(j1.CF_ITEM_PATH, 0, 28) AS subpath,";
            sQuery      += "                                          j1.CF_FATHER_ID";
            sQuery      += "                                   FROM CYCLE JOIN(SELECT f1.CF_ITEM_ID,";
            sQuery      += "                                                          f1.CF_ITEM_NAME,";
            sQuery      += "                                                          f1.CF_ITEM_PATH, ";
            sQuery      += "                                                          f1.CF_FATHER_ID ";
            sQuery      += "                                                   FROM CYCL_FOLD f1 ";
            sQuery      += "                                                   JOIN (SELECT CF_ITEM_PATH as path";
            sQuery      += "                                                         FROM CYCL_FOLD";
            sQuery      += "                                                         WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2";
            sQuery      += "                                                   ON f1.CF_ITEM_PATH like ('%' + path + '%')";
            sQuery      += "                                   ) as j1                     ";
            sQuery      += "                       ON CYCLE.CY_FOLDER_ID = j1.CF_ITEM_ID ";
            sQuery      += "                        ) as t2                                  ";
            sQuery      += "                     ON TC_CYCLE_ID = t2.CY_CYCLE_ID    ) as g1 ";
            sQuery      += "              ON TEST.TS_TEST_ID = g1.TC_TEST_ID ) as last_sub"; 
            sQuery      += "     join CYCL_FOLD c2 on c2.CF_ITEM_PATH = last_sub.subpath";



            //console.log(sQuery + ' \n');
            new sql.Request().query(sQuery).then(function(recordSet) {
                if (recordSet.length != 0) {
                    console.log('in record set' + JSON.stringify(recordSet, null, "    "));
                    console.log(recordSet.length);
                    res.json(recordSet);
                } else {
                    var noneFound = [{ "msg": "None Found" }];
                    res.json(noneFound);
                }
            }).catch(function(err) {
                console.log(err.message);

            })

        }) // end of sql.connect
}

// functions gets all the avg
module.exports.getAvg = function(req, res) {
    sql.connect(SQL_CONFIG).then(function() {

        var list_of_test_ids = req.body.testids;
        console.log('lit of ids ********');

        console.log(JSON.stringify(list_of_test_ids));
        console.log('list of test ids *****');

            console.log('before running getAvg Query');


             
                    
                    
                    
            // Query 29
        
        var sQuery       = " SELECT AVG(RN_DURATION) as 'avg_qc', RN_TEST_ID FROM RUN";
            sQuery      += " WHERE ( RN_EXECUTION_DATE >= '2014-01-01 00:00:00.000' ";
            sQuery      += "AND (RN_STATUS = 'PASSED' OR RN_STATUS ='FAILED')  ";
            sQuery      += " AND RN_DURATION >= 240 AND RN_TEST_ID in ("+list_of_test_ids.join()+ ")) ";
            sQuery      += " GROUP BY RN_TEST_ID";




            //console.log(sQuery + ' \n');
            new sql.Request().query(sQuery).then(function(recordSet) {
                if (recordSet.length != 0) {
                    console.log('in record set' + JSON.stringify(recordSet, null, "    "));
                    console.log(recordSet.length);
                    res.json(recordSet);
                } else {
                    var noneFound = [{ "msg": "None Found" }];
                    res.json(noneFound);
                }
            }).catch(function(err) {
                console.log(err.message);

            })

        }) // end of sql.connect
}


module.exports.getAllTests = function(req, res) {
    sql.connect(SQL_CONFIG).then(function() {


            console.log('before running getAllTests Query');

            // Query 30
        var sQuery       = " SELECT  TEST.TS_NAME , AVG(RN_DURATION) as 'avg_qc', RN_TEST_ID FROM RUN";
            sQuery      += "  RIGHT  JOIN TEST on RUN.RN_TEST_ID = TEST.TS_TEST_ID  ";
            sQuery      += " WHERE ( RN_EXECUTION_DATE >= '2014-01-01 00:00:00.000'   ";
            sQuery      += "  AND (RN_STATUS = 'PASSED' OR RN_STATUS ='FAILED')   ";
            sQuery      += " AND RN_DURATION >= 240  AND TEST.TS_STATUS='Released')";
            sQuery      += "  GROUP BY RN_TEST_ID, TEST.TS_NAME ORDER BY TEST.TS_NAME";            




            //console.log(sQuery + ' \n');
            new sql.Request().query(sQuery).then(function(recordSet) {
                if (recordSet.length != 0) {
/*                    console.log('in record set' + JSON.stringify(recordSet, null, "    "));
                    console.log(recordSet.length);*/
                    res.json(recordSet);
                } else {
                    var noneFound = [{ "msg": "None Found" }];  
                    res.json(noneFound);
                }
            }).catch(function(err) {
                console.log(err.message);

            })

        }) // end of sql.connect
}





module.exports.getTemplatesList = function(req, res) {
    // get data from MONGOOSE
    console.log("getTemplateList function in server/planningController");
    
    Template.find({}, function(err, results) {
        console.log('results is  ' + results);
        res.json(results); 

    });


}

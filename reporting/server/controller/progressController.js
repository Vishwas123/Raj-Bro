var Report = require('../models/reports');
var Platform = require('../models/platforms');
var sql = require('mssql');
var url = require('url');

var SQL_CONFIG = {
    user: 'td',
    password: 'tdtdtd',
    server: '10.23.200.176',
    database: 'default_ird_lab_db'
};


/* 
    Function called with a http.get request from ProgressContorller.js
    Makes the request to the QC Database, and gets test data in a chosen
    cycle. 
 */
module.exports.getTests = function(req, res) {
    console.log('in getTests');
    console.log('req : ' + req.params.cyclename);
    var cycleName = req.params.cyclename;

    sql.connect(SQL_CONFIG).then(function() {

            var objReturn = {};

            console.log('before running getTests Query');


            
            // Query 23
            // 
            var sQuery = "SELECT before_sub.*, r2.avg_qc FROM ( ";
            sQuery += "SELECT c2.CF_ITEM_NAME as 'FOLDER', last_sub.* FROM  ";
            sQuery += "( ";
            sQuery += "    SELECT TS_NAME, g1.* ";
            sQuery += "    FROM TEST  ";
            sQuery += "    JOIN (SELECT TC_CYCLE_ID, ";
            sQuery += "                    TC_TEST_ID, ";
            sQuery += "                    TC_STATUS, ";
            sQuery += "                    TC_TESTER_NAME, ";
            sQuery += "                    TC_EXEC_DATE, ";
            sQuery += "                    TC_EXEC_TIME, ";
            sQuery += "                    TC_TESTCYCL_ID, ";
            sQuery += "                    TC_TEST_CONFIG_ID, ";
            sQuery += "                    t2.*  ";
            sQuery += "          FROM TESTCYCL  ";
            sQuery += "          JOIN (SELECT CY_CYCLE_ID, ";
            sQuery += "                        CY_CYCLE, ";
            sQuery += "                        CY_OPEN_DATE, ";
            sQuery += "                        CY_STATUS, ";
            sQuery += "                        j1.CF_ITEM_ID, ";
            sQuery += "                        j1.CF_ITEM_NAME, ";
            sQuery += "                        j1.CF_ITEM_PATH,                     ";
            sQuery += "                        SUBSTRING(j1.CF_ITEM_PATH,0,28) AS subpath, ";
            sQuery += "                        j1.CF_FATHER_ID      ";
            sQuery += "                 FROM CYCLE  ";
            sQuery += "                 JOIN  (SELECT f1.CF_ITEM_ID, ";
            sQuery += "                         f1.CF_ITEM_NAME, ";
            sQuery += "                         f1.CF_ITEM_PATH, ";
            sQuery += "                         f1.CF_FATHER_ID ";
            sQuery += "                          FROM CYCL_FOLD f1   ";
            sQuery += "                                        JOIN (SELECT CF_ITEM_PATH as path  ";
            sQuery += "                                              FROM CYCL_FOLD  ";
            sQuery += "                                              WHERE CF_ITEM_NAME = '" + cycleName + "') t2  ";
            sQuery += "                                        ON f1.CF_ITEM_PATH like ('%' + path + '%')  ";
            sQuery += "                                                WHERE CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1   ";
            sQuery += "                                                JOIN (SELECT CF_ITEM_PATH as path  ";
            sQuery += "                                                    FROM CYCL_FOLD  ";
            sQuery += "                                                    WHERE CF_ITEM_NAME = '" + cycleName + "') t2  ";
            sQuery += "                                                ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Automation') + '%' ) AND  ";
            sQuery += "                                                CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1   ";
            sQuery += "                                                JOIN (SELECT CF_ITEM_PATH as path  ";
            sQuery += "                                                    FROM CYCL_FOLD  ";
            sQuery += "                                                    WHERE CF_ITEM_NAME = '" + cycleName + "') t2  ";
            sQuery += "                                                ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Special') + '%' )  ";
            sQuery += "                            ) as j1 ";
            sQuery += "                 ON CYCLE.CY_FOLDER_ID = j1.CF_ITEM_ID ";
            sQuery += "                 ) as t2 ";
            sQuery += "            ON TC_CYCLE_ID = t2.CY_CYCLE_ID ) as g1 ";
            sQuery += "    ON TEST.TS_TEST_ID = g1.TC_TEST_ID ) ";
            sQuery += " as last_sub ";
            sQuery += "    join CYCL_FOLD c2 on c2.CF_ITEM_PATH = last_sub.subpath   ) as before_sub    ";
            sQuery += "left join ( ";
            sQuery += "            SELECT AVG(r1.RN_DURATION) as 'avg_qc', r1.RN_TEST_ID FROM RUN as r1  ";
            sQuery += "            WHERE (r1.RN_EXECUTION_DATE >= '2014-01-01 00:00:00.000'  ";
            sQuery += "                    AND (r1.RN_STATUS = 'PASSED' OR r1.RN_STATUS ='FAILED') ";
            sQuery += "                    AND r1.RN_DURATION >= 240) GROUP BY r1.RN_TEST_ID ";
            sQuery += "            ";
            sQuery += "        ) as r2 ";
            sQuery += "ON before_sub.TC_TEST_ID = r2.RN_TEST_ID ";

            console.log("cycleName is : " + cycleName);
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

/*
    Function called to retrieve reports for list_of_test_ids
 */
module.exports.getTestInfo = function(req, res) {
    console.log('in getTestInfo');

    var list_of_test_ids = req.body.testids;
    var list_of_test_names = req.body.testnames;
    var cycleName = req.body.cyclename;
    console.log('cycleName is ' + cycleName);
    // query here using the req.body
    var test = { "test": "test answer" };
    Report.aggregate( 
    { $match: {
            "testname": { $in: list_of_test_names },
                         cycle: { $elemMatch: { cycleName: cycleName }}
                    }
    },
    { "$sort": {"date":1}},
    { $group: {
            _id: '$test_instance_id',
            testname: { '$last': '$testname' },
            testid:   { '$last': '$testid'   },
            runid:    { '$last': '$runid'    },
            testerid: { '$last': '$testerid' },
            duration_time: { '$last': '$duration_time' },
            total_time: { '$last': '$total_time' },
            setup_time: { '$last': '$setup_time' },
            testing_time: { '$last': '$testing_time' },
            error_time: { '$last': '$error_time' },
            misc_time: { '$last': '$misc_time' },
            date: {'$last': '$date'},
            original_id: {'$last': '$_id'}
                                                      
    }}/*{
            $and: [
                { "testname": { $in: list_of_test_names } }, {
                    cycle: {
                        $elemMatch: { cycleName: cycleName }

                    }
                }
            ]
        }*/,
        function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('response');
                console.log(result);
                res.json(result);
            }
        });
}

module.exports.getAvgInfo = function(req, res) {
    console.log('in getAvgInfo');

    var list_of_test_ids = req.body.testids;
    // query here using the req.body
    // 
    console.log('list of test ids*******');
    console.log(JSON.stringify(list_of_test_ids));
    console.log('list of test ids*******');
    Report.aggregate([{ $match: { "testid": { $in: list_of_test_ids } } }, {
                $group: {
                    _id: "$testid",
                    test_name: { $first: "$testname" },
                    avg_duration: { $avg: "$duration_time" },
                    avg_total: { $avg: "$total_time" },
                    avg_setup: { $avg: "$setup_time" },
                    avg_error: { $avg: "$error_time" },
                    avg_testing: { $avg: "$testing_time" },
                    avg_misc: { $avg: "$misc_time" },

                }

            },
            { $sort: { _id: 1 } }
        ],
        function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('response************************************');
                console.log(result);
                res.json(result);
            }
        });
}

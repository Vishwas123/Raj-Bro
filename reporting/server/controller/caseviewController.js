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

module.exports.getCases = function(req, res) {
    //console.log('in testQuery');
    //console.log('req : ' + req.params.cyclename);
    var cycleName = req.params.cyclename;
    sql.connect(SQL_CONFIG).then(function() {

            var objReturn = {};

            console.log('before running query');
            // Query 33
            var sQuery = "SELECT r2.RQ_REQ_NAME AS Feature, beforefeature.CF_ITEM_NAME, beforefeature.TEST_PROCEDURE, ";
            sQuery += "beforefeature.TESTCASE, beforefeature.CF_ITEM_PATH from (SELECT uptopath.*, c2.CF_ITEM_NAME  ";
            sQuery += "FROM ( SELECT result.RQ_REQ_ID,result.RQ_REQ_NAME AS 'TESTCASE',result.TS_NAME AS 'TEST_PROCEDURE',  ";
            sQuery += "result.TS_TEST_ID,result.RQ_FATHER_ID, p1.CF_ITEM_PATH, SUBSTRING(p1.CF_ITEM_PATH,0,28) AS subpath    ";
            sQuery += "FROM ( SELECT   r.RQ_REQ_ID, r.RQ_REQ_NAME,r.RQ_FATHER_ID,r.RQ_REQ_PATH, rc.RC_ENTITY_ID, t.TS_NAME, ";
            sQuery += "t.TS_TEST_ID FROM (SELECT * FROM REQ WHERE REQ.RQ_REQ_PATH LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc ";
            sQuery += "join TEST t on t.TS_TEST_ID = rc.RC_ENTITY_ID WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID  ";
            sQuery += "AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE  ";
            sQuery += "WHERE CY_FOLDER_ID in (SELECT CF_ITEM_ID FROM CYCL_FOLD f1 WHERE CF_ITEM_PATH like ('%' + (SELECT CF_ITEM_PATH as path FROM CYCL_FOLD  ";
            sQuery += "WHERE CF_ITEM_NAME ='" + cycleName + "') +'%')))))) AS result JOIN (  SELECT CF_ITEM_PATH, TC_TEST_ID FROM  ";
            sQuery += "(SELECT * FROM (SELECT  t1.CY_CYCLE_ID, t1.CY_CYCLE, t1.CY_STATUS, t1.CY_FOLDER_ID, t1.CY_OPEN_DATE, cf.CF_ITEM_PATH ";
            sQuery += "FROM ( SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE FROM CYCLE WHERE CY_FOLDER_ID in  ";
            sQuery += "(SELECT c1.CF_ITEM_ID FROM CYCL_FOLD as c1 WHERE c1.CF_ITEM_PATH LIKE 'AAAAAFAAFAAMAAFAAAAET%' )  ) AS t1  ";
            sQuery += "join CYCL_FOLD as cf on t1.CY_FOLDER_ID = cf.CF_ITEM_ID) as sub1  ) AS sub2 join TESTCYCL on TESTCYCL.TC_CYCLE_ID = sub2.CY_CYCLE_ID)  ";
            sQuery += "as p1 on result.TS_TEST_ID = p1.TC_TEST_ID) as uptopath join CYCL_FOLD c2 on c2.CF_ITEM_PATH = uptopath.subpath ) as beforefeature ";
            sQuery += "join REQ r2 on r2.RQ_REQ_ID = beforefeature.RQ_FATHER_ID ORDER BY r2.RQ_REQ_NAME ";



            //console.log(sQuery + ' \n');
            new sql.Request().query(sQuery).then(function(recordSet) {
                if (recordSet.length != 0) {
                    //console.log('in record set' + JSON.stringify(recordSet, null, "    "));
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

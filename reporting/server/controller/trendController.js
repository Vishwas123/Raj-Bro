var Report = require('../models/reports');

/*
    Get the trend for a a cycle, QC data VS USER data
 */
module.exports.trendList = function(req, res) {
        // console.log('trendList' + JSON.stringify(req.body));
        console.log('trendList serverside');

        console.log('platform : ' + req.params.platform);
        Report.aggregate(
            [
                { "$unwind": "$cycle" }, 
                { $match : { platform : req.params.platform } },
                {
                    $group: {
                        _id: "$cycle.cycleName",
                        cycleType: { $first: "$cycle.cycleType" },
                        startDate: { $first: "$cycle.startDate" }, 
                        sum_qc: { $sum: "$duration_time" },
                        sum_tester: { $sum: "$total_time" },
                        sum_setup: { $sum: "$setup_time" },
                        sum_testing: { $sum: "$testing_time" },
                        sum_error: { $sum: "$error_time" },
                        sum_misc: { $sum: "$misc_time" }
                    }
     
                },
                {
                    $sort: {cycleType:1}
                }
            ],
            function(err, results) {
                if (err) {
                    console.log('err in trendController server' + err);
                    res.json(err);
                } //console.log('server/avgController list function');
                console.log('results in serverside' + JSON.stringify(results,null, "       "));
                res.json(results);
            });
    }


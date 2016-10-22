var Report = require('../models/reports');

/*
    Function to call aggregate average function.
    The average is for all the RUNS for a particular TEST.
 */
module.exports.avgList = function(req, res) {
	console.log('ffff' + JSON.stringify(req.body));
	// get data from MONGOOSE
	Report.aggregate( 
		   [
		     {
		       $group:
		         {
		           _id: "$testid",
		           test_name: { $first:"$testname"},
		           avg_duration:  { $avg: "$duration_time"   },
		           avg_total: 	  { $avg: "$total_time"		 },		
		           avg_setup:     { $avg: "$setup_time"      },
		           avg_error:     { $avg: "$error_time"      },
		           avg_testing:   { $avg: "$testing_time"    },
		           avg_misc:      { $avg: "$misc_time"       },

		         }

		     },
		      {$sort:{_id:1}}
		   ]
		, function(err, results) {
			if(err){
				console.log('err in avController server' + err);
				res.json(err);
			}//console.log('server/avgController list function');
			//console.log('results in serverside' + JSON.stringify(results));
			res.json(results); 
			
	});
}


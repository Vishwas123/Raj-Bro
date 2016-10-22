db.reports.aggregate(
[

    { "$unwind": "$cycle" },
    { $group: {    
                   _id: {cycleName:"$cycle.cycleName"},
                   cycleType:{$first:"$cycle.cycleType"},
                   sum_qc:{$sum:"$duration_time"},
                   sum_tester:{$sum:"$total_time"},
                   sum_setup:{$sum:"$setup_time"},
                   sum_testing:{$sum:"$testing_time"},
                   sum_error:{$sum:"$error_time"},
                   sum_misc:{$sum:"$misc_time"}
             }
                 
    }])

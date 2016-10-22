Definitions:

	TEST SET    	-	CDIUI
	TEST PROCEDURE  - 	CDIUI 89 
	TESTCYCL 		-	Contains all the TEST SET  (CDIUI)
	TEST 			-	Contains the actual test set(ex. CDIUI 89 )



// mongoDB Query
//get all the avg of test provided in $in 

db.getCollection('reports').aggregate( 
		   [{ $match : { "testid" :  { $in: [ 5, 16 ] }} } ,
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
		   ])

--------------------------------------------------------------------
/* Query 1  
 * Description : Getting Test Procedures of particular Test Set  
 * TC_CYCLE_ID = 293388  = Robin/Core/ES/CloudOn/P1/CDIUI 
 */

SELECT * FROM TESTCYCL 
WHERE TC_CYCLE_ID='293388'

-------------------------------------------------------------------

/* Query 2 
 * Description : Get Direct Children of '411894' = Robin 0xBd0 (Comprehensive)
 */
SELECT * FROM CYCL_FOLD 
	WHERE CF_FATHER_ID = '411894'

-------------------------------------------------------------------

/* Query 3 
 * Description : Get Path for a Particular Cycle
 * Used as a subquery. 
 */

SELECT CF_ITEM_PATH 
	FROM CYCL_FOLD 
	WHERE CF_ITEM_NAME = 'Robin 0xBD0 (Comprehensive)'

-------------------------------------------------------------------

/* Query 4 
 * Description : Get Cycle Name with Cycle ID
 * CF_ITEM_ID = 411894 === Robin
 */

SELECT CF_ITEM_ID, CF_ITEM_NAME 
	FROM CYCL_FOLD 
	WHERE CF_ITEM_ID = '411894'

-------------------------------------------------------------------

/* Query 5 
 * Description : Get all test Sets in a particular folder 
 * CY_FOLDER_ID = 411913 => Robin/ES/CloudOn/Core/P1
 */

SELECT CY_CYCLE_ID, CY_CYCLE CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
	FROM CYCLE 
	WHERE CY_FOLDER_ID = '411913' 
-------------------------------------------------------------------

/* Query 6
 * Description : Get ALL The Test Cases from Requirements Module for a particular Test Procedure
 * RC_ENTITY_ID = 13752  is same as TEST.TS_TEST_ID = 13752  which is CDIUI 79 
 */

SELECT RQ_REQ_ID, RQ_REQ_NAME 
	FROM REQ, REQ_COVER 
	WHERE REQ.RQ_REQ_ID = REQ_COVER.RC_REQ_ID 
	AND REQ_COVER.RC_ENTITY_ID = '13752'

-------------------------------------------------------------------

/* Query 7 
 * Description : Get all the Folders Under a Particular Cycle Using LIKE the cycle's path
 * 'AAAAAFAAFAAMAAFAAAAET%'    = Robin's Cycle Path
 */

SELECT CF_ITEM_ID FROM CYCL_FOLD
			WHERE CF_ITEM_PATH 
			LIKE 'AAAAAFAAFAAMAAFAAAAET%'    


/* Query 8   related to Query 7
 * Description : Get all the Folders under a particular Cycle using a subquery 
 * Subquery = Gets the Path for a particular cycle found from the name of the Cycle folder
 */

// get all the folders under Robin but using the results from Robins name
	SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
	    JOIN
	    (SELECT CF_ITEM_PATH as path 
			FROM CYCL_FOLD 
			WHERE CF_ITEM_NAME = 'Robin 0xBD0 (Comprehensive)') t2 
	    ON f1.CF_ITEM_PATH like ('%' + path + '%')






-------------------------------------------------------------------

/* Query 9
 * Description : Get all the Test Procedures from Given Cycle, then join them with the 'TEST' table, to get the name for the test
 */
	
SELECT tc.TC_CYCLE_ID, tc.TC_TEST_ID, t.TS_NAME, t.TS_TEST_ID 
FROM TESTCYCL tc  
	join TEST t on tc.TC_TEST_ID=t.TS_TEST_ID WHERE TC_CYCLE_ID in ( SELECT CY_CYCLE_ID FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD
							WHERE CF_ITEM_PATH LIKE 'AAAAAFAAFAAMAAFAAAAET%')) order by TC_CYCLE_ID desc

-------------------------------------------------------------------

/* Query 10  similar to Query 9
 * Description : Get all the Test Procedures from Given Cycle, then join them with the 'TEST' table, to get the name for the test 
 * 															   then join them with the 'CYCLE' table to get where each test belongs 
 */


SELECT tc.TC_CYCLE_ID, tc.TC_TEST_ID, t.TS_NAME, c.CY_CYCLE 
	FROM TESTCYCL tc 
		join TEST t on tc.TC_TEST_ID = t.TS_TEST_ID 
		join CYCLE c on tc.TC_CYCLE_ID = c.CY_CYCLE_ID 
	 WHERE TC_CYCLE_ID in ( SELECT CY_CYCLE_ID FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD
							WHERE CF_ITEM_PATH LIKE 'AAAAAFAAFAAMAAFAAAAET%')) order by c.CY_CYCLE_ID desc

-------------------------------------------------------------------

/* Query 11  
 * Description : Get all the Test Procedures in a Partciular Folder/or Test Set at a specific path. 
 * TC_CYCLE_ID ='293365' is HRIUI under a cycle 
 */

SELECT TC_CYCLE_ID,TC_TEST_ID,CY_CYCLE, TS_NAME 
FROM TESTCYCL 
	join CYCLE on TC_CYCLE_ID = CY_CYCLE_ID 
	join TEST on TS_TEST_ID = TC_TEST_ID 
	WHERE TC_CYCLE_ID='293365'
	

-------------------------------------------------------------------

/* Query 12
 * Description : 
 */

// get all the test sets in the cycle
SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
	FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD
										WHERE CF_ITEM_PATH 
										LIKE 'AAAAAFAAFAAMAAFAAAAET%')

-------------------------------------------------------------------

/* Query 13
 * Description : 
 */
// get all the test procedures in the test sets in the cycle
SELECT TC_TEST_ID FROM TESTCYCL WHERE TC_CYCLE_ID in (	SELECT CY_CYCLE_ID FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD
			WHERE CF_ITEM_PATH 
			LIKE 'AAAAAFAAFAAMAAFAAAAET%'))


/* Query 14 related to 13 but using Robin this time
 * Description : get all the test procedures in the test sets in the cycle but using robin 
 */

SELECT TC_TEST_ID FROM TESTCYCL WHERE TC_CYCLE_ID in (	
	SELECT CY_CYCLE_ID FROM CYCLE WHERE CY_FOLDER_ID in ( 
	SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
	    JOIN
	    (SELECT CF_ITEM_PATH as path 
			FROM CYCL_FOLD 
			WHERE CF_ITEM_NAME = 'Robin 0xBD0 (Comprehensive)') t2 
	    ON f1.CF_ITEM_PATH like ('%' + path + '%'))
	)

// get all the Test Procedures with its name 

/* Query 15 related to 14 
 * Description : Get 
 */
SELECT * FROM TEST WHERE TEST.TS_TEST_ID in (SELECT TC_TEST_ID FROM TESTCYCL WHERE TC_CYCLE_ID in (	
	SELECT CY_CYCLE_ID FROM CYCLE WHERE CY_FOLDER_ID in ( 
	SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
	    JOIN
	    (SELECT CF_ITEM_PATH as path 
			FROM CYCL_FOLD 
			WHERE CF_ITEM_NAME = 'Robin 0xBD0 (Comprehensive)') t2 
	    ON f1.CF_ITEM_PATH like ('%' + path + '%'))
	))

-------------------------------------------------------------------

/* Query 16 ****
 * Description :  Get all the Folders that Start with NFT_FEATURE    
 * This will be used as subquery to take out tests in NEW_FEATURE folder for progress view
 */

SELECT CYCL_FOLD.CF_ITEM_ID,CYCL_FOLD.CF_ITEM_NAME, c2.CF_ITEM_NAME as 'Parent' 
	FROM CYCL_FOLD 
	join CYCL_FOLD c2 on c2.CF_ITEM_ID = CYCL_FOLD.CF_FATHER_ID
	WHERE CYCL_FOLD.CF_ITEM_NAME LIKE 'NFT_Feature%' 


-------------------------------------------------------------------

/* Query 17 
 * Description : Get all the Test Cases for a Particular Folder
 */


// getting all the test cases from NEW_FEATURE_FOLDER under Robin

SELECT r.RQ_REQ_ID, r.RQ_REQ_NAME 
		FROM (SELECT * FROM REQ  
			WHERE RQ_REQ_PATH
			LIKE 'AAAAADAAF%') AS r, REQ_COVER 
	WHERE (r.RQ_REQ_ID = REQ_COVER.RC_REQ_ID 
	AND REQ_COVER.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
									WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE 
															WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD
																					WHERE CF_ITEM_PATH 
																					LIKE 'AAAAAFAAFAAMAAFAAAAET%'))))

/* Query 18 same as 17 
 * Description : Get all the Test Cases for a Particular Folder but using 'Robin' as subquery
 */

SELECT r.RQ_REQ_ID, r.RQ_REQ_NAME ,r.RQ_REQ_PATH, RC_ENTITY_ID
	FROM (SELECT * FROM REQ  
			WHERE REQ.RQ_REQ_PATH
			LIKE 'AAAAADAAF%') AS r, REQ_COVER
	WHERE (r.RQ_REQ_ID = REQ_COVER.RC_REQ_ID 
	AND REQ_COVER.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL WHERE TC_CYCLE_ID in (	
		SELECT CY_CYCLE_ID FROM CYCLE WHERE CY_FOLDER_ID in ( 
				SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
	    JOIN
	    (SELECT CF_ITEM_PATH as path 
			FROM CYCL_FOLD 
			WHERE CF_ITEM_NAME = 'Robin 0xBD0 (Comprehensive)') t2 
	    ON f1.CF_ITEM_PATH like ('%' + path + '%')))))



-------------------------------------------------------------------

/* Query 19
 * Description : Get all the Test Cases Group by their Test Procedures
 */

	SELECT r.RQ_REQ_ID, r.RQ_REQ_NAME ,r.RQ_REQ_PATH, rc.RC_ENTITY_ID, t.TS_NAME
		FROM (SELECT * FROM REQ  
				WHERE REQ.RQ_REQ_PATH
				LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc
		join Test t on t.TS_TEST_ID = rc.RC_ENTITY_ID 
		WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID 
		AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL WHERE TC_CYCLE_ID in (	
			SELECT CY_CYCLE_ID FROM CYCLE WHERE CY_FOLDER_ID in ( 
					SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
		    JOIN
		    (SELECT CF_ITEM_PATH as path 
				FROM CYCL_FOLD 
				WHERE CF_ITEM_NAME = 'Robin 0xBD0 (Comprehensive)') t2 
		    ON f1.CF_ITEM_PATH like ('%' + path + '%')))))



-------------------------------------------------------------------

/* Query 20
 * Description : Get All The Folders in a Cycle but Exclude 'Special' AND' Automation' Folders
 */


SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
    JOIN
    (SELECT CF_ITEM_PATH as path 
		FROM CYCL_FOLD 
		WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
    ON f1.CF_ITEM_PATH like ('%' + path + '%') 
    WHERE CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
    JOIN (SELECT CF_ITEM_PATH as path 
		FROM CYCL_FOLD 
		WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Automation') + '%' ) AND 
    CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
    JOIN (SELECT CF_ITEM_PATH as path 
		FROM CYCL_FOLD 
		WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Special') + '%' )

-------------------------------------------------------------------

/* Query 21   using Query 20 
 * Description : Get All The Test Procedures in a Cycle but Exclude 'Special' AND' Automation' Folders   but using subquery
 */

// get all the test sets in a Cycle but exclude folder "Special" and "Automation" using query above as subquery
// used in Progressview

SELECT TS_NAME,TS_EXEC_STATUS, 
	   TS_VC_CHECKIN_USER_NAME, 
	   TS_VC_CHECKIN_DATE 
FROM TEST WHERE TEST.TS_TEST_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
									WHERE TC_CYCLE_ID in (	
															SELECT CY_CYCLE_ID FROM CYCLE 
															WHERE CY_FOLDER_ID in ( 
																					SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
	    																			JOIN (SELECT CF_ITEM_PATH as path 
																						  FROM CYCL_FOLD 
																						  WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
																					ON f1.CF_ITEM_PATH like ('%' + path + '%') 
																						    WHERE CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
																						    JOIN (SELECT CF_ITEM_PATH as path 
																								FROM CYCL_FOLD 
																								WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
																						    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Automation') + '%' ) AND 
																						    CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
																						    JOIN (SELECT CF_ITEM_PATH as path 
																								FROM CYCL_FOLD 
																								WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
																						    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Special') + '%' ) )
																						) 
									)

-------------------------------------------------------------------

/* Query 22   Revised from 21
 * Description : Get All The Test Procedures in a Cycle but Exclude 'Special' AND' Automation' Folders   but using subquery
 */

SELECT c2.CF_ITEM_NAME as 'FOLDER', last_sub.*  FROM(
SELECT TS_NAME, g1.*
FROM TEST 
JOIN (SELECT TC_CYCLE_ID,
				TC_TEST_ID,
				TC_STATUS,
				TC_TESTER_NAME,
				TC_EXEC_DATE,
				TC_EXEC_TIME,
				TC_TESTCYCL_ID,
				TC_TEST_CONFIG_ID,
				t2.* 
	  FROM TESTCYCL 
	  JOIN (SELECT CY_CYCLE_ID,
					CY_CYCLE,
					CY_OPEN_DATE,
					CY_STATUS,
					j1.CF_ITEM_ID,
					j1.CF_ITEM_NAME,
					j1.CF_ITEM_PATH,					
					SUBSTRING(j1.CF_ITEM_PATH,0,28) AS subpath,
					j1.CF_FATHER_ID		
			 FROM CYCLE 
			 JOIN  (SELECT f1.CF_ITEM_ID,
					 f1.CF_ITEM_NAME,
					 f1.CF_ITEM_PATH,
					 f1.CF_FATHER_ID
					  FROM CYCL_FOLD f1  
									JOIN (SELECT CF_ITEM_PATH as path 
										  FROM CYCL_FOLD 
										  WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
									ON f1.CF_ITEM_PATH like ('%' + path + '%') 
										    WHERE CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
										    JOIN (SELECT CF_ITEM_PATH as path 
												FROM CYCL_FOLD 
												WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
										    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Automation') + '%' ) AND 
										    CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
										    JOIN (SELECT CF_ITEM_PATH as path 
												FROM CYCL_FOLD 
												WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
										    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Special') + '%' ) 
						) as j1
			 ON CYCLE.CY_FOLDER_ID = j1.CF_ITEM_ID
			 ) as t2
		ON TC_CYCLE_ID = t2.CY_CYCLE_ID	) as g1
ON TEST.TS_TEST_ID = g1.TC_TEST_ID ) as last_sub
join CYCL_FOLD c2 on c2.CF_ITEM_PATH = last_sub.subpath


-------------------------------------------------------------------

/* Query 23   Revised from 22 to add average too
 * Description : Added the Average of each test from QC data in a Cycle but Exclude 'Special' AND' Automation' Folders   but using subquery
 */

SELECT before_sub.*, r2.avg_qc FROM (
	SELECT c2.CF_ITEM_NAME as 'FOLDER', last_sub.* FROM 
	(
		SELECT TS_NAME, g1.*
		FROM TEST 
		JOIN (SELECT TC_CYCLE_ID,
						TC_TEST_ID,
						TC_STATUS,
						TC_TESTER_NAME,
						TC_EXEC_DATE,
						TC_EXEC_TIME,
						TC_TESTCYCL_ID,
						TC_TEST_CONFIG_ID,
						t2.* 
			  FROM TESTCYCL 
			  JOIN (SELECT CY_CYCLE_ID,
							CY_CYCLE,
							CY_OPEN_DATE,
							CY_STATUS,
							j1.CF_ITEM_ID,
							j1.CF_ITEM_NAME,
							j1.CF_ITEM_PATH,					
							SUBSTRING(j1.CF_ITEM_PATH,0,28) AS subpath,
							j1.CF_FATHER_ID		
					 FROM CYCLE 
					 JOIN  (SELECT f1.CF_ITEM_ID,
							 f1.CF_ITEM_NAME,
							 f1.CF_ITEM_PATH,
							 f1.CF_FATHER_ID
							  FROM CYCL_FOLD f1  
											JOIN (SELECT CF_ITEM_PATH as path 
												  FROM CYCL_FOLD 
												  WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
											ON f1.CF_ITEM_PATH like ('%' + path + '%') 
												    WHERE CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
												    JOIN (SELECT CF_ITEM_PATH as path 
														FROM CYCL_FOLD 
														WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
												    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Automation') + '%' ) AND 
												    CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
												    JOIN (SELECT CF_ITEM_PATH as path 
														FROM CYCL_FOLD 
														WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
												    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Special') + '%' ) 
								) as j1
					 ON CYCLE.CY_FOLDER_ID = j1.CF_ITEM_ID
					 ) as t2
				ON TC_CYCLE_ID = t2.CY_CYCLE_ID	) as g1
		ON TEST.TS_TEST_ID = g1.TC_TEST_ID )
	 as last_sub
		join CYCL_FOLD c2 on c2.CF_ITEM_PATH = last_sub.subpath   ) as before_sub	
left join (
			SELECT AVG(r1.RN_DURATION) as "avg_qc", r1.RN_TEST_ID FROM RUN as r1 
			WHERE (r1.RN_EXECUTION_DATE >= '2014-01-01 00:00:00.000' 
					AND (r1.RN_STATUS = 'PASSED' OR r1.RN_STATUS ='FAILED')
					AND r1.RN_DURATION >= 240) GROUP BY r1.RN_TEST_ID
		) as r2
ON before_sub.TC_TEST_ID = r2.RN_TEST_ID 
-------------------------------------------------------------------

/* Query 24   
 * Description : Used in server/controllers/progressController 
 *               mongoDB query to get only the latest report for each test_instance_id
 * 
 */

var list_of_test_names = ["DTV Cinema 04","HMC Failsafe 03","HMC Failsafe 05", "HMC GenieLite 01","NEL BSL SWDL 09","CDIUI 82", "MRV 04","PUSH DT Conflict Handling 06",   "HBA 01", "XTV OSD 18","CDIUI 32","Universal Profile STB 04", "Multiple WVB Survey 01",
                           "NAT Traversal 01","4K VOD 07", "CDIUI 60", "Plugins 01", "4K Live 16", "Production Ad Insertion 01" ];
db.getCollection('reports').aggregate(

    { $match: {
            "testname": { $in: list_of_test_names },
                         cycle: { $elemMatch: { cycleName: "Superman 0xC35 (Comprehensive)" }}
                    }
    },
    { "$sort": {"date":1}},
    { $group: {
            _id: '$test_instance_id',
            testname: { '$first': '$testname' },
            testid:   { '$first': '$testid'   },
            runid:    { '$first': '$runid'    },
            testerid: { '$first': '$testerid' },
            duration_time: { '$first': '$duration_time' },
            total_time: { '$first': '$total_time' },
            setup_time: { '$first': '$setup_time' },
            testing_time: { '$first': '$testing_time' },
            error_time: { '$first': '$error_time' },
            misc_time: { '$first': '$misc_time' },
            date: {'$last': '$date'},
            original_id: {'$first': '$_id'}
                                                      
    }}

)                                       


-------------------------------------------------------------------


/* Query 25   
 * Description : Used in server/controllers/planningController   getTEstSets 
 *               Gets all the Test Sets in a cycle
 * 
 */



SELECT CY_CYCLE_ID, CY_CYCLE,	j1.CF_ITEM_ID,	j1.CF_ITEM_NAME,j1.CF_ITEM_PATH	
						 FROM CYCLE 
						 JOIN  (SELECT f1.CF_ITEM_ID,
								 f1.CF_ITEM_NAME,
								 f1.CF_ITEM_PATH,
								 f1.CF_FATHER_ID
								  FROM CYCL_FOLD f1  
												JOIN (SELECT CF_ITEM_PATH as path 
													  FROM CYCL_FOLD 
													  WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
												ON f1.CF_ITEM_PATH like ('%' + path + '%') 
													    WHERE CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
													    JOIN (SELECT CF_ITEM_PATH as path 
															FROM CYCL_FOLD 
															WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
													    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Automation') + '%' ) AND 
													    CF_ITEM_PATH NOT LIKE ('%' + (SELECT f1.CF_ITEM_PATH FROM CYCL_FOLD f1  
													    JOIN (SELECT CF_ITEM_PATH as path 
															FROM CYCL_FOLD 
															WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
													    ON f1.CF_ITEM_PATH like ('%' + path + '%') WHERE CF_ITEM_NAME = 'Special') + '%' ) 
									) as j1
						 ON CYCLE.CY_FOLDER_ID = j1.CF_ITEM_ID




-------------------------------------------------------------------

/* Query 26  Modified from Query 20 
 * Description : Get All The Folders in a Cycle
 */


SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
    JOIN
    (SELECT CF_ITEM_PATH as path 
		FROM CYCL_FOLD 
		WHERE CF_ITEM_NAME = 'Superman 0xC35 (Comprehensive)') t2 
    ON f1.CF_ITEM_PATH like ('%' + path + '%') 
  

-------------------------------------------------------------------


/* Query 27 modified from Query 25
 * Description : Used in server/controllers/planningController   getTEstSets 
 *               Gets all the Test Sets in a cycle
 * 
 */



SELECT CY_CYCLE_ID, CY_CYCLE,	j1.CF_ITEM_ID,	j1.CF_ITEM_NAME,j1.CF_ITEM_PATH	
						 FROM CYCLE 
						 JOIN  (SELECT f1.CF_ITEM_ID,
								 f1.CF_ITEM_NAME,
								 f1.CF_ITEM_PATH,
								 f1.CF_FATHER_ID
								  FROM CYCL_FOLD f1  
												JOIN (SELECT CF_ITEM_PATH as path 
													  FROM CYCL_FOLD 
													  WHERE CF_ITEM_NAME = 'Nala Double Prime xAC8 (REG TP)') t2 
												ON f1.CF_ITEM_PATH like ('%' + path + '%') 
													   
									) as j1	
						 ON CYCLE.CY_FOLDER_ID = j1.CF_ITEM_ID


-------------------------------------------------------------------

/* Query 28 modified from Query 22 
 * Description : Used in server/controllers/planningController   getTEstSets 
 *               Gets all the Test Sets in a cycle
 * 
 */
SELECT c2.CF_ITEM_NAME as 'FOLDER', last_sub.*  FROM(
SELECT TS_NAME, g1.*
FROM TEST 
JOIN (SELECT TC_CYCLE_ID,
				TC_TEST_ID,
				TC_STATUS,
				TC_TESTER_NAME,
				TC_EXEC_DATE,
				TC_EXEC_TIME,
				TC_TESTCYCL_ID,
				TC_TEST_CONFIG_ID,
				t2.* 
	  FROM TESTCYCL 
	  JOIN (SELECT CY_CYCLE_ID,
					CY_CYCLE,
					CY_OPEN_DATE,
					CY_STATUS,
					j1.CF_ITEM_ID,
					j1.CF_ITEM_NAME,
					j1.CF_ITEM_PATH,					
					SUBSTRING(j1.CF_ITEM_PATH,0,28) AS subpath,
					j1.CF_FATHER_ID		
			 FROM CYCLE 
			 JOIN  (SELECT f1.CF_ITEM_ID,
					 f1.CF_ITEM_NAME,
					 f1.CF_ITEM_PATH,
					 f1.CF_FATHER_ID
					  FROM CYCL_FOLD f1  
									JOIN (SELECT CF_ITEM_PATH as path 
										  FROM CYCL_FOLD 
										  WHERE CF_ITEM_NAME = 'SW 0x834_COMP (Gowron w/Positron)') t2 
									ON f1.CF_ITEM_PATH like ('%' + path + '%') 
						) as j1
			 ON CYCLE.CY_FOLDER_ID = j1.CF_ITEM_ID
			 ) as t2
		ON TC_CYCLE_ID = t2.CY_CYCLE_ID	) as g1
ON TEST.TS_TEST_ID = g1.TC_TEST_ID ) as last_sub
join CYCL_FOLD c2 on c2.CF_ITEM_PATH = last_sub.subpath

--------------------------------------------------------------------------

/* Query 29  
 * Description :Getting the average of tests in the (    )  
 * 
 */
        
      SELECT AVG(RN_DURATION) as 'avg_qc', RN_TEST_ID FROM RUN
  WHERE ( RN_EXECUTION_DATE >= '2014-01-01 00:00:00.000' 
 AND (RN_STATUS = 'PASSED' OR RN_STATUS ='FAILED')  
 AND RN_DURATION >= 240 AND RN_TEST_ID in (12391,13859,14327)) 
 GROUP BY RN_TEST_ID

------------------------------------------------------------------------

/* Query 30
 * Description :Getting the average of all the tests in the TEST table from QC 
 *               Gets all the Test Sets in a cycle
 * 
 */
        
SELECT  TEST.TS_NAME , AVG(RN_DURATION) as 'avg_qc', RN_TEST_ID FROM RUN

 RIGHT  JOIN TEST on RUN.RN_TEST_ID = TEST.TS_TEST_ID 
 WHERE ( RN_EXECUTION_DATE >= '2014-01-01 00:00:00.000' 
 AND (RN_STATUS = 'PASSED' OR RN_STATUS ='FAILED')  
 AND RN_DURATION >= 240  AND TEST.TS_STATUS='Released')
 GROUP BY RN_TEST_ID, TEST.TS_NAME






------------------------------------------------------------------------
/* Query 31
 * Description :Getting the Test Cases for Particular Cycvle
 * 
 */


SELECT beforefeature.* from (SELECT uptopath.*, c2.CF_ITEM_NAME from (SELECT result.RQ_REQ_ID,result.RQ_REQ_NAME AS 'TESTCASE',result.TS_NAME AS 'TEST PROCEDURE', result.TS_TEST_ID,result.RQ_FATHER_ID, p1.CF_ITEM_PATH, SUBSTRING(p1.CF_ITEM_PATH,0,28) AS subpath   FROM (	SELECT 	r.RQ_REQ_ID, 
			r.RQ_REQ_NAME,
			r.RQ_FATHER_ID,
			r.RQ_REQ_PATH, 
			rc.RC_ENTITY_ID, 
			t.TS_NAME,
			t.TS_TEST_ID
	FROM (SELECT * FROM REQ WHERE REQ.RQ_REQ_PATH LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc
	join TEST t on t.TS_TEST_ID = rc.RC_ENTITY_ID
	WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID 
			AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
									WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE 
															WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD f1 
																					WHERE CF_ITEM_PATH like ('%' + (SELECT CF_ITEM_PATH as path FROM CYCL_FOLD WHERE CF_ITEM_NAME ='Robin 0xBD0 (Comprehensive)') +'%')))))	) AS result

JOIN (      SELECT CF_ITEM_PATH, TC_TEST_ID FROM (SELECT * FROM ( SELECT t1.CY_CYCLE_ID, 
																											t1.CY_CYCLE, 
																											t1.CY_STATUS, 
																											t1.CY_FOLDER_ID, 
																											t1.CY_OPEN_DATE,
																											cf.CF_ITEM_PATH
																											from ( SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
																											FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT c1.CF_ITEM_ID FROM CYCL_FOLD as c1
																																					WHERE c1.CF_ITEM_PATH 
																																					LIKE 'AAAAAFAAFAAMAAFAAAAET%'
																																			 ) 
																												) AS t1 join CYCL_FOLD as cf on t1.CY_FOLDER_ID = cf.CF_ITEM_ID
																									) as justin  ) AS JOHN
																									join TESTCYCL on TESTCYCL.TC_CYCLE_ID = JOHN.CY_CYCLE_ID            ) as p1 on result.TS_TEST_ID = p1.TC_TEST_ID) as uptopath 
join CYCL_FOLD c2 on c2.CF_ITEM_PATH = uptopath.subpath ) as beforefeature
join REQ r2 on r2.RQ_REQ_ID = beforefeature.RQ_FATHER_ID



------------------------------------------------------------------------

/* Query 32
 * Description :Getting the Test Cases for Particular Cycvle
 * getting the FOLDER too Whether ES , UKR
 * 
 */





SELECT uptopath.*, c2.CF_ITEM_NAME from (SELECT result.RQ_REQ_ID,result.RQ_REQ_NAME AS 'TESTCASE',result.TS_NAME AS 'TEST PROCEDURE', result.TS_TEST_ID,result.RQ_FATHER_ID, p1.CF_ITEM_PATH, SUBSTRING(p1.CF_ITEM_PATH,0,28) AS subpath   FROM (	SELECT 	r.RQ_REQ_ID, 
			r.RQ_REQ_NAME,
			r.RQ_FATHER_ID,
			r.RQ_REQ_PATH, 
			rc.RC_ENTITY_ID, 
			t.TS_NAME,
			t.TS_TEST_ID
	FROM (SELECT * FROM REQ WHERE REQ.RQ_REQ_PATH LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc
	join TEST t on t.TS_TEST_ID = rc.RC_ENTITY_ID
	WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID 
			AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
									WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE 
															WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD f1 
																					WHERE CF_ITEM_PATH like ('%' + (SELECT CF_ITEM_PATH as path FROM CYCL_FOLD WHERE CF_ITEM_NAME ='Robin 0xBD0 (Comprehensive)') +'%')))))	) AS result

JOIN (      SELECT CF_ITEM_PATH, TC_TEST_ID FROM (SELECT * FROM ( SELECT t1.CY_CYCLE_ID, 
																											t1.CY_CYCLE, 
																											t1.CY_STATUS, 
																											t1.CY_FOLDER_ID, 
																											t1.CY_OPEN_DATE,
																											cf.CF_ITEM_PATH
																											from ( SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
																											FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT c1.CF_ITEM_ID FROM CYCL_FOLD as c1
																																					WHERE c1.CF_ITEM_PATH 
																																					LIKE 'AAAAAFAAFAAMAAFAAAAET%'
																																			 ) 
																												) AS t1 join CYCL_FOLD as cf on t1.CY_FOLDER_ID = cf.CF_ITEM_ID
																									) as sub1  ) AS sub2
																									join TESTCYCL on TESTCYCL.TC_CYCLE_ID = sub2.CY_CYCLE_ID            ) as p1 on result.TS_TEST_ID = p1.TC_TEST_ID) as uptopath 
join CYCL_FOLD c2 on c2.CF_ITEM_PATH = uptopath.subpath




--------------------------------------
/* Query 33
 * Description :Getting the Test Cases for Particular Cycvle
 * get the feature too
 */





// get the feature too



SELECT r2.RQ_REQ_NAME,
		beforefeature.* from (	SELECT uptopath.*, c2.CF_ITEM_NAME 
								FROM ( SELECT result.RQ_REQ_ID,result.RQ_REQ_NAME AS 'TESTCASE',result.TS_NAME AS 'TEST PROCEDURE', result.TS_TEST_ID,result.RQ_FATHER_ID, p1.CF_ITEM_PATH, SUBSTRING(p1.CF_ITEM_PATH,0,28) AS subpath   
									  FROM ( SELECT 	r.RQ_REQ_ID, 
														r.RQ_REQ_NAME,
														r.RQ_FATHER_ID,
														r.RQ_REQ_PATH, 
														rc.RC_ENTITY_ID, 
														t.TS_NAME,
														t.TS_TEST_ID
											FROM (SELECT * FROM REQ WHERE REQ.RQ_REQ_PATH LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc
											join TEST t on t.TS_TEST_ID = rc.RC_ENTITY_ID
											WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID 
												   AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
																		   WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE 
																								 WHERE CY_FOLDER_ID in (SELECT CF_ITEM_ID FROM CYCL_FOLD f1 
																														WHERE CF_ITEM_PATH like ('%' + (SELECT CF_ITEM_PATH as path FROM CYCL_FOLD 
																																						WHERE CF_ITEM_NAME ='Robin 0xBD0 (Comprehensive)') +'%')
																														)
																								 )
																		   )
												   )	
											) AS result
											JOIN (  SELECT CF_ITEM_PATH, TC_TEST_ID FROM (SELECT * FROM (SELECT	t1.CY_CYCLE_ID, 
																										  		t1.CY_CYCLE, 
																												t1.CY_STATUS, 
																												t1.CY_FOLDER_ID, 
																												t1.CY_OPEN_DATE,
																												cf.CF_ITEM_PATH
																										FROM ( SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
																												FROM CYCLE WHERE CY_FOLDER_ID in (SELECT c1.CF_ITEM_ID FROM CYCL_FOLD as c1
																																				  WHERE c1.CF_ITEM_PATH 
																																				  LIKE 'AAAAAFAAFAAMAAFAAAAET%'
																																				 ) 
																											 ) AS t1 join CYCL_FOLD as cf on t1.CY_FOLDER_ID = cf.CF_ITEM_ID
																										) as sub1  
																						) AS sub2 join TESTCYCL on TESTCYCL.TC_CYCLE_ID = sub2.CY_CYCLE_ID            
											 	) as p1 on result.TS_TEST_ID = p1.TC_TEST_ID
									) as uptopath 
								join CYCL_FOLD c2 on c2.CF_ITEM_PATH = uptopath.subpath ) as beforefeature
join REQ r2 on r2.RQ_REQ_ID = beforefeature.RQ_FATHER_ID ORDER BY r2.RQ_REQ_NAME










































/* Query  
 * Description : Get all the requirements from Requirement's 'NEW_FEATURE FOLDER
 */

SELECT REQ.RQ_REQ_ID FROM REQ  
			WHERE REQ.RQ_REQ_PATH
			LIKE 'AAAAADAAF%'





temp 


SELECT tc.TC_CYCLE_ID, t.TS_NAME, t.TS_TEST_ID 
FROM TESTCYCL tc  join TEST t on tc.TC_TEST_ID=t.TS_TEST_ID WHERE TC_CYCLE_ID in ( SELECT CY_CYCLE_ID FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD
							WHERE CF_ITEM_PATH LIKE 'AAAAAFAAFAAMAAFAAAAET%')) order by TC_CYCLE_ID desc



-----













	--------------------------------





	/// trying to figure out if theres a way to get th CF_ITEM_PATH too

	SELECT 	r.RQ_REQ_ID, 
			r.RQ_REQ_NAME,
			r.RQ_REQ_PATH, 
			rc.RC_ENTITY_ID, 
			t.TS_NAME, 
			t.TS_PATH
	FROM (SELECT * FROM REQ WHERE REQ.RQ_REQ_PATH LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc
	join Test t on t.TS_TEST_ID = rc.RC_ENTITY_ID 
	
	WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID 
			AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
									WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE 
															WHERE CY_FOLDER_ID in ( SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
																				    JOIN
																				    (SELECT CF_ITEM_PATH as path 
																						FROM CYCL_FOLD 
																						WHERE CF_ITEM_NAME = 'Robin 0xBD0 (Comprehensive)') t2 
																				    ON f1.CF_ITEM_PATH like ('%' + path + '%')))))




// wrong?
SELECT 	r.RQ_REQ_ID, 
			r.RQ_REQ_NAME,
			r.RQ_REQ_PATH, 
			rc.RC_ENTITY_ID, 
			t.TS_NAME
	FROM (SELECT * FROM REQ WHERE REQ.RQ_REQ_PATH LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc
	join TEST t on t.TS_TEST_ID = rc.RC_ENTITY_ID
	join CYCL_FOLD AS cf on CF_ITEM_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD f1 WHERE CF_ITEM_PATH like ('%' + (SELECT CF_ITEM_PATH as path FROM CYCL_FOLD WHERE CF_ITEM_NAME ='Robin 0xBD0 (Comprehensive)') +'%'))
	WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID 
			AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
									WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE 
															WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD f1 
																					WHERE CF_ITEM_PATH like ('%' + (SELECT CF_ITEM_PATH as path FROM CYCL_FOLD WHERE CF_ITEM_NAME ='Robin 0xBD0 (Comprehensive)') +'%')))))	















// master copy !!!! **********


SELECT result.RQ_REQ_ID,result.RQ_REQ_NAME AS 'TESTCASE',result.TS_NAME AS 'TEST PROCEDURE', result.TS_TEST_ID, p1.CF_ITEM_PATH, SUBSTRING(p1.CF_ITEM_PATH,0,28) AS subpath  FROM (	SELECT 	r.RQ_REQ_ID, 
			r.RQ_REQ_NAME,
			r.RQ_REQ_PATH, 
			rc.RC_ENTITY_ID, 
			t.TS_NAME,
			t.TS_TEST_ID
	FROM (SELECT * FROM REQ WHERE REQ.RQ_REQ_PATH LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc
	join TEST t on t.TS_TEST_ID = rc.RC_ENTITY_ID
	WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID 
			AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
									WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE 
															WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD f1 
																					WHERE CF_ITEM_PATH like ('%' + (SELECT CF_ITEM_PATH as path FROM CYCL_FOLD WHERE CF_ITEM_NAME ='Robin 0xBD0 (Comprehensive)') +'%')))))	) AS result

JOIN (      SELECT CF_ITEM_PATH, TC_TEST_ID FROM (SELECT * FROM ( SELECT t1.CY_CYCLE_ID, 
																											t1.CY_CYCLE, 
																											t1.CY_STATUS, 
																											t1.CY_FOLDER_ID, 
																											t1.CY_OPEN_DATE,
																											cf.CF_ITEM_PATH
																											from ( SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
																											FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT c1.CF_ITEM_ID FROM CYCL_FOLD as c1
																																					WHERE c1.CF_ITEM_PATH 
																																					LIKE 'AAAAAFAAFAAMAAFAAAAET%'
																																			 ) 
																												) AS t1 join CYCL_FOLD as cf on t1.CY_FOLDER_ID = cf.CF_ITEM_ID
																									) as justin  ) AS JOHN
																									join TESTCYCL on TESTCYCL.TC_CYCLE_ID = JOHN.CY_CYCLE_ID            ) as p1 on result.TS_TEST_ID = p1.TC_TEST_ID






// trying to join the FOlder name of 28 character of path

SELECT uptopath.*, c2.CF_ITEM_NAME 
FROM (SELECT result.RQ_REQ_ID,
			 result.RQ_REQ_NAME AS 'TESTCASE', 
			 result.TS_NAME AS 'TEST PROCEDURE', 
			 result.TS_TEST_ID,
			 result.RQ_FATHER_ID, 
			 p1.CF_ITEM_PATH, 
			 SUBSTRING(p1.CF_ITEM_PATH,0,28) AS subpath  
	  FROM (SELECT 	r.RQ_REQ_ID, 
					r.RQ_REQ_NAME,
					r.RQ_FATHER_ID,
					r.RQ_REQ_PATH, 
					rc.RC_ENTITY_ID, 
					t.TS_NAME,
					t.TS_TEST_ID
			FROM ( SELECT * FROM REQ WHERE REQ.RQ_REQ_PATH LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc
	  		join TEST t on t.TS_TEST_ID = rc.RC_ENTITY_ID
			WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID 
				   AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
										 WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE 
																WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD f1 
																						WHERE CF_ITEM_PATH like ('%' + (SELECT CF_ITEM_PATH as path FROM CYCL_FOLD 
																														WHERE CF_ITEM_NAME ='Robin 0xBD0 (Comprehensive)') +'%'
																												)
																					  )
															  )
										)
				 )	
			) AS result

		JOIN (SELECT CF_ITEM_PATH, TC_TEST_ID FROM (SELECT * FROM ( SELECT t1.CY_CYCLE_ID, 
																		   t1.CY_CYCLE, 
																		   t1.CY_STATUS, 
																		   t1.CY_FOLDER_ID, 
																		   t1.CY_OPEN_DATE,
																		   cf.CF_ITEM_PATH
																	FROM ( SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
																		   FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT c1.CF_ITEM_ID FROM CYCL_FOLD as c1
																											  WHERE c1.CF_ITEM_PATH 
																											  LIKE 'AAAAAFAAFAAMAAFAAAAET%'
																										    ) 
																		 ) AS t1 
																	join CYCL_FOLD as cf on t1.CY_FOLDER_ID = cf.CF_ITEM_ID
																  ) as justin  
		 										    ) AS JOHN
			   join TESTCYCL on TESTCYCL.TC_CYCLE_ID = JOHN.CY_CYCLE_ID            
			  ) as p1 on result.TS_TEST_ID = p1.TC_TEST_ID) as uptopath 
join CYCL_FOLD c2 on c2.CF_ITEM_PATH = uptopath.subpath





/// join the feature too


SELECT beforefeature.* from (SELECT uptopath.*, c2.CF_ITEM_NAME from (SELECT result.RQ_REQ_ID,result.RQ_REQ_NAME AS 'TESTCASE',result.TS_NAME AS 'TEST PROCEDURE', result.TS_TEST_ID,result.RQ_FATHER_ID, p1.CF_ITEM_PATH, SUBSTRING(p1.CF_ITEM_PATH,0,28) AS subpath   FROM (	SELECT 	r.RQ_REQ_ID, 
			r.RQ_REQ_NAME,
			r.RQ_FATHER_ID,
			r.RQ_REQ_PATH, 
			rc.RC_ENTITY_ID, 
			t.TS_NAME,
			t.TS_TEST_ID
	FROM (SELECT * FROM REQ WHERE REQ.RQ_REQ_PATH LIKE 'AAAAADAAF%') AS r, REQ_COVER AS rc
	join TEST t on t.TS_TEST_ID = rc.RC_ENTITY_ID
	WHERE (r.RQ_REQ_ID = rc.RC_REQ_ID 
			AND rc.RC_ENTITY_ID in (SELECT TC_TEST_ID FROM TESTCYCL 
									WHERE TC_CYCLE_ID in (SELECT CY_CYCLE_ID FROM CYCLE 
															WHERE CY_FOLDER_ID in ( SELECT CF_ITEM_ID FROM CYCL_FOLD f1 
																					WHERE CF_ITEM_PATH like ('%' + (SELECT CF_ITEM_PATH as path FROM CYCL_FOLD WHERE CF_ITEM_NAME ='Robin 0xBD0 (Comprehensive)') +'%')))))	) AS result

JOIN (      SELECT CF_ITEM_PATH, TC_TEST_ID FROM (SELECT * FROM ( SELECT t1.CY_CYCLE_ID, 
																											t1.CY_CYCLE, 
																											t1.CY_STATUS, 
																											t1.CY_FOLDER_ID, 
																											t1.CY_OPEN_DATE,
																											cf.CF_ITEM_PATH
																											from ( SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
																											FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT c1.CF_ITEM_ID FROM CYCL_FOLD as c1
																																					WHERE c1.CF_ITEM_PATH 
																																					LIKE 'AAAAAFAAFAAMAAFAAAAET%'
																																			 ) 
																												) AS t1 join CYCL_FOLD as cf on t1.CY_FOLDER_ID = cf.CF_ITEM_ID
																									) as justin  ) AS JOHN
																									join TESTCYCL on TESTCYCL.TC_CYCLE_ID = JOHN.CY_CYCLE_ID            ) as p1 on result.TS_TEST_ID = p1.TC_TEST_ID) as uptopath 
join CYCL_FOLD c2 on c2.CF_ITEM_PATH = uptopath.subpath ) as beforefeature
join REQ r2 on r2.RQ_REQ_ID = beforefeature.RQ_FATHER_ID











// justins query
	SELECT t1.CY_CYCLE_ID, 
				t1.CY_CYCLE, 
				t1.CY_STATUS, 
				t1.CY_FOLDER_ID, 
				t1.CY_OPEN_DATE,
				cf.CF_ITEM_PATH
	from ( SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
	FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT c1.CF_ITEM_ID FROM CYCL_FOLD as c1
													WHERE c1.CF_ITEM_PATH 
													LIKE 'AAAAAFAAFAAMAAFAAAAET%') ) AS t1 join CYCL_FOLD as cf on t1.CY_FOLDER_ID = cf.CF_ITEM_ID


// justins query modified
SELECT justin.CY_CYCLE_ID FROM (SELECT t1.CY_CYCLE_ID, 
				t1.CY_CYCLE, 
				t1.CY_STATUS, 
				t1.CY_FOLDER_ID, 
				t1.CY_OPEN_DATE,
				cf.CF_ITEM_PATH
	from ( SELECT CY_CYCLE_ID, CY_CYCLE, CY_STATUS, CY_FOLDER_ID,CY_OPEN_DATE 
	FROM CYCLE WHERE CY_FOLDER_ID in ( SELECT c1.CF_ITEM_ID FROM CYCL_FOLD as c1
													WHERE c1.CF_ITEM_PATH 
													LIKE 'AAAAAFAAFAAMAAFAAAAET%') ) AS t1 join CYCL_FOLD as cf on t1.CY_FOLDER_ID = cf.CF_ITEM_ID
) as justin





// query for javier

SELECT TS_NAME AS "TEST NAME",  ST_USER_01 AS "JIRA ID", cy.CY_CYCLE AS "FOLDER"
FROM
(
SELECT *
FROM td.CYCLE  JOIN
     td.TESTCYCL ON td.TESTCYCL.TC_CYCLE_ID = td.CYCLE.CY_CYCLE_ID JOIN
     td.TEST ON td.TEST.TS_TEST_ID = td.TESTCYCL.TC_TEST_ID  JOIN
     td.RUN ON td.RUN.RN_TESTCYCL_ID = td.TESTCYCL.TC_TESTCYCL_ID  JOIN
     td.STEP ON td.STEP.ST_RUN_ID = td.RUN.RN_RUN_ID
WHERE  td.CYCLE.CY_FOLDER_ID in ( 
	SELECT f1.CF_ITEM_ID FROM CYCL_FOLD f1  
	    JOIN
	    (SELECT CF_ITEM_PATH as path 
			FROM CYCL_FOLD 
			WHERE CF_ITEM_NAME = 'Robin 0xBD0 (Comprehensive)') t2 
	    ON f1.CF_ITEM_PATH like ('%' + path + '%'))
	
) AS dataTABLE0 
join CYCLE as cy on cy.CY_CYCLE_ID = dataTABLE0.CY_CYCLE_ID
ORDER BY ST_USER_01 DESC  









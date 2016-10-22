// getting the FOLDER too Whether ES , UKR



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


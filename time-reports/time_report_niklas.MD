# TimeReports

## Week 45 2019-11-4 to 2019-11-10
| Date        | Hours   | Activity                                        |
| ----------- | ------- |------------------------------------------------ |
| 2019-11-04  | 0.5 	| Created a group.|
| 2019-11-05  | 1       | Installed nodejs on local machine and ran "hello world".|
| 2019-11-07  | 0.5    	| Setup AWS account.|                       
| 2019-11-07  | 2       | Planed for the project and made a Trello board.|
| 2019-11-10  | 2       | Programed a wind speed simulator.|
| 2019-11-10  | 0.5     | Programed a function for calculating the electricity price.|
| Total time  | 6.5     | ...|

## Week 46 2019-11-11 to 2019-11-17
| Date        | Hours   | Activity                                        |
| ----------- | ------- |------------------------------------------------ |
| 2019-11-13  | 0.5     | Added comments to windSim.js.|
| 2019-11-13  | 2       | Trying to setup vm on aws.|
| 2019-11-13  | 1       | Trying to setup server on aws.|
| 2019-11-15  | 0.5     | Inspected the latest changes and did som planning.|
| 2019-11-15  | 1       | Made a function that calculates the demand(total electricity consumption).|
| 2019-11-15  | 1       | Added a chance for wind turbine to breakdown for an hour.|
| 2019-11-15  | 1       | Added a docker file.|
| Total time  | 7       | ...|

## Week 47 2019-11-18 to 2019-11-24
| Date        | Hours   | Activity                                        |
| ----------- | ------- |------------------------------------------------ |
| 2019-11-18  | 1       | Did some planning and discussed the plan with group.|
| 2019-11-18  | 2       | Researched how to implement Postgresql using docker and implemented it.|
| 2019-11-19  | 2.5     | Connected app to database and made some queries for database.|
| 2019-11-19  | 1       | Tested the docker with database on aws and made som minor changes.|
| 2019-11-20  | 0.5     | Reviewed pull request.|
| 2019-11-20  | 1       | Made the historical wind speed data be inserted into the database when generated and some small changes.|
| Total time  | 8       | ...|

## Week 48 2019-11-25 to 2019-12-01
| Date        | Hours   | Activity                                        |
| ----------- | ------- |------------------------------------------------ |
| 2019-11-26  | 3       | Made the database information into env variables and tested it.|
| 2019-11-26  | 1       | Change query to make it safe from sql injection.|
| 2019-11-27  | 3       | Change so that the wind sim use date and db use timestamp.|
| 2019-11-28  | 1       | Design meeting.|
| 2019-11-28  | 3.5     | Restructured project.|
| 2019-11-29  | 4       | Adding database queries and some changes to simulator.|
| 2019-11-30  | 4       | Improved how the wind speed value is received from simulator.|
| 2019-12-01  | 1.5     | Fixed code that stopped working and changed how price is calculated.|
| Total time  | 21      | ...|

## Week 49 2019-12-02 to 2019-12-08
| Date        | Hours   | Activity                                        |
| ----------- | ------- |------------------------------------------------ |
| 2019-12-02  | 0.5     | Docker research.|
| 2019-12-02  | 3.5     | Fixed so database is updated every hour with wind speeds.|
| 2019-12-03  | 4       | Researched webb sockets and implemented it for simulator data.|
| 2019-12-04  | 3       | Structure and security planning.|
| 2019-12-04  | 0.5     | Started making a overview page for the prosumer.|
| 2019-12-05  | 9.5     | Worked on the prosumers overview page and researched chart.js and bootstrap.|
| 2019-12-05  | 0.5     | Started implementing a buffer for the prosumer.|
| 2019-12-06  | 3       | Implemented a buffer for the prosumer.|
| 2019-12-06  | 4       | Fighting git and made a chart for buffer on overview page.|
| 2019-12-06  | 2       | Made improvements to the overview page.|
| Total time  | 30.5    | ...|

## Week 50 2019-12-09 to 2019-12-15
| Date        | Hours   | Activity                                        |
| ----------- | ------- |------------------------------------------------ |
| 2019-12-09  | 1       | Git conflicts.|
| 2019-12-09  | 3       | Worked on the overview page and researched ejs.|
| 2019-12-10  | 3       | Fixing problem with express-validator.|
| 2019-12-10  | 3       | Working on the overview page.|
| 2019-12-11  | 5       | Finished overview page.|
| 2019-12-11  | 1       | Started writing on the report.|
| 2019-12-12  | 4       | Split database into two and added a table and had a meeting.|
| 2019-12-15  | 1.5     | Added variables that handle how much electricity is stored or taken from buffer.|
| Total time  | 21.5    | ...|

## Week 51 2019-12-16 to 2019-12-22
| Date        | Hours   | Activity                                        |
| ----------- | ------- |------------------------------------------------ |
| 2019-12-17  | 4       | Added so simulated prosumer data is stored in database and functions for getting prosumer 
data from database.|
| Total time  | 4       | ...|

## Week 1 2019-12-30 to 2020-01-05
| Date        | Hours   | Activity                                        |
| ----------- | ------- |------------------------------------------------ |
| 2020-1-2    | 1       | Reviewed pull request.|
| 2020-1-3    | 1.5     | Merged new changes into my old branch and some debuging.|
| 2020-1-4    | 8       | Finished adding two variables for handling under and excessive production and added so prosumer data is generated every hour and stored in database.|
| 2020-1-5    | 2.5     | Designed a simple web page for managing the power plant.|
| 2020-1-5    | 3.5     | Made a power plant class.|
| Total time  | 16.5    | ...|

## Week 2 2020-1-06 to 2020-01-12
| Date        | Hours   | Activity                                        |
| ----------- | ------- |------------------------------------------------ |
| 2020-1-6    | 3.5     | Worked on the power plant class.|
| 2020-1-6    | 1.5     | Changed the design of power plant control panel page and added more information on it.|
| 2020-1-7    | 1       | Finished the power plant class.|
| 2020-1-7    | 1.5     | Did research in how to remove spinner on input tag and other similar things.|
| 2020-1-7    | 1       | Added a power plant controller and some routes to it. Also added som forms.|
| 2020-1-7    | 1.5     | Added routes and functions for setting the production level and ratio plus the price.|
| 2020-1-7    | 3       | Started on a page showing a table of all prosumers and did some research on how to do it.|
| 2020-1-8    | 3       | Discussed how the simulations should work and fixed requested changes on power plant class.|
| 2020-1-8    | 1       | Worked on making the buttons work on the list prosumers page and researched how to do that.|
| 2020-1-8    | 1       | Fixed more change requests on the power plant class and got it finished.|
| 2020-1-8    | 3.5     | Worked more on listing prosumers and added a page for prosumer info. Also researched ejs for listing prosumers. |
| Total time  | 21.5    | ...|

## Overall total time
| Week    | Hours   |
| ------- | ------- |
| 45      | 6.5     |
| 46      | 7       |
| 47      | 8       |
| 48      | 21      |
| 49      | 30.5    |
| 50      | 21.5    |
| 51      | 4       |
| 1       | 16.5    |
| 2       | 21.5    |
| Total:  | 136.5   |

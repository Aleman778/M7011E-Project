# TimeReports for Alexander Mennborg

## Week 45 2019-11-4 to 2019-11-10
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| 2019-11-04  | 0.5     | Created a group.                                                                                   |
| 2019-11-07  | 0.5     | Created an AWS educate account.                                                                    | 
| 2019-11-07  | 2       | Planning the project and created user stories.                                                     |
| 2019-11-10  | 2       | Started on writing the prosumer simulator.                                                         |
| Total time  | 5       | ...                                                                                                |

## Week 46 2019-11-11 to 2019-11-17
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| 2019-11-11  | 1       | Setting up node package.json, installing express and nodemon.                                      | 
| 2019-11-11  | 2       | Creating simple REST API for getting the current wind speed.                                       |
| 2019-11-13  | 2.5     | Restructured the project and finished basic REST API for the simulator.                            |
| 2019-11-13  | 1       | Setting up aws EC2 and running nodejs server (my branch).                                          |
| 2019-11-14  | 0.5     | Finished the last REST API for current electricity price.                                          |
| 2019-11-14  | 2.5     | Added simulation dump, added units to values and adjusted simulator parameters.                    |
| Total time  | 9.5     | ...                                                                                              |

## Week 47 2019-11-18 to 2019-11-24
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| Total time  | 0       | ...                                                                                                |

## Week 48 2019-11-25 to 2019-12-1
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| 2019-11-26  | 2       | Started working on prosumer login page, read up on how to use ejs template engine.                 |
| 2019-11-26  | 1.5     | Finished the design of the prosumer login view. Setup public folder.                               |
| 2019-11-27  | 4.5     | Added signup page, setup postgres on localhost, added prosumer table.                              |
| 2019-11-27  | 1       | Design meeting.                                                                                    |
| 2019-11-27  | 1.5     | Restructure the project to separate simulator and prosumer/manager into separate nodejs projects.  |
| 2019-11-27  | 1       | Setup the web-server NodeJS project.                                                               |
| 2019-11-30  | 4.5     | Research on Docker, setup service for web-server, working on getting nodemon to work for dev.      |
| Total time  | 16      | ...                                                                                                |

## Week 49 2019-12-02 to 2019-12-08
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| 2019-12-02  | 2       | Setting up database in postgres docker container, still no automatic method implemented.           |
| 2019-12-02  | 2       | Added methods creating and dropping database table users, some research on authentication in node. |
| 2019-12-03  | 3       | Working on adding user model, logging in and creating users, hashing passwords etc.                |
| 2019-12-03  | 2       | Researched Json Web Tokens (JWT) for use in authorization middleware.                              |
| 2019-12-04  | 4       | Created an architecture of the entire system, documented security features in the system.          |
| 2019-12-04  | 2       | Updated the users table, created utility methods for the user model.                               |
| 2019-12-05  | 2       | Setup simple signup that creates and stores the users in the database table. No validation yet!    |
| 2019-12-05  | 1.5     | Added authorization middleware for JWT token verification, however token signing fails atm.        |
| 2019-12-07  | 8       | Fixed token signing, added logout and signup now signs tokens correcly. Added redirects on auth.   |
| Total time  | 26.5    | ...                                                                                                |

## Week 50 2019-12-09 to 2019-12-15
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| 2019-12-09  | 4       | Added support for easily creating alert messages, added validation to signin/ signup form.         |
| 2019-12-09  | 1.5     | Added alerts for signup, updated the validation, added duplicate email check before insert query.  |
| 2019-12-10  | 6       | Started working on the prosumer settings page, where avatar and prosumers house image is uploaded. |
| 2019-12-11  | 5       | Updated the prosumer settings page, changed to dark theme, updated controllers.                    |
| 2019-12-14  | 6       | Added the ability for prosumers to change name and email (password is not working atm).            |
| 2019-12-15  | 4       | Fixed password updating, started working on adding the ability to upload avatar image.             |
| Total time  | 26.5    | ...                                                                                                |

## Week 51 2019-12-16 to 2019-12-22
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| 2019-12-20  | 4       | Added support for database migrations, researching multer middleware package for uploading files.  |
| 2019-12-21  | 5       | Working on implementing the file uploading widget and implemnting storage engine.                  |
| 2019-12-22  | 5       | Finished implementing a simple profile image uploader, currently work in progress.                 |
| Total time  | 14      | ...                                                                                                |

## Week 52 2019-12-23 to 2019-12-29
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| 2019-12-23  | 6       | Updated the backend code for uploading images, added file extension/mimetype filter.               |
| 2019-12-25  | 8       | Updated the frontend code for uploading files, added image cropping befor submiting an avatar.     |
| 2019-12-26  | 6       | Fixed some issues regarding the client code, and made it more reusable.                            |
| 2019-12-27  | 5       | Further image uploading, implemented uploading of house pictures, added remove account button.     |
| Total time  | 25      | ...                                                                                                |

## Week 1 2019-12-30 to 2020-01-05
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| 2019-12-30  | 2       | Finalised the prosumer settings page, fixed issues and refactor code.                              |
| 2019-12-31  | 5       | Refactoring code in the web-server.                                                                |
| 2020-01-01  | 9       | More refactoring to improve reusability for manager implementation. Updating the UI/UX design.     |
| 2020-01-02  | 5.5     | Added the ability to update managers profile, password and avatar by reusing prosumers code.       |
| 2020-01-02  | 7       | Rewriting the simulator in TypeScript, creating an actual simulator that ticks in the background.  | 
| 2020-01-03  | 6       | Implementing a query builder for generating SQL code.                                              | 
| 2020-01-03  | 5       | Almost done with rewriting the wind simulator.                                                     |
| Total time  | 39.5    | ...                                                                                                |

## Week 2 2020-01-06 to 2020-01-12
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| Total time  | 0       | ...                                                                                                |

## Week 3 2020-01-13 to 2020-01-19
| Date        | Hours   | Activity                                                                                           |
| ----------- | ------- | -------------------------------------------------------------------------------------------------- |
| Total time  | 0       | ...                                                                                                |

## Overall total time
| Week    | Hours   |
| ------- | ------- |
| 45      | 5       |
| 46      | 9.5     |
| 47      | 0       |
| 48      | 16      |
| 49      | 26.5    |
| 50      | 26.5    |
| 51      | 14      |
| 52      | 25      |
| 1       | 39.5    |
| 2       | 0       |
| 3       | 0       |
| Total:  | 163     |

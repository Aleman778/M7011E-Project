
/***************************************************************************
 * The file routes are routes reponsible for handling
 * uploading and deletion of files.
 ***************************************************************************/


var express = require('express');
var fileController = require('../controllers/file-controller')
var router = express.Router();


router.post('/upload', fileController.upload());

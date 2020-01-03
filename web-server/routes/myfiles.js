
/***************************************************************************
 * Routes for accessing user private files on the server.
 ***************************************************************************/

var path = require('path');
var express = require('express');
var session = require('express-session');
var auth = require('../middleware/auth');
var router = express.Router();



// Set myfiles to serve static private files.
router.use(auth.verifySilent);
router.use(auth.verifyPath);
router.use(express.static(path.join(__dirname, '..', 'private')));

module.exports = router;

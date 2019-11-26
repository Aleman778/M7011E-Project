
/***************************************************************************
 * The prosumer controller handles different actions e.g. logging in
 * displaying information about electricity consuption/ production etc.
 ***************************************************************************/

exports.login = function(req, res) {
    res.render('prosumer/login');
}


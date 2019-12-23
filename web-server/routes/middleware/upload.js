
/***************************************************************************
 * The upload middleware is using multer with a custom storage engine.
 * Files are uploaded in a public directory under the users id.
 * This also provides file filters to avoid uploading malicious files.
 ***************************************************************************/


var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var multer = require('multer');


/***************************************************************************
 * Setup the public and private storage variables.
 ***************************************************************************/


const publicStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        var dest = './public/uploads/' + md5(req.userId) + '/';
        syncDirectory(dest);
        cb(null, dest);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() +
           path.extname(file.originalname));
    }
});


const privateStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        var dest = './private/uploads/' + md5(req.userId) + '/';
        syncDirectory(dest);
        cb(null, dest);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});


/**
 * Upload middleware provides features to upload files
 * to either a public or private storage. All files are
 * stored separately of each users id so auth.verify 
 * middleware is required before this.
 */
class UploadMiddleware {
    constructor() { }


    /**
     * Image uploader multer middleware.
     * The file size limit and storage can be changed.
     * By default this is set to 1MB and public storage.
     */
    image(fieldname, limit=1000000, pub=true) {
        return function(req, res, next) {
            const upload = multer({
                storage: pub ? publicStorage : privateStorage,
                limit: limit,
                fileFilter: function(req, file, cb) {
                    const filetypes = /jpeg|jpg|png|gif/;
                    if (checkFileTypes(filetypes, file)) {
                        cb(null, true);
                    } else {
                        cb('Only images with file extensions jpeg, jpg, png and gif ' +
                           'are supported.', false);
                    }
                },
            }).single(fieldname);

            upload(req, res, (err) => {
                if (err) {
                    req.alert('danger', err);
                }
                next();
            });
        }
    }
}



/**
 * Filters images with other mimetypes and file extensions
 * than the provided file extension regex.
 */
function checkFileTypes(filetypes, file) {
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    return mimetype && extname;
}


/**
 * Make sure that the directory exists before
 * storing any files in it. If the directory
 * does not exists then make it.
 */
function syncDirectory(dest) {
    try {
        stat = fs.statSync(dest);
    } catch(err) {
        fs.mkdirSync(dest);
    }
}


module.exports = new UploadMiddleware();


/***************************************************************************
 * The upload middleware is using multer with a custom storage engine.
 * Files are uploaded in a public directory under the users id.
 * This also provides file filters to avoid uploading malicious files.
 ***************************************************************************/


var fs = require('fs');
var multer = require('multer');


/**
 * Custom multer storage engine for storing public files.
 * Files are stored in the /public folder and can be visible
 * by anyone but each authenticated user should be able to
 * upload in their folder.
 */
class PublicStorage {
    constructor(destination='/public/uploads/') {
        this.destination = destination;
    }


    /**
     * Returns the destination filepath.
     * The file is stored inside the user directory
     * in the destination folder.
     */
    getDestination(req, file, next) {
        next(null, this.destination + req.userId + '/' + file.originalname);
    }
    
    
    /**
     * Handles uploading of file.
     */
    _handleFile(req, file, next) {
        console.log("[PublicStorage] handling file: " + file);
        this.getDesination(req, file, function(err, path) {
            if (err) return next(err)

            var outStream = fs.createWriteStream(path)

            file.stream.pipe(outStream)
            outStream.on('error', next)
            outStream.on('finish', function () {
                next(null, {
                    path: path,
                    size: outStream.bytesWritten
                })
            })
        });
    }

    
    /**
     * Removes a file in the public storage.
     */
    _removeFile(req, file, next) {
        console.log("[PublicStorage] removing file: " + file);
        fs.unlink(file, next);
    }
}




module.exports = multer(new PublicStorage());

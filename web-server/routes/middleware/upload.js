
/***************************************************************************
 * The upload middleware is using multer with a custom storage engine.
 * Files are uploaded in a public directory under the users id.
 * This also provides file filters to avoid uploading malicious files.
 ***************************************************************************/


var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var multer = require('multer');


// /**
//  * Custom multer storage engine for storing public files.
//  * Files are stored in the /public folder and can be visible
//  * by anyone but each authenticated user should be able to
//  * upload in their folder.
//  */
// class PublicStorage {
//     constructor(destination='./public/uploads/') {
//         this.destination = destination;
//     }


//     /**
//      * Returns the destination filepath.
//      * The file is stored inside the user directory
//      * in the destination folder.
//      */
//     getDestination(req, file, cb) {
//         cb(null, this.destination + md5(req.userId) + '/' +
//              file.fieldname + path.extname(file.originalname));
//     }
    
    
//     /**
//      * Handles uploading of file.
//      */
//     _handleFile(req, file, cb) {
//         console.log("[PublicStorage] handling file: " + file);
//         this.getDesination(req, file, (err, path) {
//             if (err) return cb(err)

//             var outStream = fs.createWriteStream(path)

//             file.stream.pipe(outStream)
//             outStream.on('error', cb)
//             outStream.on('finish', function () {
//                 cb(null, {
//                     path: path,
//                     size: outStream.bytesWritten
//                 })
//             })
//         });
//     }

    
//     /**
//      * Removes a file in the public storage.
//      */
//     _removeFile(req, file, cb) {
//         console.log("[PublicStorage] removing file: " + file);
//         fs.unlink(file, cb);
//     }
// }


var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + md5(req.userId) + path.extname(file.originalname));
    }
});


module.exports = multer({ storage: storage });

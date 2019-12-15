
/***************************************************************************
 * The files controller contains methods for handling file uploads
 * from users. Everyting here should require authentication.
 ***************************************************************************/


/**
 * The files controller handles uploading and managing of user files.
 * Every user gets its own directory based on their uuid number,
 * thus also requiring the user to be authenticated before accessing their folder.
 */
class FilesController {
    /**
     * Creates a new files controller,
     * with directory /public/uploads and storage limit of 200 kB.
     */
    constructor(directory='/public/uploads/', storageLimit=200000) {
        this.directory = directory;
        this.storageLimit = storageLimit;
    }


    /**
     * Uploads files to a specific user.
     */
    async upload(req, res) {
        try {
            const user = await User.findOne({id: req.userId});
            
        } catch(err) {
            console.log(err);
            res.send(400).send(err);
        }        
    }
    
}

module.exports = new FilesController();

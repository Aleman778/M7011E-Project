
/***************************************************************************
 * The FileUploader wiget is used to handle uploading files to the
 * server via AJAX post requests.
 ***************************************************************************/


var uploaders = {};


/**
 * The file uploader wiget is used to handle uploading of
 * files to the server, but also manage multiple files,
 * cropping images etc. before submitting them to the server.
 */
class FileUploader {
    /**
     * Crates a new file uploader.
     */
    constructor(formId) {
        this.form = $(formId);
        this.input = this.form.find('input[type=file]');
        this.files = {};
        this.onChange = (file) => {
            this.files.push(file);
            this.submit();
        };
        this.onDone = (data) => { };
        this.onFail = (data) => { };
        this.input.change(() => { this.change(); });
        return this;
    }


    /**
     * Set file input change callback function.
     * The provided function is triggered when the
     * user selects a file on their computer.
     */
    change(callback) {
        if (typeof callback !== 'undefined') {
            this.onChange = callback;
        } else {
            var file = this.input[0].files[0];
            this.onChange(file);
        }
        return this;
    }

    
    /**
     * Set the done file uploading callback function.
     * The resulting data is the response from the server.
     */
    done(callback) {
        if (typeof callback !== 'undefined') {
            this.onDone = callback;
        }
        return this;
    }

    
    /**
     * Set the fail request callback function.
     * The data describes the error.
     */
    fail(callback) {
        if (typeof callback !== 'undefined') {
            this.onFail = callback;
        }
        return this;
    }

    
    /**
     * Upload a file with a given fieldname
     */
    uploadFile(fieldname, file) {
        this.files[fieldname] = file;
    }
    
    
    /**
     * Submit the form to the server.
     * This sends the form data asynchronous via AJAX.
     */
    submit() {
        var data = new FormData();
        for (let name in this.files) {
            if (this.files.hasOwnProperty(name)) {
                data.append(name, this.files[name]);
            }
        }
        this.files = {};
        
        $.ajax({
            url: this.form.attr('action'),
            type: this.form.attr('method'),
            data: data,
            cache: false,
            contentType: false,
            processData: false,
        }).done((data) => {
            this.onDone(data);
        }).fail((data) => {
            this.onFail(data);
        });
    }
}


/**
 * Image Cropper is a wrapper class for croppr.js library.
 */
class ImageCropper {
    /**
     * Constructs a new image cropping tool.
     * @param {String} imgSelector the image to attach the cropper tool to.
     * @param {String} cavnasSelector the offscreen canvas to draw cropped image on
     * @param {File} imgFile the image file to crop
     * @param {Object} options defines options and limitations to the image cropper.
     */
    constructor(imgSelector, imgFile, options) {
        this.imgSelector = imgSelector;
        $(imgSelector).parent().append('<canvas id="imageCropperCanvas"></canvas>');
        this.canvas = $('#imageCropperCanvas');
        this.ctx = this.canvas[0].getContext('2d');
        this.imgFile = imgFile;
        this.options = options;
        this._imageFromFile(this.imgFile, (img) => {
            this.image = img;
            $(imgSelector).attr('src', this.image);
            this.croppr = new Croppr(this.imgSelector, this.options);
            this.options = ImageCropper.parseOptions(this.options);
        });
    }


    /**
     * Crop the provided image file. This is done asynchronusly.
     * The provided callback is called with the resulting cropped
     * image file and src.
     */
    cropImage(cb) {
        this._cropImageImpl((image) => {
            var file = this._fileFromDataURL(image, this.imgFile.name);
            cb(file, image);
        });
    }

    
    /**
     * Destory the cropping tool instance and restore original image.
     */
    destroy() {
        this.croppr.destroy();
        this.canvas.remove();
    }
    
    
    /**
     * Loads an image from file and runs the provided callback afterwards
     * with the resulting loaded image src.
     */
    _imageFromFile(file, cb) {
        var reader = new FileReader();
        reader.onload = function(e) {
            cb(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    
    /**
     * Converts an data URL into a file that can be sent to server.
     */
    _fileFromDataURL(dataURL) {
        var arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], this.imgFile.name, {type:mime});
    }

    
    /**
     * Cropping image implementation. Reads the bounding values from the
     * cropping tool and draws the image using the bounds onto the canvas.
     * The canvas is converted back into an URL and sent via the provided callback.
     */
    _cropImageImpl(cb) {
        var img = new Image();
        var b = this.croppr.getValue();
        var sclWidth = b.width, sclHeight = b.height;
        sclWidth  = Math.max(this.options.minOutSize.width  || b.width,  sclWidth);
        sclWidth  = Math.min(this.options.maxOutSize.width  || b.width,  sclWidth);
        sclHeight = Math.max(this.options.minOutSize.height || b.height, sclHeight);
        sclHeight = Math.min(this.options.maxOutSize.height || b.height, sclHeight);
        this.canvas.attr('width', sclWidth);
        this.canvas.attr('height', sclHeight);
        img.onload = () => {
            this.ctx.drawImage(img, b.x, b.y, b.width, b.height, 0, 0, sclWidth, sclHeight);
            var imageData = this.canvas[0].toDataURL(this.imgFile.type);
            cb(imageData);
        };
        img.src = this.image;
    }


    static parseOptions(opts) {
        const defaults = {
            aspectRatio: null,
            maxOutSize: { width: null, height: null },
            minOutSize: { width: null, height: null },
        };
        
        // Parse max output width/height
        let maxOutSize = null;
        if (opts.maxOutSize !== undefined && opts.maxOutSize !== null) {
            maxOutSize = {
                width: opts.maxOutSize[0] || null,
                height: opts.maxOutSize[1] || null,
            }
        }

        // Parse min output width/height
        let minOutSize = null;
        if (opts.minOutSize !== undefined && opts.minOutSize !== null) {
            minOutSize = {
                width: opts.minOutSize[0] || null,
                height: opts.minOutSize[1] || null
            }
        }
        
        const defaultValue = (v, d) => (v !== null ? v : d);
        return {
            maxOutSize: defaultValue(maxOutSize, defaults.maxOutSize),
            minOutSize: defaultValue(minOutSize, defaults.minOutSize),
        };
    }
}


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
        this.files = [];
        this.onChange = (file) => {
            this.files.push(file);
            this.submit();
        };
        this.onDone = (data) => { console.log(data); };
        this.onFail = (data) => { console.log(data); };
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
     * Submit the form to the server.
     * This sends the form data asynchronous via AJAX.
     */
    submit() {
        var data = new FormData();
        data.append('avatar', this.files[0]);
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


    _getOption(opt) {
        if (this.option) {
            return this.option[opt];
        } else {
            return undefined;
        }
    }
}


/***************************************************************************
 * The FileUploader wiget is used to handle uploading files to the
 * server via AJAX post requests.
 *
 * In order to create a file uploader wiget you need the following:
 * - An input tag with class `uploader`.
 * - The input tag needs to have a unique id attribute.
 * - Provide an action attribute to tell where this should be posted.
 * - 
 * - (Optional) Create a div for displaying file outputs this requires
 *              you to add `data-target=<the id of the output>`
 *              to the input tag.
 * - Include alerts.ejs to receive user friendly error messages.
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
    constructor(formElement) {
        this.form = formElement;
        this.input = this.form.find("input[type='file']");
        this.output = undefined;
        var dataTarget = this.input.attr('data-target');
        if (dataTarget) {
            this.output = $("#" + dataTarget);
        }
        this.action = this.form.attr('action');
        this.multiple = this.input.prop('multiple') || false;
        this.input.on('change', (event) => { this.onChange() });
        this.files = [];
    }


    onChange() {
        var file = this.input[0].files[0];
        this.files.push(file);
        console.log(this.files);

        if (!this.multiple) {
            this.submit();
        }
    }
    

    submit() {
        this.form[0].submit();
    //     var progress = $('#uploadProgressBar');
    //     $('#uploadProgress').slideDown();
    //     var data = new FormData();
    //     data.append('avatar', this.files[0])
    //     console.log(data);
    //     $.ajax({
    //         url: this.action,
    //         type: 'POST',
    //         data: data,
    //         dataType: 'json',
    //         cache: false,
    //         contentType: false,
    //         processData: false,
    //     }).done(function(data) {
    //         console.log(data);
    //     }).fail(function(data) {
    //         console.log("Fail:");
    //         console.log(data);
    //     });
    }
}


$(function() {

    /**
     * Find all general file uploaders and register
     * each as file uploader wigets.
     */
    $("form.uploader").each(function() {
        var input = $(this);
        var id = input.attr('id');
        uploaders[id] = new FileUploader(input);
    });
    

    /**
     * Find all general file uploaders and construct
     * 
     */
    $("form.file-uploader").each(function() {
        var input = $(this);
        console.log(input);
    });
});


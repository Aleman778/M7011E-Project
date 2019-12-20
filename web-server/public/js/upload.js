
/***************************************************************************
 * AJAX query helper to upload files to the web-server.
 * All these requests require a user to be authenticated.
 ***************************************************************************/

$(function() {
    /**
     * Elements with fileupload class will automatically
     * be able to upload a signle file when the state changes.
     */
    $(".fileupload").change(function() {
        const input = $(this);
        // const file = input[0].files[0];
        upload(input[0].files)
    });
});


function uploadAvatar() {
    
}



function upload(files) {
    $.ajax({
        url: 'files/upload',
        type: 'post',
        data: {files: files, userId: userId},
        contentType: false,
        processData: false,
        success: function(response) {
            console.log(response);
        },
    });
}


/***************************************************************************
 * Avatar Uplaoder is used to handle uploading avatars and cropping them
 * before sending the data.
 ***************************************************************************/


$(function() {
    var croppedImage = '#';
    var cropModal = $('#cropAvatar');
    var cropper;
    var uploader = new FileUploader('#formAvatarUpload')
        .change((file) => {
            cropModal.modal('show');
            cropper = new ImageCropper('#croppr', file,{
                aspectRatio: 1,
                minOutSize: [100, 100],
                maxOutSize: [500, 500],
            });
        }).done((data) => {
            $('img.avatar-img').attr('src', croppedImage);
            $('.div-alerts').html(data);
        }).fail((data) => {
            location.reload();
        });

    $('#cropAvatarBtn').click(function() {
        cropModal.modal('hide');
        try {
            croppedImage = cropper.cropImage((file, image) => {
                croppedImage = image;
                cropper.destroy();
                cropper = undefined;
                uploader.uploadFile('avatar', file);
                uploader.submit();
            }, (error) => {
                $(".div-alerts").html('<div class="alert alert-danger" role="alert">' + error + "</div>");
                if (cropper) {
                    cropper.destroy();
                    cropper = undefined;
                    currentUploader = undefined;
                }
            });
        } catch (err) {
            console.log(err);
            if (cropper) {
                cropper.destroy();
                cropper = undefined;
                currentUploader = undefined;
            }
        }
    });

    
    $('#closeCropAvatar').click(function() {
        if (cropper) {
            cropper.destroy();
            cropper = undefined;
        }
    });
});

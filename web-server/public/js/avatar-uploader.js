
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
                minOutSize: [200, 200],
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
            });
        } catch (err) {
            console.log(err);
        }
    });

    
    $('#closeCropAvatar').click(function() {
        if (cropper) {
            cropper.destroy();
            cropper = undefined;
        }
    });
});

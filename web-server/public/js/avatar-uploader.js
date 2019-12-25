
/***************************************************************************
 * Avatar Uplaoder is used to handle uploading avatars and cropping them
 * before sending the data.
 ***************************************************************************/


$(function() {
    var canvas = $('#avatarCanvas')[0];
    var ctx = canvas.getContext('2d');
    image = $("#croppr")[0];
    ctx.drawImage(image, 33, 71, 104, 124, 21, 20, 87, 104);

    
    var cropAvatar = $('#cropAvatar');
    var croppedImageSrc = $('img.avatar-img').attr('src');
    var croppr = new Croppr('#croppr', {
        aspectRatio: 1,
    });
    
    var uploader = new FileUploader('#formAvatarUpload')
        .change((file) => {
            console.log(file);
            
            var reader = new FileReader();
            reader.onload = function(img) {
                croppr.setImage(img.target.result);
                cropAvatar.modal('show');
                croppr.redraw();
            }
            reader.readAsDataURL(file);
        }).done((data) => {
            $('img.avatar-img').attr('src', croppedImageSrc);
            $('.div-alerts').html(data);
        }).fail((data) => {
            location.reload();
        });

    $('#cropAvatarBtn').click(function() {
        cropAvatar.modal('hide');
        (async () => {
            try {
                var crop = croppr.getValue();
                var file = uploader.input[0].files[0];
                croppedImageSrc = await cropImageFile(ctx, canvas, crop, file);
                var croppedImgFile = dataURLtoFile(croppedImageSrc, file.name);
                uploader.files.push(croppedImgFile);
                uploader.submit();
            } catch (err) {
                console.log(err);
            }
        })();
    });
});


function cropImageFile(ctx, canvas, crop, file) {
    return new Promise((resolve, reject) => {
        try {
            var reader = new FileReader();
            reader.onload = function(e) {
                idata = e.target.result;
                var img = new Image();
                img.onload = function() {
                    ctx.drawImage(img,
                                  crop.x,
                                  crop.y,
                                  crop.width,
                                  crop.height,
                                  0,
                                  0,
                                  500,
                                  500);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.src = idata;
            }
            reader.readAsDataURL(file);
        } catch (err) {
            console.log("error: " + err);
            reject(err);
        }
    });
}


function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

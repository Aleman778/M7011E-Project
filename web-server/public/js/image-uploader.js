
/***************************************************************************
 * Image uploader is a script used to setup image uploader via AJAX
 * without needing to supply any custom javascript. This also alows for
 * cropping images before sending them to the server.
 ***************************************************************************/


var uploaders = {};
var currentUploader;
var cropperModal;
var cropper;
var image;

$(function() {
    $('form.image-uploader').each(function() {
        var form = $(this);
        var input = form.find('input[type=file]');
        var id = form.attr('id');
        uploaders[id] = new FileUploader('#' + id)
            .change((file) => {
                var cropperTarget = form.attr('cropper-target');
                if (cropperTarget) {
                    var aspectRatio = parseInt(form.attr('aspect-ratio')) || null;
                    var minWidth  = form.attr('min-width')  || null;
                    var minHeight = form.attr('min-height') || null;
                    var maxWidth  = form.attr('max-width')  || null;
                    var maxHeight = form.attr('max-height') || null;
                    var cropperModal = form.attr('cropper-modal');
                    if (cropperModal) {
                        cropModal = $(cropperModal);
                        cropModal.modal('show');
                    }
                    cropper = new ImageCropper(cropperTarget, file, {
                        aspectRatio: aspectRatio,
                        viewMode: 2,
                        autoCropArea: 1.0,
                        minContainerWidth: 718,
                        minContainerHeight: 718,
                        minCropBoxWidth: minWidth,
                        minCropBoxHeight: minHeight,
                        maxOutSize: [maxWidth, maxHeight],
                    });
                    currentUploader = id;
                } else {
                    imageFromFile(file, (img) => {
                        image = img;
                        var fieldname = uploaders[id].input.attr('name');
                        uploaders[id].uploadFile(fieldname, file);
                        uploaders[id].submit();
                    });
                }
            }).done((data) => {
                var outputTarget = form.attr('output-target');
                if (outputTarget) {
                    $('img' + outputTarget).attr('src', image);
                }
                $('.div-alerts').html(data);
            }).fail((data) => {
                location.reload();
            });    
    });


    $('#cropModalBtn').click(function() {
        uploadImages();
    });

    $('#closeCropModal').click(function() {
        if (cropper) {
            cropper.destroy();
            cropper = undefined;
        }
        currentUploader = undefined;
    });
});


function uploadImages() {
    cropModal.modal('hide');
    try {
        cropper.cropImage((file, img) => {
            image = img;
            cropper.destroy();
            cropper = undefined;
            var uploader = uploaders[currentUploader]
            var fieldname = uploader.input.attr('name');
            uploader.uploadFile(fieldname, file);
            uploader.submit();
            currentUploader = undefined;
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
}

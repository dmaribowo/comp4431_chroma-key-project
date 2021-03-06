// Check for the various File API support.

if (!(window.File && window.FileReader && window.FileList && window.Blob && Array.prototype.indexOf)) {
    alert("Your browser does not support all features that are needed in this assignment!\nPlease use another browser, e.g. Google Chrome.");
    throw ("Your browser does not support all features that are needed in this assignment!\nPlease use another browser, e.g. Google Chrome.");
}

// Great success! All the File APIs are supported

var frameRate = 25; // We assume all video use 25 frames per second
var selectedEffect = "noeffect"; // The currently selected effect
var importingFor = null; // The current target for the import video process
var importer = null; // The global video importer instance
var importBuffer = []; // The frames buffer for importing video
var input1FramesBuffer = []; // The imported frames buffer for video 1
var input2FramesBuffer = []; // The imported frames buffer for video 2
var stopProcessingFlag = false; // True if stop processing is clicked
var inputImageData = null;
var useBgVideo = null;
var useRGB = true;
var processedBackgroundImage = null;
var redKey = 112;
var greenKey = 158;
var blueKey = 88;
var hueKey = 90;

// Helper function for creating a standalone copy of the source buffer
function copyBuffer(source) {
    return $.extend(true, [], source);
}

// Helper function for creating a new canvas of specific width and height
function getCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
};

// Show the select file dialog
// Reset the <input type='file' /> first
function startUpload(evt) {
    importingFor = evt.target;
    $("#file-select").wrap("<form>").closest('form').get(0).reset();
    $("#file-select").unwrap();
    $("#file-select").click();
}

function startUploadImage(evt) {
    importingFor = evt.target;
    $("#image-input").wrap("<form>").closest('form').get(0).reset();
    $("#image-input").unwrap();
    $("#image-input").click();
}

// Import the video as frames, store the result in the frames buffer
function importVideo() {
    // Check if the importer is ready
    if (!importer || !importer.video || !importer.video.duration || !importer.video.videoWidth || !importer.video.videoHeight) {
        setTimeout(importVideo, 10);
        return;
    }

    // Check if the importer and its video file are ready
    if (!importer.video.buffered.end(0) > 0) {
        setTimeout(importVideo, 10);
        return;
    }

    // Check if there are still more frames for import
    if (importer && !importer.video.ended && importer.video.currentTime < importer.video.duration) {
        // Capture the current frame
        captureFrame(importer.video, importBuffer);

        // Update the progress bar
        updateProgressBar("#import-progress", importer.video.currentTime / importer.video.duration * 100);

        // Process the next frame

        // Add an one time only event handler for the "seeked" event of the target video.
        // This ensure that the `importVideo()` (and hence the `captureFrame()`) is
        // only invoked after the video has changed the frame.
        $(importer.video).one("seeked", importVideo);

        // Go to the next frame
        importer.seekForward();
    } else {
        // Done importing
        updateProgressBar("#import-progress", 100);

        // Find the correct target of the import
        var target = null;
        if ($(importingFor).attr("id") === "change-input-video-1") {
            target = $("#input-video-1");
            input1FramesBuffer = copyBuffer(importBuffer);

        } else {
            target = $("#input-video-2");
            input2FramesBuffer = copyBuffer(importBuffer);
            /*if (input2FramesBuffer.length<input1FramesBuffer.length)
            {
                for(var i=input2FramesBuffer.length;i<input1FramesBuffer.length;i++)
                {
                    var w = $("#input-video-1").get(0).videoWidth;
                    var h = $("#input-video-1").get(0).videoHeight;
                    var canvas = getCanvas(w, h);
                    var ctx = canvas.getContext('2d');
                    var newFrame=new ImageData(w,h);
                    for (var j=0;j<input1FramesBuffer[i].data.length;j+=4)
                    {
                        newFrame.data[j]=0;
                        newFrame.data[j+1]=0;
                        newFrame.data[j+2]=0;
                        newFrame.data[j+3]=255;
                    }
                    input2FramesBuffer.append(newFrame);
                }
            }*/
        }



        // Build a new video based on the imported frames
        buildVideo(importBuffer, function(resultVideo) {
            // Set the resulted video as the 'src' of the import target
            target.attr("src", URL.createObjectURL(resultVideo));

            // Hide the import dialog
            $("#import-video-modal").modal("hide");
        });
    }
}

// Build a video from frames stored in a buffer
// The input buffer will be emptied after this process!
function buildVideo(buffer, callback) {
    // Create a new Whammy video encoder instance, with specific frame rate.
    var encoder = new Whammy.Video(frameRate);

    // Add the frames to the encoder by `add()`
    while (buffer.length > 0) {
        encoder.add(buffer.shift());
    }

    // Build the video using `compile()`
    //return encoder.compile();
    encoder.compile(false, callback);
}

// Handler for the <input type='file' /> change event
function changeVideo(event) {
    // The allowed video formats
    var validFileType = ["video/mp4", "video/avi", "video/webm", "video/mov", "video/quicktime", "video/ogg"];

    // Get the selected file
    var files = event.target.files;
    if (files.length >= 1) { // If the user clicked 'Cancel', files.length will be 0
        var file = files[0]; // We only handle the first selected file and ignore the rest
        // Check if the MIME type of the selected file is one of the allowed video formats
        if (validFileType.indexOf(file.type) > -1) {
            var reader = new FileReader();
            // Set up the 'onloadedend' event handler for the file reader
            // The event is triggered while the browser loaded the entire video file into
            // the memory. The loaded file is stored in 'this.result'.
            reader.onloadend = function() {
                // First, convert the read file into data URL format and set it to the 'src' of
                // the <video id="import-video-preview">. We will use it for importing the video
                // and capturing the frames.
                $("#import-video-preview").attr("src", URL.createObjectURL(new Blob([this.result])));

                // Show the import video dialog
                $("#import-video-modal").modal("show");

                // Create a VideoFrame object instance. It is used for seeking the video
                // forward frame by frame.
                importer = VideoFrame({
                    id: "import-video-preview",
                    frameRate: frameRate,
                });

                // Start the import process
                importVideo();
            };
            // Start reading in the selected file, in the format of 'array buffer'
            reader.readAsArrayBuffer(file);
        } else {
            alert("Not a valid video file!");
        }
    }
}

function changeImage(event) {
    // The allowed video formats
    var validFileType = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/jfif"];

    // Get the selected file
    var files = event.target.files;
    if (files.length >= 1) { // If the user clicked 'Cancel', files.length will be 0
        var file = files[0]; // We only handle the first selected file and ignore the rest
        // Check if the MIME type of the selected file is one of the allowed video formats
        if (validFileType.indexOf(file.type) > -1) {
            var reader = new FileReader();
            // Set up the 'onloadedend' event handler for the file reader
            // The event is triggered while the browser loaded the entire video file into
            // the memory. The loaded file is stored in 'this.result'.
            reader.addEventListener("load", () => {
                const uploaded_image = reader.result;
                var blob = new Blob([uploaded_image], { type: "image/jpeg" });
                var urlCreator = window.URL || window.webkitURL;
                var imageUrl = urlCreator.createObjectURL(blob);
                var image = new Image();
                image.onload = function() {
                    $("#canvas-image-2").empty();
                    var canvas = document.createElement("canvas");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    var ctx = canvas.getContext("2d");
                    $("#canvas-image-2").append(canvas);
                    ctx.drawImage(image, 0, 0);
                    inputImageData = ctx.getImageData(0, 0,
                        image.width, image.height);
                    console.log(inputImageData);
                    $("#canvas-image-2").hide();
                    // imageproc.init("canvas-image-2", "output-canvas", imageUrl);
                }
                image.src = imageUrl;
                // var button = document.createElement("button");
                // button.onclick = function() {
                //     console.log(canvas.getImageData(0, 0,
                //         image.width, image.height));
                // }
                // document.getElementById("btn").appendChild(button);
                $("#input-image-2").attr("src", imageUrl);

                console.log(uploaded_image);
                console.log(document.getElementById("input-image-2").getAttribute("src"));

            });
            // Start reading in the selected file, in the format of 'array buffer'
            reader.readAsArrayBuffer(file);


        } else {
            alert("Not a valid image file!");
        }
    }
}

// Capture the current frame as an image in the 'webp' format.
// If a buffer is passed in using the second parameter,
// the captured frame is added to the back of that buffer.
// The captured frame is directly returned.
function captureFrame(video, resultBuffer) {
    // Create a canvas for making the frame image
    var w = video.videoWidth;
    var h = video.videoHeight;
    //console.log(w + " " + h);

    // The vide is not ready
    if (video.readyState == 0 || w == 0 || h == 0)
        return null;

    var canvas = getCanvas(w, h);
    var ctx = canvas.getContext('2d');

    // Draw the current frame displayed onto the temporary canvas context
    ctx.drawImage(video, 0, 0, w, h);

    var result = canvas.toDataURL("image/webp");

    if (resultBuffer !== undefined) {
        // Add the captured frame to the back of the targeting buffer,
        // in the format of 'webp', in data URL format.
        resultBuffer.push(result);
    }

    return result;
}

// function captureImage(image) {
//     // Create a canvas for making the frame image
//     var w = image.width;
//     var h = image.height;


//     var canvas = getCanvas(w, h);
//     var ctx = canvas.getContext('2d');

//     // Draw the current frame displayed onto the temporary canvas context
//     ctx.drawImage(image, 0, 0, w, h);

//     var result = canvas.toDataURL("image/webp");


//     return result;
// }

// Handler of video timechanged event
function updateFrames(evt) {
    var target = evt.target;
    var capturedFrame = captureFrame(target);
    if (capturedFrame == null) return;

    // Locate the target <img /> to be updated
    var targetFrameDisplay = null
    if ($(target).attr("id") === "input-video-1") {
        targetFrameDisplay = $("#input-video-1-frame");
    } else if ($(target).attr("id") === "input-video-2") {
        targetFrameDisplay = $("#input-video-2-frame");
    } else if ($(target).attr("id") === "output-video") {
        targetFrameDisplay = $("#output-video-frame");
    }

    // Show the captured frame
    targetFrameDisplay.attr("src", capturedFrame);
}

// Handler for tab changing.
function changeTabsBackground(e) {
    // The target is the drop down menu item of the tab
    var target = $(e.target);

    // Check if 'target' is actually an <a> element. If not, we need to
    // find the <a> that is a parent of the current selected element.
    if (target.prop("tagName") !== "A") {
        target = target.parents("a");
    }

    // Show the tab and make the tab active
    target.tab('show');
    target.toggleClass("active");
    target.parents(".nav-item").find(".nav-link").toggleClass("active");

    // Change the tab title to relect which waveform is selected
    target.parents("li").find("span.title").html(target.html());

    console.log(useBgVideo);
    e.preventDefault();
}

function changeTabsEffect(e) {
    // The target is the drop down menu item of the tab
    var target = $(e.target);

    // Check if 'target' is actually an <a> element. If not, we need to
    // find the <a> that is a parent of the current selected element.
    if (target.prop("tagName") !== "A") {
        target = target.parents("a");
    }

    // Show the tab and make the tab active
    target.tab('show');
    target.toggleClass("active");
    target.parents(".nav-item").find(".nav-link").toggleClass("active");

    // Change the tab title to relect which waveform is selected
    target.parents("li").find("span.title").html(target.html());

    // Change the current operation in different tab
    selectedEffect = $(e.target).attr("href").substring(1);

    console.log(selectedEffect);

    e.preventDefault();
}

function changeTabsRGB(e) {
    // The target is the drop down menu item of the tab
    var target = $(e.target);

    // Check if 'target' is actually an <a> element. If not, we need to
    // find the <a> that is a parent of the current selected element.
    if (target.prop("tagName") !== "A") {
        target = target.parents("a");
    }

    // Show the tab and make the tab active
    target.tab('show');
    target.toggleClass("active");
    target.parents(".nav-item").find(".nav-link").toggleClass("active");

    // Change the tab title to relect which waveform is selected
    target.parents("li").find("span.title").html(target.html());

    // Change the current operation in different tab
    if ($(e.target).attr("href").substring(1) == "rgb") {
        useRGB = true;
        $("#color-key").show();
        $("#hue-key").hide();
    } else {
        useRGB = false;
        $("#hue-key").show();
        $("#color-key").hide();
    }
    console.log(useRGB);

    e.preventDefault();
}


// Play both the input videos together with the output video
function playBoth() {
    $("#input-video-1").get(0).currentTime = 0;
    $("#input-video-2").get(0).currentTime = 0;
    $("#output-video").get(0).currentTime = 0;
    $("#input-video-1").get(0).play();
    $("#input-video-2").get(0).play();
    $("#output-video").get(0).play();
}

// Update the targeting progress bar to specific value.
// The progress value is displayed in integer.
function updateProgressBar(target, newValue) {
    $(target).width(newValue + "%").text(newValue.toFixed(0) + "%");
}

// Set up the event handlers for various GUI elements
// when the page is fully loaded.
$(function() {
    $("#bg-image-dropdown-item").on("click", function() {
        $("#image-effect-dropdown").show();
        useBgVideo = false;
    });
    $("#bg-video-dropdown-item").on("click", function() {
        $("#image-effect-dropdown").hide();
        useBgVideo = true;
    });
    $("#hue-key").hide();
    $("#input-video-1, #input-video-2, #output-video").on("timeupdate", updateFrames);
    $("#change-input-video-1, #change-input-video-2").on("click", startUpload);
    $("#file-select").on("change", changeVideo);
    $("#play-both").on("click", playBoth);
    $('.background-item').on("click", changeTabsBackground);
    $('.color-item').on("click", changeTabsRGB);
    $('.image-effect-item').on("click", changeTabsEffect);
    $("#apply-effect").on("click", applyEffect);
    $("#cancel-processing").on("click", function() { stopProcessingFlag = true; });
    $("input[type=checkbox]").bootstrapToggle();
    $("#image-input").on("change", changeImage);
    $("#change-input-image-2").on("click", startUploadImage);
});
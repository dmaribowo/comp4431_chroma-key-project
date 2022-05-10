var currentEffect = null; // The current effect applying to the videos

var outputDuration = 0; // The duration of the output video
var outputFramesBuffer = []; // The frames buffer for the output video
var currentFrame = 0; // The current frame being processed
var completedFrames = 0; // The number of completed frames
var threshold = 0;

// This function starts the processing of an individual frame.
function processFrame() {
    if (currentFrame < outputDuration) {
        currentEffect.process(currentFrame);
        currentFrame++;
    }
}

// This function is called when an individual frame is finished.
// If all frames are completed, it takes the frames stored in the
// `outputFramesBuffer` and builds a video. The video is then set as the 'src'
// of the <video id='output-video'></video>.
function finishFrame() {
    completedFrames++;
    if (completedFrames < outputDuration) {
        updateProgressBar("#effect-progress", completedFrames / outputDuration * 100);

        if (stopProcessingFlag) {
            stopProcessingFlag = false;
            $("#progress-modal").modal("hide");
        } else {
            setTimeout(processFrame, 1);
        }
    } else {
        buildVideo(outputFramesBuffer, function(resultVideo) {
            $("#output-video").attr("src", URL.createObjectURL(resultVideo));
            updateProgressBar("#effect-progress", 100);
            $("#progress-modal").modal("hide");
        });
    }
}

// Definition of various video effects
//
// `effects` is an object with unlimited number of members.
// Each member of `effects` represents an effect.
// Each effect is an object, with two member functions:
// - setup() which responsible for gathering different parameters
//           of that effect and preparing the output buffer
// - process() which responsible for processing of individual frame
var effects = {
    reverse: {
        setup: function() {
            // Initialize the duration of the output video
            outputDuration = input1FramesBuffer.length;

            // Prepare the array for storing the output frames
            outputFramesBuffer = new Array(outputDuration);
        },
        process: function(idx) {
            // Put the frames in reverse order
            outputFramesBuffer[idx] = input1FramesBuffer[(outputDuration - 1) - idx];

            // Notify the finish of a frame
            finishFrame();
        }
    },
    chromaKeyVideo: {
        setup: function() {
            threshold = $("#colorKey-threshold").val();
            // Initialize the duration of the output video
            outputDuration = input1FramesBuffer.length;
            
            // Prepare the array for storing the output frames
            outputFramesBuffer = new Array(outputDuration);
            this.blurFrames = parseInt($("#blur-frame-num").val());
            this.imageDataBuffer = [];

        },
        process: function(idx) {
            // Use a canvas to store frame content
            var w = $("#input-video-1").get(0).videoWidth;
            var h = $("#input-video-1").get(0).videoHeight;
            var canvas = getCanvas(w, h);
            var ctx = canvas.getContext('2d');

            var wb = $("#input-video-2").get(0).videoWidth;
            var hb = $("#input-video-2").get(0).videoHeight;
            var canvasb = getCanvas(wb, hb);
            var ctxb = canvasb.getContext('2d');

            var blurFrames = this.blurFrames;
            var imageDataBuffer = this.imageDataBuffer;

            var img = new Image();
            var imgb = new Image();
            img.onload = function() {
                // Get the image data object
                ctx.drawImage(img, 0, 0);
                var imageDataf = ctx.getImageData(0, 0, w, h);
                ctxb.drawImage(imgb, 0, 0);
                var imageDatab;
                
                if (!$("#use-chroma-key").prop("checked"))
                    imageDatab=imageDataf;
                else
                    imageDatab = ctxb.getImageData(0, 0, wb, hb);

                /*
                 * TODO: Modify the pixels
                 */
                if (useRGB) 
                {
                    for (var i = 0; i < imageDataf.data.length; i += 4) {
                        if (Math.hypot(imageDataf.data[i] - 112, imageDataf.data[i + 1] - 158, imageDataf.data[i + 2] - 88) / 442 < threshold) {
                            imageDataf.data[i] = imageDatab.data[i];
                            imageDataf.data[i + 1] = imageDatab.data[i + 1];
                            imageDataf.data[i + 2] = imageDatab.data[i + 2];
                        }
                        
                    }
                } else {
                    for (var i = 0; i < imageDataf.data.length; i += 4) {
                    var r = imageDataf.data[i];
                    var g = imageDataf.data[i + 1];
                    var b = imageDataf.data[i + 2];
                    
                    var hue = imageproc.fromRGBToHSV(r, g, b)["h"];
                    var hue_diff = Math.abs(hue - 90);
                    if ( (hue_diff < 180 && hue_diff / 180 < threshold)||(hue_diff >= 180 && (360 - hue_diff) / 180 < threshold) ){
                        imageDataf.data[i] = imageDatab.data[i];
                        imageDataf.data[i + 1] = imageDatab.data[i + 1];
                        imageDataf.data[i + 2] = imageDatab.data[i + 2];
                     } 
                }
           }
                
                imageData = new ImageData(w, h);
                for (var i = 0; i < imageData.data.length; i += 4) {
                        imageData.data[i] = imageDataf.data[i];
                        imageData.data[i + 1] = imageDataf.data[i + 1];
                        imageData.data[i + 2] = imageDataf.data[i + 2];
                        imageData.data[i + 3] = imageDataf.data[i + 3];
                }
            
                /*
                 * TODO: Manage the image data buffer
                 */
                if ($("#apply-blur-effect").prop("checked")) {
                    imageDataBuffer.push(imageDataf);
                    if (imageDataBuffer.length > blurFrames)
                        imageDataBuffer.shift();

                    imageData = new ImageData(w, h);
                    /*
                     * TODO: Combine the image data buffer into one frame
                     */
                    for (var i = 0; i < imageDataf.data.length; i += 4) {

                        imageData.data[i] = 0;
                        imageData.data[i + 1] = 0;
                        imageData.data[i + 2] = 0;
                        imageData.data[i + 3] = 255;

                        var red = 0;
                        var green = 0;
                        var blue = 0;
                        for (var j = 0; j < imageDataBuffer.length; ++j) {

                            red += imageDataBuffer[j].data[i];
                            green += imageDataBuffer[j].data[i + 1];
                            blue += imageDataBuffer[j].data[i + 2];

                        }
                        imageData.data[i] = Math.round(red / imageDataBuffer.length);
                        imageData.data[i + 1] = Math.round(green / imageDataBuffer.length);
                        imageData.data[i + 2] = Math.round(blue / imageDataBuffer.length);
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                outputFramesBuffer[idx] = canvas.toDataURL("image/webp");

                // Notify the finish of a frame
                finishFrame();
            };
            img.src = input1FramesBuffer[idx];
            imgb.src = input2FramesBuffer[idx];


        }
    },

    chromaKeyImage: {
        setup: function() {
            threshold = $("#colorKey-threshold").val();
            // Initialize the duration of the output video
            outputDuration = input1FramesBuffer.length;

            // Prepare the array for storing the output frames
            outputFramesBuffer = new Array(outputDuration);
            this.blurFrames = parseInt($("#blur-frame-num").val());
            this.imageDataBuffer = [];

        },
        process: function(idx) {
            // Use a canvas to store frame content
            var w = $("#input-video-1").get(0).videoWidth;
            var h = $("#input-video-1").get(0).videoHeight;
            var canvas = getCanvas(w, h);
            var ctx = canvas.getContext('2d');

            var blurFrames = this.blurFrames;
            var imageDataBuffer = this.imageDataBuffer;

            var img = new Image();
            
            img.onload = function() {
                // Get the image data object
                ctx.drawImage(img, 0, 0);
                var imageDataf = ctx.getImageData(0, 0, w, h);
                
                var imageDatab;
                
                if (!$("#use-chroma-key").prop("checked"))
                    imageDatab=imageDataf;
                else
                    imageDatab = processedBackgroundImage;

                /*
                 * TODO: Modify the pixels
                 */
                if (useRGB) 
                {
                    for (var i = 0; i < imageDataf.data.length; i += 4) {
                        if (Math.hypot(imageDataf.data[i] - 112, imageDataf.data[i + 1] - 158, imageDataf.data[i + 2] - 88) / 442 < threshold) {
                            imageDataf.data[i] = imageDatab.data[i];
                            imageDataf.data[i + 1] = imageDatab.data[i + 1];
                            imageDataf.data[i + 2] = imageDatab.data[i + 2];
                        }
                        
                    }
                } else {
                    for (var i = 0; i < imageDataf.data.length; i += 4) {
                    var r = imageDataf.data[i];
                    var g = imageDataf.data[i + 1];
                    var b = imageDataf.data[i + 2];
                    
                    var hue = imageproc.fromRGBToHSV(r, g, b)["h"];
                    var hue_diff = Math.abs(hue - 90);
                    if ( (hue_diff < 180 && hue_diff / 180 < threshold)||(hue_diff >= 180 && (360 - hue_diff) / 180 < threshold) ){
                        imageDataf.data[i] = imageDatab.data[i];
                        imageDataf.data[i + 1] = imageDatab.data[i + 1];
                        imageDataf.data[i + 2] = imageDatab.data[i + 2];
                     } 
                }
           }
                
                imageData = new ImageData(w, h);
                for (var i = 0; i < imageData.data.length; i += 4) {
                        imageData.data[i] = imageDataf.data[i];
                        imageData.data[i + 1] = imageDataf.data[i + 1];
                        imageData.data[i + 2] = imageDataf.data[i + 2];
                        imageData.data[i + 3] = imageDataf.data[i + 3];
                }
            
                /*
                 * TODO: Manage the image data buffer
                 */
                if ($("#apply-blur-effect").prop("checked")) {
                    imageDataBuffer.push(imageDataf);
                    if (imageDataBuffer.length > blurFrames)
                        imageDataBuffer.shift();

                    imageData = new ImageData(w, h);
                    /*
                     * TODO: Combine the image data buffer into one frame
                     */
                    for (var i = 0; i < imageDataf.data.length; i += 4) {

                        imageData.data[i] = 0;
                        imageData.data[i + 1] = 0;
                        imageData.data[i + 2] = 0;
                        imageData.data[i + 3] = 255;

                        var red = 0;
                        var green = 0;
                        var blue = 0;
                        for (var j = 0; j < imageDataBuffer.length; ++j) {

                            red += imageDataBuffer[j].data[i];
                            green += imageDataBuffer[j].data[i + 1];
                            blue += imageDataBuffer[j].data[i + 2];

                        }
                        imageData.data[i] = Math.round(red / imageDataBuffer.length);
                        imageData.data[i + 1] = Math.round(green / imageDataBuffer.length);
                        imageData.data[i + 2] = Math.round(blue / imageDataBuffer.length);
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                outputFramesBuffer[idx] = canvas.toDataURL("image/webp");

                // Notify the finish of a frame
                finishFrame();
            };
            img.src = input1FramesBuffer[idx];
        


        }
    },

    fadeInOut: {
        setup: function() {
            // Prepare the parameters
            this.fadeInDuration = Math.round(parseFloat($("#fadeIn-duration").val()) * frameRate);
            this.fadeOutDuration = Math.round(parseFloat($("#fadeOut-duration").val()) * frameRate);

            // Initialize the duration of the output video
            outputDuration = input1FramesBuffer.length;

            // Prepare the array for storing the output frames
            outputFramesBuffer = new Array(outputDuration);
        },
        process: function(idx) {
            // Use a canvas to store frame content
            var w = $("#input-video-1").get(0).videoWidth;
            var h = $("#input-video-1").get(0).videoHeight;
            var canvas = getCanvas(w, h);
            var ctx = canvas.getContext('2d');

            /*
             * TODO: Calculate the multiplier
             */
            var multiplier = 1;
            if (idx < this.fadeInDuration) {
                // In the fade in region
                // multiplier = ...a value from 0 to 1...
                multiplier = idx / this.fadeInDuration;
            } else if (idx > outputDuration - this.fadeOutDuration) {
                // In the fade out region
                // multiplier = ...a value from 1 to 0...
                multiplier = (outputDuration - idx) / this.fadeOutDuration;
            }


            // Modify the image content based on the multiplier
            var img = new Image();
            img.onload = function() {
                // Get the image data object
                ctx.drawImage(img, 0, 0);
                var imageData = ctx.getImageData(0, 0, w, h);


                /*
                 * TODO: Modify the pixels
                 */

                for (var i = 0; i < imageData.data.length; i += 4) {
                    imageData.data[i] = imageData.data[i] * multiplier; // Red
                    imageData.data[i + 1] = imageData.data[i + 1] * multiplier; // Green
                    imageData.data[i + 2] = imageData.data[i + 2] * multiplier; // Blue\
                }


                // Store the image data as an output frame
                ctx.putImageData(imageData, 0, 0);
                outputFramesBuffer[idx] = canvas.toDataURL("image/webp");

                // Notify the finish of a frame
                finishFrame();
            };
            img.src = input1FramesBuffer[idx];
        }
    },

    motionBlur: {
        setup: function() {
            // Prepare the parameters
            this.blurFrames = parseInt($("#blur-frames").val());

            // Initialize the duration of the output video
            outputDuration = input1FramesBuffer.length;

            // Prepare the array for storing the output frames
            outputFramesBuffer = new Array(outputDuration);

            // Prepare a buffer of frames (as ImageData)
            this.imageDataBuffer = [];
        },
        process: function(idx, parameters) {
            // Use a canvas to store frame content
            var w = $("#input-video-1").get(0).videoWidth;
            var h = $("#input-video-1").get(0).videoHeight;
            var canvas = getCanvas(w, h);
            var ctx = canvas.getContext('2d');

            // Need to store them as local variables so that
            // img.onload can access them
            var imageDataBuffer = this.imageDataBuffer;
            var blurFrames = this.blurFrames;

            // Combine frames into one
            var img = new Image();
            img.onload = function() {
                // Get the image data object of the current frame
                ctx.drawImage(img, 0, 0);
                var imageData = ctx.getImageData(0, 0, w, h);
                /*
                 * TODO: Manage the image data buffer
                 */
                imageDataBuffer.push(imageData);
                if (imageDataBuffer.length > blurFrames)
                    imageDataBuffer.shift();


                // Create a blank image data
                imageData = new ImageData(w, h);
                /*
                 * TODO: Combine the image data buffer into one frame
                 */
                for (var i = 0; i < imageData.data.length; i += 4) {

                    imageData.data[i] = 0;
                    imageData.data[i + 1] = 0;
                    imageData.data[i + 2] = 0;
                    imageData.data[i + 3] = 255;

                    var red = 0;
                    var green = 0;
                    var blue = 0;
                    for (var j = 0; j < imageDataBuffer.length; ++j) {

                        red += imageDataBuffer[j].data[i];
                        green += imageDataBuffer[j].data[i + 1];
                        blue += imageDataBuffer[j].data[i + 2];

                    }
                    imageData.data[i] = Math.round(red / imageDataBuffer.length);
                    imageData.data[i + 1] = Math.round(green / imageDataBuffer.length);
                    imageData.data[i + 2] = Math.round(blue / imageDataBuffer.length);
                }


                // Store the image data as an output frame
                ctx.putImageData(imageData, 0, 0);
                outputFramesBuffer[idx] = canvas.toDataURL("image/webp");

                // Notify the finish of a frame
                finishFrame();
            };
            img.src = input1FramesBuffer[idx];
        }
    },
};

// Handler for the "Apply" button click event
function applyEffect(e) {


    if (input1FramesBuffer.length == 0) {
        alert("Input foreground video!");
        return;
    }

    // check background media
    if (useBgVideo) {
        if (input2FramesBuffer.length == 0) {
            alert("Input background video/image!");
            return;
        } else {
            console.log("do chroma key video1...");
            $("#progress-modal").modal("show");
            updateProgressBar("#effect-progress", 0);


            console.log("do chroma key video...");
            // TODO: do video processing here
            currentEffect = effects.chromaKeyVideo;
            // Set up the effect
            currentEffect.setup();
            //effects.chromaKey.setup();

            // Start processing the frames
            currentFrame = 0;
            completedFrames = 0;
            processFrame();
        }
    } else {
        if (inputImageData == null) {
            alert("Input background video/image!");
            return;
        } else {
            // TODO: do image processing here
            switch (selectedEffect) {
                case "noeffect":
                    processedBackgroundImage = inputImageData;
                    break;
                case "grayscale":
                    var canvas = document.createElement("canvas");
                    var imageData = canvas.getContext("2d").createImageData(inputImageData.width, inputImageData.height);

                    processedBackgroundImage = imageproc.createBuffer(imageData);
                    imageproc.grayscale(inputImageData, processedBackgroundImage);

                    console.log(processedBackgroundImage);
                    break;
                case "blur":
                    var canvas = document.createElement("canvas");
                    var imageData = canvas.getContext("2d").createImageData(inputImageData.width, inputImageData.height);
                    var size = parseInt($("#blur-kernel-size").val());
                    console.log(size);

                    processedBackgroundImage = imageproc.createBuffer(inputImageData);
                    imageproc.blur(inputImageData, processedBackgroundImage, size);

                    console.log(processedBackgroundImage);
                    break;
            }

            $("#progress-modal").modal("show");
            updateProgressBar("#effect-progress", 0);
            console.log("do chroma key image...");
            // TODO: do image processing here
            currentEffect = effects.chromaKeyImage;
            // Set up the effect
            currentEffect.setup();
            //effects.chromaKey.setup();

            // Start processing the frames
            currentFrame = 0;
            completedFrames = 0;
            processFrame();
        }
    }
}
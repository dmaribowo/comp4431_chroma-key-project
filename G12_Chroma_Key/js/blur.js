(function(imageproc) {
    "use strict";

    /*
     * Apply blur to the input data
     */
    imageproc.blur = function(inputData, outputData, kernelSize) {
        console.log("Applying blur...");

        // You are given a 3x3 kernel but you need to create a proper kernel
        // using the given kernel size
        var kernel, div, num;
        switch(kernelSize){
            case 3:
                kernel = [ [1, 1, 1], [1, 1, 1], [1, 1, 1] ];
                div = 9;
                num = 1;
                break;
            case 5:
                kernel = [ [1, 1, 1,1,1], [1, 1, 1,1,1], [1, 1, 1,1,1], [1, 1, 1,1,1], [1, 1, 1,1,1] ];
                div = 25;
                num = 2;
                break;
            case 7:
                kernel = [ [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1] ];
                div = 49;
                num = 3;
                break;
            case 9:
                kernel = [ [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1],
                            [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1],
                            [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1] ];
                div = 81;
                num = 4;
                break;
        }
        

        /**
         * TODO: You need to extend the blur effect to include different
         * kernel sizes and then apply the kernel to the entire image
         */

        // Apply the kernel to the whole image
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                // Use imageproc.getPixel() to get the pixel values
                // over the kernel
                var sumR = 0;
                var sumG = 0;
                var sumB = 0;
                for (var j = -num; j <= num; j++) {
                    for (var i = -num; i <= num; i++) {
                        var pix = imageproc.getPixel(inputData, x+i, y+j);
                        sumR += kernel[i+num][j+num]/div*pix["r"];
                        sumG += kernel[i+num][j+num]/div*pix["g"];
                        sumB += kernel[i+num][j+num]/div*pix["b"];
                    }
                }
                // Then set the blurred result to the output data
                
                var i = (x + y * outputData.width) * 4;
                outputData.data[i]     = sumR;
                outputData.data[i + 1] = sumG;
                outputData.data[i + 2] = sumB;
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));

(function(imageproc) {
    "use strict";

    /*
     * Apply negation to the input data
     */
    imageproc.negation = function(inputData, outputData) {
        console.log("Applying negation...");

        for (var i = 0; i < inputData.data.length; i += 4) {
            outputData.data[i] = 255 - inputData.data[i];
            outputData.data[i + 1] = 255 - inputData.data[i + 1];
            outputData.data[i + 2] = 255 - inputData.data[i + 2];
        }
    }

    /*
     * Convert the input data to grayscale
     */
    imageproc.grayscale = function(inputData, outputData) {
        console.log("Applying grayscale...");

        /**
         * TODO: You need to create the grayscale operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
            var gs = (inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3
                // Change the RGB components to the resulting value

            outputData.data[i] = gs;
            outputData.data[i + 1] = gs;
            outputData.data[i + 2] = gs;
        }
    }

    /*
     * Applying brightness to the input data
     */
    imageproc.brightness = function(inputData, outputData, offset) {
        console.log("Applying brightness...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by adding an offset

            outputData.data[i] = inputData.data[i] + offset;
            outputData.data[i + 1] = inputData.data[i + 1] + offset;
            outputData.data[i + 2] = inputData.data[i + 2] + offset;

            // Handle clipping of the RGB components
            if (outputData.data[i] > 255) {
                outputData.data[i] = 255;
            } else if (outputData.data[i] < 0) {
                outputData.data[i] = 0
            }
            if (outputData.data[i + 1] > 255) {
                outputData.data[i + 1] = 255;
            } else if (outputData.data[i + 1] < 0) {
                outputData.data[i + 1] = 0
            }
            if (outputData.data[i + 2] > 255) {
                outputData.data[i + 2] = 255;
            } else if (outputData.data[i + 2] < 0) {
                outputData.data[i + 2] = 0
            }
        }
    }

    /*
     * Applying contrast to the input data
     */
    imageproc.contrast = function(inputData, outputData, factor) {
        console.log("Applying contrast...");

        /**
         * TODO: You need to create the brightness operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Change the RGB components by multiplying a factor

            outputData.data[i] = inputData.data[i] * factor;
            outputData.data[i + 1] = inputData.data[i + 1] * factor;
            outputData.data[i + 2] = inputData.data[i + 2] * factor;

            // Handle clipping of the RGB components
            if (outputData.data[i] > 255) {
                outputData.data[i] = 255;
            }
            if (outputData.data[i + 1] > 255) {
                outputData.data[i + 1] = 255;
            }
            if (outputData.data[i + 2] > 255) {
                outputData.data[i + 2] = 255;
            }
        }
    }

    /*
     * Make a bit mask based on the number of MSB required
     */
    function makeBitMask(bits) {
        var mask = 0;
        for (var i = 0; i < bits; i++) {
            mask >>= 1;
            mask |= 128;
        }
        return mask;
    }

    /*
     * Apply posterization to the input data
     */
    imageproc.posterization = function(inputData, outputData,
        redBits, greenBits, blueBits) {
        console.log("Applying posterization...");

        /**
         * TODO: You need to create the posterization operation here
         */

        // Create the red, green and blue masks
        // A function makeBitMask() is already given
        var redMask = makeBitMask(redBits);
        var greenMask = makeBitMask(greenBits);
        var blueMask = makeBitMask(blueBits);

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Apply the bitmasks onto the RGB channels

            outputData.data[i] = inputData.data[i] & redMask;
            outputData.data[i + 1] = inputData.data[i + 1] & greenMask;
            outputData.data[i + 2] = inputData.data[i + 2] & blueMask;

            // outputData.data[i]     = redBits&&mask ;
            // outputData.data[i + 1] = greenBits&&mask;
            // outputData.data[i + 2] = blueBits&&mask ;
        }
    }

    /*
     * Apply threshold to the input data
     */
    imageproc.threshold = function(inputData, outputData, thresholdValue) {
        console.log("Applying thresholding...");

        /**
         * TODO: You need to create the thresholding operation here
         */

        for (var i = 0; i < inputData.data.length; i += 4) {
            // Find the grayscale value using simple averaging
            // You will apply thresholding on the grayscale value
            var avg = (inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3;
            var val = avg > thresholdValue ? 255 : 0;

            // Change the colour to black or white based on the given threshold

            outputData.data[i] = val;
            outputData.data[i + 1] = val;
            outputData.data[i + 2] = val;
        }
    }

    /*
     * Build the histogram of the image for a channel
     */
    function buildHistogram(inputData, channel) {
        var histogram = [];
        for (var i = 0; i < 256; i++)
            histogram[i] = 0;

        /**
         * TODO: You need to build the histogram here
         */

        // Accumulate the histogram based on the input channel
        // The input channel can be:
        // "red"   - building a histogram for the red component
        // "green" - building a histogram for the green component
        // "blue"  - building a histogram for the blue component
        // "gray"  - building a histogram for the intensity
        //           (using simple averaging)
        for (var i = 0; i < inputData.data.length; i += 4) {
            var val;
            if (channel == "gray")
                val = parseInt((inputData.data[i] + inputData.data[i + 1] + inputData.data[i + 2]) / 3);
            else if (channel == "red")
                val = inputData.data[i];
            else if (channel == "green")
                val = inputData.data[i + 1];
            else
                val = inputData.data[i + 2];
            histogram[val] += 1;
        }
        return histogram;
    }

    /*
     * Find the min and max of the histogram
     */
    function findMinMax(histogram, pixelsToIgnore) {

        var leftPixelsToIgnore = pixelsToIgnore;
        var rightPixelsToIgnore = pixelsToIgnore;
        var l = 0;
        var r = 255;
        var min, max;

        while (histogram[l] == 0)
            l += 1;
        while (histogram[r] == 0)
            r -= 1;

        while (leftPixelsToIgnore > 0) {
            if (histogram[l] < leftPixelsToIgnore) {
                leftPixelsToIgnore -= histogram[l];
                l += 1;
            } else if (histogram[l] == leftPixelsToIgnore) {
                leftPixelsToIgnore -= histogram[l];
                l += 1;
                while (histogram[l] == 0)
                    l += 1;
                break;
            } else {
                leftPixelsToIgnore -= histogram[l];
                break;
            }
        }

        while (rightPixelsToIgnore > 0) {
            if (histogram[r] < rightPixelsToIgnore) {
                rightPixelsToIgnore -= histogram[r];
                r -= 1;
            } else if (histogram[r] == rightPixelsToIgnore) {
                rightPixelsToIgnore -= histogram[r];
                r -= 1;
                while (histogram[r] == 0)
                    r -= 1;
                break;
            } else {
                rightPixelsToIgnore -= histogram[r];
                break;
            }
        }
        min = l;
        max = r;
        /**
         * TODO: You need to build the histogram here
         */

        // Find the minimum in the historam with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore

        // Find the maximum in the histogram with non-zero value by
        // ignoring the number of pixels given by pixelsToIgnore

        return { "min": min, "max": max };
    }

    /*
     * Apply automatic contrast to the input data
     */
    imageproc.autoContrast = function(inputData, outputData, type, percentage) {
        console.log("Applying automatic contrast...");

        // Find the number of pixels to ignore from the percentage
        var pixelsToIgnore = (inputData.data.length / 4) * percentage;

        var histogram, minMax;
        if (type == "gray") {
            // Build the grayscale histogram
            histogram = buildHistogram(inputData, "gray");
            console.log(histogram.slice(0, 10).join(","));

            // Find the minimum and maximum grayscale values with non-zero pixels
            minMax = findMinMax(histogram, pixelsToIgnore);
            console.log(minMax);

            var min = minMax.min,
                max = minMax.max,
                range = max - min;

            /**
             * TODO: You need to apply the correct adjustment to each pixel
             */

            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each pixel based on the minimum and maximum values

                outputData.data[i] = (inputData.data[i] - min) / range * 255;
                outputData.data[i + 1] = (inputData.data[i + 1] - min) / range * 255;
                outputData.data[i + 2] = (inputData.data[i + 2] - min) / range * 255;

                if (outputData.data[i] > 255) {
                    outputData.data[i] = 255;
                } else if (outputData.data[i] < 0) {
                    outputData.data[i] = 0
                }
                if (outputData.data[i + 1] > 255) {
                    outputData.data[i + 1] = 255;
                } else if (outputData.data[i + 1] < 0) {
                    outputData.data[i + 1] = 0
                }
                if (outputData.data[i + 2] > 255) {
                    outputData.data[i + 2] = 255;
                } else if (outputData.data[i + 2] < 0) {
                    outputData.data[i + 2] = 0
                }
            }
        } else {

            /**
             * TODO: You need to apply the same procedure for each RGB channel
             *       based on what you have done for the grayscale version
             */
            var redHist = buildHistogram(inputData, "red");
            var greenHist = buildHistogram(inputData, "green");
            var blueHist = buildHistogram(inputData, "blue");

            var redMinMax = findMinMax(redHist, pixelsToIgnore);
            var greenMinMax = findMinMax(greenHist, pixelsToIgnore);
            var blueMinMax = findMinMax(blueHist, pixelsToIgnore);

            var redMin = redMinMax.min,
                redMax = redMinMax.max,
                redRange = redMax - redMin;
            var greenMin = greenMinMax.min,
                greenMax = greenMinMax.max,
                greenRange = greenMax - greenMin;
            var blueMin = blueMinMax.min,
                blueMax = blueMinMax.max,
                blueRange = blueMax - blueMin;

            for (var i = 0; i < inputData.data.length; i += 4) {
                // Adjust each channel based on the histogram of each one

                outputData.data[i] = (inputData.data[i] - redMin) / redRange * 255;
                outputData.data[i + 1] = (inputData.data[i + 1] - greenMin) / greenRange * 255;
                outputData.data[i + 2] = (inputData.data[i + 2] - blueMin) / blueRange * 255;

                if (outputData.data[i] > 255) {
                    outputData.data[i] = 255;
                } else if (outputData.data[i] < 0) {
                    outputData.data[i] = 0
                }
                if (outputData.data[i + 1] > 255) {
                    outputData.data[i + 1] = 255;
                } else if (outputData.data[i + 1] < 0) {
                    outputData.data[i + 1] = 0
                }
                if (outputData.data[i + 2] > 255) {
                    outputData.data[i + 2] = 255;
                } else if (outputData.data[i + 2] < 0) {
                    outputData.data[i + 2] = 0
                }
            }
        }
    }

}(window.imageproc = window.imageproc || {}));
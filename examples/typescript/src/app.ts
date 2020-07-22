/**
 * PhotoPay In-browser SDK demo app which demonstrates how to:
 *
 * - Change default SDK settings
 * - Scan PDF417 2D barcode of Croatian payment slip
 * - Provide visual feedback to the end-user during the scan
 */
import * as PhotoPaySDK from "@microblink/photopay-in-browser-sdk";

// General UI helpers
const initialMessageEl = document.getElementById( "msg" ) as HTMLHeadingElement;
const progressEl = document.getElementById( "load-progress" ) as HTMLProgressElement;

// UI elements for scanning feedback
const cameraFeed = document.getElementById( "camera-feed" ) as HTMLVideoElement;
const cameraFeedback = document.getElementById( "camera-feedback" ) as HTMLCanvasElement;
const drawContext = cameraFeedback.getContext( "2d" ) as CanvasRenderingContext2D;
const scanFeedback = document.getElementById( "camera-guides" ) as HTMLParagraphElement;

/**
 * Initialize and load WASM SDK.
 */
function main()
{
    // Check if browser has proper support for WebAssembly
    if ( !PhotoPaySDK.isBrowserSupported() )
    {
        initialMessageEl.innerText = "This browser is not supported!";
        return;
    }

    // 1. It's possible to obtain a free trial license key on microblink.com
    const licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPig/w35CpHnVLW8/ZATHY523OJP5PijzR764W7JpSxOaXvkbcsUvA9QO+ziulLWjrUHMvh8o6771j3Wmb7G/0vrlDlql6u/V+FhOc0xnH64qqjpW8/6IUaKHaLtOr4zb4kqTxFBbJ5ejJImEB7HDoAWBr0qc0Bsdf387JFctEVbQhODTENfLrqBS6GCiGtFdzXwyEwjlrKzEtCtMlMMDHGnSja+wwhWF6n7CbVwz2Nlz1d4Tz8WU3upeGt8k5Jp4H9Jr4zAtavNBIT2jIw==";

    // 2. Create instance of SDK load settings with your license key
    const loadSettings = new PhotoPaySDK.WasmSDKLoadSettings( licenseKey );

    // [OPTIONAL] Change default settings

    // Show or hide hello message in browser console when WASM is successfully loaded
    loadSettings.allowHelloMessage = true;

    // In order to provide better UX, display progress bar while loading the SDK
    loadSettings.loadProgressCallback = ( progress: number ) => progressEl!.value = progress;

    // Set relative or absolute location of the engine, i.e. WASM and support JS files
    loadSettings.engineLocation = "";

    // Set relative or absolute location of WebWorker file which is responsible for loading of WASM and support JS files
    loadSettings.workerLocation = "resources";

    // 3. Load SDK
    PhotoPaySDK.loadWasmModule( loadSettings ).then
    (
        ( sdk: PhotoPaySDK.WasmSDK ) =>
        {
            document.getElementById( "screen-initial" )?.classList.add( "hidden" );
            document.getElementById( "screen-start" )?.classList.remove( "hidden" );
            document.getElementById( "start-scan" )?.addEventListener( "click", ( ev: any ) =>
            {
                ev.preventDefault();
                startScan( sdk );
            });
        },
        ( error: any ) =>
        {
            initialMessageEl.innerText = "Failed to load SDK!";
            console.error( "Failed to load SDK!", error );
        }
    );
}

/**
 * Scan PDF417 2D barcode of Croatian payment slip.
 */
async function startScan( sdk: PhotoPaySDK.WasmSDK )
{
    document.getElementById( "screen-start" )?.classList.add( "hidden" );
    document.getElementById( "screen-scanning" )?.classList.remove( "hidden" );

    // 1. Create a recognizer objects which will be used to recognize single image or stream of images.
    //
    // In this example, we create a CroatiaPdf417PaymentRecognizer, which knows how to scan PDF417 2D
    // barcodes on Croatian payment slips and extract payment information from them.
    const croPdf417Recognizer = await PhotoPaySDK.createCroatiaPdf417PaymentRecognizer( sdk );

    // [OPTIONAL] Create a callbacks object that will receive recognition events, such as detected object location etc.
    const callbacks = {
        onQuadDetection: ( quad: PhotoPaySDK.DisplayableQuad ) => drawQuad( quad )
    }

    // 2. Create a RecognizerRunner object which orchestrates the recognition with one or more
    //    recognizer objects.
    const recognizerRunner = await PhotoPaySDK.createRecognizerRunner
    (
        // SDK instance to use
        sdk,
        // List of recognizer objects that will be associated with created RecognizerRunner object
        [ croPdf417Recognizer ],
        // [OPTIONAL] Should recognition pipeline stop as soon as first recognizer in chain finished recognition
        false,
        // [OPTIONAL] Callbacks object that will receive recognition events
        callbacks
    );

    // 3. Create a VideoRecognizer object and attach it to HTMLVideoElement that will be used for displaying the camera feed
    const videoRecognizer = await PhotoPaySDK.VideoRecognizer.createVideoRecognizerFromCameraStream
    (
        cameraFeed,
        recognizerRunner
    );

    // 4. Start the recognition and await for the results
    const processResult = await videoRecognizer.recognize();

    // 5. If recognition was successful, obtain the result and display it
    if ( processResult !== PhotoPaySDK.RecognizerResultState.Empty )
    {
        const croPdf417Result = await croPdf417Recognizer.getResult();
        if ( croPdf417Result.state !== PhotoPaySDK.RecognizerResultState.Empty )
        {
            console.log( "CroPdf417 results", croPdf417Result );
            alert
            (
                `Please pay ${ croPdf417Result.amount }${ croPdf417Result.currency } to recipient ${ croPdf417Result.recipientName }, account number: ${ croPdf417Result.iban } with payment reference ${ croPdf417Result.referenceModel } ${ croPdf417Result.reference }!`
            );
        }
    }
    else
    {
        alert( "Could not extract information!" );
    }

    // 7. Release all resources allocated on the WebAssembly heap and associated with camera stream

    // Release browser resources associated with the camera stream
    videoRecognizer?.releaseVideoFeed();

    // Release memory on WebAssembly heap used by the RecognizerRunner
    recognizerRunner?.delete();

    // Release memory on WebAssembly heap used by the recognizer
    croPdf417Recognizer?.delete();

    // Clear any leftovers drawn to canvas
    clearDrawCanvas();

    // Hide scanning screen and show scan button again
    document.getElementById( "screen-start" )?.classList.remove( "hidden" );
    document.getElementById( "screen-scanning" )?.classList.add( "hidden" );
}

/**
 * Utility functions for drawing detected quadrilateral onto canvas.
 */
function drawQuad( quad: PhotoPaySDK.DisplayableQuad )
{
    clearDrawCanvas();

    // Based on detection status, show appropriate color and message
    setupColor( quad );

    applyTransform( quad.transformMatrix );
    drawContext.beginPath();
    drawContext.moveTo( quad.topLeft    .x, quad.topLeft    .y );
    drawContext.lineTo( quad.topRight   .x, quad.topRight   .y );
    drawContext.lineTo( quad.bottomRight.x, quad.bottomRight.y );
    drawContext.lineTo( quad.bottomLeft .x, quad.bottomLeft .y );
    drawContext.closePath();
    drawContext.stroke();
}

/**
 * This function will make sure that coordinate system associated with detectionResult
 * canvas will match the coordinate system of the image being recognized.
 */
function applyTransform( transformMatrix: Float32Array )
{
    const canvasAR = cameraFeedback.width / cameraFeedback.height;
    const videoAR = cameraFeed.videoWidth / cameraFeed.videoHeight;

    let xOffset = 0;
    let yOffset = 0;
    let scaledVideoHeight = 0
    let scaledVideoWidth = 0

    if ( canvasAR > videoAR )
    {
        // pillarboxing: https://en.wikipedia.org/wiki/Pillarbox
        scaledVideoHeight = cameraFeedback.height;
        scaledVideoWidth = videoAR * scaledVideoHeight;
        xOffset = ( cameraFeedback.width - scaledVideoWidth ) / 2.0;
    }
    else
    {
        // letterboxing: https://en.wikipedia.org/wiki/Letterboxing_(filming)
        scaledVideoWidth = cameraFeedback.width;
        scaledVideoHeight = scaledVideoWidth / videoAR;
        yOffset = ( cameraFeedback.height - scaledVideoHeight ) / 2.0;
    }

    // first transform canvas for offset of video preview within the HTML video element (i.e. correct letterboxing or pillarboxing)
    drawContext.translate( xOffset, yOffset );
    // second, scale the canvas to fit the scaled video
    drawContext.scale
    (
        scaledVideoWidth / cameraFeed.videoWidth,
        scaledVideoHeight / cameraFeed.videoHeight
    );

    // finally, apply transformation from image coordinate system to
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
    drawContext.transform
    (
        transformMatrix[0],
        transformMatrix[3],
        transformMatrix[1],
        transformMatrix[4],
        transformMatrix[2],
        transformMatrix[5]
    );
}

function clearDrawCanvas()
{
    cameraFeedback.width = cameraFeedback.clientWidth;
    cameraFeedback.height = cameraFeedback.clientHeight;

    drawContext.clearRect
    (
        0,
        0,
        cameraFeedback.width,
        cameraFeedback.height
    );
}

function setupColor( displayable: PhotoPaySDK.Displayable )
{
    let color = "#FFFF00FF";

    if ( displayable.detectionStatus === 0 )
    {
        color = "#FF0000FF";
    }
    else if ( displayable.detectionStatus === 1 )
    {
        color = "#00FF00FF";
    }

    drawContext.fillStyle = color;
    drawContext.strokeStyle = color;
    drawContext.lineWidth = 5;
}

// Run
main();

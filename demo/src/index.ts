import * as MicroblinkSDK from '@microblink/photopay-in-browser-sdk'

const licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPig/w35CpHnVKlreBu8vPPBPHuWSBrwGyIO8bE+7puJobI/aZ0CX2+wvR+8BRkhRRKXTgzj371MFLbvpIgObIUnTKN7XhgSgvy82R9ZfHZzKKt7pJgle2JGw7Wx7QvqV9ObNLPub06nEPAK6UbTrjcXEWCqWrk6gHBcr1lHxoUqGnsSM52g9kITYvWuuPqOQKRhcucitJenrM6bxYY0AEcuoyIeJzWNkDKbYZ0hRqO1t+q309jXfFyvGTNsV5LMuUCDNErR+QV2WCXe5gANUodQ=";

// create a load settings, defining the license key and name of the WebAssembly module
const loadSettings = new MicroblinkSDK.WasmSDKLoadSettings( licenseKey );

// asynchronously load and compile the WebAssembly module.
MicroblinkSDK.loadWasmModule( loadSettings ).then
(
    // function called when WebAssembly module gets ready
    ( wasmSDK: MicroblinkSDK.WasmSDK ) =>
    {
        console.log( "WASM loaded successfully!" );

        // create an instance of MyApp and attach it to global window object
        const app = new MyApp( wasmSDK );

        // attach the app to the window object, so that it will be accessible from HTML events
        ( window as any ).app = app;
    },
    // function called when there is an error in loading the WebAssembly module
    ( reason: any ) =>
    {
        console.error( "Failed to load WASM! Reason: " + reason );
        alert( "Failed to load WASM! Reason: " + reason );
    }
)

class MyApp
{
    // reference to Wasm SDK
    private wasmSDK: MicroblinkSDK.WasmSDK;

    // canvas on which metadata will be drawn
    private detectionResult: HTMLCanvasElement;
    // HTML video element displaying camera preview
    private cameraFeed: HTMLVideoElement;
    // cached 2D rendering context for detectionResult canvas
    private drawContext: CanvasRenderingContext2D;

    constructor( sdk: MicroblinkSDK.WasmSDK )
    {
        this.wasmSDK = sdk;
        this.detectionResult = document.getElementById( 'cameraFeedback' ) as HTMLCanvasElement;
        this.cameraFeed = document.getElementById( 'cameraFeed' ) as HTMLVideoElement;
        this.drawContext = this.detectionResult.getContext( '2d' )!;
    }

    // this method gets called when user clicks the "Start scanning" button
    async startScanning()
    {
        // 1. create a recognizer object, which will be used to recognize the stream of images
        // In this example, we create a CroatiaPdf417PaymentRecognizer, which knows how to scan PDF417 2D
        // barcodes on croatian payment slips and extract payment information from them.
        const croPdf417Recognizer = await MicroblinkSDK.createCroatiaPdf417PaymentRecognizer( this.wasmSDK );

        // 2. (optionally) create a callbacks object that will receive recognition events, such as detected object location etc.
        const callbacks: MicroblinkSDK.MetadataCallbacks = {
            onQuadDetection: ( quad: MicroblinkSDK.DisplayableQuad ) => {
                this.drawQuad( quad );
            }
        }

        // 3. create a RecognizerRunner object, which orchestrates the recognition with one or more recognizer objects
        const recognizerRunner = await MicroblinkSDK.createRecognizerRunner(
            this.wasmSDK,               // Wasm SDK to use
            [ croPdf417Recognizer ],    // list of recognizer objects that will be associated with created RecognizerRunner object
            false,                      // (optional) should recognition pipeline stop as soon as first recognizer in chain finished recognition
            callbacks                   // (optional) callbacks object that will receive recognition events
        );

        // 4. create a VideoRecognizer object and attach it to HTMLVideoElement that will be used for displaying the camera feed
        const videoRecognizer = await MicroblinkSDK.VideoRecognizer.createVideoRecognizerFromCameraStream( this.cameraFeed, recognizerRunner );

        // hide button and unhide display message
        document.getElementById( 'btnStart' )!.hidden = true;
        document.getElementById( 'cameraMessage' )!.hidden = false;

        // 5. start the recognition and await for the results
        const processResult = await videoRecognizer.recognize();

        // 6. if recognition was successful, obtain the result and display it
        if ( processResult != MicroblinkSDK.RecognizerResultState.Empty )
        {
            const croPdf417Result = await croPdf417Recognizer.getResult();
            console.log( croPdf417Result );
            alert( "Please pay " + croPdf417Result.amount + " " + croPdf417Result.currency + " to recipient " + croPdf417Result.recipientName +
                   ", account number: " + croPdf417Result.iban + " with payment reference " + croPdf417Result.referenceModel + " " +
                   croPdf417Result.reference + "!" );
        }

        // 7. release all resources allocated on the WebAssembly heap and associated with camera stream

        // release browser resources associated with the camera stream
        videoRecognizer.releaseVideoFeed();
        // release memory on WebAssembly heap used by the RecognizerRunner
        recognizerRunner.delete();
        // release memory on WebAssembly heap used by the BarcodeRecognizer
        croPdf417Recognizer.delete();

        // hide message and show the scan button again
        document.getElementById( 'btnStart' )!.hidden = false;
        document.getElementById( 'cameraMessage' )!.hidden = true;

        // clear any leftovers drawn to canvas
        this.clearDrawCanvas();
    }

    // utility functions for drawing detected quadrilateral onto canvas
    private drawQuad( quad: MicroblinkSDK.DisplayableQuad )
    {
        this.clearDrawCanvas();
        this.setupColor( quad );

        const ctx = this.drawContext;
        this.applyTransform( ctx, quad.transformMatrix );
        ctx.beginPath();
        ctx.moveTo( quad.topLeft    .x, quad.topLeft    .y );
        ctx.lineTo( quad.topRight   .x, quad.topRight   .y );
        ctx.lineTo( quad.bottomRight.x, quad.bottomRight.y );
        ctx.lineTo( quad.bottomLeft .x, quad.bottomLeft .y );
        ctx.closePath();
        ctx.stroke();
    }

    // this function will make sure that coordinate system associated with detectionResult canvas
    // will match the coordinate system of the image being recognized
    private applyTransform( ctx: CanvasRenderingContext2D, transformMatrix: Float32Array )
    {
        // TODO: optimization: this can be calculated once every time camera is started and browser video is resized
        // convert point from coordinates in video into coordinates in canvas
        const canvasAR = this.detectionResult.width / this.detectionResult.height;
        const videoAR  = this.cameraFeed.videoWidth / this.cameraFeed.videoHeight;

        let xOffset = 0;
        let yOffset = 0;
        let scaledVideoHeight = 0
        let scaledVideoWidth  = 0

        if ( canvasAR > videoAR ) // pillarboxing: https://en.wikipedia.org/wiki/Pillarbox
        {
            scaledVideoHeight = this.detectionResult.height;
            scaledVideoWidth = videoAR * scaledVideoHeight;
            xOffset = ( this.detectionResult.width - scaledVideoWidth ) / 2.0;
        }
        else                      // letterboxing: https://en.wikipedia.org/wiki/Letterboxing_(filming)
        {
            scaledVideoWidth = this.detectionResult.width;
            scaledVideoHeight = scaledVideoWidth / videoAR;
            yOffset = ( this.detectionResult.height - scaledVideoHeight ) / 2.0;
        }

        // first transform canvas for offset of video preview within the HTML video element (i.e. correct letterboxing or pillarboxing)
        ctx.translate( xOffset, yOffset );
        // second, scale the canvas to fit the scaled video
        ctx.scale( scaledVideoWidth / this.cameraFeed.videoWidth, scaledVideoHeight / this.cameraFeed.videoHeight );

        // finally, apply transformation from image coordinate system to
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
        ctx.transform( transformMatrix[ 0 ], transformMatrix[ 3 ], transformMatrix[ 1 ], transformMatrix[ 4 ], transformMatrix[ 2 ], transformMatrix[ 5 ] );
    }

    private clearDrawCanvas()
    {
        // TODO: optimization: update this only on resize event
        this.detectionResult.width = this.detectionResult.clientWidth;
        this.detectionResult.height = this.detectionResult.clientHeight;

        this.drawContext.clearRect( 0, 0, this.detectionResult.width, this.detectionResult.height );
    }

    private setupColor( displayable: MicroblinkSDK.Displayable )
    {
        const ctx = this.drawContext;

        let color = '#FFFF00FF' // yellow
        // determine color based on detection status
        if      ( displayable.detectionStatus == MicroblinkSDK.DetectionStatus.Fail    ) color = '#FF0000FF'; // red
        else if ( displayable.detectionStatus == MicroblinkSDK.DetectionStatus.Success ) color = '#00FF00FF'; // green

        ctx.fillStyle   = color
        ctx.strokeStyle = color
        ctx.lineWidth = 5;
    }
}

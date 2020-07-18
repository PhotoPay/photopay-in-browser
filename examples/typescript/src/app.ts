import * as PhotoPaySDK from '@microblink/photopay-in-browser-sdk';

// Check if browser has proper support for WebAssembly
if ( !PhotoPaySDK.isBrowserSupported() )
{
    document.getElementById( "messages" )!.innerText = "This browser is not supported!";
}
else
{
    main();
}

function main()
{
    // It's possible to obtain a free trial license key on microblink.com
    const licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPig/w35CpHnVLW8/ZATHY523OJP5PijzR764W7JpSxOaXvkbcsUvA9QO+ziulLWjrUHMvh8o6771j3Wmb7G/0vrlDlql6u/V+FhOc0xnH64qqjpW8/6IUaKHaLtOr4zb4kqTxFBbJ5ejJImEB7HDoAWBr0qc0Bsdf387JFctEVbQhODTENfLrqBS6GCiGtFdzXwyEwjlrKzEtCtMlMMDHGnSja+wwhWF6n7CbVwz2Nlz1d4Tz8WU3upeGt8k5Jp4H9Jr4zAtavNBIT2jIw==";

    // Create SDK settings with appropriate license key
    const loadSettings = new PhotoPaySDK.WasmSDKLoadSettings( licenseKey );

    // Change default settings - more information about these settings can be found in the documentation
    loadSettings.allowHelloMessage = true;
    loadSettings.loadProgressCallback = null;
    loadSettings.engineLocation = "/resources";
    loadSettings.workerLocation = "/resources";

    // Load SDK
    PhotoPaySDK.loadWasmModule( loadSettings ).then
    (
        sdk =>
        {
            document.getElementById( "messages" )!.innerHTML = "";
            document.getElementById( "app" )!.classList.remove( 'hidden' );

            const app = new MyApp( sdk );

            (window as any).app = app;

            const fileScanControls = document.getElementById( "file-scan" ) as HTMLDivElement;
            const cameraScanControls = document.getElementById( "camera-scan" ) as HTMLDivElement;

            const fileInput = document.getElementById( "imageInput" ) as HTMLInputElement;
            fileInput.addEventListener( "change", ( e: any ) => 
            {
                app.processFiles( e.target.files ).catch
                (
                    () =>
                    {
                        throw "Error during processing files!";
                    }
                );
                fileInput.value = "";
            } );

            const doFileScan = document.getElementById( "doFileScan" ) as HTMLButtonElement;
            doFileScan.addEventListener
            (
                "click",
                () =>
                {
                    if ( fileScanControls.hidden )
                    {
                        if ( !cameraScanControls.hidden ) app.cancelCameraRecognition();
                        if ( app.atLeastOneEnabled() )
                        {
                            fileScanControls.hidden = false;
                        }
                        else
                        {
                            alert( "You must enable at least one recognizer!" );
                        }
                    }
                    else
                    {
                        fileScanControls.hidden = true;
                    }
                }
            );

            const doCameraScan = document.getElementById( "doCameraScan" ) as HTMLButtonElement;
            doCameraScan.addEventListener
            (
                "click",
                () =>
                {
                    if ( cameraScanControls.hidden )
                    {
                        fileScanControls.hidden = true;
                        if ( app.atLeastOneEnabled() )
                        {
                            cameraScanControls.hidden = false;
                            app.recognizeWithCamera().catch
                            (
                                () =>
                                {
                                    throw "Error during recognizeWithCamera!";
                                }
                            );
                        }
                        else
                        {
                            alert( "You must enable at least one recognizer!" );
                        }
                    }
                    else
                    {
                        app.cancelCameraRecognition();
                    }
                }
            );
        },
        ( reason ) =>
        {
            document.getElementById( "messages" )!.innerHTML = "WASM initialization failed. Reason: " + JSON.stringify( reason );
        }
    );
}

class MyApp
{
    sdk: PhotoPaySDK.WasmSDK;
    cameraFeed: HTMLVideoElement;
    cameraFeedback: HTMLCanvasElement;
    cameraScan: HTMLDivElement;
    feedbackDrawContext: CanvasRenderingContext2D;
    fileScan: HTMLDivElement;
    messages: HTMLDivElement;
    scanAgainBtn: HTMLButtonElement;
    doCameraScanBtn: HTMLButtonElement;
    doFileScanBtn: HTMLButtonElement;
    cancelVideoScanBtn: HTMLButtonElement;

    imageElement: HTMLImageElement;
    recognizers: HTMLDivElement;
    results: HTMLDivElement;

    videoRecognizer: PhotoPaySDK.VideoRecognizer | null = null;
    recognizerRunner: PhotoPaySDK.RecognizerRunner | null = null;

    // Recognizers
    ausQRCodeRecognizer: PhotoPaySDK.AustriaQrCodePaymentRecognizer | null = null;
    croPdf417Recognizer: PhotoPaySDK.CroatiaPdf417PaymentRecognizer | null = null;
    croQRRecognizer: PhotoPaySDK.CroatiaQrCodePaymentRecognizer | null = null;
    czQRRecognizer: PhotoPaySDK.CzechiaQrCodePaymentRecognizer | null = null;
    deQRRecognizer: PhotoPaySDK.GermanyQrCodePaymentRecognizer | null = null;
    kosCode128Recognizer: PhotoPaySDK.KosovoCode128PaymentRecognizer | null = null;
    sepaQRRecognizer: PhotoPaySDK.SepaQrCodePaymentRecognizer | null = null;
    serbPDF417Recognizer: PhotoPaySDK.SerbiaPdf417PaymentRecognizer | null = null;
    serbQRRecognizer: PhotoPaySDK.SerbiaQrCodePaymentRecognizer | null = null;
    skCode128Recognizer: PhotoPaySDK.SlovakiaCode128PaymentRecognizer | null = null;
    skDataMatrixRecognizer: PhotoPaySDK.SlovakiaDataMatrixPaymentRecognizer | null = null;
    skQrCodeRecognizer: PhotoPaySDK.SlovakiaQrCodePaymentRecognizer | null = null;
    sloQrCodeRecognizer: PhotoPaySDK.SloveniaQrCodePaymentRecognizer | null = null;
    swissQrCodeRecognizer: PhotoPaySDK.SwitzerlandQrCodePaymentRecognizer | null = null;

    videoRecognitionMode: PhotoPaySDK.VideoRecognitionMode = PhotoPaySDK.VideoRecognitionMode.Recognition;

    constructor( sdk: PhotoPaySDK.WasmSDK )
    {
        this.sdk = sdk;

        // Register helper elements
        this.cameraFeed = document.getElementById( "camera-feed" ) as HTMLVideoElement;
        this.cameraFeedback = document.getElementById( "camera-feedback" ) as HTMLCanvasElement;
        this.feedbackDrawContext = this.cameraFeedback.getContext( "2d" ) as CanvasRenderingContext2D;
        this.cameraScan = document.getElementById( "camera-scan" ) as HTMLDivElement;
        this.fileScan = document.getElementById( "file-scan" ) as HTMLDivElement;
        this.doCameraScanBtn = document.getElementById( "doCameraScan" ) as HTMLButtonElement;
        this.doFileScanBtn = document.getElementById( "doFileScan" ) as HTMLButtonElement;

        this.imageElement = document.getElementById( "imageToProcess" ) as HTMLImageElement;
        this.recognizers = document.getElementById( "recognizers" ) as HTMLDivElement;
        this.results = document.getElementById( "results" ) as HTMLDivElement;

        this.messages = document.getElementById( "messages" ) as HTMLDivElement;
        this.scanAgainBtn = document.getElementById( "scan-again" ) as HTMLButtonElement;
        this.cancelVideoScanBtn = document.getElementById( "cancel-video-scan" ) as HTMLButtonElement;

        this.scanAgainBtn.addEventListener( "click", ev =>
        {
            ev.preventDefault();
            this.resetUI();
        } );

        this.cancelVideoScanBtn.addEventListener( "click", async ev =>
        {
            ev.preventDefault();
            await this.terminateRecognizerRunner();
            this.stopCamera();

            this.resetUI();
        } );
    }

    get allRecognizers()
    {
        return [
            this.ausQRCodeRecognizer,
            this.croPdf417Recognizer,
            this.croQRRecognizer,
            this.czQRRecognizer,
            this.deQRRecognizer,
            this.kosCode128Recognizer,
            this.sepaQRRecognizer,
            this.serbPDF417Recognizer,
            this.serbQRRecognizer,
            this.skCode128Recognizer,
            this.skDataMatrixRecognizer,
            this.skQrCodeRecognizer,
            this.sloQrCodeRecognizer,
            this.swissQrCodeRecognizer
        ];
    }

    resetUI()
    {
        this.doCameraScanBtn.hidden = false;
        this.doFileScanBtn.hidden = false;
        this.recognizers.hidden = false;
        this.fileScan.hidden = true;
        this.cameraScan.hidden = true;
        this.results.hidden = true;
    }

    async initRecognizerRunner(callbacks: PhotoPaySDK.MetadataCallbacks)
    {
        this.recognizerRunner = await this.createRecognizerRunner( callbacks );

        this.recognizers.hidden = true;
        this.messages.hidden = true;
    }

    async createRecognizerRunner( callbacks: PhotoPaySDK.MetadataCallbacks )
    {
        const recognizerArray = [];
        for ( const recognizer of this.allRecognizers )
        {
            if ( recognizer )
            {
                recognizerArray.push( recognizer );
            }
        }

        return PhotoPaySDK.createRecognizerRunner( this.sdk, recognizerArray, true, callbacks );
    }

    async delete()
    {
        for ( const recognizer of this.allRecognizers )
        {
            if ( recognizer ) await recognizer.delete();
        }
    }

    async terminateRecognizerRunner()
    {
        if ( this.recognizerRunner )
        {
            await this.recognizerRunner.delete();
            this.recognizerRunner = null;
        }
    }

    async toggleRecognizer
    (
        checboxName: string,
        recognizerVariable: string,
        creatorFunc: ( mbWasmSDK: PhotoPaySDK.WasmSDK ) => Promise< PhotoPaySDK.Recognizer >
    )
    {
        const recognizerEnabled = this.checkBoxValue( checboxName );
        if ( recognizerEnabled )
        {
            (this as any)[ recognizerVariable ] = await creatorFunc( this.sdk );
        }
        else
        {
            (this as any)[ recognizerVariable ].delete();
            (this as any)[ recognizerVariable ] = null;
        }
    }

    checkBoxValue( elementName: string ): boolean
    {
        return ( document.getElementById( elementName ) as HTMLInputElement ).checked;
    }

    async toggleAustriaQRCodeRecognizer   () { this.toggleRecognizer( "ausQRRecognizerEnabled"       , "ausQRCodeRecognizer"   , PhotoPaySDK.createAustriaQrCodePaymentRecognizer       ); }
    async toggleCroatianPDF417Recognizer  () { this.toggleRecognizer( "croPDF417RecognizerEnabled"   , "croPdf417Recognizer"   , PhotoPaySDK.createCroatiaPdf417PaymentRecognizer       ); }
    async toggleCroatianQRCodeRecognizer  () { this.toggleRecognizer( "croQRRecognizerEnabled"       , "croQRRecognizer"       , PhotoPaySDK.createCroatiaQrCodePaymentRecognizer       ); }
    async toggleCzechQRCodeRecognizer     () { this.toggleRecognizer( "czQRRecognizerEnabled"        , "czQRRecognizer"        , PhotoPaySDK.createCzechiaQrCodePaymentRecognizer       ); }
    async toggleGermanQRCodeRecognizer    () { this.toggleRecognizer( "deQRRecognizerEnabled"        , "deQRRecognizer"        , PhotoPaySDK.createGermanyQrCodePaymentRecognizer       ); }
    async toggleKosovoCode128Recognizer   () { this.toggleRecognizer( "kosCode128RecognizerEnabled"  , "kosCode128Recognizer"  , PhotoPaySDK.createKosovoCode128PaymentRecognizer       ); }
    async toggleSEPAQRRecognizer          () { this.toggleRecognizer( "sepaQRRecognizerEnabled"      , "sepaQRRecognizer"      , PhotoPaySDK.createSepaQrCodePaymentRecognizer          ); }
    async toggleSerbiaPdf417Recognizer    () { this.toggleRecognizer( "serbPDF417RecognizerEnabled"  , "serbPDF417Recognizer"  , PhotoPaySDK.createSerbiaPdf417PaymentRecognizer        ); }
    async toggleSerbiaQRRecognizer        () { this.toggleRecognizer( "serbQRCodeRecognizerEnabled"  , "serbQRRecognizer"      , PhotoPaySDK.createSerbiaQrCodePaymentRecognizer        ); }
    async toggleSlovakCode128Recognizer   () { this.toggleRecognizer( "skCode128RecognizerEnabled"   , "skCode128Recognizer"   , PhotoPaySDK.createSlovakiaCode128PaymentRecognizer     ); }
    async toggleSlovakDataMatrixRecognizer() { this.toggleRecognizer( "skDataMatrixRecognizerEnabled", "skDataMatrixRecognizer", PhotoPaySDK.createSlovakiaDataMatrixPaymentRecognizer  ); }
    async toggleSlovakQRRecognizer        () { this.toggleRecognizer( "skQRRecognizerEnabled"        , "skQrCodeRecognizer"    , PhotoPaySDK.createSlovakiaQrCodePaymentRecognizer      ); }
    async toggleSlovenianQRRecognizer     () { this.toggleRecognizer( "sloQRRecognizerEnabled"       , "sloQrCodeRecognizer"   , PhotoPaySDK.createSloveniaQrCodePaymentRecognizer      ); }
    async toggleSwissQRRecognizer         () { this.toggleRecognizer( "swissQRRecognizerEnabled"     , "swissQrCodeRecognizer" , PhotoPaySDK.createSwitzerlandQrCodePaymentRecognizer   ); }

    async printResults( processResult: any )
    {
        return new Promise( async (resolve, reject) => {
            if ( processResult !== PhotoPaySDK.RecognizerResultState.Empty )
            {
                const recArray = this.allRecognizers;
                for ( const recItem of recArray )
                {
                    if ( recItem !== null )
                    {
                        const recognizer = recItem;
                        const result = await recognizer.getResult();
                        console.log( result );
                        // skip empty results
                        if ( result.state !== PhotoPaySDK.RecognizerResultState.Empty )
                        {
                            this.recognizers.hidden = true;
                            this.results.hidden = false;
                            ( document.querySelector( "#results textarea" ) as HTMLTextAreaElement ).value = JSON.stringify( result, null, 2 );
                            resolve(result);
                        }
                    }
                }
            }
            else
            {
                this.recognizers.hidden = true;
                this.results.hidden = false;
                const result = "Recognition was not successful or cancelled!";
                ( document.querySelector( "#results textarea" ) as HTMLTextAreaElement ).value = JSON.stringify( result, null, 2 );
                reject(result);
            }
        });
    }

    atLeastOneEnabled()
    {
        for ( const recognizer of this.allRecognizers )
        {
            if ( recognizer !== null ) return true;
        }

        return false;
    }

    // Processing with camera
    async recognizeWithCamera()
    {
        this.doCameraScanBtn.hidden = true;
        this.doFileScanBtn.hidden = true;
        // Optional: create a callbacks object that will receive recognition events, such as detected object location etc.
        const callbacks = 
        {
            /*
            onDetectionFailed: () => 
            {
                console.log( "Detection has failed!" );
                this.clearDrawCanvas();
            },
            onPointsDetection: ( pointSet ) =>
            {
                this.drawPoints( pointSet );
            }
            */
        };

        await this.initRecognizerRunner(callbacks);

        try
        {
            this.clearDrawCanvas();

            if ( !this.recognizerRunner )
            {
                return;
            }

            this.videoRecognizer = await PhotoPaySDK.VideoRecognizer.createVideoRecognizerFromCameraStream
            (
                this.cameraFeed,
                this.recognizerRunner
            );

            await this.videoRecognizer.setVideoRecognitionMode( this.videoRecognitionMode );

            // use simple promise-based API for one-shot recognition
            const processResult = await this.videoRecognizer.recognize();

            await this.printResults( processResult );

            await this.terminateRecognizerRunner();
            this.stopCamera();
        }
        catch( error )
        {
            if ( error instanceof PhotoPaySDK.VideoRecognizerError && error.name === "VideoRecognizerError" )
            {
                const reason = ( error ).reason;
                switch ( reason )
                {
                    case PhotoPaySDK.NotSupportedReason.MediaDevicesNotSupported:
                        this.cameraScan.hidden = true;
                        alert( "No support for media devices!" );
                        break;
                    case PhotoPaySDK.NotSupportedReason.CameraNotFound:
                        this.messages.innerHTML += "<br/> Camera not found!";
                        break;
                    case PhotoPaySDK.NotSupportedReason.CameraNotAllowed:
                        this.messages.innerHTML += "<br/> Camera not allowed!";
                        break;
                    default:
                        this.messages.innerHTML += "<br/> Unable to access camera!";
                }

                console.log( error.name, "[" + reason + "]:", error.message );

                await this.terminateRecognizerRunner();

                this.stopCamera();
            }
            else
            {
                throw error;
            }
        }
    }

    cancelCameraRecognition()
    {
        if ( this.videoRecognizer )
            this.videoRecognizer.cancelRecognition();
        else
            this.stopCamera();
    }

    stopCamera()
    {
        if ( this.videoRecognizer !== null )
        {
            this.videoRecognizer.releaseVideoFeed();
            this.videoRecognizer = null;
        }

        this.cameraScan.hidden = true;
    }

    /**
     * Scan images and extract information - this is more compact example than the previous one which uses
     * web camera.
     */
    async processFiles( fileList: FileList )
    {
        let file = null;
        const imageRegex = RegExp( /^image\// );
        for ( let i = 0; i < fileList.length; ++i )
        {
            if ( imageRegex.exec( fileList[ i ].type ) )
            {
                file = fileList[ i ];
            }
        }

        if ( file !== null )
        {
            this.doFileScanBtn.hidden = true;
            this.doCameraScanBtn.hidden = true;

            // Optional: create a callbacks object that will receive recognition events, such as detected object location etc.
            const callbacks = 
            {
                onDetectionFailed: () => 
                {
                    console.log( "Detection has failed!" );
                }
            };

            await this.initRecognizerRunner(callbacks);

            this.imageElement.src = URL.createObjectURL( file );
            await this.imageElement.decode();

            const imageFrame = PhotoPaySDK.captureFrame( this.imageElement );
            if ( !this.recognizerRunner )
            {
                return;
            }

            const processResult = await this.recognizerRunner.processImage( imageFrame );
            await this.printResults( processResult );
            await this.terminateRecognizerRunner();

            this.fileScan.hidden = true;
        }
    }

    /* Auxiliary methods for scan feedback during camera scanning */
    drawPoints( pointSet: PhotoPaySDK.DisplayablePoints )
    {
        this.setupColor( pointSet );

        const ctx = this.feedbackDrawContext;
        this.applyTransform( ctx, pointSet.transformMatrix );
        for ( const point of pointSet.points )
        {
            ctx.beginPath();
            ctx.arc( point.x, point.y, 10, 0, 2 * Math.PI );
            ctx.fill();
        }
    }

    applyTransform( ctx: CanvasRenderingContext2D, transformMatrix: Float32Array )
    {
        const canvasAR = this.cameraFeedback.width / this.cameraFeedback.height;
        const videoAR = this.cameraFeed.videoWidth / this.cameraFeed.videoHeight;

        let xOffset = 0;
        let yOffset = 0;
        let scaledVideoHeight = 0
        let scaledVideoWidth = 0

        if (canvasAR > videoAR)
        {
            // pillarboxing: https://en.wikipedia.org/wiki/Pillarbox
            scaledVideoHeight = this.cameraFeedback.height;
            scaledVideoWidth = videoAR * scaledVideoHeight;
            xOffset = ( this.cameraFeedback.width - scaledVideoWidth ) / 2.0;
        }
        else
        {
            // letterboxing: https://en.wikipedia.org/wiki/Letterboxing_(filming)
            scaledVideoWidth = this.cameraFeedback.width;
            scaledVideoHeight = scaledVideoWidth / videoAR;
            yOffset = ( this.cameraFeedback.height - scaledVideoHeight ) / 2.0;
        }

        // first transform canvas for offset of video preview within the HTML video element (i.e. correct letterboxing or pillarboxing)
        ctx.translate( xOffset, yOffset );
        // second, scale the canvas to fit the scaled video
        ctx.scale
        (
            scaledVideoWidth / this.cameraFeed.videoWidth,
            scaledVideoHeight / this.cameraFeed.videoHeight
        );

        // finally, apply transformation from image coordinate system to
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
        ctx.transform
        (
            transformMatrix[0],
            transformMatrix[3],
            transformMatrix[1],
            transformMatrix[4],
            transformMatrix[2],
            transformMatrix[5]
        );
    }

    clearDrawCanvas()
    {
        this.cameraFeedback.width = this.cameraFeedback.clientWidth;
        this.cameraFeedback.height = this.cameraFeedback.clientHeight;

        this.feedbackDrawContext.clearRect
        (
            0,
            0,
            this.cameraFeedback.width,
            this.cameraFeedback.height
        );
    }

    setupColor( displayable: PhotoPaySDK.Displayable )
    {
        const ctx = this.feedbackDrawContext;

        let color = "#FFFF00FF";

        if (displayable.detectionStatus === 0)
        {
            color = "#FF0000FF";
        }
        else if (displayable.detectionStatus === 1)
        {
            color = "#00FF00FF";
        }

        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
    }
}

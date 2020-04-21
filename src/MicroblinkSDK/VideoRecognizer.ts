import
{
    RecognizerRunner,
    RecognizerResultState
} from './DataStructures'
import { captureFrame } from './FrameCapture'

/**
 * Preferred type of camera to be used when opening the camera feed.
 */
export enum PreferredCameraType
{
    /** Prefer back facing camera */
    BackFacingCamera,
    /** Prefer front facing camera */
    FrontFacingCamera
}

/**
 * Explanation why VideoRecognizer has failed to open the camera feed.
 */
export enum NotSupportedReason
{
    /** navigator.mediaDevices.getUserMedia is not supported by current browser for current context. */
    MediaDevicesNotSupported = "MediaDevicesNotSupported",
    /** Camera with requested features is not available on current device. */
    CameraNotFound = "CameraNotFound",
    /** Camera access was not granted by the user. */
    CameraNotAllowed = "CameraNotAllowed",
    /** Unable to start playing because camera is already in use. */
    CameraInUse = "CameraInUse",
    /** Camera is currently not available due to a OS or hardware error. */
    CameraNotAvailable = "CameraNotAvailable"
};

/**
 * The error object thrown when VideoRecognizer fails to open the camera feed.
 */
export class VideoRecognizerError extends Error
{
    /** The reason why opening the camera failed. */
    readonly reason: NotSupportedReason;

    constructor( reason: NotSupportedReason, ...params: any[] )
    {
        super( ...params );
        this.reason = reason;
        this.name = "VideoRecognizerError";
    }
}

/**
 * Indicates mode of recognition in VideoRecognizer.
 */
export enum VideoRecognitionMode
{
    /** Normal recognition */
    Recognition,
    /** Will perform indefinite scan. Useful for profiling the performance of scan (using onDebugText metadata callback) */
    RecognitionTest,
    /** Will perform only detection. Useful for profiling the performance of detection (using onDebugText metadata callback) */
    DetectionTest
}

/**
 * Invoked when VideoRecognizer finishes the recognition of the video stream.
 * @param recognitionState The state of recognition after finishing. If RecognizerResultState.Empty or
 *                         RecognizerResultState.Empty are returned, this indicates that the scanning
 *                         was cancelled or timeout has been reached.
 */
export type OnScanningDone = ( recognitionState: RecognizerResultState ) => void;

/**
 * A wrapper around RecognizerRunner that can use it to perform recognition of video feeds - either from live camera or from predefined video file.
 */
export class VideoRecognizer
{
    /**
     * Creates a new VideoRecognizer by opening a camera stream and attaching it to given HTMLVideoElement. If camera cannot be accessed,
     * the returned promise will be rejected.
     * @param cameraFeed HTMLVideoELement to which camera stream should be attached
     * @param recognizerRunner RecognizerRunner that should be used for video stream recognition.
     * @param preferredCameraType Whether back facing or front facing camera is preferred. Obeyed only if there is a choice (i.e. if device has only front-facing camera, the opened camera will be a front-facing camera, regardless of preference)
     */
    static async createVideoRecognizerFromCameraStream( cameraFeed: HTMLVideoElement, recognizerRunner: RecognizerRunner, preferredCameraType: PreferredCameraType = PreferredCameraType.BackFacingCamera ): Promise< VideoRecognizer >
    {
        return new Promise< VideoRecognizer >
        (
            async ( resolve: any, reject: any ) =>
            {
                if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia )
                {
                    try
                    {
                        const selectedCamera = await selectCamera( preferredCameraType );
                        if ( selectedCamera == null )
                        {
                            reject( new VideoRecognizerError( NotSupportedReason.CameraNotFound ) );
                            return;
                        }

                        const constraints: MediaStreamConstraints =
                        {
                            audio: false,
                            video:
                            {
                                width:
                                {
                                    min: 640,
                                    ideal: 1920,
                                    max: 1920
                                },
                                height:
                                {
                                    min: 480,
                                    ideal: 1080,
                                    max: 1080
                                }
                            }
                        };
                        if ( selectedCamera.deviceId === "" )
                        {
                            ( constraints.video as MediaTrackConstraints ).facingMode =
                            {
                                ideal: preferredCameraType === PreferredCameraType.BackFacingCamera ? "environment" : "user"
                            }
                        }
                        else
                        {
                            ( constraints.video as MediaTrackConstraints ).deviceId =
                            {
                                exact: selectedCamera.deviceId
                            }
                        }

                        const stream = await navigator.mediaDevices.getUserMedia( constraints );
                        cameraFeed.controls = false;
                        cameraFeed.srcObject = stream;
                        // mirror the camera view for front-facing camera
                        if ( selectedCamera.facing == PreferredCameraType.FrontFacingCamera )
                        {
                            cameraFeed.style.transform = "scaleX(-1)";
                        }
                        // TODO: await maybe not needed here
                        await recognizerRunner.setCameraPreviewMirrored( selectedCamera.facing == PreferredCameraType.FrontFacingCamera );
                        resolve( new VideoRecognizer( cameraFeed, recognizerRunner ) );
                    }
                    catch( error )
                    {
                        let errorReason = NotSupportedReason.CameraInUse;
                        switch( error.name )
                        {
                            case 'NotFoundError':
                            case 'OverconstrainedError':
                                errorReason = NotSupportedReason.CameraNotFound;
                                break;
                            case 'NotAllowedError':
                            case 'SecurityError':
                                errorReason = NotSupportedReason.CameraNotAllowed;
                                break;
                            case 'AbortError':
                            case 'NotReadableError':
                                errorReason = NotSupportedReason.CameraNotAvailable;
                                break;
                            case 'TypeError': // this should never happen. If it does, rethrow it
                                throw error;
                        }
                        reject( new VideoRecognizerError( errorReason, error.message ) );
                    }
                }
                else
                {
                    reject( new VideoRecognizerError( NotSupportedReason.MediaDevicesNotSupported ) );
                }
            }
        );
    }

    /**
     * Creates a new VideoRecognizer by attaching the given URL to video to given HTMLVideoElement and using it to display video frames while
     * processing them.
     * @param videoPath URL of the video file that should be recognized.
     * @param videoFeed HTMLVideoElement to which video file will be attached
     * @param recognizerRunner RecognizerRunner that should be used for video stream recognition.
     */
    static async createVideoRecognizerFromVideoPath( videoPath: string, videoFeed: HTMLVideoElement, recognizerRunner: RecognizerRunner ): Promise< VideoRecognizer >
    {
        return new Promise
        (
            ( resolve: any ) =>
            {
                videoFeed.src = videoPath;
                videoFeed.currentTime = 0;
                videoFeed.onended = () =>
                {
                    videoRecognizer.cancelRecognition();
                };
                const videoRecognizer = new VideoRecognizer( videoFeed, recognizerRunner );
                resolve( videoRecognizer );
            }
        );
    }

    /**
     * Sets the video recognition mode to be used.
     * @param videoRecognitionMode the video recognition mode to be used.
     */
    async setVideoRecognitionMode( videoRecognitionMode: VideoRecognitionMode )
    {
        this.videoRecognitionMode = videoRecognitionMode;
        await this.recognizerRunner.setDetectionOnlyMode( this.videoRecognitionMode === VideoRecognitionMode.DetectionTest );
    }

    /**
     * Starts the recognition of the video stream associated with this VideoRecognizer. The stream will be
     * unpaused and recognition loop will start. After recognition completes, a onScanningDone callback will be invoked
     * with state of the recognition.
     * NOTE: As soon as the execution of the callback completes, the recognition loop will continue and recognition state
     *       will be retained. To clear the recognition state, use resetRecognizers (within your callback). To pause the recognition
     *       loop, use pauseRecognition (within your callback) - to resume it later use resumeRecognition. To completely stop the
     *       recognition and video feed, while keeping the ability to use this VideoRecognizer later, use pauseVideoFeed. To
     *       completely stop the recognition and video feed and release all the resources involved with video stream, use releaseVideoFeed.
     * @param onScanningDone Callback that will be invoked when recognition completes.
     * @param recognitionTimeoutMs Amount of time before returned promise will be resolved regardless of whether recognition was successful or not.
     */
    startRecognition( onScanningDone: OnScanningDone, recognitionTimeoutMs: number = 30000 ): void
    {
        if ( this.videoFeed == null )
        {
            throw new Error( 'The associated video feed has been released!' );
        }
        if ( !this.videoFeed.paused )
        {
            throw new Error( 'The associated video feed is not paused. Use resumeRecognition instead!' );
        }

        this.cancelled = false;
        this.recognitionPaused = false;
        this.clearTimeout();
        this.recognitionTimeoutMs = recognitionTimeoutMs;
        this.onScanningDone = onScanningDone;
        this.recognizerRunner.setClearTimeoutCallback( { onClearTimeout: () => this.clearTimeout() } );
        this.videoFeed.play().then
        (
            () => this.playPauseEvent(),
            () =>
            {
                alert( "Auto-play prevented by browser security rules! Please start video manually!" );
                this.videoFeed!.controls = true;
                this.videoFeed!.addEventListener( 'play' , () => this.playPauseEvent() );
                this.videoFeed!.addEventListener( 'pause', () => this.playPauseEvent() );
            }
        );
    }

    /**
     * Performs the recognition of the video stream associated with this VideoRecognizer. The stream will be
     * unpaused, recognition will be performed and promise will be resolved with recognition status. After
     * the resolution of returned promise, the video stream will be paused, but not released. To release the
     * stream, use function releaseVideoFeed.
     * This is a simple version of startRecognition that should be used for most cases, like when you only need
     * to perform one scan per video session.
     * @param recognitionTimeoutMs Amount of time before returned promise will be resolved regardless of whether recognition was successful or not.
     */
    async recognize( recognitionTimeoutMs: number = 30000 ): Promise< RecognizerResultState >
    {
        return new Promise
        (
            ( resolve: ( recognitionStatus: RecognizerResultState ) => void, reject: any) =>
            {
                try
                {
                    this.startRecognition
                    (
                        ( recognitionState: RecognizerResultState ) =>
                        {
                            this.pauseVideoFeed();
                            resolve( recognitionState );
                        },
                        recognitionTimeoutMs
                    );
                }
                catch ( error )
                {
                    reject( error );
                }
            }
        );
    }

    /**
     * Cancels current ongoing recognition. Note that after cancelling the recognition, the callback given to
     * startRecognition will be immediately called. This also means that the promise returned from method
     * recognize will be resolved immediately.
     */
    cancelRecognition()
    {
        this.cancelled = true;
    }

    /**
     * Pauses the video feed. You can resume the feed by calling recognize or startRecognition.
     * Note that this pauses both the camera feed and recognition. If you just want to pause
     * recognition, while keeping the camera feed active, call method pauseRecognition.
     */
    pauseVideoFeed()
    {
        this.pauseRecognition();
        this.videoFeed!.pause();
    }

    /**
     * Pauses the recognition. This means that video frames that arrive from given video source
     * will not be recognized. To resume recognition, call resumeRecognition(boolean).
     * Unlike cancelRecognition, the callback given to startRecognition will not be invoked after pausing
     * the recognition (unless there is already processing in-flight that may call the callback just before
     * pausing the actual recognition loop).
     */
    pauseRecognition()
    {
        this.recognitionPaused = true;
    }

    /**
     * Convenience method for invoking resetRecognizers on associated RecognizerRunner.
     * @param hardReset Same as in RecognizerRunner.resetRecognizers.
     */
    async resetRecognizers( hardReset: boolean )
    {
        await this.recognizerRunner.resetRecognizers( hardReset );
    }

    /**
     * Convenience method for accessing RecognizerRunner associated with this VideoRecognizer.
     * Sometimes it's useful to reconfigure RecognizerRunner while handling onScanningDone callback
     * and this method makes that much more convenient.
     */
    getRecognizerRunner(): RecognizerRunner
    {
        return this.recognizerRunner;
    }

    /**
     * Resumes the recognition. The video feed must not be paused. If it is, an error will be thrown.
     * If video feed is paused, you should use recognize or startRecognition methods.
     * @param resetRecognizers Indicates whether resetRecognizers should be invoked while resuming the recognition
     */
    resumeRecognition( resetRecognizers: boolean )
    {
        this.cancelled = false;
        this.timedOut = false;
        this.recognitionPaused = false;
        if ( this.videoFeed!.paused )
        {
            throw new Error( "Cannot resume recognition while video feed is paused! You need to use recognize or startRecognition" );
        }
        setTimeout
        (
            async () =>
            {
                if ( resetRecognizers ) await this.resetRecognizers( true );
                this.recognitionLoop();
            },
            1
        );
    }

    /**
     * Stops all media stream tracks associated with current HTMLVideoElement and removes any references to it.
     * Note that after calling this method you can no longer use this VideoRecognizer for recognition.
     * This method should be called after you no longer plan on performing video recognition to let browser know
     * that it can release resources related to any media streams used.
     */
    releaseVideoFeed()
    {
        if ( this.videoFeed != null )
        {
            if ( this.videoFeed.srcObject != null )
            {
                if ( !this.videoFeed.paused ) this.cancelRecognition();
                ( this.videoFeed.srcObject as MediaStream ).getTracks().forEach( track => track.stop() );
                this.videoFeed.srcObject = null;
            }
            this.videoFeed = null;
        }
    }

/***************************************************************************************************************************
 * PRIVATE AREA
 ***************************************************************************************************************************/

    private videoFeed: HTMLVideoElement | null = null;
    private recognizerRunner: RecognizerRunner;
    private cancelled: boolean = false;
    private timedOut: boolean = false;
    private recognitionPaused: boolean = false;
    private recognitionTimeoutMs: number = 30000;
    private timeoutID: number = 0;
    private videoRecognitionMode: VideoRecognitionMode = VideoRecognitionMode.Recognition;
    private onScanningDone: OnScanningDone | null = null;

    private constructor( videoFeed: HTMLVideoElement, recognizerRunner: RecognizerRunner )
    {
        this.videoFeed = videoFeed;
        this.recognizerRunner = recognizerRunner;
    }

    private playPauseEvent()
    {
        if ( this.videoFeed!.paused )
            this.cancelRecognition();
        else
            this.resumeRecognition( true );
    }

    private async recognitionLoop()
    {
        // const capBegin = performance.now();
        const cameraFrame = captureFrame( this.videoFeed! );
        // const capEnd = performance.now();
        // console.log( "Frame capture took " + ( capEnd - capBegin ) + " ms" );
        // const procBegin = performance.now();
        const processResult = await this.recognizerRunner.processImage( cameraFrame );
        // const procEnd = performance.now();
        // console.log( "Wasm process took " + ( procEnd - procBegin ) + " ms" );
        if ( processResult == RecognizerResultState.Valid || this.cancelled || this.timedOut )
        {
            if ( this.videoRecognitionMode == VideoRecognitionMode.Recognition || this.cancelled )
            {
                // valid results, clear the timeout and invoke the callback
                this.clearTimeout();
                this.onScanningDone!( processResult );
                // after returning from callback, resume scanning if not paused
            }
            else
            {
                // in test mode - reset the recognizers and continue the loop indefinitely
                await this.recognizerRunner.resetRecognizers( true );
                // clear any time outs
                this.clearTimeout();
            }
        }
        else if ( processResult != RecognizerResultState.Empty )
        {
            if ( this.timeoutID == 0 )
            {
                // first non-empty result - start timeout
                this.timeoutID = window.setTimeout
                (
                    () => { this.timedOut = true; },
                    this.recognitionTimeoutMs
                );
            }
        }
        if ( !this.recognitionPaused )
        {
            // ensure browser events are processed and then recognize another frame
            setTimeout( () => { this.recognitionLoop(); }, 1 );
        }
    }

    private clearTimeout()
    {
        if ( this.timeoutID > 0 )
        {
            window.clearTimeout( this.timeoutID );
            this.timeoutID = 0;
        }
    }
}

// inspired by https://unpkg.com/browse/scandit-sdk@4.6.1/src/lib/cameraAccess.ts
const backCameraKeywords: string[] = [
    "rear",
    "back",
    "rück",
    "arrière",
    "trasera",
    "trás",
    "traseira",
    "posteriore",
    "后面",
    "後面",
    "背面",
    "后置", // alternative
    "後置", // alternative
    "背置", // alternative
    "задней",
    "الخلفية",
    "후",
    "arka",
    "achterzijde",
    "หลัง",
    "baksidan",
    "bagside",
    "sau",
    "bak",
    "tylny",
    "takakamera",
    "belakang",
    "אחורית",
    "πίσω",
    "spate",
    "hátsó",
    "zadní",
    "darrere",
    "zadná",
    "задня",
    "stražnja",
    "belakang",
    "बैक"
  ];

function isBackCameraLabel( label: string ): boolean
{
    const lowercaseLabel = label.toLowerCase();

    return backCameraKeywords.some( keyword => lowercaseLabel.includes( keyword ) );
}

class SelectedCamera {
    readonly deviceId: string;
    readonly groupId: string;
    readonly facing: PreferredCameraType;
    readonly label: string;

    constructor( mdi: MediaDeviceInfo, facing: PreferredCameraType )
    {
        this.deviceId = mdi.deviceId;
        this.facing = facing;
        this.groupId = mdi.groupId;
        this.label = mdi.label;
    }
}

async function selectCamera( preferredCameraType: PreferredCameraType ): Promise< SelectedCamera | null >
{
    let frontCameras: SelectedCamera[] = [];
    let backCameras: SelectedCamera[] = [];

    {
        let devices = await navigator.mediaDevices.enumerateDevices();
        // if permission is not given, label of video devices will be empty string
        if ( devices.filter( device => device.kind === 'videoinput' ).every( device => device.label === "" ) )
        {
            const stream = await navigator.mediaDevices.getUserMedia( { video: { facingMode: { ideal: 'environment' } }, audio: false } );

            // enumerate devices again - now the label field should be non-empty, as we have a stream active (even if we didn't get persistent permission for camera)
            devices = await navigator.mediaDevices.enumerateDevices();

            // close the stream, as we don't need it anymore
            stream.getTracks().forEach( track => track.stop() );
        }

        const cameras = devices.filter( device => device.kind === 'videoinput' );
        for ( let i in cameras )
        {
            const camera = cameras[ i ];
            if ( isBackCameraLabel( camera.label ) )
            {
                backCameras.push( new SelectedCamera( camera, PreferredCameraType.BackFacingCamera ) );
            }
            else
            {
                frontCameras.push( new SelectedCamera( camera, PreferredCameraType.FrontFacingCamera ) );
            }
        }
    }
    if ( frontCameras.length > 0 || backCameras.length > 0 )
    {
        // decide from which array the camera will be selected
        let cameraPool: SelectedCamera[] = (backCameras.length > 0 ? backCameras : frontCameras);
        // if there is at least one back facing camera and user prefers back facing camera, use that as a selection pool
        if ( preferredCameraType === PreferredCameraType.BackFacingCamera && backCameras.length > 0 )
        {
            cameraPool = backCameras;
        }
        // if there is at least one front facing camera and user prefers front facing camera, use that as a selection pool
        if ( preferredCameraType === PreferredCameraType.FrontFacingCamera && frontCameras.length > 0 )
        {
            cameraPool = frontCameras;
        }
        // otherwise use whichever pool is non-empty

        // sort camera pool by label
        cameraPool = cameraPool.sort( ( camera1, camera2 ) => camera1.label.localeCompare( camera2.label ) );

        // Check if cameras are labeled with resolution information, take the higher-resolution one in that case
        // Otherwise pick the first camera
        {
            let selectedCameraIndex = 0;

            const cameraResolutions: number[] = cameraPool.map
            (
                camera =>
                {
                    const match = camera.label.match( /\b([0-9]+)MP?\b/i );
                    if (match != null)
                    {
                        return parseInt( match[1], 10 );
                    }
                    else
                    {
                        return NaN;
                    }
                }
            );

            if ( !cameraResolutions.some( cameraResolution => isNaN( cameraResolution ) ) )
            {
                selectedCameraIndex = cameraResolutions.lastIndexOf( Math.max( ...cameraResolutions ) );
            }

            return cameraPool[ selectedCameraIndex ];
        }
    }
    else
    {
        // no cameras available on the device
        return null;
    }
}
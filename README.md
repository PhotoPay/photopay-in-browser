# _PhotoPay_ In-browser SDK

[![Build Status](https://travis-ci.org/PhotoPay/photopay-in-browser.svg?branch=master)](https://travis-ci.org/PhotoPay/photopay-in-browser) [![npm version](https://badge.fury.io/js/%40microblink%2Fphotopay-in-browser-sdk.svg)](https://badge.fury.io/js/%40microblink%2Fphotopay-in-browser-sdk)

_PhotoPay_ In-browser SDK enables you to perform scans of various payment barcodes in your web app, directly within the web browser, without the need for sending the image to servers for processing. You can integrate the SDK into your web app simply by following the instructions below and your web app will be able to scan and process data from the payment barcodes of various national standards. For list of all supported standards, check [this paragraph](#photopay_recognizers).

Using _PhotoPay_ in your web app requires a valid license key. You can obtain a trial license key by registering to [Microblink dashboard](https://microblink.com/login). After registering, you will be able to generate a license key for your web app. The license key is bound to [fully qualified domain name](https://en.wikipedia.org/wiki/Fully_qualified_domain_name) of your web app, so please make sure you enter the correct name when asked. Also, keep in mind that if you plan to serve your web app from different domains, you will need different license keys.

For more information on how to integrate _PhotoPay_ SDK into your web app read the instructions below. Make sure you read the latest [Release notes](Release%20notes.md) for most recent changes and improvements. For a quick demo, check out our [integration sample app](demo).

_PhotoPay_ In-browser SDK is meant to be used natively in a web browser. It will not work correctly within a iOS/Android WebView or NodeJS backend service.

# Table of contents

* [_PhotoPay_ integration instructions](#integration)
    * [Adding _PhotoPay_ as a dependency of your project.](#addingDependency)
    * [Performing your first scan](#firstScan)
    * [Recognizing still images](#stillImagesRecognition)
    * [Optimal deployment of your web app](#deploymentConsiderations)
* [The `Recognizer` concept, `RecognizerRunner` and `VideoRecognizer`](#availableRecognizers)
    * [The `Recognizer` concept](#recognizerConcept)
    * [`RecognizerRunner`](#recognizerRunner)
    * [Performing recognition of video streams using `VideoRecognizer`](#videoRecognizer)
    * [Custom UX with `VideoRecognizer`](#customUXWithVideoRecognizer)
* [Handling processing events with `MetadataCallbacks`](#metadataCallbacks)
* [List of available recognizers](#recognizerList)
    * [Success Frame Grabber Recognizer](#successFrameGrabber)
    * [Barcode recognizer](#barcodeRecognizer)
    * [PhotoPay recognizers](#photopay_recognizers)
        * [SEPA Payment QR code recognizer](#photopay_recognizers_sepa)
    * [Country-specific PhotoPay recognizers](#photopay_recognizers_countries)
        * [Austria](#photopay_recognizers_austria)
        * [Croatia](#photopay_recognizers_croatia)
        * [Czechia](#photopay_recognizers_czechia)
        * [Germany](#photopay_recognizers_germany)
        * [Kosovo](#photopay_recognizers_kosovo)
        * [Serbia](#photopay_recognizers_serbia)
        * [Slovakia](#photopay_recognizers_slovakia)
        * [Slovenia](#photopay_recognizers_slovenia)
        * [Switzerland](#photopay_recognizers_switzerland)
* [Troubleshooting](#troubleshoot)
    * [Integration problems](#integrationProblems)
    * [SDK problems](#sdkProblems)
        * [Licensing problems](#licensingProblems)
        * [Other problems](#otherProblems)
* [FAQ and known issues](#faq)
* [Additional info](#info)


# <a name="integration"></a> _PhotoPay_ integration instructions

This repository contains WebAssembly file and it's support JS files which contains the core implementation of _PhotoPay_ functionalities. In order to make integration of the WebAssembly easier and more developer friendly, a TypeScript support code is also provided, giving a type-safe and easy to use integration API to the developer.

This repository also contains a sample integration app which demonstrates how you can integrate the _PhotoPay_ into your web app.

_PhotoPay_ requires a browser with a support for [WebAssembly](https://webassembly.org), but works best with latest versions of Firefox, Chrome, Safari and Microsoft Edge.

## <a name="addingDependency"></a> Adding _PhotoPay_ as a dependency of your project.

The easiest way to add _PhotoPay_ as a dev-dependency to your project is by using NPM:

```
npm install @microblink/photopay-in-browser-sdk --save-dev
```

or, if you wish to add a local package instead:

```
cd /path/to/SDK/folder
npm install
cd /path/to/your/app/folder
npm install /path/to/SDK/folder --save-dev
```

After adding the _@microblink/photopay-in-browser-sdk_ as your dev-dependency, make sure to include all files from its `build` folder in your distribution. Those files contain compiled WebAssembly module and support JS code for loading it, as well as resources needed for _PhotoPay_ to work.

The example in the [demo app](demo) shows how a [rollup copy plugin](https://www.npmjs.com/package/rollup-plugin-copy) can be used to achieve that. Check the [rollup.config.js](demo/rollup.config.js) from the demo app.

## <a name="firstScan"></a> Performing your first scan

1. First you will need to create an account at [Microblink dashboard](https://microblink.com/login) where you can generate a demo license for your web app. License is bound to [fully qualified domain name](https://en.wikipedia.org/wiki/Fully_qualified_domain_name) of your web app, so please make sure you enter the correct name when asked.

2. Initialize the SDK using following code snippet:

    ```typescript
    import * as MicroblinkSDK from '@microblink/photopay-in-browser-sdk'

    // check if browser is supported
    if ( MicroblinkSDK.isBrowserSupported() ) {
        const loadSettings = new MicroblinkSDK.WasmSDKLoadSettings('your-base64-license-key');

        MicroblinkSDK.loadWasmModule(loadSettings).then(
            (wasmSDK: MicroblinkSDK.WasmSDK) => {
                // The SDK was initialized successfully, save the wasmSDK
                // for future use
            },
            (error: any) => {
                // error happened during initialization of the WASM SDK
                console.log("Error initializing the SDK: " + error);
            }
        )
    } else {
        console.log("This browser is not supported by the SDK");
    }
    ```

3. Create recognizer objects that will perform image recognition, configure them and use them to create a `RecognizerRunner` object:

    ```typescript
    import * as MicroblinkSDK from '@microblink/photopay-in-browser-sdk'

    const recognizer = await MicroblinkSDK.createCroatiaPdf417PaymentRecognizer(wasmSDK);
    const recognizerRunner = await MicroblinkSDK.createRecognizerRunner(wasmSDK, [recognizer], true);
    ```

4. Obtain reference to your HTML video element and create a `VideoRecognizer` using it and your instance of `RecognizerRunner` and use it to process:

    ```typescript
    const cameraFeed = <HTMLVideoElement>document.getElementById('myCameraVideoElement');
    try {
        const videoRecognizer = await MicroblinkSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(cameraFeed, recognizerRunner);
        const processResult = await videoRecognizer.recognize();
        // obtain recognition results (see next step)
    } catch(error) {
        if (error.name === 'VideoRecognizerError') {
            const reason = (error as MicroblinkSDK.VideoRecognizerError).reason;
            // reason is of type MicroblinkSDK.NotSupportedReason and contains
            // information why video recognizer could not be used.
            // Usually this happens when user didn't give permission to
            // use the camera or when a hardware or OS error occurs.
        }
    }
    ```

5. If `processResult` returned from `VideoRecognizer's` method `recognize` is not `MicroblinkSDK.RecognizerResultState.Empty`, then at least one recognizer given to the `RecognizerRunner` above contains a recognition result. You can extract the result from each recognizer using its `getResult` method:

    ```typescript
    if (processResult !== MicroblinkSDK.RecognizerResultState.Empty) {
        const recognitionResult = await recognizer.getResult();
        console.log(recognitionResult);
    } else {
        console.log("Recognition was not successful!");
    }
    ```

6. Finally, release the memory on the WebAssembly heap by calling `delete` method on both `RecognizerRunner` and each of your recognizers. Also, release the camera stream by calling `releaseVideoFeed` on instance of `VideoRecognizer`:

    ```typescript
    videoRecognizer.releaseVideoFeed();
    recognizerRunner.delete();
    recognizer.delete();
    ```

    Note that after releasing those objects it is not valid to call any methods on them, as they are literally destroyed. This is required to release memory resources on WebAssembly heap which are not automatically released with JavaScript's garbage collector. Also note that results returned from `getResult` method are placed on JavaScript's heap and will be cleaned by garbage collector, just like any other normal JavaScript object.

For more information about available recognizers and `RecognizerRunner`, see [RecognizerRunner and available recognizers](#availableRecognizers).

## <a name="stillImagesRecognition"></a> Recognizing still images

If you just want to perform recognition of still images and do not need live camera recognition, you can do that as well.

1. To do that, first initialize recognizers and `RecognizerRunner` just as in the [steps 1-3 above](#firstScan).

2. Make sure you have the image set to a `HTMLImageElement`. If you only have the URL of the image that needs recognizing, You can attach it to the image element with following code snippet:

    ```typescript
    const imageElement = <HTMLImageElement>document.getElementById('imageToProcess');
    imageElement.src = URL.createObjectURL(imageURL);
    await imageElement.decode();
    ```

3. Obtain the `CapturedFrame` object using function `captureFrame` and give it to the `processImage` method of the `RecognizerRunner`:

    ```typescript
    const imageFrame = MicroblinkSDK.captureFrame(imageElement);
    const processResult = await recognizerRunner.processImage(imageFrame);
    ```

4. Proceed as in steps 5. and 6. [above](#firstScan). Note that in there is no `VideoRecognizer` here that needs freeing its resources, but `RecognizerRunner` and recognizers must be deleted using the `delete` method.

## <a name="deploymentConsiderations"></a> Optimal deployment of your web app

When browser loads the `.wasm` file it needs to compile it to the native code. This is unlike javascript code, which is interpreted and compiled to native code only if needed ([JIT, a.k.a. Just-in-time compilation](https://en.wikipedia.org/wiki/Just-in-time_compilation)). Therefore, before _PhotoPay_ is loaded, the browser must download and compile the provided `.wasm` file. In order to make this faster, you should configure your web server to serve `.wasm` files with `Content-Type: application/wasm`. This will instruct the browser that this is a WebAssembly file, which most modern browsers will utilize to perform streaming compilation, i.e. they will start compiling the WebAssembly code as soon as first bytes arrive from the server, instead of waiting for the entire file to download. For more information about streaming compilation, check [this article on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/instantiateStreaming).

If your server supports serving compressed files, you should utilize that to minimize the download size of your web app. It's easy to notice that `.wasm` file is not a small file, but it is very compressible. This is also true for all other files that you need to serve for your web app.

For more information about configuring your web server for using compression and for optimal delivery of your web app that uses _PhotoPay_ SDK, you should also check the [official Emscripten documentation](https://emscripten.org/docs/compiling/Deploying-Pages.html#optimizing-download-sizes).


# <a name="availableRecognizers"></a> The `Recognizer` concept, `RecognizerRunner` and `VideoRecognizer`

This section will first describe [what is a `Recognizer`](#recognizerConcept) and how it should be used to perform recognition of the images, videos and camera stream. Next, we will describe what is a [`RecognizerRunner`](#recognizerRunner) and how it can be used to tweak the recognition procedure. Finally, a [`VideoRecognizer`](#videoRecognizer) will be described and how it builds on top of `RecognizerRunner` in order to provide support for recognizing a video or a camera stream.

## <a name="recognizerConcept"></a> The `Recognizer` concept

The `Recognizer` is the basic unit of processing within the _PhotoPay_ SDK. Its main purpose is to process the image and extract meaningful information from it. As you will see [later](#recognizerList), the _PhotoPay_ SDK has lots of different `Recognizer` objects that have various purposes.

The `Recognizer` is the object on the WebAssembly heap, which means that it will not be automatically cleaned up by the garbage collector once it's not required anymore. Once you are done with using it, you **must** call the `delete` method on it to release the memory on the WebAssembly heap. Failing to do so will result in memory leak on the WebAssembly heap which may result with crash of the browser tab running your web app.

Each `Recognizer` has a `Result` object, which contains the data that was extracted from the image. The `Result` for each specific `Recognizer` can be obtained by calling its `getResult` method, which will return a `Result` object placed on the JS heap, i.e. managed by the garbage collector. Therefore, you don't need to call any delete-like methods on the `Result` object.

Every `Recognizer` is a stateful object that can be in two possible states: _idle state_ and _working state_. While in _idle state_, you are allowed to call method `updateSettings` which will update its properties according to given settings object. At any time, you can call its `currentSettings` method to obtain its currently applied settings object. After you create a `RecognizerRunner` with array containing your recognizer, the state of the `Recognizer` will change to _working state_, in which `Recognizer` object will be used for processing. While being in _working state_, it is not possible to call method `updateSettings` (calling it will crash your web app). If you need to change configuration of your recognizer while its being used, you need to call its `currentSettings` method to obtain its current configuration, update it as you need it, create a new `Recognizer` of the same type, call `updateSettings` on it with your modified configuration and finally replace the original `Recognizer` within the `RecognizerRunner` by calling its `reconfigureRecognizers` method. When written as a pseudocode, this would look like:

```typescript
import * as MicroblinkSDK from '@microblink/photopay-in-browser-sdk'

// assume myRecognizerInUse is used by the recognizerRunner
const currentSettings = await myRecognizerInUse.currentSettings();
// modify currentSettings as you need
let newRecognizer = await MicroblinkSDK.createRecognizer(); // use appropriate recognizer creation function
await newRecognizer.updateSettings(currentSettings);
// reconfigure recognizerRunner
await recognizerRunner.reconfigureRecognizers([newRecognizer], true); // use `true` or `false` depending of what you want to achieve (see below for the description)
// newRecognizer is now in use and myRecognizerInUse is no longer in use -
// you can delete it if you don't need it anymore
await myRecognizerInUse.delete()
```

While `Recognizer` object works, it changes its internal state and its result. The `Recognizer` object's `Result` always starts in `Empty` state. When corresponding `Recognizer` object performs the recognition of given image, its `Result` can either stay in `Empty` state (in case `Recognizer` failed to perform recognition), move to `Uncertain` state (in case `Recognizer` performed the recognition, but not all mandatory information was extracted) or move to `Valid` state (in case `Recognizer` performed recognition and all mandatory information was successfully extracted from the image).

## <a name="recognizerRunner"></a> `RecognizerRunner`

The `RecognizerRunner` is the object that manages the chain of individual `Recognizer` objects within the recognition process. It must be created by `createRecognizerRunner` method of the `WasmModuleProxy` interface, which is a member of `WasmSDK` interface which is resolved in a promise returned by the `loadWasmModule` function you've seen [above](#firstScan). The function requires a two parameters: an array of `Recognizer` objects that will be used for processing and a `boolean` indicating whether multiple `Recognizer` objects are allowed to have their `Results` enter the `Valid` state.

To explain further the `boolean` parameter, we first need to understand how `RecognizerRunner` performs image processing.

When the `processImage` method is called, it processes the image with the first `Recognizer` in chain. If the `Recognizer's` `Result` object changes its state to `Valid`, then if the above `boolean` parameter is `false`, the recognition chain will be broken and promise returned by the method will be immediately resolved. If the above parameter is `true`, then the image will also be processed with other `Recognizer` objects in chain, regardless of the state of their `Result` objects. If, after processing the image with the first `Recognizer` in chain, its `Result` object's state is not changed to `Valid`, the `RecognizerRunner` will use the next `Recognizer` object in chain for processing the image and so on - until the end of the chain (if no results become valid or always if above parameter is `true`) or until it finds the recognizer that has successfully processed the image and changed its `Result's` state to `Valid` (if above parameter is `false`).

You cannot change the order of the `Recognizer` objects within the chain - no matter the order in which you give `Recognizer` objects to `RecognizerRunner` (either to its creation function `createRecognizerRunner` or to its `reconfigureRecognizers` method), they are internally ordered in a way that provides best possible performance and accuracy. Also, in order for _PhotoPay_ SDK to be able to order `Recognizer` objects in recognition chain in the best way possible, it is not allowed to have multiple instances of `Recognizer` objects of the same type within the chain. Attempting to do so will crash your application.

## <a name="videoRecognizer"></a> Performing recognition of video streams using `VideoRecognizer`

Using `RecognizerRunner` directly could be difficult in cases when you want to perform recognition of the video or the live camera stream. Additionally, handling camera management from the web browser can be [sometimes challenging](https://stackoverflow.com/questions/59636464/how-to-select-proper-backfacing-camera-in-javascript). In order to make this much easier, we provided a `VideoRecognizer` class.

To perform live camera recognition using the `VideoRecognizer`, you will need an already set up `RecognizerRunner` object and a reference to `HTMLVideoElement` to which camera stream will be attached.

To perform the recognition, you should simply write:

```typescript
const cameraFeed = <HTMLVideoElement> document.getElementById('cameraFeed');
try {
    const videoRecognizer = await MicroblinkSDK.VideoRecognizer.createVideoRecognizerFromCameraStream(cameraFeed, recognizerRunner);
    const processResult = await videoRecognizer.recognize();
} catch (error) {
    // handle camera error
}
```

The `recognize` method of the `VideoRecognizer` will start the video capture and recognition loop from the camera and will return a `Promise` that will be resolved when either `processImage` of the given `RecognizerRunner` returns `Valid` for some frame or the timeout given to `recognize` method is reached (if no timeout is given, a default one is used).

### Recognizing a video file

If, instead of performing recognition of live video stream, you want to perform recognition of pre-recorded video file, you should simply construct `VideoRecognizer` using a different function, as shown below:

```typescript
const videoRecognizer = await MicroblinkSDK.createVideoRecognizerFromVideoPath(videoPath, htmlVideoElement, recognizerRunner);
const processResult = await videoRecognizer.recognize();
```

## <a name="customUXWithVideoRecognizer"></a> Custom UX with `VideoRecognizer`

The procedure for using `VideoRecognizer` described [above](#videoRecognizer) is quite simple, but has some limits. For example, you can only perform one shot scan with it. As soon as the promise returned by `recognize` method resolves, the camera feed is paused and you need to start new recognition. However, if you need to perform multiple recognitions in single camera session, without pausing the camera preview, you can use the `startRecognition` method, as described in the example below;

```typescript
videoRecognizer.startRecognition
(
    ( recognitionState: MicroblinkSDK.RecognizerResultState ) =>
    {
        // pause recognition before performing any async operation - this will make sure that
        // recognition will not continue while returning the control flow back from this function
        videoRecognizer.pauseRecognition();

        // obtain recognition results directly from recognizers associated with the RecognizerRunner that
        // is associated with the VideoRecognizer

        if ( shouldContinueScanning )
        {
            // resume recognition
            videoRecognizer.resumeRecognition( true );
        }
        else
        {
            // pause the camera feed
            videoRecognizer.pauseVideoFeed();
            // after this line, the VideoRecognizer is in the same state as if promise returned from recognizer was resolved
        }
        // if videoRecognizer is not paused or terminated, after this line the recognition will continue and recognition state
        // will be retained
    }
);
```

# <a name="metadataCallbacks"></a> Handling processing events with `MetadataCallbacks`

Processing events, also known as _Metadata callbacks_ are purely intended for giving processing feedback on UI or to capture some debug information during development of your web app using _PhotoPay_ SDK. Callbacks for all events are bundled into the [MetadataCallbacks](src/MicroblinkSDK/MetadataCallbacks.ts) object. We suggest that you check for more information about available callbacks and events to which you can handle in the [source code of the `MetadataCallbacks` interface](src/MicroblinkSDK/MetadataCallbacks.ts).

You can associate your implementation of `MetadataCallbacks` interface with `RecognizerRunner` either during creation or by invoking its method `setMetadataCallbacks`. Please note that both those methods need to pass information about available callbacks to the native code and for efficiency reasons this is done at the time `setMetadataCallbacks` method is called and **not every time** when change occurs within the `MetadataCallbacks` object. This means that if you, for example, set `onQuadDetection` to `MetadataCallbacks` after you already called `setMetadataCallbacks` method, the `onQuadDetection` will not be registered with the native code and therefore it will not be called.

Similarly, if you, for example, remove the `onQuadDetection` from `MetadataCallbacks` object after you already called `setMetadataCallbacks` method, your app will crash in attempt to invoke non-existing function when our processing code attempts to invoke it. We **deliberately** do not perform null check here because of two reasons:

- it is inefficient
- having no callback, while still being registered to native code is illegal state of your program and it should therefore crash

**Remember**, each time you make some changes to `MetadataCallbacks` object, you need to apply those changes to to your `RecognizerRunner` by calling its `setMetadataCallbacks` method.

# <a name="recognizerList"></a> List of available recognizers

This section will give a list of all `Recognizer` objects that are available within _PhotoPay_ SDK, their purpose and recommendations how they should be used to get best performance and user experience.

## <a name="successFrameGrabber"></a> Success Frame Grabber Recognizer

The [`SuccessFrameGrabberRecognizer`](src/Recognizers/SuccessFrameGrabberRecognizer.ts) is a special `Recognizer` that wraps some other `Recognizer` and impersonates it while processing the image. However, when the `Recognizer` being impersonated changes its `Result` into `Valid` state, the `SuccessFrameGrabberRecognizer` captures the image and saves it into its own `Result` object.

Since `SuccessFrameGrabberRecognizer` impersonates its slave `Recognizer` object, it is not possible to have both concrete `Recognizer` object and `SuccessFrameGrabberRecognizer` that wraps it in the same `RecognizerRunner` at the same time. Doing so will have the same effect as having multiple instances of the same `Recognizer` in the same `RecognizerRunner` - it will crash your application. For more information, see [paragraph about `RecognizerRunner`](#recognizerRunner).

This recognizer is best for use cases when you need to capture the exact image that was being processed by some other `Recognizer` object at the time its `Result` became `Valid`. When that happens, `SuccessFrameGrabber's` `Result` will also become `Valid` and will contain described image. That image will be available in its `successFrame` property.
## <a name="barcodeRecognizer"></a> Barcode recognizer

The `BarcodeRecognizer` is recognizer specialized for scanning various types of barcodes.

As you can see from [its source code](src/Recognizers/BlinkBarcode/BarcodeRecognizer.ts), you can enable multiple barcode symbologies within this recognizer, however keep in mind that enabling more barcode symbologies affects scanning performance - the more barcode symbologies are enabled, the slower the overall recognition performance. Also, keep in mind that some simple barcode symbologies that lack proper redundancy, such as [Code 39](https://en.wikipedia.org/wiki/Code_39), can be recognized within more complex barcodes, especially 2D barcodes, like [PDF417](https://en.wikipedia.org/wiki/PDF417).


## <a name="photopay_recognizers"></a> PhotoPay recognizers

### <a name="photopay_recognizers_sepa"></a> SEPA Payment QR code recognizer

The [`SepaQrCodePaymentRecognizer`](src/Recognizers/PhotoPay/SEPA/SepaQrCodePaymentRecognizer.ts) is used for scanning payment information from SEPA (Single Euro Payments Area) payment QR codes. The recognizer support scanning payment QR codes that are encoded by [standard defined by European Payments Council](https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines-enable-data-capture-initiation).

## <a name="photopay_recognizers_countries"></a> Country-specific PhotoPay recognizers

### <a name="photopay_recognizers_austria"></a> Austria

#### <a name="austria_qr"></a> Austrian payment QR code recognizer

The [`AustriaQrCodePaymentRecognizer`](src/Recognizers/PhotoPay/Austria/AustriaQrCodePaymentRecognizer.ts) is used for scanning payment information from QR code usually found on SEPA payment slips in Austria.

### <a name="photopay_recognizers_croatia"></a> Croatia

#### <a name="croatia_pdf417"></a> Croatian payment PDF417 2D barcode recognizer

The [`CroatiaPdf417PaymentRecognizer`](src/Recognizers/PhotoPay/Croatia/CroatiaPdf417PaymentRecognizer.ts) is used for scanning payment information from PDF417 2D barcode usually found on payment slips. It supports both HUB3 and HUB1 2D barcode standards.

#### <a name="croatia_qr"></a> Croatian payment QR code recognizer

The [`CroatiaQrCodePaymentRecognizer`](src/Recognizers/PhotoPay/Croatia/CroatiaQrCodePaymentRecognizer.html) is used for scanning payment information from QR codes that have content encoded in same format as specified by HUB3 PDF417 2D barcode standard.

### <a name="photopay_recognizers_czechia"></a> Czechia

#### <a name="czechia_qr"></a> Czech payment QR code recognizer

The [`CzechiaQrCodePaymentRecognizer`](src/Recognizers/PhotoPay/Czechia/CzechiaQrCodePaymentRecognizer.ts) is used for scanning payment information from payment QR codes that are usually found on czech payment slips.

### <a name="photopay_recognizers_germany"></a> Germany

#### <a name="germany_qr"></a> German payment QR code recognizer

The [`GermanyQrCodePaymentRecognizer`](src/Recognizers/PhotoPay/Germany/GermanyQrCodePaymentRecognizer.ts) is used for scanning payment information from QR code usually found on SEPA payment slips in Germany.

### <a name="photopay_recognizers_kosovo"></a> Kosovo

#### <a name="kosovo_code128"></a> Kosovo Code 128 recognizer

The [`KosovoCode128PaymentRecognizer`](src/Recognizers/PhotoPay/Kosovo/KosovoCode128PaymentRecognizer.ts) is used for scanning payment information from Code128 1D barcodes usually found on payment slips in Kosovo.

### <a name="photopay_recognizers_serbia"></a> Serbia

#### <a name="serbia_pdf417"></a> Serbian payment PDF417 2D barcode recognizer

The [`SerbiaPdf417PaymentRecognizer`](src/Recognizers/PhotoPay/Serbia/SerbiaPdf417PaymentRecognizer.ts) is used for scanning payment information from PDF417 2D barcode found on some serbian invoices. The Republic of Serbia does not have a national standard for payment slips nor payment barcodes. This recognizer supports scanning PDF417 2D barcodes that are modelled after Croatian HUB3 standard.

#### <a name="serbia_qr"></a> Serbian payment QR code recognizer

The [`SerbiaQrCodePaymentRecognizer`](src/Recognizers/PhotoPay/Serbia/SerbiaQrCodePaymentRecognizer.ts) is used for scanning payment information from QR code found on some serbian invoices. The Republic of Serbia does not have a national standard for payment slips nor payment barcodes. This recognizer supports scanning QR codes that are modelled after Croatian HUB3 standard.

### <a name="photopay_recognizers_slovakia"></a> Slovakia

#### <a name="slovakia_code128"></a> Slovak payment Code 128 recognizer

The [`SlovakiaCode128PaymentRecognizer`](src/Recognizers/PhotoPay/Slovakia/SlovakiaCode128PaymentRecognizer.ts) is used for scanning payment information from Code128 1D barcode usually found on both white and green payment slips in Slovakia.

#### <a name="slovakia_data_matrix"></a> Slovak payment Data Matrix Code recognizer

The [`SlovakiaDataMatrixPaymentRecognizer`](src/Recognizers/PhotoPay/Slovakia/SlovakiaDataMatrixPaymentRecognizer.ts) is used for scanning payment information from Data Matrix 2D barcode usually found on some white payment slips in Slovakia.

#### <a name="slovakia_qr"></a> Slovak payBySquare QR code recognizer

The [`SlovakiaQrCodePaymentRecognizer`](src/Recognizers/PhotoPay/Slovakia/SlovakiaQrCodePaymentRecognizer.ts) is used for scanning payment information from [Slovak pyBySquare](https://bysquare.com/) payment QR code. This recognizer support only scanning the blue (PAY bySquare) QR codes. The orange (INVOICE bySquare) QR codes are not supported by this recognizer.

### <a name="photopay_recognizers_slovenia"></a> Slovenia

#### <a name="slovenia_qr"></a> Slovenian payment QR code recognizer

The [`SloveniaQrCodePaymentRecognizer`](src/Recognizers/PhotoPay/Slovenia/SloveniaQrCodePaymentRecognizer.ts) is used for scanning payment information from payment QR codes usually found on [UPN payment slips](https://www.nlb.si/univerzalni-placilni-nalog) in Slovenia.

### <a name="photopay_recognizers_switzerland"></a> Switzerland

#### <a name="switzerland_qr"></a> Swiss payment QR code recognizer

The [`SwitzerlandQrCodePaymentRecognizer`](src/Recognizers/PhotoPay/Switzerland/SwitzerlandQrCodePaymentRecognizer.ts) is used for scanning payment information from payment QR codes used in Switzerland.
# <a name="troubleshoot"></a> Troubleshooting

## <a name="integrationProblems"></a> Integration problems

In case of problems with the integration of the SDK, first make sure that you have tried integrating the SDK exactly as described [in integration instructions](#firstScan). If you have followed the instructions to the letter and you still have the problems, please contact us at [help.microblink.com](https://help.microblink.com)

## <a name="sdkProblems"></a> SDK problems

In case of problems with using the SDK, you should do as follows:

### <a name="licensingProblems"></a> Licensing problems

If you are getting "invalid license key" error or having other license-related problems (e.g. some feature is not enabled that should be), first check the ADB logcat. All license-related problems are logged to web console so it is easy to determine what went wrong.

When you have to determine what is the license-related problem or you simply do not understand the log, you should contact us [help.microblink.com](http://help.microblink.com). When contacting us, please make sure you provide following information:

* exact fully qualified domain name of your app (i.e. where the app is hosted)
* license that is causing problems
* please stress out that you are reporting problem related to WebAssembly version of the _PhotoPay_ SDK
* if unsure about the problem, you should also provide excerpt from web console containing the license error

### <a name="otherProblems"></a> Other problems

If you are having problems with scanning certain items, undesired behaviour on specific device(s), crashes inside _PhotoPay_ or anything unmentioned, please do as follows:

* Contact us at [help.microblink.com](http://help.microblink.com) describing your problem and provide following information:
	* log from the web console
	* high resolution scan/photo of the item that you are trying to scan
	* information about device and browser that you are using - we need exact version of the browser and operating system it runs on. Also, if it runs on mobile device, we also need the model of the device in question (camera management is specific to both browser, OS and device).
	* please stress out that you are reporting problem related to WebAssembly version of the _PhotoPay_ SDK
# <a name="faq"></a> FAQ and known issues

#### <a name="featureNotSupportedByLicenseKey"></a> After switching from trial to production license I get error `This entity is not allowed by currently active license!` when I create a specific `Recognizer` object.

Each license key contains information about which features are allowed to use and which are not. This error indicates that your production license does not allow using of specific `Recognizer` object. You should contact [support](http://help.microblink.com) to check if provided license is OK and that it really contains all features that you have purchased.

# <a name="info"></a> Additional info
Complete source code of the TypeScript wrapper can be found in [here](src).

For any other questions, feel free to contact us at [help.microblink.com](http://help.microblink.com).

# Release notes

## 7.7.4

### Breaking changes

* We've changed the way how recognizer options are set up when using the UI component
    * You can now specify how a recognizer should behave by using the new `recognizerOptions` property.
    * To see the full list of available recognizer options, as well as examples on how to use them, check out the [relevant source code](ui/src/components/blinkcard-in-browser/blinkcard-in-browser.tsx).

### Performance improvements

* We've added three different flavors of WebAssembly builds to the SDK, to provide better performance across all browsers
    * Unless defined otherwise, the SDK will load the best possible bundle during initialization:
        * `Basic` Same as the existing WebAssembly build, most compatible, but least performant.
        * `Advanced` WebAssembly build that provides better performance but requires a browser with advanced features.
        * `AdvancedWithThreads` Most performant WebAssembly build which requires a proper setup of COOP and COEP headers on the server-side.
    * For more information about different WebAssembly builds and how to use them properly, check out the [relevant section](README.md/#deploymentGuidelines) in our official documentation

### SDK changes

* Constructor of `VideoRecognizer` class is now public

### Camera management updates

* We've enabled camera image flipping
    * Method `flipCamera` has been added to [`VideoRecognizer`](src/MicroblinkSDK/VideoRecognizer.ts).
    * You can now let your users mirror the camera image vertically in case they find it easier to scan that way.
    * By default, the UI component will display a flip icon in the top left corner once the camera is live.
* We've improved camera management on devices with multiple cameras
    * Method `createVideoRecognizerFromCameraStream` has been extended in [`VideoRecognizer` class](src/MicroblinkSDK/VideoRecognizer.ts).
    * Attribute `[camera-id]` has been added to the UI component so that your users can preselect their desired camera.

### Bugfixes

* We fixed the initialization problem that prevented the SDK from loading on iOS 13 and older versions

## 7.7.3

* Fixed NPM package to include UI component.

## 7.7.2

### UI component

* We added a UI component in the format of a custom web element to use BlinkID on your web in an effortless way.
* Check out the [README file](README.md) for instructions on how to use UI component, or check the [ui directory](/ui) for complete source code.

### Minor API changes

* We removed `workerLocation` property from `WasmSDKLoadSettings`.
    * Web worker is now inlined into the source code, which simplifies the SDK deployment and usage.
    * Property `engineLocation` in `WasmSDKLoadSettings` **must** be an absolute path.
    * Removed `useWebWorker` property from `WasmSDKLoadSettings`, since web worker is now always used as it provides much better user experience
      and does not block the UI browser thread.

### Fixes

* We fixed the initialization promise chain so that you can handle all initialization errors with a single error handler.

## 7.7.1

- Removed `alert()` from [VideoRecognizer](src/MicroblinkSDK/VideoRecognizer.ts) and added `allowManualVideoPlayout` to constructor of `VideoRecognizer` class
- Added `locateFile` method to [MicroblinkSDK](src/MicroblinkSDK/MicroblinkSDK.ts) to fix problem when SDK is not using web worker
- File `package.json`
    - Added field `engines` to explicitly specify Node version which was used during development
    - Fixed typo in `repository` field so NPM package can be used with yarn
- Documentation
    - Added more information and renamed section "Optimal deployment of your web app" to "Deployment guidelines"
    - Added links to Codepen examples and official demo app

## 7.7.0

- Standardization of NPM package
    - NPM package can be used in environments with module bundlers
    - Added ES and UMD bundles for the SDK
    - Types are now exposed and accessible in standard manner for NPM environment
    - Extended `package.json` with project information and scripts for building and publishing
    - Added Rollup build system to provide developers with infrastructure for easier customization of SDK
- Extension of examples
    - Examples now cover more functionalities of the SDK
    - Provided examples for integration in TS, ES and UMD environment
- Configuration options for WASM engine and WebWorker locations
    - Configurations `engineLocation` and `workerLocation` are defined in the `WasmSDKLoadSettings` class
- Improved stability and readability of SDK TypeScript source code
    - Added ESLint for automatic check of unsecure language constructs
    - Added Babel for safe transpiling to ES6 and better browser support

## 1.0.0-beta.1

- decreased WASM binary size from 2.3 MB to 1.5 MB
- fixed vulnerability in license check
- added support for disabling hello message after license key gets validated
    - by default this is still enabled, to disable it, set `allowHelloMessage` property in [WasmSDKLoadSettings](src/MicroblinkSDK/WasmLoadSettings.ts) to `false`
- fixed parsing of amount for serbian QR and PDF417 recognizers

## 1.0.0-beta.0

- initial beta release of the PhotoPay In-browser SDK

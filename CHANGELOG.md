# Release notes

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

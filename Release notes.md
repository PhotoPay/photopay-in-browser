# Release notes

## 1.0.0-beta.1

- decreased WASM binary size from 2.3 MB to 1.5 MB
- fixed vulnerability in license check
- added support for disabling hello message after license key gets validated
    - by default this is still enabled, to disable it, set `allowHelloMessage` property in [WasmSDKLoadSettings](src/MicroblinkSDK/WasmLoadSettings.ts) to `false`
- fixed parsing of amount for serbian QR and PDF417 recognizers

## 1.0.0-beta.0

- initial beta release of the PhotoPay In-browser SDK

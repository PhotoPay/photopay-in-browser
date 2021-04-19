/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import
{
    Recognizer,
    RecognizerResult,
    RecognizerSettings,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

/**
 * A settings object that is used for configuring the CroatiaQrCodePaymentRecognizer.
 */
export class CroatiaQrCodePaymentRecognizerSettings implements RecognizerSettings
{
    /**
     * Defines if the recognizer should go slower through scan. If slowerThoroughScan is enabled,
     * then scanning will be slower, but more thorough, thus giving higher possibility of successful
     * scan.
     *
     * By default, slowerThoroughScan is disabled.
     */
    slowerThoroughScan = true;
}

/**
 * The result of image recognition when using the CroatiaQrCodePaymentRecognizer.
 */
export interface CroatiaQrCodePaymentRecognizerResult extends RecognizerResult
{

}

/**
 * Recognizer which can scan Croatian payment QR code.
 */
export interface CroatiaQrCodePaymentRecognizer extends Recognizer
{
    /** Returns the currently applied CroatiaQrCodePaymentRecognizerSettings. */
    currentSettings(): Promise< CroatiaQrCodePaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: CroatiaQrCodePaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< CroatiaQrCodePaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `CroatiaQrCodePaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createCroatiaQrCodePaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< CroatiaQrCodePaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "CroatiaQrCodePaymentRecognizer"
    ) as Promise< CroatiaQrCodePaymentRecognizer >;
}

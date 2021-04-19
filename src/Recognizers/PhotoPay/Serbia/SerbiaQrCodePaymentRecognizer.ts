/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Recognizer, RecognizerSettings, WasmSDK } from "../../../MicroblinkSDK/DataStructures";
import { SerbiaBaseBarcodePaymentRecognizerResult } from "./SerbiaBaseBarcodePaymentRecognizer";

/**
 * A settings object that is used for configuring the SerbiaQrCodePaymentRecognizer.
 */
export class SerbiaQrCodePaymentRecognizerSettings implements RecognizerSettings
{}

/**
 * The result of image recognition when using the SerbiaQrCodePaymentRecognizer.
 */
export interface SerbiaQrCodePaymentRecognizerResult extends SerbiaBaseBarcodePaymentRecognizerResult
{}

/**
 * Recognizer which can scan Serbia payment QR code.
 */
export interface SerbiaQrCodePaymentRecognizer extends Recognizer
{
    /** Returns the currently applied SerbiaQrCodePaymentRecognizerSettings. */
    currentSettings(): Promise< SerbiaQrCodePaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: SerbiaQrCodePaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< SerbiaQrCodePaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `SerbiaQrCodePaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createSerbiaQrCodePaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< SerbiaQrCodePaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "SerbiaQrCodePaymentRecognizer"
    ) as Promise< SerbiaQrCodePaymentRecognizer >;
}

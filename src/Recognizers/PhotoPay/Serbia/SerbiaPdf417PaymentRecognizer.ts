import
{
    Recognizer,
    RecognizerSettings,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

import { SerbiaBaseBarcodePaymentRecognizerResult } from "./SerbiaBaseBarcodePaymentRecognizer";

/**
 * A settings object that is used for configuring the SerbiaPdf417PaymentRecognizer.
 */
export class SerbiaPdf417PaymentRecognizerSettings implements RecognizerSettings
{}

/**
 * The result of image recognition when using the SerbiaPdf417PaymentRecognizer.
 */
export interface SerbiaPdf417PaymentRecognizerResult extends SerbiaBaseBarcodePaymentRecognizerResult
{}

/**
 * Recognizer which can scan Serbia payment PDF417 barcode.
 */
export interface SerbiaPdf417PaymentRecognizer extends Recognizer
{
    /** Returns the currently applied SerbiaPdf417PaymentRecognizerSettings. */
    currentSettings(): Promise< SerbiaPdf417PaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: SerbiaPdf417PaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< SerbiaPdf417PaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `SerbiaPdf417PaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createSerbiaPdf417PaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< SerbiaPdf417PaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "SerbiaPdf417PaymentRecognizer"
    ) as Promise< SerbiaPdf417PaymentRecognizer >;
}

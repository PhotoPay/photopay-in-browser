/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import { Recognizer, WasmSDK } from "../../../MicroblinkSDK/DataStructures";

import
{
    CroatiaBaseBarcodePaymentRecognizerResult,
    CroatiaBaseBarcodePaymentRecognizerSettings
} from "./CroatiaBaseBarcodePaymentRecognizer";

/**
 * A settings object that is used for configuring the CroatiaPdf417PaymentRecognizer.
 */
export class CroatiaPdf417PaymentRecognizerSettings extends CroatiaBaseBarcodePaymentRecognizerSettings
{
    /**
     * Uncertain decoding enables scanning of non-standard elements, but there is no guarantee that
     * all data will be read.
     *
     * For Pdf417 barcode is used when multiple rows are missing (e.g. not whole barcode is printed).
     * By default, this is set to true.
     */
    uncertainDecoding = true;
}

/**
 * The result of image recognition when using the CroatiaPdf417PaymentRecognizer.
 */
export interface CroatiaPdf417PaymentRecognizerResult extends CroatiaBaseBarcodePaymentRecognizerResult
{}

/**
 * Recognizer which can scan Croatian payment PDF417 barcode
 */
export interface CroatiaPdf417PaymentRecognizer extends Recognizer
{
    /** Returns the currently applied CroatiaPdf417PaymentRecognizerSettings. */
    currentSettings(): Promise< CroatiaPdf417PaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: CroatiaPdf417PaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< CroatiaPdf417PaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `CroatiaPdf417PaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createCroatiaPdf417PaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< CroatiaPdf417PaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "CroatiaPdf417PaymentRecognizer"
    ) as Promise< CroatiaPdf417PaymentRecognizer >;
}

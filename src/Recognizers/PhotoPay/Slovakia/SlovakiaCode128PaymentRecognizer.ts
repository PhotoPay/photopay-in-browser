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
 * A settings object that is used for configuring the SlovakiaCode128PaymentRecognizer.
 */
export class SlovakiaCode128PaymentRecognizerSettings implements RecognizerSettings
{

}

/**
 * The result of image recognition when using the SlovakiaCode128PaymentRecognizer.
 */
export interface SlovakiaCode128PaymentRecognizerResult extends RecognizerResult
{
    /**
     *  The account number
     */
    readonly accountNumber: string;

    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  The bank code
     */
    readonly bankCode: string;

    /**
     *  The constant symbol
     */
    readonly constantSymbol: string;

    /**
     *  The currency of the payment.
     */
    readonly currency: string;

    /**
     *  The international bank account number of the account to which the Payment goes
     */
    readonly iban: string;

    /**
     *  The operational code
     */
    readonly operationalCode: string;

    /**
     *  The processing code
     */
    readonly processingCode: string;

    /**
     *  The product code
     */
    readonly productCode: string;

    /**
     *  Raw result
     */
    readonly rawResult: string;

    /**
     *  The reference of the payment
     */
    readonly reference: string;

    /**
     *  The service code
     */
    readonly serviceCode: string;

    /**
     *  The specific symbol
     */
    readonly specificSymbol: string;

    /**
     *  The variable symbol
     */
    readonly variableSymbol: string;
}

/**
 * Recognizer which can scan Slovak payment Code 128 barcode
 */
export interface SlovakiaCode128PaymentRecognizer extends Recognizer
{
    /** Returns the currently applied SlovakiaCode128PaymentRecognizerSettings. */
    currentSettings(): Promise< SlovakiaCode128PaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: SlovakiaCode128PaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< SlovakiaCode128PaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `SlovakiaCode128PaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createSlovakiaCode128PaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< SlovakiaCode128PaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "SlovakiaCode128PaymentRecognizer"
    ) as Promise< SlovakiaCode128PaymentRecognizer >;
}

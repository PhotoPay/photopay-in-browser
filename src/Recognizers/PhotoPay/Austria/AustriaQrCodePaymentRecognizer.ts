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
 * A settings object that is used for configuring the AustriaQrCodePaymentRecognizer.
 */
export class AustriaQrCodePaymentRecognizerSettings implements RecognizerSettings
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
 * The result of image recognition when using the AustriaQrCodePaymentRecognizer.
 */
export interface AustriaQrCodePaymentRecognizerResult extends RecognizerResult
{
    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  BIC of the receiving side.
     */
    readonly bic: string;

    /**
     *  The currency of the payment.
     */
    readonly currency: string;

    /**
     *  Description of the payment as placed in last row of STUZZA QR code
     */
    readonly displayData: string;

    /**
     *  The account number of the receiving side.
     */
    readonly iban: string;

    /**
     *  The description of the payment.
     */
    readonly paymentDescription: string;

    /**
     *  Purpose code
     */
    readonly purposeCode: string;

    /**
     *  The name of the receiving side.
     */
    readonly recipientName: string;

    /**
     *  The reference of the payment.
     */
    readonly reference: string;
}

/**
 * Recognizer which can scan Austrian payment QR code.
 */
export interface AustriaQrCodePaymentRecognizer extends Recognizer
{
    /** Returns the currently applied AustriaQrCodePaymentRecognizerSettings. */
    currentSettings(): Promise< AustriaQrCodePaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: AustriaQrCodePaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< AustriaQrCodePaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `AustriaQrCodePaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createAustriaQrCodePaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< AustriaQrCodePaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "AustriaQrCodePaymentRecognizer"
    ) as Promise< AustriaQrCodePaymentRecognizer >;
}

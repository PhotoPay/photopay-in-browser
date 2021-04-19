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
 * A settings object that is used for configuring the SepaQrCodePaymentRecognizer.
 */
export class SepaQrCodePaymentRecognizerSettings implements RecognizerSettings
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
 * The result of image recognition when using the SepaQrCodePaymentRecognizer.
 */
export interface SepaQrCodePaymentRecognizerResult extends RecognizerResult
{
    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  The bank Identifier Code of the bank to which the payment goes.
     */
    readonly bic: string;

    /**
     *  The currency of the payment.
     */
    readonly currency: string;

    /**
     *  The display data
     */
    readonly displayData: string;

    /**
     *  The international bank account number of the account to which the payment goes.
     */
    readonly iban: string;

    /**
     *  Optional data from the end of QR code (if exists).
     */
    readonly optionalData: string;

    /**
     *  The description of the payment; available if reference number is empty.
     */
    readonly paymentDescription: string;

    /**
     *  the purpose code of the payment.
     */
    readonly purposeCode: string;

    /**
     *  Raw result
     */
    readonly rawResult: string;

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
 * Recognizer which can scan SEPA payment QR code
 */
export interface SepaQrCodePaymentRecognizer extends Recognizer
{
    /** Returns the currently applied SepaQrCodePaymentRecognizerSettings. */
    currentSettings(): Promise< SepaQrCodePaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: SepaQrCodePaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< SepaQrCodePaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `SepaQrCodePaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createSepaQrCodePaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< SepaQrCodePaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "SepaQrCodePaymentRecognizer"
    ) as Promise< SepaQrCodePaymentRecognizer >;
}

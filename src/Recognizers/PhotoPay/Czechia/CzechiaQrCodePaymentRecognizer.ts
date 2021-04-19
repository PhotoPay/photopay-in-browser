/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import
{
    Recognizer,
    RecognizerResult,
    RecognizerSettings,
    MBDate,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

/**
 * A settings object that is used for configuring the CzechiaQrCodePaymentRecognizer.
 */
export class CzechiaQrCodePaymentRecognizerSettings implements RecognizerSettings
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

export interface CzechiaAccountInfo
{
    /** The IBAN of the account. */
    iban: string;

    /** The BIC/SWIFT code of the account. */
    bic: string;
}

/**
 * The result of image recognition when using the CzechiaQrCodePaymentRecognizer.
 */
export interface CzechiaQrCodePaymentRecognizerResult extends RecognizerResult
{
    /**
     *  The default payment receiver account.
     */
    readonly account: CzechiaAccountInfo;

    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  The list of available payment receiver accounts (IBAN and BIC).
     */
    readonly availableAccounts: CzechiaAccountInfo[];

    /**
     *  The constant symbol.
     */
    readonly constantSymbol: string;

    /**
     *  The currency of the payment.
     */
    readonly currency: string;

    /**
     *  The due date of the payment.
     */
    readonly dueDate: MBDate;

    /**
     *  The form version.
     */
    readonly formVersion: string;

    /**
     *  The description of the payment.
     */
    readonly paymentDescription: string;

    /**
     *  The type of payment.
     */
    readonly paymentType: string;

    /**
     *  The name of the receiving side.
     */
    readonly recipientName: string;

    /**
     *  The reference of the payment.
     */
    readonly reference: string;

    /**
     *  The specific symbol.
     */
    readonly specificSymbol: string;

    /**
     *  The variable symbol.
     */
    readonly variableSymbol: string;
}

/**
 * Recognizer which can scan Czech payment QR code.
 */
export interface CzechiaQrCodePaymentRecognizer extends Recognizer
{
    /** Returns the currently applied CzechiaQrCodePaymentRecognizerSettings. */
    currentSettings(): Promise< CzechiaQrCodePaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings:  CzechiaQrCodePaymentRecognizerSettings  ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< CzechiaQrCodePaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `CzechiaQrCodePaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createCzechiaQrCodePaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< CzechiaQrCodePaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "CzechiaQrCodePaymentRecognizer"
    ) as Promise< CzechiaQrCodePaymentRecognizer >;
}

import { Recognizer, RecognizerResult, MBDate, RecognizerSettings, WasmSDK } from '../../../MicroblinkSDK/DataStructures'

/**
 * A settings object that is used for configuring the SwitzerlandQrCodePaymentRecognizer.
 */
export class SwitzerlandQrCodePaymentRecognizerSettings implements RecognizerSettings
{

    /**
     *  Defines if the recognizer should go slower through scan.
     *  If slowerThoroughScan is enabled, then scanning will be slower, but more thorough, thus giving higher possibility of successful scan.
     *  By default, slowerThoroughScan is disabled.
     */
    slowerThoroughScan = false;

}

/**
 * The result of image recognition when using the SwitzerlandQrCodePaymentRecognizer.
 */
export interface SwitzerlandQrCodePaymentRecognizerResult extends RecognizerResult
{

    /**
     *  The payment additional information.
     */
    readonly additionalInformation: string;

    /**
     *  The parameters of the alternative scheme.
     */
    readonly alternativeSchemeParameters: string;

    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  The currency of the payment.
     */
    readonly currency: string;

    /**
     *  The due date of the payment.
     */
    readonly dueDate: MBDate;

    /**
     *  The International bank account numbe of the account to which the payment goes.
     */
    readonly iban: string;

    /**
     *  The address of the payer, if it exists.
     */
    readonly payerAddress: string;

    /**
     *  The city of the payer, if it exists.
     */
    readonly payerCity: string;

    /**
     *  The country of the payer, if it exists.
     */
    readonly payerCountry: string;

    /**
     *  The house number of the payer, if it exists.
     */
    readonly payerHouseNumber: string;

    /**
     *  The name of the payer, if it exists.
     */
    readonly payerName: string;

    /**
     *  The postal code of the payer, if it exists.
     */
    readonly payerPostalCode: string;

    /**
     *  The street of the payer, if it exists.
     */
    readonly payerStreet: string;

    /**
     *  The address of the recipient.
     */
    readonly recipientAddress: string;

    /**
     *  The city of the recipient.
     */
    readonly recipientCity: string;

    /**
     *  The country of the recipient.
     */
    readonly recipientCountry: string;

    /**
     *  The house number of the recipient.
     */
    readonly recipientHouseNumber: string;

    /**
     *  The name of the recipient.
     */
    readonly recipientName: string;

    /**
     *  The postal code of the recipient.
     */
    readonly recipientPostalCode: string;

    /**
     *  The street of the recipient.
     */
    readonly recipientStreet: string;

    /**
     *  The reference of the payment.
     */
    readonly reference: string;

    /**
     *  The reference model of the payment.
     */
    readonly referenceModel: string;

    /**
     *  The address of the ultimate recipient.
     */
    readonly ultimateRecipientAddress: string;

    /**
     *  The city of the ultimate recipient.
     */
    readonly ultimateRecipientCity: string;

    /**
     *  The country of the ultimate recipient.
     */
    readonly ultimateRecipientCountry: string;

    /**
     *  The house number of the ultimate recipient.
     */
    readonly ultimateRecipientHouseNumber: string;

    /**
     *  The name of the ultimate recipient.
     */
    readonly ultimateRecipientName: string;

    /**
     *  The postal code of the ultimate recipient.
     */
    readonly ultimateRecipientPostalCode: string;

    /**
     *  The street of the ultimate recipient.
     */
    readonly ultimateRecipientStreet: string;

}

/**
 * Recognizer which can scan Swiss payment QR code
 */
export interface SwitzerlandQrCodePaymentRecognizer extends Recognizer
{
    /** Returns the currently applied SwitzerlandQrCodePaymentRecognizerSettings. */
    currentSettings(): Promise< SwitzerlandQrCodePaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: SwitzerlandQrCodePaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< SwitzerlandQrCodePaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `SwitzerlandQrCodePaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createSwitzerlandQrCodePaymentRecognizer( wasmSDK: WasmSDK ): Promise< SwitzerlandQrCodePaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer( "SwitzerlandQrCodePaymentRecognizer" ) as Promise< SwitzerlandQrCodePaymentRecognizer >;
}

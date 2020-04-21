import { Recognizer, RecognizerResult, RecognizerSettings, MBDate, WasmSDK } from '../../../MicroblinkSDK/DataStructures'

/**
 * A settings object that is used for configuring the SlovakiaQrCodePaymentRecognizer.
 */
export class SlovakiaQrCodePaymentRecognizerSettings implements RecognizerSettings
{

    /**
     *  Defines if the recognizer should go slower through scan.
     *  If slowerThoroughScan is enabled, then scanning will be slower, but more thorough, thus giving higher possibility of successful scan.
     *  By default, slowerThoroughScan is disabled.
     */
    slowerThoroughScan = false;

}

export interface SlovakiaAccountInfo
{
    /** The IBAN of the account. */
    iban: string;
    /** The BIC/SWIFT code of the account. */
    bic: string;
}

export interface SlovakiaQrPaymentInformation
{
    /** The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned. */
    readonly amount: number;

    /** The payment options associated with scanned payBySquare QR code. */
    readonly formFunction: string;

    /** The currency of the payment. */
    readonly currency: string;

    /** The variable symbol. */
    readonly variableSymbol: string;

    /** The constant symbol. */
    readonly constantSymbol: string;

    /** The specific symbol. */
    readonly specificSymbol: string;

    /** The reference number of the payment. */
    readonly referenceNumber: string;

    /** The description of the payment. */
    readonly paymentDescription: string;

    /** The name of the receiving side. */
    readonly recipientName: string;

    /** The address of the recipient, if it exists. */
    readonly recipientAddress: string;

    /** The second line of recipient address, if it exists. */
    readonly recipientDetailedAddress: string;

    /** The due date of the payment. */
    readonly dueDate: MBDate;

    /** The default payment receiver account (IBAN and BIC). */
    readonly account: SlovakiaAccountInfo;

    /** The list of available payment receiver accounts (IBAN and BIC). */
    readonly availableAccounts: SlovakiaAccountInfo[];
}

/**
 * The result of image recognition when using the SlovakiaQrCodePaymentRecognizer.
 */
export interface SlovakiaQrCodePaymentRecognizerResult extends RecognizerResult
{

    /**
     *  The ID of invoice this payment refers to.
     */
    readonly invoiceId: string;

    /**
     *  The payment information list.
     */
    readonly paymentInformationList: SlovakiaQrPaymentInformation[];

}

/**
 * Recognizer which can scan Slovakia payment QR code.
 */
export interface SlovakiaQrCodePaymentRecognizer extends Recognizer
{
    /** Returns the currently applied SlovakiaQrCodePaymentRecognizerSettings. */
    currentSettings(): Promise< SlovakiaQrCodePaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: SlovakiaQrCodePaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< SlovakiaQrCodePaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `SlovakiaQrCodePaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createSlovakiaQrCodePaymentRecognizer( wasmSDK: WasmSDK ): Promise< SlovakiaQrCodePaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer( "SlovakiaQrCodePaymentRecognizer" ) as Promise< SlovakiaQrCodePaymentRecognizer >;
}

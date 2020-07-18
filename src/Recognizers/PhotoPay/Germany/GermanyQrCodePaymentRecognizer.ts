import
{
    Recognizer,
    RecognizerResult,
    RecognizerSettings,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

/**
 * A settings object that is used for configuring the GermanyQrCodePaymentRecognizer.
 */
export class GermanyQrCodePaymentRecognizerSettings implements RecognizerSettings
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
 * The result of image recognition when using the GermanyQrCodePaymentRecognizer.
 */
export interface GermanyQrCodePaymentRecognizerResult extends RecognizerResult
{
    /**
     *  Bank account number to which the payment goes
     */
    readonly accountNumber: string;

    /**
     *  Scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  Type of the authority
     */
    readonly authority: string;

    /**
     *  Bank code (BLZ) of the receiver bank (e.g. 0034000)
     */
    readonly bankCode: string;

    /**
     *  Bank Identifier Code of the bank to which the payment goes
     */
    readonly bic: string;

    /**
     *  ID of the creditor
     */
    readonly creditorId: string;

    /**
     *  Currency of the payment
     */
    readonly currency: string;

    /**
     *  Date of the direct debit signature
     */
    readonly dateOfSignature: string;

    /**
     *  Remittance information, as agreed between the Originator and the Beneficiary
     */
    readonly displayData: string;

    /**
     *  Date when the payment should be executed
     */
    readonly executionDate: string;

    /**
     *  QR identification code
     */
    readonly formFunction: string;

    /**
     *  Service tag of the SEPA QR code standard
     */
    readonly formType: string;

    /**
     *  Version of the SEPA QR code standard
     */
    readonly formVersion: string;

    /**
     *  International bank account number of the account to which the payment goes
     */
    readonly iban: string;

    /**
     *  ID of the mandate
     */
    readonly mandateId: string;

    /**
     *  Description of the payment
     */
    readonly paymentDescription: string;

    /**
     *  First execution date for periodic payments
     */
    readonly periodicFirstExecutionDate: string;

    /**
     *  Last execution date for periodic payments
     */
    readonly periodicLastExecutionDate: string;

    /**
     *  Periodic time unit for periodic payments
     */
    readonly periodicTimeUnit: string;

    /**
     *  Period for periodic payments in periodic time units
     */
    readonly periodicTimeUnitRotation: number;

    /**
     *  Posting key
     */
    readonly postingKey: string;

    /**
     *  Purpose of the payment
     */
    readonly purposeCode: string;

    /**
     *  Raw, unparsed string embedded in QR code
     */
    readonly rawResult: string;

    /**
     *  Name of the receiving side
     */
    readonly recipientName: string;

    /**
     *  Payment reference
     */
    readonly reference: string;
}

/**
 * Recognizer which can scan German payment QR code.
 */
export interface GermanyQrCodePaymentRecognizer extends Recognizer
{
    /** Returns the currently applied GermanyQrCodePaymentRecognizerSettings. */
    currentSettings(): Promise< GermanyQrCodePaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: GermanyQrCodePaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< GermanyQrCodePaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `GermanyQrCodePaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createGermanyQrCodePaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< GermanyQrCodePaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "GermanyQrCodePaymentRecognizer"
    ) as Promise< GermanyQrCodePaymentRecognizer >;
}

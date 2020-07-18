import
{
    Recognizer,
    RecognizerResult,
    MBDate,
    RecognizerSettings,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

/**
 * A settings object that is used for configuring the
 * SloveniaQrCodePaymentRecognizer.
 */
export class SloveniaQrCodePaymentRecognizerSettings implements RecognizerSettings
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
 * The result of image recognition when using the SloveniaQrCodePaymentRecognizer.
 */
export interface SloveniaQrCodePaymentRecognizerResult extends RecognizerResult
{
    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  Whether deposit option is included in payment.
     */
    readonly deposit: boolean;

    /**
     *  The due date of payment.
     */
    readonly dueDate: MBDate;

    /**
     *  The date of execution of the payment.
     */
    readonly executionDate: MBDate;

    /**
     *  The international bank account number of the account to which the payment goes.
     */
    readonly iban: string;

    /**
     *  The international bank account number of the account from where the payment goes.
     */
    readonly payerIban: string;

    /**
     *  The name of the payer, if it exists.
     */
    readonly payerName: string;

    /**
     *  The place of the payer, if it exists.
     */
    readonly payerPlace: string;

    /**
     *  The reference of the payment's payer.
     */
    readonly payerReference: string;

    /**
     *  The street of the payer, if it exists.
     */
    readonly payerStreet: string;

    /**
     *  The description of the payment.
     */
    readonly paymentDescription: string;

    /**
     *  The purpose code of the payment.
     */
    readonly purposeCode: string;

    /**
     *  Raw result
     */
    readonly rawResult: string;

    /**
     *  The name of the recipient.
     */
    readonly recipientName: string;

    /**
     *  The place of the recipient.
     */
    readonly recipientPlace: string;

    /**
     *  The street of the recipient.
     */
    readonly recipientStreet: string;

    /**
     *  The reference of the payment.
     */
    readonly reference: string;

    /**
     *  Whether withdraw option is included in payment.
     */
    readonly withdraw: boolean;
}

/**
 * Recognizer which can scan Slovenian payment QR code
 */
export interface SloveniaQrCodePaymentRecognizer extends Recognizer
{
    /** Returns the currently applied SloveniaQrCodePaymentRecognizerSettings. */
    currentSettings(): Promise< SloveniaQrCodePaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: SloveniaQrCodePaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< SloveniaQrCodePaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `SloveniaQrCodePaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createSloveniaQrCodePaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< SloveniaQrCodePaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "SloveniaQrCodePaymentRecognizer"
    ) as Promise< SloveniaQrCodePaymentRecognizer >;
}

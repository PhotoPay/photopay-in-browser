import
{
    Recognizer,
    RecognizerResult,
    RecognizerSettings,
    WasmSDK
} from "../../../MicroblinkSDK/DataStructures";

/**
 * A settings object that is used for configuring the KosovoCode128PaymentRecognizer.
 */
export class KosovoCode128PaymentRecognizerSettings implements RecognizerSettings
{}

/**
 * Type of the payment slip
 */
export enum KosCode128SlipIDType
{
    OLD = 0,
    NEW
}

/**
 * The result of image recognition when using the KosovoCode128PaymentRecognizer.
 */
export interface KosovoCode128PaymentRecognizerResult extends RecognizerResult
{
    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  Complete, unparsed code
     */
    readonly code128Result: string;

    /**
     *  Customer ID
     */
    readonly customerID: string;

    /**
     *  District code
     */
    readonly district: string;

    /**
     *  Due date of the payment
     */
    readonly dueDate: string;

    /**
     *  Payer accout number
     */
    readonly payerAccountNumber: string;

    /**
     *  Reference of the payment
     */
    readonly reference: string;

    /**
     *  Service code
     */
    readonly service: string;

    /**
     *  Slip ID
     */
    readonly slipId: KosCode128SlipIDType;

    /**
     *  Utility ID of the payment
     */
    readonly utilityID: string;
}

/**
 * Recognizer which can scan Kosovo Code 128 code
 */
export interface KosovoCode128PaymentRecognizer extends Recognizer
{
    /** Returns the currently applied KosovoCode128PaymentRecognizerSettings. */
    currentSettings(): Promise< KosovoCode128PaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: KosovoCode128PaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< KosovoCode128PaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `KosovoCode128PaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createKosovoCode128PaymentRecognizer
(
    wasmSDK: WasmSDK
): Promise< KosovoCode128PaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer
    (
        "KosovoCode128PaymentRecognizer"
    ) as Promise< KosovoCode128PaymentRecognizer >;
}

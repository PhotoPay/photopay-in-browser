import { Recognizer, RecognizerResult, RecognizerSettings, WasmSDK } from '../../../MicroblinkSDK/DataStructures'

/**
 * A settings object that is used for configuring the SlovakiaDataMatrixPaymentRecognizer.
 */
export class SlovakiaDataMatrixPaymentRecognizerSettings implements RecognizerSettings
{
    
    /**
     *  Defines if the recognizer should go slower through scan.
     *  If slowerThoroughScan is enabled, then scanning will be slower, but more thorough, thus giving higher possibility of successful scan.
     *  By default, slowerThoroughScan is disabled.
     */
    slowerThoroughScan = true;
    
}

/**
 * The result of image recognition when using the SlovakiaDataMatrixPaymentRecognizer.
 */
export interface SlovakiaDataMatrixPaymentRecognizerResult extends RecognizerResult
{
    
    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;
    
    /**
     *  The constant symbol
     */
    readonly constantSymbol: string;
    
    /**
     *  The currency of the payment.
     */
    readonly currency: string;
    
    /**
     *  The international bank account number of the account to which the payment goes
     */
    readonly iban: string;
    
    /**
     *  The orientation number
     */
    readonly orientationNumber: string;
    
    /**
     *  The payers address
     */
    readonly payerAddress: string;
    
    /**
     *  The payers name
     */
    readonly payerName: string;
    
    /**
     *  The payment description
     */
    readonly paymentDescription: string;
    
    /**
     *  The processing code
     */
    readonly processingCode: string;
    
    /**
     *  The product code
     */
    readonly productCode: string;
    
    /**
     *  Raw results
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
 * Recognizer which can scan Slovak Data Matrix
 */
export interface SlovakiaDataMatrixPaymentRecognizer extends Recognizer
{
    /** Returns the currently applied SlovakiaDataMatrixPaymentRecognizerSettings. */
    currentSettings(): Promise< SlovakiaDataMatrixPaymentRecognizerSettings >

    /** Applies new settings to the recognizer. */
    updateSettings( newSettings: SlovakiaDataMatrixPaymentRecognizerSettings ): Promise< void >;

    /** Returns the current result of the recognition. */
    getResult(): Promise< SlovakiaDataMatrixPaymentRecognizerResult >;
}

/**
 * This function is used to create a new instance of `SlovakiaDataMatrixPaymentRecognizer`.
 * @param wasmSDK Instance of WasmSDK which will be used to communicate with the WebAssembly module.
 */
export async function createSlovakiaDataMatrixPaymentRecognizer( wasmSDK: WasmSDK ): Promise< SlovakiaDataMatrixPaymentRecognizer >
{
    return wasmSDK.mbWasmModule.newRecognizer( "SlovakiaDataMatrixPaymentRecognizer" ) as Promise< SlovakiaDataMatrixPaymentRecognizer >;
}
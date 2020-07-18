import { RecognizerResult } from "../../../MicroblinkSDK/DataStructures";

/**
 * The result of image recognition when using the SerbiaBaseBarcodePaymentRecognizer.
 */
export interface SerbiaBaseBarcodePaymentRecognizerResult extends RecognizerResult
{
    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  The currency of the payment.
     */
    readonly currency: string;

    /**
     *  The identification code of the payment.
     */
    readonly identificationCode: string;

    /**
     *  The merchant code category of the payment.
     */
    readonly merchantCodeCategory: string;

    /**
     *  The merchant reference of the payment.
     */
    readonly merchantReference: string;

    /**
     *  The one time payment code of the payment.
     */
    readonly oneTimePaymentCode: string;

    /**
     *  The additional data about the payment.
     */
    readonly optionalData: string;

    /**
     *  The account number of the payer.
     */
    readonly payerAccountNumber: string;

    /**
     *  The address of the payer.
     */
    readonly payerAddress: string;

    /**
     *  The detailed address of the payer.
     */
    readonly payerDetailedAddress: string;

    /**
     *  The name of the payer.
     */
    readonly payerName: string;

    /**
     *  The payment code of the payment.
     */
    readonly paymentCode: string;

    /**
     *  The description of the payment.
     */
    readonly paymentDescription: string;

    /**
     *  The purpose code of the payment.
     */
    readonly purposeCode: string;

    /**
     *  The raw barcode data string.
     */
    readonly rawBarcodeData: string;

    /**
     *  The bank account number to which the payment goes.
     */
    readonly recipientAccountNumber: string;

    /**
     *  The address of the payment receiver.
     */
    readonly recipientAddress: string;

    /**
     *  The address of the payment receiver.
     */
    readonly recipientDetailedAddress: string;

    /**
     *  The name of the receiving side.
     */
    readonly recipientName: string;

    /**
     *  The reference of the payment.
     */
    readonly reference: string;

    /**
     *  The reference model of the payment.
     */
    readonly referenceModel: string;

    /**
     *  The indication if the payment barcode data is uncertain.
     */
    readonly uncertain: boolean;
}

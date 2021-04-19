/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import
{
    RecognizerResult,
    RecognizerSettings,
    MBDate
} from "../../../MicroblinkSDK/DataStructures";

/**
 * A settings object that is used for configuring the CroatiaBaseBarcodePaymentRecognizer.
 */
export class CroatiaBaseBarcodePaymentRecognizerSettings implements RecognizerSettings
{
    /**
     *  Whether barcode result should be sanitized before being returned to the user.
     */
    shouldSanitize = false;
}

/**
 * Represents a type of HUB barcode that was scanned.
 */
export enum CroatiaBarcodeSlipIdType
{
    /** Scanned barcode was of HUB1 type. */
    HUB1_BARCODE = 0,
    /** Scanned barcode was of HUB3 type. */
    HUB3_BARCODE
}

/**
 * The result of image recognition when using the CroatiaPdf417PaymentRecognizer or CroatiaQrCodePaymentRecognizer.
 */
export interface CroatiaBaseBarcodePaymentRecognizerResult extends RecognizerResult
{
    /**
     *  The account number to which the payment goes
     */
    readonly accountNumber: string;

    /**
     *  The scanned amount in smallest currency (e.g. cents), 0 if nothing was scanned.
     */
    readonly amount: number;

    /**
     *  The bank code of the receiver bank
     */
    readonly bankCode: string;

    /**
     *  The currency of the payment
     */
    readonly currency: string;

    /**
     *  The due date for payment; available only for HUB3 slips
     */
    readonly dueDate: MBDate;

    /**
     *  The International bank account number of the account to which the payment goes
     */
    readonly iban: string;

    /**
     *  The additional data available at the end of HUB3 QR and PDF417 barcode
     */
    readonly optionalData: string;

    /**
     *  The account number of the payer (available only in some HUB1 barcodes)
     */
    readonly payerAccountNumber: string;

    /**
     *  The address of the payer
     */
    readonly payerAddress: string;

    /**
     *  The bank code of the payer bank
     */
    readonly payerBankCode: string;

    /**
     *  The detailed address of the payer; available only for HUB3 slips
     */
    readonly payerDetailedAddress: string;

    /**
     *  The international bank account number of the payer account
     */
    readonly payerIban: string;

    /**
     *  The name of the payer
     */
    readonly payerName: string;

    /**
     *  The payer reference number (available only on HUB1 barcodes)
     */
    readonly payerReference: string;

    /**
     *  The payer reference model (available only on HUB1 barcodes)
     */
    readonly payerReferenceModel: string;

    /**
     *  The description of the payment
     */
    readonly paymentDescription: string;

    /**
     *  The description code of the payment
     */
    readonly paymentDescriptionCode: string;

    /**
     *  The purpose code of the payment
     */
    readonly purposeCode: string;

    /**
     *  The address of the payment receiver
     */
    readonly recipientAddress: string;

    /**
     *  The detailed address of the payment receiver; available only for HUB3 slips
     */
    readonly recipientDetailedAddress: string;

    /**
     *  The name of the receiving side
     */
    readonly recipientName: string;

    /**
     *  The reference of the payment
     */
    readonly reference: string;

    /**
     *  The reference model of the payment
     */
    readonly referenceModel: string;

    /**
     *  Slip ID (e.g HUB3_BARCODE)
     */
    readonly slipId: CroatiaBarcodeSlipIdType;

    /**
     *  The uncertain
     */
    readonly uncertain: boolean;
}

/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

// Import typings for UI component
import "@microblink/photopay-in-browser-sdk/ui";

// Import typings for custom events
import
{
    EventFatalError,
    EventScanError,
    EventScanSuccess
} from "@microblink/photopay-in-browser-sdk/ui/dist/types/utils/data-structures";

function initializeUiComponent()
{
    const photopay = document.querySelector( "photopay-in-browser" ) as HTMLBlinkidInBrowserElement;

    if ( !photopay )
    {
        throw "Could not find UI component!";
    }

    /* [TEMPORARY FIX]
     * Use basic WebAssembly builds since most performant option requires server setup and unpkg.com, which is used
     * for examples, doesn't support COOP and COEP headers.
     *
     * For more information see "Integration" section in the official documentation.
     */
    photopay.wasmType = "BASIC";

    photopay.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpHlVKjc9YGS1TbhKMOp/628Nz+3wucEKOKiY/6REBB0awpfPXXng8x6oFT8mEe+eFZwM6UTZKMO58PYWB2BUoq3KuLZWA0iIrN5l0EOTf4y0aTFs1KXROvrx2TbPyeNjYtPqtuMZq7Mo6L0GGWp5zehmxpUnuWBsW8/tR/8NLpfFQHucZnA+nnsS3Oj/qzbaf96oTjl1Ov4T4WVRbNK4yjzUre+L+NleOrZygXTQnqPLtPnhKmoHjJ9dtyTRp1C89NxNHUqVeacwp0Q8v+plPxr+fS8zSCMVeEWgumsmmLhFiaFLxHQ14VPYB+ycRpMi6FAZVPNXPbXtfjWi0g==";
    photopay.engineLocation = window.location.origin;
    photopay.recognizers = [ "CroatiaPdf417PaymentRecognizer" ];

    photopay.addEventListener( "fatalError", ( ev: CustomEventInit< EventFatalError > ) =>
    {
        const fatalError = ev.detail;
        console.log( "Could not load UI component", fatalError );
    });

    photopay.addEventListener( "scanError", ( ev: CustomEventInit< EventScanError > ) =>
    {
        const scanError = ev.detail;
        console.log( "Could not scan a document", scanError );
    });

    photopay.addEventListener( "scanSuccess", ( ev: CustomEventInit< EventScanSuccess > ) =>
    {
        const scanResults = ev.detail;
        console.log( "Scan results", scanResults );
    });
}

window.addEventListener( "DOMContentLoaded", () => initializeUiComponent() );

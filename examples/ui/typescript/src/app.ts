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

    photopay.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPig/w35CpHnVqmAezZ0pfZ9lun7eOr4IMW/8gkodLyiVq5FOiQffdV3Kg0qVVibVwf7vCiQtkPDFRQ58msNOXGkEJ3azLG6vs3Fxy7pWE0T9tdCWxuS/ffDCh6vGPDUSLSmAnIfkVvLD6RwlwpYrHjxgV8r9WlYGyJ5YkC8wdMlKy8Aqgg2TBaWxDzabQlJPAfC7YM/bCAKXr72G2f2GSnNABaZ5zLNtLSl5myfy/OkgFW7MXNUNRSIkTmuc3uCIUiWMy3DOmKqJZ1TY";
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

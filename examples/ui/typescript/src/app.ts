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

    photopay.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpHlVLi84YJhfzkKNDWt5k6TOIq/BqQY4bts33tGdQc7RawrRGyvbnbj5DEV92rrMkoGMUk3QCySYI9IPMLsIG1aPiOLf1Dhq9FZbGgJvTq6f1O/4pQzxtWn5rN+fs9TqjLz+ei2k0Bv12JREFNsBroMSZUuIDW7uU2bAnW4qW2cedBUaDI9KuhBAtS1B/78M3zb7Fm3dhvMvXj2Mlhl+iwFDwqAhHb5f8vxRICbnqjrb9GO34z4jgJFVQ/mDFZzgLASEJlUO01vfBs18GWt78ups4pIgiIpJph2DhMi76GMxoqQKJfoEs6Wl+VwmIftwWJQbMg==";
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

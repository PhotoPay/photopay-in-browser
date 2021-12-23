/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

// Import typings for UI component
import "@microblink/photopay-in-browser-sdk/ui";

// Import typings for custom events
import { EventFatalError, EventScanError, EventScanSuccess } from "@microblink/photopay-in-browser-sdk/ui/dist/types/utils/data-structures";
function initializeUiComponent() {
    const photopay = document.querySelector("photopay-in-browser") as HTMLPhotopayInBrowserElement;
    if (!photopay) {
        throw "Could not find UI component!";
    }
    photopay.licenseKey = "sRwAAAYJbG9jYWxob3N0r/lOPk4/w35CpHnVLccTzWKAOwpqo/kZnt9RuJ49wvrYu8FtZKzz8HgrRLLuFu8Aa/A0dJ7yS2tBJcItgkvFU0/aXqXxPPzGDL1K6IlISV7+35V2/+b6afrp5EST/AhZrCJ/lt7hUGNkHLvQQkz+gVMaYOA2A3bcw7XzvdAS3NE/fEIPhQflM9BYZFHyXqb836jYE9OEs+mytFnhq+CnzclDctzAd0PGOcjdsy6msxwC2HtpJGcbc/NK5vxq8MsMQxbq4dBzoKShyhmmUp6m7up6xLn5JXEJkk2A39L33Yv2vaREj51/DyhPkkfbJtOKL41wL55UqYqxY4DNLBYuXHy5RDZgmi0=";
    photopay.engineLocation = window.location.origin;
    photopay.recognizers = ["CroatiaPdf417PaymentRecognizer"];
    photopay.addEventListener("fatalError", (ev: CustomEventInit<EventFatalError>) => {
        const fatalError = ev.detail;
        console.log("Could not load UI component", fatalError);
    });
    photopay.addEventListener("scanError", (ev: CustomEventInit<EventScanError>) => {
        const scanError = ev.detail;
        console.log("Could not scan a document", scanError);
    });
    photopay.addEventListener("scanSuccess", (ev: CustomEventInit<EventScanSuccess>) => {
        const scanResults = ev.detail;
        console.log("Scan results", scanResults);
    });
}

window.addEventListener("DOMContentLoaded", () => initializeUiComponent());

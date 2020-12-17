//backend.js, Developed by Pirjot Atwal
//A fully client-side web-browser solution to the Google Sheets API
//Check console.developers.google.com for Web Settings (Domain Admittance)

console.log("Pirjot Atwal Backend JS running...");
var sheet = null;


// API key from the Developer Console
var API_KEY = 'API Key';
var cred = null;
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/drive";

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client', initClient());
}

/** initClient()
 * This function authenticates and initializes the GAPI in two
 * different steps so as to avoid any required input from the
 * client. Using the credentials from a pre-authenticated
 * service user account, a JWT access token can be generated
 * and used to authorize GAPI (with preincluded drive scope and 
 * email) bypassing the need for a SignInAuth by the user.
 * The function will also initialize a single sheet variable,
 * passing in some parameters that may be unnecessary (TODO).
 * The source of this code is a combination of multiple slack
 * issues and solution code found online.
 * @author Pirjot Atwal
 */
async function initClient() {
    cred = await fetch("./service_user_credentials.json").then(
        response => {
            return response.json();
        });
    var pHeader = {
        "alg": "RS256",
        "typ": "JWT"
    }
    var sHeader = JSON.stringify(pHeader);
    var pClaim = {};
    pClaim.aud = "https://www.googleapis.com/oauth2/v3/token";
    pClaim.scope = "https://www.googleapis.com/auth/drive";
    pClaim.iss = cred.client_email;
    pClaim.exp = KJUR.jws.IntDate.get("now + 1hour");
    pClaim.iat = KJUR.jws.IntDate.get("now");

    var sClaim = JSON.stringify(pClaim);

    var key = cred.private_key;
    var sJWS = KJUR.jws.JWS.sign(null, sHeader, sClaim, key);

    var XHR = new XMLHttpRequest();
    var urlEncodedData = "";
    var urlEncodedDataPairs = [];

    urlEncodedDataPairs.push(encodeURIComponent("grant_type") + '=' +
        encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer"));
    urlEncodedDataPairs.push(encodeURIComponent("assertion") + '=' + encodeURIComponent(sJWS));
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    // We define what will happen if the data are successfully sent
    XHR.addEventListener('load', function (event) {
        var response = JSON.parse(XHR.responseText);
        gapi.auth.setToken({
            access_token: response["access_token"]
        });
        gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS
        }).then(function () {
            sheet = new Sheet(prompt(), API_KEY, CLIENT_ID, gapi.auth.getToken());
        }, function (error) {
            appendPre(JSON.stringify(error, null, 2));
        });
    });

    // We define what will happen in case of error
    XHR.addEventListener('error', function (event) {
        console.log('Oops! Something went wrong.');
        console.log(event);
    });

    XHR.open('POST', 'https://www.googleapis.com/oauth2/v3/token');
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    XHR.send(urlEncodedData);
}


/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}


function clearPre() {
    var pre = document.getElementById('content');
    pre.textContent = "";
}

//TODO: Parsing should be moved to its own script file.
function pushValue() {
    var form = document.getElementById("input1");
    var pushMe = form.value;
    //Clear Input Node
    form.value = "";
    //Push Default value, else push values separated by " "
    if (pushMe == "") {
        sheet.addRow(["Col1", "Col2", "Col3", "Col4"]);
    } else {
        sheet.addRow(pushMe.split(" "));
    }
}
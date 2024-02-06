import electron from "electron";
import { URL } from "url";

// Convert headers to a Kebab like case style
function normalizeHeaders(responseHeaders: Record<string, string[]> = { }) {
  const headers: Record<string, string[]> = {};

  for (const key in responseHeaders) {
    if (Object.prototype.hasOwnProperty.call(responseHeaders, key)) {
      headers[key.toLowerCase().replace(/(^|-)\D/g, (string) => string.toUpperCase())] = responseHeaders[key];
    };
  };

  return headers;
}

electron.app.whenReady().then(() => {
  electron.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders, resourceType, frame } = details;

    const headers = normalizeHeaders(responseHeaders);

    delete headers["Content-Security-Policy"];
    
    if (frame && frame.url) {      
      headers["Access-Control-Allow-Origin"] = [
        new URL(frame.url).origin
      ];
    }

    if (resourceType === "stylesheet") {
      headers["Content-Type"] = [ "text/css" ];
    }

    callback({ 
      cancel: false, 
      responseHeaders: headers
    });
  });
});
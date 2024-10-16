import electron from "electron";
import { URL } from "url";

// Convert headers to a Kebab like case style
function normalizeHeaders(responseHeaders: Record<string, string[]> = { }) {
  const headers: Record<string, string[]> = {};

  for (const key in responseHeaders) {
    if (Object.prototype.hasOwnProperty.call(responseHeaders, key)) {
      headers[key.toLowerCase()] = responseHeaders[key];
    }
  }

  return headers;
}

electron.app.whenReady().then(() => {
  electron.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders, resourceType, frame } = details;

    const headers = normalizeHeaders(responseHeaders);

    delete headers["content-security-policy"];
    delete headers["content-security-policy-report-only"];
    delete headers["x-frame-options"];

    if (frame && frame.url) {      
      headers["access-control-allow-origin"] = [
        new URL(frame.url).origin
      ];
    }

    if (resourceType === "stylesheet") {
      headers["content-type"] = [ "text/css" ];
    }

    callback({ 
      cancel: false, 
      responseHeaders: headers as Record<string, string[]>
    });
  });
});
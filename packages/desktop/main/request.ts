import electron from "electron";
import { URL } from "node:url";

// To not cause duplicates because headers aren't really case sensitive, we delete all of the headers that match
function deleteHeader(responseHeaders: Record<string, string[]>, header: string) {
  const headerToDelete = header.toLowerCase();

  for (const header in responseHeaders) {
    if (Object.prototype.hasOwnProperty.call(responseHeaders, header)) {
      if (!header.toLowerCase().startsWith(headerToDelete)) continue;
      delete responseHeaders[header];
    };
  };
};

electron.app.whenReady().then(() => {
  electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders, url: requestedURL, resourceType }, callback) => {
    const url = new URL(requestedURL);

    if (responseHeaders) {
      deleteHeader(responseHeaders, "Content-Security-Policy");

      const vxCors = url.searchParams.get("vx-cors");
      
      if (vxCors === "true") {
        // Sometimes electron just ignores this?
        deleteHeader(responseHeaders, "Access-Control-Allow-Origin");
        responseHeaders["Access-Control-Allow-Origin"] = [ "*" ];
      };

      if (resourceType === "stylesheet") {
        deleteHeader(responseHeaders, "Content-Type");
        responseHeaders["Content-Type"] = [ "text/css" ];
      };
    };

    callback({ 
      cancel: false, 
      responseHeaders
    });
  });
});
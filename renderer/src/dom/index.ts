import { whenDocumentReady } from "renderer/util";

export const head = document.createElement("vx-head");
export const body = document.createElement("vx-body");

whenDocumentReady(() => {
  document.head.appendChild(head);
  document.body.appendChild(body);
});

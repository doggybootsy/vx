import electron from "electron";
import { replaceNodeModuleExports } from "common/node";
import { BrowserWindow } from "./window";

import "./ipc";
import "./request";

replaceNodeModuleExports("electron", { ...electron, BrowserWindow });
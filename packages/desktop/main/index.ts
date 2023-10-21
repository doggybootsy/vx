console.log("Welcome to VX");

import electron from "electron";

import { replaceNodeModuleExports } from "common/node";
import { BrowserWindow } from "./window";
import { loadExtensions } from "./extensions";

import "./ipc";
import "./request";

replaceNodeModuleExports("electron", { ...electron, BrowserWindow });

electron.app.whenReady().then(loadExtensions);
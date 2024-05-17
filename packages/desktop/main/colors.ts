import electron, { BrowserWindow, systemPreferences } from "electron";

// Every color from 'Electron.SystemPreferences.getColor' typings
const colors = <const>[
	"3d-dark-shadow",
	"3d-face",
	"3d-highlight",
	"3d-light",
	"3d-shadow",
	"active-border",
	"active-caption",
	"active-caption-gradient",
	"app-workspace",
	"button-text",
	"caption-text",
	"desktop",
	"disabled-text",
	"highlight",
	"highlight-text",
	"hotlight",
	"inactive-border",
	"inactive-caption",
	"inactive-caption-gradient",
	"inactive-caption-text",
	"info-background",
	"info-text",
	"menu",
	"menu-highlight",
	"menubar",
	"menu-text",
	"scrollbar",
	"window",
	"window-frame",
	"window-text",
	"alternate-selected-control-text",
	"control-background",
	"control",
	"control-text",
	"disabled-control-text",
	"find-highlight",
	"grid",
	"header-text",
	"highlight",
	"keyboard-focus-indicator",
	"label",
	"link",
	"placeholder-text",
	"quaternary-label",
	"scrubber-textured-background",
	"secondary-label",
	"selected-content-background",
	"selected-control",
	"selected-control-text",
	"selected-menu-item-text",
	"selected-text-background",
	"selected-text",
	"separator",
	"shadow",
	"tertiary-label",
	"text-background",
	"text",
	"under-page-background",
	"unemphasized-selected-content-background",
	"unemphasized-selected-text-background",
	"unemphasized-selected-text",
	"window-background",
	"window-frame-text"
];

electron.ipcMain.on("@vx/color/get", (event) => {
	const $colors: Record<string, string> = {};

	if (process.platform === "win32" || process.platform === "darwin") {
		// Dont use yet | Not standard for discord client modding

		// for (const color of colors) {
		// 	try {
		// 		$colors[color] = systemPreferences.getColor(color);
		// 	} 
		// 	catch (error) {
		// 		// Color isn't available
		// 	}
		// }
	
		$colors["accent-color"] = `#${systemPreferences.getAccentColor()}`;
	}

  event.returnValue = $colors;
});

systemPreferences.on("accent-color-changed", () => {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send("@vx/color/update");
  }
});

// systemPreferences.on("color-changed", () => {
//   for (const window of BrowserWindow.getAllWindows()) {
//     window.webContents.send("@vx/color/update");
//   }
// });
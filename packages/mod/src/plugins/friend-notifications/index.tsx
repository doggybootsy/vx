import {definePlugin} from "../index";
import {Developers} from "../../constants";

function getColorFromStatus(status: string): string {
    switch (status) {
        case "Online":
            return "green";
        case "Offline":
            return "red";
        case "Busy":
            return "orange";
        case "Away":
            return "yellow";
        default:
            return "gray";
    }
}

export default definePlugin(
    {
        authors: [ Developers.kaan ],
        requiresRestart: false,
        start() {
            
        }
    }
)
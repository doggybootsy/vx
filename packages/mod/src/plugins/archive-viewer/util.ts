import {getMangledProxy} from "@webpack";

export const textFileUtils = getMangledProxy<{ isPlaintextPreviewableFile: (name: string) => boolean, plaintextPreviewableFiles: Set<string> }>('"powershell","ps","ps1"', {
    plaintextPreviewableFiles: (m) => m instanceof Set,
    isPlaintextPreviewableFile: (m) => m instanceof Function
});
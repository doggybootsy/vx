import { Icons } from "../../components";

export function CodeFile() {
    return (
        <svg className="file-icon" viewBox="0 0 16 16" fill="currentColor">
            <path
                d="M 2 1.75 C 2 0.784 2.784 0 3.75 0 h 6.586 c 0.464 0 0.909 0.184 1.237 0.513 l 2.914 2.914 c 0.329 0.328 0.513 0.773 0.513 1.237 v 9.586 A 1.75 1.75 0 0 1 13.25 16 h -9.5 A 1.75 1.75 0 0 1 2 14.25 Z m 1.75 -0.25 a 0.25 0.25 0 0 0 -0.25 0.25 v 12.5 c 0 0.138 0.112 0.25 0.25 0.25 h 9.5 a 0.25 0.25 0 0 0 0.25 -0.25 V 6 h -2.75 A 1.75 1.75 0 0 1 9 4.25 V 1.5 Z m 6.75 0.062 V 4.25 c 0 0.138 0.112 0.25 0.25 0.25 h 2.688 l -0.011 -0.013 l -2.914 -2.914 l -0.013 -0.011 Z M 7 8 C 7 7 7 7 6 7 L 4 9 C 4 9 3 10 4 11 L 6 13 C 7 13 7 13 7 12 L 5 10 L 7 8 M 11 9 L 10 8 C 10 7 10 7 11 7 L 13 9 C 14 10 13 11 13 11 L 11 13 C 10 13 10 13 10 12 L 12 10 L 11 9"/>
        </svg>
    )
}

const imageFileTypes = ['.png', '.jpg', '.jpeg', '.gif'];
const videoFileTypes = ['.mp4', '.avi', '.mov', '.mkv'];
const codeFileTypes = ['.js', '.jsx', '.ts', '.tsx', '.cpp', '.cs', '.java', '.py', '.html', '.css', '.scss', '.json', '.xml', '.yaml', '.txt', '.md', '.sql', '.rb', '.go', '.php', '.swift', '.rs', '.pl', '.lua', '.dart', '.kotlin', '.r','.powershell','.ps1','.ps','.php'];

export const FileIcon = ({ type, name }) => {
    const ext = name.slice(name.lastIndexOf('.'));

    if (imageFileTypes.includes(ext)) return <Icons.Image />;
    if (videoFileTypes.includes(ext)) return <Icons.Movie />;
    if (codeFileTypes.includes(ext)) return <CodeFile />;

    return type === 'dir' ? (
        <svg className="file-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H7.5c-.55 0-1.07-.26-1.4-.7l-.9-1.2a.25.25 0 0 0-.2-.1H1.75Z" />
        </svg>
    ) : (
        <svg className="file-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z" />
        </svg>
    );
};
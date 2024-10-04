import { Icons } from "../../components";

import React from 'react';

export const FileIcon = ({ type, name }) => {
    const icons = {
        '.png': <Icons.Image />,
        '.jpg': <Icons.Image />,
        '.jpeg': <Icons.Image />,
        '.gif': <Icons.Image />,
        '.mp4': <Icons.Movie />,
        '.avi': <Icons.Movie />,
        '.mov': <Icons.Movie />,
        '.mkv': <Icons.Movie />,
        '.js': <Icons.Code />,
        '.jsx': <Icons.Code />,
        '.ts': <Icons.Code />,
        '.tsx': <Icons.Code />,
        '.cpp': <Icons.Code />,
        '.cs': <Icons.Code />,
        '.java': <Icons.Code />,
        '.py': <Icons.Code />,
    };

    const ext = name.slice(name.lastIndexOf('.')); // Get the file extension

    return (
        icons[ext] || (type === 'dir' ? (
            <svg className="file-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H7.5c-.55 0-1.07-.26-1.4-.7l-.9-1.2a.25.25 0 0 0-.2-.1H1.75Z" />
            </svg>
        ) : (
            <svg className="file-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z" />
            </svg>
        ))
    );
};


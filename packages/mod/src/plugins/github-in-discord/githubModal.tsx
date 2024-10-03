import React, { useState, useEffect } from 'react';
import {ModalComponents, openCodeModal, openImageModal} from '../../api/modals';
import {SystemDesign} from "../../components";

const GitHubIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width={size}
        height={size}
        fill={color}
    >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.54 5.47 7.59.4.07.55-.17.55-.39 0-.19-.01-.69-.01-1.35-2.01.44-2.43-.48-2.58-.92-.09-.22-.47-.92-.81-1.11-.28-.16-.67-.56-.01-.57.62-.01 1.07.57 1.21.81.71 1.18 1.86.84 2.31.64.07-.51.28-.84.51-1.03-1.77-.2-2.89-.87-2.89-3.85 0-.85.3-1.55.79-2.1-.08-.2-.34-1.02.07-2.12 0 0 .66-.21 2.15.81A7.55 7.55 0 018 3.2c.66.003 1.32.09 1.93.26 1.48-1.02 2.15-.81 2.15-.81.41 1.1.15 1.92.07 2.12.49.55.79 1.25.79 2.1 0 2.99-1.12 3.65-2.89 3.85.3.27.59.8.59 1.62 0 1.17-.01 2.12-.01 2.41 0 .22.15.46.55.39C13.71 14.54 16 11.54 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
);

interface GitHubUrlInfo {
    user: string;
    repo: string;
    branch: string;
    path?: string;
};

class GitHubService {
    private readonly token: any;
    private readonly baseURL: string;

    constructor(token = null) {
        this.token = token;
        this.baseURL = 'https://api.github.com';
    }

    decodeContent(content: string): string {
        return atob(content);
    }

    async getForks(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/forks`;
        const forks = await this.fetchFromGitHub(endpoint);
        return forks.map((fork) => ({
            label: `${fork.owner.login} / ${fork.name}`,
            value: fork
        }));
    }

    async openFile(url: string)
    {
        await this.fetchFromGitHub(url, true).then(res => {
            const regex = /\w+\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
            if (res.download_url && regex.test(res.download_url))
            {
                openImageModal(res.download_url);
                return;
            }
            openCodeModal({
                code: this.decodeContent(res.content),
                language: res.name.split(".").pop(),
                filename: res.name
            });
        });
    }


    async fetchFromGitHub(endpoint: string, overrideURL: boolean = false): Promise<any> {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        const response = await fetch(`${overrideURL ? "" : this.baseURL}${endpoint}`, { headers });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return response.json();
    }

    parseGitHubUrl(url: string): GitHubUrlInfo | null {
        if (typeof url !== 'string') {
            throw new TypeError('url must be a string');
        }

        const pattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/(?:tree|blob)\/([^\/]+)(?:\/(.+))?)?/;
        const match = url.match(pattern);

        if (!match) {
            return null;
        }

        const [, user, repo, branch, path] = match;
        return {
            user,
            repo,
            branch: branch || 'main',
            path: path || ''
        };
    }

    async getRepoInfo(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}`;
        return this.fetchFromGitHub(endpoint);
    }

    async getContributors(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/contributors`;
        return this.fetchFromGitHub(endpoint);
    }


    async getRepoFiles(url: string | GitHubUrlInfo) {
        let repoInfo: GitHubUrlInfo;

        if (typeof url === 'string') {
            repoInfo = this.parseGitHubUrl(url);
            if (!repoInfo) {
                throw new Error('Invalid GitHub URL');
            }
        } else if (typeof url === 'object' && url !== null) {
            repoInfo = url;
        } else {
            throw new TypeError('url must be a string or a GitHubUrlInfo object') // this happened at some point? how idk. my coding doggy... haha get it ?
        }

        const { user, repo, branch, path } = repoInfo;
        let endpoint = `/repos/${user}/${repo}/contents`;
        if (path) {
            endpoint += `/${path}`;
        }
        endpoint += `?ref=${branch}`;

        return this.fetchFromGitHub(endpoint);
    }
}

const FileIcon = ({ type }) => (
    <svg className="file-icon" viewBox="0 0 16 16" fill="currentColor">
        {type === 'dir' ? (
            <path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H7.5c-.55 0-1.07-.26-1.4-.7l-.9-1.2a.25.25 0 0 0-.2-.1H1.75Z" />
        ) : (
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z" />
        )}
    </svg>
);

const GitHubModal = ({ url, onClose, props }) => {
    const [files, setFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [repoInfo, setRepoInfo] = useState<GitHubUrlInfo>(null);
    const [forks, setForks] = useState(0);
    const [stars, setStars] = useState(0);
    const [contributors, setContributors] = useState(0);
    const [forksList, setForksList] = useState([]);
    const [selectedFork, setSelectedFork] = useState<GitHubUrlInfo>(null);

    const githubService = new GitHubService();

    useEffect(() => {
        loadFiles('');
    }, [url]);

    const loadFiles = async (path) => {
        setLoading(true);
        try {
            const parsedInfo = githubService.parseGitHubUrl(url);
            if (!parsedInfo) throw new Error('Invalid GitHub URL');

            const updatedInfo = {
                ...parsedInfo,
                path: path || parsedInfo.path
            };
            setRepoInfo(updatedInfo);

            const files = await githubService.getRepoFiles(updatedInfo);
            setFiles(Array.isArray(files) ? files : []);

            const forks = await githubService.getForks(updatedInfo.user, updatedInfo.repo);
            setForksList(forks);

            updateBreadcrumbs(path);
        } catch (error) {
            console.error('Error loading files:', error);
        }
        setLoading(false);
    };

    const selectFork = async (forkInfo) => {
        const forkedRepoUrl = `https://github.com/${forkInfo.owner.login}/${forkInfo.name}`;
        setSelectedFork(githubService.parseGitHubUrl(forkedRepoUrl));
        await loadFiles('');
    };


    const navigateToFolder = (path: React.SetStateAction<string>) => {
        setCurrentPath(path);
        loadFiles(path);
    };

    const updateBreadcrumbs = (path: string) => {
        const parts = path.split('/').filter(Boolean);
        const newBreadcrumbs = parts.map((part: any, index: number) => ({
            label: part,
            path: parts.slice(0, index + 1).join('/')
        }));
        setBreadcrumbs(newBreadcrumbs);
    };

    return (
        <ModalComponents.ModalRoot className="modal" {...props} size={ModalComponents.ModalSize.LARGE}>
            <ModalComponents.ModalHeader className="modal-header">
                <div className="modal-header-title">
                    <GitHubIcon size={24} />
                    <span>{repoInfo?.repo || 'GitHub Repository'}</span>
                </div>
                <div className="repo-stats">
                    <span><strong>Stars:</strong> {stars}</span>
                    <span><strong>Forks:</strong> {forks}</span>
                    <span><strong>Contributors:</strong> {contributors}</span>
                </div>
                <SystemDesign.SearchableSelect placeholder={"Select Fork"} options={forksList} value={null} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                    selectFork(event);
                }} >

                </SystemDesign.SearchableSelect>
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
            </ModalComponents.ModalHeader>

            <ModalComponents.Content className="modal-content">
                <div className="breadcrumbs">
                    <button className="breadcrumb-button" onClick={() => navigateToFolder('')}>
                        Home
                    </button>
                    {breadcrumbs.map((breadcrumb: any, index) => (
                        <React.Fragment key={index}>
                            <span className="breadcrumb-separator">/</span>
                            <button
                                className="breadcrumb-button"
                                onClick={() => navigateToFolder(breadcrumb.path)}
                            >
                                {breadcrumb.label}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="file-list">
                        {files.map((file: any) => (
                            <button
                                key={file.path}
                                className="file-item"
                                onClick={() =>
                                    file.type === 'dir'
                                        ? navigateToFolder(file.path)
                                        : githubService.openFile(file.url)
                                }
                            >
                                <FileIcon type={file.type} />
                                <span>{file.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </ModalComponents.Content>
        </ModalComponents.ModalRoot>
    );
};



export default GitHubModal;
import React, { useState, useEffect } from 'react';
import {ModalComponents, openCodeModal, openImageModal} from '../../api/modals';
import {SystemDesign} from "../../components";
import {Github} from "../../components/icons";
import {settings} from "./index";

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

    async getBranches(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/branches`;
        return this.fetchFromGitHub(endpoint);
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

        if (settings.githubToken.get()) {
            headers['Authorization'] = `Bearer ${settings.githubToken.get()}`;
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
        const repoInfo = await this.fetchFromGitHub(endpoint);
        return {
            ...repoInfo,
            default_branch: repoInfo.default_branch
        };
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
            throw new TypeError('url must be a string or a GitHubUrlInfo object');
        }

        const { user, repo, path } = repoInfo;

        const repoDetails = await this.getRepoInfo(user, repo);
        const defaultBranch = repoDetails.default_branch;

        let endpoint = `/repos/${user}/${repo}/contents`;
        if (path) {
            endpoint += `/${path}`;
        }

        try {
            return await this.fetchFromGitHub(`${endpoint}?ref=${defaultBranch}`);
        } catch (error) {
            console.error(`Error loading files from ${defaultBranch}:`, error);
            throw error;
        }
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
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(repoInfo?.branch || 'main');
    const [selectedFork, setSelectedFork] = useState<GitHubUrlInfo>(null);

    const githubService = new GitHubService();

    useEffect(() => {
        const parsedInfo = githubService.parseGitHubUrl(url);
        if (parsedInfo) {
            setRepoInfo(parsedInfo);
            setSelectedBranch(parsedInfo.branch || 'main');
            loadFiles(currentPath);
        }
    }, [url]);

    const loadFiles = async (path) => {
        setLoading(true);
        try {
            let parsedInfo;

            if (selectedFork) {
                parsedInfo = {
                    user: selectedFork.user,
                    repo: selectedFork.repo,
                    branch: selectedBranch || selectedFork.branch,
                    path: path || ''
                };
            } else {
                parsedInfo = githubService.parseGitHubUrl(url);
                if (!parsedInfo) throw new Error('Invalid GitHub URL');
                parsedInfo = {
                    ...parsedInfo,
                    path: path || parsedInfo.path,
                    branch: selectedBranch || parsedInfo.branch
                };
            }

            setRepoInfo(parsedInfo);

            const files = await githubService.getRepoFiles(parsedInfo);
            setFiles(Array.isArray(files) ? files : []);

            if (!selectedFork) {
                const forks = await githubService.getForks(parsedInfo.user, parsedInfo.repo);
                setForksList(forks);

                const branches = await githubService.getBranches(parsedInfo.user, parsedInfo.repo);
                setBranches(branches.map(branch => ({ label: branch.name, value: branch.name })));
            }

            updateBreadcrumbs(path);
        } catch (error) {
            console.error('Error loading files:', error);
        }
        setLoading(false);
    };

    const selectFork = async (forkInfo) => {
        if (!forkInfo) return;

        const newForkInfo = {
            user: forkInfo.owner.login,
            repo: forkInfo.name,
            branch: forkInfo.default_branch,
            path: ''
        };

        setSelectedFork(newForkInfo);
        setSelectedBranch(forkInfo.default_branch);

        const parsedInfo = {
            user: newForkInfo.user,
            repo: newForkInfo.repo,
            branch: forkInfo.default_branch,
            path: ''
        };

        setLoading(true);
        try {
            const files = await githubService.getRepoFiles(parsedInfo);
            setFiles(Array.isArray(files) ? files : []);

            const branches = await githubService.getBranches(parsedInfo.user, parsedInfo.repo);
            setBranches(branches.map(branch => ({ label: branch.name, value: branch.name })));

            updateBreadcrumbs('');
        } catch (error) {
            console.error('Error loading fork:', error);
        }
        setLoading(false);
    };



    const navigateToFolder = async (path: React.SetStateAction<string>) => {
        setCurrentPath(path);
        await loadFiles(path);
    };

    const updateBreadcrumbs = (path: string) => {
        const parts = path.split('/').filter(Boolean);
        const newBreadcrumbs = parts.map((part: any, index: number) => ({
            label: part,
            path: parts.slice(0, index + 1).join('/')
        }));
        setBreadcrumbs(newBreadcrumbs);
    };

    /*
    <SystemDesign.SearchableSelect
                    placeholder={"Select Branch"}
                    options={branches}
                    value={selectedBranch}
                    onChange={async (event: React.SetStateAction<string>) => {
                        setSelectedBranch(event);
                        await loadFiles(currentPath);
                        await navigateToFolder('')
                    }}
                />
     */
    
    return (
        <ModalComponents.ModalRoot className="modal" {...props} size={ModalComponents.ModalSize.LARGE}>
            <ModalComponents.ModalHeader className="modal-header">
                <div className="modal-header-title">
                    <Github size={24} />
                    <span>{repoInfo?.repo || 'GitHub Repository'}</span>
                </div>
                <div className="repo-stats">
                    <span><strong>Stars:</strong> {stars}</span>
                    <span><strong>Forks:</strong> {forks}</span>
                    <span><strong>Contributors:</strong> {contributors}</span>
                </div>
                <SystemDesign.SearchableSelect
                    placeholder={"Select Fork"}
                    options={forksList}
                    value={selectedFork}
                    onChange={async (event) => {
                        const forkInfo = forksList.find(fork => fork.value.id === event.id)?.value;
                        await selectFork(forkInfo);
                    }}
                />
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
            </ModalComponents.ModalHeader>

            <ModalComponents.Content className="modal-content">
                <div className="breadcrumbs">
                    <button className="breadcrumb-button" onClick={async () => await navigateToFolder('')}>
                        Home
                    </button>
                    {breadcrumbs.map((breadcrumb: any, index) => (
                        <React.Fragment key={index}>
                            <span className="breadcrumb-separator">/</span>
                            <button
                                className="breadcrumb-button"
                                onClick={async () => await navigateToFolder(breadcrumb.path)}
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
                                onClick={async () =>
                                    file.type === 'dir'
                                        ? await navigateToFolder(file.path)
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
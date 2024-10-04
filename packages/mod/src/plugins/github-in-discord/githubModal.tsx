import React, { useState, useEffect } from 'react';
import {ModalComponents, openCodeModal, openImageModal} from '../../api/modals';
import {Button, Flex, Markdown, SystemDesign} from "../../components";
import {Github} from "../../components/icons";
import {settings} from "./index";

interface GitHubUrlInfo {
    user: string;
    repo: string;
    branch: string;
    path?: string;
}

class GitHubService {
    private readonly baseURL: string;

    constructor() {
        this.baseURL = 'https://api.github.com';
    }

    decodeContent(content: string): string {
        return atob(content);
    }

    async getForks(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/forks`;
        const forks = await this.fetchFromGitHub(endpoint);
        return forks.map((fork: { owner: { login: any; }; name: any; }) => ({
            label: `${fork.owner.login} / ${fork.name}`,
            value: fork
        }));
    }

    async getBranches(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/branches`;
        return this.fetchFromGitHub(endpoint);
    }

    async openFile(url: string) {
        await this.fetchFromGitHub(url, true).then(res => {
            const regex = /\w+\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
            if (res.download_url && regex.test(res.download_url)) {
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
            // @ts-ignore
            headers['Authorization'] = `Bearer ${settings.githubToken.get()}`;
        }

        const response = await fetch(`${overrideURL ? "" : this.baseURL}${endpoint}`, {headers});

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return response.json();
    }

    async parseGitHubUrl(url: string): Promise<{
        path: string;
        repo: string;
        defaultBranch: any;
        user: string;
        branch: any
    }> {
        if (typeof url !== 'string') {
            throw new TypeError('url must be a string');
        }

        const pattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/(?:tree|blob)\/([^\/]+)(?:\/(.+))?)?/;
        const match = url.match(pattern);

        if (!match) {
            return;
        }

        const [, user, repo, branch, path] = match;

        try {
            const repoInfo = await this.getRepoInfo(user, repo);

            return {
                user,
                repo,
                branch: branch || repoInfo.default_branch,
                defaultBranch: repoInfo.default_branch,
                path: path || ''
            };
        } catch (error) {
            console.error('Error fetching repository information:', error);
            throw error;
        }
    }

    async getRepoInfo(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}`;
        const repoInfo = await this.fetchFromGitHub(endpoint);
        return {
            ...repoInfo,
            default_branch: repoInfo.default_branch
        };
    }

    async getPullRequests(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/pulls`;
        return this.fetchFromGitHub(endpoint);
    }

    async getIssues(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/issues`;
        return this.fetchFromGitHub(endpoint);
    }

    async getContributors(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/contributors`;
        return this.fetchFromGitHub(endpoint);
    }

    async getReleases(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/releases`;
        return this.fetchFromGitHub(endpoint);
    }
    
    async getRepoFiles(url: { path: string }) {
        let repoInfo: GitHubUrlInfo;

        if (typeof url === 'string') {
            repoInfo = await this.parseGitHubUrl(url);
            if (!repoInfo) {
                throw new Error('Invalid GitHub URL');
            }
        } else if (typeof url === 'object' && url !== null) {
            repoInfo = url;
        } else {
            throw new TypeError('url must be a string or a GitHubUrlInfo object');
        }

        const {user, repo, path, branch} = repoInfo;

        // this was my BIGGEST issue bruh.. default branch main/master? nah some random stuff
        let useBranch = branch;
        if (!useBranch) {
            const repoDetails = await this.getRepoInfo(user, repo);
            useBranch = repoDetails.default_branch;
        }

        let endpoint = `/repos/${user}/${repo}/contents`;
        if (path) {
            endpoint += `/${path}`;
        }  

        try {
            return await this.fetchFromGitHub(`${endpoint}?ref=${useBranch}`);
        } catch (error) {
            const repoDetails = await this.getRepoInfo(user, repo);
            return await this.fetchFromGitHub(`${endpoint}?ref=${repoDetails.default_branch}`);
        }
    }
}

// @ts-ignore
const FileIcon = ({ type }) => (
    <svg className="file-icon" viewBox="0 0 16 16" fill="currentColor">
        {type === 'dir' ? (
            <path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H7.5c-.55 0-1.07-.26-1.4-.7l-.9-1.2a.25.25 0 0 0-.2-.1H1.75Z" />
        ) : (
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z" />
        )}
    </svg>
);


interface GitHubModalProps {
    url: string;
    onClose: () => void;
    props: any[],
}

interface FileItem {
    url: string;
    name: string;
    type: 'dir' | 'file';
    path: string;
    download_url?: string;
}

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
    </svg>
);

export const themes = [
    { label: 'Dark', themeName: 'dark', value: 'dark' },
    { label: 'Light', themeName: 'light', value: 'light' },
    { label: 'Contrast', themeName: 'contrast', value: 'contrast' },
    { label: 'Dark High Contrast', themeName: 'dark-high-contrast', value: 'dark-high-contrast' },
    { label: 'Light Colorblind', themeName: 'light-colorblind', value: 'light-colorblind' },
    { label: 'Dark Colorblind', themeName: 'dark-colorblind', value: 'dark-colorblind' },
    { label: 'Random 1', themeName: 'random-1', value: 'random-1' },
    { label: 'Random 2', themeName: 'random-2', value: 'random-2' },
    { label: 'Random 3', themeName: 'random-3', value: 'random-3' },
    { label: 'Solarized Dark', themeName: 'solarized-dark', value: 'solarized-dark' },
    { label: 'Solarized Light', themeName: 'solarized-light', value: 'solarized-light' },
    { label: 'Monokai', themeName: 'monokai', value: 'monokai' },
    { label: 'Dracula', themeName: 'dracula', value: 'dracula' },
    { label: 'Oceanic', themeName: 'oceanic', value: 'oceanic' },
    { label: 'Forest Green', themeName: 'forest-green', value: 'forest-green' },
    { label: 'Lava Red', themeName: 'lava-red', value: 'lava-red' },
    { label: 'Twilight', themeName: 'twilight', value: 'twilight' },
    { label: 'Purple Night', themeName: 'purple-night', value: 'purple-night' },
    { label: 'Retro Green', themeName: 'retro-green', value: 'retro-green' },
    { label: 'Vibrant Yellow', themeName: 'vibrant-yellow', value: 'vibrant-yellow' },
    { label: 'Cyberpunk', themeName: 'cyberpunk', value: 'cyberpunk' },
    { label: 'Nebula', themeName: 'nebula', value: 'nebula' },
    { label: 'Mint Green', themeName: 'mint-green', value: 'mint-green' },
];



const GitHubModal: React.FC<GitHubModalProps> = ({ url, onClose, props }) => {
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [repoInfo, setRepoInfo] = useState<GitHubUrlInfo | null>(null);
    const [forksList, setForksList] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedFork, setSelectedFork] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [contributors, setContributors] = useState([]);
    const [releases, setReleases] = useState([]);
    const [pullRequests, setPullRequests] = useState([]);
    const [issues, setIssues] = useState([]);
    const [currentPage, setCurrentPage] = useState<'files' | 'releases' | 'pullRequests' | 'issues'>('files');
    const [theme, setTheme] = useState<'dark' | 'light'>(settings.theme.get())

    const githubService = new GitHubService();

    useEffect(() => {
        initializeRepo();
        document.documentElement.setAttribute('data-theme', theme);
    }, [url, theme]);

    const loadFiles = async (info: GitHubUrlInfo | null, path: string[] = []) => {
        try {
            setLoading(true);
            const filesData = await githubService.getRepoFiles({
                ...info,
                path: path.join('/')
            });
            setFiles(Array.isArray(filesData) ? filesData : [filesData]);
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileClick = async (file: FileItem) => {
        if (file.type === 'dir') {
            const newPath = [...currentPath, file.name];
            setCurrentPath(newPath);
            await loadFiles(repoInfo, newPath);
        } else {
            await githubService.openFile(file.url);
        }
    };

    const navigateToBreadcrumb = async (index: number) => {
        const newPath = index === -1 ? [] : currentPath.slice(0, index + 1);
        setCurrentPath(newPath);
        await loadFiles(repoInfo, newPath);
    };

    const handleBranchChange = async (event: React.SetStateAction<string>) => {
        setSelectedBranch(event);
        const updatedRepoInfo = {
            ...repoInfo,
            branch: event
        };
        setRepoInfo(updatedRepoInfo);
        await loadFiles(updatedRepoInfo, currentPath);
    };

    const handleForkChange = async (event) => {
        setSelectedFork(event);
        const newRepoInfo = {
            user: event.owner.login,
            repo: event.name,
            branch: event.default_branch,
            defaultBranch: event.default_branch
        };
        setRepoInfo(newRepoInfo);
        setCurrentPath([]);
        setSelectedBranch(event.default_branch);

        const branchesData = await githubService.getBranches(newRepoInfo.user, newRepoInfo.repo);
        setBranches(branchesData.map((branch: { name: any; }) => ({
            label: branch.name,
            value: branch.name
        })));

        await loadFiles(newRepoInfo, []);
    };

    const initializeRepo = async () => {
        try {
            setLoading(true);
            const urlInfo = await githubService.parseGitHubUrl(url);

            const repoDetails = await githubService.getRepoInfo(urlInfo.user, urlInfo.repo);
            const defaultBranch = repoDetails.default_branch;

            const fullRepoInfo = {
                ...urlInfo,
                branch: urlInfo.branch || defaultBranch,
                defaultBranch
            };

            setRepoInfo(fullRepoInfo);

            const [forks, branchesData, contributorsData, releasesData, pullRequestsData, issuesData] = await Promise.all([
                githubService.getForks(fullRepoInfo.user, fullRepoInfo.repo),
                githubService.getBranches(fullRepoInfo.user, fullRepoInfo.repo),
                githubService.getContributors(fullRepoInfo.user, fullRepoInfo.repo),
                githubService.getReleases(fullRepoInfo.user, fullRepoInfo.repo),
                githubService.getPullRequests(fullRepoInfo.user, fullRepoInfo.repo),
                githubService.getIssues(fullRepoInfo.user, fullRepoInfo.repo)
            ]);

            setForksList(forks);
            setBranches(branchesData.map((branch: { name: any; }) => ({
                label: branch.name,
                value: branch.name
            })));
            setContributors(contributorsData);
            setReleases(releasesData);
            setPullRequests(pullRequestsData);
            setIssues(issuesData);
            setSelectedBranch(fullRepoInfo.branch);

            await loadFiles(fullRepoInfo, []);
        } catch (error) {
            console.error('Error initializing repo:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadRepo = () => {
        window.open(`https://github.com/${repoInfo?.user}/${repoInfo?.repo}/archive/refs/heads/${selectedBranch}.zip`);
    };

    const downloadAsset = (url: string | URL | undefined) => {
        window.open(url);
    };

    return (
        <ModalComponents.ModalRoot className="modal" {...props} size={ModalComponents.ModalSize.LARGE}>
            <ModalComponents.ModalHeader className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="modal-header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Github />
                    <span>{repoInfo?.user}/{repoInfo?.repo}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <SystemDesign.SearchableSelect
                        placeholder="Select Theme"
                        options={themes}
                        value={theme}
                        onChange={(event: string | ((prevState: "dark" | "light") => "dark" | "light")) => {
                            setTheme(event);
                        }}
                    />
                    <button className="close-button github-modal-close" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
            </ModalComponents.ModalHeader>


            <div className="modal-content">
                   <Flex align={Flex.Align.CENTER} gap={16}>
                       <SystemDesign.SearchableSelect
                           placeholder="Select Fork"
                           options={forksList}
                           value={selectedFork}
                           onChange={handleForkChange}
                       />
                       <SystemDesign.SearchableSelect
                           placeholder="Select Branch"
                           options={branches}
                           value={selectedBranch}
                           onChange={handleBranchChange}
                       />
                       <Button
                           style={{ backgroundColor: "#1f6feb" }}
                           onClick={() => setCurrentPage('files')}
                           className={currentPage === 'files' ? 'active' : ''}
                       >
                           Files
                       </Button>
                       <Button
                           style={{ backgroundColor: "#1f6feb" }}
                           onClick={() => setCurrentPage('releases')}
                           className={currentPage === 'releases' ? 'active' : ''}
                       >
                           Releases
                       </Button>
                       <Button
                           style={{ backgroundColor: "#1f6feb" }}
                           onClick={() => setCurrentPage('pullRequests')}
                           className={currentPage === 'pullRequests' ? 'active' : ''}
                       >
                           Pull Requests
                       </Button>
                       <Button
                           style={{ backgroundColor: "#1f6feb" }}
                           onClick={() => setCurrentPage('issues')}
                           className={currentPage === 'issues' ? 'active' : ''}
                       >
                           Issues
                       </Button>
                   </Flex>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner" />
                    </div>
                ) : (
                    <>
                        {currentPage === 'files' && (
                            <>
                                <div className="breadcrumbs">
                                    <button
                                        className="breadcrumb-button github-modal-breadcrumb"
                                        onClick={() => navigateToBreadcrumb(-1)}
                                    >
                                        {repoInfo?.repo}
                                    </button>
                                    {currentPath.map((path, index) => (
                                        <React.Fragment key={index}>
                                            <span className="breadcrumb-separator">/</span>
                                            <button
                                                className="breadcrumb-button github-modal-breadcrumb"
                                                onClick={() => navigateToBreadcrumb(index)}
                                            >
                                                {path}
                                            </button>
                                        </React.Fragment>
                                    ))}
                                </div>

                                <div className="file-list">
                                    {files.sort((a, b) => {
                                        if (a.type !== b.type) {
                                            return a.type === 'dir' ? -1 : 1;
                                        }
                                        return a.name.localeCompare(b.name);
                                    }).map((file) => (
                                        <button
                                            key={file.path}
                                            className="file-item github-modal-file"
                                            onClick={() => handleFileClick(file)}
                                        >
                                            <FileIcon type={file.type} />
                                            {file.name}
                                        </button>
                                    ))}
                                </div>

                                <div className="repo-stats">
                                    <span>{contributors.length} Contributors</span>
                                    <span>{forksList.length} Forks</span>
                                    <span>{branches.length} Branches</span>
                                </div>
                            </>
                        )}

                        {currentPage === 'releases' && (
                            <div className="release-container">
                                {releases.map((release: any) => (
                                    <div key={release.id} className="release-item">
                                        <div className="release-header">
                                            <h4 className="release-title">{release.name}</h4>
                                            <span className="release-tag">{release.tag_name}</span>
                                        </div>
                                        <Markdown text={release?.body ?? ""}/>
                                        <a
                                            href={release.html_url}
                                            className="asset-link"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            View on GitHub
                                        </a>
                                        <div className="assets-section">
                                            {release.assets.map((asset: {
                                                id: React.Key | null | undefined;
                                                browser_download_url: string | URL | undefined;
                                                name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
                                                size: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
                                            }) => (
                                                <div className="asset-item" key={asset.id}>
                                                    <a onClick={() => downloadAsset(asset.browser_download_url)}
                                                       className="asset-link">
                                                        <span className="asset-name">{asset.name}</span>
                                                        <span className="asset-size">{asset.size} KB</span>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <Flex>
                                    <Button
                                        style={{ backgroundColor: "#1f6feb" }}
                                        onClick={() => setCurrentPage('files')}
                                        className="back-to-repo-button"
                                    >
                                        Back to Repo
                                    </Button>
                                    <Button
                                        style={{ backgroundColor: "#1f6feb" }}
                                        onClick={downloadRepo}
                                        className="download-repo-button"
                                    >
                                        Download the Entire Repo
                                    </Button>
                                </Flex>
                            </div>
                        )}

                        {currentPage === 'pullRequests' && (
                            <div className="pull-requests-container">
                                {pullRequests.map((pr: any) => (
                                    <div key={pr.id} className="pr-item">
                                        <h4 className="pr-title">{pr.title}</h4>
                                        <Markdown text={pr?.body ?? ""}/>
                                        <a
                                            href={pr.html_url}
                                            className="pr-link"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            View on GitHub
                                        </a>

                                    </div>
                                ))}
                                <Button
                                    style={{backgroundColor: "#1f6feb" }}
                                    onClick={() => setCurrentPage('files')}
                                    className="back-to-repo-button"
                                >
                                    Back to Repo
                                </Button>
                            </div>
                        )}

                        {currentPage === 'issues' && (
                            <div className="issues-container">
                                {issues.map((issue: any) => (
                                    <div key={issue.id} className="issue-item">
                                        <h4 className="issue-title">{issue.title}</h4>
                                        <Markdown text={issue?.body ?? ""}/>
                                        <a
                                            href={issue.html_url}
                                            className="issue-link"
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            View on GitHub
                                        </a>

                                    </div>
                                ))}
                                <Button
                                    style={{backgroundColor: "#1f6feb" }}
                                    onClick={() => setCurrentPage('files')}
                                    className="back-to-repo-button"
                                >
                                    Back to Repo
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </ModalComponents.ModalRoot>
    );
};

export default GitHubModal;
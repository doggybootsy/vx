import React, {useEffect, useState} from 'react';
import {ModalComponents, openCodeModal, openImageModal, openModal, openVideoModal} from '../../api/modals';
import {Button, Flex, Icons, Markdown, SystemDesign} from "../../components";
import {settings} from "./index";
import {FileIcon, imageFileTypes, videoFileTypes} from "./icons";
import {openPip} from "../pip";
import {openWindow} from "../../api/window";
import MarkdownRenderer from "./markdownModule";
import {MenuComponents, openMenu} from "../../api/menu";
import JSZip from "jszip";
import {download} from "../../util";

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

    async downloadFolderAsZip(user: string, repo: string, folderPath: string, branch: string = 'main') {
        const files = await this.getRepoFiles({ user, repo, path: folderPath, branch });
        const zip = new JSZip();

        await this.addFilesToZip(zip, files, folderPath);

        const content = await zip.generateAsync({ type: 'blob' });
        download(`${repo}-${folderPath.replace(/\//g, '-')}.zip`, content);
    }

    async addFilesToZip(zip: JSZip, files: any[], folderPath: string) {
        for (const file of files) {
            if (file.type === 'file') {
                const fileContent = await this.fetchFromGitHub(file.url, true);
                zip.file(`${folderPath}/${file.name}`, this.decodeContent(fileContent.content));
            } else if (file.type === 'dir') {
                const subFolderFiles = await this.fetchFromGitHub(file.url, true);
                const subFolderPath = `${folderPath}/${file.name}`;
                await this.addFilesToZip(zip, subFolderFiles, subFolderPath);
            }
        }
    }
    
    async getBranches(user: string, repo: string) {
        const endpoint = `/repos/${user}/${repo}/branches`;
        return this.fetchFromGitHub(endpoint);
    }
    
    async openFile(url: string, event?: MouseEvent, currentPath) {
        await this.fetchFromGitHub(url, true).then(async res => {
            const ext = res.name.slice(res.name.lastIndexOf('.')).toLowerCase();
            if (res.download_url) {
                if (videoFileTypes.includes(ext) && event?.shiftKey) {
                    openPip(res.name, res.download_url)
                    return;
                } else if (videoFileTypes.includes(ext)) {
                    openVideoModal(res.download_url);
                    return;
                }

                if (imageFileTypes.includes(ext)) {
                    openImageModal(res.download_url);
                    return;
                }

                
                if (ext === '.md') {
                    openModal((props) => (
                        <ModalComponents.Root {...props} size={SystemDesign.ModalSize.DYNAMIC}>
                            <ModalComponents.Content>
                                <MarkdownRenderer {...props} markdown={this.decodeContent(res.content)} />
                            </ModalComponents.Content>
                        </ModalComponents.Root>
                    ))
                    return;
                }
                 

            }

            openCodeModal({
                code: this.decodeContent(res.content),
                language: ext.slice(1),
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

async function fetchFile(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const blob = await response.blob();

    const disposition = response.headers.get('Content-Disposition');
    let filename = "downloaded_file"

    if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^=\n]*=((['"]).*?\2|([^;\n]*))/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    } else {
        filename = url.split('/').pop().split('?')[0];
    }

    return new File([blob], filename, {type: blob.type});
}

export async function downloadFile(url) {
    try {
        const file = await fetchFile(url);
        const blobURL = URL.createObjectURL(file);

        const anchor = document.createElement("a");
        anchor.href = blobURL;
        anchor.download = file.name;
        document.body.append(anchor);

        anchor.click();

        anchor.remove();
        URL.revokeObjectURL(blobURL);
    } catch (error) {
        console.error("Download failed:", error);
    }
}


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

const githubService = new GitHubService();

function format(size: number) {
    let count = 0;
    while (size >= 1024) {
        count++;
        size /= 1024;
    }
    return `${size.toPrecision(3)} ${[ "", "K", "M", "G", "T", "P" ][count]}B`;
}

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
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0)
    
    const theme = settings.theme.use()
    
    useEffect(() => {
        initializeRepo();
    }, [url]);

    
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

    const handleCheckboxChange = (file: FileItem) => {
        setSelectedFiles((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(file.path)) {
                newSelected.delete(file.path);
            } else {
                newSelected.add(file.path);
            }
            return newSelected;
        });
    };

    const downloadSelected = async () => {
        setIsDownloading(true);
        const zip = new JSZip();
        const totalFiles = selectedFiles.size;
        let completedFiles = 0;

        for (const path of selectedFiles) {
            const file = files.find((f) => f.path === path);
            if (file) {
                if (file.type === 'file') {
                    const fileContent = await githubService.fetchFromGitHub(file.url, true);
                    zip.file(file.path, githubService.decodeContent(fileContent.content));
                } else if (file.type === 'dir') {
                    const subFolderFiles = await githubService.fetchFromGitHub(file.url, true);
                    await githubService.addFilesToZip(zip, subFolderFiles, file.path);
                }
            }
            completedFiles++;
            setProgress((completedFiles / totalFiles) * 100);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        // FileSaver.saveAs(content, `${repoInfo?.repo}-selected-files.zip`);
        download(`${repoInfo?.repo}-selected-files.zip`, content)
        setIsDownloading(false);
        setProgress(0);
    };
    
    const handleFileClick = async (file: FileItem, event?: Event, currentPath) => {
        if (file.type === 'dir') {
            const newPath = [...currentPath, file.name];
            setCurrentPath(newPath);
            await loadFiles(repoInfo, newPath);
        } else {
            await githubService.openFile(file.url, event, currentPath);
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

    const handleForkChange = async (event: any) => {
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

    const handleContextMenu = (event: React.MouseEvent, file: FileItem) => {
        event.preventDefault();
        openMenu(event, (props) => (
            <MenuComponents.Menu {...props} onClose={() => props.onClose?.()} navId={"vx-githubModal"}>
                <MenuComponents.Item
                    id={"vx-githubModal-2"}
                    label={"Download"}
                    action={() => {
                        if (file.download_url) {
                            downloadFile(file.download_url);
                        } else {
                            githubService.downloadFolderAsZip(
                                repoInfo?.user,
                                repoInfo?.repo,
                                file.path,
                                repoInfo?.branch || repoInfo?.defaultBranch
                            );
                        }
                    }}
                />
            </MenuComponents.Menu>
        ));
    };

    return (
        <ModalComponents.Root data-theme={theme} className="modal" {...props} size={ModalComponents.ModalSize.LARGE}>
            <ModalComponents.Header className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="modal-header-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icons.Github />
                    <span>{repoInfo?.user}/{repoInfo?.repo}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <SystemDesign.SearchableSelect
                        placeholder="Select Theme"
                        options={themes}
                        value={theme}
                        onChange={(event: "dark" | "light") => {
                            settings.theme.set(event)
                        }}
                    />
                    <button className="close-button github-modal-close" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
            </ModalComponents.Header>


            {isDownloading ? (
                <div className="loading-indicator">
                    <div className="spinner"/>
                    <p>Downloading files...</p>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{width: `${progress}%`}}></div>
                    </div>
                </div>
            ) : (<div className="modal-content">
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
                           onClick={() => setCurrentPage('files')}
                           className={'vx-gm-button'}
                       >
                           Files
                       </Button>
                       <Button
                           onClick={() => setCurrentPage('releases')}
                           className={'vx-gm-button'}
                       >
                           Releases
                       </Button>
                       <Button
                           onClick={() => setCurrentPage('pullRequests')}
                           className={'vx-gm-button'}
                       >
                           Pull Requests
                       </Button>
                       <Button
                           onClick={() => setCurrentPage('issues')}
                           className={'vx-gm-button'}
                       >
                           Issues
                       </Button>
                       <Button
                           onClick={downloadSelected}
                           className={'vx-gm-button'}
                       >
                           Download Selected
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
                                    }).map((file) => {
                                        const selected = selectedFiles.has(file.path);
                                        return (
                                            <div key={file.path} className="file-item-container">
                                                <Flex align={Flex.Align.CENTER} justify={Flex.Justify.BETWEEN}>
                                                    <button
                                                        className="file-item github-modal-file"
                                                        onClick={(event: Event) => handleFileClick(file, event, currentPath)}
                                                        onContextMenu={(event) => handleContextMenu(event, file)}
                                                    >
                                                        <div className="file-item-content">
                                                            <FileIcon type={file.type} name={file.name}/>
                                                            <span>{file.name}</span>
                                                        </div>
                                                    </button>
                                                    <SystemDesign.Checkbox
                                                        value={selected}
                                                        type="inverted"
                                                        onChange={(event: React.ChangeEvent, newState: boolean) => {
                                                            handleCheckboxChange(file, event);
                                                        }}
                                                    />
                                                </Flex>
                                            </div>
                                        );
                                    })}
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
                                                name: string
                                                size: number
                                            }) => (
                                                <div className="asset-item" key={asset.id}>
                                                    <a onClick={() => downloadAsset(asset.browser_download_url)}
                                                       className="asset-link">
                                                        <span className="asset-name">{asset.name}</span>
                                                        <span className="asset-size">{format(asset.size)}</span>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <Flex>
                                    <Button
                                        onClick={() => setCurrentPage('files')}
                                        className="vx-gm-button"
                                    >
                                        Back to Repo
                                    </Button>
                                    <Button
                                        onClick={downloadRepo}
                                        className="vx-gm-button"
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
                                    onClick={() => setCurrentPage('files')}
                                    className="vx-gm-button"
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
                                    onClick={() => setCurrentPage('files')}
                                    className="vx-gm-button"
                                >
                                    Back to Repo
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div> )
            }
        </ModalComponents.Root>
    );
};

export default GitHubModal;
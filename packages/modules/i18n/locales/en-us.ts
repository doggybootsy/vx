import { FormattedMessage } from "./formattedMessage";

const messages = {
  THEMES: "Themes",
  PLUGINS: "Plugins",
  ADDONS: "Addons",
  DESKTOP: "Desktop",
  EXTENSIONS: "Extensions",
  NO_DESCRIPTION_PROVIDED: "No Description Provided",
  NEW_ADDON: "New",
  VX: "VX",
  NO_RESULTS_FOUND: "No Results Found",
  NO_ADDONS_FOUND: new FormattedMessage("No {type} Found", "en-US", false),
  EDITOR_TITLE: new FormattedMessage("{type} - {name}", "en-US", false),
  WELCOME: "Welcome To VX",
  LAST_CHECKED: new FormattedMessage("Last Checked {date}", "en-US", false),
  UPDATE_TO: new FormattedMessage("Update to v{version}", "en-US", false),
  CHECK_FOR_UPDATES: "Check For Updates",
  FETCHING: "Fetching...",
  VX_UPDATE_AVAILABLE: "Update Available",
  UP_TO_DATE: "Up To Date",
  ABOVE_LATEST_RELEASE: "Above Latest Release",
  DOWNLOAD_READY: new FormattedMessage("VX v{version} is available to download", "en-US", false),
  UNKNOWN: "Unknown",
  DOWNLOAD_NOW: "Download Now",
  OPEN_FOLDER: "Open Folder",
  DOWNLOAD_RDT: "Download React Developer Tools",
  VISIT_WEBSITE: "Visit Website",
  JOIN_SUPPORT_SERVER: "Join Support Server",
  GO_TO_SOURCE: "Go To Source",
  OPEN_SETTINGS: "Open Settings",
  PLUGIN_REQUIRES_RESTART: "Plugin Requires Restart",
  UNKNOWN_NAME: "Unknown Name",
  CONTENT_PROTECTION: "Content Protection",
  CONTENT_PROTECTION_NOTE: "When enabled you cannot take screenshots or screen recordings of Discord",
  USER_SETTINGS_SHORTCUT: "User Settings Shortcut",
  USER_SETTINGS_SHORTCUT_NOTE: "When shift clicking the user settings panel, it'll opens vx dashboard instead of settings",
  PRESERVE_ADDON_QUERY: "Preserve Addon Query",
  PRESERVE_ADDON_QUERY_NOTE: "When you exit settings with a query it will save it, for when you open it again",
  SHOW_FAVICON: "Show Favicon",
  SHOW_FAVICON_NOTE: "Shows the websites favicon instead of globe on addon cards",
  QUIT_DISCORD: "Quit Discord",
  RESTART_DISCORD: "Restart Discord",
  RELOAD_DISCORD: "Reload Discord",
  VIEW_LICENSE: "View License",
  ARE_YOU_SURE: "Are you sure?",
  RESTART: "Restart",
  TRANSPARENCY: "Transparency",
  ADD_VX_TO_TITLEBAR: "Add VX to titlebar",
  ADD_VX_TO_TITLEBAR_NOTE: "Adds a button that allows you to quickly open the dashboard",
  TRANSPARENCY_NOTE: new FormattedMessage("Enabling transparency allows you to be able to see your desktop background. This also breaks window snapping [crbug/41395671](https://issues.chromium.org/issues/41395671) [electron/electron/2170](https://github.com/electron/electron/issues/2170)", "en-US", true),
  NATIVE_FRAME: "Native OS Frame",
  NATIVE_FRAME_NOTE: "Makes discord use the Native OS Frame",


  TRUST_AND_VISIT_SITE: new FormattedMessage("Visit and trust **!!{domain}!!** links from now on", "en-US", true),
  
  ALWAYS_SHOW_MENTION_TOGGLE_NAME: "Always Show Mention Toggle",
  ALWAYS_SHOW_MENTION_TOGGLE_DESCRIPTION: "Always show the mention toggle when replying to messages",
  ARCHIVE_VIEWER_NAME: "ArchiveViewer",
  ARCHIVE_VIEWER_DESCRIPTION: "Allows you to view the contents of archives",
  CALL_DURATION_NAME: "Call Duration",
  CALL_DURATION_DESCRIPTION: "Shows how long you have been in call for",
  COPY_CHANNEL_LINK_NAME: "Copy Channel Link",
  COPY_CHANNEL_LINK_DESCRIPTION: "Quickly copy channel links",
  CUSTOM_SWITCH_COLORS_NAME: "Custom Switch Colors",
  CUSTOM_SWITCH_COLORS_DESCRIPTION: "Change the color of switches to any hexadecimal color you want",
  DISCORD_YOUTUBE_PLAYER_NAME: "Discord Youtube Player",
  DISCORD_YOUTUBE_PLAYER_DESCRIPTION: "Makes Youtube use the standard discord mediaplayer, it can lag. Caching does take a super long time",
  DISPLAY_USERNAME_NAME: "Display Username",
  DISPLAY_USERNAME_DESCRIPTION: "Shows the users username in chat next to their name if the have a global name or a nickname",
  DOUBLE_CLICK_CLOSE_MODAL_NAME: "Double Click To Close Modal",
  DOUBLE_CLICK_CLOSE_MODAL_DESCRIPTION: "Makes it where you have to double the backdrop to close the modal",
  DOUBLE_CLICK_EDIT_NAME: "Double Click Edit",
  DOUBLE_CLICK_EDIT_DESCRIPTION: "Double clicking a message will allow you to edit a message",
  DOUBLE_CLICK_TO_CALL_NAME: "Double Click Call",
  DOUBLE_CLICK_TO_CALL_DESCRIPTION: "You need to double click to start a call instead of a single click",
  EXPAND_COLLAPSED_MESSAGES_NAME: "Expand Collapsed Messages",
  EXPAND_COLLAPSED_MESSAGES_DESCRIPTION: "Automatically expands collapsed messages",
  EXPERIMENTS_NAME: "Experiments",
  EXPERIMENTS_DESCRIPTION: "Enables Discords experiments",
  FORWARD_NAME: "Forward",
  FORWARD_DESCRIPTION: "Allows you to forward messages to seperate channels",
  FRIENDS_SINCE_NAME: "Friends Since",
  FRIENDS_SINCE_DESCRIPTION: "Shows for long you have been friends with someone",
  LOCAL_NICKNAMES_NAME: "Local Nicknames",
  LOCAL_NICKNAMES_DESCRIPTION: "Adds custom local nicknames",
  LOOP_NAME: "Loop",
  LOOP_DESCRIPTION: "Adds a loop button to videos and audios",
  NO_REPLY_PING_NAME: "No Reply Ping",
  NO_REPLY_PING_DESCRIPTION: "Automatically tells discord not to ping the user when replying",
  PIP_NAME: "Picture In Picture",
  PIP_DESCRIPTION: "Adds a PIP button to videos",
  QUICK_MENTION_NAME: "Quick Mention",
  QUICK_MENTION_DESCRIPTION: "Quickly mention people from the mention popover",
  REMOVE_NO_ROLES_NAME: "Remove No Roles",
  REMOVE_NO_ROLES_DESCRIPTION: "Removes the 'NO ROLES' section from user popouts",
  SILENT_TYPING_NAME: "Silent Typing",
  SILENT_TYPING_DESCRIPTION: "Tricks discord into thinking that you aren't typing",
  VIEW_SERVER_AS_USER_NAME: "View Server As User",
  VIEW_SERVER_AS_USER_DESCRIPTION: "Allows you to impersonate as another user in a guild",
  ALWAYS_SHOW_CROWN_NAME: "Always Show Crown",
  ALWAYS_SHOW_CROWN_DESCRIPTION: "Always shows the server owners crown",
  BETTER_VOLUME_NAME: "Better Volume",
  BETTER_VOLUME_DESCRIPTION: "Adds a slider for more precise adjustments",
  GIF_IMAGE_MENU_NAME: "Gif Image Menu",
  GIF_IMAGE_MENU_DESCRIPTION: "Adds the image action menu to the GIF picker",
  SUGGEST_MORE_REACTIONS_NAME: "Suggest More Reactions",
  SUGGEST_MORE_REACTIONS_DESCRIPTION: "Suggest More Reactions In The Message Context Menu",
  USER_AVATAR_MENU_NAME: "User Avatar Menu",
  USER_AVATAR_MENU_DESCRIPTION: "Show's the user context menu when alternate click the user section panel",
  GUILD_CLOCK_NAME: "Guild Clock",
  GUILD_CLOCK_DESCRIPTION: "Add's a small clock underneath the VX button",
  SPOTIFY_CONTROLS_NAME: "Spotify Controls",
  SPOTIFY_CONTROLS_DESCRIPTION: "Add's a Spotify control panel to the user panels area. You cannot be a in a private session for this to work",
  SPOTIFY_CRACK_NAME: "Spotify++",
  SPOTIFY_CRACK_DESCRIPTION: "Tricks Discord into thinking you have Spotify premium",
  FORCE_EXPAND_MINIPOPOVER_NAME: "Force Expand MiniPopover",
  FORCE_EXPAND_MINIPOPOVER_DESCRIPTION: "Shows all minipopover items without needing to hold shift",
  BETTER_TYPING_INDICATORS_NAME: "Better Typing Indicators",
  BETTER_TYPING_INDICATORS_DESCRIPTION: "Enhances the typing indicators",
  PIN_DMS_NAME: "Pin Direct Messages",
  PIN_DMS_DESCRIPTION: "Adds the pin direct messages feature from the mobile app",
  SILENT_NOTICE_NAME: "Silent Notice",
  SILENT_NOTICE_DESCRIPTION: "Highlights @silent in the chatbar",
  YOUTUBE_ADBLOCK_NAME: "Youtube Adblock",
  YOUTUBE_ADBLOCK_DESCRIPTION: "Adds a adblock that removes ads off of youtube",
  BETTER_MENTIONS_NAME: "Better Mentions",
  BETTER_MENTIONS_DESCRIPTION: "Makes user mentions better",
  FREE_NITRO_NAME: "Free Nitro",
  FREE_NITRO_DESCRIPTION: "Gives you access to some of nitros for free",
  FAVORITE_MANAGER_NAME: "Favorite Manager",
  FAVORITE_MANAGER_DESCRIPTION: "Makes favoriting images a better experience",
  BIGGER_STREAM_PREVIEW_NAME: "Bigger Stream Preview",
  BIGGER_STREAM_PREVIEW_DESCRIPTION: "Allows you to preview a stream in a image modal",
  DN_LAST_MSG_NAME: "View Last DM",
  DN_LAST_MSG_DESCRIPTION: "Lets you view the latest message in a direct message",
  GET_WEBHOOK_URL_NAME: "Get Webhook URL",
  GET_WEBHOOK_URL_DESCRIPTION: "Allows you to easily copy a webhook url",
  MORE_NOTES_NAME: "More Notes",
  MORE_NOTES_DESCRIPTION: "Allows more you to add more notes to a user",
  RANDOMIZE_FILENAMES_NAME: "Randomize Filenames",
  RANDOMIZE_FILENAMES_DESCRIPTION: "Randomizes the filename of uploads",
  REVEAL_ALL_SPOILERS_NAME: "Reveal All Spoilers",
  REVEAL_ALL_SPOILERS_DESCRIPTION: "Reveals all spoilers when ctrl clicking a spoiler",
  TRANSLATOR_NAME: "Translator",
  TRANSLATOR_DESCRIPTION: "Allows you to translate any message to a range of languages",
  SESSION_NOTIFY_NAME: "Session Notice",
  SESSION_NOTIFY_DESCRIPTION: "Notifies you when a new session is found.",
  DEVTOOLS_NAME: "DevTools",
  DEVTOOLS_DESCRIPTION: "Opens Discords Built-in DevTools; Please enable only if you know what you are doing.",
  DM_LAST_MSG_NAME: "DM Last Message",
  DM_LAST_MSG_DESCRIPTION: "Shows you the last message sent in a DM on your DMs list.",
  UNLIMITED_ACCOUNTS_NAME: "Unlimited Accounts",
  UNLIMITED_ACCOUNTS_DESCRIPTION: "Allows you to bypass the max amount of accounts for the account switcher.",
  FIRST_MESSAGE_NAME: "First Message",
  FIRST_MESSAGE_DESCRIPTION: "Adds a First Message Button. Right click the textarea to find it!.",
  BETTER_AVATAR_NAME: "Better Cropping",
  BETTER_AVATAR_DESCRIPTION: "Lets you zoom in more for pixel perfect profile pictures!",
  QUESTS_NAME: "Quests",
  QUESTS_DESCRIPTION: new FormattedMessage("Allows you to complete quests.app but you need to follow requirements. [More Here](https://gist.github.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb) Ported from this gist.", "en-US", true),

  SPOTIFY_OPEN_TRACK: "Open Track",
  SPOTIFY_OPEN_ALBUM: "Open Album",
  SPOTIFY_PREVIEW_ALBUM_COVER: "Preview Album Cover",
  SPOTIFY_ARTISTS: "Artists",
  EDIT_LOCAL_NICKNAME: "Edit Local Nickname",
  ADD_LOCAL_NICKNAME: "Add Local Nickname",
  FRIENDS_SINCE: "Friends Since",
  FORWARD: "Forward",
  WHERE_TO_FORWARD: "Where would you like to forward to?",
  CALL_DURATION: new FormattedMessage("Call Duration: {time}", "en-US", false),
  ZIP_VIEWER: "Zip Viewer",
  VIEW_ZIP: "View Zip",
  FOLDER_IS_EMPTY: "Folder Is Empty",
  DOWNLOAD_SELECTED: "Download Selected",
  FOLLOWERS: new FormattedMessage("{followers, plural, one {1 Follower} other {{followers} Followers}}", "en-US", false),

  WEB_ONLY: "Only Available On Web App",
  APP_ONLY: "Only Available On Desktop App"
} satisfies Record<Uppercase<string>, string | FormattedMessage>;

export type ALL_KNOWN_MESSAGES = typeof messages;

export default messages;
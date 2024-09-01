if (location.pathname.startsWith("/vx")) {
  location.replace(`/channels/@me?__vx_dashboard_path__=${encodeURIComponent(location.pathname)}`);
}
else require("./main");
import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "BackdropStyles:",
    find: /(\.backdrop.+?onClick:)(.{1,3})}/g,
    replace: "$1$self.onClick($2,()=>$enabled)}"
  },
  onClick(onClick: (event: React.MouseEvent) => void, enabled: () => boolean) {
    return (event: React.MouseEvent) => {
      if (!enabled()) return onClick(event);
      
      if (event.detail !== 2) return;
      onClick(event);
    };
  }
});
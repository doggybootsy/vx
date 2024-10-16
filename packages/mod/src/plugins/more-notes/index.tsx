import { definePlugin } from "vx:plugins";
import { DataStore } from "../../api/storage";
import { Developers } from "../../constants";

const notes = new DataStore<Record<string, string>>("more-notes", { version: 1 });

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "findDOMNode(this.noteRef.current);",
    replacements: [
      {
        find: /loading:(.{1,3}),note:(.{1,3}),hideNote:.{1,3}}=this\.props;/,
        replace: "$&if($enabled){$1=false;$2=$self.getNote(this.props.userId,$2)};"
      },
      {
        find: /,(.{1,3}\..{1,3}\.updateNote)/,
        replace: ",($enabled?$self.setNote:$1)"
      },
      {
        find: ".length>=5",
        replace: ".length>=($enabled?Infinity:5)"
      },
      {
        find: "maxLength:",
        replace: "maxLength:$enabled?Infinity:"
      }
    ]
  },
  setNote(userId: string, note: string) {
    notes.set(userId, note);
  },
  getNote(userId: string, original: string | null) {
    return notes.get(userId) || original;
  }
});
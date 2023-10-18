import { User } from "discord-types/general";
import { getProxyByStrings } from "../../webpack";

import "./index.css";

export * from "./actions";
export * from "./confirmModal";
export * from "./image";
export * from "./alert";
export * from "./prompt";
export { default as ModalComponents } from "./components";

const openUserModalModule = getProxyByStrings<(opts: { userId: string }) => void>([ ",friendToken:", ".analyticsLocation," ], { searchExports: true });

export function openUserModal(user: User | string) {
  if (typeof user === "string") return openUserModalModule({ userId: user });
  openUserModalModule({ userId: user.id });
};
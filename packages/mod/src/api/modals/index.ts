import { User } from "discord-types/general";
import { getProxyByKeys } from "../../webpack";

import "./index.css";

export * from "./actions";
export * from "./confirmModal";
export * from "./media";
export * from "./alert";
export * from "./prompt";
export * from "./code";
export { default as ModalComponents } from "./components";

const userProfileModalActions = getProxyByKeys<{
  openUserProfileModal(data: { userId: string }): void,
  closeUserProfileModal(): void
}>([ "closeUserProfileModal", "openUserProfileModal" ]);

export function openUserModal(user: User | string) {
  if (typeof user === "string") return userProfileModalActions.openUserProfileModal({ userId: user });
  userProfileModalActions.openUserProfileModal({ userId: user.id });
};
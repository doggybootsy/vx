import { User } from "discord-types/general";
import { getProxyByKeys } from "@webpack";

const userProfileModalActions = getProxyByKeys<{
  openUserProfileModal(data: { userId: string }): void,
  closeUserProfileModal(): void
}>([ "closeUserProfileModal", "openUserProfileModal" ]);

export function openUserModal(user: User | string) {
  if (typeof user === "string") return userProfileModalActions.openUserProfileModal({ userId: user });
  userProfileModalActions.openUserProfileModal({ userId: user.id });
}
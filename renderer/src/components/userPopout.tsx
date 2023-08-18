import { ErrorBoundary } from "renderer/components";
import { cache } from "renderer/util";
import webpack, { filters } from "renderer/webpack";

const UserPopoutModule = cache(() => {
  const filter = filters.byStrings("Unexpected missing user", ".getUser(");
  return webpack.getModule<React.FunctionComponent<{ userId: string }>>((m) => filter(m.type))!;
});
// const loadUser = cache(() => webpack.getModule<(userId: string) => void>((exports, module, index) => exports.toString?.().includes(".apply(this,arguments)") && webpack.require!.m[index].toString().includes("USER_PROFILE_FETCH_START"), { searchExports: true })!);
// const UserProfileStore = cache(() => webpack.getStore("UserProfileStore")!);

function UserPopout({ userId }: { userId: string }) {
  const React = webpack.common.React!;

  // React.useLayoutEffect(() => {
  //   if (UserProfileStore().getUserProfile(userId)) return;

  //   loadUser()(userId);
  // }, [ userId ]);

  return (
    <ErrorBoundary>
      <UserPopoutModule.getter userId={userId} />
    </ErrorBoundary>
  );
};

export default UserPopout;
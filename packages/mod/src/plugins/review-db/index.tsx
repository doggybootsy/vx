import { byStrings, getLazy, getProxyByKeys, getProxyByStrings } from "@webpack";
import { definePlugin, isPluginEnabled } from "..";
import { Developers } from "../../constants";
import { Injector } from "../../patcher";
import { className, clipboard, createAbort, focusStore } from "../../util";
import { Button, ErrorBoundary, Icons, Markdown, Spinner, SystemDesign, Tooltip } from "../../components";
import { User } from "discord-types/general";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { reviewDBStore } from "./store";
import { useInternalStore } from "../../hooks";
import * as styler from "./index.css?managed";
import { openConfirmModal, openExternalWindowModal } from "../../api/modals";
import * as MiniPopover from "../../components/minipopover";
import { UserStore, useStateFromStores } from "@webpack/common";
import { Messages } from "vx:i18n";
import { createSettings, CustomSettingType, SettingType } from "../settings";
import { openNotification } from "../../api/notifications";

export const settings = createSettings("review-db", {
  auth: {
    type: SettingType.CUSTOM,
    default: {},
    render() {
      const { hasAuth, token } = useInternalStore(reviewDBStore, () => {
        const hasAuth = reviewDBStore.hasAuth();

        return {
          hasAuth,
          token: hasAuth ? reviewDBStore.getAuthToken() : null
        }
      });
  
      return (
        <>
          <Button disabled={hasAuth} onClick={() => reviewDBStore.requestAuth()}>
            Sign In
          </Button>
          <Button disabled={!hasAuth} onClick={() => reviewDBStore.logout()}>
            Logout
          </Button>
          <Button disabled={!hasAuth} onClick={() => clipboard.copy(token!)}>
            Copy Token
          </Button>
        </>
      )
    }
  } as CustomSettingType<Record<string, string>>,
  showWarning: {
    type: SettingType.SWITCH,
    default: false,
    title: "Show Warning"
  }
});

const [ abort, getSignal ] = createAbort();
const injector = new Injector();

const filter = byStrings(".Messages.USER_PROFILE_MUTUAL_GUILDS.format({count", ".Messages.USER_PROFILE_MUTUAL_FRIENDS_PLACEHOLDER).with");
const useUserModalSections = getLazy((m) => filter(m.default), { searchDefault: false });

const formatTime = getProxyByStrings<(date: Date) => string>([ "sameElse\"==", "sameDay\":" ], { searchExports: true });

function Badge({ badge }: { badge: ReviewDB.Badge }) {
  return (
    <Tooltip text={badge.name}>
      {(props) => (
        <span
          {...props}
          className="vx-rdb-badge" 
          onClick={() => {
            props.onClick();

            if (badge.redirectURL) {
              openExternalWindowModal(badge.redirectURL);
            }
          }}
        >
          <img 
            src={badge.icon} 
            alt={badge.description} 
            height={22} 
            width={22} 
            className="vx-rdb-icon"
          />
        </span>
      )}
    </Tooltip>
  )
}

function AddReviewButton({ user, refetch }: { user: User, refetch(): void }) {
  const [ value, setValue ] = useState("");

  const sendReview = useCallback(async () => {
    setValue("");
    
    if (!await reviewDBStore.attemptToEnsureAuth()) return;

    const ok = await reviewDBStore.addReview(user.id, value);

    if (!ok) {
      // todo
      openNotification({
        title: "Unable to add review",
        type: "danger",
        icon: Icons.Warn
      });
      return;
    }

    refetch();
  }, [ value ]);

  const hasFocus = focusStore.useFocus();

  const avatarURL = useStateFromStores([ UserStore ], () => UserStore.getCurrentUser().getAvatarURL(undefined, 40, hasFocus), [ hasFocus ]);

  return (
    <div className="vx-rdb-new">
      <div className="vx-rdp-author" style={{ backgroundImage: `url(${avatarURL})` }} />
      <SystemDesign.TextInput 
        value={value}
        placeholder="They are a very cool person!"
        onChange={setValue}
        onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key.toLowerCase() === "enter") sendReview();
        }}
        autoFocus
      />
      <Button
        size={Button.Sizes.ICON} 
        disabled={!value.length}
        onClick={sendReview}
      >
        <Icons.Send />
      </Button>
    </div>
  );
}

interface ReviewProps {
  review: ReviewDB.Review, 
  isComment?: boolean, 
  isViewingCurrentUser: boolean, 
  refetch(): void
}

function Review({ review, isComment, isViewingCurrentUser, refetch }: ReviewProps) {
  const isFromCurrentUser = useStateFromStores([ UserStore ], () => UserStore.getCurrentUser().id === review.sender.discordID);
  const [ isDeleting, setIsDeleting ] = useState(false);

  const { hasAuth, currentUser, isSenderBlocked } = useInternalStore(reviewDBStore, () => ({
    hasAuth: reviewDBStore.hasAuth(),
    currentUser: reviewDBStore.getCurrentUser(),
    isSenderBlocked: reviewDBStore.isBlocked(review.sender)
  }));

  const canDeleteReview = useMemo(() => {
    if (!hasAuth) return false;
    return isFromCurrentUser || isFromCurrentUser || currentUser?.type === 1;
  }, [ hasAuth, isFromCurrentUser, isViewingCurrentUser ]);

  const timestamp = useMemo(() => {
    const date = new Date(review.timestamp * 1000);
    
    return { date, time: date.toISOString(), formatted: formatTime(date) };
  }, [ ]);

  const [ showContent, setShowContent ] = useState(() => isPluginEnabled("expand-collapsed-messages"));
  
  const isByDeveloper = useMemo(() => (
    !!~plugin.authors.findIndex((developer) => developer.discord === review.sender.discordID)
  ), [ ]);

  if (isDeleting) return null;

  return (
    <div className={className([ "vx-rdb-review", isComment && "vx-rdb-comment", isSenderBlocked && "vx-rdb-blocked", isSenderBlocked && showContent && "vx-rdb-expanded" ])}>
      {isSenderBlocked && (
        <div className="vx-rdb-blocked-header">
          <span>Message from blocked user —{" "}</span>
          <span 
            className="vx-rdb-blocked-button"
            onClick={() => setShowContent(v => !v)}
          >{showContent ? "Expand message" : "Collapse message"}</span>
        </div>
      )}
      {!(isSenderBlocked && !showContent) && (
        <>
          <div className="vx-rdp-wrapper">
            <div className="vx-rdb-pfp-wrapper">
              <img
                className="vx-rdb-pfp" 
                src={review.sender.profilePhoto}
              />
            </div>
            <div className="vx-rdb-body">
              <div className="vx-rdb-header">
                {(false && isByDeveloper) && (
                  <Tooltip text="Review DB Developer for VX" hideOnClick={false}>
                    {(props) => (
                      <span className="vx-rdb-dev" {...props}>
                        <Icons.Logo size={22} />
                      </span>
                    )}
                  </Tooltip>
                )}
                <span className="vx-rdb-username">{review.sender.username}</span>
                {!!review.timestamp && (
                  <span className="vx-rdb-timestamp">
                    <i className="vx-rdb-seperator" aria-hidden="true"> — </i>
                    <Tooltip text={timestamp.formatted}>
                      {(props) => (
                        <time dateTime={timestamp.date.toString()} {...props}>{timestamp.formatted}</time>
                      )}
                    </Tooltip>
                  </span>
                )}
                {review.type !== 0 && (
                  <div className="vx-rdb-tag">
                    {review.type === 1 ? "server" : review.type === 2 ? "support" : "system"}
                  </div>
                )}
                <div className="vx-rdb-badges">
                  {review.sender.badges.map((badge) => (
                    <Badge badge={badge} />
                  ))}
                </div>
              </div>
              <div className="vx-rdb-content">
                <Markdown text={review.comment} />
              </div>
            </div>
            {review.type === 0 && (
              <div className="vx-rdp-buttons">
                <MiniPopover.Button 
                  text={isSenderBlocked ? Messages.UNBLOCK : Messages.BLOCK}
                  icon={isSenderBlocked ? Icons.DiscordIcon.from("LockUnlockedIcon") : Icons.DiscordIcon.from("LockIcon")}
                  onClick={async () => {
                    if (!await reviewDBStore.attemptToEnsureAuth()) return;

                    if (isSenderBlocked) {
                      reviewDBStore.unblockUser(review.sender.discordID);
                      return;
                    }
        
                    reviewDBStore.blockUser(review.sender.discordID);
                  }}
                  disabled={isFromCurrentUser}
                />
                <MiniPopover.Button 
                  text="Report Review"
                  icon={Icons.DiscordIcon.from("FlagIcon")}
                  onClick={async () => {
                    if (!await reviewDBStore.attemptToEnsureAuth()) return;

                    openConfirmModal("Are you sure?", [
                      "Do you want to report this review?",
                      "False reports may lead to a ban"
                    ], {
                      confirmText: "Report",
                      danger: true,
                      onConfirm() {
                        reviewDBStore.reportReview(review.id);
                      }
                    })
                  }}
                  disabled={isFromCurrentUser}
                  danger
                />
                <MiniPopover.Button 
                  text="Delete Review"
                  icon={Icons.Trash}
                  disabled={!canDeleteReview}
                  onClick={() => {
                    openConfirmModal("Are you sure?", [
                      "Do you want to delete this review?"
                    ], {
                      confirmText: "Delete",
                      danger: true,
                      onConfirm() {
                        setIsDeleting(true);
                        reviewDBStore.deleteReview(review.id).then((ok) => {
                          setIsDeleting(ok);
                          if (ok) refetch();
                        });
                      }
                    })
                  }}
                  danger
                />
              </div>
            )}
          </div>
          {review.replies && (
            <div className="vx-rdb-comments">
              {review.replies.map((review) => (
                <Review review={review} isViewingCurrentUser={isViewingCurrentUser} isComment refetch={refetch} key={review.id} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function NoReviews() {
  return (
    <div className="vx-rdb-empty">
      <img src="/assets/b5eb2f7d6b3f8cc9b60be4a5dcf28015.svg" draggable={false} />
      <div className="vx-rdb-empty-text">No Reviews Found</div>
    </div>
  );
}

const scrollerClasses = getProxyByKeys([ "thin", "fade" ]);

function ReviewDBPage({ user, currentUser }: { user: User, currentUser: User }) {
  const [ reviews, setReviews ] = useState<null | ReviewDB.Reviews>(null);
  const [ page, setPage ] = useState(1);

  const ref = useRef<HTMLDivElement>(null);

  const fetch = useCallback(() => {
    const controller = new AbortController();

    reviewDBStore.fetchReviews(user.id, (page - 1) * 50).then((reviews) => {
      if (controller.signal.aborted) return;

      setReviews(reviews);
    });

    return () => controller.abort();
  }, [ page ]);

  useLayoutEffect(() => fetch(), [ page ]);

  if (!reviews) return (
    <div className="vx-rdb-loading">
      <Spinner />
    </div>
  );

  const jsx = reviews.reviews.length ? reviews.reviews.map((review) => (
    <Review review={review} isViewingCurrentUser={currentUser.id === user.id} key={review.id} refetch={() => void fetch()} />
  )) : <NoReviews />;

  return (
    <div ref={ref} className="vx-rdb">
      <div ref={ref} className={className([ "vx-rdb-scroller", scrollerClasses.thin, scrollerClasses.fade ])}>
        {jsx}
        <SystemDesign.Paginator 
          currentPage={page}
          totalCount={reviews.reviewCount}
          pageSize={50}
          maxVisiblePages={5}
          onPageChange={(page: number) => {
            setPage(page);
          }}
        />
      </div>
      <AddReviewButton user={user} refetch={() => void fetch()} />
    </div>
  )
}

const plugin = definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  styler,
  patches: {
    match: ".section,subsection:void 0",
    find: /(let{section:(.{1,3}),subsection:.{1,3},.+?}=.{1,3};return) (\2===.{1,3}\..{1,3}\.ACTIVITY)/,
    replace: "$1 $2==='REVIEW_DB'?$jsx($self.ReviewDB,arguments[0]):$3"
  },
  settings,
  ReviewDB: ErrorBoundary.wrap(ReviewDBPage),
  async start() {
    const signal = getSignal();

    const module = await useUserModalSections;
    if (signal.aborted) return;

    injector.after(module, "default", (that, args, res: any) => {
      res.push({
        section: "REVIEW_DB",
        text: "Review DB"
      });
    });
  },
  stop() {
    injector.unpatchAll();
    abort();
  },
});
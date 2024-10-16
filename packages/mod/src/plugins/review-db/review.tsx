import { getProxyByKeys, getProxyByStrings } from "@webpack";
import { isPluginEnabled } from "vx:plugins";
import { className, getDefaultAvatar } from "../../util";
import { Button, Icons, Markdown, Spinner, SystemDesign, Tooltip } from "../../components";
import { User } from "discord-types/general";
import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { reviewDBStore } from "./store";
import { useInternalStore } from "../../hooks";
import { openConfirmModal, openExternalWindowModal } from "../../api/modals";
import * as MiniPopover from "../../components/minipopover";
import { UserStore, useStateFromStores } from "@webpack/common";
import { Messages } from "vx:i18n";
import { openNotification } from "../../api/notifications";

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

function AddReviewPanel({ id, user, refetch }: { id: string, user: User, refetch(): void }) {
  const currentUser = useInternalStore(reviewDBStore, () => reviewDBStore.getCurrentUser());

  const avatarURL = useMemo(() => currentUser?.profilePhoto ? currentUser.profilePhoto : getDefaultAvatar(currentUser?.discordID || UserStore.getCurrentUser().id), [ ]);
  const [ reviewId, setReviewId ] = useReplyContext();

  const reviewResult = useReviewResultContext();

  const [ comment, setValue ] = useState("");

  const sendReview = useCallback(async () => {
    setValue("");
    setReviewId(null);
    
    if (!await reviewDBStore.attemptToEnsureAuth()) return;

    const ok = await reviewDBStore.addReview(user.id, { comment, repliesTo: reviewId! });

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
  }, [ comment, reviewId ]);

  const username = useMemo(() => {
    if (!reviewResult) return Messages.UNKNOWN_USER;

    const stack: ReviewDB.Review[] = [ ...reviewResult.reviews ];
    while (stack.length) {
      const review = stack.shift();
      if (!review) continue;

      if (review.id === reviewId) return review.sender.username;
      if (review.replies) stack.unshift(...review.replies);
    }
    
    return Messages.UNKNOWN_USER;
  }, [ reviewId, reviewResult ]);

  const attemptToShow = useCallback(() => {
    document.querySelector(`.vx-rdb[data-rdb-id=${JSON.stringify(id)}] .vx-rdb-replying`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [ ]);

  return (
    <div className="vx-rdb-new">
      {reviewId && (
        <div className="vx-rdb-replybar" onClick={attemptToShow}>
          <div className="vx-rdb-replying-to">
            {Messages.REPLYING_TO.format({
              userHook: ([], id: any) => (
                <span className="vx-rdb-replying-to-user" key={id}>
                  {username}
                </span>
              )
            })}
          </div>
          <div 
            className="vx-rdb-close" 
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              setReviewId(null)
            }}
          >
            <Icons.DiscordIcon className="vx-rdb-close-icon" name="CircleXIcon" />
          </div>
        </div>
      )}
      <div className="vx-rdb-new-content">
        <div className="vx-rdp-author" style={{ backgroundImage: `url(${avatarURL})` }} />
        <SystemDesign.TextInput 
          value={comment}
          placeholder="They are a very cool person!"
          onChange={setValue}
          onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key.toLowerCase() === "enter") sendReview();
          }}
          maxLength={1000}
          autoFocus
        />
        <Button
          size={Button.Sizes.ICON} 
          disabled={!comment.trim().length}
          onClick={sendReview}
        >
          <Icons.Send />
        </Button>
      </div>
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
  const ref = useRef<HTMLDivElement>(null);

  const [ reviewId, setReviewId ] = useReplyContext();
  const isFromCurrentUser = useStateFromStores([ UserStore ], () => UserStore.getCurrentUser().id === review.sender.discordID);
  const [ isDeleting, setIsDeleting ] = useState(false);

  const { hasAuth, currentUser, isSenderBlocked } = useInternalStore(reviewDBStore, () => ({
    hasAuth: reviewDBStore.hasAuth(),
    currentUser: reviewDBStore.getCurrentUser(),
    isSenderBlocked: reviewDBStore.isBlocked(review.sender)
  }));

  const canDeleteReview = useMemo(() => {
    if (!hasAuth) return false;
    return isFromCurrentUser || isViewingCurrentUser || currentUser?.type === 1;
  }, [ hasAuth, isFromCurrentUser, isViewingCurrentUser ]);

  const timestamp = useMemo(() => {
    const date = new Date(review.timestamp * 1000);
    
    return { date, time: date.toISOString(), formatted: formatTime(date) };
  }, [ ]);

  const [ showContent, setShowContent ] = useState(() => isPluginEnabled("expand-collapsed-messages"));
  
  const pfp = useMemo(() => (
    review.sender.profilePhoto ? review.sender.profilePhoto : getDefaultAvatar(review.sender.discordID)
  ), [ ]);

  const isReplyingTo = useMemo(() => reviewId === review.id, [ reviewId ]);

  if (isDeleting) return null;

  return (
    <div 
      className={className([ 
        "vx-rdb-review", 
        isReplyingTo && "vx-rdb-replying", 
        isComment && "vx-rdb-comment", 
        isSenderBlocked && "vx-rdb-blocked", 
        isSenderBlocked && showContent && "vx-rdb-expanded" 
      ])}
      data-review-id={review.id}
      ref={ref}
    >
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
                src={pfp}
              />
            </div>
            <div className="vx-rdb-body">
              <div className="vx-rdb-header">
                {(false) && (
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
                {review.type === 3 && (
                  <div className="vx-rdb-tag">
                    system
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
            {!!review.id && (
              <div className="vx-rdp-buttons">
                <MiniPopover.Button 
                  text={Messages.REPLY}
                  icon={Icons.DiscordIcon.from("ArrowAngleLeftUpIcon")}
                  onClick={() => {
                    setReviewId(review.id);
                    requestAnimationFrame(() => 
                      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                    );
                  }}
                />
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

const replyContext = createContext<[
  reviewId: number | null, setReviewId: React.Dispatch<React.SetStateAction<number | null>>
]>([ null, () => {} ]);
function useReplyContext() {
  return useContext(replyContext);
}

const reviewResultContext = createContext<null | ReviewDB.Reviews>(null);
function useReviewResultContext() {
  return useContext(reviewResultContext);
}

function useReviews(user: User) {
  const [ page, setPage ] = useState(1);
  const [ result, setResult ] = useState<null | ReviewDB.Reviews>(null);

  const destructor = useRef<() => void>(() => {});

  const fetchPage = useCallback((page: number) => {
    destructor.current();
    setResult(null);
    
    const controller = new AbortController();

    destructor.current = () => controller.abort();

    reviewDBStore.fetchReviews(user.id, (page - 1) * 50).then((res) => {
      if (controller.signal.aborted) return;
      setResult(res);
    });
  }, [ ]);

  const fetchCurrentPage = useCallback(() => {
    fetchPage(page);
  }, [ page ]);

  useEffect(() => {
    fetchCurrentPage();
    return () => destructor.current();
  }, [ ]);

  const newSetPage = useCallback((page: React.SetStateAction<number>) => {
    setPage((prev) => {
      const value = typeof page === "function" ? page(prev) : page;
      fetchPage(value);
      return value;
    });
  }, [ ]);

  return {
    fetchCurrentPage,
    page,
    setPage: newSetPage,
    result
  }
}

export function ReviewDBPage({ user, currentUser }: { user: User, currentUser: User }) {
  const { result, fetchCurrentPage, page, setPage } = useReviews(user);

  const replyMessageData = useState<null | number>(null);
  const id = useId();

  const ref = useRef<HTMLDivElement>(null);

  return (
    <reviewResultContext.Provider value={result}>
      <replyContext.Provider value={replyMessageData}>
        <div ref={ref} className="vx-rdb" data-rdb-id={id}>
          {result ? (
            <div ref={ref} className={className([ "vx-rdb-scroller", scrollerClasses.thin, scrollerClasses.fade ])}>
              {result.reviews.length ? result.reviews.map((review) => (
                <Review 
                  review={review} 
                  isViewingCurrentUser={currentUser.id === user.id} 
                  key={review.id} 
                  refetch={() => fetchCurrentPage()} 
                />
              )) : (
                <NoReviews />
              )}
              <SystemDesign.Paginator 
                currentPage={page}
                totalCount={result ? result.reviewCount : 0}
                pageSize={50}
                maxVisiblePages={5}
                onPageChange={setPage}
              />
            </div>
          ) : (
            <div className="vx-rdb-loading">
              <Spinner />
            </div>
          )}
          <AddReviewPanel id={id} user={user} refetch={() => fetchCurrentPage()} />
        </div>
      </replyContext.Provider>
    </reviewResultContext.Provider>
  )
}
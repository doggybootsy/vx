import { subscribeToDispatch, UserStore } from "@webpack/common";
import { InternalStore } from "../../util";
import { getProxyByKeys } from "@webpack";
import { settings } from ".";

const API_URL = "https://manti.vendicated.dev/api/reviewdb";

const Oauth2 = getProxyByKeys<{
  openOAuth2Modal(props: {
    scopes: string[],
    responseType: "code",
    redirectUri: string,
    permissions: bigint,
    clientId: string,
    callback(props: { location: string }): void
  }): void
}>([ "openOAuth2Modal" ]);

class ReviewDBStore extends InternalStore {
  constructor() {
    super();

    subscribeToDispatch("CONNECTION_OPEN", () => {
      this.emit();
      
      if (this.hasAuth()) {
        this.fetchCurrentUserInfo();
      }
    });
    subscribeToDispatch("LOGOUT", () => {
      this.emit();
    });
  }

  private get currentUserId() {
    return UserStore.getCurrentUser()?.id;
  }

  #users: Record<string, ReviewDB.CurrentUser> = {};

  public getCurrentUser(): ReviewDB.CurrentUser | undefined {
    return this.#users[this.currentUserId];
  }

  public getBlocks() {
    return this.getCurrentUser()?.blockedUsers ?? [];
  }

  public isBlocked(user: ReviewDB.User | string) {
    return this.getBlocks().includes(typeof user === "string" ? user : user.discordID);
  }

  public displayName = "ReviewDBStore";
  
  public hasAuth() {
    const user = UserStore.getCurrentUser();
    if (!user) return false;

    return user.id in settings.auth.get();
  }
  public getAuthToken() {
    if (!this.hasAuth()) throw new Error("User is not signed in");
    return settings.auth.get()[UserStore.getCurrentUser().id];
  }

  public logout() {
    const auth = { ...settings.auth.get() };

    delete auth[this.currentUserId];

    settings.auth.set(auth);
    
    delete this.#users[this.currentUserId];

    this.emit();
  }

  public async requestAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      Oauth2.openOAuth2Modal({
        scopes: [ "identify" ],
        responseType: "code",
        redirectUri: `${API_URL}/auth`,
        permissions: 0n,
        clientId: "915703782174752809",
        callback: async ({ location }) => {
          const url = new URL(location);
          // Use vencord since VX is not known
          url.searchParams.append("clientMod", "vencord");
  
          const res = await request(url, {
            headers: {
              Accept: "application/json"
            }
          });
  
          if (!res.ok) {
            reject();
            return;
          }

          const data = await res.json();
          
          const auth = settings.auth.get();
          
          settings.auth.set({
            ...auth,
            [UserStore.getCurrentUser().id]: data.token
          });

          this.emit();

          resolve();

          this.fetchCurrentUserInfo();
        }
      });
    });
  }

  public async attemptToEnsureAuth() {
    if (this.hasAuth()) return true;
    await this.requestAuth();
    return this.hasAuth();
  }

  private request(path: string, init?: RequestInit & { noAuthRequired?: boolean }) {
    const headers = new Headers(init?.headers);

    // Some API's you dont need auth, like viewing them
    try {
      headers.set("Authorization", this.getAuthToken());
    } catch (error) {
      if (!init?.noAuthRequired) throw error;
    }

    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (!headers.has("Accept")) headers.set("Accept", "Accept");

    if (!path.startsWith("/")) path = `/${path}`;
    return request(`${API_URL}${path}`, {
      ...init,
      headers: headers
    });
  }

  public get flags() {
    let flags = 0;
    if (!settings.showWarning.get()) flags |= 0b00000010;
    return flags;
  }

  public async fetchReviews(userId: string, offset?: number) {
    const searchParams = new URLSearchParams();
    searchParams.set("flags", this.flags.toString());
    searchParams.set("offset", (offset || 0).toString());

    const res = await this.request(`/users/${userId}/reviews?${searchParams}`, { noAuthRequired: true });

    const result: ReviewDB.Reviews = res.ok ? await res.json() : {
      message: res.status === 429 ? "You are sending requests too fast. Wait a few seconds and try again." : "An Error occured while fetching reviews. Please try again later.",
      reviews: [],
      updated: false,
      hasNextPage: false,
      success: false,
      reviewCount: 0
    }

    if (!result.success) {
      result.reviews.push({
        id: 0,
        comment: result.message,
        star: 0,
        timestamp: 0,
        type: 3,
        replies: null,
        sender: {
          badges: [],
          username: "VX",
          id: 0,
          profilePhoto: "https://raw.githubusercontent.com/doggybootsy/vx/main/assets/avatar.png",
          discordID: "vx"
        }
      });

      result.reviewCount = 1;
    }
    
    // result.reviews.reverse();
    // for (const review of result.reviews) {
    //   if (review.replies) review.replies.reverse();
    // }

    return result;
  }

  public async addReview(userId: string, review: ReviewDB.ReviewRequest) {    
    const res = await this.request(`/users/${userId}/reviews`, {
      method: "PUT",
      body: JSON.stringify({ userId, ...review })
    });

    if(res.ok) return true;
    return false;
  }

  public async deleteReview(reviewid: number) {
    const res = await this.request(`/users/${reviewid}/reviews`, {
      method: "DELETE",
      body: JSON.stringify({ reviewid })
    });

    if(res.ok) return true;
    return false;
  }

  public async reportReview(reviewid: number) {
    await this.request("/reports", {
      method: "PUT",
      body: JSON.stringify({ reviewid })
    });
  }

  async #updateBlockState(action: "block" | "unblock", userId: string) {
    const res = await this.request("/blocks", {
      method: "PATCH",
      body: JSON.stringify({
        action: action,
        discordId: userId
      })
    });

    if (!res.ok) return;
    
    const blockedUsers = this.getCurrentUser()!.blockedUsers ??= [];
    if (action === "block") {
      blockedUsers.push(userId);
      this.emit();
      return;
    }

    const index = blockedUsers.indexOf(userId);
    if (!~index) return;

    blockedUsers.splice(index, 1);
    this.emit();
  }
  public async blockUser(userId: string) {
    this.#updateBlockState("block", userId);
  }
  public async unblockUser(userId: string) {
    this.#updateBlockState("unblock", userId);
  }

  private async fetchCurrentUserInfo(): Promise<ReviewDB.CurrentUser> {
    const uid = this.currentUserId;
    const res = await this.request("/users", { method: "POST" });

    return this.#users[uid] = await res.json();
  }
}

export const reviewDBStore = new ReviewDBStore()
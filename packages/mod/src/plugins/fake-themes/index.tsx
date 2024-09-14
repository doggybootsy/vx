import { Developers } from "../../constants";
import { MenuComponents, patch } from "../../api/menu";
import { UserStore } from "@webpack/common";
import { definePlugin } from "../index";
import { Injector } from "../../patcher";
import { bySource, getLazy, getStore } from "@webpack";
import { User } from "discord-types/general";

interface ThemeSettings {
    PROFILE_THEME: { id: string; skuId: string };
    PROFILE_BORDER: { asset: string; skuId: string };
}

type User = {
    id: string;
};

type UserEx = User & {
    premiumType: number;
    avatarDecorationData: {asset?: string, sku_id?: string} | null
};


class ThemeManager {
    private readonly userThemeSettings: { [userId: string]: ThemeSettings };
    private collections: Array<{ categoryName: string; products: Array<{ productName: string; banner: string; type: "PROFILE_BORDER" | "PROFILE_THEME"; items: Array<{ asset: string | null; skuId: string; id: string }> }> }>;

    constructor() {
        this.userThemeSettings = {};
        this.collections = [];
    }

    async initialize(): Promise<void> {
        this.collections = await this.getAverageCollections();
    }

    private async getAverageCollections(): Promise<Array<{ categoryName: string; products: Array<{ productName: string; banner: string; type: "PROFILE_BORDER" | "PROFILE_THEME"; items: Array<{ asset: string | null; skuId: string; id: string }> }> }>> {
        const HTTP = await getLazy(bySource('rateLimitExpirationHandler'));
        const api: any = Object.values(HTTP).find((x: any) => x.get);
        const res = await api.get({ url: `/collectibles-categories?include_bundles=true` });
        const paths = res.body;
        return paths.map((category: any) => ({
            categoryName: category.name,
            products: category.products.map((product: any) => ({
                productName: product.name,
                banner: product.banner,
                type: product.items.some((item: any) => item.asset) ? "PROFILE_BORDER" : "PROFILE_THEME",
                items: product.items.map((item: any) => ({
                    asset: item.asset,
                    skuId: item.sku_id,
                    id: item.id,
                }))
            }))
        }));
    }

    addUser(userId: string): void {
        if (!this.userThemeSettings[userId]) {
            this.userThemeSettings[userId] = {
                PROFILE_THEME: { id: "", skuId: "" },
                PROFILE_BORDER: { asset: "", skuId: "" }
            };
        }
    }

    updateUserTheme(userId: string, type: "PROFILE_THEME" | "PROFILE_BORDER", asset: string | null, skuId: string, id: string): void {
        if (!this.userThemeSettings[userId]) {
            this.addUser(userId);
        }

        const finalAsset = asset || id;
        this.userThemeSettings[userId][type] = { asset: finalAsset, id: finalAsset, skuId };
        console.log(`Updated ${userId}'s ${type}:`, this.userThemeSettings[userId][type]);
    }

    getUserThemeSettings(userId: string): ThemeSettings | null {
        return this.userThemeSettings[userId] || null;
    }

    getDecorationsMenuItem(userId: string): JSX.Element {
        return (
            <MenuComponents.MenuItem
                id="fake-themes-decorations"
                label="Decorations"
                key="fake-themes-decorations"
            >
                {this.collections.map((category) => (
                    <MenuComponents.MenuItem label={category.categoryName} id={`fake-themes-category-${category.categoryName}`} key={category.categoryName}>
                        {category.products.map((product) => (
                            <MenuComponents.MenuItem label={product.productName} id={`fake-themes-product-${product.productName}`} key={product.productName}>
                                {product.items.map((item) => (
                                    <MenuComponents.MenuItem
                                        label={`${product.productName} ${item.asset ? "Decor" : "Effect"}`}
                                        id={`fake-themes-item-${item.skuId}`}
                                        key={item.skuId}
                                        action={() => {
                                            console.log(product);
                                            this.updateUserTheme(userId, item.asset ? "PROFILE_BORDER" : "PROFILE_THEME", item.asset, item.skuId, item.id);
                                        }}
                                    />
                                ))}
                            </MenuComponents.MenuItem>
                        ))}
                    </MenuComponents.MenuItem>
                ))}
            </MenuComponents.MenuItem>
        );
    }
}

const themeManager = new ThemeManager();
const injector = new Injector();
export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start(): Promise<void> {
        await themeManager.initialize();

        patch("fake-themes", "user-context", (_, __) => {
            const userId: string = _.user.id;
            themeManager.addUser(userId);

            __.props.children = [...__.props.children, themeManager.getDecorationsMenuItem(userId)];
        });

        // @ts-ignore
        injector.after(UserStore, "getUser", (_, __, ___: UserEx) => {
            if (!___ || !___.id) return;

            const decorData = themeManager.getUserThemeSettings(___.id);

            if (!decorData || !decorData.PROFILE_BORDER || (!decorData.PROFILE_BORDER.asset && !decorData.PROFILE_BORDER.skuId)) return;

            ___.avatarDecorationData = ___.avatarDecorationData || {};
            ___.avatarDecorationData.asset = decorData.PROFILE_BORDER.asset;
            ___.avatarDecorationData.sku_id = decorData.PROFILE_BORDER.skuId;
            ___.premiumType = 2;
        });

        // @ts-ignore
        injector.after(getStore("UserProfileStore"), "getUserProfile", (_, __, ___: {userId: string, premiumType: number, profileEffectId: string}) => {
            if (!___ || !___.userId) return;
            const decorData = themeManager.getUserThemeSettings(___.userId);
            if (!decorData) return;

            ___.premiumType = ___.premiumType ? ___.premiumType : 2;
            ___.profileEffectId = decorData.PROFILE_BORDER.asset || decorData.PROFILE_THEME.id;
        });
    }
});
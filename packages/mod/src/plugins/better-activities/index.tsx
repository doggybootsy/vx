import { definePlugin } from "../index";
import { Developers } from "../../constants";
import { bySource, getModule, getProxy, whenWebpackInit, whenWebpackReady } from "@webpack";
import { Injector } from "../../patcher";
import { closeMenu, MenuComponents, openMenu } from "../../api/menu";
import { clipboard, findInReactTree } from "../../util";
import {debug} from "node:util";

const inj: Injector = new Injector();
const ActivityCard: any = getProxy(bySource("USER_PROFILE_ACTIVITY_EDUCATION_TOOLTIP", "getCurrentUser"));

export default definePlugin({
    authors: [Developers.kaan],
    requiresRestart: false,
    async start(): Promise<void> {
        await whenWebpackReady();
        console.log("started");

        inj.after(ActivityCard, "Z", (_instance: any, _args: any, yeah: any) => {
            const children: any = yeah.props;
            if (children.children) {
                const patch: () => void = inj.after(children, "children", (_, args: any, yeah: any) => {
                    patch();
                    const Activity: any = findInReactTree(yeah, m => m?.activity ?? m?.user);
                    const Yeah: any = findInReactTree(yeah, m => m?.image);
                    
                    console.log(args, yeah);
                    yeah.props.children[1].props.onContextMenu = (event: MouseEvent) => openMenu(event, (props: any) => (
                        <MenuComponents.Menu onClose={closeMenu} {...props}>
                            {copierObjects(Activity.activity ?? Activity.user, "activity-navId", 10,0, Activity.activity)}
                            {Yeah?.image && <MenuComponents.Item id={"vx-image-menu"} label={"Extra"}>
                                {copierObjects(Yeah.image, "activity-navId", 10,0, Yeah.image)}
                            </MenuComponents.Item>}
                        </MenuComponents.Menu>
                    ));
                });
            }
        });
    }
});

const toPascalCase = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace("_", " ")
}

const isValueEmpty = (value: any): boolean => {
    return (
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        ((value instanceof Set || value instanceof Map) && value.size === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
    );
};

const copierObjects = (data: any, parentId: string, maxItems: number = 10, depth: number = 0, debugObject: Object): JSX.Element[] => {
    if (depth >= 100 || depth >= maxItems) {
        console.warn('Recursion depth or maxItems limit exceeded.');
        return [];
    }

    return Object.entries(data || {}).map(([key, value]: [string, any]) => {
        const itemId: string = `${parentId}-${key}`;
        const isValueNull: boolean = isValueEmpty(value);
        return renderMenuItem(key, value, itemId, parentId, isValueNull, maxItems, depth + 1, debugObject);
    });
};

const renderMenuItem = (key: string, value: any, itemId: string, _parentId: string, isValueNull: boolean, maxItems: number, depth: number, debugObject: Object): JSX.Element => {
    const handleCopy = (): void => {
        clipboard.copy(value?.toString() || '');
        console.log(value);
    };

    if (Array.isArray(value)) {
        return (
            <MenuComponents.Item key={itemId} id={itemId} label={toPascalCase(key)} disabled={isValueNull} onClose={closeMenu}>
                {value.map((item: any, index: number) => (
                    <MenuComponents.Item key={`${itemId}-${index}`} id={`${itemId}-${index}`} label={`${toPascalCase(key)} ${index}`} disabled={isValueNull}>
                        {renderMenuItem(`${key} ${index}`, item, `${itemId}-${index}`, itemId, isValueNull, maxItems, depth + 1, debugObject)}
                    </MenuComponents.Item>
                ))}
            </MenuComponents.Item>
        );
    } else if (typeof value === 'object' && value !== null) {
        return (
            <MenuComponents.Item key={itemId} id={itemId} label={toPascalCase(key)} disabled={isValueNull} onClose={closeMenu}>
                {copierObjects(value, itemId, maxItems, depth + 1, debugObject)}
            </MenuComponents.Item>
        );
    } else {
        return (
            <MenuComponents.Item
                key={itemId}
                id={itemId}
                label={`Copy ${toPascalCase(key)}`}
                action={() => {handleCopy(); console.log(debugObject)}}
                onClose={closeMenu}
                sparkle={true}
                disabled={isValueNull}
            />
        );
    }
};
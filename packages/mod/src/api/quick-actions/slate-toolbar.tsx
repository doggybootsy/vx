import {Tooltip} from "../../components";
import {addPlainTextPatch} from "@webpack";

addPlainTextPatch(
    {
        match: "markdownSyntax:",
        find: /(\((\w+),.{10,20}markdownSyntax:"spoiler".{75,100})]/,
        replace: `$1,$vxi.STAPI.renderButtons($2)]`
    },
    {
        match: /\w+.\w+.edges\(\w+.selection\)/,
        find: /(onClick:\s*\(\)\s*=>\s*\{)(\s*)(null\s*!=\s*(\w+)\s*&&\s*\w+\.\w+\.withSingleEntry\([^)]+\))/,
        replace: "$1if(arguments[0]?.onClick){arguments[0].onClick?.()} else if (null!= $4) $3"
    }
)

interface ButtonConfig {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip?: string;
}

class DynamicButtonAPI {
    private buttonConfigs: ButtonConfig[];

    constructor() {
         this.buttonConfigs = [];
    }

    renderButtons(T?: any) {
        return this.buttonConfigs.map((config, index) => (
            <Tooltip key={index} text={config.tooltip || config.label}>
                {(props) => {
                    const ButtonWrapper = T || 'div';
                    return (
                        <ButtonWrapper>
                            <div
                                {...props}
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: "100%"
                                }}
                                onClick={config.onClick}>
                                {config.icon}
                            </div>
                        </ButtonWrapper>
                    );
                }}
            </Tooltip>
        ));
    }

    addButton(config: ButtonConfig) {
        this.buttonConfigs.push(config);
    }
}

export const SlateToolbarAPI = __self__.STAPI = new DynamicButtonAPI();
import { getModuleIdBySource, webpackRequire, getByProtoKeys } from "@webpack";

import { compileFunction, makeLazy, proxyCache } from "../util";
import ErrorBoundary from "./boundary";
import { IconProps } from "./icons";
import { Tooltip } from "./tooltip";

const moduleIdRegex = /\(0,.{1,3}\.makeLazy\)\({createPromise:\(\)=>(Promise.all\(\[.+?\]\))\.then\((.{1,3})\.bind\(\2,"(\d+)"\)\),webpackId:"\3",name:"UserSettings"}\),/;

type Predicate = () => boolean;

export interface DividerSection {
  section: "DIVIDER",
  predicate: Predicate
}
export interface CustomSection {
  section: "CUSTOM",
  predicate: Predicate,
  element: React.ComponentType
}
export interface HeaderSection {
  section: "HEADER",
  predicate: Predicate,
  label: string
}
export interface ViewSection {
  section: string,
  element: React.ComponentType,
  predicate: Predicate,
  label: string,
  icon: React.ReactNode
}

export type Section = DividerSection | CustomSection | HeaderSection | ViewSection;

interface SettingsViewProps {
  sections: Section[],
  section: string,
  onClose(): void,
  onSetSection(section: string): void
};

const sections = {
  Divider(options: Predicate | { predicate?: Predicate } = {}): DividerSection {
    let predicate: Predicate;
    
    if (typeof options === "function") {
      predicate = options;
    }
    else {
      predicate = options.predicate ?? (() => true);
    }

    return {
      section: "DIVIDER",
      predicate
    }
  },
  Custom(options: React.ComponentType | { predicate?: Predicate, element: React.ComponentType }): CustomSection {
    let predicate: Predicate;
    let element: React.ComponentType;
    
    if (typeof options === "object") {
      element = options.element;
      predicate = options.predicate ?? (() => true);
    }
    else {
      element = options;
      predicate = () => true;
    }

    return {
      section: "CUSTOM", 
      element,
      predicate
    }
  },
  Header(options: string | { predicate?: Predicate, label: string, icon?: React.FunctionComponent<IconProps>, iconTooltip?: string }): CustomSection {
    let predicate: Predicate;
    let label: string;
    let iconTooltip: string | null = null;
    let Icon: React.FunctionComponent<IconProps>;

    if (typeof options === "string") {
      label = options;
      predicate = () => true;
      Icon = () => null;
    }
    else {
      label = options.label;
      predicate = options.predicate ?? (() => true);
      Icon = (props) => options.icon ? <options.icon {...props} /> : null;
      iconTooltip = options.iconTooltip ?? null;
    }

    return SettingsView.Sections.Custom({
      predicate,
      element: () => (
        <div className="vx-sidebar-header">
          <div className="vx-sidebar-text">{label}</div>
          {Icon && (
            <Tooltip text={iconTooltip} shouldShow={typeof iconTooltip === "string"}>
              {(props) => (
                <div {...props} className="vx-sidebar-icon">
                  <Icon width={18} height={18} />
                </div>
              )}
            </Tooltip>
          )}
        </div>
      )
    });

    // return {
    //   section: "HEADER", 
    //   label,
    //   predicate
    // }
  },
  View(options: { predicate?: Predicate, element: React.ComponentType, section?: string, label: string, icon?: React.ReactNode }): ViewSection {
    const { predicate = () => true, element, label, section = label.toLowerCase().replace(" ", "-"), icon = null } = options;

    return {
      section,
      element,
      predicate,
      label,
      icon
    }
  }
};

function getSettingsView() {  
  const moduleId = getModuleIdBySource("CollectiblesShop", "GuildSettings", "UserSettings")!;

  const module = String(webpackRequire!.m[moduleId]!);
  
  const [, promiseString, requireKey, moduleKey ] = module.match(moduleIdRegex)!;

  const load = compileFunction<(require: Webpack.Require) => Promise<void>>(`return ${promiseString}`, [ requireKey ]);
  
  return makeLazy({
    name: "SettingsView",
    factory: async () => {
      await load(webpackRequire!);
      webpackRequire!(moduleKey);

      return getByProtoKeys<React.ComponentType<SettingsViewProps>>([ "renderSidebar", "getPredicateSections" ])!;
    }
  });
}

const WrappedSettingsView = proxyCache(getSettingsView);

export function SettingsView(props: SettingsViewProps) {
  return (
    <ErrorBoundary>
      <WrappedSettingsView {...props} />
    </ErrorBoundary>
  )
}

SettingsView.Sections = sections;

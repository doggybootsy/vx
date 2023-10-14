import { openAlertModal } from "../api/modals";
import { byStrings, getProxy, getProxyByProtoKeys, getProxyByStrings, whenWebpackReady } from "../webpack";
import { LayerManager, React } from "../webpack/common";
import { Home, Themes, pluginsSection } from "./pages";

import "./index.css";
import { InternalStore } from "../util";
import { plainTextPatches } from "../webpack/patches";
import { Icons } from "../components";

const SettingsView = getProxyByProtoKeys<any>([ "renderSidebar" ]);

export function Panel(props: {
  title: React.ReactNode,
  buttons?: React.ReactNode,
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="vx-section-header">
        <div className="vx-section-title">
          {props.title}
        </div>
        <div className="vx-section-buttons">
          {props.buttons}
        </div>
      </div>
      {props.children}
    </div>
  )
};

const Notice = getProxyByStrings<any>([ ".EMPHASIZE_NOTICE", ".onReset" ]);

class NoticeStore extends InternalStore {
  #showNotice = false;
  setShowNotice(shouldShow: boolean) {
    this.#showNotice = shouldShow;
    this.emit();
  };
  showNotice() {
    return this.#showNotice;
  }
};

export type NoticeStoreType = NoticeStore;

interface SectionType {
  label: string,
  section: string,
  onReset?(): void,
  onSave?(): void,
  element: (props: { notice: NoticeStore }) => React.ReactNode
};
export function createSection(section: SectionType) {  
  let noticeStore: NoticeStore;  

  queueMicrotask(() => {
    // Esbuilds esm sucks and im not gonna keep using require for where it lacks
    noticeStore = new NoticeStore();
  });

  return () => ({
    label: section.label,
    section: section.section,
    notice: {
      element: () => (
        <Notice 
          onReset={section.onReset}
          onSave={section.onSave}
        />
      ),
      stores: [
        noticeStore!
      ]
    },
    element: () => (
      <section.element notice={noticeStore} />
    )
  });
};

function Dashboard(props: { section: string }) {
  const [ section, setSection ] = React.useState(() => props.section);

  const sections = React.useMemo(() => [
    {
      section: "HEADER",
      label: "VX" 
    },
    { 
      section: "home", 
      label: "Home", 
      element: () => <Home />
    },
    pluginsSection(),
    { 
      section: "themes", 
      label: "Themes",
      element: () => <Themes />
    },
    { 
      section: "custom-css", 
      label: "Custom CSS",
      onClick() {
        openAlertModal("Custom CSS", [ "Not added yet" ]);
      }
    },
    { section: "DIVIDER" },
    {
      section: "change-log",
      label: "Changelog",
      onClick() {
        openAlertModal("Changelog", [ "Not added yet" ]);
      }
    },
    { section: "DIVIDER" },
    {
      section: "CUSTOM", 
      element: () => (
        <div className="vx-section-info">
          <div className="vx-section-version">VX 1.0.0</div>
        </div>
      )
    }
  ], [ ]);

  return (
    <SettingsView 
      sections={sections}
      section={section}
      onClose={LayerManager.popLayer}
      onSetSection={setSection}
    />
  )
};

function openDashboard(section: string = "home") {
  LayerManager.pushLayer(() => (
    <Dashboard section={section} />
  ));
};

plainTextPatches.push(
  {
    identifier: "VX(private-channels-list)",
    match: ".showDMHeader",
    replacements: [
      {
        find: /,(.{1,3})=(.{1,3}\.children)/,
        replace: ",$1=window.VX._self._addNavigatorButton($2)"
      }
    ]
  }
);

const filter = byStrings("linkButtonIcon", ".linkButton,");
const NavigatorButton = getProxy<React.FunctionComponent<any>>((m) => m.prototype && filter(m.prototype.render), { searchExports: true })

export function _addNavigatorButton(children: React.ReactNode[]) {  
  return [
    ...children,
    <NavigatorButton 
      selected={false}
      text="VX"
      key="vx-navigation-button"
      onClick={() => {
        openDashboard();
      }}
      icon={Icons.Logo}
    />
  ];
};

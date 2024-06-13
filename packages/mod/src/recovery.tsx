import { bySource, getLazy } from "@webpack";
import { Component, isValidElement } from "react";
import { Injector } from "./patcher";
import { Button, Collapsable, Markdown } from "./components";
import { closeAllModals } from "./api/modals";
import { closeMenu } from "./api/menu";

type ErrorBoundaryComponent = Component<React.PropsWithChildren, { error: Error, info: React.ErrorInfo }>;

function attemptRecovery() {
  closeAllModals();
  closeMenu();
}

async function init() {
  const ErrorBoundary = await getLazy<{
    default: { prototype: ErrorBoundaryComponent }
  }>(bySource(".AnalyticEvents.APP_CRASHED"), { searchDefault: false });

  const injector = new Injector();

  injector.after(ErrorBoundary.default.prototype, "render", (that, args, res) => {    
    try {
      if (!that.state.error) return;
      if (!isValidElement(res)) return;
      
      const { children } = res.props.action.props;
  
      if (!Array.isArray(children)) return;
  
      const index = children.findIndex((button) => isValidElement(button) && button.key === "vx-recover");
      if (!index) return;
  
      children.splice(
        1, 
        0, 
        <Button
          size={Button.Sizes.LARGE}
          key="vx-recover"
          style={{ marginLeft: 8 }}
          onClick={() => {
            attemptRecovery();
            
            // @ts-expect-error
            that.setState({ error: null, info: null })
          }}
        >
          Recover
        </Button>
      );
  
      const errorCodeMatch = that.state.error.message.match(/#(\d+)/);
      res.props.note = [
        res.props.note,
        <Collapsable className="vx-react-error-recovery-note" header={<div id="vx-react-error-recovery-header">View React Error{errorCodeMatch ? ` ${errorCodeMatch[0]}` : ""}</div>} speed={1000}>
          <Markdown text={`\`\`\`js\n${that.state.error.stack}\n\`\`\``} />
        </Collapsable>
      ]
    } 
    catch (error) {
      console.error(error);
    }
  });
}

init();
import { Flex, FlexChild } from ".";
import { className } from "../util";
import { React } from "../webpack/common";

import "./collapsable.css";

interface CollapsableProps {
  className?: string,
  open?: boolean,
  onOpen?(): void,
  onClose?(): void,
  header: React.ReactNode,
  children: React.ReactNode
};

export function Collapsable(props: CollapsableProps) {
  const [ isOpen, setOpen ] = React.useState(() => props.open ?? false);

  return (
    <Flex 
      className={className([
        "vx-collapsable",
        props.className
      ])} 
      direction={Flex.Direction.VERTICAL}
    >
      <FlexChild 
        className="vx-collapsable-header"
        onClick={() => {
          setOpen(!isOpen);
          
          if (isOpen) return props.onClose?.();
          props.onOpen?.();
        }}
      >
        {props.header}
      </FlexChild>
      {isOpen && (
        <>
          <FlexChild  className="vx-collapsable-seperator" />
          <FlexChild className="vx-collapsable-body">
            {props.children}
          </FlexChild>
        </>
      )}
    </Flex>
  )
};
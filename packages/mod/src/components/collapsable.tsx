import { createContext, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Flex, FlexChild } from ".";
import { className, setRefValue } from "../util";

import "./collapsable.css";
import { ReactSpring } from "@webpack/common";

interface CollapsableRef {
  open(): void, 
  close(): void, 
  toggle(): boolean, 
  isOpen(): boolean,
  getDOMNode(): HTMLDivElement | null
}

type SpeedFunction = (isRevealing: boolean) => number;

interface CollapsableProps {
  className?: string,
  headerClassName?: string,
  wrapperClassName?: string,
  bodyClassName?: string,

  open?: boolean,
  speed?: number | SpeedFunction,

  onOpen?(): void,
  onClose?(): void,

  collapsableRef?: React.Ref<CollapsableRef>,
  
  header: React.ReactNode,
  children: React.ReactNode
};

export const collapsableStateContext = createContext(false);

export function Collapsable(props: CollapsableProps) {
  const [ isOpen, setOpen ] = useState(() => props.open ?? false);
  const state = useRef(isOpen);

  const bodyRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const speed = useMemo<SpeedFunction>(() => {
    if (!props.speed) return (isRevealing) => isRevealing ? 150 : 300;
    if (typeof props.speed === "function") return props.speed;
    return () => props.speed as number;
  }, [ props.speed ]);

  const [ { height }, set ] = ReactSpring.useSpring(() => ({
    immediate: false,
    height: 0,
    onChange(height: number) {
      if (wrapperRef.current) wrapperRef.current.style.height = `${height}px`;
    },
    onRest() {
      if (wrapperRef.current && state.current) wrapperRef.current.style.height = "unset";
    },
    config: { duration: 0, easing: (t: any) => t, clamp: true }
  }), []);
  
  const revealOrHide = useCallback((isRevealing: boolean) => {    
    if (!bodyRef.current) return;

    const final = isRevealing ? Math.max(bodyRef.current.clientHeight, bodyRef.current.offsetHeight) : 0;

    if (isRevealing && props.onOpen) props.onOpen();
    else if (!isRevealing && props.onClose) props.onClose();

    set({
      height: final,
      config: { duration: Math.abs(final - height.get()) / speed(isRevealing) * 1000 }
    });
  }, [ set, props.onOpen, props.onClose ]);

  useLayoutEffect(() => {
    const isOpen = props.open ?? false;

    setOpen(isOpen);
    state.current = isOpen;

    if (wrapperRef.current) wrapperRef.current.style.height = isOpen ? "unset" : "0px";    
  }, [ props.open ]);

  const reference = useMemo(() => ({
    open() {
      if (state.current) return;
      revealOrHide(true);
    },
    close() {
      if (!state.current) return;
      revealOrHide(false);
    },
    toggle() {
      if (state.current) {
        revealOrHide(false);
        setOpen(false);
        state.current = false;

        return false;
      }

      revealOrHide(true);
      setOpen(true);
      state.current = true;

      return true;
    },
    isOpen() {
      return state.current;
    },
    getDOMNode() {
      if (!wrapperRef.current || !wrapperRef.current.parentElement) return null;
      return wrapperRef.current.parentElement as HTMLDivElement;
    }
  }), [ ]);
  
  return (
    <collapsableStateContext.Provider value={isOpen}>
      <Flex 
        className={className([ "vx-collapsable", props.className ])} 
        direction={Flex.Direction.VERTICAL}
      >
        <FlexChild 
          className={className([ "vx-collapsable-header", props.headerClassName ])} 
          onClick={() => {
            setOpen(!isOpen);
            revealOrHide(!isOpen);
          }}
        >
          {props.header}
        </FlexChild>
        <div 
          className={className([ "vx-collapsable-body-wrapper", props.wrapperClassName ])}
          ref={(node) => {
            setRefValue(wrapperRef, node);
            
            setRefValue(props.collapsableRef, node ? reference : null);
          }}
        >
          <div className={className([ "vx-collapsable-body", props.bodyClassName ])} ref={bodyRef}>
            {props.children}
          </div>
        </div>
      </Flex>
    </collapsableStateContext.Provider>
  )
}
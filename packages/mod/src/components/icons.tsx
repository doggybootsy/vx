import { useMemo } from "react";

import { className } from "../util";
import { SystemDesign } from "./util";
import ErrorBoundary from "./boundary";

export interface IconFullProps {
  width?: React.CSSProperties["width"],
  height?: React.CSSProperties["height"],
  color?: React.CSSProperties["color"],
  className?: string
};
export interface IconSizeProps {
  size?: React.CSSProperties["width"] | React.CSSProperties["height"],
  color?: React.CSSProperties["color"],
  className?: string
};

export type IconProps = IconFullProps | IconSizeProps;

function isSizeStyle(props: IconProps): props is IconSizeProps {
  return "size" in props && props.size !== "custom";
}

function ensureProps(props: IconProps, name: string): Required<IconFullProps> {
  const sizeStyle = isSizeStyle(props);

  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  
  const baseHeight = sizeStyle ? props.size : props.height;
  const height: React.CSSProperties["height"] = baseHeight ?? 24;

  const baseWidth = sizeStyle ? props.size : props.width;
  const width: React.CSSProperties["width"] = baseWidth ?? 24;

  const classNameProp = useMemo(() => className([ "vx-icon", `vx-icon-${name.toLocaleLowerCase()}`, props.className ]), [ props.className ]);

  return { color, height, width, className: classNameProp }
}

export function DiscordIcon(props: IconProps & { name: string }) {  
  return __jsx__(SystemDesign[props.name], { ...ensureProps(props, props.name), size: "custom" });
}

const cache: Record<string, React.ComponentType<IconProps>> = {};
DiscordIcon.from = function from(name: string): React.ComponentType<IconProps> {
  return cache[name] ??= ErrorBoundary.wrap((props) => <DiscordIcon name={name} {...props} />);
}
DiscordIcon.getAll = function getAll() {
  const $SystemDesign = SystemDesign[Symbol.for("vx.proxy.cache")]();

  const icons: Record<string, any> = {};

  for (const key in $SystemDesign) {
    if (Object.prototype.hasOwnProperty.call($SystemDesign, key)) {      
      if (key.endsWith("Icon")) icons[key] = $SystemDesign[key];
    }
  }

  return icons;
}

export function At(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "At");

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 24 24">
      <path fill={color} d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z" />
    </svg>
  )
}

export function Trash(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Trash");

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 24 24">
      <path fill={color} d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z" />
      <path fill={color} d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z" />
    </svg>
  )
}

export function Gear(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Gear");

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 24 24">
      <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" />
    </svg>
  )
}

export function Folder(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Folder");

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 24 24">
      <path fill={color} d="M20 7H12L10.553 5.106C10.214 4.428 9.521 4 8.764 4H3C2.447 4 2 4.447 2 5V19C2 20.104 2.895 21 4 21H20C21.104 21 22 20.104 22 19V9C22 7.896 21.104 7 20 7Z" />
    </svg>
  )
}

export function Github(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Github");

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function Brush(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Brush");

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04z" />
    </svg>
  )
}

export function Code(props: IconProps) {
    const {color, height, width, className} = ensureProps(props, "Code");

    return (
        <svg width={width} height={height} className={className} viewBox="0 0 32 20">
            <path fill={color}
                  d="M10.7183 2.13624C10.8327 2.02004 10.9234 1.88209 10.9854 1.73026C11.0473 1.57844 11.0792 1.41572 11.0792 1.25138C11.0792 1.08705 11.0473 0.924322 10.9854 0.772498C10.9234 0.620673 10.8327 0.482722 10.7183 0.366521C10.6038 0.250319 10.468 0.158143 10.3185 0.0952552C10.169 0.0323674 10.0088 -1.22438e-09 9.847 0C9.68519 1.22438e-09 9.52497 0.0323674 9.37547 0.0952552C9.22598 0.158143 9.09015 0.250319 8.97573 0.366521L0.361535 9.11514C0.246934 9.23124 0.15601 9.36915 0.0939718 9.52099C0.0319337 9.67283 0 9.83561 0 10C0 10.1644 0.0319337 10.3272 0.0939718 10.479C0.15601 10.6308 0.246934 10.7688 0.361535 10.8849L8.97573 19.6335C9.20681 19.8682 9.52021 20 9.847 20C10.1738 20 10.4872 19.8682 10.7183 19.6335C10.9493 19.3988 11.0792 19.0805 11.0792 18.7486C11.0792 18.4167 10.9493 18.0984 10.7183 17.8638L2.97287 10L10.7183 2.13624ZM21.2817 2.13624C21.0507 1.90156 20.9208 1.58327 20.9208 1.25138C20.9208 0.919494 21.0507 0.6012 21.2817 0.366521C21.5128 0.131841 21.8262 8.56586e-09 22.153 0C22.4798 -8.56586e-09 22.7932 0.131841 23.0243 0.366521L31.6385 9.11514C31.7531 9.23124 31.844 9.36915 31.906 9.52099C31.9681 9.67283 32 9.83561 32 10C32 10.1644 31.9681 10.3272 31.906 10.479C31.844 10.6308 31.7531 10.7688 31.6385 10.8849L23.0243 19.6335C22.7932 19.8682 22.4798 20 22.153 20C21.8262 20 21.5128 19.8682 21.2817 19.6335C21.0507 19.3988 20.9208 19.0805 20.9208 18.7486C20.9208 18.4167 21.0507 18.0984 21.2817 17.8638L29.0271 10L21.2817 2.13624Z" />
    </svg>
  )
}

export function Palette(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Palette");

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M12.433 10.07C14.133 10.585 16 11.15 16 8a8 8 0 1 0-8 8c1.996 0 1.826-1.504 1.649-3.08-.124-1.101-.252-2.237.351-2.92.465-.527 1.42-.237 2.433.07zM8 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  )
}

export function Logo(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Logo");

  if (__self__.__proto_logo__ === 0) {
    return (
      <svg className={className} width={width} height={height} viewBox="0 0 172 154" xmlns="http://www.w3.org/2000/svg">
        <path fill={color} d="M29 15.5H54.325l31.65 46 31.7575-46.075h25.275l-56.97 84.1025Zm83.5 123-17.25-25.925L107.625 93.8 138.1 138.5Zm-78.5 0 29.875-44L76.5 113.125l-16.875 25.4ZM67.275 154 85.95 126.5 105.1 154H167L117.5 80 172 0H109.775l-23.8 34.5L62.425 0H0L54.725 81 5 154Z" />
      </svg>
    )
  }
  if (__self__.__proto_logo__ === 1) {
    return (
      <svg className={className} width={width} height={height} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272.1 154">
        <path d="M167 154H105.1L0 0H62.425L136.1 108.5 154.825 81 100.1 0h62.425l23.55 34.5L209.875 0H272.1L217.6 80l49.5 74H205.2l-19.15-27.5L167.375 154Z" fill={color} />
      </svg>
    )
  }
  if (__self__.__proto_logo__ === 2) {
    return (
      <svg className={className} width={width} height={height} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 272.1 154">
        <path d="M129.1 15.5H154.425l31.65 46 31.7575-46.075h25.275l-56.97 84.1025Zm83.5 123-17.25-25.925L207.725 93.8 238.2 138.5Zm-100.1 0-83.5-123h25.556L126.8795 122.026h18.406L163.975 94.5 176.6 113.125l-16.875 25.4ZM167.375 154 186.05 126.5 205.2 154H267.1L217.6 80 272.1 0H209.875l-23.8 34.5L162.525 0H100.1L154.825 81 135.7523 109.0001 62.425 0H0L105.1 154Z" fill={color} />
      </svg>
    )
  }

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M51.4697 27.0801L38.96 74.6582L22.0068 75.6152L6.62598 27.5586L22.8271 26.0547L29.3896 54.082L35.7471 26.0547L51.4697 27.0801ZM93.75 27.0801L80.4199 50.2539L91.7676 70.4199L77.4805 74.8633L71.3281 60.918L64.082 74.9316L49.3164 69.5996L61.8945 49.7754L50.4102 28.9258L66.0645 25.166L71.6699 38.9062L77.6172 25.166L93.75 27.0801Z" />
    </svg>
  )
};

export function Sort(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Sort");

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
      <path fill={color} d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
    </svg>
  )
}

export function SortReverse(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "SortReverse");

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M12.96 7H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V7z" />
      <path fill={color} d="M10.082 12.629 9.664 14H8.598l1.789-5.332h1.234L13.402 14h-1.12l-.419-1.371h-1.781zm1.57-.785L11 9.688h-.047l-.652 2.156h1.351z" />
      <path fill={color} d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
    </svg>
  )
}

export function Store(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Store");

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 11.5C13.2974 11.4997 14.4665 10.9504 15.2875 10.0718C15.396 9.95576 15.5838 9.95611 15.6919 10.0725C16.5074 10.9506 17.672 11.5 18.9649 11.5C19.5579 11.5 20.1175 11.3868 20.6269 11.183C20.8005 11.1135 20.999 11.2357 20.999 11.4226V19.0001C20.999 20.6569 19.6559 22.0001 17.999 22.0001H15.249C15.111 22.0001 14.999 21.8881 14.999 21.75V16.0001C14.999 14.8955 14.1036 14 12.999 14L11.001 14.0004C9.89639 14.0004 9.00096 14.8958 9.00096 16.0004V21.7504C9.00096 21.8885 8.88903 22.0004 8.75096 22.0004H6.00096C4.34411 22.0004 3.00096 20.6573 3.00096 19.0004V11.423C3.00096 11.2361 3.19953 11.1139 3.37309 11.1834C3.8825 11.3872 4.44206 11.5004 5.03511 11.5004C6.32803 11.5004 7.49262 10.951 8.30814 10.0729C8.4162 9.95649 8.60405 9.95614 8.71247 10.0722C9.53354 10.9508 10.7026 11.4997 12 11.5Z" fill={color}/>
      <path d="M13.999 2C14.5513 2 14.999 2.44772 14.999 3.00001V7C14.999 7.05178 14.9977 7.10325 14.9951 7.15438C14.9738 7.5744 14.8662 7.97161 14.6895 8.32863C14.6726 8.36278 14.6551 8.39658 14.6369 8.42999C14.1291 9.36489 13.1387 9.99965 12 10C10.8613 9.99965 9.87094 9.36528 9.36306 8.43037C9.34491 8.39696 9.32738 8.36317 9.31047 8.32901C9.13383 7.97199 9.02617 7.57478 9.00488 7.15477C9.00229 7.10363 9.00098 7.05217 9.00098 7.00039V3.00039C9.00098 2.4481 9.44869 2.00038 10.001 2.00038L13.999 2Z" fill={color}/>
      <path d="M18.2934 2C19.6056 2 20.7655 2.85276 21.1569 4.10517L21.7957 6.1495C22.1655 7.33272 21.7585 8.52777 20.9195 9.26586C20.4043 9.7191 19.7261 10 18.9649 10C17.8388 10 16.8592 9.37238 16.357 8.44784C16.3366 8.41027 16.3169 8.37218 16.2981 8.33364C16.1065 7.94121 15.999 7.50024 15.999 7.03414V3.00001C15.999 2.44772 16.4467 2 16.999 2H18.2934Z" fill={color}/>
      <path d="M5.70655 2.00038C4.3944 2.00038 3.23449 2.85314 2.84311 4.10555L2.20425 6.14989C1.83451 7.3331 2.24148 8.52815 3.08049 9.26624C3.59571 9.71948 4.27387 10.0004 5.03511 10.0004C6.16124 10.0004 7.14078 9.37276 7.643 8.44822C7.66343 8.41065 7.68306 8.37256 7.70187 8.33402C7.89345 7.94159 8.00097 7.50062 8.00097 7.03453V3.00039C8.00097 2.4481 7.55325 2.00038 7.00098 2.00038H5.70655Z" fill={color}/>
    </svg>    
  )
}

export function Copy(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Copy");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path fill={color} d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z" />
      <path fill={color} d="M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z" />
    </svg>
  )
}

export function FloppyDisk(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "FloppyDisk");

  return (
    <svg aria-hidden="true" role="img" style={{ padding: 2 }} className={className} width={width} height={height} viewBox="0 0 16 16">
      <path fill={color} d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5v-13Z" />
      <path fill={color} d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5V16Zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V0ZM9 1h2v4H9V1Z" />
    </svg>
  )
}

export function Warn(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Warn");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 20 20">
      <path d="M10 0C4.486 0 0 4.486 0 10C0 15.515 4.486 20 10 20C15.514 20 20 15.515 20 10C20 4.486 15.514 0 10 0ZM9 4H11V11H9V4ZM10 15.25C9.31 15.25 8.75 14.691 8.75 14C8.75 13.31 9.31 12.75 10 12.75C10.69 12.75 11.25 13.31 11.25 14C11.25 14.691 10.69 15.25 10 15.25Z" fillRule="evenodd" clipRule="evenodd" fill={color} />
    </svg>
  )
}

export function Help(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Help");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path d="M12 2C6.486 2 2 6.487 2 12C2 17.515 6.486 22 12 22C17.514 22 22 17.515 22 12C22 6.487 17.514 2 12 2ZM12 18.25C11.31 18.25 10.75 17.691 10.75 17C10.75 16.31 11.31 15.75 12 15.75C12.69 15.75 13.25 16.31 13.25 17C13.25 17.691 12.69 18.25 12 18.25ZM13 13.875V15H11V12H12C13.104 12 14 11.103 14 10C14 8.896 13.104 8 12 8C10.896 8 10 8.896 10 10H8C8 7.795 9.795 6 12 6C14.205 6 16 7.795 16 10C16 11.861 14.723 13.429 13 13.875Z" fill={color} />
    </svg>
  )
}

export function Pencil(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Pencil");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24" fillRule="evenodd" clipRule="evenodd">
      <path d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill={color} />
    </svg>
  )
}

export function Plus(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Plus");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 18 18">
      <polygon points="15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8" fill={color} fillRule="nonzero" />
    </svg>
  )
}

export function Refresh(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Refresh");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 18 18">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path d="M9,3 L9,0.75 L6,3.75 L9,6.75 L9,4.5 C11.4825,4.5 13.5,6.5175 13.5,9 C13.5,9.7575 13.3125,10.4775 12.975,11.1 L14.07,12.195 C14.655,11.2725 15,10.1775 15,9 C15,5.685 12.315,3 9,3 Z M9,13.5 C6.5175,13.5 4.5,11.4825 4.5,9 C4.5,8.2425 4.6875,7.5225 5.025,6.9 L3.93,5.805 C3.345,6.7275 3,7.8225 3,9 C3,12.315 5.685,15 9,15 L9,17.25 L12,14.25 L9,11.25 L9,13.5 Z" fill={color} fillRule="nonzero" />
      </g>
    </svg>
  )
}

export function Reload(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Reload");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path d="M12 2C6.485 2 2 6.485 2 12H5.33333C5.33333 8.32333 8.32333 5.33333 12 5.33333C15.6767 5.33333 18.6667 8.32333 18.6667 12C18.6667 15.6767 15.6767 18.6667 12 18.6667C10.2033 18.6667 8.55833 17.9333 7.315 16.6867L10.3333 13.6667H2V22L4.935 19.065C6.79833 20.94 9.30167 22 12 22C17.515 22 22 17.515 22 12C22 6.48667 17.515 2 12 2Z" fill={color} />
    </svg>
  )
}

export function Loop(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Loop");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 16 16">
      <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z" fill={color} />
    </svg>
  )
}

export function Repeat(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Repeat");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 16 16">
      <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z" fill={color} />
    </svg>
  )
}

export function Repeat1(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Repeat1");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 16 16">
      <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h.75v1.5h-.75A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5zM12.25 2.5h-.75V1h.75A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25z" fill={color} />
      <path d="M9.12 8V1H7.787c-.128.72-.76 1.293-1.787 1.313V3.36h1.57V8h1.55z" fill={color} />
    </svg>
  )
}

export function PIP(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "PIP");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 16 16">
      <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" fill={color} />
      <path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-3z" fill={color} />
    </svg>
  )
}

export function Upload(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Upload");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" fill={color} />
    </svg>
  )
}

export function Download(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Download");

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenOdd" d="M16.293 9.293L17.707 10.707L12 16.414L6.29297 10.707L7.70697 9.293L11 12.586V2H13V12.586L16.293 9.293ZM18 20V18H20V20C20 21.102 19.104 22 18 22H6C4.896 22 4 21.102 4 20V18H6V20H18Z" fill={color} />
    </svg>
  )
}

export function Youtube(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Youtube");

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" aria-hidden="true" role="img">
      <path fillRule="evenodd" clipRule="evenodd" d="M21.3766 4.10479C22.4093 4.38257 23.2225 5.20102 23.4985 6.24038C24 8.12411 24 12.0545 24 12.0545C24 12.0545 24 15.9848 23.4985 17.8688C23.2225 18.908 22.4093 19.7265 21.3766 20.0044C19.505 20.5091 12 20.5091 12 20.5091C12 20.5091 4.49496 20.5091 2.62336 20.0044C1.59082 19.7265 0.777545 18.908 0.501545 17.8688C0 15.9848 0 12.0545 0 12.0545C0 12.0545 0 8.12411 0.501545 6.24038C0.777545 5.20102 1.59082 4.38257 2.62336 4.10479C4.49496 3.59998 12 3.59998 12 3.59998C12 3.59998 19.505 3.59998 21.3766 4.10479ZM15.8182 12.0546L9.54551 15.623V8.48596L15.8182 12.0546Z" fill={color} />
    </svg>
  )
}

export function ZIP(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "ZIP");

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 16 16" aria-hidden="true" role="img">
      <path d="M5.5 9.438V8.5h1v.938a1 1 0 0 0 .03.243l.4 1.598-.93.62-.93-.62.4-1.598a1 1 0 0 0 .03-.243z" fill={color} />
      <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m-4-.5V2h-1V1H6v1h1v1H6v1h1v1H6v1h1v1H5.5V6h-1V5h1V4h-1V3zm0 4.5h1a1 1 0 0 1 1 1v.938l.4 1.599a1 1 0 0 1-.416 1.074l-.93.62a1 1 0 0 1-1.109 0l-.93-.62a1 1 0 0 1-.415-1.074l.4-1.599V8.5a1 1 0 0 1 1-1z" fill={color} />
    </svg>
  )
}

export function Image(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Image");

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 20 20" aria-hidden="true" role="img">
      <path fillRule="evenodd" clipRule="evenodd" transform="translate(2, 1.5)" d="M3.2 0C1.43269 0 0 1.43269 0 3.2V12.8C0 14.5673 1.43269 16 3.2 16H12.8C14.5673 16 16 14.5673 16 12.8V3.2C16 1.43269 14.5673 0 12.8 0H3.2ZM6.4 4.8C6.4 3.91616 5.68256 3.2 4.8 3.2C3.91552 3.2 3.2 3.91616 3.2 4.8C3.2 5.68448 3.91552 6.4 4.8 6.4C5.68256 6.4 6.4 5.68448 6.4 4.8ZM5.6 9.6L3.2 12.8H12.8L10.4 7.2L7.2 11.2L5.6 9.6Z" fill={color} />
    </svg>
  )
}

export function Movie(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Movie");

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 26 28" aria-hidden="true" role="img">
      <path fillRule="evenodd" clipRule="evenodd" d="M25.4655 8.13686L24.0851 2.98525C23.5134 0.851387 21.32 -0.414947 19.1862 0.156821L3.73134 4.29792C1.59748 4.86969 0.331147 7.06304 0.902914 9.19691L2.01124 13.3332L1.9999 15.9999L1.9999 23.3332C1.9999 25.5424 3.79077 27.3332 5.99991 27.3332L21.9999 27.3332C24.209 27.3332 25.9999 25.5424 25.9999 23.3332V15.3333H5.99991L6.07237 13.3332L25.4655 8.13686ZM14.609 8.28512L10.8245 9.29916L10.7552 5.17663L14.5396 4.1626L14.609 8.28512ZM17.264 7.5737L22.1995 6.25124L21.5093 3.67543C21.3187 2.96415 20.5876 2.54204 19.8763 2.73263L17.1947 3.45117L17.264 7.5737ZM8.10009 5.88806L8.16944 10.0106L4.1689 11.0825L3.47872 8.50672C3.28813 7.79543 3.71024 7.06432 4.42153 6.87373L8.10009 5.88806Z" fill={color} />
    </svg>
  )
}

export function File(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "File");

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 16 16" aria-hidden="true" role="img">
      <path transform="translate(3, 3)" d="M6.11111111,3.88888889 L6.11111111,0.833333333 L9.16666667,3.88888889 L6.11111111,3.88888889 Z M1.11111111,0 C0.494444444,0 0,0.494444444 0,1.11111111 L0,8.88888889 C0,9.50253861 0.497461389,10 1.11111111,10 L8.88888889,10 C9.50253861,10 10,9.50253861 10,8.88888889 L10,3.33333333 L6.66666667,0 L1.11111111,0 Z" fill={color} />
    </svg>
  )
}

export function Sticker(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Sticker");

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" aria-hidden="true" role="img">
      <path fillRule="evenodd" clipRule="evenodd" d="M6 2h12a4 4 0 0 1 4 4v7.5a.5.5 0 0 1-.5.5H19a5 5 0 0 0-5 5v2.5a.5.5 0 0 1-.5.5H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM19 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-9.91 2.94a1 1 0 0 0-1.66 1.12 5.5 5.5 0 0 0 9.14 0 1 1 0 0 0-1.66-1.12 3.5 3.5 0 0 1-5.82 0Z" fill={color} />
      <path d="M21.66 16c.03 0 .05.03.04.06a3 3 0 0 1-.58.82l-4.24 4.24a3 3 0 0 1-.82.58.04.04 0 0 1-.06-.04V19a3 3 0 0 1 3-3h2.66Z" fill={color} />
    </svg>
  )
}

export function Forward(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Forward");

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" style={{ transform: "scaleX(-1)" }} aria-hidden="true" role="img">
      <path d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" fill={color} />
    </svg>
  )
}

export function React(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "React");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="-10.5 -9.45 21 18.9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="0" cy="0" r="2" fill={color} />
      <g stroke={color} strokeWidth="1" fill="none">
        <ellipse rx="10" ry="4.5"  />
        <ellipse rx="10" ry="4.5" transform="rotate(60)"  />
        <ellipse rx="10" ry="4.5" transform="rotate(120)" />
      </g>
    </svg>
  )
}

export function Discord(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Discord");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a18.43 18.43 0 0 0 5.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.29-.55-1.9-.92.17-.12.32-.24.47-.37 3.58 1.7 7.7 1.7 11.28 0l.46.37c-.6.36-1.25.67-1.9.92.35.7.75 1.35 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.47-4.87-.78-9.09-3.3-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27Z" />
    </svg>
  )
}

export function Globe(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Globe");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0Zm-4.16 5.85A9 9 0 0 0 15 3.52V4a3 3 0 0 1-3 3h-.77c-.13 0-.23.1-.23.23A2.77 2.77 0 0 1 8.23 10c-.13 0-.23.1-.23.23v1.52c0 .14.11.25.25.25H13a3 3 0 0 1 3 3v.77c0 .13.1.23.23.23 1.2 0 2.23.77 2.61 1.85ZM3.18 10.18A9 9 0 0 0 11 20.94v-2.7c0-.14-.1-.24-.23-.24h-.65A2.12 2.12 0 0 1 8 15.88c0-.56-.22-1.1-.62-1.5l-4.2-4.2Z" />
    </svg>
  )
}

export function Puzzle(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Puzzle");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M451,243.9h-36.8v-97.7c0-26.7-21.7-48.4-48.4-48.4h-97.7V61c0-33.4-27.6-61-61-61 s-61,27.6-61,61v36.8H49.3c-26.7,0-48.4,21.7-48.4,48.4v92.7h35.9c35.9,0,66,29.2,66,66s-29.2,66-66,66H0v92.7 C0,490.3,21.7,512,48.4,512h92.7v-36.8c0-35.9,29.2-66,66-66s66,29.2,66,66V512h92.7c26.7,0,48.4-21.7,48.4-48.4v-97.7H451 c33.4,0,61-27.6,61-61S484.4,243.9,451,243.9z" />
    </svg>
  )
}

export function MDN(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "MDN");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M9.53846 1L2.76923 23H0L6.74556 1H9.53846ZM12 1V23H9.53846V1H12ZM21.5385 1L14.7929 23H12.0237L18.7692 1H21.5385ZM24 1V23H21.5385V1H24Z" />
    </svg>
  )
}

export function Balance(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Balance");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.245.245 0 0 0-.124.033l-1.289.737c-.265.15-.564.23-.869.23h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.288-.737c.265-.15.564-.23.869-.23h.984V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z" />
    </svg>
  )
}

export function Desktop(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Desktop");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M5 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5ZM13.5 20a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-.5.5H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-1.5Z" />
    </svg>
  )
}

export function Play(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Play");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M9.25 3.35C7.87 2.45 6 3.38 6 4.96v14.08c0 1.58 1.87 2.5 3.25 1.61l10.85-7.04a1.9 1.9 0 0 0 0-3.22L9.25 3.35Z" />
    </svg>
  )
}

export function Pause(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Pause");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M6 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6ZM15 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3Z" />
    </svg>
  )
}

export function SkipForward(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "SkipForward");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M15.5 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V8.753l-6.267 3.636c-.54.313-1.233-.066-1.233-.697v-2.94l-6.267 3.636C.693 12.703 0 12.324 0 11.693V4.308c0-.63.693-1.01 1.233-.696L7.5 7.248v-2.94c0-.63.693-1.01 1.233-.696L15 7.248V4a.5.5 0 0 1 .5-.5" />
    </svg>
  )
}

export function SkipBackwards(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "SkipBackwards");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M.5 3.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 1 0V8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.5 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1 7.248V4a.5.5 0 0 0-.5-.5" />
    </svg>
  )
}

export function Shuffle(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Shuffle");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z" />
      <path fill={color} d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z" />
    </svg>
  )
}

export function Spotify(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Spotify");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M41.329 23.646C32.952 18.481 19.133 18.006 11.136 20.526C9.852 20.93 8.494 20.178 8.106 18.845C7.716 17.511 8.44 16.102 9.726 15.697C18.906 12.804 34.166 13.362 43.81 19.306C44.965 20.017 45.344 21.566 44.659 22.763C43.974 23.963 42.481 24.358 41.329 23.646ZM41.697 30.109C41.102 30.988 39.839 31.263 38.874 30.724C31.801 26.768 21.016 25.621 12.649 27.933C11.564 28.231 10.417 27.674 10.088 26.689C9.761 25.701 10.373 24.66 11.456 24.36C21.016 21.72 32.898 22.999 41.022 27.542C41.986 28.082 42.29 29.232 41.697 30.109ZM37.764 38.233C37.5421 38.5957 37.1854 38.8554 36.7721 38.9552C36.3588 39.0549 35.9229 38.9865 35.56 38.765C29.519 35.082 21.915 34.25 12.96 36.29C12.546 36.3851 12.1112 36.312 11.7511 36.0866C11.3911 35.8611 11.1353 35.502 11.04 35.088C10.993 34.883 10.987 34.6707 11.0223 34.4633C11.0576 34.256 11.1335 34.0577 11.2456 33.8797C11.3578 33.7018 11.504 33.5477 11.6758 33.4265C11.8477 33.3052 12.0418 33.2191 12.247 33.173C22.047 30.938 30.452 31.9 37.232 36.033C37.988 36.493 38.226 37.479 37.764 38.233ZM26 0C11.64 0 0 11.64 0 26C0 40.36 11.64 52 26 52C40.36 52 52 40.36 52 26C52 11.64 40.36 0 26 0Z" />
    </svg>
  )
}

export function Send(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Send");

  return (
    <svg className={className} width={width} height={height} aria-hidden="true" role="img" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M6.6 10.02 14 11.4a.6.6 0 0 1 0 1.18L6.6 14l-2.94 5.87a1.48 1.48 0 0 0 1.99 1.98l17.03-8.52a1.48 1.48 0 0 0 0-2.64L5.65 2.16a1.48 1.48 0 0 0-1.99 1.98l2.94 5.88Z" />
    </svg>
  )
}
export function Reddit(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Reddit");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className={className} width={width} height={height} viewBox="0 0 50 50">
      <path fill={color} d="M 29 3 C 26.894531 3 24.433594 4.652344 24.0625 12.03125 C 24.375 12.023438 24.683594 12 25 12 C 25.351563 12 25.714844 12.019531 26.0625 12.03125 C 26.300781 7.597656 27.355469 5 29 5 C 29.703125 5 30.101563 5.382813 30.84375 6.1875 C 31.710938 7.128906 32.84375 8.351563 35.0625 8.8125 C 35.027344 8.550781 35 8.269531 35 8 C 35 7.578125 35.042969 7.179688 35.125 6.78125 C 33.75 6.40625 33.023438 5.613281 32.3125 4.84375 C 31.519531 3.984375 30.609375 3 29 3 Z M 41 4 C 38.792969 4 37 5.796875 37 8 C 37 10.203125 38.792969 12 41 12 C 43.207031 12 45 10.203125 45 8 C 45 5.796875 43.207031 4 41 4 Z M 25 14 C 12.867188 14 3 20.179688 3 29 C 3 37.820313 12.867188 45 25 45 C 37.132813 45 47 37.820313 47 29 C 47 20.179688 37.132813 14 25 14 Z M 7.5 14.9375 C 6.039063 14.9375 4.652344 15.535156 3.59375 16.59375 C 1.871094 18.316406 1.515625 20.792969 2.5 22.84375 C 4.011719 19.917969 6.613281 17.421875 9.96875 15.5625 C 9.207031 15.175781 8.363281 14.9375 7.5 14.9375 Z M 42.5 14.9375 C 41.636719 14.9375 40.792969 15.175781 40.03125 15.5625 C 43.386719 17.421875 45.988281 19.917969 47.5 22.84375 C 48.484375 20.792969 48.128906 18.316406 46.40625 16.59375 C 45.347656 15.535156 43.960938 14.9375 42.5 14.9375 Z M 17 23 C 18.65625 23 20 24.34375 20 26 C 20 27.65625 18.65625 29 17 29 C 15.34375 29 14 27.65625 14 26 C 14 24.34375 15.34375 23 17 23 Z M 33 23 C 34.65625 23 36 24.34375 36 26 C 36 27.65625 34.65625 29 33 29 C 31.34375 29 30 27.65625 30 26 C 30 24.34375 31.34375 23 33 23 Z M 16.0625 34 C 16.3125 34.042969 16.558594 34.183594 16.71875 34.40625 C 16.824219 34.554688 19.167969 37.6875 25 37.6875 C 30.910156 37.6875 33.257813 34.46875 33.28125 34.4375 C 33.597656 33.988281 34.234375 33.867188 34.6875 34.1875 C 35.136719 34.503906 35.222656 35.109375 34.90625 35.5625 C 34.789063 35.730469 31.9375 39.6875 25 39.6875 C 18.058594 39.6875 15.210938 35.730469 15.09375 35.5625 C 14.777344 35.109375 14.859375 34.503906 15.3125 34.1875 C 15.539063 34.027344 15.8125 33.957031 16.0625 34 Z" />
    </svg>
  )
}
export function Notice(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Notice");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className={className} width={width} height={height} viewBox="0 0 12 12">
      <path fill={color} d="M7.25 1H4.75V7.25H7.25V1Z" />
      <path fill={color} d="M4.75 9.75C4.75 10.4167 5.33333 11 6 11C6.66667 11 7.25 10.4167 7.25 9.75C7.25 9.08333 6.66667 8.5 6 8.5C5.33333 8.5 4.75 9.08333 4.75 9.75Z" />
    </svg>
  )
}
export function Pin(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Pin");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path fill={color} d="M19.38 11.38a3 3 0 0 0 4.24 0l.03-.03a.5.5 0 0 0 0-.7L13.35.35a.5.5 0 0 0-.7 0l-.03.03a3 3 0 0 0 0 4.24L13 5l-2.92 2.92-3.65-.34a2 2 0 0 0-1.6.58l-.62.63a1 1 0 0 0 0 1.42l9.58 9.58a1 1 0 0 0 1.42 0l.63-.63a2 2 0 0 0 .58-1.6l-.34-3.64L19 11l.38.38ZM9.07 17.07a.5.5 0 0 1-.08.77l-5.15 3.43a.5.5 0 0 1-.63-.06l-.42-.42a.5.5 0 0 1-.06-.63L6.16 15a.5.5 0 0 1 .77-.08l2.14 2.14Z" />
    </svg>
  )
}
export function SmallX(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "SmallX");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path fill={color} d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z" />
    </svg>
  )
}
export function WindowLaunchIcon(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "WindowLaunchIcon");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path fill={color} d="M15 2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V4.41l-4.3 4.3a1 1 0 1 1-1.4-1.42L19.58 3H16a1 1 0 0 1-1-1Z" />
      <path fill={color} d="M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 1 0-2 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 1 0 0-2H5Z" />
    </svg>
  )
}
export function DeepL(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "DeepL");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width={width} height={height} viewBox="0 0 68 68" fill="none">
      <path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M7.1875 17.2741V44.0848C7.1875 45.4775 7.91781 46.7542 9.10938 47.4506L32.1719 60.8366C32.227 60.8688 32.2827 60.8996 32.339 60.9288L43.7031 67.5303L43.6647 61.7271L43.688 58.4908L43.7029 58.5546V57.4713C43.7029 56.8265 44.0324 56.2481 44.5389 55.8895L45.2151 55.497L45.6248 55.2661L45.6033 55.2717L59.0781 47.4506C60.2697 46.7542 61 45.4775 61 44.0848V17.2741C61 15.8813 60.2697 14.6046 59.0781 13.9083L36.0156 0.522285C34.8241 -0.174095 33.3634 -0.174095 32.1719 0.522285L9.10938 13.947C7.91781 14.6433 7.1875 15.92 7.1875 17.2741ZM24.7904 18.4744C26.3279 16.9656 28.7879 16.9656 30.3254 18.4744C31.4305 19.535 31.7967 21.0625 31.424 22.4326L42.0323 28.6254C42.0407 28.617 42.0493 28.6085 42.0578 28.6002C42.0625 28.5956 42.0672 28.5911 42.0718 28.5865L42.0873 28.5716C43.6248 27.0627 46.0848 27.0627 47.6223 28.5716C49.2751 30.1578 49.2751 32.7885 47.6223 34.3747C46.0848 35.8836 43.6248 35.8836 42.0873 34.3747C40.9272 33.2614 40.5814 31.6336 41.0498 30.2135L41.0117 30.2349L30.4794 24.1217C30.4298 24.1747 30.3784 24.2267 30.3254 24.2776C28.7879 25.7864 26.3279 25.7864 24.7904 24.2776C23.1376 22.6914 23.1376 20.0606 24.7904 18.4744ZM30.3254 39.2498C28.7879 37.741 26.3279 37.741 24.7904 39.2498C23.1376 40.836 23.1376 43.4668 24.7904 45.053C26.3279 46.5618 28.7879 46.5618 30.3254 45.053C31.4128 44.0094 31.7848 42.5137 31.4414 41.1608L41.7805 35.1482L39.8586 34.0649L30.5267 39.4571C30.4626 39.3862 30.3955 39.3171 30.3254 39.2498Z" fill={color} />
    </svg>
  )
}
export function Replay(props: IconProps) {
  const { color, height, width, className } = ensureProps(props, "Replay");

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path d="M12,5 L12,1 L7,6 L12,11 L12,7 C15.31,7 18,9.69 18,13 C18,16.31 15.31,19 12,19 C8.69,19 6,16.31 6,13 L4,13 C4,17.42 7.58,21 12,21 C16.42,21 20,17.42 20,13 C20,8.58 16.42,5 12,5 L12,5 Z" fill={color} />
    </svg>
  )
}
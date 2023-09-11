import webpack from "renderer/webpack";

export interface IconProps {
  width?: React.CSSProperties["width"],
  height?: React.CSSProperties["height"],
  color?: React.CSSProperties["color"],
  className?: string
};

export function Trash(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg width={width} height={height} className={props.className} viewBox="0 0 24 24">
      <path fill={color} d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z" />
      <path fill={color} d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z" />
    </svg>
  );
};

export function Gear(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg width={width} height={height} className={props.className} viewBox="0 0 24 24">
      <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" />
    </svg>
  );
};

export function Folder(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg width={width} height={height} className={props.className} viewBox="0 0 24 24">
      <path fill={color} d="M20 7H12L10.553 5.106C10.214 4.428 9.521 4 8.764 4H3C2.447 4 2 4.447 2 5V19C2 20.104 2.895 21 4 21H20C21.104 21 22 20.104 22 19V9C22 7.896 21.104 7 20 7Z" />
    </svg>
  );
};

export function Github(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg width={width} height={height} className={props.className} viewBox="0 0 16 16">
      <path fill={color} d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
};

export function Brush(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg width={width} height={height} className={props.className} viewBox="0 0 16 16">
      <path fill={color} d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04z" />
    </svg>
  );
};

export function Code(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg width={width} height={height} className={props.className} viewBox="0 0 32 20">
      <path fill={color} d="M10.7183 2.13624C10.8327 2.02004 10.9234 1.88209 10.9854 1.73026C11.0473 1.57844 11.0792 1.41572 11.0792 1.25138C11.0792 1.08705 11.0473 0.924322 10.9854 0.772498C10.9234 0.620673 10.8327 0.482722 10.7183 0.366521C10.6038 0.250319 10.468 0.158143 10.3185 0.0952552C10.169 0.0323674 10.0088 -1.22438e-09 9.847 0C9.68519 1.22438e-09 9.52497 0.0323674 9.37547 0.0952552C9.22598 0.158143 9.09015 0.250319 8.97573 0.366521L0.361535 9.11514C0.246934 9.23124 0.15601 9.36915 0.0939718 9.52099C0.0319337 9.67283 0 9.83561 0 10C0 10.1644 0.0319337 10.3272 0.0939718 10.479C0.15601 10.6308 0.246934 10.7688 0.361535 10.8849L8.97573 19.6335C9.20681 19.8682 9.52021 20 9.847 20C10.1738 20 10.4872 19.8682 10.7183 19.6335C10.9493 19.3988 11.0792 19.0805 11.0792 18.7486C11.0792 18.4167 10.9493 18.0984 10.7183 17.8638L2.97287 10L10.7183 2.13624ZM21.2817 2.13624C21.0507 1.90156 20.9208 1.58327 20.9208 1.25138C20.9208 0.919494 21.0507 0.6012 21.2817 0.366521C21.5128 0.131841 21.8262 8.56586e-09 22.153 0C22.4798 -8.56586e-09 22.7932 0.131841 23.0243 0.366521L31.6385 9.11514C31.7531 9.23124 31.844 9.36915 31.906 9.52099C31.9681 9.67283 32 9.83561 32 10C32 10.1644 31.9681 10.3272 31.906 10.479C31.844 10.6308 31.7531 10.7688 31.6385 10.8849L23.0243 19.6335C22.7932 19.8682 22.4798 20 22.153 20C21.8262 20 21.5128 19.8682 21.2817 19.6335C21.0507 19.3988 20.9208 19.0805 20.9208 18.7486C20.9208 18.4167 21.0507 18.0984 21.2817 17.8638L29.0271 10L21.2817 2.13624Z" />
    </svg>
  );
};

export function Palette(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg width={width} height={height} className={props.className} viewBox="0 0 16 16">
      <path fill={color} d="M12.433 10.07C14.133 10.585 16 11.15 16 8a8 8 0 1 0-8 8c1.996 0 1.826-1.504 1.649-3.08-.124-1.101-.252-2.237.351-2.92.465-.527 1.42-.237 2.433.07zM8 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
};

export function Logo(props: IconProps) {
  const React = webpack.common.React!;

  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg className={props.className} width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M51.4697 27.0801L38.96 74.6582L22.0068 75.6152L6.62598 27.5586L22.8271 26.0547L29.3896 54.082L35.7471 26.0547L51.4697 27.0801ZM93.75 27.0801L80.4199 50.2539L91.7676 70.4199L77.4805 74.8633L71.3281 60.918L64.082 74.9316L49.3164 69.5996L61.8945 49.7754L50.4102 28.9258L66.0645 25.166L71.6699 38.9062L77.6172 25.166L93.75 27.0801Z" />
    </svg>
  )
};

export function Sort(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg width={width} height={height} className={props.className} viewBox="0 0 16 16">
      <path fill={color} d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
      <path fill={color} d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
    </svg>
  );
};

export function SortReverse(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg width={width} height={height} className={props.className} viewBox="0 0 16 16">
      <path fill={color} d="M12.96 7H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V7z" />
      <path fill={color} d="M10.082 12.629 9.664 14H8.598l1.789-5.332h1.234L13.402 14h-1.12l-.419-1.371h-1.781zm1.57-.785L11 9.688h-.047l-.652 2.156h1.351z" />
      <path fill={color} d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
    </svg>
  );
};

export function Store(props: IconProps) {
  const React = webpack.common.React!;
  
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  return (
    <svg className={props.className} width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 11.5C13.2974 11.4997 14.4665 10.9504 15.2875 10.0718C15.396 9.95576 15.5838 9.95611 15.6919 10.0725C16.5074 10.9506 17.672 11.5 18.9649 11.5C19.5579 11.5 20.1175 11.3868 20.6269 11.183C20.8005 11.1135 20.999 11.2357 20.999 11.4226V19.0001C20.999 20.6569 19.6559 22.0001 17.999 22.0001H15.249C15.111 22.0001 14.999 21.8881 14.999 21.75V16.0001C14.999 14.8955 14.1036 14 12.999 14L11.001 14.0004C9.89639 14.0004 9.00096 14.8958 9.00096 16.0004V21.7504C9.00096 21.8885 8.88903 22.0004 8.75096 22.0004H6.00096C4.34411 22.0004 3.00096 20.6573 3.00096 19.0004V11.423C3.00096 11.2361 3.19953 11.1139 3.37309 11.1834C3.8825 11.3872 4.44206 11.5004 5.03511 11.5004C6.32803 11.5004 7.49262 10.951 8.30814 10.0729C8.4162 9.95649 8.60405 9.95614 8.71247 10.0722C9.53354 10.9508 10.7026 11.4997 12 11.5Z" fill={color}/>
      <path d="M13.999 2C14.5513 2 14.999 2.44772 14.999 3.00001V7C14.999 7.05178 14.9977 7.10325 14.9951 7.15438C14.9738 7.5744 14.8662 7.97161 14.6895 8.32863C14.6726 8.36278 14.6551 8.39658 14.6369 8.42999C14.1291 9.36489 13.1387 9.99965 12 10C10.8613 9.99965 9.87094 9.36528 9.36306 8.43037C9.34491 8.39696 9.32738 8.36317 9.31047 8.32901C9.13383 7.97199 9.02617 7.57478 9.00488 7.15477C9.00229 7.10363 9.00098 7.05217 9.00098 7.00039V3.00039C9.00098 2.4481 9.44869 2.00038 10.001 2.00038L13.999 2Z" fill={color}/>
      <path d="M18.2934 2C19.6056 2 20.7655 2.85276 21.1569 4.10517L21.7957 6.1495C22.1655 7.33272 21.7585 8.52777 20.9195 9.26586C20.4043 9.7191 19.7261 10 18.9649 10C17.8388 10 16.8592 9.37238 16.357 8.44784C16.3366 8.41027 16.3169 8.37218 16.2981 8.33364C16.1065 7.94121 15.999 7.50024 15.999 7.03414V3.00001C15.999 2.44772 16.4467 2 16.999 2H18.2934Z" fill={color}/>
      <path d="M5.70655 2.00038C4.3944 2.00038 3.23449 2.85314 2.84311 4.10555L2.20425 6.14989C1.83451 7.3331 2.24148 8.52815 3.08049 9.26624C3.59571 9.71948 4.27387 10.0004 5.03511 10.0004C6.16124 10.0004 7.14078 9.37276 7.643 8.44822C7.66343 8.41065 7.68306 8.37256 7.70187 8.33402C7.89345 7.94159 8.00097 7.50062 8.00097 7.03453V3.00039C8.00097 2.4481 7.55325 2.00038 7.00098 2.00038H5.70655Z" fill={color}/>
    </svg>    
  )
}
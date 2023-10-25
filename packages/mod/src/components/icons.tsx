import { className } from "../util";

export interface IconProps {
  width?: React.CSSProperties["width"],
  height?: React.CSSProperties["height"],
  color?: React.CSSProperties["color"],
  className?: string
};

function ensureProps(props: IconProps): Required<IconProps> {
  const color: React.CSSProperties["color"] = props.color ?? "currentcolor";
  const height: React.CSSProperties["height"] = props.height ?? 24;
  const width: React.CSSProperties["width"] = props.width ?? 24;

  const classNameProp = className([ "vx-icon", props.className ]);

  return { color, height, width, className: classNameProp };
};

export function At(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 24 24">
      <path fill={color} d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z" />
    </svg>
  );
};

export function Trash(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 24 24">
      <path fill={color} d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z" />
      <path fill={color} d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z" />
    </svg>
  );
};

export function Gear(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 24 24">
      <path fill={color} fillRule="evenodd" clipRule="evenodd" d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" />
    </svg>
  );
};

export function Folder(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 24 24">
      <path fill={color} d="M20 7H12L10.553 5.106C10.214 4.428 9.521 4 8.764 4H3C2.447 4 2 4.447 2 5V19C2 20.104 2.895 21 4 21H20C21.104 21 22 20.104 22 19V9C22 7.896 21.104 7 20 7Z" />
    </svg>
  );
};

export function Github(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
};

export function Brush(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04z" />
    </svg>
  );
};

export function Code(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 32 20">
      <path fill={color} d="M10.7183 2.13624C10.8327 2.02004 10.9234 1.88209 10.9854 1.73026C11.0473 1.57844 11.0792 1.41572 11.0792 1.25138C11.0792 1.08705 11.0473 0.924322 10.9854 0.772498C10.9234 0.620673 10.8327 0.482722 10.7183 0.366521C10.6038 0.250319 10.468 0.158143 10.3185 0.0952552C10.169 0.0323674 10.0088 -1.22438e-09 9.847 0C9.68519 1.22438e-09 9.52497 0.0323674 9.37547 0.0952552C9.22598 0.158143 9.09015 0.250319 8.97573 0.366521L0.361535 9.11514C0.246934 9.23124 0.15601 9.36915 0.0939718 9.52099C0.0319337 9.67283 0 9.83561 0 10C0 10.1644 0.0319337 10.3272 0.0939718 10.479C0.15601 10.6308 0.246934 10.7688 0.361535 10.8849L8.97573 19.6335C9.20681 19.8682 9.52021 20 9.847 20C10.1738 20 10.4872 19.8682 10.7183 19.6335C10.9493 19.3988 11.0792 19.0805 11.0792 18.7486C11.0792 18.4167 10.9493 18.0984 10.7183 17.8638L2.97287 10L10.7183 2.13624ZM21.2817 2.13624C21.0507 1.90156 20.9208 1.58327 20.9208 1.25138C20.9208 0.919494 21.0507 0.6012 21.2817 0.366521C21.5128 0.131841 21.8262 8.56586e-09 22.153 0C22.4798 -8.56586e-09 22.7932 0.131841 23.0243 0.366521L31.6385 9.11514C31.7531 9.23124 31.844 9.36915 31.906 9.52099C31.9681 9.67283 32 9.83561 32 10C32 10.1644 31.9681 10.3272 31.906 10.479C31.844 10.6308 31.7531 10.7688 31.6385 10.8849L23.0243 19.6335C22.7932 19.8682 22.4798 20 22.153 20C21.8262 20 21.5128 19.8682 21.2817 19.6335C21.0507 19.3988 20.9208 19.0805 20.9208 18.7486C20.9208 18.4167 21.0507 18.0984 21.2817 17.8638L29.0271 10L21.2817 2.13624Z" />
    </svg>
  );
};

export function Palette(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M12.433 10.07C14.133 10.585 16 11.15 16 8a8 8 0 1 0-8 8c1.996 0 1.826-1.504 1.649-3.08-.124-1.101-.252-2.237.351-2.92.465-.527 1.42-.237 2.433.07zM8 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
};

export function Logo(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M51.4697 27.0801L38.96 74.6582L22.0068 75.6152L6.62598 27.5586L22.8271 26.0547L29.3896 54.082L35.7471 26.0547L51.4697 27.0801ZM93.75 27.0801L80.4199 50.2539L91.7676 70.4199L77.4805 74.8633L71.3281 60.918L64.082 74.9316L49.3164 69.5996L61.8945 49.7754L50.4102 28.9258L66.0645 25.166L71.6699 38.9062L77.6172 25.166L93.75 27.0801Z" />
    </svg>
  )
};

export function Sort(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
      <path fill={color} d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
    </svg>
  );
};

export function SortReverse(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg width={width} height={height} className={className} viewBox="0 0 16 16">
      <path fill={color} d="M12.96 7H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V7z" />
      <path fill={color} d="M10.082 12.629 9.664 14H8.598l1.789-5.332h1.234L13.402 14h-1.12l-.419-1.371h-1.781zm1.57-.785L11 9.688h-.047l-.652 2.156h1.351z" />
      <path fill={color} d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
    </svg>
  );
};

export function Store(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg className={className} width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 11.5C13.2974 11.4997 14.4665 10.9504 15.2875 10.0718C15.396 9.95576 15.5838 9.95611 15.6919 10.0725C16.5074 10.9506 17.672 11.5 18.9649 11.5C19.5579 11.5 20.1175 11.3868 20.6269 11.183C20.8005 11.1135 20.999 11.2357 20.999 11.4226V19.0001C20.999 20.6569 19.6559 22.0001 17.999 22.0001H15.249C15.111 22.0001 14.999 21.8881 14.999 21.75V16.0001C14.999 14.8955 14.1036 14 12.999 14L11.001 14.0004C9.89639 14.0004 9.00096 14.8958 9.00096 16.0004V21.7504C9.00096 21.8885 8.88903 22.0004 8.75096 22.0004H6.00096C4.34411 22.0004 3.00096 20.6573 3.00096 19.0004V11.423C3.00096 11.2361 3.19953 11.1139 3.37309 11.1834C3.8825 11.3872 4.44206 11.5004 5.03511 11.5004C6.32803 11.5004 7.49262 10.951 8.30814 10.0729C8.4162 9.95649 8.60405 9.95614 8.71247 10.0722C9.53354 10.9508 10.7026 11.4997 12 11.5Z" fill={color}/>
      <path d="M13.999 2C14.5513 2 14.999 2.44772 14.999 3.00001V7C14.999 7.05178 14.9977 7.10325 14.9951 7.15438C14.9738 7.5744 14.8662 7.97161 14.6895 8.32863C14.6726 8.36278 14.6551 8.39658 14.6369 8.42999C14.1291 9.36489 13.1387 9.99965 12 10C10.8613 9.99965 9.87094 9.36528 9.36306 8.43037C9.34491 8.39696 9.32738 8.36317 9.31047 8.32901C9.13383 7.97199 9.02617 7.57478 9.00488 7.15477C9.00229 7.10363 9.00098 7.05217 9.00098 7.00039V3.00039C9.00098 2.4481 9.44869 2.00038 10.001 2.00038L13.999 2Z" fill={color}/>
      <path d="M18.2934 2C19.6056 2 20.7655 2.85276 21.1569 4.10517L21.7957 6.1495C22.1655 7.33272 21.7585 8.52777 20.9195 9.26586C20.4043 9.7191 19.7261 10 18.9649 10C17.8388 10 16.8592 9.37238 16.357 8.44784C16.3366 8.41027 16.3169 8.37218 16.2981 8.33364C16.1065 7.94121 15.999 7.50024 15.999 7.03414V3.00001C15.999 2.44772 16.4467 2 16.999 2H18.2934Z" fill={color}/>
      <path d="M5.70655 2.00038C4.3944 2.00038 3.23449 2.85314 2.84311 4.10555L2.20425 6.14989C1.83451 7.3331 2.24148 8.52815 3.08049 9.26624C3.59571 9.71948 4.27387 10.0004 5.03511 10.0004C6.16124 10.0004 7.14078 9.37276 7.643 8.44822C7.66343 8.41065 7.68306 8.37256 7.70187 8.33402C7.89345 7.94159 8.00097 7.50062 8.00097 7.03453V3.00039C8.00097 2.4481 7.55325 2.00038 7.00098 2.00038H5.70655Z" fill={color}/>
    </svg>    
  );
};

export function Copy(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path fill={color} d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z" />
      <path fill={color} d="M15 5H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM8 21V7h6v5h5v9H8z" />
    </svg>
  );
};

export function Save(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 16 16">
      <path fill={color} d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5v-13Z" />
      <path fill={color} d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5V16Zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V0ZM9 1h2v4H9V1Z" />
    </svg>
  );
};

export function Warn(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 20 20">
      <path d="M10 0C4.486 0 0 4.486 0 10C0 15.515 4.486 20 10 20C15.514 20 20 15.515 20 10C20 4.486 15.514 0 10 0ZM9 4H11V11H9V4ZM10 15.25C9.31 15.25 8.75 14.691 8.75 14C8.75 13.31 9.31 12.75 10 12.75C10.69 12.75 11.25 13.31 11.25 14C11.25 14.691 10.69 15.25 10 15.25Z" fillRule="evenodd" clipRule="evenodd" fill={color} />
    </svg>
  );
};

export function Help(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path d="M12 2C6.486 2 2 6.487 2 12C2 17.515 6.486 22 12 22C17.514 22 22 17.515 22 12C22 6.487 17.514 2 12 2ZM12 18.25C11.31 18.25 10.75 17.691 10.75 17C10.75 16.31 11.31 15.75 12 15.75C12.69 15.75 13.25 16.31 13.25 17C13.25 17.691 12.69 18.25 12 18.25ZM13 13.875V15H11V12H12C13.104 12 14 11.103 14 10C14 8.896 13.104 8 12 8C10.896 8 10 8.896 10 10H8C8 7.795 9.795 6 12 6C14.205 6 16 7.795 16 10C16 11.861 14.723 13.429 13 13.875Z" fill={color} />
    </svg>
  );
};

export function Pencil(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24" fillRule="evenodd" clipRule="evenodd">
      <path d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill={color} />
    </svg>
  );
};

export function Plus(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 18 18">
      <polygon points="15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8" fill={color} fillRule="nonzero" />
    </svg>
  );
};

export function Refresh(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 18 18">
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <path d="M9,3 L9,0.75 L6,3.75 L9,6.75 L9,4.5 C11.4825,4.5 13.5,6.5175 13.5,9 C13.5,9.7575 13.3125,10.4775 12.975,11.1 L14.07,12.195 C14.655,11.2725 15,10.1775 15,9 C15,5.685 12.315,3 9,3 Z M9,13.5 C6.5175,13.5 4.5,11.4825 4.5,9 C4.5,8.2425 4.6875,7.5225 5.025,6.9 L3.93,5.805 C3.345,6.7275 3,7.8225 3,9 C3,12.315 5.685,15 9,15 L9,17.25 L12,14.25 L9,11.25 L9,13.5 Z" fill={color} fillRule="nonzero" />
      </g>
    </svg>
  );
};

export function Reload(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 24 24">
      <path d="M12 2C6.485 2 2 6.485 2 12H5.33333C5.33333 8.32333 8.32333 5.33333 12 5.33333C15.6767 5.33333 18.6667 8.32333 18.6667 12C18.6667 15.6767 15.6767 18.6667 12 18.6667C10.2033 18.6667 8.55833 17.9333 7.315 16.6867L10.3333 13.6667H2V22L4.935 19.065C6.79833 20.94 9.30167 22 12 22C17.515 22 22 17.515 22 12C22 6.48667 17.515 2 12 2Z" fill={color} />
    </svg>
  );
};

export function Loop(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="-5 0 459 459.648">
      <path fillRule="evenodd" clipRule="evenOdd" d="m416.324219 293.824219c0 26.507812-21.492188 48-48 48h-313.375l63.199219-63.199219-22.625-22.625-90.511719 90.511719c-6.246094 6.25-6.246094 16.375 0 22.625l90.511719 90.511719 22.625-22.625-63.199219-63.199219h313.375c44.160156-.054688 79.945312-35.839844 80-80v-64h-32zm0 0" fill={color} />
      <path fillRule="evenodd" clipRule="evenOdd" d="m32.324219 165.824219c0-26.511719 21.488281-48 48-48h313.375l-63.199219 63.199219 22.625 22.625 90.511719-90.511719c6.246093-6.25 6.246093-16.375 0-22.625l-90.511719-90.511719-22.625 22.625 63.199219 63.199219h-313.375c-44.160157.050781-79.949219 35.839843-80 80v64h32zm0 0" fill={color} />
    </svg>
  );
};

export function PIP(props: IconProps) {
  const { color, height, width, className } = ensureProps(props);

  return (
    <svg aria-hidden="true" role="img" className={className} width={width} height={height} viewBox="0 0 16 16">
      <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" fill={color} />
      <path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-3z" fill={color} />
    </svg>
  );
};
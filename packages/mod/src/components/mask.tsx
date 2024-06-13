import { Component } from "react";

type Masks = "none" | "avatar-overlay";

function createMaskURL<T extends Masks>(mask: T): T extends "none" ? "" : `url(#vx-${T}-mask)` {
  if (mask === "none") return "" as any;
  return `url(#vx-${mask}-mask)` as any;
}

interface MaskProps {
  mask: Masks, 
  width: number, 
  height: number, 
  children: React.ReactElement, 
  className?: string
}

let id = 0;
export class Mask extends Component<MaskProps> {
  unique = `vx-mask-${id++}`;
  getDefinition() {
    switch (this.props.mask) {
      case "avatar-overlay":
        return (
          <path id={`${this.unique}-def`} d="M0.781274 0.0865586C0.701137 0.0319343 0.604298 0 0.5 0C0.223858 0 0 0.223858 0 0.5C0 0.776142 0.223858 1 0.5 1C0.604298 1 0.701137 0.968066 0.781274 0.913441C0.684013 0.80326 0.624996 0.658522 0.624996 0.5C0.624996 0.341478 0.684013 0.19674 0.781274 0.0865586Z" fill="white" />
        )
    }
    
    return (
      <rect id={`${this.unique}-def`} width={this.props.width} height={this.props.height} fill="white" />
    );
  }
  render() {
    return (
      <svg
        height={this.props.height}
        width={this.props.width}
        viewBox={`0 0 ${this.props.width} ${this.props.height}`}
        className={this.props.className}
      >
        <mask id={this.unique} maskContentUnits="objectBoundingBox">
          <g clip-path={`url(#${this.unique}-def)`}>
            {this.getDefinition()}
          </g>
          <defs>
            <clipPath id={`url(#${this.unique}-def)`}>
              <rect width="1" height="1" fill="white"/>
            </clipPath>
          </defs>
        </mask>
        <foreignObject
          mask={`url(#${this.unique})`}
          height={this.props.height}
          width={this.props.width}
          x={0}
          y={0}
        >
          {this.props.children}
        </foreignObject>
      </svg>
    )
  }
}

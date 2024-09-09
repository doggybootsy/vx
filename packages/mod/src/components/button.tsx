import { useMemo } from "react";
import { className } from "../util"
import ErrorBoundary from "./boundary"
import { SystemDesign } from "./util"

interface ButtonSizes {
  NONE: string,
  TINY: string,
  SMALL: string,
  MEDIUM: string,
  LARGE: string,
  MIN: string,
  MAX: string,
  ICON: string,
};
interface ButtonLooks {
  FILLED: string,
  OUTLINED: string,
  LINK: string,
  BLANK: string,
};
interface ButtonColors {
  BRAND: string,
  BRAND_INVERTED: string,
  RED: string,
  GREEN: string,
  PRIMARY: string,
  LINK: string,
  WHITE: string,
  TRANSPARENT: string,
  CUSTOM: string,
}

type HTMLButtonProps = GetComponentProps<"button">;
interface ButtonProps extends HTMLButtonProps {
  size?: Lowercase<keyof ButtonSizes> | Uppercase<keyof ButtonSizes> | (string & { _size_?: any }),
  color?: Lowercase<keyof ButtonColors> | Uppercase<keyof ButtonColors> | (string & { _color_?: any }),
  look?: Lowercase<keyof ButtonLooks> | Uppercase<keyof ButtonLooks> | (string & { _look_?: any }),
  submitting?: boolean,
  grow?: boolean,
  wrapperClassName?: string,
  innerClassName?: string
};

interface Button extends React.FunctionComponent<ButtonProps> {
  Colors: ButtonColors,
  Looks: ButtonLooks,
  Sizes: ButtonSizes
};

function WrappedButton(props: ButtonProps) {
  const innerClassName = useMemo(() => (
    className([
      props.innerClassName,
      "vx-button-inner"
    ])
  ), [ props.innerClassName ])

  const color = useMemo(() => {
    if (typeof props.color !== "string") return;
    
    const color = props.color.toUpperCase();
    if (color in Button.Colors) {
      return Button.Colors[color as keyof ButtonColors];
    }

    return props.color;
  }, [ props.color ]);

  const look = useMemo(() => {
    if (typeof props.look !== "string") return;
    
    const look = props.look.toUpperCase();
    if (look in Button.Looks) {
      return Button.Looks[look as keyof ButtonLooks];
    }

    return props.look;
  }, [ props.look ]);

  const size = useMemo(() => {
    if (typeof props.size !== "string") return;
    
    const color = props.size.toUpperCase();
    if (color in Button.Sizes) {
      return Button.Sizes[color as keyof ButtonSizes];
    }

    return props.size;
  }, [ props.size ]);

  return (
    <ErrorBoundary>
      <SystemDesign.Button {...props} innerClassName={innerClassName} color={color} size={size} look={look} />
    </ErrorBoundary>
  )
}
Object.defineProperties(WrappedButton, {
  Colors: {
    get: () => SystemDesign.Button.Colors
  },
  Looks: {
    get: () => SystemDesign.Button.Looks
  },
  Sizes: {
    get: () => SystemDesign.Button.Sizes
  }
});

export const Button = WrappedButton as Button;
import { className } from "../util"
import ErrorBoundary from "./boundary"
import { SystemDesign } from "./util"

interface ButtonSizes {
  ICON: string,
  LARGE: string,
  MAX: string,
  MEDIUM: string,
  MIN: string,
  NONE: string,
  SMALL: string,
  TINY: string,
  XLARGE: string
};
interface ButtonLooks {
  FILLED: string,
  INVERTED: string,
  OUTLINED: string,
  LINK: string,
  BLANK: string
};
interface ButtonHovers {
  DEFAULT: string,
  BRAND: string,
  RED: string,
  GREEN: string,
  YELLOW: string,
  PRIMARY: string,
  LINK: string,
  WHITE: string,
  BLACK: string,
  TRANSPARENT: string
};
interface ButtonHovers {
  BRAND: string,
  RED: string,
  GREEN: string,
  YELLOW: string,
  PRIMARY: string,
  LINK: string,
  WHITE: string,
  BLACK: string,
  TRANSPARENT: string,
  BRAND_NEW: string,
  CUSTOM: string
};
interface ButtonBorderColors {
  BRAND: string,
  RED: string,
  GREEN: string,
  YELLOW: string,
  PRIMARY: string,
  LINK: string,
  WHITE: string,
  BLACK: string,
  TRANSPARENT: string,
  BRAND_NEW: string
};
interface ButtonColors {
  BRAND: string,
  RED: string,
  GREEN: string,
  YELLOW: string,
  PRIMARY: string,
  LINK: string,
  WHITE: string,
  BLACK: string,
  TRANSPARENT: string,
  BRAND_NEW: string,
  CUSTOM: string
}

type HTMLButtonProps = GetComponentProps<"button">;
type ButtonProps = HTMLButtonProps & {
  size?: string,
  color?: string,
  hover?: string,
  look?: string,
  borderColor?: string,
  submitting?: boolean,
  grow?: boolean,
  wrapperClassName?: string,
  innerClassName?: string
};

type Button = React.FunctionComponent<ButtonProps> & {
  BorderColors: ButtonBorderColors,
  Colors: ButtonColors,
  Hovers: ButtonHovers,
  Looks: ButtonLooks,
  Sizes: ButtonSizes
};

function WrappedButton(props: ButtonProps) {
  props.innerClassName = className([
    props.innerClassName,
    "vx-button-inner"
  ]);

  return (
    <ErrorBoundary>
      <SystemDesign.Button {...props} />
    </ErrorBoundary>
  )
}
Object.defineProperties(WrappedButton, {
  BorderColors: {
    get: () => SystemDesign.Button.BorderColors
  },
  Colors: {
    get: () => SystemDesign.Button.Colors
  },
  Hovers: {
    get: () => SystemDesign.Button.Hovers
  },
  Looks: {
    get: () => SystemDesign.Button.Looks
  },
  Sizes: {
    get: () => SystemDesign.Button.Sizes
  }
});

export const Button = WrappedButton as Button;
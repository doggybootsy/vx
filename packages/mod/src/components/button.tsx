import { className } from "../util"
import ErrorBoundary from "./boundary"
import { MegaModule } from "./util"

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

type HTMLButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
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
      <MegaModule.Button {...props} />
    </ErrorBoundary>
  );
};
Object.defineProperties(WrappedButton, {
  BorderColors: {
    get: () => MegaModule.Button.BorderColors
  },
  Colors: {
    get: () => MegaModule.Button.Colors
  },
  Hovers: {
    get: () => MegaModule.Button.Hovers
  },
  Looks: {
    get: () => MegaModule.Button.Looks
  },
  Sizes: {
    get: () => MegaModule.Button.Sizes
  }
});

export const Button = WrappedButton as Button;
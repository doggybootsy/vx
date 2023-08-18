import { ErrorBoundary } from "renderer/components";
import { cache } from "renderer/util";
import webpack from "renderer/webpack";

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
  borderColor?: string
};

type Button = React.FunctionComponent<ButtonProps> & {
  BorderColors: ButtonBorderColors,
  Colors: ButtonColors,
  Hovers: ButtonHovers,
  Looks: ButtonLooks,
  Sizes: ButtonSizes
};

function WrappedButton(props: ButtonProps) {
  const React = webpack.common.React!;
  const components = webpack.common.components as { Button: Button };

  return (
    <ErrorBoundary>
      <components.Button {...props} />
    </ErrorBoundary>
  );
};

Object.defineProperties(WrappedButton, {
  BorderColors: {
    get: () => webpack.common.components!.Button.BorderColors
  },
  Colors: {
    get: () => webpack.common.components!.Button.Colors
  },
  Hovers: {
    get: () => webpack.common.components!.Button.Hovers
  },
  Looks: {
    get: () => webpack.common.components!.Button.Looks
  },
  Sizes: {
    get: () => webpack.common.components!.Button.Sizes
  }
});

export default WrappedButton as Button;
function createElement(type, props, children) {
	let key = null;
	let ref = null;

	const passedProps = {};
	if (props !== null || props !== undefined) {
		for (const $key in props) {
			if (!Object.hasOwnProperty.call(props, $key)) continue;
			switch ($key) {
				case "key":
					key = props[$key];
					break;
				case "ref":
					ref = props[$key];
					break;

				// react naturally skips these 2
				case "__self":
				case "__source":
					break;
			
				default:
					passedProps[$key] = props[$key];
			}
		}
	}

	const childrenLength = arguments.length - 2;
	if (1 === childrenLength) passedProps.children = children;
	else if (1 < childrenLength) {
		for (var children = Array(childrenLength), l = 0; l < childrenLength; l++) children[l] = arguments[l + 2];
		passedProps.children = children;
	}

	if (type && type.defaultProps) {
		for (const key in type.defaultProps) {
			if (!Object.hasOwnProperty.call(type.defaultProps, key)) continue;
			if (Object.hasOwnProperty.call(passedProps, key)) continue;

			passedProps[type.defaultProps[key]];
		}
	}

	let owner = null;
	if (typeof window.VX === "object" && VX.util.reactExists) {
		owner = VX.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner.current;
	}

	return {
		$$typeof: Symbol.for("react.element"),
		type: type,
		key: key,
		ref: ref,
		props: passedProps,
    __vx_jsx__: true,
		_owner: owner
	}
}

/** @type {import("react")["Fragment"]} */
const Fragment = Symbol.for("react.fragment");

export const __jsx__ = { createElement, Fragment };

// There is no error here
export {
	Fragment as "React.Fragment",
	createElement as "React.createElement"
}
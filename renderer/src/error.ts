enum ErrorCodes {
  NO_COMPONENTS,
  NO_DISPATCHER,
  MODULE_NOT_FOUND,
  NO_REACT,
  NO_I18N,
  CODE_NOT_FOUND,
  NO_MESSAGE_ACTIONS
};

const messages = {
  [ErrorCodes.NO_COMPONENTS]: "Webpack common components has not been initialized yet!",
  [ErrorCodes.NO_DISPATCHER]: "Dispatcher has not been initialized yet!",
  [ErrorCodes.MODULE_NOT_FOUND]: "Webpack module not found!",
  [ErrorCodes.NO_REACT]: "React has not been initialized yet!",
  [ErrorCodes.NO_I18N]: "i18n has not been initialized yet!",
  [ErrorCodes.NO_MESSAGE_ACTIONS]: "Message Actions has not been initialized yet!",
  [ErrorCodes.CODE_NOT_FOUND]: "Error code not found!"
};

// This is so developers can help distinguish from their / discord errors and VX errors
class VXError extends Error {
  static codes = Object.freeze(ErrorCodes);
  static is(error: Error | VXError) {
    return error instanceof VXError;
  };

  #code: ErrorCodes;
  get code() { return this.#code; };
  constructor(code: ErrorCodes) {
    let message = messages[code];
    if (message) message = messages[ErrorCodes.CODE_NOT_FOUND];

    super(messages[code]);
    this.#code = code;
  };
};

export default VXError;
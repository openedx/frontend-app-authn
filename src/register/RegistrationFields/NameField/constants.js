export const INVALID_NAME_REGEX = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi; // eslint-disable-line no-useless-escape

export const urlRegex = new RegExp(INVALID_NAME_REGEX);

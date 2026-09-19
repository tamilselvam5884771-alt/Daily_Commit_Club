/**
 * Structured Logger for Daily Commit Club
 */
const formatMessage = (tag, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${tag.toUpperCase()}] ${message}`;
};

export const logger = {
  info: (tag, message) => {
    console.log(formatMessage(tag, message));
  },
  warn: (tag, message) => {
    console.warn(formatMessage(tag, message));
  },
  error: (tag, message, error = null) => {
    if (error) {
      console.error(formatMessage(tag, `${message} - ${error.message || error}`), error.stack || '');
    } else {
      console.error(formatMessage(tag, message));
    }
  },
  debug: (tag, message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage(tag, `[DEBUG] ${message}`));
    }
  }
};

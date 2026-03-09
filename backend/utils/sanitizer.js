import xss from "xss";

export function sanitizeInput(input) {
  if (typeof input !== "string") {
    return input;
  }

  // Configure XSS with whitelist for safe HTML
  const options = {
    whiteList: {}, // No HTML tags allowed in feedback
    stripIgnoredTag: true,
    stripLeadingAndTrailingWhitespace: true,
  };

  return xss(input, options).trim();
}

export function sanitizeObject(obj) {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  }

  return sanitized;
}

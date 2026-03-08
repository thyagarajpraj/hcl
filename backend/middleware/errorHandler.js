export function notFoundHandler(request, response) {
  response.status(404).json({
    message: `Route ${request.method} ${request.originalUrl} was not found.`
  });
}

export function errorHandler(error, _request, response, _next) {
  if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
    return response.status(400).json({
      message: "Request body contains invalid JSON."
    });
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return response.status(statusCode).json({
    message: error.message || "Internal server error."
  });
}

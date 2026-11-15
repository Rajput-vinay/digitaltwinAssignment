// Use this error class when a request needs a specific HTTP status code.
export class HttpError extends Error {
  constructor(status, message, error) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

// Send a 404 error when the requested route does not exist.
export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Handle errors from routes and send a consistent JSON response.
export function errorHandler(err, _req, res, _next) {
  let { status = 500, message, errors } = err;

  // Convert common MongoDB and request errors into readable responses.
  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = "Validation Error";

    errors = Object.fromEntries(
      Object.entries(err.errors).map(([key, value]) => [key, value.message]),
    );
  } else if (err.name === "CastError") {
    status = 400;
    message = "Cast Error";
  } else if (err.code === 11000) {
    status = 400;
    message = "Duplicate Error";
  } else if (err.type === "entity.parse.faile") {
    status = 400;
    message = "Request body is not valid JSON";
  }

  // Log server errors for debugging, but do not expose their details to users.
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    message: status >= 500 ? "Internal server error" : message,
    ...(errors && { errors }),
  });
}

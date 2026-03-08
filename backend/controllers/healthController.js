import mongoose from "mongoose";

function getMongoStatus(readyState) {
  switch (readyState) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
}

export function getHealth(_request, response) {
  const mongoReadyState = mongoose.connection.readyState;
  const mongoStatus = getMongoStatus(mongoReadyState);
  const isHealthy = mongoReadyState === 1;

  response.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "unhealthy",
    database: {
      provider: "mongodb",
      readyState: mongoReadyState,
      status: mongoStatus
    }
  });
}

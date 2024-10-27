import winston from "winston";

const logger = winston.createLogger({
  level: "silly", // Capture all log levels
  transports: [new winston.transports.Console()],
});

export default logger;

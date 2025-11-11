import "dotenv/config";

function bool(v, d = false) {
  if (v == null) return d;
  return String(v).toLowerCase() === "true";
}

const mailPort = parseInt(process.env.MAIL_PORT || "587", 10);

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  appUrl:
    process.env.APP_URL || `http://localhost:${process.env.PORT || "4000"}`,
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    ttl: process.env.JWT_TTL || "1d",
    cookieName: process.env.JWT_COOKIE_NAME || "jwt",
    cookieSameSite: (process.env.JWT_COOKIE_SAMESITE || "lax").toLowerCase(),
    cookieSecure: bool(process.env.JWT_COOKIE_SECURE, false),
  },
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || process.env.DB_DATABASE || "barbería",
    charset: "utf8mb4",
  },
  mail: {
    host: process.env.MAIL_HOST || "",
    port: mailPort,
    user: process.env.MAIL_USER || "",
    pass: process.env.MAIL_PASS || "",
    from: process.env.MAIL_FROM || "",
    fromName: process.env.MAIL_FROM_NAME || "",
    secure: bool(process.env.MAIL_SECURE, mailPort === 465),
  },
};

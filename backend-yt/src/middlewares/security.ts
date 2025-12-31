import helmet from 'helmet';
// @ts-ignore - express-mongo-sanitize doesn't have types
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore - hpp doesn't have types
import hpp from 'hpp';
import { Express } from 'express';

export const configureSecurityMiddleware = (app: Express) => {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding YouTube videos
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  app.use(mongoSanitize());

  app.use(hpp());
};

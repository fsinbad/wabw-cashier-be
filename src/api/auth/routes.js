import { SignInPayloadSchema, SignUpPayloadSchema } from "./validator.js";

export const authRoutes = (handler) => [
  {
    method: "POST",
    path: "/auth/sign-in",
    handler: handler.signInHandler,
    options: {
      auth: false,
      plugins: {
        'hapi-rate-limit': {
          enabled: true,
          userLimit: 3,
          userCache: {
            expiresIn: 15 * 60 * 1000
          },
          // store: { segment: 'rate-limit-signin', client: redisClient } 
        }
      },
      validate: {
        payload: SignInPayloadSchema,
      },
      description: "Sign in a user",
      tags: ["api", "auth"],
    },
  },
  {
    method: "POST",
    path: "/auth/sign-up",
    handler: handler.signUpHandler,
    options: {
      auth: false,
      plugins: {
        'hapi-rate-limit': {
          enabled: true,
          userLimit: 10,
          userCache: {
            expiresIn: 15 * 60 * 1000
          },
          // store: { segment: 'rate-limit-signin', client: redisClient } 
        }
      },
      validate: {
        payload: SignUpPayloadSchema,
      },
      description: "Sign Up a new user",
      tags: ["api", "auth"],
    },
  },
];

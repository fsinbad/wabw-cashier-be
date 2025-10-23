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
          userLimit: 2,
          userCache: {
            expiresIn: 15 * 60 * 1000
          },
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

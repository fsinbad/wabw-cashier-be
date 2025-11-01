import AuthHandler from "./handler.js";
import { authRoutes } from "./routes.js";

export const authPlugin = {
  name: "api-auth",
  version: "1.0.0",
  register: async (server) => {
    const authHandler = new AuthHandler();
    server.route(authRoutes(authHandler));
  },
};

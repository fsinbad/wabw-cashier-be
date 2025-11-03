import AuthService from "../../services/AuthService.js";
import UsersService from "../../services/UsersService.js";
import AuthHandler from "./handler.js";
import { authRoutes } from "./routes.js";

export const authPlugin = {
  name: "api-auth",
  version: "1.0.0",
  register: async (server) => {

    const usersService = new UsersService();
    const authService = new AuthService(usersService);
    const authHandler = new AuthHandler(authService);

    server.route(authRoutes(authHandler));
  },
};

import Boom from "@hapi/boom";
import AuthenticationError from "../../exceptions/AuthenticationError.js";
import ClientError from "../../exceptions/ClientError.js";

class AuthHandler {
  constructor(authService) {
    // dep inject
    this._authService = authService;
    // 
    this.signInHandler = this.signInHandler.bind(this);
    this.signUpHandler = this.signUpHandler.bind(this);
  }

  async signInHandler(request, h) {
    try {
      const { email, password } = request.payload;
      const result = await this._authService.signIn(email, password);

      return h
        .response({
          token: result.token,
          status: "success",
          message: "Sign in successful",
        })
        .code(200);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return Boom.unauthorized(error.message);
      }
      console.error("SignIn Handler Error:", error);
      return Boom.internal("An internal server error occurred");
    }
  }

  async signUpHandler(request, h) {
    try {
      const { username, email, password } = request.payload;
      const userId = await this._authService.signUp({
        username,
        email,
        password,
      });
      return h
        .response({
          status: "success",
          message: "User registered successfully",
          data: { userId },
        })
        .code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return Boom.badRequest(error.message);
      }
      console.error("SignUp Handler Error:", error);
      return Boom.internal("An internal server error occurred");
    }
  }
}

export default AuthHandler;

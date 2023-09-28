import { Router } from "$oak/mod.ts";

import * as BookController from "@/src/controller/BookController.ts";
import * as TestController from "@/src/controller/TestController.ts";
import * as AuthController from "@/src/controller/AuthController.ts";

export const router = new Router();

router
  .get("/", TestController.TestGetFunc)
  .post("/", TestController.TestPostFunc)
  .get("/api", TestController.TestCookieFunc)
  .get("/github", TestController.TestGithubFunc)
  .get("/auth/signin", AuthController.SignIn)
  .get("/auth/getuser", AuthController.SetSettion)
  .get("/book", BookController.getAllbooks)
  .get("/book/:id", BookController.getBookById);

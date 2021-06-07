// Enviroment variables
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import expressStaticGzip from "express-static-gzip";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Middlewear
import cookieParser from "cookie-parser";
import cors from "cors";

import Auth from "./Auth";

import "./utils/db";
import schema from "./schema";

(async () => {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  // Parser middlewares
  app.use(express.json());
  app.use(cookieParser());

  const server = new ApolloServer({
    schema,
    playground: process.env.NODE_ENV === "development" ? true : false,
    introspection: true,
    tracing: true,
    path: "/api",
    context: async ({ req, res }) => {
      // Note: This example uses the `req` argument to access headers,
      // but the arguments received by `context` vary by integration.
      // This means they vary for Express, Koa, Lambda, etc.
      //
      // To find out the correct arguments for a specific integration,
      // see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields

      const { auth } = req.cookies;
      // console.log(auth);
      // if (!auth) throw new Error("No authentication token");

      // try {
      //   jwt.verify(JSON.parse(auth), process.env.AUTH_TOKEN_SECRET);
      // } catch (err) {
      //   throw new Error("JWT error")
      // }
      console.log("test");

      return { req, res, auth };
    },
  });

  server.applyMiddleware({
    app,
    path: "/api",
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
    onHealthCheck: () =>
      // eslint-disable-next-line no-undef
      new Promise((resolve, reject) => {
        if (mongoose.connection.readyState > 0) {
          resolve();
        } else {
          reject();
        }
      }),
  });

  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT}`);
    console.log(
      `😷 Health checks available at /.well-known/apollo/server-health`
    );
  });
})();

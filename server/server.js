// Enviroment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import Auth from './Auth';

import "./utils/db";
import schema from "./schema";

(async () => {
  const app = express();

  app.use(cors({
    origin: "http://localhost:3000",
    preflightContinue: true,
    credentials: true,
  }));

  // Parser middlewares
  app.use(express.json());
  app.use(cookieParser());

  // Authentication middlewear
  app.use('/auth', Auth);

  const server = new ApolloServer({
    schema,
    cors: true,
    playground: process.env.NODE_ENV === "development" ? true : false,
    introspection: true,
    tracing: true,
    path: "/",
    context: async ({ req, res }) => {
      // Note: This example uses the `req` argument to access headers,
      // but the arguments received by `context` vary by integration.
      // This means they vary for Express, Koa, Lambda, etc.
      //
      // To find out the correct arguments for a specific integration,
      // see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields
  
      // Get the user token from the headers.
      // console.log('cookies', req.cookies)
      // res.cookie('TEST', 'FROM SERVER')
      // Add the user to the context

      const { auth } = req.cookies;

      // if(!auth) throw new Error("No authentication token");
      
      // try {
      //   jwt.verify(JSON.parse(auth), process.env.AUTH_TOKEN_SECRET);
      // } catch (err) {
      //   throw new Error("JWT error")
      // }

      return { req, res, auth };
    },
  });

  server.applyMiddleware({
    app,
    path: "/",
    cors: true,
    onHealthCheck: () =>
      // eslint-disable-next-line no-undef
      new Promise((resolve, reject) => {
        if (mongoose.connection.readyState > 0) {
          resolve();
        } else {
          reject();
        }
      })
  });

  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT}`);
    console.log(`😷 Health checks available at /.well-known/apollo/server-health`);
  })
})();
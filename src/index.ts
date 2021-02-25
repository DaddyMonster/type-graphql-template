import "dotenv-safe/config";
import { createServer } from "http";
import * as Express from "express";
import connectMongoose from "./lib/mongo";
import connectPostgres from "./lib/pg";
import connectRedis from "connect-redis";
import getRedis from "./lib/redis";
import { graphqlUploadExpress } from "graphql-upload";
import path from "path";
import { buildSchema } from "type-graphql";
import cors from "cors";
import session from "express-session";
import compression from "compression";
import { ApolloServer } from "apollo-server-express";
import { TypegooseMiddleware } from "./lib/typegoose";
import { ApolloServerLoaderPlugin } from "type-graphql-dataloader";
import { getConnection } from "typeorm";

//import { RedisPubSub } from "graphql-redis-subscriptions";
const main = async () => {
  await connectMongoose();
  await connectPostgres();

  // UNCOMMENT THIS IF YOU NEED REDIS PUB SUB SOCKET CONNECTION

  /* const pubSub = new RedisPubSub({
    publisher: getRedis(),
    subscriber: getRedis(),
  }); */

  const schema = await buildSchema({
    resolvers: [path.resolve(__dirname, `graphql/**/*.resolvers.js`)], // graphql 폴더에 리졸버 파일 작성!
    validate: true,
    //authChecker: customAuthChecker, // User validtion 로직 필요시
    orphanedTypes: [],
    globalMiddlewares: [TypegooseMiddleware], // 타입구스 + 그래프큐엘 사용시 적용
    //pubSub: pubSub, // Pub/Sub 그래프큐엘 Publisher, Subscription 사용시 적용
  });

  const app = Express.default();

  app.use(graphqlUploadExpress());

  const origins = [process.env.CORS_ORIGIN!];
  app.use(cors({ origin: origins, credentials: true }));
  app.use(compression());
  app.set("trust proxy", 1);
  app.get(process.env.SUB_ROUTE_PATHNAME + "/test-load", (_, res) => {
    res.send("STATUS : 200 , SERVER IS RUNNING ON PORT :" + process.env.PORT);
  });

  const RedisStore = connectRedis(session);
  const sessionRedis = getRedis();
  app.use(
    session({
      name: process.env.COOKIE_NAME,
      store: new RedisStore({
        client: sessionRedis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 96,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
      rolling: true,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      resave: true,
    })
  );

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res, redis: sessionRedis }),
    introspection: true,
    playground: process.env.NODE_ENV !== "production",
    debug: process.env.NODE_ENV !== "production",
    uploads: false,
    plugins: [
      ApolloServerLoaderPlugin({
        typeormGetConnection: getConnection,
      }),
    ],
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
    path: process.env.GRAPHQL_PATH,
  });
  const httpServer = createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  httpServer.listen(process.env.PORT, () =>
    console.log(`Server started on PORT  : ${process.env.PORT}`)
  );
};

main().catch((err) => console.log(err));

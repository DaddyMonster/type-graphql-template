declare global {
  namespace NodeJS {
    interface ProcessEnv {

      // SERVER ENV
      NODE_ENV: "development" | "production";
      PORT?: string;
      CORS_ORIGIN1: string; // CORS_ORIGIN2 : string and so on
      SUB_ROUTE_PATHNAME: string;
      COOKIE_NAME: string;
      SESSION_SECRET: string;
      GRAPHQL_PATH: string;

      // MONGO DB
      MONGO_URI: string;

      // POSTGRES
      PG_DATABASE: string;
      PG_HOST: string;
      PG_USERNAME: string;
      PG_PASSWORD: string;
      PG_PORT: number;

      // REDIS
      REDIS_URI: string;
      REDIS_PW?: string;
    }
  }
}

export {};

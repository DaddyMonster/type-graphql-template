import path from "path";
import { ConnectionOptions, createConnection } from "typeorm";

console.log(path.resolve(__dirname, "..", "model-entities/**/*.ts"));

const pgProdOptions: ConnectionOptions = {
  type: "postgres",
  database: process.env.PG_DATABASE,
  host: process.env.PG_HOST,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  logging: false,
  synchronize: true,
  port: process.env.PG_PORT,
  entities: [path.resolve(__dirname, "..", "model-entities/**/*entity.js")],
};
const pgDevOptions = {
  logging: true,
};

const connectionObj =
  process.env.NODE_ENV === "production"
    ? pgProdOptions
    : Object.assign(pgProdOptions, pgDevOptions);

const connectPostgres = async () => {
  await createConnection(connectionObj);
};

export default connectPostgres;

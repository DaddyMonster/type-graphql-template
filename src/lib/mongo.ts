import { mongoose } from "@typegoose/typegoose";

const connectMongoose = async () => {
  await mongoose.connect(
    process.env.MONGO_URI!,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    },
    (err) => {
      const msg = err
        ? "MONGO CONNECTION ERR" + err
        : "MONGO DB CONNECTED SUCCESSFULLY";
      console.log(msg);
      // throw new Error(msg) // IF YOU WANT TO THROW...
    }
  );
};

export default connectMongoose;

import { User, UserTC } from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Custom function for adding days to current date
Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

UserTC.addResolver({
  name: "userRegisterOne",
  args: UserTC.getResolver("createOne").args,
  type: UserTC,
  resolve: async ({ source, args, context, info }) => {
    console.log(args)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(args.record.password, salt);

    const user = new User({
      type: args.record.type,
      firstName: args.record.firstName,
      lastName: args.record.lastName,
      email: args.record.email,
      username: args.record.username,
      password: hashedPassword,
    });

    await user.save();

    return user;
  },
});

UserTC.addResolver({
  name: "authenticateByUsername",
  args: { username: "String!", password: "String!" },
  type: `type authenticationResult { result: Boolean, status: String }`,
  resolve: async ({ source, args, context, info }) => {
    // PUBLIC
    // Authentication via username
    // deconstruct arguments and context
    const { req, res, _user } = context;
    const { username, password } = args;

    /**
     * Authenticatin passed => result: true, status: 1
     * Username not found => result: false, status: 2
     * Password incorrect => result: false, status: 3
     */

    let user;

    // Fetch user from database
    try {
      user = await User.findOne({ username: username });
      if (!user) throw new Error();
    } catch (err) {
      // User cannot be found
      res.status(401);
      return { result: false, status: 2 };
    }

    if (await bcrypt.compare(password, user.password)) {
      // If user is already signed in, dont sign another token
      if (_user) return { result: true, status: 1 };

      // Sign a new jsonwebtoken and send as cookie to client
      const token = jwt.sign(
        { _id: user._id, type: user.type },
        process.env.AUTH_TOKEN_SECRET
      );
      res.status(200).cookie("auth", JSON.stringify(token), {
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        expires: new Date().addDays(7),
      });
      return { result: true, status: 1 };
    } else {
      res.status(401);
      return { result: false, status: 3 };
    }
  },
});

UserTC.addResolver({
  name: "userFindOne",
  args: UserTC.getResolver('findOne').args,
  type: UserTC,
  resolve: async ({ source, args, context, info }) => {
    // PRIVATE (ADMIN)
    const { req, res, _user } = context;
    // if(!_user) throw new Error('Authentication error: Must be logged in');

    const user = User.findOne(args.filter);

    return user;
  },
})

UserTC.addResolver({
  name: "userfindMany",
  args: UserTC.getResolver('findMany').args,
  type: [UserTC],
  resolve: async ({ source, args, context, info }) => {
    // PRIVATE (ADMIN)
    const { req, res, _user } = context;
    // if(!_user) throw new Error('Authentication error: Must be logged in');

    // Array of user
    const user = User.find(args.filter, null, { skip: args.skip, sort: args.sort});
    
    return user;
  },
})

UserTC.addResolver({
  name: "userCount",
  args: {},
  type: "type Test{ test: Int! }",
  resolve: async ({ source, args, context, info }) => {
    // PRIVATE (ADMIN)
    const { req, res, _user } = context;
    if(!_user) throw new Error('Authentication error: Must be logged in');

    // Array of user
    const count = await User.countDocuments({});

    return { test: count };
  },
})

const UserQuery = {
  authenticateByUsername: UserTC.getResolver("authenticateByUsername"),
  userOne: UserTC.getResolver("userFindOne"),
  userMany: UserTC.getResolver("userfindMany"),
  userCount: UserTC.getResolver("userCount"),
};

UserTC.addResolver({
  name: "userRegisterOne",
  args: UserTC.getResolver("createOne").args,
  type: UserTC,
  resolve: async ({ source, args, context, info }) => {
    console.log(args)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(args.record.password, salt);

    const user = new User({
      type: args.record.type,
      firstName: args.record.firstName,
      lastName: args.record.lastName,
      email: args.record.email,
      username: args.record.username,
      password: hashedPassword,
    });

    await user.save();

    return user;
  },
});

UserTC.addResolver({
  name: "userRegister",
  args: UserTC.getResolver('createMany').args,
  type: `type userRegisterPayload { createdCount: Int, error: String }`,
  resolve: async ({ source, args, context, info }) => {
    // PRIVATE (ADMIN)
    const { req, res, _user } = context;
    // if(!_user) throw new Error('Authentication error: Must be logged in');

    let data = args.records;
    const salt = await bcrypt.genSalt(10);

    for (const [ind, datum] of data.entries()) {
      data[ind].password = await bcrypt.hash(datum.password, salt);
    }
    
    try {
      await User.collection.insertMany(data);
    } catch (err) {
      return { createdCount: 0, error: err.message }
    }
   
    return { createdCount: data.length }
  },
})

const UserMutation = {
  userRegisterOne: UserTC.getResolver("userRegisterOne"),
  userRegister: UserTC.getResolver("userRegister"),
  userCreateOne: UserTC.getResolver("createOne"),
  userCreateMany: UserTC.getResolver("createMany"),
  userUpdateById: UserTC.getResolver("updateById"),
  userUpdateOne: UserTC.getResolver("updateOne"),
  userUpdateMany: UserTC.getResolver("updateMany"),
  userRemoveById: UserTC.getResolver("removeById"),
  userRemoveOne: UserTC.getResolver("removeOne"),
  userRemoveMany: UserTC.getResolver("removeMany"),
};

export { UserQuery, UserMutation };

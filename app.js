if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate"); // one
const expressError = require("./utils/expressError");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");

const MongoStore = require("connect-mongo");

// const Joi = require("joi");
// const { campgroundSchema, reviewSchema } = require("./schema.js");

// const expressLayouts = require("express-ejs-layouts"); //two
// const catchAsync = require("./utils/catchAsync");

// const Campground = require("./models/campground");
// const Review = require("./models/review.js");

const user = require("./routes/users");
const campgrounds = require("./routes/campground.js");
const reviews = require("./routes/reviews.js");
const db_url = process.env.DB_URL;
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connecting to the mongoose!!!");
  })
  .catch((err) => {
    console.log("Oh no! Something went wrong!");
    console.log(err);
  });
mongoose.set("strictQuery", true);

// mongoose.connect(db_url, {});
// var db = mongoose.connection;
// //Bind connection to error event (to get notification of connection errors)
// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", () => console.log("Database Connected"));

app.engine("ejs", ejsMate); // one
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// app.use(expressLayouts); // two
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});

store.on("error", function (e) {
  console.log("Session Store Error", e);
});

const sessionConfig = {
  store,
  secret: "thisshouldbebettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// passport

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.session);
  // console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "colt@gmail.com", username: "colt" });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

app.use("/", user);
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  // res.send("404!!!!!");
  next(new expressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No! Something went wrong";
  res.status(statusCode).render("error", { err });
  // res.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log("Listening to the port 3000");
});

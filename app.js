if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
app.set("trust proxy", 1);
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const userRouter = require("./routes/user.js");
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");

// Database
const dburl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dburl);
    console.log("Connected to DB");
}

main().catch((err) => console.log(err));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Session Store
const store = MongoStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 3600
});

store.on("error", () => {
    console.log("Mongo Session Store Error");
});

const sessionOptions = {
    store,
    secret: process.env.SECRET || "mysupersecretcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global locals middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// Home route
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// 404
app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;

    if(res.headersSent){
        return next(err);
    }

    return res.status(statusCode).render("error.ejs", { message });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});






// if(process.env.NODE_ENV != "production"){
//     require('dotenv').config();
// }



// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
// const session = require("express-session");
// const MongoStore = require('connect-mongo');
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");
// const userRouter = require("./routes/user.js");
// const multer = require("multer");

// const upload = multer({ dest: "uploads/"})


// const listingRouter = require("./routes/listing.js");
// const reviewsRouter = require("./routes/review.js");



// //const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dburl = process.env.ATLASDB_URL;
// main().then(() => {
//     console.log("Connected to db");
// }).catch((err) => {
//     console.log(err);
// });

// async function main()
// {
//     await mongoose.connect(dburl);
// }

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({extended : true}));
// app.use(methodOverride("_method"));
// app.engine("ejs", ejsMate);
// app.use(express.static(path.join(__dirname, "/public")));

// const store = MongoStore.create({
//     mongoUrl: dburl,
//     touchAfter: 24 * 3600
// });

// const sessionOptions = {
//     store,
//     secret: process.env.SECRET || "mysupersecretcode",

//     resave: false,
//     saveUninitialized: false,

//     cookie: {
//         httpOnly: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// };

// app.use(session(sessionOptions));
// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());



// app.get("/", (req, res) => {
//     res.redirect("/listings");
// });

// app.use((req, res, next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currentUser = req.user;
//     next();
// });

// app.use("/listings", listingRouter );
// app.use("/listings/:id/reviews", reviewsRouter);
// app.use("/", userRouter);



// app.all("/*splat", (req, res, next) => {
//   next(new ExpressError(  404, "Page Not Found"));
// });
// //error handling middleware
// // app.use((err, req, res, next) =>{
// //     let {statusCode = 500 ,message = "Something went wrong"} = err;
 
// //         res.status(statusCode).render("error.ejs", {message});
// // });
// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something went wrong" } = err;

//     if(res.headersSent){
//         return next(err);
//     }

//     return res.status(statusCode).render("error.ejs", { message });
// });

// // app.use((err, req, res, next) => {
// //     console.error(err);   // prints full error in Render logs

// //     let { statusCode = 500, message = "Something went wrong" } = err;

// //     res.status(statusCode).send(message);
// // });

// // app.listen(8080, () =>{
// //     console.log("Server is running on port 8080");

// // });


// // const PORT = process.env.PORT || 8080;

// // app.listen(PORT, () =>{
// //     console.log(`Server is running on port ${PORT}`);
// // });

// module.exports = app;

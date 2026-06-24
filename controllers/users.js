
const User = require("../models/user.js");

module.exports.renderSignupForm = 
 (req, res, next) => {
    res.render('users/signup.ejs');
};

module.exports.signup = async (req, res , next) => {
    try {
       
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
           if (err) {
    req.flash("error", err.message);
    return res.redirect("/signup");
}
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
        
    } catch (e) { 
        
    console.log("===== SIGNUP ERROR =====");
    console.log(e);
    console.log("========================");

        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm =  (req, res, next) => {
    res.render('users/login.ejs');
};

module.exports.login = async(req, res, next) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
};
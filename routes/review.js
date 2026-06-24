const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


//review route {post route to add review to a listing}
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
//delete review route
router.delete("/:reviewId", isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
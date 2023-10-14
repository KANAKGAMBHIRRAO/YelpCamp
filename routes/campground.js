// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const expressError = require("../utils/expressError");

const Campground = require("../models/campground");

const { campgroundSchema } = require("../schema.js");

const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const campgrounds = require("../controllers/campground");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );
// .post(upload.array("image"), (req, res) => {
//   console.log(req.body, req.files);
//   res.send("It Worked");
// });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// router.post("/campgrounds", async (req, res) => {
//   res.send(req.body);
// });

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  // to update the campground:--------->
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  // delete the thing
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;

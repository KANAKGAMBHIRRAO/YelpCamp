const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  // res.send(req.body);
  // if (!req.body.campground)
  //   throw new expressError("Invalid camground data", 400);
  // const campgroundSchema = Joi.object({
  //   campground: Joi.object({
  //     title: Joi.string().required(),
  //     price: Joi.number().required().min(0),
  //     image: Joi.string().required(),
  //     location: Joi.string().required(),
  //     description: Joi.string().required(),
  //   }).required(),
  // });
  // const { error } = campgroundSchema.validate(req.body);
  // if (error) {
  //   const msg = error.details.map((el) => el.message).join(",");
  //   throw new expressError(msg, 400);
  // }

  // another one

  // const result = campgroundSchema.validate(req.body);
  // if (result.error) {
  //   throw new expressError(result.error.details, 400);
  // } // here we are not forming any object but just throwing an error
  // console.log(result);

  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();

  const campground = new Campground({ ...req.body.campground });
  campground.geometry = geoData.body.features[0].geometry;
  campground.image = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`campgrounds/${campground.id}`);
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  // console.log(campground);
  //   const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  })); 
  campground.image.push(...imgs);
  await campground.save();

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(campground);
  }

  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
  // res.send("It Worked!!!");
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the Campground");
  res.redirect("/campgrounds");
};

const mongoose = require("mongoose");
const Campground = require("../models/campground");
const { places, descriptors } = require("./seedHelpers");
const cities = require("./cities");
const campground = require("../models/campground");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Connecting to the mongoose!!!");
  })
  .catch((err) => {
    console.log("Oh no! Something went wrong!");
    console.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 15; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6516e9a0256eabba815f2718",
      location: `${cities[random1000].city} , ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,

      description:
        "Lorem ipsum dolor, adipisicing elit. Numquam quo ut quae dolorum minus, id conseqe assiste quis. Voluptatem?",
      price,

      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      image: [
        {
          url: "https://res.cloudinary.com/dcbfjet9i/image/upload/v1696146179/YelpCamp/crn4urj88mjwux23ptcf.png",

          url: "https://res.cloudinary.com/dcbfjet9i/image/upload/v1696146179/YelpCamp/crn4urj88mjwux23ptcf.png",
          filename: "YelpCamp/crn4urj88mjwux23ptcf",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

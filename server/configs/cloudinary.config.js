const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "dhwzmdglh",
  api_key: "537661791138552",
  api_secret: "K3kKm62v5sIMV9SRUXZax7alobM",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "project3-ironhack",
    allowed_formats: async (req, file) => "jpg,png",
  },
});

const uploadCloud = multer({ storage: storage });

module.exports = uploadCloud;

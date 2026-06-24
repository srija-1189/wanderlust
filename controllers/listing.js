const Listing = require("../models/listing.js");

const geocoder = require("../utils/geocoder");

module.exports.index = async (req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res)=>{

    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=> {
    let {id} = req.params;
    id= id.trim();
    const listing = await Listing.findById(id).populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        }).populate("owner");
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }  
   
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    try {

        const newListing = new Listing(req.body.listing);

        const fullAddress =
            `${req.body.listing.location}, ${req.body.listing.country}`;

        // Default coordinates
        newListing.geometry = {
            type: "Point",
            coordinates: [78.4867, 17.3850]
        };

        try {
            const result = await geocoder.geocode(fullAddress);

            if (result && result.length > 0) {
                newListing.geometry = {
                    type: "Point",
                    coordinates: [
                        result[0].longitude,
                        result[0].latitude
                    ]
                };
            }
        } catch (err) {
            console.log("Geocoder Error:", err);
        }

        // safer image handling
        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        newListing.owner = req.user._id;

        await newListing.save();

        req.flash("success", "New Listing Created!");

        res.redirect("/listings");

    } catch (err) {
        console.log("Create Listing Error:", err);
        next(err);
    }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing , originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    id = id.trim();

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing =  async (req, res) =>{
    let {id} = req.params;
    id= id.trim();
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};
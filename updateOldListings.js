const mongoose = require("mongoose");
const Listing = require("./models/listing");
const geocoder = require("./utils/geocoder");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
.then(()=>console.log("DB connected"))
.catch(err=>console.log(err));

async function updateOldListings(){

    const listings = await Listing.find({});

    for(let listing of listings){

        const fullAddress =
        `${listing.location}, ${listing.country}`;

        try{

            const result =
            await geocoder.geocode(fullAddress);

            if(result.length>0){

                listing.geometry = {
                    type:"Point",
                    coordinates:[
                        result[0].longitude,
                        result[0].latitude
                    ]
                };

                await listing.save();

                console.log(
                    `${listing.title} updated`
                );
            }

        }catch(err){
            console.log(err);
        }
    }

    console.log("All listings updated");
    mongoose.connection.close();
}

updateOldListings();
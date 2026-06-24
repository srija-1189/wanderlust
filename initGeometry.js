const mongoose = require("mongoose");
const Listing = require("./models/listing");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
.then(()=>console.log("DB connected"))
.catch(err=>console.log(err));

async function updateListings(){

    await Listing.updateMany(
        {
            $or:[
                {geometry:{$exists:false}},
                {"geometry.coordinates":[]}
            ]
        },
        {
            $set:{
                geometry:{
                    type:"Point",
                    coordinates:[78.4867,17.3850]
                }
            }
        }
    );

    console.log("Old listings updated");
    mongoose.connection.close();
}

updateListings();
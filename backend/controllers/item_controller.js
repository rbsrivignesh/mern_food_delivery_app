import Item from "../models/item_model.js";
import Shop from "../models/shop_model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body;

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            return res.status(400).json({ message: "Shop Not Found" });
        }
        const item = await Item.create({
            name,
            category,
            price,
            foodType,
            image,
            shop: shop._id
        });
        shop.items.push(item._id);

        await shop.save();
        await shop.populate("owner");
        await shop.populate({
            path: "items",
            options: {
                sort: { updatedAt: -1 }
            }
        });



        return res.status(201).json(shop);

    } catch (error) {
        return res.status(500).json({ message: `Add Item Error : ${error}` });

    }
}

export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { name, category, foodType, price } = req.body;

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        const item = await Item.findByIdAndUpdate(itemId, {
            name, category, foodType, price, image
        }, { new: true });

        if (!item) {
            return res.status(400).json({ message: "Item Not Found" });
        }

        const shop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: {
                sort: { updatedAt: -1 }
            }
        });
        return res.status(201).json(shop);


    } catch (error) {
        return res.status(500).json({ message: `Edit Item Error : ${error}` });

    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(400).json({ message: "Item Not Found" });
        }
        return res.status(201).json(item);


    } catch (error) {
        return res.status(500).json({ message: `get Item Error : ${error}` });

    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findByIdAndDelete(itemId);

        if (!item) {
            return res.status(400).json({ message: "Item Not Found" });
        }

        let shop = await Shop.findOne({ owner: req.userId });
        shop.items = shop.items.filter((i => i !== item._id));

        await shop.save();
        await shop.populate({
            path: "items",
            options: {
                sort: { updatedAt: -1 }
            }
        });
        return res.status(200).json(shop);






    } catch (error) {
        return res.status(500).json({ message: `delete Item Error : ${error}` });

    }
}

export const getItemByCity = async (req, res) => {
    try {

        const { city } = req.params;
        if (!city) {
            return res.status(400).json({ message: "City is required" })
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items")



        if (!shops) {
            return res.status(400).json({ message: "Shops not found" });
        }
        const shopIds = shops.map((shop) => shop._id);

        const items = await Item.find({ shop: { $in: shopIds } })

        return res.status(200).json(items);

    } catch (error) {
        return res.status(500).json({ message: `get city Item Error : ${error}` });

    }
}

export const searchItem = async (req, res) => {
    try {
        const { query, city } = req.query;
        if (!query ) {
            return null;
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items")

        if (!shops) {
            return res.status(400).json({ message: "Shops not found" });
        }

        const shopIds = shops.map(s => s._id);

        const items = await Item.find({
            // shop : {$in : shopIds},
            $or : [
                {name : { $regex : query, $options : "i"}},
                {category : { $regex : query, $options : "i"}},
            ]
        }).populate("shop","shop image");

        // console.log({query,city})
        // console.log(shopIds)
        // console.log(items)


        return res.status(200).json(items)


    } catch (error) {
        return res.status(500).json({ message: `search Item Error : ${error}` });

    }
}


export const rating = async(req, res)=>{
    try {
        const {itemId, rating} = req.body;
        if(!itemId || !rating){
            return res.status(400).json({message : "Item ID and rating is important"})
        }
        
        if(rating <1 || rating >5){
            return res.status(400).json({message : "rating must be between 1 to 5"})
        }

        const item = await Item.findById(itemId);

        if(!item){
            return res.status(400).json({message : "Item Not Found"})
        }
        const newCount = item.rating.count +1 ;
        const newAverage = (item.rating.average * item.rating.count + rating)/newCount;

    item.rating.count = newCount;
    item.rating.average = newAverage;

    await item.save();

    return res.status(200).json({rating : item.rating})
        
           
   } catch (error) {
        return res.status(500).json({message : `ratting items error : ${error}`})
        
    }
}
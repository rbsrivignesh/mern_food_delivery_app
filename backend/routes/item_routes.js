import express from 'express'
import { isAuth } from '../middlewares/isAuth.js';
import { addItem, deleteItem, editItem, getItemByCity, getItemById, rating, searchItem } from '../controllers/item_controller.js';
import { upload } from '../middlewares/multer.js';
import { getItemsByShop } from '../controllers/order_controller.js';


const itemRouter = express.Router();


itemRouter.post("/add-item", isAuth, upload.single("image"),addItem);
itemRouter.post("/edit-item/:itemId", isAuth,  upload.single("image"),editItem);
itemRouter.get("/get-item/:itemId", isAuth,getItemById);
itemRouter.get("/delete-item/:itemId", isAuth,deleteItem);
itemRouter.get("/get-by-city/:city", isAuth,getItemByCity);
itemRouter.get("/get-by-shop/:shopId", isAuth,getItemsByShop);
itemRouter.get("/search-items", isAuth,searchItem);
itemRouter.post("/rating", isAuth,rating);


export default itemRouter
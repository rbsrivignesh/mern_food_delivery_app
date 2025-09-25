import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import connectDb from './config/db.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth_routes.js';
import cors from 'cors'
import userRouter from './routes/user_routes.js';
import shopRouter from './routes/shop_routes.js';
import itemRouter from './routes/item_routes.js';
import orderRouter from './routes/order_routes.js';
import http from 'http';
import { Server } from 'socket.io';
import { socketHandler } from './socket.js';


const app = express();
const server = http.createServer(app);

const io= new Server(server, 
{
cors : {
    origin: "https://rb-food-app.onrender.com",
    credentials: true, 
    methods : ['POST','GET']

}
}

);

app.set("io",io)

app.use(express.json());
app.use(cors({
    origin: "https://rb-food-app.onrender.com",
    credentials: true
}))
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

connectDb();





const port = process.env.PORT || 5000

app.get("/", (req, res) => res.send("Api is working"))
socketHandler(io)
server.listen(port, () => { console.log("Server started at : " + port) })

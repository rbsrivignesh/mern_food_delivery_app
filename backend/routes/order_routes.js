import express from 'express'
import { isAuth } from '../middlewares/isAuth.js';

import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders,getOrderById,getTodayDeliveries,placeOrder, sendDeliveryOtp, updateOrderStatus, verifyDeliveryOtp, verifyPayment } from '../controllers/order_controller.js';


const orderRouter = express.Router();


orderRouter.post("/place-order", isAuth,placeOrder);
orderRouter.post("/update-status/:orderId/:shopId", isAuth,updateOrderStatus);
orderRouter.get("/get-orders", isAuth,getMyOrders);
orderRouter.get("/get-assignments", isAuth,getDeliveryBoyAssignment);
orderRouter.get("/accept-order/:assignmentId", isAuth,acceptOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth,getOrderById);
orderRouter.get("/get-current-order", isAuth,getCurrentOrder);
// orderRouter.post("/send-delivery-otp", isAuth,sendDeliveryOtp);
orderRouter.post("/send-delivery-otp", sendDeliveryOtp);
orderRouter.post("/verify-delivery-otp", isAuth,verifyDeliveryOtp);
orderRouter.get("/get-today-deliveries", isAuth,getTodayDeliveries);




export default orderRouter

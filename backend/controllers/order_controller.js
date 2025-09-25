import DeliveryAssignmentModel from "../models/delivery_assignment_model.js";
import Order from "../models/order_model.js";
import Shop from "../models/shop_model.js";
import User from "../models/user_model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import RazorPay from 'razorpay'
import dotenv from 'dotenv'
dotenv.config();
let instance = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
        if (cartItems.length == 0 || !cartItems) {
            return res.status(400).json({ message: "Cart Is Empty" });
        }

        if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {

            return res.status(400).json({ message: "Send Complete Delivery Address" });
        }

        const groupItemsByShop = {};
        cartItems.forEach(item => {
            const shopId = item.shop;
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = [];

            }
            groupItemsByShop[shopId].push(item);
        });

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate("owner");
            if (!shop) {
                return res.status(400).json({ message: "Shop Not Found" })
            }

            const items = groupItemsByShop[shopId];
            const subTotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
            console.log("subtotal")
            console.log(subTotal)

            return {
                shop: shop._id,
                owner: shop.owner._id,
                subTotal,
                shopOrderItems: items.map((i) => (
                    {
                        item: i.id,
                        price: i.price,
                        quantity: i.quantity,
                        name: i.name
                    }
                ))
            }


        }))
        if (paymentMethod == "ONLINE") {
            const razorOrder = await instance.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: `receipt_${Date.now()}`,



            });

            const newOrder = await Order.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                totalAmount,
                shopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false

            });

            return res.status(200).json({
                razorOrder,
                orderId: newOrder._id,


            })


        }
        else {

            const newOrder = await Order.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                totalAmount,
                shopOrders

            });
            await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")

            await newOrder.populate("shopOrders.shop", "name");
            await newOrder.populate("shopOrders.owner", "fullName socketId");
            await newOrder.populate("user", "fullName email mobile");

            const io = req.app.get("io");
            if (io) {

                newOrder.shopOrders.forEach((shopOrder) => {
                    const ownerSocketId = shopOrder.owner.socketId;
                    if (ownerSocketId) {
                        io.to(ownerSocketId).emit('newOrder', {
                            _id: newOrder._id,
                            paymentMethod: newOrder.paymentMethod,
                            user: newOrder.user,
                            shopOrders: shopOrder,
                            createdAt: newOrder.createdAt,
                            deliveryAddress: newOrder.deliveryAddress,
                            payment: newOrder.payment
                        })
                    }
                })

            }

            return res.status(201).json(newOrder);

        }

    } catch (error) {
        return res.status(500).json({ message: `place order error : ${error}` })
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (user.role === "user") {

            const orders = await Order.find({ user: req.userId }).sort({
                createdAt: -1
            }).populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "fullName email mobile").populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders)
        }
        else if (user.role === "owner") {
            console.log("owner")

            const orders = await Order.find({ "shopOrders.owner": req.userId }).sort({
                createdAt: -1
            }).populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price").populate("shopOrders.assignedDeliveryBoy", "fullName mobile");



            const filteredOrder = orders.map((order) => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.find(o => o.owner._id == req.userId),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
                payment: order.payment


            }))

            return res.status(200).json(filteredOrder)
        }



    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `get user order error : ${error}` })
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;
        let order = await Order.findById(orderId);
        let shopOrder = order.shopOrders.find(o => o.shop == shopId)
        if (!shopOrder) {
            return res.status(400).json({ message: "Shop order not found" });
        }

        shopOrder.status = status;


        let deliveryBoysPayload = [];

        if (status == "out for delivery" && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress;
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [Number(longitude), Number(latitude)]
                        },
                        $maxDistance: 5000

                    }
                }
            });
            const nearByIds = nearByDeliveryBoys.map(b => b._id);

            const busyIds = await DeliveryAssignmentModel.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ["broadcasted", "completed"] }
            }).distinct("assignedTo");

            const busyIdSet = new Set(busyIds.map(id => String(id)));
            const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));

            const candidates = availableBoys.map(b => b._id);

            if (candidates.length == 0) {
                await order.save();
                return res.json({ message: "Order Status updated but no delivery boys available" });
            }

            const deliveryAssignment = await DeliveryAssignmentModel.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                broadcastedTo: candidates,
                status: "broadcasted"

            })

           await deliveryAssignment.populate("order")
           await deliveryAssignment.populate("shop");
            
            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
            shopOrder.assignment = deliveryAssignment._id;
            deliveryBoysPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates?.[0],
                latitude: b.location.coordinates?.[1],
                mobile: b.mobile
            }))


            const io = req.app.get("io");

            if (io) {
                availableBoys.forEach(b => {
                    const boySocketId = b.socketId;
                    if (boySocketId) {
                        io.to(boySocketId).emit('new-assignment', {
                            sendTo : b._id,
                            assignmentId: deliveryAssignment._id,
                            orderId: deliveryAssignment.order._id,
                            shopName: deliveryAssignment.shop.name,
                            deliveryAddress: deliveryAssignment.order.deliveryAddress,
                            items: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.shopOrderItems || [],
                            subTotal: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.subTotal
                        })
                    }
                })
            }





        }

        await shopOrder.save();
        await order.save();
        const updatedShopOrder = order.shopOrders.find(o => o.shop == shopId);
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");
        await order.populate("user", "socketId");



        const io = req.app.get("io");
        if (io) {
            const userSocketId = order.user.socketId;
            if (userSocketId) {
                io.to(userSocketId).emit('update-status', {
                    orderId: order._id,
                    shopId: updatedShopOrder.shop._id,
                    status: updatedShopOrder.status,
                    userId: order.user._id
                })
            }
        }

        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignment?._id
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `update order status error : ${error}` })
    }
}


export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.userId;

        const assignment = await DeliveryAssignmentModel.find({
            broadcastedTo: deliveryBoyId,
            status: "broadcasted"
        }).populate("order").populate("shop");


        const formatted = assignment.map(a => ({
            assignmentId: a._id,
            orderId: a.order._id,
            shopName: a.shop.name,
            deliveryAddress: a.order.deliveryAddress,
            items: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId))?.shopOrderItems || [],
            subTotal: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId))?.subTotal

        }));

        return res.status(200).json(formatted);



    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `get assignment error : ${error}` })
    }
}


export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await DeliveryAssignmentModel.findById(assignmentId);

        if (!assignment) {
            return res.status(400).json({ message: "Assignment not found" });
        }
        if (assignment.status !== "broadcasted") {
            return res.status(400).json({ message: "Assignment expired" });

        }
        const alreadyAssigned = await DeliveryAssignmentModel.findOne({
            assignedTo: req.userId,
            status: { $nin: ["broadcasted", "completed"] }
        })
        if (alreadyAssigned) {
            return res.status(400).json({ message: "Cannot Accept! You are already assigned to another order" });

        }
        assignment.assignedTo = req.userId;
        assignment.status = "assigned";
        assignment.acceptedAt = new Date();
        await assignment.save();

        const order = await Order.findById(assignment.order);
        if (!order) {
            return res.status(400).json({ message: "Order not found" });
        }

        const shopOrder = order.shopOrders.find(so => so._id.equals(assignment.shopOrderId));

        shopOrder.assignedDeliveryBoy = req.userId;

        await order.save();
        await order.populate("shopOrders.assignedDeliveryBoy");

        return res.status(200).json({
            message: 'Order Accepted'
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `accept assignment error : ${error}` })
    }
}

export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignmentModel.findOne({
            assignedTo: req.userId,
            status: "assigned"
        }).populate("shop", "name").populate("assignedTo", "fullName email mobile location")
            .populate({
                path: "order",
                populate: [{ path: "user", select: "fullName email location mobile" }]

            })
        if (!assignment) {

            return res.status(400).json({ message: `assignment not found` })
        }







        const shopOrder = assignment.order.shopOrders.find(so => String(so._id) == String((assignment.shopOrderId)));




        if (!shopOrder) {

            return res.status(400).json({ message: `shop order not found` })
        }

        let deliveryBoyLocation = { lat: null, lon: null };
        if (assignment.assignedTo.location.coordinates.length == 2) {

            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
        }
        let customerLocation = { lat: null, lon: null };
        if (assignment.order.deliveryAddress) {

            customerLocation.lat = assignment.order.deliveryAddress.latitude;
            customerLocation.lon = assignment.order.deliveryAddress.longitude;
        }





        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation,
            shop: assignment.shop
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `get assignment error : ${error}` })
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate("user").populate({
            path: "shopOrders.shop",
            model: "Shop"

        })
            .populate({
                path: "shopOrders.assignedDeliveryBoy",
                model: "User"

            }).populate({
                path: "shopOrders.shopOrderItems.item",
                model: "Item"

            }).lean()

        if (!order) {
            return res.status(400).json({ message: "no order found" })
        }

        return res.status(200).json(order)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `get order error : ${error}` })
    }
}

export const sendDeliveryOtp = async (req, res) => {
    try {

        const { orderId, shopOrderId } = req.body;
        console.log({ orderId, shopOrderId }, "line 390")
        const order = await Order.findById(orderId).populate("user");
        const shopOrder = order.shopOrders.id(shopOrderId);

        if (!order && !shopOrder) {
            return res.status(400).json({ message: "Order or shopOrder not found" })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        shopOrder.deliveryOtp = otp;
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
        await order.save();

        await sendDeliveryOtpMail(order.user, otp);

        return res.status(200).json({ message: "OTP sent successfully" })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `send otp order error : ${error}` })
    }
}

export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body;
        const order = await Order.findById(orderId).populate("user");
        const shopOrder = order.shopOrders.id(shopOrderId);

        if (!order && !shopOrder) {
            return res.status(400).json({ message: "Order or shopOrder not found" })
        }

        if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid/Expired Otp" })
        }

        shopOrder.status = "delivered";
        shopOrder.deliveredAt = Date.now();

        await order.save();

        await DeliveryAssignmentModel.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryBoy
        });

        return res.status(200).json({ message: "Order Deliverd Successfully" });


    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `send otp order error : ${error}` })
    }
}

export const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params;

        const shop = await Shop.findById(shopId).populate("items");

        if (!shop) {
            return res.status(400).json({ message: "Shop Not Found" })
        }

        return res.status(200).json({
            shop, items: shop.items
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `send otp order error : ${error}` })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, orderId } = req.body;
        const payment = await instance.payments.fetch(razorpay_payment_id);
        if (!payment || payment.status != "captured") {
            return res.status(400).json({ message: "Payment Failed" })
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(400).json({ message: "Order fetch Failed" })

        }

        order.payment = true;
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();
        await order.populate("shopOrders.shopOrderItems.item", "name image price")

        await order.populate("shopOrders.shop", "name")


        await order.populate("shopOrders.owner", "fullName socketId");
        await order.populate("user", "fullName email mobile");

        const io = req.app.get("io");
        if (io) {

            order.shopOrders.forEach((shopOrder) => {
                const ownerSocketId = shopOrder.owner.socketId;
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: order._id,
                        paymentMethod: order.paymentMethod,
                        user: order.user,
                        shopOrders: shopOrder,
                        createdAt: order.createdAt,
                        deliveryAddress: order.deliveryAddress,
                        payment: order.payment
                    })
                }
            })

        }


        return res.status(201).json(order);


    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `send otp order error : ${error}` })
    }
}


export const getTodayDeliveries = async(req, res)=>{
    try {
        const deliveryBoyId = req.userId;
        const startsOfDay = new Date();
        startsOfDay.setHours(0,0,0,0);

        const orders = await Order.find({
            "shopOrders.assignedDeliveryBoy" : deliveryBoyId,
            "shopOrders.status" :"delivered",
            "shopOrders.deliveredAt": {$gte: startsOfDay}
        }).lean();

        let todaysDeliveries = [];
        orders.forEach(order => {
            order.shopOrders.forEach(shopOrder => {
                if(shopOrder.assignedDeliveryBoy == deliveryBoyId && shopOrder.status == "delivered" && shopOrder.deliveredAt && shopOrder.deliveredAt >= startsOfDay){
                    todaysDeliveries.push(shopOrder);
                }
            })
        })

        let stats = {};

        todaysDeliveries.forEach(shopOrder => {
            const hour = new Date(shopOrder.deliveredAt).getHours();
            stats[hour] = (stats[hour] ||0) +1;
        })

        let formattedStats = Object.keys(stats).map(hours =>(
            {
                hour : parseInt(hours),
                count : stats[hours]
            }
        ))

        formattedStats.sort((a,b)=> a.hour - b.hour);

        return res.status(200).json(formattedStats);

      } catch (error) {
        console.log(error)   
     return res.status(500).json({ message: `get today deliveries error: ${error}` })
    }
}

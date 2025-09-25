import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name : "user",
    initialState :  {
        userData : null,
        currentCity: null,
        currentState:null,
        currentAddress:null,
        shopInMyCity: null,
        itemInMyCity:null,
        cartItems: [
           
        ],
        totalAmount : 0,
        myOrders : [],
        searchItems :null,
        socket : null

    },
    reducers : {
        setUserData : (state,action)=>{
            state.userData = action.payload;
        },
        setCurrentCity : (state,action)=>{
            state.currentCity = action.payload;
        },
        setCurrentState : (state,action)=>{
            state.currentState = action.payload;
        },
        setCurrentState : (state,action)=>{
            state.currentState = action.payload;
        },
        setCurrentAddress : (state,action)=>{
            state.currentAddress = action.payload;
        },
        setShopInMyCity: (state,action)=>{
            state.shopInMyCity = action.payload;
        },
        setItemInMyCity: (state,action)=>{
            state.itemInMyCity = action.payload;
        },
        addToCart: (state,action)=>{
            const cartItem = action.payload
            const existingItem = state.cartItems.find(i => i.id == cartItem.id );
            if(existingItem){
                let add = cartItem.quantity - existingItem.quantity
                existingItem.quantity+=add;
            }
            else{
                state.cartItems.push(cartItem);
            }

            state.totalAmount = state.cartItems.reduce((sum,i)=> sum+ i.price * i.quantity,0)


        },
        updateQuantity : (state, action)=>{
            const {id, quantity} = action.payload;
            const item = state.cartItems.find(i => i.id == id);
            if(item){
                item.quantity = quantity;
            }
             state.totalAmount = state.cartItems.reduce((sum,i)=> sum+ i.price * i.quantity,0)
        },
        removeCartItem : (state, action)=>{
            const id = action.payload;
           state.cartItems= state.cartItems.filter(i => i.id !== id);
            state.totalAmount = state.cartItems.reduce((sum,i)=> sum+ i.price * i.quantity,0)
            
        },

        setMyOrders : (state, action)=>{
            state.myOrders = action.payload;
        },
        addMyOrder : (state, action)=>{
            state.myOrders = [action.payload,...state.myOrders]
        },
        updateOrderStatus: (state, action)=>{
            const {orderId, shopId, status} = action.payload;
            const order = state.myOrders.find(o => o._id == orderId);
            if(order){
                if(order.shopOrders && order.shopOrders.shop._id == shopId){
                    order.shopOrders.status = status;
                }
            }
        },
        updateRealTimeOrderStatus : (state,action)=>{
             const {orderId, shopId, status} = action.payload;
            const order = state.myOrders.find(o => o._id == orderId);
            if(order){
               const shopOrder = order.shopOrders.find(so => so.shop._id == shopId);
               if(shopOrder){
                shopOrder.status = status;
               }
            }
        }
        ,
        setSearchItems : (state, action)=>{
            state.searchItems = action.payload
        },
        setSocket : (state, action)=>{
            state.socket = action.payload
        }


        
    }
});

export const {setUserData,setCurrentCity,setCurrentState,setCurrentAddress,setShopInMyCity,setItemInMyCity,addToCart,updateQuantity, removeCartItem, setMyOrders,addMyOrder,updateOrderStatus,setSearchItems,setSocket,updateRealTimeOrderStatus} = userSlice.actions
export default userSlice.reducer;
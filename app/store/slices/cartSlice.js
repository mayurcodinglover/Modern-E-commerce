import {createSlice} from '@reduxjs/toolkit';

const initialState={
    items:[],
    itemCount:0,
    cartTotal:0,
    loading:false,
}

function recalculateCart(state){
    state.itemCount=state.items.reduce((total,item)=>total+item.quantity,0);
    state.cartTotal=state.items.reduce((total,item)=>total+item.totalPrice,0);
}



const cartSlice=createSlice({
    name:"cart",
    initialState,
    reducers:{
        setCart:(state,action)=>{
            state.items=action.payload.data;
            state.itemCount=action.payload.summary.itemCount;
            state.cartTotal=action.payload.summary.cartTotal;
        },
        addItemLocally:(state,action)=>{
            const existing=state.items.find((item)=>item.productVariantId===action.payload.productVariantId);

            if(existing)
            {
                existing.quantity+=action.payload.quantity;
                existing.totalPrice = existing.quantity * Number(existing.unitPrice);
            }
            else{
                state.items.push(action.payload);
            }
             recalculateCart(state);
        },
         updateItemQuantity: (state, action) => {
      const { cartItemId, quantity } = action.payload;

      const item = state.items.find(
        (item) => item.id === cartItemId
      );

      if (!item) return;

      item.quantity = quantity;
      item.totalPrice = quantity * Number(item.unitPrice);

      recalculateCart(state);
    },
       removeItemLocally: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );

      recalculateCart(state);
    },
        clearCart:(state)=>{
            state.items=[];
            state.itemCount=0;
            state.cartTotal=0;
        },
        setLoading:(state,action)=>{
            state.loading=action.payload;
        }
    }
});

export const {
  setCart,
  addItemLocally,
  removeItemLocally,
  updateItemQuantity,
  clearCart,
  setLoading,
} = cartSlice.actions;

export default cartSlice.reducer;
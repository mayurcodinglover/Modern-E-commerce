import {createSlice} from '@reduxjs/toolkit';

const initialState={
    items:[],
    itemCount:0,
    cartTotal:0,
    loading:false,
}

const cartSlice=createSlice({
    name:"cart",
    initialState,
    reducers:{
        setCart:(state,action)=>{
            state.items=action.payload.items;
            state.itemCount=action.payload.summary.itemCount;
            state.cartTotal=action.payload.summary.cartTotal;
        },
        addItemLocally:(state,action)=>{
            const existing=state.items.find((item)=>item.productVariantId===action.payload.productVariantId);

            if(existing)
            {
                existing.quantity+=action.payload.quantity;
            }
            else{
                state.items.push(action.payload);
            }
        },
        removeItemLocally:(state,action)=>{
            state.items=state.items.filter((item)=>item.productVariantId!==action.payload.productVariantId);
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
  clearCart,
  setLoading,
} = cartSlice.actions;

export default cartSlice.reducer;
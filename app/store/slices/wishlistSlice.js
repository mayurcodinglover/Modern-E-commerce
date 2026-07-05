import { createSlice } from "@reduxjs/toolkit";

const initialState={
    items:[],
    count:0,
};

const wishlistSlice=createSlice({
    name:'wishlist',
    initialState,
    reducers:{
        setWishlist:(state,action)=>{
            state.items=action.payload,
            state.count=action.payload.length;
        },
        addToWishlistLocally:(state,action)=>{
            state.items.push(action.payload);
            state.count+=1;
        },

        removeFromWishlistLocally:(state,action)=>{
            state.itesm=state.items.filter((item)=>item.id!==action.payload);
            state.count-=1;
        },
    },
});

export const {
    setWishlist,
    addToWishlistLocally,
    removeFromWishlistLocally
}=wishlistSlice.actions;
export default wishlistSlice.reducer;
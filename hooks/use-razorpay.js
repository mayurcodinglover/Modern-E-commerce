import { useEffect, useState } from "react";
export function useRazorpay(){
    const [isLoaded,setIsLoaded] = useState(false);

    useEffect(()=>{
        if(window.Razorpay){
            setIsLoaded(true);
            return;
        }

        //Load Razorpay script
        const script=document.createElement("script");
        script.src="https://checkout.razorpay.com/v1/checkout.js";
        script.async=true;
        script.onload=()=>setIsLoaded(true);
        script.onerror = () => console.error("Razorpay script failed to load");
        document.body.appendChild(script);

        return ()=>{
            document.body.removeChild(script);
        };
    },[]);
    return isLoaded;
}
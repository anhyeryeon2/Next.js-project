"use server";
import {z} from "zod";
import validator from "validator";
import { redirect } from "next/navigation";

const phoneSchema = z.string().trim().refine((phone)=> validator.isMobilePhone(phone,"ko-KR"),"Wrong phone format"
);

const tokenSchema = z.coerce.number().min(100000).max(999999);
//formData로 받은 string을 줄테니 coerce강제로 number로 바꿔라


interface ActionState {
    token:boolean
}
export async function smsLogin(prevState : ActionState ,formData:FormData){
    const phone = formData.get("phone");
    const token = formData.get("token");
    if(!prevState.token){
        const result = phoneSchema.safeParse(phone);
        if(!result.success){
            console.log(result.error.flatten());
            return{
                token:false,
                error:result.error.flatten(),
            };
        }else{
            return{
                token:true,
            };
        }
    }else{
        //token을 받고 있을때
        const result = tokenSchema.safeParse(token);
        if(!result.success){
            return{
                token:true,
                error:result.error.flatten()
            };
        }else{
            redirect("/");
            
        }

    }
}


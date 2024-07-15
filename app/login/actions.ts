"use server";

import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_REGEX_ERROR } from "@/lib/constants";
import db from "@/lib/db";
import {z} from "zod";
import bcrypt from "bcrypt";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";


const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  // if(user){
  //   return true
  // } else {
  //   return false
  // }
  return Boolean(user);
};



const formSchema = z.object({
  email: z.string().email().toLowerCase().refine(checkEmailExists, "An account with this email does not exist."),
  password: z
    .string({
      required_error: "Password is required",
      //password가 없는경우 메세지 
    })
    // .min(PASSWORD_MIN_LENGTH)
    // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export async function logIn(prevState: any, formData: FormData) {
  const data ={
    email:formData.get("email"),
    password:formData.get("password"),
  };
  const result = await formSchema.spa(data);
  if (!result.success) {
    // console.log(result.error.flatten());
    return result.error.flatten();
  } else {
    // 사용자 찾아졌을때, 비밀번호 해시값 확인
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });
    const ok = await bcrypt.compare(
      result.data.password,
      user!.password ?? ""
    );

    // compare은 사용자가 작성한 비번을 받는다. 
    // 그리고 그걸 db의 해시값과 비교
    //user! 느낌표로 prisma에게 user가 확실히 존재한다고
    //문제는 password가 null일수 있다는것 
    // ??""로 user가 pw를 가지지 않는다면, 빈문자와 비교
    if(ok){
      // 로그인 시킨다. 세션 필요
      const session = await getSession();
      session.id = user!.id;
      await session.save();
      redirect("/profile");

    }else {
      // 비밀번호가 맞지 않을때는 
      return {
        fieldErrors: {
          password: ["Wrong password."],
          email: [],
        },
      };
    }
  }
}
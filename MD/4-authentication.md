# 8

### validation 성공했으면 어떻게 해야할까

사용자가 제출한 email이랑 username이랑 
db에 없느지 확인해야한다.

두가지는 고유해야하기 때문에 먼저확인해야한다.

``` tsx
const result = formSchema.safeParse(data);
    if(!result.success){
        return result.error.flatten();
    }else{
      //검증 성공했다면
      // username이 이미 존재하는지 확인하자
      // email이 이미 사용되는지 확인
      // 비밀번호 해싱하기
      // 마지막으로 사용자 데베에 저장
      // 저장되면 로그인시켜줌
      //redirect " /home"

    }
    
```


``` ts

    const result = formSchema.safeParse(data);
    if(!result.success){
        return result.error.flatten();
    }else{
      //검증 성공했다면
      // username이 이미 존재하는지 확인하자
      const user =await db.user.findUnique({
        where:{
          username:result.data.username,
        },
        // db에 요청할 데이터를 결정할 수 있다. 불필요하게 다x
        select:{
            id:true,
        },
      });
      console.log(user);
      if(user){
        //null이여야하는데 사용자가 있다면 에러표시
      }



      // email이 이미 사용되는지 확인
    // null이여야함. 똑같은 email가질수 없다
      const userEmail = await db.user.findUnique({
        where:{
          email:result.data.email
        },
        select:{
          id:true,
        },
      });
      if(userEmail){
        //show error
      }
      // 비밀번호 해싱하기
      // 마지막으로 사용자 데베에 저장
      // 저장되면 로그인시켜줌
      //redirect " /home"
    }
    
   
}
```


` return !Boolean(user);` 

: user 가 발견되면 false가 되도록 



만든 체크 함수 모두 async,await 를 가지고있다. 

zod도  await하도록 해야하는데 

> 데이터베이스 조회 결과를 기다려야 하기 때문에 async 함수가 필요.

-  async 함수는 Promise를 반환하며, 비동기 작업에 대한 완료를 기다림
-  await는 Promise의 결과가 나올 때까지 함수의 실행을 일시 중지하며, 
    
    비동기 작업의 결과를 동기적으로 처리할 수 있게 해 줍니다.

    -  코드가 비동기 작업의 완료를 기다린 후에 결과를 순차적으로 처리



따라서 `safeParse`를 async로 적어야줘야한다.
``` ts
   const result = await formSchema.safeParseAsync(data);
```

-> db를 통해서 유효성 검사를 할 수 있었다. 

### 비밀번호 해싱

해싱은 유저가 보낸 비밀번호를 변환하는것
- 단방향 
- 무작위 문자열로 암호화

npm i bcrypt

npm i @types/bcrypt

``` ts
} else {
    // 비밀번호 해싱하기
    const hashedPassword = bcrypt.hash(result.data.password,12)
    // 두번째 인자는 얼마나 해시알고리즘을 돌릴지 설정 -> 해시 보안 강화 
    
  }
}
```


``` ts 
 } else {
    // 비밀번호 해싱하기
    const hashedPassword =await bcrypt.hash(result.data.password,12)
      // 비밀번호 해싱 후  사용자 데베에 저장
      const user = await db.user.create({
        data: {
          username: result.data.username,
          email: result.data.email,
          password: hashedPassword,
        },
        //create 했다는 것 id만 받아도 되서 select로 
        select: {
          id: true,
        },
      });
      // 저장되면 로그인시켜줌
      //redirect " /home"
  }
}

```


### 사용자를 로그인 시킨다는건 뭘까..
 = 사용자에게 쿠키를 준다는거

 데이터를 무작위로 바꿔서 쿠키에 담을거다

 - 쿠키를 주고 다음번에 사용자가 무언가를 한다면
 - 페이지 이동하려고하면, 
 - 브라우저는 우리에게 (우리가 사용자에게 줬던 ) 쿠키를 보낸다.
 - =>" 이 페이지로 이동하려는 사람은 id 6번 사용자구나"를 알수있다.

https://www.youtube.com/watch?v=tosLBcAX1vk


iron session이라는 패키지를 쓸거다

npm i iron-session

``` ts
// db저장되면 로그인시켜줌

        // iron session의 초기설정 
       const session = await getIronSession(cookies() ,{
        cookieName: "coo",
        // 비번은 깃헙 기록에 남아있으면 안된다. -> .env에 넣기  
        password:process.env.COOKIE_PASSWORD!
      })
      //첫번째 인자는 사용자에게 받는 쿠키

```

session은 우리가 쿠키에 넣고싶은 정보 저장

``` ts
 const cookie = await getIronSession(cookies() ,{
        cookieName: "coo",
        password:process.env.COOKIE_PASSWORD!
      });
      // 위는 사용자에게 쿠키 가져오기 


      //@ts-ignore
      cookie.id = user.id
      // prisma로 받는 userid를 cookie에 넣었음

      // 저장 
      await cookie.save()


```
@ts-ignore을 추가해서 TS가 다음 한줄을 무시하게만든다.


저장까지하고 나면 

iron session이 데이터를 암호화한다.


쿠키내용을 lib 폴더안에 넣자

타입스크립트에게 우리의 cookie를 설명하기위해
``` ts
interface SessionContent {
  id?: number;
}

```
?가 있는 이유는 세션에 id가 없을 수도 있기 때문
- 쿠키에 id가 없을 수도

로그인한 사용자만 쿠키에 id를 가지고있어서


### 이메일과 비밀번호로 로그인하는 기능

해싱된 비밀번호와,

사용자가 보낸 비밀번호 비교
'
login/ action.ts

``` ts
"use server";

import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_REGEX_ERROR } from "@/lib/constants";
import {z} from "zod";

const formSchema = z.object({
  email: z.string().email().toLowerCase(),
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
  const result = formSchema.safeParse(data);
  if (!result.success) {
    // console.log(result.error.flatten());
    return result.error.flatten();
  } else {
    // 이메일로 유저찾기
    // 비밀번호 맞는지 확인
    // 사용자 찾아졌을때, 비밀번호 해시값 확인
    // 로그인 
    // profile로 보내기
    


  }
}
```
 // 이메일로 유저찾기
 에서 checkEmailExists 함수를 만들어
 ``` ts
 
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
```
이함수가 
이메일을 가진 use가 db에 존재한다면,
- true를 리턴해서 에러를 보여주지 않는다. 

그다음 safeParse를 safeParseAsync로 바꿔야한다.

``` ts
  const result = formSchema.safeParse(data);


const result = await formSchema.spa(data);
```

// 사용자 찾아졌을때, 비밀번호 해시값 확인
이것도 마찬가지로..

``` ts
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
```

compare의 첫번째인자는 : 작성한 값
두번째 인자는 해시 값


### superRefine

refine과 동일한데 더빨리 돌아올 수 있다.
- 다른 모든 검사들을 중단시켜서

db를 한번만 호출해보자

``` ts
const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "Username must be a string!",
        required_error: "Where is my username???",
      })
      .toLowerCase()
      .trim()
       // .transform((username) => `🔥 ${username} 🔥`)
       .refine(checkUsername, "No potatoes allowed!")
       .refine(checkUniqueUsername, "This username is already taken"),
```


checkUniqueUsername, checkUniqueEmail를 삭제하고

object 를 refine 하면됨 
``` ts
.superRefine(async ({ username }, ctx) => {
  ```
  첫번째 인자는 현재 refine하고있는 data
  두번째는 에러묶음
- 에러를 ctx에 추가가능 (context)


``` ts
.superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      //에러를 보여주기 위한 자리 
      ctx.addIssue({
        //addissue로 유효성 검사에서 에러추가하느 방법
        code: "custom",
        message: "This username is already taken", //이미사용중
        path: ["username"], //에러 발생시킨 필드 어딘지 
        fatal: true, // 치명적이라고 설정 
      });
      return z.NEVER;
      // fatal이랑 z.NEVER 추가하면 위에서 실패하면 미리 중단해줌 
      // 그 뒤에 다른 refine있어도 실행되지 않음

    }
  })


  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      // 주어진 이메일로 db에서 사용자 찾는다. 
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      // 사용자가 존재하면/ 이미사용중이라면 
      ctx.addIssue({
        code: "custom",
        message: "This email is already taken",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
      // 오류가 발생하면 z.NEVER반환하여 검증 중단. 
    }
  })
  ```
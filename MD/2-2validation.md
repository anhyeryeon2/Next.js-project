# 6.6

이제 로그인을 검증해보자

login/action.tsx
``` tsx
"use server";

import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX, PASSWORD_REGEX_ERROR } from "@/lib/constants";
import {z} from "zod";

const formSchema = z.object({
    //3️⃣ 조건 폼스키마 만들기 
  email: z.string().email().toLowerCase(),
  password: z
    .string({
      required_error: "Password is required",
      //password가 없는경우 메세지 
    })
    .min(PASSWORD_MIN_LENGTH)
    .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export async function logIn(prevState: any, formData: FormData) {
  const data ={
    email:formData.get("email"),
    password:formData.get("password"),
  };
  //1️⃣ 로그인에서 필요한거 먼저 추출. 2️⃣page.tsx에서 name 있는지, 변수명같은지 확인

  const result = formSchema.safeParse(data);
  if (!result.success) {   //4️⃣ safeParse로 검증. if 검증하지 못했다면
    console.log(result.error.flatten());
    return result.error.flatten();
  } else {
    console.log(result.data);
  }
}
```



login/ page.tsx
``` tsx
...
      <form action={action} className="flex flex-col gap-3">
        <FormInput 
          name="email"
          type="email"
          placeholder="Email"
          required
          ✨ errors={state?.fieldErrors.email}
          
        />
        <FormInput
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={PASSWORD_MIN_LENGTH}
        ✨ errors={state?.fieldErrors.password}

        />
        <FormButton text="Log in" />
      </form>
      <SocialLogin />
    </div>

```
### errors={state?.fieldErrors.password}는 무엇이고 fieldErrors는 어디서 나왔지??

fieldErrors는
const [state, action] = useFormState(logIn, null);
에서 첫번째값의 state는 상태객체인데,
상태객체는 다음과같은 구조를 갖는다.
``` tsx
{
  fieldErrors: {
    email: "Invalid email address",
    password: "Password must be at least 8 characters"
  },
  // 다른 상태 프로퍼티들...
}

```
 `{state?.fieldErrors.password}` 는 폼 상태 객체에서 password 필드 가져와 

 -> FormInput 컴포넌트의 errors prop으로 전달



### 그다음 SMS를 해보자

sms 를 하기위해 actions.ts를 만들고
아래의 코드를 먼저 적어준다.
``` tsx
"use server";

export async function smsVerification(prevState : any ,formData:FormData){

}


```
#### 여기서 prevState : any는 뭐지
prevState:any
- any는 TypeScript에서 함수의 매개변수 prevState의 타입을 any 지정
-  여기서 any는 TypeScript의 타입 중 하나로, 어떤 타입이든 허용 따라서 
   - prevState는 어떤 타입의 값이든 받을 수 있


(다음에 다시 제대로 다룸 )


# 6.7

``` tsx
"use server";
import {z} from "zod";
import validator from "validator";

const phoneSchema = z.string().trim().refine(validator.isMobilePhone);

const tokenSchema = z.coerce.number().min(100000).max(999999);
//formData로 받은 string을 줄테니 coerce강제로 number로 바꿔라

export async function smsLogin(prevState : any ,formData:FormData){

}

```

[Coerce]
Zod는 coerce를 이용하여 값의 타입을 강제할 수 있습니다.
모든 원시 타입이 지원되며, 아래와 같이 작동됩니다.
```
z.coerce.string(); // String(input)
z.coerce.number(); // Number(input)
z.coerce.boolean(); // Boolean(input)
```
# 6.8

우리의 첫 (~~이제야 첫..?~~) interactive form을 만들어볼것이다.

못 본 척 했던 prevState를 제대로 파보자

그전에 refine method 복습

아ㅏㅏㅏ흠


```  tsx
const phoneSchema = z.string().trim().refine(validator.isMobilePhone);
```
은 아래와 완전 똑같다.
``` tsx
const phoneSchema = z.string().trim().refine(phone => validator.isMobilePhone(phone));

```
한국 번호만 받고싶으면
아래처럼

``` tsx
const phoneSchema = z.string().trim().refine((phone)=> validator.isMobilePhone(phone,"ko-KR"),"Wrong phone format"
);
```


이제 prevState

useFormState를 사용할떄 
- 첫번째 argumant는 실행하고 싶은 action이고
- 두번째는 useFormState hook의 initial state였다.

이 initial state는 , 이함수를 최초 호출할 때의 prevState의 값이 된다

> 함수를 처음으로 호출할때, prevState는 여기에 initial state로 넣은 값과 같다 


``` tsx
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useFormState } from "react-dom";
import { smsLogin } from "./actions";

const initialState ={
  1️⃣ token:false,
  error:undefined,
};

export default function SMSLogin() {
  const [state,dispatch]=useFormState(smsLogin,initialState);
  //1️⃣ 페이지가 ㅏ처음 render되면 state.token의 값으 false가 된다.
  // 2️⃣=> 그 건 input을 숨기는데 사용할 수도@@
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">SMS Log in</h1>
        <h2 className="text-xl">Verify your phone number.</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <Input
          name="phone"
          type="text"
          placeholder="Phone number"
          required
          errors={state.error?.formErrors}
        />
        2️⃣{state.token?( <Input
        name="token"
          type="number"
          placeholder="Verification code"
          required
          min={100000}
          max={999999}
        />):null}
        <Button text="Verify" />
      </form>
    </div>
  );
}
```



그러고 인터페이스를 만들어준다. 

``` tsx
...


// 1️⃣ 인터페이스 만들고 
interface ActionState {
    token:boolean
}

export async function smsLogin(prevState : ActionState ,formData:FormData){
  //2️⃣ 데이터 가져오기 
    const phone = formData.get("phone");
    const token = formData.get("token");
    if(!prevState.token){
      // 🟡3️⃣prevState.token이 false이면 이 action을 처음 호출했다는거
      // false 라면 d유저가 전번만 입력했다는거 
        const result = phoneSchema.safeParse(phone); // 전번 검증
        if(!result.success){
            console.log(result.error.flatten());
            return{
                token:false,
            };
            // 잘못된 전번 입력하면 token false되서 다음단계로 못넘어감

        }else{
            return{
                token:true,
            };
        }
      }else{
        🟡//token을 받고 있을때
        const result = tokenSchema.safeParse(token);  //토큰 검증 
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


```
위의 검증에서 
//token false 를 return한다는것은 이 값이 
``` tsx
 const [✨state,dispatch]=useFormState(smsLogin,initialState);
```
여기의 state가 된다는 것이고, 
그렇게되면 token input이 보이지 않게됨


``` tsx
f(!prevState.token){
        const result = phoneSchema.safeParse(phone);
        if(!result.success){
          //굳이 이렇게 !result.success로 반대로 적은이유가 
          // initialState의 값이 token이 false로 처음에 없어야하기 때문에
          // if 로 들어오면 true가 되고 전번-> 토큰 검증이 가능하게 됨

            console.log(result.error.flatten());
            return{
                token:false,
            };
        }else{
            return{
                token:true,
            };
        }
    }else
```


근데 smsLogin함수를 두번째로 호출하면
- prevState 이전상태는 token true가 된다.

> SMSlogin을 다시 호출하면 전에 리턴했던 값이 prevState가 된다

=> 함수가 이전에 return했던 값이  그 다음번 함수를 다시 호출했을 때의 prevState로 들어감



그리고

refine 은 또다른 argument를 가질 수있다. message
``` tsx
const phoneSchema = z.string().trim().refine((phone)=> validator.isMobilePhone(phone,"ko-KR"),✨"Wrong phone format"
);
```

# 6.9 
recap
((다음섹션 부터는 속도는 내서 prisma랑 planet scale을 다룰예정))

지금은 복습


``` tsx
"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { useFormState } from "react-dom";
import { smsLogin } from "./actions";

const initialState ={
  token:false,
  error:undefined,
};
// 1️⃣우선 initialState를 설정하고


export default function SMSLogin() {
  const [state,dispatch]=useFormState(smsLogin,initialState);
  // 2️⃣2번재 요소는 smsLogin 함수의 prevState로 전달이됨 => 함수 처음 호출했을때 

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">SMS Log in</h1>
        <h2 className="text-xl">Verify your phone number.</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <Input
          name="phone"
          type="text"
          placeholder="Phone number"
          required
          errors={state.error?.formErrors}
        />
        {state.token?( <Input
        name="token"
          type="number"
          placeholder="Verification code"
          required
          min={100000}
          max={999999}
        />):null}
        <Button text="Verify" />
      </form>
    </div>
  );
}
```

action.ts
``` tsx
"use server";
import {z} from "zod";
import validator from "validator";
import { redirect } from "next/navigation";

const phoneSchema = z.string().trim().refine((phone)=> validator.isMobilePhone(phone,"ko-KR"),"Wrong phone format"
);

const tokenSchema = z.coerce.number().min(100000).max(999999);

interface ActionState {
    token:boolean
}
export async function smsLogin(prevState : ActionState ,formData:FormData){
    const phone = formData.get("phone");
    const token = formData.get("token");
    // 3️⃣formData에서 데이터 가져오기 
    if(!prevState.token){
        const result = phoneSchema.safeParse(phone);
        if(!result.success){
            console.log(result.error.flatten());
            return{
                token:false,
            };
        }else{
            return{
                token:true,
            };
            // 4️⃣ 검증에 따라 return 되는 값이 page.tsx의 state가 된다. 
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


```


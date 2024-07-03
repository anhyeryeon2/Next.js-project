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
prevState: any는 TypeScript에서 함수의 매개변수 prevState의 타입을 any로 지정하는 구문입니다. 여기서 any는 TypeScript의 타입 중 하나로, 어떤 타입이든 허용된다는 것을 의미합니다. 따라서 prevState는 어떤 타입의 값이든 받을 수 있습니다.


prevState는 함수 smsVerification에 전달되는 첫 번째 인자로, 보통 이전 상태를 나타냅니다. 예를 들어, 이 함수가 폼의 상태를 관리하거나 업데이트하는 데 사용된다면, prevState는 함수 호출 시점의 상태를 의미할 수 있습니다.

폼 상태를 관리할 때 이전 상태를 전달받기 위해 사용됩


# 6.7



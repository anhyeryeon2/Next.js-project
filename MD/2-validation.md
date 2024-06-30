# 6

//TODO : zod 의미 장점 서치해서 추가

1. npm i zod

2. 모든 FormInput에 name이 있어야함
  
   왜냐하면 server action에 form 데이터를 넘겨줘야하기 때문

create-account / action.ts 파일을 만들고

(page.tsx에 쓸수도 있지만, useFormStatue, useFormState를 사용할거라서 

-> 결국 use client component로 바꿔야함  )

>recap :  useFormStatue, useFormState는 사용자에게 에러메세지를 보여주길 원해서 -> interactive UI 라고 할수 있어서 client component이다



``` jsx
"use server";
import {z} from 'zod';

export async function createAccount(prevState:any,formData:FormData) {
    const data={
        username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    };
    
}
```
page.tsx에서 

``` jsx
 const [state,action] =useFormState(createAccount,null);
```
 이렇게 쓰고있으니까 useFormState르 쓰려면 use client로 상단에 적어서 바꿔줘야한다. 


 //TODO: zod하는데 왜 useFormState를 쓰지?


위와 같이 data를 가져왔는데
### zod를 사용해서 유효성 검사는 어떻게 하냐??

if를 더이상 쓰지않고
우리는 데이터가 어떤 형태여야 하는지 정의할거다

``` jsx
"use server";
import {z} from 'zod';

// const usernameSchema =z.string().min(5).max(10);
const formSchema = z.object({username :z.string().min(3).max(10),
    email :z.string().email(),
    password:z.string().min(10),
    confirm_password:z.string().min(10)
})

export async function createAccount(prevState:any,formData:FormData) {
    const data={
        username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    };
    
    const result = formSchema.safeParse(data);
    if(!result.success){
        return result.error.flatten();
    }
    
   
}
```
zod 에게 데이터의 형태나 타입을 설명할 때는  => Schema를 만든다.
- 데이터가 어떻게 생겨야하는지, 타입 등의 설계도


#6.1
 
 data object의 각 item마다 검사할 필요 없다

 z.object() 로 오브젝트 스키마를 만들 수 있

``` jsx
ex:  const User = z.object( { username: z.string() } ); 
```

``` jsx
const formSchema = z.object({username :z.string().min(3).max(10),
    email :z.string().email(), 
    // email() :  실제로 이메일 형식이 맞는지 
    password:z.string().min(10),
    confirm_password:z.string().min(10)
})
```
object 형태를 넣을 수 있다.


``` jsx
...
const result = formSchema.safeParse(data);
    if(!result.success){
        return result.error.flatten();
    }
    

```

parse는 데이터 유효성 검사가 실패하면 에러를 throw한다.

- 그래서 try catch문을 써야하는데

위 코드처럼 쓰면 에러를 리턴할 수 있다. 

error에는 많은 property와 method가 있는데

flatten 은 더 잘관리 보기 간단하다

[.parse]
data의 타입이 유효한지 검사하기 위해 .parse 메소드를 사용할 수 있습니다. 유효한 경우 데이터 전체 정보가 포함된 값이 반환됩니다. 유효하지 않은 경우, 에러가 발생합니다. 보통 try-catch 문으로 감싸서 사용한다고 합니다.
[.safeParse]
.parse를 사용할 때 타입이 유효하지 않은 경우 Zod가 에러를 발생시키는 것을 원하지 않는다면, .safeParse를 사용하면 됩니다.
데이터가 유효한 경우 true값의 success와 데이터 정보가 담긴 data를 반환합니다.
유효하지 않은 경우에는 false값의 success와 에러 정보가 담긴 error를 반환합니다.


# 6.2


``` jsx
const formSchema = z.object({username :z.string().min(3).max(10),
    email :z.string().email(),
    password:z.string().min(10),
    confirm_password:z.string().min(10)
})

```

username을 보면
string이 올거라고 예상한다는건 그값이 필수라는것

required가 되는것을 원치 않으면
``` optional()```을 붙인다.

``` jsx
username :z.string(
    {invalid_type_error:"username은 string이여야한다",
    required_error:"내 username어디 있나요??"})
    .min(3,"너무 짧아~~~" ).max(10, "10보다너무길어~~~~"),
```

문자열 스키마를 만들 때 몇 가지 오류 메시지를 지정할 수 있다.

### 우리가 직접 만든 로직으로 필드를 검증하는 방법

username에 "potato"라는 단어가 포함되는것을 허용하지 않는다고하면

.refine() 을 사용해라
``` jsx
username :z.string(
    {invalid_type_error:"username은 string이여야한다",
    required_error:"내 username어디 있나요??"})
    .min(3,"너무 짧아~~~" ).max(10, "10보다너무길어~~~~")
    .refine((username) => true, "customn error")
```

true하면 에러가 안보이고, false면 커스텀 에러가 보임

potato로 적용하면

``` jsx
    .refine((username) => !username.includes("potato") , "No potatoes allowed!"),
```

refine 안에 함수가 true를 리턴하면 문제없음



### password와 confirm_password가 동일한지 검증

둘다 검증하려면 refine 위치를 바꿔야함 
``` jsx
const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "Username must be a string!",
        required_error: "Where is my username???",
      })
      .min(3, "Way too short!!!")
      .max(10, "That is too looooong!")
      .refine(
        (username) => !username.includes("potato"),
        "No potatoes allowed!"
      ),
    email: z.string().email(),
    password: z.string().min(10),
    confirm_password: z.string().min(10),
  }) .refine(({password, confirm_password})=>password === confirm_password, "두개는 같아야한다!" )
```

에러 위치가 잘못 인지하기 때문에

confirm_password라는 특정 필드에 속한것이라고 알려줘야한다.

``` jsx
.superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "Two passwords 는 같아야해!!!! ",
        path: ["confirm_password"],
        //에러 주인이 누구인지 path로
      });
    }
  });
```
object 전체를 refine한 다음에 그중 에러메세지를 발생시킬 주인을 정한다.


#6.3

zod를 사용해서 데이터를 transform 하는 방법

zod는 데이터를 검증하는것 뿐만아니라 변환하는것도 가능


``` jsx
const passwordRegex = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*?[#?!@$%^&*-]).+$/
);

``` 
비밀번호가 소, 대문자, 숫자, 특수문자 일부를 포함하고 있는지 검사


[.regax]
정규표현식으로 데이터 검증을 할 수 있습니다.

[.toLowerCase]
String 타입의 데이터를 모두 소문자로 변환해줍니다.
[.trim]
String 타입의 데이터에서 맨앞과 뒤에 붙은 공백을 제거해줍니다.
[.transform]
이 메서드를 이용하면 해당 데이터를 변환할 수 있습니다.
예시: .transform((username) => `🔥 ${username} 🔥`)
# 6

//TODO : zod 의미 장점 서치해서 추가

zod : JavaScript와 TypeScript에서 사용하는 타입 선언 및 검증 라이브러리
 이 라이브러리를 통해 데이터를 정의하고, 검증하며, 필요한 경우 변형할 수 있습니다. 주로 폼 데이터나 API 응답을 검증하는 데 사용됩니다.

장점: 직관적인 스키마 정의,TypeScript와의 완벽한 호환성

1. npm i zod

2. 모든 FormInput에 name이 있어야함

   왜냐하면 server action에 form 데이터를 넘겨줘야하기 때문

create-account / action.ts 파일을 만들고

(page.tsx에 쓸수도 있지만, useFormStatue, useFormState를 사용할거라서

-> 결국 use client component로 바꿔야함 )

>  useFormStatue, useFormState는 사용자에게 에러메세지를 보여주길 원해서 -> interactive UI 라고 할수 있어서 client component이다

```jsx
"use server";
import { z } from "zod";

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };
}
```

page.tsx에서

```jsx
const [state, action] = useFormState(createAccount, null);
```

이렇게 쓰고있으니까 useFormState르 쓰려면 use client로 상단에 적어서 바꿔줘야한다.

 ### zod하는데 왜 useFormState를 써야하지??

useFormState를 사용하는 이유는 주로 폼 상태를 효율적으로 관리하고, 폼 입력 값과 검증 결과를 실시간으로 추적하기 위해서입니다.

1. useFormState를 사용하면 사용자가 입력할 때마다 Zod 스키마를 통해 입력 값을 실시간으로 검증-> 즉각 피드백가능
2. 상태 관리
3.  Zod의 검증 결과를 useFormState와 결합하면, 검증 에러를 폼 상태에 쉽게 저장하고, 이를 기반으로 사용자에게 적절한 에러 메시지를 표시할 수 있습니다.
4. 리렌더링 최적화: useFormState는 필요한 경우에만 컴포넌트를 리렌더링하므로, 폼 상태 관리가 효율적입니다



### zod를 사용해서 유효성 검사는 어떻게 하냐??

if를 더이상 쓰지않고
우리는 데이터가 어떤 형태여야 하는지 정의할거다

```jsx
"use server";
import { z } from "zod";

// const usernameSchema =z.string().min(5).max(10);
const formSchema = z.object({
  username: z.string().min(3).max(10),
  email: z.string().email(),
  password: z.string().min(10),
  confirm_password: z.string().min(10),
});

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const result = formSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  }
}
```

zod 에게 데이터의 형태나 타입을 설명할 때는 => Schema를 만든다.

- 데이터가 어떻게 생겨야하는지, 타입 등의 설계도

#6.1

data object의 각 item마다 검사할 필요 없다

z.object() 로 오브젝트 스키마를 만들 수 있다

```jsx
ex:  const User = z.object( { username: z.string() } );
```

```jsx
const formSchema = z.object({
  username: z.string().min(3).max(10),
  email: z.string().email(),
  // email() :  실제로 이메일 형식이 맞는지
  password: z.string().min(10),
  confirm_password: z.string().min(10),
});
```

object 형태를 넣을 수 있다.

```jsx
...
const result = formSchema.safeParse(data);
    if(!result.success){
        return result.error.flatten();
    }


```

parse는 데이터 유효성 검사가 실패하면 에러를 throw 한다.

- 그래서 try catch문을 써야하는데

=> 위 코드처럼 .safeParse 쓰면 에러를 return 할 수 있다.

콘솔에 뜨는 error에는 많은 property와 method가 있는데

flatten 은 더 잘관리 보기 간단하다

[.parse]
- data의 타입이 유효한지 검사하기 위해 
- 유효한 경우 데이터 전체 정보가 포함된 값이 반환-
- 유효하지 않은 경우, 에러가 발생
- 보통 try-catch 문으로 감싸서 사용-

[.safeParse]
- .parse를 사용할 때 타입이 유효하지 않은 경우 에러를 발생시키는 것을 원하지 않는다면, 
- .safeParse를 사용하자
- 데이터가 유효한 경우 true값의 success와 데이터 정보가 담긴 data를 반환
- 유효하지 않은 경우에는 false값의 success와 에러 정보가 담긴 error를 반환

# 6.2

```jsx
const formSchema = z.object({
  username: z.string().min(3).max(10),
  email: z.string().email(),
  password: z.string().min(10),
  confirm_password: z.string().min(10),
})
```

username을 보면
string이 올거라고 예상한다는건 그값이 필수라는것

required가 되는것을 원치 않으면
` optional()`을 붙인다.

```jsx
username :z.string(
    {invalid_type_error:"username은 string이여야한다",
    required_error:"내 username어디 있나요??"})
    .min(3,"너무 짧아~~~" ).max(10, "10보다너무길어~~~~"),
```
invalid_type_error :다른 타입이 입력되었을 때.
required_error : 필드가 비어 있을 때.


문자열 스키마를 만들 때 몇 가지 오류 메시지를 지정할 수 있다.

### 우리가 직접 만든 로직으로 필드를 검증하는 방법

username에 "potato"라는 단어가 포함되는것을 허용하지 않는다고하면( 커스텀 하려고하면)

.refine() 을 사용해라

```jsx
username: z.string({
  invalid_type_error: "username은 string이여야한다",
  required_error: "내 username어디 있나요??",
})
  .min(3, "너무 짧아~~~")
  .max(10, "10보다너무길어~~~~")
  ✨.refine((username) => true, "customn error");
```

true하면 에러가 안보이고, false면 커스텀 에러가 보임

potato로 적용하면

```jsx
    .refine((username) => !username.includes("potato") , "No potatoes allowed!"),
```

refine 안에 함수가 true를 리턴하면 문제없음

### password와 confirm_password가 동일한지 검증

둘다 검증하려면 refine 위치를 바꿔야함

```jsx
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
  })
  ✨.refine(
    ({ password, confirm_password }) => password === confirm_password,
    "두개는 같아야한다!"
  );
```

에러 위치가 잘못 인지하기 때문에

confirm_password라는 특정 필드에 속한것이라고 알려줘야한다. => path로 

```jsx
.superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "Two passwords 는 같아야해!!!! ",
        ✨path: ["confirm_password"],
        //에러 주인이 누구인지 path로
      });
    }
  });
```

🔥object 전체를 refine한 다음에 그중 에러메세지를 발생시킬 주인을 정한다.

# 6.3

zod를 사용해서 데이터를 transform 하는 방법

#### zod는 데이터를 검증하는것 뿐만아니라 변환하는것도 가능

```jsx
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

# 6.4

<refactor>

typescript에게 FormInput이 props뿐만 아니라
input이 받을 수 있는 모든 attribute 도 props로 받을 수 있음

```jsx
interface FormInputProps {
  type: string;
  placeholder: string;
  required: boolean;
  errors?: string[];
  name: string;
}

export default function FormInput({
  type,
  placeholder,
  required,
  errors = [],
  name,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <input
        name={name}
        className="bg-transparent rounded-md w-full h-10 focus:outline-none ring-1 focus:ring-2 ring-neutral-200 focus:ring-orange-500 border-none placeholder:text-neutral-400"
        type={type}
        placeholder={placeholder}
        required={required}
      />
      {errors?.map((error, index) => (
        <span className="text-red-500 font-medium">{error}</span>
      ))}
    </div>
  );
}
```

방법은

우리의 FormInput은 FormInputProps를 props로 받는데

거기에 추가로 적고 "& InputHTMLAttibutes<HTMLInputElement>" 

```jsx
export default function FormInput({type,placeholder,required,errors=[],name}:FormInputProps & InputHTMLAttibutes<HTMLInputElement>)

```

- input이 받을 수 있는 모든 attributes 또한 받을 수 있다고 한것

> 우리가 원하는 것은 FormInput 컴포넌트가 기본 props뿐만 아니라 <input> 요소가 받을 수 있는 모든 속성도 함께 받을 수 있도록 만드는 것입니다. 이렇게 하면 더 유연한 컴포넌트를 만들 수 있습니다. 이를 위해 TypeScript의 & 연산자를 사용하여 기본 props와 <input> 요소의 속성을 결합할 수 있습니다.

```jsx
interface FormInputProps {
  type: string;
  placeholder: string;
  required: boolean;
  errors?: string[];
  name: string;
}

//이것들을 아래처럼 해. 
// why? input이 받는 attribute에 있는것들이라서

interface FormInputProps {
  errors?: string[];
  name: string;
}
```

그리고나서 나머지것들을 rest를 통해 한번에 props를 가져온다

```jsx

interface FormInputProps{
    errors?:string[];
    name: string;
    ...rest
}


```

우리가 할 일은 ,
컴포넌트 name과 errors배열이 필요하고

나머지는 input의 attributes가 될거라고 적어주기만 하ㄷ면돼@@@

- 인터페이스 확장: FormInputProps를 확장하여 InputHTMLAttributes<HTMLInputElement>와 결합했습니다.
- props 전달: 나머지 props를 ...rest를 통해 <input> 요소에 전달했습니다.
- 결과: FormInput은 이제 <input> 요소가 받을 수 있는 모든 속성을 받을 수 있습니다.

=> 더 유연하고 재사용 가능한 컴포넌트를 만들 수 있습니다.

# 6.5 RECAP

zod에 대해 배웠던 내용 복습해보자

```jsx
export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirmpassword"),
  };

  const result = formSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  }
}
```

유저가 form에 입력한 데이터인 formData와 함꼐 호출된다
-> form에서 받아온 데이터를 data object에 넣고있다. 

@@기억해야할건 
``` jsx
username: formData.get("username"),
    email: formData.get("email"),
  ```
  여기서 username,email, password ...라는 string은 
  ✨Input의 name을 참조하고있다. 


``` jsx
<Input
          name="username"
```
Input에 name을 지정하고 get으로 불러올때는 name값과 동일해야한다

그리고 password랑 confirm password랑 같은지확인하려면 
password에만 refine하면안된다.
->이렇게하면 password하나만 받을 수 있어서
=> object 밖으로 옮겨야한다.-> object 전체를 refine

recap 정리
 1. input에 name을 넣어주어야 formData에서 get으로 해당 데이터 값을 가져올 수 있습니다.
 2. safeParse는 스키마에 따라 데이터를 검사하고 변형시켜줍니다.
 3. .refine으로 커스텀 validation을 만들 수 있습니다.
 4. .transform으로 데이터를 변형시킬 수 있습니다.
  
  .transform은 데이터를 변형하는 데 사용됩니다.문자열을 숫자로 변환할 수 있습니다.

```
const schema = z.string().transform(str => parseInt(str));
const result = schema.parse("42");
console.log(result); // 42 (number)

```
5. safeParse는 parse와 다르게 검증에 실패해도 에러를 만들지 않습니다.
- parse는 검증에 실패하면 에러를 발생시키지만, safeParse는 결과 객체를 반환하며 성공 여부를 나타냅니다.
6. 에러 객체에 flatten 메서드를 사용하면 사용하기 쉽게 포맷팅됩니다.
7. 검증 성공 시 원본 data를 사용하지 않고 result.data를 사용해야 합니다.




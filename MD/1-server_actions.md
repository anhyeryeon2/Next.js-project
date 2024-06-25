#### #4, #5


## server action

route 핸들러를 생성하고 post를 fetch하는 대신에

*서버액션은 비동기함수여야한다.
``` tsx
export default function LogIn(){
    async function handleForm(formDatas: FormData){
        "use server";
        console.log("i run in the server baby");
    }
}
```
위에서 만든거를 server action이라고 하는데
```  handleForm(formDatas: FormData){``` 여기 받을 데이터 타입을 적어주고

use server 는 항상 functond의 최상단에 있어야한다
``` tsx
export default function LogIn(){
    async function handleForm(formDatas: FormData){
        "use server";
        console.log(formData.get("email"), formData.get("password"));
        console.log("i run in the server baby");
    }
}
```
UI에 이메일 ps를 입력하면 콘솔에 보이게 된다.


``` tsx
export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log("log the user in!!!");
  return Response.json(data);
}
```


## useFormStatus 

server action이 로딩 중일때는 버튼을 비활성화 하고싶다

UI에게 작업이 실행되는것을 알려줘서 -> server action이 여러번 실행되지 않게

사용자가 버튼 계속 클릭하면 =-> race condition에 빠지게됨

//TODO: 
``` jsx
export default function LogIn(){
    async function handleForm(formData:FormData){
        "use server";
        await new Promise(resolve => setTimeout(resolve,5000))
        console.log("logged in!");
    }
}
```
이 form을 처리하는데 5초가 걸린다는것을 사용자에게 알려주지 않는다면
계속해서 버튼눌러도  눌러지는만큼 처리되지 않는다.

좋지않다.

``` jsx
export default function LogIn(){
    async function handleForm(formData:FormData){
        "use server";
        await new Promise(resolve => setTimeout(resolve,5000))
        console.log("logged in!");
    }
}
```

``` const {pending} = useFormStatus();```
pending 상태인지 알려줌 , function이 끝난 여부를 알려준다.
> useFormStatus는 마지막 form submit의 상태 정보를 제공하는 Hook


#### 하지만 이 hook은 action을 실행하는 form과 같은곳에서 사용할 수 없다. 
이 훅은 form의 자식에서만 사용할 수 있다. 
-> form 상태에 따라 변경하고자 하는 component내부에서 사용해야함@!!!


작업 끝났는지 아닌지에 따라 버튼이 달라지게 해보자!

``` jsx
"use client";
import { useFormStatus } from "react-dom";

interface FormButtonProps {
    text: string;
  }
  
  //hook으로 form의 로딩상태 알기 -> loading 삭제
  export default function FormButton({ text }: FormButtonProps) {
    const{pending} = useFormStatus();
    //pending 상태라면 버튼 비활성화 
    return (
      <button
        disabled={pending}
        className="primary-btn h-10 disabled:bg-neutral-400  disabled:text-neutral-300 disabled:cursor-not-allowed"
      >
        {pending ? "로딩 중" : text}
        // pending 이 true라면 텍스트 보이게
      </button>
    );
  }
```

useFormStatus hook을 사용하기 위해서는
    client component로 바꿔야함


버튼이   interactive 하기 때문에 client component

그래서 코드 맨위에 ``` "use client"; ``` 추가해준다




## useFormState

server action의 결과를 UI로 전달하는 방법을 배워보자

``` jsx
export default function LogIn(){
    async function handleForm(formData:FormData){
        "use server";
        await new Promise(resolve => setTimeout(resolve,5000))
        console.log("logged in!");
        return{
          error:'wrong password'
        }
    }
    const [state, action] = useFormState(handleForm)
}
```
useFormState 훅에서는 
- 결과를 알고 싶은 action을 인자로 넘겨줘야함

배열을 return 할건데
- 배열의 첫번째 아이템은 state
- - state는 내 action의 return값이 됨
- 두번째 아이템은 trigger (dispatch or action)
- - 

action을 useFormState로 넘겨주면

useFormState hook은 action의 결과를 돌려준다. 


``` javascript
...
<form action={action} className="flex flex-col gap-3">
```


#### useFormState hook을 쓴다는건 UI를 interactive 하게 만들겠다는것이다
why? 사용자에게 에러메세지를 보여주길 ㅊ원해서 -> interactive UI

--> client component로 바꿔줘야한다
->``` "use client"; ```  추가


한가지 더 ! client component 내부에서 use server를 선언할 수 없다



``` jsx
export default function LogIn(){
    async function handleForm(formData:FormData){
        "use server";
        await new Promise(resolve => setTimeout(resolve,5000))
        console.log("logged in!");
        return{
          error:'wrong password'
        }
    }
    const [state, action] = useFormState(handleForm)
}
```

여기서 use server action은 server component안에서만 작동한다

action.ts 파일을 만들고

``` jsx
"use server";

export async function handleForm(prevState: any, formData: FormData) {
  console.log(prevState);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return {
    errors: ["wrong password", "password too short"],
  };
}
```
### client component에서도 server action을 호출 가능 하지만 분리된 파일 같은 파일 로직에 x



``` jsx

export default function LogIn() {
  const [state, action] = useFormState(handleForm, null);
  return 
  {}}

```
``` useFormState( );``` 안에서 
실행하고자 하는 action을 전달하는 것 뿐만아니라
초기값도 필수적으로 제공해야함


useFormState가 action을 호출하면
action은 formData와 함께
이전에 반환한 state, 또는 처음 설정한 state와 실행된다

``` jsx
"use server";

export async function handleForm(prevState: any, formData: FormData) {
  console.log(prevState);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return {
    errors: ["wrong password", "password too short"],
  };
}
```
prevState: any로 해준다.


action을 실행하면 handleForm이 실행되고 
이 action의 return 값을 state로 받는다.

``` md
- useFormStatus는 마지막 form submit의 상태 정보를 제공하는 Hook

- useFormState는 form action의 결과에 따라 상태를 업데이트할 수 있는 Hook
```


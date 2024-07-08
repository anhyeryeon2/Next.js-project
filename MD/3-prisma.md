# 7

npm i prisma

npx prisma init를 하면
1. 우리가 만든 DB에 접속하기 위해 DB URL을 .env 파일에 저장해야한다고 알려줌
2. .env 파일을 .gitignore 안에 넣어야한다고 알려준다


prisma에게 나의 db가 어디있는지 알려주고, 그걸 가리킬 방법이 있어야한다

schema.prisma파일에는 

=> 우리 데이터가 DB안에서 어떤 형태로 저장되어야 하는지를 설명한다



###  prsima에게 우리 DB에 있는 사용자가 어떤 형태인지 설명해보자 

``` ts
model User {
    //고유 식별자 
  id         Int        @id @default(autoincrement())
  //username은 고유해야해서 unique
  username   String     @unique
  //필수가 아니면 ? 붙이기
  email      String?    @unique
  password   String?
  phone      String?  @unique
  github_id  String?  @unique
  avatar     String?
  created_at DateTime   @default(now())
  //레코드가 수정되는 시간 
  updated_at DateTime   @updatedAt
  SMSToken   SMSToken[]
}

```

테이블 :  model

카테고리처럼 DB안에 있는 객체

- npx prisma migrate dev 명령어를 실행하면
- prisma는 npx prisma generate명령어도 같이 실행한다.

    - 그러면 그 명령어는 너를 위한 client를 생성한다.


### 그래서 우릴 위해 만들어진 client를 살펴보자

node_moduels/.prisma/client/index.d.ts

보면 우리가 schema.prisma에 작성한 내용을 바탕으로  typescript코드가 있다.

``` ts
 export type UserCreateInput = {
    ✨username: string
    email?: string | null
    password?: string | null
    phone?: string | null
    github_id?: string | null
    avatar?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    SMSToken?: SMSTokenCreateNestedManyWithoutUserInput
  }
  ```

null이 될수있는것도 있지만 username은 필수여야한다

### 어떻게 사용하냐
lib/db.ts를 만들어서 prsima client를 불러와 테스트 해볼수 있었다. 


``` ts
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function test(){
 const token = await db.sMSToken.create({
    data:{
        token:"123123",
        user:{
            connect:{
                id:3,
            },
        },
    },
 });
 console.log(token);
}
test();
export default db;

```


### 이번에는 npx prisma studio를 사용해보자
npx prisma studio 하면 로컬 5555에서 볼 수 있는데

데이터를 확인하기에 시각적으로 좋다

#### 도중에 shema를 변경하고싶다면

(새로운 사용자를 추가하거나 새로운 모델을 만드는 것과 같은)

- schema.prisma 파일을 수정하고 
- migrate한다음
- ✨studio에 반영하고싶으면 다시껐다가 새로 npx로 시작해야한다.

### SMSToken 모델을 만들어보자

smstoken 모델은 user모델과  (sms인증위해서) 연결 해야한다.

``` ts
model SMSToken {
  id         Int      @id @default(autoincrement())
  //autoincrement는 자동으로 id를 순차적 배부 
  token      String   @unique
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  // SMSToken이 user도 가지고있다고 하면됨
  // 아래 줄은 prisma와 db에게 userId가 어디에서찾는지 / 무엇인지 알려주는거
  //✨ userId 필드가 id라는값을 참조한다는 뜻 
  user       User     @relation(fields: [userId], references: [id])
  //✨db에서는 smsToken과 연결된 userId만 저장됨
  userId     Int
}
```
id, created_at, updated_at 은 기본적으로 가지고있는것을 추천

shema를 변경했으니 

- npx prisma migrate dev

테스트해보자
``` ts
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function test(){
 const token = await db.sMSToken.create({
  // 보내줄 데이터는 
    data:{
        token:"123123",
        user:{
          //smstoken과 연결할 사용자가 누군지
            connect:{
                id:1,
            },
        },
    },
 });
 console.log(token);
}
test();
export default db;

```

userId와 연결된 smstoken을 확인 할 수 있었다.


### findUnique로 토큰을 찾아보자

이 id를 가지고 토큰을 찾아보면

``` ts
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function test(){
 const token = await db.sMSToken.findUnique({
   where:{
    id:1,
   },
   // 관계를 포함하는데 사용됨
   include:{
    user:true
   }
 });
 console.log(token);
}
test();
export default db;


```
문제는 사용자를 삭제하려고하면 
'관계' 때문에 불가하다.

### onDelete에 대해서 알아보자

``` ts
model SMSToken {
  id         Int      @id @default(autoincrement())
  token      String   @unique
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id])
  userId     Int
}
```
여기서 user는 ? 가 없기 때문에 필수이다.

- user가 없는 SMSToken은 없다.
-  user만 삭제하고 smsToken만 있을 수 는 없다. 

user를 삭제 못했던 이유가 
- SMSToken이 id가 1d인 사용자와 연결되어있기 때문이다

-> 그러면 smstoken을 동시에 지워주던지 액션을 줘야한다.


onDelete 은 아래의 actions가 있는데 

- Cascade : 부모 노드 사라지면 현재 노드 삭제
- Restrict : 현재 노드가 사라지지 않으면 부모 노드는 삭제 불가

``` ts
  user       User     @relation(fields: [userId], references: [id],✨onDelete: Cascade)

```

로 onDelete를 추가했기 때문에 

다시

- npx prisma migrate dev

user를 smstoken과 연결되어있어도 지울수 있다 
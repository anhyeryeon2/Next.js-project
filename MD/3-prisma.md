# 7

npm i prisma

npx prisma init
-> 우리가 만든 DB에 접속하기 위해 DB URL을 .env 파일에 저장해야한다고 알려준다
-> .env 파일을 .gitignore 안에 넣어야한다고 알려준다


prisma에게 나의 db가 어디있는지 알려주고, 그걸 가리킬 방법이 있어야한다

schema.prisma파일에는 우리 데이터가 DB안에서 어떤 형태로 저장되어야 하는지를 설명한다



####  prsima에게 우리 DB에 있는 사용자가 어떤 형태인지 설명해보자 

``` prisma
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

테이블 은 model
카테고리처럼 DB안에 있는 객체


npx prisma migrate dev 명령어를 실행하면
prisma는 npx prisma generate명령어도 같이 실행한다.

그러면 그 명령어는 너를 위한 client를 생성한다.

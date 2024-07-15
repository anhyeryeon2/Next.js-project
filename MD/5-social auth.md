# 9

## 깃허브 로그인 기능을 구현해보자

깃허브 application설정읋 한다.

깃허브 로그인 플로우는

1.  사용자의 github 신원 요청하기 


``` ts
const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
  "/github/start":true,
  "/github/complete":true,

};

```
미들웨어에 먼저 추가해서 /으로 강제 보내지않고 /github/start로 가도록 해준다.

route파일을 만들고

이걸로는 url의 특정 http method handler를 만들 수 있었다.



``` ts
export function GET() {
    const baseURL = "https://github.com/login/oauth/authorize";
    const params = {
      client_id: process.env.GITHUB_CLIENT_ID!,
      scope: "read:user,user:email",
      // 스코프로 깃허브에게 우리가 유저로부터 원하는 데이터가 무엇인지 알림
      //이건 깃허브가 유저에게 보여줌. 
      //지금은 사용자 프로필 읽기, 메일 주소 읽기
      allow_signup: "true",
      //사용자의 깃허브 가입을 허용할지 
      //true면 계정 없어도 ㄱㄴ, false면 계정이있어야만 로그이니 가능

    };
    const formattedParams = new URLSearchParams(params).toString();
    const finalUrl = `${baseURL}?${formattedParams}`;
    return Response.redirect(finalUrl);
  }
```
리다이렉트 하면 깃허브로 간다!!!

1.  사용자의 github 신원 요청하기  

였는데,,

2번째로는

2. 유저들은 깃허브에 의해 귀하의 사이트로 다시 redirect된다.

임시 code parameter와 함께@@
10분후 만료됨

우리가 해야할것은 
이 파라미터를 access Token으로 교환하는것


``` ts
import { notFound } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  //url로 부터 code 값을 가져오는것 

  if (!code) {
    return notFound();
  }
    // 이 code를 access Token으로 교환하자  -.post요청을 보내야함 
  const accessTokenParams = new URLSearchParams({
    // 깃허브 공식문서보면 파라미터들을 알려주는데 
    // url에 필요한 정보를 담아서 보내야함 
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();

  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenResponse = await fetch(accessTokenURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      // 해더에 이걸 담으면 예쁘게 json이 보인다.
    },
  });
  const accessTokenData = await accessTokenResponse.json();
  if ("error" in accessTokenData) {
    return new Response(null, {
      status: 400,
      //bad request
    });
  }
  return Response.json({ accessTokenData });

```

3번은,,

3. accessToken을 사용해서 깃허브 API에 request를 보내기!!!

auth 헤더에 우리 토큰 값을 넣어보내야한다.

``` ts
import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return notFound();
  }
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenResponse = await fetch(accessTokenURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  const { error, access_token } = await accessTokenResponse.json();
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }

  //-----------------여기서 부터 --------------------------------
  const userProfileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    //next에서get요청을 보내면, 
    // 그 get요청들은 next의 cache에 의해서 저장된다.
    // 근데 우린 이 요청은 캐싱하고싶지 않다.
    cache: "no-cache",
  });

  const { id, avatar_url, login } = await userProfileResponse.json();
  const user = await db.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });
  if (user) {
    const session = await getSession();
    session.id = user.id;
    await session.save();
    return redirect("/profile");
  }
  const newUser = await db.user.create({
    data: {
      username: login,
      github_id: id + "",
      avatar: avatar_url,
    },
    select: {
      id: true,
    },
  });
  const session = await getSession();
  session.id = newUser.id;
  await session.save();
  return redirect("/profile");
}
```
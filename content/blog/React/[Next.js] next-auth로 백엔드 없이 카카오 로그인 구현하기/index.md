---
title: "[Next.js] next-auth로 백엔드 없이 카카오 로그인 구현하기"
date: "2024-09-23T17:11:03.284Z"
description: "백엔드 없이 카카오 로그인을 구현해보자"
section: "문제 해결"
category: "React"
tags:
  - Nextjs
  - React
  - Auth
thumbnailImg: "./thumbnail.png"
---

# 개요

## KAKAO Developer 애플리케이션 등록하기

카카오 로그인을 비롯한 카카오 서비스를 이용하기 위해서는 [카카오 개발자 사이트](https://developers.kakao.com/)에 애플리케이션을 등록해야 한다.

사이트에 회원가입&로그인 후 `내 애플리케이션`에 접속한 뒤 **애플리케이션 추가하기** 버튼을 클릭한다.
![](https://i.imgur.com/xisXBoV.png)
앱 이름, 회사명, 카테고리를 채워주고 저장을 누르면 애플리케이션이 추가된다.

![](https://i.imgur.com/qcuguAW.png)

### **카카오 로그인 활성화**

그리고 생성한 앱을 클릭해 앱 설정 페이지로 들어가면, 좌측 사이드 바에 `카카오 로그인`을 찾을 수 있다. 클릭해주면 아래와 같은 페이지가 나온다.

여기서 **활성화 설정**을 켜줘야 한다. 상태를 `ON`으로 바꿔주자.
![](https://i.imgur.com/6XjmB05.png)

### **Redirect URI 등록**

그리고 같은 페이지에서 `Redirect URI 등록 버튼`을 클릭한다.
![](https://i.imgur.com/PEb4rVl.png)

(일단은 로컬 환경에서 테스트할 것이므로) `http://localhost:3000/api/auth/callback/kakao`를 리다이렉트 URI로 설정해준다.

### **도메인 등록**

그 다음 `플랫폼`으로 들어가 **Web 플랫폼 등록** 버튼을 클릭한다.
![](https://i.imgur.com/EVLArNJ.png)

사이트 도메인으로 `http://localhost:3000`을 등록해준다.
![](https://i.imgur.com/k4tYOgG.png)

### **동의 항목 설정**

`카카오 로그인 > 동의항목`으로 들어간다.
![](https://i.imgur.com/v9NbWWd.png)

여기서 서비스에서 사용자로부터 요청하고싶은 정보(카카오 닉네임, 프로필 사진, 생일 등)를 설정할 수 있다.

### 앱 키 확인

그 다음 `앱 키`로 들어가면 애플리케이션에 할당된 다양한 Key 값들을 확인할 수 있다.
![](https://i.imgur.com/tnq7cgi.png)

이 중 **JavaScript Key**를 복사해두자.

# 프로젝트에 적용하기

이제 프로젝트에 next-auth를 적용해보자.

## 라이브러리 설치

[공식문서](https://next-auth.js.org/getting-started/example)를 따라, 먼저 next-auth 라이브러리를 설치해준다.

```bash
npm install next-auth
```

## 설정파일 작성

![](https://i.imgur.com/0KJFLFp.png)

난 App Router를 사용하기 때문에, 공식문서의 안내를 따라 `/app/api/auth/[…nextauth]/route.ts` 경로에 파일을 만들었다.

### Session

```tsx
import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

const handler = NextAuth({
  ...
  session: {
    strategy: "jwt", // JWT를 사용하여 세션을 유지
  },
});

export { handler as GET, handler as POST };
```

next-auth는 기본적으로 세션을 데이터베이스에 저장하도록 설정되어 있다. 인증에 토큰을 사용할 것이므로 위와 같이 JWT(Json Web Token)을 사용하여 세션을 유지하겠다는 설정을 추가한다.

### Providers

Kakao 로그인을 구현할 것이기 때문에, providers에 KakaoProvider를 추가할 것이다.

[관련 문서](https://next-auth.js.org/providers/kakao)

```tsx
import NextAuth from "next-auth"
import KakaoProvider from "next-auth/providers/kakao"

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
  ],
})

export { handler as GET, handler as POST }
```

provider의 clientId와 clientSecret 값들을 설정해주기 위해 env 파일에 `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`값을 작성해주자.

```c
// .env
...
KAKAO_CLIENT_ID=카카오 개발자 사이트에서 발급받은 애플리케이션 Javascript 키
KAKAO_CLIENT_SECRET=임의의 문자열
```

<aside> 
⚠️ 이 때, 해당 환경변수 명에 `NEXT_PUBLIC_`을 붙여주면 안된다. `NEXT_PUBLIC_` 접두사를 붙여주면 환경변수를 브라우저에 노출시킬 수 있는데, 클라이언트/시크릿 키는 민감한 정보이므로 클라이언트가 읽을 수 없게 해야 하기 때문이다.

</aside>

### Callbacks

callback은 인증 작업이 수행될 때 작업을 제어하는 데 사용할 수 있는 비동기 함수이다.

```tsx
callbacks: {
	  async signIn({ user, account, profile, email, credentials }) {
		    return true
	  },
	  async redirect({ url, baseUrl }) {
		    return baseUrl
	  },
	  async session({ session, token, user }) {
		    return session
	  },
	  async jwt({ token, user, account, profile, isNewUser }) {
		    return token
	  }
}
```

이 중 `jwt()`와 `session()`을 작성해줄 것이다. 참고를 위해 `signIn()` 함수에 대한 설명도 첨부했다.

- `signIn()`
  : Oauth/Eamil/Credentials Provider로 로그인한 후 실행되어 사용자의 로그인을 제어하는 콜백함수이다.
  카카오 로그인을 구현하는 지금 상황에 맞춰 설명하자면, next-auth에서 제공하는 `signIn()` 함수(추후 언급 예정)를 클라이언트에서 실행하면 카카오 로그인 페이지로 리다이렉트되는데, 이 때 로그인을 완료하면 `signIn()` 콜백 함수가 호출된다.
  이 때 전달되는 로그인 정보엔 user, account 등이 있는데, user는 카카오 로그인 시 사용자가 정보 제공에 동의한 항목이 들어있다(카카오 닉네임, 프로필 이미지 url 등). account엔 provider 정보, access_token, refresh_token 등의 속성이 들어있다.
- `jwt()`
  : JWT가 생성되거나(로그인 성공 시), 업데이트(useSession() 등 클라이언트에서 session에 접근하였을 때)되었을 때 실행되는 콜백 함수이다.
  여기서 반환되는 값은 암호화되어 쿠키에 저장된다.
    <aside> 
    💡 이 때 token은 인증 서버에서 받아온 토큰이 아니라, next-auth의 account models와 user models 정보를 조합하여 next-auth에서 유지하는 토큰이다.
    
    </aside>

- `session()`
  : 세션을 client에서 확인할 때 호출된다. 앞서 `jwt()` 콜백함수에서 반환하는 토큰 값이 이 콜백 함수의 token 파라미터로 들어온다. 이곳에서 반환된 값은 client에서 `useSession()` 훅을 사용해 가져올 수 있다.

```tsx
import NextAuth, { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import KakaoProvider from "next-auth/providers/kakao";

const handler = NextAuth({
  ...
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };

```

이렇게 하면 클라이언트에서 `useSession()` 훅을 통해 accessToken에 접근할 수 있다.

<aside>

💡 **세션, 토큰, 유저 타입 정의**

이 때, token과 account(계정 정보) 등의 타입을 프로젝트에 맞게 재정의해주기 위해 타입 정의 파일을 작성해주었다.

```tsx
// /app/api/auth/[…nextauth]/index.d.ts

import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: User & DefaultSession["User"]
    expires: string
    accessToken?: string
    accessTokenExpires?: number
    refreshToken?: string
    refreshTokenExpires?: number
    error?: "RefreshAccessTokenError"
  }

  interface User {
    id?: string
    name?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    accessToken?: string
    accessTokenExpires?: number
    refreshToken?: string
    refreshTokenExpires?: number
    exp: number
    error?: "RefreshAccessTokenError"
  }
}
```

이렇게 재정의해주지 않으면 앞서 작성한 session() 콜백함수에서 session 객체에 accessToken 속성이 존재하지 않는다는 TypeScript 에러가 뜬다.

</aside>

여기까지 작성해주고, 실제 클라이언트에서 어떻게 어떻게 로그인이 이루어지는지 확인해보자.

```tsx
"use client";

import KakaoSymbol from "@/assets/images/login/kakao_symbol.svg";
import { Button } from "@mui/material";
import { signIn } from "next-auth/react";
...

<Button
  color="secondary"
  variant="contained"
  size="large"
  startIcon={<KakaoSymbol className="w-5 h-5" />}
  onClick={() => signIn("kakao")}
>
  카카오로 시작하기
</Button>
```

이렇게 버튼을 하나 만들어준 뒤 버튼을 클릭하면 next-auth의 `signIn(’kakao’)` 함수가 호출되어 카카오 로그인 페이지로 리다이렉트된다.
![](https://i.imgur.com/1OZeqC5.png)

여기서 로그인을 완료하면 카카오 인증 서버로부터 전달받은 인증 정보가 세션에 저장된다.

## 프로젝트에 Session 적용하기

로그인에 성공하면 next-auth는 브라우저 쿠키에 Session을 저장한다.

프로젝트에서 Session에 접근할 수 있게 하려면, 1차적으로 next-auth에서 제공하는 SessionProvider로 컴포넌트를 감싸 하위 컴포넌트들에게 Session을 공유해주어야 한다.

```tsx
"use client"

import { SessionProvider } from "next-auth/react"
import React from "react"

const AuthSessionProvider = ({ children }: React.PropsWithChildren) => {
  return <SessionProvider>{children}</SessionProvider>
}

export default AuthSessionProvider
```

이렇게까지 해주면 하위 컴포넌트에서 `useSession()` 훅으로 세션 정보에 접근할 수 있다.

## 인증 정보 전역 상태관리&Authorization 헤더 설정

로그인을 구현했으니, 로그인을 통해 불러온 **인증 정보를 전역 상태로 저장**해주고 axios 요청 시 필요한 **Authorization Header를 셋팅**해주어야 한다.

### Redux Reducer 구현

이 프로젝트에서는 인증 정보 관리를 위해 Redux와 Cookie를 함께 사용하고 있었다.

```tsx
/* eslint-disable import/no-extraneous-dependencies */
import { LoginResponseDto } from "@/types/dto/auth.dto"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import cookie from "react-cookies"

interface AuthState {
  value: LoginResponseDto
}

const initialState: AuthState = {
  value: {
    user_id: -1,
    access_token: "",
    refresh_token: "",
  },
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginResponseDto>) => {
      cookie.save("auth", JSON.stringify(action.payload), {})
      state.value = action.payload
    },
    logout: state => {
      cookie.remove("auth")
      state.value = initialState.value
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
```

`login()` 호출 시 “auth”라는 키로 인증 정보가 쿠키에 저장되도록 했고, `logout()` 호출 시 cookie에 저장된 “auth” 키 값이 제거되도록 했다.

<aside>

💡 참고로, `useDispatch()`와 `useSelector()` 훅의 편리한 사용을 위해 `useAppDispatch()`, `useAppSelector()`라는 커스텀 훅을 만들어주었다.

```tsx
import { useDispatch, useSelector } from "react-redux"

import type { AppDispatch, RootState } from "@/store"

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

이렇게 하면 `useDispatch()`, `useSelector()`를 사용할 때마다 타입을 지정해주어야 하는 중복을 없앨 수 있다.

</aside>

그리고 utils 폴더에 auth.ts라는 파일을 만들고 아래와 같은 함수를 정의해주었다.

```tsx
import { cookies } from "next/headers"

import { LoginResponseDto } from "@/types/dto/auth.dto"

export const getAuthFromCookie = (): LoginResponseDto => {
  const authJSON = cookies().get("auth")?.value
  const auth: LoginResponseDto = JSON.parse(
    authJSON || '{"user_id": -1, "access_token": "", "refresh_token": ""}'
  )
  return auth
}
```

여기서 정의한 함수는 cookie로부터 ‘auth’ 키로 저장해준 데이터를 불러와 반환하는 함수이다.

### 로그인 정보를 전역 상태에 저장

이제 앞서 작성했던 `<AuthSessionProvider>`처럼, 페이지 컴포넌트가 렌더링될 때마다 위 작업을 실행해줄 Wrapper 컴포넌트를 구현한다.

이 컴포넌트는 Session에 접근하고, Redux를 사용하기 때문에 `<SessionProvider>`와 react-redux의 `<Provider>` 하위에 위치해야 한다.

```tsx
// sessioinLoader.tsx

"use client"

import { login, logout } from "@/store/auth.slice"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PropsWithChildren, useEffect } from "react"
import { useAppDispatch } from "../hooks/redux"

function SessionLoader({ children }: PropsWithChildren<{}>) {
  const { status, data: session } = useSession()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const isLogin = !!session && status === "authenticated"

  useEffect(() => {
    if (isLogin) {
      dispatch(
        login({
          user_id: session?.user,
          access_token: session?.accessToken ?? "",
          refresh_token: session?.refreshToken ?? "",
        })
      )
      router.push("/")
    } else {
      dispatch(logout())
    }
  }, [
    dispatch,
    isLogin,
    session?.accessToken,
    session?.refreshToken,
    session?.user,
    router,
  ])

  return <>{children}</>
}

export default SessionLoader
```

로그인 여부에 따라, 로그인된 상태에선 전역상태에 로그인 정보를 저장하고(`login()`) 로그인된 상태가 아니라면 전역상태의 로그인 정보를 삭제한다.(`logout()`)

### Axios 헤더 Authorization 설정

이제 쿠키에 저장된 액세스 토큰 값을 Axios 요청 헤더의 Authorization 속성 값으로 설정해주자.

axios 인스턴스를 정의한 파일로 가서, axios 인스턴스의 인터셉터를 구현해준다.

```tsx
import axios from "axios"

import { categorizeError } from "@/types/error"
import cookies from "react-cookies"

export const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
})

authClient.interceptors.request.use(config => {
  const auth = cookies.load("auth")
  if (auth?.access_token) {
    config.headers.Authorization = `Bearer ${auth.access_token}`
  }
  return config
})

authClient.interceptors.response.use(
  response => response,
  error => Promise.reject(categorizeError(error))
)
```

## Page Protection - 미들웨어

웹 페이지를 만들다 보면, 로그인 상태에 따라 접근을 제한해야 하는 경우가 있다.

이를테면 일반적인 경우 로그인한 사용자는 로그인/회원가입 페이지에 접근할 수 없고, 로그인되지 않은 사용자는 마이페이지에 접근할 수 없다. 이런 접근성 제어를 위해 Next.js에서 제공하는 미들웨어(middleware)를 활용할 수 있다.

### 미들웨어란?

미들웨어는 nextjs에서 페이지를 렌더링하기 전에 **서버 측**에서 실행되는 함수이다. 즉, 페이지 요청 전에 무언가를 수행할 수 있도록 해준다.

app(페이지 라우터의 경우 pages) 디렉토리와 같은 레벨에 `middleware.ts` 파일을 생성해주고, middleware라는 이름의 함수를 export해주면 미들웨어가 적용된다.

```tsx
import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {}
```

### Page Protection 구현

```tsx
import { getAuthFromCookie } from "@/lib/utils/auth"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const auth = getAuthFromCookie()

  if (
    auth.access_token &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/sign-up")
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", request.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\\\.png$).*)"],
}
```

프로젝트에서는 특별히 로그인한 사용자만 접근할 수 있는 페이지가 없어서, 쿠키에 액세스 토큰이 존재하는 경우(=로그인 상태인 경우) 로그인(/login), 회원가입(/sign-up) 페이지에 접근하면 메인 페이지(/)로 리다이렉트되도록 미들웨어를 구현했다.

<aside>

💡 원하는 경로에서만 미들웨어가 적용되도록 설정하려면, 미들웨어 파일에서 config를 정의하고 export해주면 된다.

위 코드에서는 `/api`로 시작하는 모든 경로, `/_next/static`에서 제공되는 파일(자바스크립트 번들, CSS 파일 등), `/_next/image`에서 제공되는 파일(이미지 최적화 경로), png 이미지(.png로 끝나는 모든 요청)를 **제외한** 모든 경로에만 미들웨어가 적용되도록 설정하고 있다.

</aside>

## 추가

근데 이렇게 구현해놓고 보니, 한 가지 의문점이 생겼다.

**백엔드 없이 로그인을 구현하긴 했는데… 이렇게 만들어진 액세스 토큰을 백엔드 서버에서 어떻게 식별하는지?**

내가 지금까지 SNS 로그인을 구현했었던 방식은, 로그인 단계에서 토큰 생성 api를 호출하면 백엔드 서버에서 프로젝트 자체의 토큰을 만들어 반환하고, api 요청에 포함된 토큰을 복호화시켜 식별하는 방식이었다.

chatGPT한테 물어봤더니 이 경우엔 백엔드 서버에서 카카오 인증 API를 호출해 식별하는 과정을 거친다고 한다.

아래는 chatGPT가 짜준 백엔드(Java&Spring) 코드다.

```tsx
// KakaoTokenFilter.java

@Component
public class KakaoTokenFilter extends OncePerRequestFilter {

    private static final String KAKAO_USER_INFO_URL = "<https://kapi.kakao.com/v2/user/me>";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            if (validateTokenWithKakao(accessToken)) {
                // Token is valid; proceed with the request
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Token is missing or invalid; reject the request
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.getWriter().write("Unauthorized");
    }

    private boolean validateTokenWithKakao(String accessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

            org.springframework.http.ResponseEntity<String> response = restTemplate.exchange(
                    KAKAO_USER_INFO_URL,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            // Log the exception (optional)
            return false;
        }
    }
}
```

이렇게 되면 카카오 로그인 외의 다른 OAuth 로그인을 함께 지원해야 하는 상황에선 어떻게 해야 할지 궁금해져서 이것도 물어봤다.

이 경우엔 cookie에 accessToken 외 추가로 provider 정보(kakao, google 등)를 포함시키고, Axios 요청 헤더에 추가해준 뒤 백엔드 서버에서 이 정보에 따라 분기처리를 해주는 식으로 구현하면 된다고 한다.

```tsx
import axios from "axios"

import { categorizeError } from "@/types/error"
import cookies from "react-cookies"

export const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
})

authClient.interceptors.request.use(config => {
  const auth = cookies.load("auth")
  if (auth?.access_token && auth?.provider) {
    config.headers.Authorization = `Bearer ${auth.access_token}`
    config.headers["X-OAuth-Provider"] = auth.provider // 사용자 정의 헤더 속성
  }
  return config
})

authClient.interceptors.response.use(
  response => response,
  error => Promise.reject(categorizeError(error))
)
```

```tsx
@Component
public class OAuthTokenFilter extends OncePerRequestFilter {

    private static final String KAKAO_USER_INFO_URL = "<https://kapi.kakao.com/v2/user/me>";
    private static final String GOOGLE_USER_INFO_URL = "<https://www.googleapis.com/oauth2/v3/tokeninfo>";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        String provider = request.getHeader("X-OAuth-Provider");

        if (authHeader != null && authHeader.startsWith("Bearer ") && provider != null) {
            String accessToken = authHeader.substring(7);

            boolean isTokenValid = validateTokenWithProvider(provider, accessToken);

            if (isTokenValid) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.getWriter().write("Unauthorized");
    }

    private boolean validateTokenWithProvider(String provider, String accessToken) {
        switch (provider.toLowerCase()) {
            case "kakao":
                return validateTokenWithKakao(accessToken);
            case "google":
                return validateTokenWithGoogle(accessToken);
            default:
                return false;
        }
    }
    ...
}
```

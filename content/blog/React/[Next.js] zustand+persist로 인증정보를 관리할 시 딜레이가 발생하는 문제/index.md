---
title: "[Next.js] zustand+persist로 인증정보를 관리할 시 딜레이가 발생하는 문제"
date: "2024-08-29T15:33:03.284Z"
description: "zustand를 사용하면서 발생한 문제를 해결해보았다."
section: "문제 해결"
category: "React"
tags:
  - Nextjs
  - React
  - 상태관리 라이브러리
  - 트러블 슈팅
---

## 개요

![](https://i.imgur.com/1K1FmuT.gif)
위 gif를 보면 헤더 우측의 버튼이 새로고침 후 잠시동안 ‘로그인’이었다가 ‘로그아웃’으로 변하는 모습을 볼 수 있다.

## 문제

사용해본 상태관리 라이브러리 중 zustand가 가장 간단하고 편리했어서 상태관리에 zustand를 사용하기로 결정했다.

가장먼저 구현했던 기능이 로그인 기능이었는데, 로그인 후 서버로부터 전달받은 인증 정보를 전역적으로 관리할 필요가 있었고 여기에 zustand를 사용했다. 새로고침을 했을 때 로그인이 풀리면 안되기 때문에 persist()를 활용해 zustand의 상태 값을 로컬 스토리지에 저장하도록 했다.

```tsx
interface AuthState {
  auth: LoginResponseDto | null | undefined
  login: (auth: LoginResponseDto | null) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      auth: undefined,
      login: auth => set({ auth: auth }),
      logout: () => set({ auth: undefined }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
```

웹 페이지의 레이아웃을 구성하는 헤더가 로그인 상태일 때는 ‘로그아웃’ 버튼을 렌더링하고, 비로그인 상태일 때는 ‘로그인’ 버튼을 렌더링하도록 구현했다.

```tsx
const Header = () => {
  const { auth, logout } = useAuthStore()
  return (
    <div className="fixed left-0 top-0 flex h-[62px] w-[100vw] items-center justify-between gap-8 border-b border-comment bg-white px-8">
      <Link href="/">
        <Image
          src="/images/logo/logo.svg"
          alt="todo_logo"
          width="188"
          height="32"
        />
      </Link>
      {auth ? (
        <button onClick={logout} className="font-bold text-comment">
          로그아웃
        </button>
      ) : (
        <Link href="/login" className="font-bold text-comment">
          로그인
        </Link>
      )}
    </div>
  )
}
```

여기서 발생한 문제는, 처음에 보여준 gif에 보이는 것처럼 로그인 후 새로고침을 하면 헤더의 버튼이 잠시간 ‘로그인’이었다가 ‘로그아웃’으로 변하는 현상이 발생한다는 것이다.

이런 현상이 발생하는 이유는 로컬 스토리지로부터 값을 불러오는 동작이 비동기 로직이기 때문에 약간의 딜레이가 발생하고, 그동안은 비로그인 상태와 마찬가지이기 때문에 ‘로그인’ 버튼을 렌더링하는 것이었다.

[동일한 문제에 대한 질문과 답변](https://github.com/pmndrs/zustand/discussions/2450)

## 해결

이 문제를 해결하기 위해 3시간을 삽질했다.

**서버사이드에서 스토리지 값을 불러올 수 없나?** → 안된다. 로컬 스토리지는 기본적으로 서버 사이드에서 접근이 불가하다.

**그럼 로컬 스토리지 대신 서버사이드에서도 접근할 수 있는 쿠키를 사용하면?** → 서버 사이드에서 쿠키에 접근하는 것은 가능하지만, zustand의 동작은 클라이언트 사이드에서 이루어지기 때문에 결국 클라이언트 사이드에서 쿠키를 불러오는 과정에서 발생하는 딜레이로 인해 동일한 문제가 발생한다.

**상태관리 라이브러리를 사용하지 않고, 쿠키만 사용하면?** → 위에서 언급한 문제는 해결되지만, 쿠키를 서버사이드에서만 접근할 경우, 즉 헤더를 서버 컴포넌트로 구현할 경우 쿠키 값이 업데이트된 것(로그인/로그아웃)을 감지하여 재렌더링할 수가 없기 때문에 즉각적으로 로그인/로그아웃 동작을 반영할 수가 없다…이 부분을 보완하려니 로직이 너무 복잡해진다. 다음은 chatGPT가 짜준 코드다.

```tsx
"use client"

import { useEffect, useState } from "react"
import cookies from "js-cookie"

export default function AuthStatus({ initialAuth }: { initialAuth: boolean }) {
  const [auth, setAuth] = useState(initialAuth)

  useEffect(() => {
    const checkAuth = () => {
      const authToken = cookies.get("authToken")
      setAuth(!!authToken)
    }

    // Re-check authentication status after login/logout
    window.addEventListener("login", checkAuth)
    window.addEventListener("logout", checkAuth)

    return () => {
      window.removeEventListener("login", checkAuth)
      window.removeEventListener("logout", checkAuth)
    }
  }, [])

  const handleLogout = () => {
    cookies.remove("authToken")
    setAuth(false)
    window.dispatchEvent(new Event("logout")) // Notify other parts of the app
    window.location.href = "/login" // Redirect to login
  }

  return (
    <>
      {auth ? (
        <button onClick={handleLogout} className="font-bold text-comment">
          로그아웃
        </button>
      ) : (
        <a href="/login" className="font-bold text-comment">
          로그인
        </a>
      )}
    </>
  )
}
```

그러다가 Redux에서는 이러한 문제가 발생하지 않는다는 걸 알게 됐고, Redux를 활용해 인증정보에 대한 상태관리를 하도록 구현하여 문제를 해결했다.

왜 zustand에서 발생한 문제가 Redux에서는 발생하지 않는지 궁금해져서 chatGPT에게 물어봤다.

- Zustand: 기본적으로 Zustand에는 첫 번째 렌더링 전에 동기적으로 로컬 저장소 또는 쿠키의 상태를 초기화하는 메커니즘이 내장되어 있지 않습니다. 비동기 작업(예: 저장소에서 읽기)에서 상태를 초기화하는 경우 상태를 사용할 수 있기 전에 지연이 있을 수 있으며 이로 인해 구성 요소가 초기(빈 또는 기본) 상태로 렌더링되는 짧은 기간이 발생할 수 있습니다.
- Redux: Redux는 상태를 **동기적으로 초기화**하며 redux-persist와 같은 것을 사용할 때 애플리케이션이 **렌더링되기 전에 로컬 저장소나 세션 저장소에서 상태를 rehydrate**합니다. 이는 일반적으로 구성 요소가 마운트될 때까지 상태가 준비되었음을 의미합니다.

이렇게 보면 zustand의 사용성이 좋긴 하지만, 로컬 스토리지와 연동하여 사용하는 데는 Redux가 좀 더 특화되어 있다고 할 수 있을 것 같다.

---
title: "useEffect 제대로 이해하기(2)"
date: "2024-07-05T01:37:03.284Z"
description: "useEffect에 대해 파헤쳐보자."
section: "지식 공유"
category: "React"
tags:
  - React
thumbnailImg: "./image.png"
---

## 개발 중에 Effect가 두 번 실행되는 경우를 다루는 방법

이전에 다룬 내용 중 아래와 같은 내용이 있었다.

> **의존성 배열이 빈 배열이면 Effect 코드가 꼭 1번만 실행이 될까?**
>
> 앞서 언급된 문제(채팅방 컴포넌트가 여러 차례 마운트될 때의 문제)가 발생했을 때 빠르게 파악할 수 있도록, React는 개발 모드에서 초기 마운트 후 모든 컴포넌트를 다시 한 번 마운트한다. 그래서 개발모드에서라면 의존성 배열이 빈 배열이더라도 Effect 코드는 2번씩 실행된다.

이에 따르면 개발모드에서 Effect가 올바르게 동작하기 위해선, Effect가 두 번 실행되어도 에러가 발생하지 않게 코드를 작성해야 할 것이다.
즉, 이는 사용자가 느끼기에 배포환경에서의 동작과 개발환경에서의 동작이 동일해야 함을 시사한다.
이를 위해서 보통은 클린업 함수를 구현한다.

주의해야 할 점은, Effect가 두번 사용되는 것을 막기 위해서 useRef를 사용해선 안된다는 것이다.
앞 포스팅에서 들었던 예시를 다시 가져오겠다.

```jsx
import { useState, useEffect } from "react"
import { createConnection } from "./chat.js"

export default function ChatRoom() {
  useEffect(() => {
    const connection = createConnection()
    connection.connect()
  }, [])
  return <h1>채팅에 오신걸 환영합니다!</h1>
}
```

이 코드엔 컴포넌트가 마운트될 때마다 새로운 커넥션이 생길 수 있다는 문제가 있었다.
이 문제를 useRef 훅으로 해결해보자.

```jsx
...
const connectionRef = useRef(null);

useEffect(() => {
	// 🚩 This wont fix the bug!!!
	if (!connectionRef.current) {
	connectionRef.current = createConnection();
	connectionRef.current.connect();
	}
}, []);
```

이렇게 구현하면 개발 단계에서 connect()가 한 번 호출되지만, 사용자가 다른 곳으로 이동해 컴포넌트가 언마운트되어도 처음 생성된 커넥션이 삭제되지 않고, 사용자가 웹 페이지와 상호작용하면서 여러 건의 커넥션이 쌓일 수 있는 가능성을 남겨두게 된다.

- 이벤트 구독하기 : 만약 Effect가 어떤 것을 구독(subscribe)한다면, 클린업 함수에 구독을 해지하는 로직을 넣어야 한다.
- 애니메이션 트리거 : Effect가 어떤 요소를 애니메이션으로 표시하는 경우, 클린업 함수에서 애니메이션 설정을 초기 값으로 재설정해야 한다.
  ```jsx
  useEffect(() => {
    const node = ref.current
    node.style.opacity = 1 // Trigger the animation
    return () => {
      node.style.opacity = 0 // Reset to the initial value
    }
  }, [])
  ```
- 방문 기록 남기기 : 만일 다음과 같이 페이지를 방문했을 때 방문 이력을 남기는 코드가 있다고 하자.
  ```jsx
  useEffect(() => {
    logVisit(url) // POST 요청을 보냄
  }, [url])
  ```
  이 경우엔 개발환경에서 logVisit가 각 URL에 대해 두 번 호출될 테지만, 이 코드를 그대로 유지하는 것이 권장된다고 한다. 이유는 사용자 기준에서 이 로직이 한 번 실행되든, 두 번 실행되든 눈으로 볼 수 있는 동작 차이가 없으며, 제품 환경에서는 중복된 방문 로그가 남지 않을 것이기 때문이다.
- Effect가 아닌 경우(애플리케이션 초기화) : 어떤 로직은 애플리케이션 시작 시에 단 한 번만 실행되어야 할 수 있다. 이러한 로직은 컴포넌트 외부에 배치할 수 있다.

  ```jsx
  if (typeof window !== "undefined") {
    // 브라우저에서 실행 중인지 확인합니다.
    checkAuthToken()
    loadDataFromLocalStorage()
  }

  function App() {
    // ...
  }
  ```

  이렇게 컴포넌트 외부에서 해당 로직을 실행하면, 해당 로직은 브라우저가 페이지를 로드한 후 단 한 번만 실행됨이 보장된다.

- 데이터 페칭 : 만약 Effect가 어떤 데이터를 가져온다면, 클린업 함수에서는 Fetch를 중단하거나 결과를 무시하도록 구현해야 한다.
  ```jsx
  useEffect(() => {
    let ignore = false
    async function startFetching() {
      const json = await fetchTodos(userId)
      if (!ignore) {
        setTodos(json)
      }
    }
    startFetching()
    return () => {
      ignore = true
    }
  }, [userId])
  ```
  이미 발생한 네트워크 요청을 실행취소할 수는 없지만, 클린업 함수를 사용하면 더 이상 관련없는 페치가 애플리케이션에 계속 영향을 미치지 않도록 보장할 수 있다.
  > **Effect에서 데이터를 가져오는 좋은 방법?**
  >
  > 클라이언트 측 앱의 관점에서, Effect 안에 fetch 호출을 작성하는 것은 많이 사용되는 방법이다.
  > 하지만 몇 가지 단점이 있다.
  >
  > - Effect는 서버에서 실행되지 않는다.
  >   - (in 클라이언트 사이드 렌더링)초기에 서버에서 렌더링된 HTML은 데이터가 없는 로딩 상태만 포함하게 된다. 클라이언트 컴퓨터는 모든 JavaScript를 다운로드하고 앱을 렌더링해야만 데이터를 로드해야 한다는 것을 알게 될 것이고, 이는 효율적이지 않다.
  > - Effect 안에서 직접 가져오면 '네트워크 폭포'를 쉽게 만들 수 있다.
  >   - 부모 컴포넌트를 렌더링하면 일부 데이터를 가져오고 자식 컴포넌트를 렌더링한 다음, 그 자식 컴포넌트들이 데이터를 가져오기 시작하는데, 이 과정은 네트워크가 느리다면 이들을 병렬로 가져오는 것보다 훨씬 느리게 이루어질 것이다.
  > - Effect 안에서 직접 가져오는 것은 일반적으로 데이터를 미리 로드하거나 캐시하지 않음을 의미한다.
  >   - 컴포넌트가 언마운트되고 다시 마운트되면 데이터를 다시 가져와야 한다.
  > - 편하지 않다.
  >   - fetch 호출을 작성할 때 Race Condition과 같은 버그에 영향을 받지 않는 방식으로 작성하는 데에는 꽤 많은 보일러 플레이트 코드가 필요하다. 이 문제들은 리액트에만 국한되는 것이 아니다. 어떤 라이브러리에서든 마운트 시에 데이터를 가져온다면 비슷한 단점이 존재한다. 그래서 다음과 같은 데이터 접근 방식이 권장된다.
  > - 프레임워크를 사용하는 경우, 해당 프레임워크의 내장 데이터 페칭 메커니즘을 사용한다.
  >   - ex) Next.js의 getStaticProps()
  > - 클라이언트 측 **캐시**를 사용/구축하는 것을 고려한다.
  >   - 이를 위해 React Query, useSWR, React Router 6.4+ 등의 오픈소스 솔루션을 사용할 수 있다.
  >
  > 이 중 어느 방식도 적합하지 않은 경우에만 Effect 내에서 데이터를 직접 가져오기를 권장한다.
- Effect가 아닌 경우(제품 구입하기) : 어떨 때는 클린업 함수를 작성하더라도 Effect가 두 번 실행되는 것에 대해 사용자가 확인할 수 있는 결과를 방지할 방법이 없을 수도 있다. 다음과 같은 POST 요청 로직을 생각해보자.
  ```jsx
  useEffect(() => {
    // 🔴 잘못된 방법: 이 Effect는 개발 환경에서 두 번 실행되며 코드에 문제가 드러납니다.
    fetch("/api/buy", { method: "POST" })
  }, [])
  ```
  사용자는 제품을 2번 구매하고 싶지 않을 것이기 때문에 이러한 로직은 Effect 내에 작성하면 안된다.
  대신, 구매는 렌더링에 의해 발생하는 것이 아니라, 특정 상호작용에 의해 발생하는 것이므로 Effect 대신 Buy 버튼의 이벤트 핸들러로 이동시키는 것이 좋다.
  ```jsx
  function handleClick() {
    // ✅ 구매는 특정 상호 작용에 의해 발생하는 이벤트입니다.
    fetch("/api/buy", { method: "POST" })
  }
  ```

## 각각의 렌더링은 고유한 Effect를 갖는다.

다른 관점에서, `useEffect`를 렌더링 결과물에 붙이는 것으로 생각할 수 있다. 다음과 같은 Effect를 예로 들어보자.

```jsx
export default function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()
    return () => connection.disconnect()
  }, [roomId])

  return <h1>Welcome to {roomId}!</h1>
}
```

이제 사용자가 앱을 탐색하는 동안 어떤 일이 일어나는지 알아보자.

### 초기 렌더링

사용자가 `<ChatRoom roomId="general"/>`을 방문하면, 결과물은 다음과 같이 출력될 것이다.

```jsx
// 첫 번째 렌더링에 대한 JSX (roomId = "general")
return <h1>Welcome to general!</h1>
```

이 때 주목할 것은 Effect도 렌더링 결과물의 일부라는 것이다.
첫 번째 렌더링의 Effect는 다음과 같다.

```jsx
// 첫 번째 렌더링에 대한 이펙트 (roomId = "general")
;() => {
  const connection = createConnection("general")
  connection.connect()
  return () => connection.disconnect()
},
  // 첫 번째 렌더링의 의존성 (roomId = "general")
  ["general"]
```

React는 이 Effect를 실행하며, 'general' 채팅방에 연결한다.

### 같은 의존성 사이에서의 재렌더링

`<ChatRoom roomId="general"/>`이 다시 렌더링될 때, JSX 결과물은 초기 렌더링 때와 동일하다.
React는 렌더링 출력이 변경되지 않았기 때문에 DOM을 업데이트하지 않는다.
그럼 Effect는 어떨까?
React는 두 번째 렌더링에서의 의존성 배열(`['general']`)을 초기 렌더링 때의 의존성 배열(`['general']`)과 비교한다. **모든 의존성이 동일하기 때문에 React는 두 번째 렌더링에서의 Effect를 무시한다.**

### 다른 의존성으로 재렌더링

이번에는 `<ChatRoom roomId="travel"/>`을 렌더링해보자. 이 때는 컴포넌트가 다른 JSX를 반환하기 때문에, React는 DOM을 업데이트하여 "Welcome to general"을 "Welcome to travel"로 변경한다.
세 번째 렌더링에서의 Effect를 보면, 의존성 배열이 `['general']`에서 `['travel']`로 달라졌기 때문에 새로운 Effect를 적용해야 한다.

```jsx
// 세 번째 렌더링에 대한 Effect (roomId = "travel")
;() => {
  const connection = createConnection("travel")
  connection.connect()
  return () => connection.disconnect()
},
  // 세 번째 렌더링에 대한 의존성 (roomId = "travel")
  ["travel"]
```

React는 세 번째 렌더링의 Effect를 적용하기 전에 먼저 실행된 Effect를 정리해야 한다.
두번째 렌더링의 Effect는 무시되었기 때문에, 첫 번째 렌더링의 Effect가 정리될 것이다. 처음 렌더링되었을 때 클린업 함수를 보면 `createConnection('general')`로 생성된 연결에 대해 `disconnect()`를 호출하는 것을 볼 수 있다. 이렇게 해서 앱은 'general' 채팅방과의 연결이 해제된다.
이후 React는 세 번째 렌더링의 Effect를 실행하고, 앱은 'travel' 채팅방에 연결된다.

### 언마운트

마지막으로, 사용자가 다른 페이지로 이동하게 되어 ChatRoom 컴포넌트가 언마운트 된다고 하자. React는 마지막 Effect의 클린업 함수를 실행하는데, 이는 세 번째 렌더링의 useEffect에서 온 것이다. 세번째 렌더링의 클린업은 `createConnection('travel')` 연결을 종료한다. 그래서 앱은 'travel' 채팅방과의 연결을 해제하게 된다.

### 개발환경에서

Strict Mode가 활성화된 경우, React는 모든 컴포넌트를 한 번 마운트한 후 다시 마운트한다.(이 때 state와 DOM은 보존된다.) 이는 클린업이 필요한 Effect를 탐색하는 데 도움이 되며, Race Condition과 같은 버그를 초기에 발견하기 쉽게 해준다.

## 요약

- 이벤트와 달리 Effect는 특정 상호작용이 아닌 렌더링 자체에 의해 발생한다.
- Effect를 사용하면 컴포넌트를 외부 시스템(타사 API, 네트워크 등)과 동기화할 수 있다.
- 기본적으로 Effect는 모든 렌더링(초기 렌더링 포함) 후에 실행된다.
- React는 모든 의존성이 마지막 렌더링과 동일한 값을 가지면 Effect를 건너 뛴다.
- 의존성을 '선택'할 수 없다. 의존성은 Effect 내부의 코드에 의해 결정된다.
- 빈 의존성 배열은 컴포넌트 마운팅을 의미한다.
- Strict Mode에서 React는 컴포넌트를 두 번 마운트한다.(in 개발환경)
- Effect가 다시 마운트로 인해 중단된 경우 클린업 함수를 구현해야 한다.
- React는 Effect가 다음에 실행되기 전에 클린업 함수를 호출하며, 언마운트 중에도 호출한다.

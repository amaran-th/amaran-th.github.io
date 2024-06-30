---
title: "TanStack Query(React Query)"
date: "2024-06-30T22:29:03.284Z"
description: "TanStack Query에 대해 알아보자"
section: "지식 공유"
category: "React"
tags:
  - React
  - Next.js
thumbnailImg: "./image.jpeg"
---

> 해당 글은 Next.js에서의 사용을 전제로 작성되었습니다.

## TanStack Query란

TanStack Query(전 React Query)란 React 애플리케이션에서 **데이터를 Fetch**하고 **캐싱**하며, 지속적으로 **동기화**하고 **업데이트**하는 작업을 쉽게 할 수 있도록 도와주는 라이브러리이다.

### 캐싱(Caching)

> **캐싱**
> 특정 데이터의 복사본을 저장하여 이후 동일한 데이터에 대한 재접근 속도를 높이는 것.

TanStack Query가 등장하기 전엔 Axios, fetch 등의 라이브러리를 통해 API를 직접 호출해 요청을 처리했다. 당시엔 한 데이터를 여러 개의 컴포넌트가 의존하는 경우, 여러 번의 중복 요청이 발생해 성능이 저하되는 문제가 있었다. TanStack Query는 캐싱을 통해 동일한 데이터에 대한 반복적인 비동기 데이터 호출을 방지하고, 이는 불필요한 API 요청을 줄임으로서 서버에 대한 부하를 줄일 수 있게 해준다.

만일 적절한 때에 캐싱한 데이터를 최신화하지 않으면 캐싱된 데이터와 실제 데이터가 불일치하는 문제가 발생해 사용자에게 잘못된 정보를 제공할 수 있다.
우리는 캐싱된 데이터를 언제 최신화해야 하는걸까?

크게 보면 다음의 세 가지 상황으로 나눌 수 있다.

1. 사용자가 화면을 보고 있을 때
2. 페이지의 전환이 일어났을 때
3. 페이지 전환 없이 이벤트가 발생해 데이터를 요청할 때
   이러한 상황에서 캐싱 데이터를 최신화할 수 있도록, TanStack Query에서는 기본적으로 아래와 같은 옵션을 제공한다.

```js
refetchOnWindowFocus, //default: true
refetchOnMount, //default: true
refetchOnReconnect, //default: true
staleTime, //default: 0
cacheTime, //default: 5분 (60 * 5 * 1000)
```

위의 옵션들을 통해 우리는 TanStack Query가 기본적으로 브라우저에 포커스가 들어온 경우(refetchOnWindowFocus), 새로운 컴포넌트 마운트가 발생한 경우(refetchOnMount), 네트워크 재연결이 발생한 경우(refetchOnReconnect)에 데이터를 Refetch하는 것을 알 수 있다.

### Client 데이터와 Server 데이터의 분리

프로젝트의 규모가 커지고 관리해야 할 데이터가 많아지면, 클라이언트에서 관리하는 데이터와 서버에서 관리하는 데이터가 분리될 필요성을 느낀다.

> Client Data: 모달 관련 데이터, 페이지 관련 데이터
> Server Data: 사용자 정보, 비즈니스 로직 관련 정보(비동기 API 호출을 통해 불러오는 데이터)

실제 Client 데이터의 경우, Redux, Recoil, Zustand와 같은 전역 상태관리 라이브러리를 통해 잘 관리되어 오고 있었으나, 문제는 이러한 라이브러리들이 Server 데이터까지도 관리해야 하는 상황이 되어 Client 데이터와 Server 데이터를 완벽히 분리시켜 관리하기 어려워졌다는 것이다. 즉, 해당 라이브러리들은 Client 데이터를 관리하는 데 로직이 집중되어 있기 때문에 Server 데이터까지 효율적으로 관리하기에는 한계가 명확했다.

TanStack Query는 Server 데이터를 관리하는 라이브러리로서 적합하다.
TanStack Query를 사용하는 한 가지 예시를 가져와보겠다.

```jsx
const { data, isLoading } = useQueries({
	['unique-key'],
	() => {
		return api({
			url: URL,
			method: 'GET',
		});
	},
	{
		onSuccess: (data) => {
			// data로 이것저것 하는 로직
		}
	},
	{
		onError: (error) => {
			// error로 이것저것 하는 로직
		}
	}
})
```

컴포넌트 내부에서 위와 같은 로직을 통해 Server 데이터를 가져오고 있는데, 이 때 onSuccess와 onError 함수를 통해 데이터 Fetch 성공과 실패에 대한 분기를 아주 간단하게 구현할 수 있고, Fetch된 데이터는 쿼리 키('unique-key')를 통해 전역적으로 쉽게 접근할 수 있다.

요약하면, Client 데이터는 상태 관리 라이브러리가 관리하고, Server 데이터는 TanStack Query가 관리하는 구조라고 볼 수 있다. TanStack Query를 통해 우리는 Client 데이터와 Server 데이터를 온전하게 분리할 수 있다.

### 요약

TanStack Query를 사용하면 React 컴포넌트 내부에서 간단하고 직관적으로 API를 호출할 수 있고, 캐싱, Window Focus Refetching 등의 다양한 기능을 통해 API 요청과 관련된 부수적인 기능을 일일이 구현하지 않고 핵심 로직을 구현하는 데 집중할 수 있다.

## 설치

```bash
npm i @tanstack/react-query
```

## QueryClientProvider

```tsx
// src/lib/utils/reactQueryProvider.tsx
"use client"

import React from "react"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

type Props = {
  children: React.ReactNode
}

function ReactQueryProvider({ children }: Props) {
  const [client] = React.useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          // 창이 다시 포커스 될 때 쿼리를 자동으로 다시 가져오는 옵션을 비활성화
          refetchOnWindowFocus: false,
          // 쿼리 재시도를 비활성화
          retry: false,
        },
      },
    })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default ReactQueryProvider
```

```tsx
// src/app/layout.tsx
import ReactQueryProvider from "@/lib/utils/reactQueryProvider"

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="kr">
    <body style={{ margin: 0 }}>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </body>
  </html>
)

export default RootLayout
```

`QueyClientProvider`는 TanStack Query에서 제공하는 컴포넌트 중 하나로, React 트리 안에서 TanStack Query의 상태를 관리하기 위한 컨텍스트를 제공한다. 이 컨텍스트는 하위 컴포넌트에서 TanStack Query를 사용할 수 있도록 해준다.

`QueryClient`는 TanStack Query에서 제공하는 핵심 클래스로, 데이터 쿼리와 관리를 담당한다. QueryClient 인스턴스를 생성하고 초기설정을 하면, 이를 `QueryClientProvider`에 제공하여 애플리케이션의 컨텍스트에 포함시킨다. 이를 통해 애플리케이션 전역에서 TanStack Query를 사용할 수 있게 된다.

## UseQuery

: `GET` 요청과 같은 읽기 작업을 할 때 사용되는 Hook이다.

> 서버 컴포넌트와 클라이언트 컴포넌트를 구분하는 Next.js에서 사용하는 경우, Hook을 사용해야 하기 때문에 클라이언트 컴포넌트에서만 사용할 수 있다.

```tsx
const { data, isLoading, error } = useQuery(쿼리 키, API 호출 함수, 옵션)
```

- 첫 번째 파라미터로 unique key를 포함한 배열이 들어간다. 이후 동일한 쿼리를 불러올 때 유용하게 사용된다.
- 첫 번째 파라미터에 들어가는 배열의 첫 요소는 unique key로 사용되고, 두 번째 요소부터는 query 함수 내부의 파라미터로 값들이 전달된다.
- 두 번째 파라미터로 실제 호출하고자 하는 비동기 함수(=api를 호출하는 함수)가 들어간다. 이때 함수는 Promise를 반환하는 형태여야 한다.
- Hook의 최종 반환 값은 API의 성공, 실패 여부, 반환값 등을 포함한 객체이다.
- userQuery는 **비동기**로 작동하기 때문에, 한 컴포넌트에 여러 개의 쿼리가 있을 때 이들을 동기적으로 실행시키고 싶다면 **useQueries**를 사용하는 것이 좋다.
  - 또는 enabled 속성을 설정해 useQuery를 동기적으로 실행시킬 수 있다.

### 옵션

- enabled(boolean)
  - 쿼리가 자동으로 실행되지 않게 설정하는 옵션이다.(`enabled:(조건)`이면 조건이 true일 때만 실행된다.)
- retry (boolean | number | (failureCount: number, error: TError)=>boolean)
  - default: 3회
  - 실패한 쿼리를 재시도하는 옵션이다.
  - true로 설정하면 쿼리 실패 시 무한 재시도하고, false로 설정하면 재시도를 하지 않는다.
- cacheTime (number | Infinity)
  - default: 5분
  - inactive 상태인 캐시 데이터가 메모리에 남아있는 시간. 이 시간이 지나면 캐시 데이터는 가비지 컬렉터에 의해 메모리에서 제거된다.
- `onSuccess ((data: TDdata) => void)`
  - 쿼리 성공 시 실행되는 함수
  - 매개변수 data는 성공 시 서버에서 넘어오는 response 값이다.
- `onError ((error: TError) => void)`
  - 쿼리 실패 시 실행되는 함수
  - 매개변수로 에러 값을 받을 수 있다.

### 반환 값

- status
  - idle: 초기 상태
  - loading: 데이터 fetching 중일 때 상태. (isFetching === true)
  - error: 데이터 fetch에 실패한 상태.
  - success: 데이터 fetch에 성공한 상태.
- isIdle
- isLoading
- isFetching
- isSuccess
- isError
- isStale
- data: 응답받은 데이터
- error: 실패 정보
- refetch: 수동으로 데이터 refetch를 실행하는 함수. stale이나 cache같은 설정들이 무시되고 무조건 다시 데이터를 fetching한다.

### 사용 예시

```ts
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  )
}

function Example() {
  const { isPending, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: () =>
      fetch("https://api.github.com/repos/tannerlinsley/react-query").then(
        res => res.json()
      ),
  })

  if (isPending) return "Loading..."

  if (error) return "An error has occurred: " + error.message

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{" "}
      <strong>✨ {data.stargazers_count}</strong>{" "}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  )
}
```

## useMutation

: `POST`, `PUT`, `DELETE` 요청과 같은 수정 작업을 할 때 사용되는 Hook이다.

```tsx
const mutation = useMutation(API 호출 함수, 옵션);
```

- 반환값은 useQuery와 동일하다.
- useQuery와의 차이점은, 첫 번째 파라미터에 비동기 함수가 들어가고, 두 번째 인자에 옵션이 들어간다는 점이다.
- 실제 사용시에는 mutation.mutate() 메서드를 사용하고, 첫 번째 인자로 API 호출 시에 전달해줄 데이터를 넣어주면 된다.

### 사용 예시

```ts
function App() {
  const mutation = useMutation({
    mutationFn: newTodo => {
      return axios.post("/todos", newTodo)
    },
  })

  return (
    <div>
      {mutation.isLoading ? (
        "Adding todo..."
      ) : (
        <>
          {mutation.isError ? (
            <div>An error occurred: {mutation.error.message}</div>
          ) : null}

          {mutation.isSuccess ? <div>Todo added!</div> : null}

          <button
            onClick={() => {
              mutation.mutate({ id: new Date(), title: "Do Laundry" })
            }}
          >
            Create Todo
          </button>
        </>
      )}
    </div>
  )
}
```

## Next.js에서의 사용

React Query는 SSR(또는 SSG) 환경에서 다음의 두 가지 Prefetching 방식을 제공한다.

- initialData: 서버 컴포넌트에서 데이터 prefetch 및 클라이언트 컴포넌트로 initialData Prop을 전달하는 방법
- Hydrate: 서버에서 쿼리를 prefetch하고 캐시를 dehydrate한 후, Hydrate로 클라이언트에게 rehydrate해주는 방법(추후 따로 포스팅)

### InitialData 사용

useQuery의 initialData 옵션을 설정하면, 설정한 데이터가 쿼리 캐시의 초기 데이터로 사용된다.(쿼리가 아직 생성되지 않았거나 캐시되지 않았을 때)
Next.js의 `getStaticProps`나 `getSeverSideProps` 함수를 통해 fetch한 데이터를 useQuery의 initialData 옵션으로 넘겨주는 방식으로 데이터를 Prefetching할 수 있다.
이 방식은 단순하고 어떤 상황에서는 가장 빠른 방법일 수 있지만, 몇 가지 트레이드 오프가 존재한다.

- 만일 useQuery를 컴포넌트 트리 깊숙이 존재하는 컴포넌트에서 호출한다면, initialData를 그 지점까지 넘겨주어야 한다.(getStaticProps, getServerSideProps는 페이지 수준의 컴포넌트에서만 사용할 수 있기 때문에)
- 만일 useQuery를 같은 쿼리로 여러 위치에서 호출한다면, 호출하는 지점 모두에 initialData를 일일이 전달해주어야 한다.

```tsx
export async function getStaticProps() {
  const posts = await getPosts()
  return { props: { posts } }
}

function Posts(props) {
  const { data } = useQuery(["posts"], getPosts, { initialData: props.posts })
  // ...
}
```

## 참고 자료

- [Next.js에서 React Query (v5) 사용하기](https://velog.io/@bohongu/Next.js%EC%97%90%EC%84%9C-React-Query-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-v5)
- [[Next.js] React-Query 사용하기 (with SSR/SSG)](https://velog.io/@mjieun/Next.js-React-Query-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-with-SSRSSG)
- [React Query 푹 찍어먹기](https://velog.io/@kandy1002/React-Query-%ED%91%B9-%EC%B0%8D%EC%96%B4%EB%A8%B9%EA%B8%B0)
- [React-Query 도입기](https://velog.io/@chltpdus48/React-Query-%EB%8F%84%EC%9E%85%EA%B8%B0)

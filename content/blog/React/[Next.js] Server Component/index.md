---
title: "[Next.js] Server Component"
date: "2024-06-02T23:54:03.284Z"
description: "서버 컴포넌트와 클라이언트 컴포넌트에 대해 알아보자"
section: "지식 공유"
category: "React"
tags:
  - Nextjs
  - React
---

이번에 처음 Next.js 프로젝트에 참여하면서 아래와 같은 오류를 보게 되었다.

![](https://i.imgur.com/67L24wz.png)
이 오류는 파일 최상단에 'use client' 키워드를 작성해줌으로써 해결할 수 있었다.
오늘은 Next.js에서 use client가 어떤 기능을 하는지, 그 기반 지식이 되는 Client Component, Server Component에 대해서도 알아보도록 하겠다.

## Server Component와 Client Component 개념의 등장 배경

React 18 버전 이전까지는 React 애플리케이션을 렌더링하는 주체가 클라이언트였다. Next.js는 생성한 HTML을 React를 통해 hydration되도록 클라이언트에 전송함으로써, 어플리케이션을 pages로 나누고 서버에서 prerender하는 쉬운 방법을 제공했다. 그러나 이 방법은 초기 HTML 요소를 인터랙티브하게 만들기 위해 추가적인 JavaScript 코드를 필요로 했다.

Next.js 13버전부터는 서버 컴포넌트와 클라이언트 컴포넌트를 사용하여 클라이언트 또는 서버에서 React를 렌더링할 수 있게 되었다. 즉, 컴포넌트 수준에서도 렌더링 환경을 선택할 수 있게 된 것이다.

## Server Component

서버 단에서 렌더링되는 컴포넌트를 의미한다.

사용자가 직접 상호작용하는 버튼, 검색창과 같은 UI 등을 제외한 나머지 컴포넌트가 이에 해당된다.

Next.js에서 기본적으로 모든 컴포넌트는 React Server Component이다.

- 특징
  - 자바스크립트 번들을 감소시킬 수 있다.
  - Hydration 과정이 없다.
    - Hydration : 정적인 HTML 요소들에 JS 코드들을 결합해 버튼 클릭에 따른 이벤트 처리 등이 가능하도록 만드는 것.
  - Event Listener(onClick 등)를 사용할 수 없다.
  - React Hooks(useEffect 등)를 사용할 수 없다.
  - Client Component를 사용할 수 없다.
  - async 함수로 정의할 수 있다.

## Client Component

클라이언트 단에서 렌더링되는 UI 컴포넌트를 의미한다.
Next.js에서 Client Component로 사용하고 싶은 경우, 파일 최상단에 'use client'를 입력해주면 된다.

'use client'를 파일 최상단에 입력하면, 해당 파일의 하위 구성요소들을 포함해 해당 파일로 import한 다른 모든 모듈이 클라이언트 번들의 일부로 간주된다.

## 서버 컴포넌트와 클라이언트 컴포넌트의 활용 사례

서버 컴포넌트의 경우, Data Fetch, 백엔드 리소스 접근, 민감한 정보(액세스 토큰, API 키 등)를 서버에 저장할 때, 서버에 대한 의존성을 크게 두고 클라이언트 측 JavaScript를 줄이고자 할 때 사용하기 적합하다.
클라이언트 컴포넌트의 경우, 상호작용/이벤트 리스너가 추가된 경우, 상태 및 수명주기 함수(useState(), useEffect() 등)를 사용하는 경우, 브라우저 전용 API를 사용하는 경우, 상태, 효과 또는 브라우저 전용 API에 따라 달라지는 사용자 정의 hook를 사용할 때, React 클래스 컴포넌트를 사용할 때 사용하기 적합하다.
![](https://i.imgur.com/yEhp8Gy.png)
이 이미지에서 사용자 상호작용이 잘 일어나지 않는 Navbar, Side bar 등이 서버 컴포넌트에 해당하고, onChange 이벤트와 useState를 사용하는 검색창, 클릭 이벤트가 발생하는 버튼 등이 클라이언트 컴포넌트에 해당한다.

다음의 사례에서, toggle.js에서 onClick(), useState()를 사용하고 있기 때문에, "use client" 키워드를 사용하지 않으면(=클라이언트 컴포넌트로 지정하지 않으면) 오류가 발생하게 된다.
![](https://i.imgur.com/BreNqhk.png)

## SSR과 Server Component의 차이

서버컴포넌트는 서버에서 렌더링된다는 점에서 SSR과 유사한데, 차이점을 알아보면 다음과 같다.
SSR은 서버에서 렌더링된 HTML을 가져오지만, 서버 컴포넌트는 HTML이 아닌 렌더링할 트리 객체를 가져온다. 트리 객체는 서버 컴포넌트와 클라이언트 컴포넌트로 구성되어 있으며(서버 컴포넌트 안에 클라이언트 컴포넌트가 포함된), 트리를 보고 DOM을 업데이트하게 된다.

즉, 리액트 서버 컴포넌트는 각각의 컴포넌트마다 클라이언트 컴포넌트로 렌더할 것인지 클라이언트 컴포넌트로 렌더할 것인지를 선택하게 하고, SSR은 페이지당, 해당 페이지 자체를 서버사이드 렌더링을 하도록 한다.

## 참고 자료

- [[Next.js 13] Server Component 란? (feat.use client)](https://velog.io/@tnrud4685/Next.js-13%EB%B2%84%EC%A0%84)

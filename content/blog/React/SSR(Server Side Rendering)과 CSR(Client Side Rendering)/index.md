---
title: "SSR(Server Side Rendering)과 CSR(Client Side Rendering)"
date: "2024-05-19T19:55:03.284Z"
description: ""
section: "지식 공유"
category: "React"
tags:
  - Nextjs
  - React
thumbnailImg: "./scr.png"
---

## 렌더링

렌더링이란 서버로부터 받은 페이지에 대한 HTML 응답을 브라우저 화면에 표시하는 것을 뜻한다.
렌더링은 다음의 과정에 따라 이루어진다.

- Loader가 서버로부터 페이지 정보(HTML)을 불러온다.
- 파싱을 통해 HTML 문서를 DOM Tree로 만든다.
- DOM 트리가 구축되는 동안 브라우저는 렌더 트리를 구축한다.
- CSS 설정 및 레이아웃 위치가 지정된다.
- 렌더링 트리가 그려진다.

렌더링은 방식에 따라 **클라이언트 사이드 렌더링**과 **서버 사이드 렌더링**으로 분류된다.
![](https://i.imgur.com/ug0sO16.png)
<br/>
![](https://i.imgur.com/2e1rDp5.png)

## SPA(Single Page Application)와 클라이언트 사이드 렌더링

클라이언트 사이드 렌더링에 대해 본격적으로 알아보기 전에, SPA의 개념을 짚고 넘어가자.

SPA란 최초 한 번 페이지 전체를 로딩한 후, 이후부터는 데이터만 변경하여 사용할 수 있는 단일 페이지로 구성된 웹 애플리케이션을 의미한다. SPA의 대표적 예시인 리액트 애플리케이션은 하나의 HTML 파일에 모든 페이지에 대한 정보가 포함되어 있다. SPA에서는 화면 구성에 필요한 모든 HTML을 클라이언트(브라우저)가 갖고 있다.

SPA는 클라이언트 사이드 렌더링에 해당하는데, 클라이언트 사이드 렌더링이란 클라이언트(브라우저)에서 렌더링을 진행하는 렌더링 방식이다. 클라이언트 사이드 렌더링은 클라이언트 측에서 최초에 1번 서버에서 전체 페이지를 로딩하여 보여주고, 이후에는 사용자의 요청이 올 때마다 서버로부터 데이터를 제공받고 이를 클라이언트가 해석하고 렌더링한다.

클라이언트 사이드 렌더링에서 브라우저는 서버로부터 빈 HTML 파일을 받고, 이후 JS 파일을 해석해 모든 view를 만들어낸다.

- 장점
  - 서버의 부하를 줄일 수 있다.
  - 사용자의 행동에 따라 필요한 부분만 다시 읽어들일 수 있어 SSR보다 조금 더 빠르게 인터랙션할 수 있다.
  - Lazy Loading(페이지 로딩 시 중요하지 않은 리소스의 로딩을 늦추는 기술)이 지원된다.
  - 서버사이드 렌더링에 비해 일관성 있는 코드를 작성할 수 있다.
- 단점 - Googlebot과 Searchconsole에 검색 노출이 되지 않는다.(SEO 취약) - 페이지와 자바스크립트를 읽고 화면을 그리는 시간까지 모두 마쳐야 렌더링이 진행되기 때문에 초기 구동 속도가 느리다.
  ![](https://i.imgur.com/ViOvPWr.png)
  그림의 FCP는 First Paint의 약자로 픽셀이 처음으로 사용자에게 표시되는 시점을 의미한다.
  TTI는 Time To Interactive로, 페이지가 상호작용 가능한 상태가 되기까지의 시간이다.
  FCP 이후부터 렌더가 완료되기 전까지는 사용자에게 빈 화면이 출력되게 된다.

## 서버 사이드 렌더링

서버에서 렌더링을 작업하는 렌더링 방식. 전통적인 웹 애플리케이션 렌더링 방식으로, 사용자가 웹 페이지에 접근할 때 서버에 각각의 페이지에 대한 요청을 하며 서버에서 html, js 등을 다 다운로드 한 뒤 화면에 렌더링하는 방식이다.

서버 사이드 렌더링에서 브라우저는 서버로부터 모든 HTML 컴포넌트가 포함된 HTML 파일을 받게 되고, 이를 렌더링하고(Pre-Rendering) 그 뒤에 JS를 로딩한다.
![](https://i.imgur.com/cg3bJ2O.png)

- 장점
  - 사용자가 처음으로 컨텐츠를 볼 수 있는 시점을 앞당길 수 있다.
  - SEO(검색엔진 최적화)가 좋다.
- 단점
  - 모든 요청에 관해 필요한 부분만 수정하는 것이 아니라, 완전히 새 페이지를 로딩하고 렌더해준다.(새로고침)
  - 전체를 로딩하다보니 CSR보다 느리고, 사용자 경험이 좋지 않다.
    - 사용자가 컨텐츠를 빨리 볼 수 있지만 js 파일이 다 다운로드 되지 않아 버튼이 클릭되지 않는 등의 현상이 있을 수 있음.

## 참고 자료

- [SSR vs CSR- which is the right choice for your Progressive Web App (PWA)?](https://kruschecompany.com/ssr-or-csr-for-progressive-web-app/)
- [SPA / Client Side Rendering 그리고 Server Side Rendering](https://velog.io/@haileyself/SPA-Client-Side-Rendering-%EA%B7%B8%EB%A6%AC%EA%B3%A0-Server-Side-Rendering-90k4ar8is1)
- [[개발지식] Client Side Rendering & Server Side Rendering 차이점에 대해서 아시나요?](https://junghyeonsu.tistory.com/258)

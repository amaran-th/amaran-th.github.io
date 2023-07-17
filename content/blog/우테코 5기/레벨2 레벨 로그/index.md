---
title: "레벨2 레벨 로그"
date: "2023-06-07T20:06:03.284Z"
description: "레벨2 기간동안 배운 내용에 대한 정리"
category: "우테코 5기"
tags:
  - TIL
  - 우아한 테크코스
thumbnailImg: "../thumbnail.jpg"
---

### 레벨로그

- **Spring Core**
  - Spring Bean
  - IoC Container
  - Component Scan
  - @Controller 어노테이션과 @RestController 어노테이션
- **Authorization - 쿠키, 세션, 토큰**
- **Spring Test**
  - 테스트의 종류와 스프링에서 지원하는 테스트 관련 어노테이션의 종류
  - Mockito
  - webEnvironment
  - 테스트 격리
    - 트러블 슈팅 → DDl 쿼리 충돌(Application Context 충돌) 해결
  - Code Coverage
- **Spring Web MVC 구조**
  - Interceptor & ArgumentResolver
  - View Resolver
  - Dispatcher Servlet
- Layered Architecture
- **인프라**
  - 서버 배포 방법
  - Actuator 라이브러리와 Health Check
  - CORS
  - Logging
  - Github Action으로 자동배포하기
  - RESTDocs 문서화
- 기타
  - 프로세스와 스레드
  - Entity의 생성시간/수정시간을 DB에 자동으로 등록하는 방법
  - jgrapht 라이브러리의 사용법
  - Github 소셜 로그인 구현 코드 분석
  - 블로그 검색엔진 최적화
  - HTTP 상태코드의 종류
  - 요구 공학 프로세스

### 레벨로그 질문지

- Spring Bean들은 Spring 내에서 어떻게 관리되나요? (생명주기와 결합해서)
- Spring Bean의 Scope에는 여러가지가 있는데, 기억나는 대로 설명해주실 수 있나요?
- Spring의 모든 객체를 스프링 빈으로 등록하지 않는 이유?
- IoC 컨테이너에서 BeanFactory와 ApplicationContext의 차이는 무엇인가요?
- Spring에서 Component Scan의 목적은 무엇인가요?
- Component Scan의 단점이나 성능적으로 고려해야 할 사항이 있을까요?
- 컴포넌트 스캔을 할 때 어떤 상황에서 충돌이 발생하나요?
  - 해결 방법은?
- 쿠키 기반 인증을 구현할 때 어떤 보안 문제를 고려해야 하나요?
  - 해당 보안 문제를 어떻게 해결할 수 있을까요?
- 토큰 기반 인증은 쿠키 및 세션 기반 인증과 어떤 차이가 있나요?
- 테스트에는 어떤 종류가 있나요?
  E2E 테스트, 통합 테스트, 인수 테스트, 슬라이스 테스트, 단위 테스트
- 인수 테스트와 E2E 테스트의 차이는 무엇인가요?
- Mockito를 어떤 상황에서 사용해보셨나요?
- Mockist이신지, Classist인지? 그 이유는?
- 기존 Sevlet에서의 동작 구조와 비교해서 Spring Web MVC가 갖는 장점은 무엇인가요?
- Spring Web MVC 구조가 나오게 된 배경을 알고 있나요?
- Interceptor는 Filter와 어떻게 다른가요?
- Interceptor와 ArgumentResolver의 차이는?
- Interceptor와 ArgumentResolver를 왜(어떤 상황에서) 사용하셨나요?
- View Resolver는 어떻게 동작하나요?
- Dispatcher Servlet의 역할은 무엇인가요?
- Dispatcher Servlet이 요청을 처리하는 플로우를 설명해주세요
- Health Checking의 목적은 무엇인가요?
- CORS는 브라우저의 문제인가요, 서버의 문제인가요?
  - 브라우저의 문제인데 서버에서 처리해주어야 하는 이유는 무엇인가요?
- Logging은 왜 필요한가요?
- 로깅 프레임워크로 어떤 것을 사용했나요? 장점은?
- 다른 툴과 비교해서 RESTDocs를 선택하신 이유가 있나요?

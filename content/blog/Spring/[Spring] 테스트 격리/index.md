---
title: "[Spring] 테스트 격리"
date: "2023-12-19T19:28:03.284Z"
description: "테스트 격리에 대해 알아보고 @SpringBootTest를 사용했을 때 겪을 수 있는 문제에 대해 알아보자."
section: "지식 공유" 
category: "Spring"
tags:
  - 테스트
  - Spring
---

## 테스트 격리란?
**테스트 격리**란 여러 테스트를 함께 실행하는 상황에서 각 테스트가 다른 테스트의 상태나 결과에 의존하지 않도록 하는 전략입니다. 쉽게 말해 테스트가 다른 테스트에게 영향을 주지 않고 독립적으로 실행되도록 하는 것입니다.

이런 맥락에서 영속성 계층을 포함하는 테스트의 경우, `@Transactional` 어노테이션을 붙여 테스트 별로 DB 변경사항을 롤백되도록 하는 것이 일반적입니다.

테스트 격리를 보장하는 대표적인 어노테이션으로, `@DataJpaTest`이 있습니다.
`@DataJpaTest`는 영속성 계층(JPA 컴포넌트)을 테스트하기 위한 테스트 어노테이션으로, ApplicationContext 전체가 아닌 JPA에 필요한 설정들에 대해서만 Bean을 등록합니다.
`@DataJpaTest`는 `@Transactional` 어노테이션을 포함하고 있기 때문에, 각 테스트가 종료될 때마다 DB 상태가 롤백됩니다.
## @SpringBootTest와 테스트 격리
`@SpringBootTest`는 스프링부트에서 **통합 테스트** 환경을 제공하는 기본적인 테스트 어노테이션입니다.
`@SpringBootTest`의 webEnvironment 속성을 RANDOM_PORT나 DEFINED_PORT로 설정해주고 통합테스트를 실행시키면, 테스트 메서드에 `@Transactional` 어노테이션을 붙여도 트랜잭션이 롤백되지 않습니다. 즉, 테스트 격리가 보장되지 않습니다.

### 왜 그럴까?
이유는 `@SpringBootTest`가 RANDOM_PORT 또는 DEFINED_PORT를 사용하는 경우, HTTP 클라이언트와 요청을 받아 처리하는 서버가 **서로 다른 스레드**에서 동작하기 때문입니다.

이것이 무슨 말이냐 하면, `@SpringBootTest` 어노테이션에 포트번호를 지정해주면(RANDOM_PORT, DEFINED_PORT 등) 스프링 부트는 localhost의 특정 포트에 통합 테스트를 위한 서버를 띄우게 되는데, 이 서버에 요청을 보내는 클라이언트 코드(=테스트 코드. 이 때 사용하는 대표적인 라이브러리로 RestAssured가 있습니다.)를 실행하는 스레드와 요청을 처리하는 서버가 동작하는 스레드가 다르다는 것입니다.

즉 두 작업은 별개의 트랜잭션을 가지게 되므로 `@SpringBootTest` 테스트의 클라이언트 코드가 롤백되더라도 서버 쪽의 트랜잭션은 롤백되지 않습니다.
![](https://i.imgur.com/aU4V1TN.png)

때문에 `@SpringBootTest`로 통합테스트를 실행하면 각 테스트의 수행 결과가 다른 테스트들의 동작에 영향을 줄 수 있습니다.

이 문제를 해결하기 위해서는, 매 테스트가 끝날 때마다 **직접 DB의 상태를 초기화**해주어야 합니다.

### @Sql 어노테이션

DB를 초기화하는 쿼리문을 작성해놓고, 각 테스트를 수행하기 전에 해당 쿼리문을 읽어 실행시키는 방법입니다.

```sql
-- truncate.sql
TRUNCATE TABLE menu;
TRUNCATE TABLE member;
ALTER TABLE menu ALTER COLUMN id RESTART WITH 1;
ALTER TABLE member ALTER COLUMN id RESTART WITH 1;
```
```java
@SpringBootTest
@Sql("/truncate.sql")
public class Test{
	...
}
```

> ✨ 다음과 같은 쿼리문을 통해 Auto Increment id의 시작 값을 초기화할 수 있습니다.
> ```sql
> ALTER TABLE 테이블명 ALTER COLUMN id RESTART WITH 1;
> ```
> 참고로 MySQL의 경우 Truncate문을 사용하면 id 시작 값이 자동으로 초기화가 되지만, H2는 초기화되지 않기 때문에 주의해야 합니다.
## 참고 게시글
---
- [[Spring] @SpringBootTest의 테스트 격리시키기(TestExecutionListener), @Transactional로 롤백되지 않는 이유](https://mangkyu.tistory.com/264)
- [테스트 격리(Test Isolation)](https://velog.io/@ljinsk3/%ED%85%8C%EC%8A%A4%ED%8A%B8-%EA%B2%A9%EB%A6%ACTest-Isolation)
- [[Spring]@SpringBootTest에서 @Transactional이 적용되지 않는 경우](https://notbusyperson.tistory.com/47)
- [[트러블슈팅] @SpringbootTest의 RANDOM_PORT 환경에서 @Transactional 어노테이션을 사용했을 때, RestAssured GET 요청이 수행되지 않는 경우(트랜잭션 격리 이해하기)](https://velog.io/@rg970604/%ED%8A%B8%EB%9F%AC%EB%B8%94%EC%8A%88%ED%8C%85-SpringbootTest%EC%9D%98-RANDOMPORT-%ED%99%98%EA%B2%BD%EC%97%90%EC%84%9C-Transactional-%EC%96%B4%EB%85%B8%ED%85%8C%EC%9D%B4%EC%85%98%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%96%88%EC%9D%84-%EB%95%8C-RestAssured-GET-%EC%9A%94%EC%B2%AD%EC%9D%B4-%EC%88%98%ED%96%89%EB%90%98%EC%A7%80-%EC%95%8A%EB%8A%94-%EA%B2%BD%EC%9A%B0)
- [TRUNCATE TABLE 시 AUTO_INCREMENT 컬럼 1로 초기화](https://www.inflearn.com/questions/868672/truncate-table-%EC%8B%9C-auto-increment-%EC%BB%AC%EB%9F%BC-1%EB%A1%9C-%EC%B4%88%EA%B8%B0%ED%99%94)

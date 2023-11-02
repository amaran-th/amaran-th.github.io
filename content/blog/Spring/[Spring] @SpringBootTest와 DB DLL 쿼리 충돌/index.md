---
title: "[Spring] @SpringBootTest와 DB DLL 쿼리 충돌"
date: "2023-05-03T15:32:03.284Z"
description: "@SpringBootTest가 ApplicationContext를 생성하는 원리와 DLL 쿼리 충돌 문제를 해결하는 방법에 대해 알아보자"
section: "지식 공유" 
category: "Spring"
tags:
  - 우아한 테크코스
  - 테스트
  - Spring
---

## 서론

---

스프링을 공부한 지 얼마 안된 시점… 우테코에서 장바구니 미션을 진행하다가 @SpringBootTest를 여러 테스트 클래스에 추가하게 되었는데, DDL 쿼리를 실행시키는 데 충돌을 경험했고, `@SpringBootTest`를 여러 개 만들어서 실행시키면 각각의 테스트가 새로운 서버를 띄우는건지, 별개의 DB를 사용하는 건지, 등등…여러 궁금증이 생겼다.

이런 궁금증을 해소하기 위해 주변 크루들의 도움을 받아 이해한 대로 정리해보았다.

## @SpringBootTest가 ApplicationContext를 생성하는 원리

---

Spring은 `@SpringBootTest`를 실행하면 **ApplicationContext**를 생성해서 모든 스프링 Bean들을 등록한다.

만약 `@SpringBootTest`로 등록한 테스트 클래스가 여러 개고, 그 테스트 클래스를 한 번에 모두 실행시킨다고 하자.

이 때 `@SpringBootTest`들의 webEnvironment 속성이 동일한 경우 `@SpringBootTest`가 실행될 때마다 ApplicationContext를 새로 생성하지 않고, 처음 생성된 ApplicationContext를 그대로 사용한다.(ContextCache에 저장됨)

webEnvironment 속성을 비롯한 설정 정보들이 달라질 때 ApplicationContext을 새로 생성한다.

- **webEnvironment 별로 ApplicationContext가 처음 생성될 때 ContextCache에 저장된다.**
  ⇒webEnvironment 속성이 동일할 때 캐싱된 ApplicationContext가 없다면 새로 생성하고, 있다면 캐싱된 ApplicationContext를 가져와서 사용한다.
- **ApplicationContext가 처음 생성될 때마다 DB Connection을 연결한다.**
  - 이 때 생성된 DB Connection들은 모든 테스트가 종료된 후에 끊어진다.
    💡 sql 스크립트는 DB Connection이 연결될 때 한 번 실행된다.

<aside>
⚠️ ApplicationContext가 여러 개다 ≠ 구동된 웹 서버가 여러 개다
테스트를 실행할 때 생성된 ApplicationContext가 여러 개라도 하나의 서버(=같은 포트)를 사용한다.

</aside>

## DDL 쿼리 충돌(Conflict) 문제

---

아래와 같은 3개의 Test를 작성했다고 가정하자.

```java
1. Test1(MOCK) - @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
2. Test2(RANDOM_PORT) - @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
3. Test3(RANDOM_PORT) - @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
```

만약, webEnvironment가 다른 @SpringBootTest를 실행할 경우, ApplicationContext가 여러 개 생성되고(위 경우에선 2개), DB Connection도 여러 개(2개)가 생성이 된다.

따라서 **동일한 sql 스크립트가 여러 번(2번) 실행**되고, create table 구문의 경우 별도의 처리를 해주지 않은 경우 충돌이 발생한다.

### 해결책

1. 테이블 생성 전에 테이블을 Drop한다.

   ```sql
   DROP TABLE product IF EXISTS;

   CREATE TABLE product(
       `id` BIGINT NOT NULL AUTO_INCREMENT,
       `name` VARCHAR(20) NOT NULL,
       `price` INT NOT NULL,
       `image_url` TEXT NOT NULL,
       PRIMARY KEY(id)
   );
   ```

2. DDL 구문에 `IF NOT EXISTS`을 사용한다.

   : 이미 테이블이 존재할 경우 해당 쿼리를 실행하지 않는다.

   ```sql
   CREATE TABLE IF NOT EXISTS product(
       `id` BIGINT NOT NULL AUTO_INCREMENT,
       `name` VARCHAR(20) NOT NULL,
       `price` INT NOT NULL,
       `image_url` TEXT NOT NULL,
       PRIMARY KEY(id)
   );
   ```

   <aside>
   ⚠️ sql 스크립트에 DML 쿼리가 포함되어 있다면 해당 쿼리도 중복 실행된다.(insert가 2번 일어난다든지)

   이 경우 다음과 같이 INSERT 쿼리에 ON를 사용해 해결할 수 있다.

   ```sql
    INSERT INTO users (NAME, email) VALUES ('값1', '값2') ON DUPLICATE KEY UPDATE name='값1', email='값2';
   ```

   동일한 key가 존재하지 않을 때는 데이터를 추가하고, 이미 동일한 key가 존재하는 경우 데이터를 업데이트한다.

   </aside>

3. `@AutoConfigureTestDatabase`

   해당 어노테이션을 붙여주면 application-properties에 정의된 DataSource가 아니라 auto-configure된Datasource로 생성된 **인메모리 DB**를 사용한다.

   <aside>
   ⚠️ @AutoConfigureTestDatabase를 붙인 테스트마다 같은 DB를 공유하는 것은 마찬가지이기 때문에, ApplicationContext가 3개 이상이라면 사용할 수 없는 방법이다.
   ⇒<b>@AutoConfigureTestDatabase마다 새 DB를 생성하는 것이 아님!</b>

   </aside>

4. (2023-05-25 추가) `@SpringBootTest` 어노테이션을 사용하는 테스트의 경우, `webEnvironment` 속성을 `RANDOM_PORT`로 설정해주면, 새로운 포트를 사용하는 것이기 때문에 새 DB를 받아 사용하게 된다.

## 참고 자료

---

[[Spring] @SpringBootTest에서 환경이 다른 여러 테스트 실행 시 DDL을 여러번 실행하는 오류 트러블 슈팅하기](https://ksh-coding.tistory.com/95)

---
title: "[기술부채] 우테코 5기 레벨4 - 1주차"
date: "2023-09-10T01:42:03.284Z"
description: "우테코 레벨 4 1주차 기술 부채"
category: "우테코 5기"
tags:
  - 기술 부채
  - Spring
  - 우아한 테크코스
thumbnailImg: "../thumbnail.jpg"
---

## 자잘한 기술부채

---

### ✅@TransactionEventListener

@EventListener는 event를 publishing 하는 코드 시점에 바로 publishing되는 반면, @TransationEventListener의 경우 Transaction이 종료되는 시점에 event가 publishing한다.

event를 publishing하는 코드 작업은 @Transactional 어노테이션에 의해 롤백되지 않기 때문에, 불일치가 발생할 수 있다.

<aside>
⚠️ @Transactional 어노테이션 없이 @TransactionalEventListener를 사용하는 경우, Event가 발생하지 않는다.

</aside>

[[Spring] Spring의 Event를 어떻게 사용하는지에 대해서 알아봅시다. - @TransactionalEventListener에 대해서](https://sabarada.tistory.com/188)

### ✅트랜잭션 전파 설정

트랜잭션 내부에서 트랜잭션을 또 호출하는 경우, 해당 트랜잭션을 어떻게 처리할지를 설정하는 것.

- REQUIRED(기본값) - 부모 트랜잭션으로 합류. 부모 트랜잭션이 없다면 새로운 트랜잭션을 생성.
    
    만일 도중에 롤백이 발생한다면 모두 하나의 트랜잭션으로 취급하기 때문에 진행상황이 모두 롤백된다.
    
- REQUIRES_NEW - 새로운 트랜잭션을 생성한다. 각각의 트랜잭션이 롤백되더라도 서로 영향을 미치지 않는다.
- MANDATORY - 부모 트랜잭션에 합류. 부모 트랜잭션이 없다면 예외 발생.
- NESTED - 부모 트랜잭션이 있는 경우 중첩 트랜잭션 생성.
    
    중첩된 트랜잭션 내부에서 롤백이 발생할 경우 해당 중첩 트랜잭션의 시작 지점까지만 롤백된다.
    
    부모 트랜잭션이 커밋될 때 같이 커밋된다.
    
    부모 트랜잭션이 없다면 새로운 트랜잭션 생성.
    
- NEVER - 트랜잭션을 생성하지 않는다. 부모 트랜잭션이 존재하면 예외 발생

### ✅@AutoConfigureTestDatabase

@DataJpaTest와 함께 사용되는 어노테이션으로, 테스트 시 사용할 DB를 설정하는 어노테이션이다.

replace 속성 값

- Replace.Any - 내장된 임베디드 데이터베이스 사용
- Replace.NONE - @ActiveProfiles에 설정한 프로파일 환경 값에 따른 데이터 소스가 적용

[스프링 부트 테스트 : @DataJpaTest](https://webcoding-start.tistory.com/20)

[[JPA] @DataJpaTest 사용할 DB 변경](https://emgc.tistory.com/143)
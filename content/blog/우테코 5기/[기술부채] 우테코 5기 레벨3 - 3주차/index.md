---
title: "[기술부채] 우테코 5기 레벨3 - 3주차"
date: "2023-07-18T09:23:03.284Z"
description: "우테코 레벨 3 3주차 기술 부채"
section: "지식 공유" 
category: "우테코 5기"
tags:
  - 기술 부채
  - Spring
  - 우아한 테크코스
thumbnailImg: "../thumbnail.jpg"
---

## 자잘한 기술부채

---

### ✅오프셋 기반 & 커서 기반 페이지네이션

- **페이지네이션(Pagination)** : 데이터베이스의 데이터 자원을 효율적으로 활용하기 위해 특정한 정렬 기준에 따라 데이터를 분할하여 가져오는 것. 크게 오프셋 기반, 커서 기반으로 분류된다.
- **오프셋 기반 페이지네이션(Offset-based Pagination)**

  : 페이지 단위로 구분하여 요청/응답

  ⇒ 요청 데이터로 page(페이지 번호 = offset(건너 뛸 개수)), size(페이지 당 데이터 개수)를 받는다.

  - 문제
    - 페이지 요청 사이 데이터에 변화가 있는 경우 중복 데이터가 발생할 수 있다.
    - 대부분의 RDBMS에서 OFFSET 쿼리의 성능 문제(OFFSET 값에 매우매우 큰 값이 들어감)

- **커서 기반 페이지네이션(Cursor-based Pagination)**

  : Cursor 개념을 사용하여 사용자에게 응답해준 마지막 데이터 기준으로 다음 데이터를 요청/응답

  ⇒주로 무한 스크롤로 구현된다.

⭐어떻게 구현하는지는 아래 게시글 참조(아니면 추후 따로 포스팅 해보겠다)

[[DB] 커서 기반, 오프셋 기반 페이지네이션 - SW Developer](https://wonyong-jang.github.io/database/2020/09/06/DB-Pagination.html)

### ✅@ElementCollection, @CollectionTable

JPA에서 데이터 타입은 엔티티 타입과 값 타입으로 분류된다.

값 타입은 기본 값 타입과 임베디드 타입, 값 타입 컬렉션으로 분류된다.

- 값 타입의 분류
  - **기본 값 타입** : 자바 Primitive 타입, 래퍼 클래스(Integer, Long, …), String
  - **임베디드 타입(복합 값 타입)** : @Embeddable, @Embedded
  - **값 타입 컬렉션** : 여러 개의 값 타입을 저장할 때 사용. 자바의 컬렉션을 사용함.(@ElementCollection, @CollectionTable)
- 값 타입 컬렉션 사용 예제

  ```java
  @Entity
  public class Person {

      @Id
  		@GeneratedValue
      private Long id;

      private String name;

      @ElementCollection
      @CollectionTable(
          name = "foods",
          joinColumns = @JoinColumn(name = "person_id")
      )
      @Column(name = "food_name") //값이 하나고 내가 정의한 것이 아니기 때문에 예외적으로 컬럼명 변경 허용
      Set<String> favoriteFoods = new HashSet<>();

      @ElementCollection
      @CollectionTable(
          name = "address",
          joinColumns = @JoinColumn(name = "person_id")
      )
      List<Address> addressList = new ArrayList<>();

      ...
  }
  ```

  `@CollectionTable` 어노테이션을 사용해 테이블의 이름과 외래 키를 지정해주면, JPA는 Person 엔티티와 일대다 관계에 있는 테이블을 생성해준다.
  값 타입 컬렉션은 엔티티와 같은 생명 주기를 따라가기 때문에, 값을 저장/삭제할 때 일반 자바에서와 동일하게 컬렉션을 사용하면 그대로 DB에 반영된다.

- 제약
  - 엔티티와 달리 식별자 개념이 없어서 값을 변경했을 때 추적하기가 어렵다.
  - 값 타입 컬렉션에 변경 사항이 발생하면 소유하는 엔티티와 관련된 모든 데이터를 삭제하고, 현재 남아있는 값을 모두 다시 저장한다.
  - 값 타입 컬렉션을 매핑하는 테이블은 모든 컬럼을 묶어서 기본 키를 구성하기 때문에, null 값과 중복값을 허용하지 않는다.

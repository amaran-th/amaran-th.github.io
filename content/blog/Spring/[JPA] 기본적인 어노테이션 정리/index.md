---
title: "[JPA] 기본적인 어노테이션"
date: "2023-07-09T22:31:03.284Z"
description: "JPA에서 사용되는 기본적인 어노테이션을 익혀보자."
category: "Spring"
tags:
  - 우아한 테크코스
  - Spring
  - JPA
---

## 클래스↔테이블

---

객체와 테이블을 매핑하기 위한 어노테이션.

### @Entity

: JPA가 관리하는 클래스. 테이블과 매핑하기 위해 필요하다.

- **기본 생성자**가 필수적이다.
- final 클래스, interface, enum 등에는 사용 불가
- 필드에 final 키워드 사용 불가

### @Table

: 엔티티와 매핑할 테이블에 대한 설정을 할 수 있다.

| 속성             | 설명                                                             |
| ---------------- | ---------------------------------------------------------------- |
| name             | 매핑할 테이블 명(default : 엔티티 명)                            |
| uniqueConstrints | DDL 생성 시 unique 제약 조건 설정                                |
| catalog          | 카탈로그 기능이 있는 DB에서 catalog를 매핑한다.(default : DB 명) |
| schema           | schema 매핑                                                      |

```java
@Entity
@Table(name="MEMBER", uniqueConstraints = {@UniqueConstraint(
        name = "NAME_AGE_UNIQUE",
        columnNames = {"NAME", "AGE"}
		)})  // name, age 컬럼에 unique 제약조건 추가
public class Member {
```

## 기본 키 매핑(Primary Key)

---

### @Id

: 테이블(엔티티)의 기본 키(Primary Key)를 지정한다.

### @GeneratedValue

: 기본 키 생성 전략

영속성 컨텍스트는 엔티티를 식별자(Id) 값으로 구분하기 때문에, 엔티티를 영속 상태로 만드려면 식별자 값이 반드시 필요하다.

- strategy 속성
  : 기본키 생성 전략
  | 속성 값  | 설명                                                                                                                                                                                             |
  | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | IDENTITY | 기본 키 생성을 DB에 위임한다.(=AUTO_INCREMENT)                                                                                                                                                   |
  | SEQUENCE | DB 시퀀스를 사용해서 기본 키를 할당한다.<br/>데이터베이스 시퀀스에서 식별자 값을 획득한 후 영속성 컨텍스트에 저장<br/>유일한 값을 순서대로 생성한다.                                             |
  | TABLE    | 키 생성 테이블을 사용한다.<br/>키 생성 전용 테이블을 하나 만들어 여기에 이름과 값으로 사용할 컬럼을 만들어 DB 시퀀스를 흉내내는 전략이다.<br/>테이블을 사용하기 때문에 모든 DB에 적용할 수 있다. |
  | AUTO     | 선택한 DB 종류에 따라 방식을 자동으로 선택한다.<br/>ex) 오라클 DB : SEQUENCE, MySQL DB : IDENTITY                                                                                                |

```java
@Entity
public class Member {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	...
```

## 필드↔컬럼

---

### @Column

: 객체 **필드**를 테이블 **컬럼**에 매핑한다.

속성 중 name, nullable, unique가 주로 사용되고, 나머지는 잘 사용되지 않는다.

| 속성     | 설명                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| name     | 필드와 매핑할 테이블 컬럼의 이름(default : 객체의 필드명)                                      |
| nullable | null 값의 허용 여부를 설정한다. false 설정시 not null 제약 조건이 추가됨.<br/>(default : true) |
| unique   | @Table의 uniqueConstraints 속성과 같지만, 컬럼마다 유니크 제약 조건을 걸어줄 수 있다.          |
| length   | 문자 길이에 대한 제약조건(String 타입에만 사용한다.)<br/>(default : 255)                       |

### @Lob

: 데이터베이스에서 VARCHAR보다 큰 데이터를 담고 싶을 때 사용한다.

매핑하는 필드의 타입에 따라 DB의 BLob, CLob과 매핑된다.

- `CLOB` : 문자열인 경우(String, char[], java.sql.CLOB)
- `BLOB` : 그 외의 경우(byte[], java.sql.BLOB)

### @Enumerated

자바의 Enum 타입을 매핑할 때 사용한다.

- value 속성
  | 속성 값 | 설명                                 |
  | ------- | ------------------------------------ |
  | ORDINAL | Enum의 순서를 DB에 저장한다.(기본값) |
  | STRING  | Enum의 이름을 DB에 저장한다.         |

### @Embeddable & @Embedded

: 임베디드 타입은 복합 값 타입이라고도 하며, JPA에서 새로운 값 타입을 직접 정의해서 사용하는 방법을 뜻한다.

- 임베디드 타입을 사용했을 때의 장점
  - 비슷한 유형의 필드끼리 묶이므로 코드 응집력을 높일 수 있다.
- 사용 방법
  - `@Embeddable` : 임베디드 값 타입을 정의하는 곳에 표시
  - `@Embedded` : 임베디드 값 타입을 사용하는 곳에 표시

예시로 다음 코드를 보자.

```java
@Entity
public class Product extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable = false)
  private String name;
  @Column(nullable = false)
  private String imageUrl;
  @Column(nullable = false)
  private String productUrl;
  @Column(nullable = false)
  private String brandName;

	//이하 필드는 모두 가격 추적을 위한 필드임
	@Column(nullable = false)
  private BigDecimal originalPrice;
  @Column(nullable = false)
  private BigDecimal currentPrice;
  @OneToMany(mappedBy = "product")
  private List<PriceHistory> histories;
  @Embedded
  private PurchaseTemperature purchaseTemperature;
}
```

이 코드는 현재 진행하고 있는 팀 프로젝트에서 가져온 코드인데, 상품 정보를 저장하는 엔티티이다.

여기서 id, name, imageUrl, productUrl, brandName은 모두 Product의 정보를 나타내는 평범한 필드이지만 OriginalPrice(원가), currentPrice(현재 가격), histories(가격 변동 기록), purchaseTemperature(할인율과 관련된 척도)는 상품의 가격이 변동됨에 따라 새로 갱신될 필드들이다.

임베디드 타입을 사용하면 다음과 같이 필드를 목적에 맞게 분리할 수 있다.

```java
@Embeddable
public class PriceTrack {

  @Column(nullable = false)
  private BigDecimal originalPrice;
  @Column(nullable = false)
  private BigDecimal currentPrice;
  @OneToMany(mappedBy = "product")
  private List<PriceHistory> histories;
  @Embedded
  private PurchaseTemperature purchaseTemperature;
}
```

```java
@Entity
public class Product extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable = false)
  private String name;
  @Column(nullable = false)
  private String imageUrl;
  @Column(nullable = false)
  private String productUrl;
  @Column(nullable = false)
  private String brandName;
  @Embedded
  private PriceTrack priceTrack;
}
```

실제 테이블 상에서는 임베디드 타입을 적용하기 전의 코드와 동일하게 처리된다.

### @Temporal

: 필드를 날짜 타입(`java.util.Date`, `java.util.Calendar`)으로 매핑하기 위해 사용한다.

| 속성 값                         | 설명                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| TemporalType.DATE               | 날짜. DB의 data 타입과 매핑(2020-12-18)                      |
| TemporalType.TIME               | 시간. DB의 time 타입과 매핑(23:36:33)                        |
| TemporalType.TIMESTAMP(default) | 날짜와 시간. DB의 timestamp 타입과 매핑(2020-12-18 23:36:33) |

```java
@Temporal(TemporalType.DATE)
private Date date; // 날짜

@Temporal(TemporalType.TIME)
private Date date; // 시간

@Temporal(TemporalType.TIMESTAMP)
private Date date; // 날짜와 시간
```

### @CreatedDate & @LastModifiedDate

컬럼의 기본 값으로 DB에 Insert/Update되는 시점이 들어감

```java
@Entity
public class Question {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(length = 100, nullable = false)
  private String title;
  @Lob
  private String contents;
  private Long writerId;
  @Column(nullable = false)
  private boolean deleted = false;
  @CreatedDate
  @Column(nullable = false)
  private LocalDateTime createdAt;
  @LastModifiedDate
  private LocalDateTime updatedAt;

	...(생략)
```

```sql
create table question
(
    id         bigint generated by default as identity,
    contents   clob,
    created_at timestamp    not null,
    deleted    boolean      not null,
    title      varchar(100) not null,
    updated_at timestamp,
    writer_id  bigint,
    primary key (id)
)
```

## 기타

---

### @Transient

: 해당 어노테이션이 설정된 필드는 테이블 컬럼으로 매핑되지 않는다.

객체에 **임시로** 어떤 값을 보관하고자 할 때 사용한다.

### @Access

: JPA가 엔티티 데이터에 접근하는 방식을 지정할 수 있다.

| 속성 값             | 설명                                                |
| ------------------- | --------------------------------------------------- |
| AccessType.FIELD    | 필드에 직접 접근한다.(private로 설정해도 접근 가능) |
| AccessType.PROPERTY | 접근자 Getter를 사용하여 필드에 접근한다.           |

## 테스트

---

### @DataJpaTest

: JPA에 관련된 요소들을 테스트하기 위한 어노테이션

- @SpringBootTest와의 차이점
  - 기본적으로 @Transactional이 설정되어 있기 때문에 테스트가 끝난 후 변경사항은 롤백된다.
  - Spring에서 JPA 관련 테스트 설정만 로드한다.

## 참고 자료

---

[JPA 엔티티 매핑(Entity Mapping)](https://velog.io/@codemcd/JPA-엔티티-매핑Entity-Mapping)

[[JPA] 엔티티와 매핑. @Entity, @Table, @Id, @Column..](https://data-make.tistory.com/610)

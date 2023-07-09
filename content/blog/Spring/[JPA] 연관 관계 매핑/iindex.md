---
title: "[JPA] 연관 관계 매핑"
date: "2023-07-09T22:35:03.284Z"
description: "JPA를 사용해서 엔티티의 연관관계를 매핑해보자."
category: "Spring"
tags:
  - 우아한 테크코스
  - Spring
  - JPA
---

## 연관 관계

---

엔티티들은 대부분 다른 엔티티와 연관 관계를 가지고 있다.

- 객체는 **참조**를 사용하여 관계를 맺고, 테이블은 **외래키**를 사용해서 관계를 맺는다.
- 연관관계에서 유심히 짚어봐야 할 포인트는 다음의 3가지이다.

  - **방향** : `단방향`, `양방향`(\*테이블 관계는 항상 양방향임)
    - A에서 B의 정보에 접근할 수 있을 때, 연관 관계의 방향을 A→B로 표현한다.
  - **다중성** : `다대일(N:1)`, `일대다(1:N)`, `일대일(1:1)`, `다대다(N:M)`
  - **연관관계의 주인** : 양방향 연관관계에서 연관관계의 주가 되는 엔티티(=외래키를 가지고 있는 엔티티)

    - 연관 관계의 주인만이 DB 연관 관계와 매핑되고 외래키를 등록/수정/삭제할 수 있다.(다른 쪽은 읽기만 가능)
    - 실제 DB 테이블의 다대일/일대다 관계에서는 **‘다’ 쪽이 외래키를 가진다**.
      <aside>

      ⚠️ 엄밀히 말하면 객체에는 양방향 연관 관계라는 것이 없으며, 서로 다른 단방향 연관 관계를 2개 만들어 양방향인 것처럼 보이는 것 뿐이다.

      </aside>

### @JoinColumn

: **연관 관계의 주인인 엔티티**(=다대일/일대다에서 ‘다’에 해당하는 엔티티)에서 외래키를 매핑할 때 사용하는 어노테이션

- `name` 속성 - 매핑할 외래 키 컬럼 명을 지정한다.(`@Column`의 name과 동일)
- 일대다 단방향 관계를 매핑할 때는 필수적으로 사용해야 한다.

### 양방향 연관 관계의 mappedBy

양방향 연관 관계에 대해, **연관 관계의 주인이 아닌 엔티티**(=다대일/일대다에서 ‘일’에 해당하는 엔티티)에서 연관 관계의 주인을 지정하는 속성이다.

@OneToOne, @OneToMany, @ManyToOne에서 사용할 수 있다.

- 양방향 다대일/일대다 관계에서 해당 속성 값을 생략하면 중간 테이블이 생성된다.
- 다대일/일대다 관계에 대해서는 후술하겠지만, mappedBy를 이해하기 위해 회원(Member)과 팀(Team)의 다대일 양방향 관계를 예시로 들어보겠다.

  ```java
  class Member {
      @ManyToOne
      @JoinColumn(name = "TEAM_ID")
      private Team team;
  }

  class Team {
      @OneToMany(mappedBy="team")
      private List<Member> members = new ArrayList<>();
  }
  ```

  ‘다’에 해당하는 Member가 연관 관계의 주인이므로, 주인이 아닌 Team의 members 필드는 Member의 ‘team’ 필드(TEAM_ID 컬럼)에 매핑된다.

<aside>

💡 `@JoinColumn`을 생략하면 외래키를 찾을 때 다음과 같은 전략을 사용한다.

> 필드명\_[참조하는 테이블의 기본 키 컬럼명]

- 예시
  `java @ManyToOne private Team team; `

      > team_TEAM_ID
      >

  </aside>

## 일대다(1:N) & 다대일(N:1) 연관 관계

---

다대일 관계와 일대다 관계를 이해하기 위해 한 가지 예시를 들어보자.

지하철역(Station)과 노선(Line)이 있을 때, 한 노선에 여러 개의 역이 소속될 수 있기 때문에

- 지하철역을 기준으로 노선은 **다대일(N:1)** 관계에 있고,
- 노선을 기준으로 지하철역은 **일대다(1:N)** 관계에 있다고 할 수 있다.

### @ManyToOne & @OneToMany

- `@ManyToOne` : 다대일 관계를 매핑하는 어노테이션
- `@OneToMany` : 일대다 관계를 매핑하는 어노테이션

### **예제** - 역(Station)에서만 노선(Line) 정보에 접근할 수 있는(Station ⇒ Line) 다대일 단방향 연관관계

```java
@Entity
@Table(name = "line")
public class Line {
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

		@Column(nullable = false)
    private String name;

    ...
}
```

```java
@Entity
@Table(name = "station")
public class Station {
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

		@Column(nullable = false)
    private String name;

		@ManyToOne
		@JoinColumn(name = "line_id")
		private Line line;

    public void setLine(final Line line) {
				this.line = line;
    }

    ...
}
```

### 예제 - 역(Station)과 노선(Line) 둘 다 서로의 정보에 접근할 수 있는(Station↔Line) 다대일 양방향 연관 관계

\*Station은 앞의 예제 코드에서의 것과 동일하다.

```java
@Entity
@Table(name = "line")
public class Line {
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

		@Column(nullable = false)
    private String name;

		@OneToMany(mappedBy = "line")
		private List<Station> stations = new ArrayList<>();

    ...
}
```

### 예제 - 노선(Line)에서만 지하철역(Station) 정보에 접근할 수 있는(Line ⇒ Station) 일대다 단방향 연관관계

```java
@Entity
@Table(name = "line")
public class Line {
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

		@Column(nullable = false)
    private String name;

		@OneToMany(name = "line_id")
		private List<Station> stations = new ArrayList<>();

    ...
}
```

```java
@Entity
@Table(name = "station")
public class Station {
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

		@Column(nullable = false)
    private String name;
    ...
}
```

<aside>

⚠️ **일대다 단방향 매핑의 단점**

- 매핑한 객체가 관리하는 외래키가 다른 테이블에 존재한다.
  - 연관관계는 Line 객체에 정의되어 있지만, 외래키 자체는 Station 테이블에 존재한다.(직관성 🔽)
- 연관관계 처리를 위한 추가 Update SQL 쿼리를 실행해야 한다.

⇒일대다 단방향 매핑보다는 다대일 양방향 매핑이 권장된다.

</aside>

---

## 일대일(1:1) 연관 관계

---

양쪽이 서로 하나씩만 가지는 관계

- 예시 - 한 명의 학생이 한 개의 사물함만 소유할 수 있고, 사물함도 한 명의 학생에게 배정될 수 있는 관계.

### @OneToOne

: 일대일 연관 관계를 매핑하는 어노테이션

일대일 관계는 반대도 일대일 관계이다. 그래서 주 테이블과 대상 테이블 중 어느 곳에든 외래 키를 둘 수 있기 때문에 어디에 외래 키를 둘 지에 고민해봐야 한다.

`Student`가 주 테이블, `Locker`가 대상 테이블이라고 가정해보자.

```java
class Student {
    Long id;
    String name;
    Locker locker ;
}

class Locker {
    Long id;
}
```

### 주 테이블 Student에 외래 키를 두는 경우

주 테이블이 외래 키를 가지고 있기 때문에, Student ⇒ Locker의 방향성을 가진다.

- Student ⇒ Locker의 방향성을 가진 단방향 연관 관계

  ```java
  @Entity
  @Table(name = "student")
  public class Student{
  		@Id
  		@GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

  		@Column(name = "name", nullable = false)
      private String name;

  		@OneToOne
  		@JoinColumn(name = "locker_id")
  		private Locker locker;

      ...
  }
  ```

  ```java
  @Entity
  @Table(name = "locker")
  public class Locker {
  		@Id
  		@GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      ...
  }
  ```

- Student ↔ Locker의 방향성을 가진 양방향 연관 관계

  Locker에도 Student 참조를 추가해서 양방향으로 만들었다.

  ```java
  @Entity
  @Table(name = "locker")
  public class Locker {
  		@Id
  		@GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

  		@OneToOne(mappedBy = "locker")
  		private Student student;

      ...
  }
  ```

### 대상 테이블(Locker)에 외래키를 두는 경우

이 경우, 테이블 관계가 일대일에서 일대다로 변경될 때 테이블 구조를 그대로 유지할 수 있다는 장점이 있다.

\*이 경우 단방향 연관 관계는 만들 수 없다.

- 양방향 연관 관계

  ```java
  @Entity
  public class Locker {

  	@Id @GeneratedValue
  	@Column(name = "LOCKER_ID")
  	private Long id;

  	private String name;

  	@OneToOne
  	@JoinColumn(name = "STUDENT_ID")
  	private Student student;
  ```

  ```java
  @Entity
  public class Student {

  	@Id @GeneratedValue
  	@Column(name = "STUDENT_ID")
  	private Long id;

  	private String userName;

  	@OneToOne(mappedBy = "student")
  	private Locker locker;
  ```

## 다대다(M:N) 연관관계

---

: 두 개의 테이블이 서로의 행에 대해 여러 개로 연관되어 있는 상태를 다대다(M:N) 관계라고 한다.

- 예시 - 한 명의 학생이 여러 개의 수업을 수강할 수 있고, 한 수업이 여러 명의 학생을 수용할 수 있는 관계.

### @ManyToMany

: 다대다 관계를 매핑해주는 어노테이션

- 관계형 데이터베이스는 정규화된 테이블 2개로 다대다 관계를 표현할 수 없다.
  - 즉, 다대다 관계를 일대다-다대일 관계를 풀어주는 **연결 테이블**이 필수적이다.
- `@ManyToMany` 어노테이션은 연결 테이블에 키를 제외한 필드가 추가되면 사용할 수 없다.

## 참고 자료

---

[[JPA] - @JoinColumn과 연관관계의 주인 (mappedBy)](https://ttl-blog.tistory.com/126)

[JPA - 다양한 연관관계 - 1 : 1](https://ocwokocw.tistory.com/131)

[@JoinColumn vs mappedBy](https://velog.io/@jduckling_1024/JoinColumn-vs-mappedBy)

우테코 강의자료(LMS)

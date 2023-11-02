---
title: "[Spring] DB에 생성시간&수정된 시간 자동 셋팅하기"
date: "2023-04-30T17:29:03.284Z"
description: "데이터의 생성 시간과 수정 시간을 DB에 자동으로 적용되게 하는 방법에 대해 알아보자"
section: "지식 공유" 
category: "Spring"
tags:
  - 우아한 테크코스
  - Spring
---

## 서론

---

이번에 Spring을 새로 공부하면서, 다른 프로젝트 코드를 얼핏 봤었는데, `@CreatedDate`, `@EntityListeners`, `@EnableJpaAuditing` 등 처음 보는 어노테이션이 많아서 한 번 정리해 보았다.

그래서 글의 흐름이 조금 난잡할 수 있는 점 주의 바란다.

## JPA에서의 Auditing

---

Audit은 사전적으로 '감시하다', '심사하다' 등의 의미를 가지고 있다.
JPA에서는 데이터가 변경된 정보를 자동으로 매핑하여 데이터베이스에 반영할 수 있도록 제공하는 기능을 제공하고 있는데, 이 기능을 Auditing이라고 한다.

### EntityListener

: 엔티티의 변화를 감지할 때마다 콜백 함수를 호출하도록 하는 어노테이션

**JPA**에서는 아래의 7가지 Event Listener를 제공한다.

| 어노테이션   | 설명                                                  |
| ------------ | ----------------------------------------------------- |
| @PrePersist  | Persist(insert)메서드가 호출되기 전에 실행되는 메서드 |
| @PreUpdate   | merge메서드가 호출되기 전에 실행되는 메서드           |
| @PreRemove   | Delete메서드가 호출되기 전에 실행되는 메서드          |
| @PostPersist | Persist(insert)메서드가 호출된 이후에 실행되는 메서드 |
| @PostUpdate  | merge메서드가 호출된 후에 실행되는 메서드             |
| @PostRemove  | Delete메서드가 호출된 후에 실행되는 메서드            |
| @PostLoad    | Select조회가 일어난 직후에 실행되는 메서드            |

일반적으로 @PrePersist를 사용해서 자동으로 Created time과 Updated time을 저장하도록 한다.

```java
@Entity
@NoArgsConstructor
@Data
public class Book implements Auditable{
		...

		@PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

### @EntityListeners 어노테이션

: Entity 객체에서 Event Listener를 공통화하기 위해 사용하는 어노테이션.

앞서 정리한 어노테이션을 달아준 메서드를 따로 class로 생성하고 `@EntityListeners`를 통해 해당 Listener class를 호출하게 하면 코드의 가독성을 높일 수 있다.

```java
public class MyEntityListener {
    @PrePersist
    public void prePersist(Object o) {
        ...
    }

    @PreUpdate
    public void preUpdate(Object o) {
		    ...
    }
		...
}
```

- 이렇게 정리한 Listener 클래스를 Entity 객체에 적용하기 위해선 Entity 클래스에 `@EntityListeners(value=Listener클래스.class)` 어노테이션을 추가해주면 된다.(해당 Entity 내부에는 따로 `@PrePersist`, `@PreUpdate` 메서드를 추가해줄 필요가 없음)
  ```java
  @Entity
  @NoArgsConstructor
  @Data
  @EntityListeners(value = MyEntityListener.class)
  public class Book implements Auditable{
      ...
  }
  ```

## Spring Data Jpa에서의 Auditing

---

Spring Data Jpa에서는 기본 JPA보다 깔끔하고 쉬운 방법으로 Auditing을 제공한다.

### @EnableJpaAuditing 어노테이션(feat. JPA)

JPA Auditing 기능을 사용하기 위해선 먼저 Application 클래스 또는 `@Configuration` 어노테이션이 사용된 클래스에 `@EnableJpaAuditing` 어노테이션을 추가해야 한다.

```java
@EnableJpaAuditing // 추가
@SpringBootApplication
public class MyApplication {
    ...
}
```

### AuditindEnetityListener

: JPA에서 제공하는 이벤트 리스너 클래스로, @EntityListeners 어노테이션의 인자로 넣어주면 된다.

- Entity 클래스(Post)

  ```java
  @Getter
  @NoArgsConstructor
  @EntityListeners(AuditingEntityListener.class)
  @Entity
  public class Post {

      @Id
      @GeneratedValue
      private Long id;

      private String title;

      private String content;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      public Post(final String title, final String content) {
          this.title = title;
          this.content = content;
      }
  }
  ```

- `@CreatedDate`와 `@LastModifiedDate`

  : Spring Data Jpa에서 제공하는 어노테이션

  - `@CreatedDate` : 해당 엔티티가 **생성될 때** 생성된 시간을 자동으로 삽입해주는 어노테이션. 일반적으로 생성일자는 수정되어선 안되므로 `@Column(updatable = false)`를 함께 적용해준다.
  - `@LastModifiedDate` : 해당 엔티티가 **수정될 때** 수정된 시간을 자동으로 삽입해주는 어노테이션
  - `@CreatedBy` : 해당 엔티티가 **생성될 때** 생성하는 사람이 **누구인지**를 자동으로 삽입해주는 어노테이션
  - `@LastModifiedBy` : 해당 엔티티가 **수정될 때** 수정하는 사람이 **누구인지**를 자동으로 삽입해주는 어노테이션

### 공통 필드를 기본 클래스로 분리하기

생성 시각과 수정 시각은 많은 엔티티에서 **공통적으로** 사용되는 필드이기 때문에, 이들을 **별개의 클래스로 분리**하고 다른 엔티티에서 상속을 받아 사용하도록 하면 코드 중복을 줄일 수 있다.

```java
@Getter
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
public class BaseEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

- `@MappedSuperclass` : 생성 시간, 수정 시간과 같은 공통 매핑 정보가 필요할 때, 부모 클래스에 선언된 필드를 상속받는 클래스에서 그대로 사용하게 하기 위해 사용된다.

  ⚠️`@MappedSuperclass`가 선언된 클래스는 Entity가 아니며 직접 생성해서 사용될 일이 없기 때문에 **대부분 추상 클래스로 만들어진다**.

  ⇒부모 클래스를 상속받는 자식 클래스에게 **매핑 정보만을 제공**하고 싶을 때 사용하는 어노테이션

  💡JPA에서 @Entity 클래스는 `@Entity`나 `@MappedSuperclass`로 지정한 클래스만 상속할 수 있다.

- 공통 클래스(BaseEntity)를 상속받은 Entity 클래스

  ```java
  @Getter
  @NoArgsConstructor
  @Entity
  public class Post extends BaseEntity {

      @Id
      @GeneratedValue
      private Long id;

      private String title;

      private String content;

      public Post(final String title, final String content) {
          this.title = title;
          this.content = content;
      }
  }
  ```

## 참고 자료

[[ JPA ] 4. Entity Listener](https://milenote.tistory.com/79)

[[Spring JPA] Entity Listener](https://velog.io/@seongwon97/Spring-Boot-Entity-Listener)

[[배워보자 Spring Data JPA] JPA Auditing 기능을 사용해서 생성, 수정 일자 자동화하기](https://wonit.tistory.com/484)

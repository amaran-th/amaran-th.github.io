---
title: "[JPA] EntityGraph"
date: "2023-08-14T01:51:03.284Z"
description: "EntityGraph로 N+1 문제를 해결해보자."
category: "Spring"
tags:
  - 우아한 테크코스
  - Spring
  - JPA
thumbnailImg: "../jpa.png"
---

## EntityGraph

---

<aside>

💡 Fetch Join의 개념에 대해서는 예전에 한 번 포스팅한 적이 있다.

[관련 포스팅](https://amaran-th.github.io/Spring/[JPA]%20%EB%8B%A4%EB%8C%80%EB%8B%A4%20%EA%B4%80%EA%B3%84%EC%97%90%EC%84%9C%20FetchJoin%EC%9C%BC%EB%A1%9C%20N+1%20%EB%AC%B8%EC%A0%9C%20%ED%95%B4%EA%B2%B0%ED%95%98%EA%B8%B0/)

</aside>
연관된 엔티티들을 SQL 구문 하나로 한 번에 조회하는 기능.

엔티티를 조회하는 시점에 함께 조회할 연관 엔티티를 설정해줄 수 있다. 즉, Fetch Join과 유사한 기능인데, JPQL을 사용해서 Fetch Join을 하는 것과 무슨 차이가 있을까?

### JPQL vs. EntityGraph

**첫번째로 EntityGraph를 사용해서 Fetch Join을 하는 것이 좀 더 편리하다.**

JPQL을 사용할 때는 데이터에 맞게 여러 개의 JPQL을 매번 작성해주어야 한다. 동일한 엔티티를 조회하더라도 SQL문이 다를 경우 많은 SQL문을 작성해야 할 수 있다.

엔티티 그래프 기능을 사용하면 추가적인 JPQL을 작성하지 않고도 Fetch Join을 적용할 수 있다.

**두 번째로 기본적으로 사용하는 조인 방식이 다르다.**

EntityGraph의 경우 fetchType을 eager로 변환하는 방식으로 **LEFT OUTER JOIN**을 수행하여 데이터를 가져오지만, JPQL로 작성한 fetch join의 경우 따로 기본적으로 **INNER JOIN**을 수행한다

JPQL과 EntityGraph를 함께 사용할 수도 있는데, 이 경우에는 LEFT OUTER JOIN을 사용한다.

## 사용법

---

크게 정적으로 정의하는 **Named 엔티티 그래프**와 동적으로 정의하는 **엔티티 그래프**가 있다.

엔티티 그래프를 사용하는 방법은 Entity Manager에 직접 엔티티 그래프를 넣어주는 방법과 @EntityGraph 어노테이션을 사용한 방법이 있다.

### 정적으로 정의 - Named 엔티티 그래프

: 정적으로 엔티티 그래프를 정의할 수 있다.

엔티티 그래프의 정의는 **Entity 클래스**에서 작성한다.

**예제 1.** Comment → Event

댓글(Comment)을 조회할 때 연관된 행사(Event)도 함께 조회하는 엔티티 그래프를 만들어보자.

Named 엔티티 그래프는 `@NamedEntityGraph`로 정의할 수 있고, 여러 개를 정의할 때는 `@NamedEntityGraphs`를 사용하면 된다.

```java
@NamedEntityGraph(
        name = "Comment.withEvent", // 엔티티 그래프 이름 정의
        attributeNodes = { @NamedAttributeNode("event") } // 함께 조회할 속성 선택
);
@Entity
public class Comment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(nullable = false)
  private Event event;

}
```

1. **Entity Manager - EntityGraph 객체**

   앞서 정의해준 Named 엔티티 그래프는 `em.getEntityGraph("Comment.withEvent")`를 통해 불러와서 사용할 수 있다.

   ```java
   EntityGraph graph = em.getEntityGraph("Comment.withEvent");

   Map hints = new HashMap();
   hints.put("javax.persistence.fetchgraph", graph);

   Comment comment = em.find(Comment.class, commentId, hints);
   ```

   <aside>

   💡 다음과 같이 JPQL과 함께 사용할 수도 있다.

   ```java
   EntityGraph graph = em.getEntityGraph("Comment.withEvent");

   List<Comment> comments = em.createQuery("select c from Comment c", Comment.class)
   		.setHint("javax.persistence.fetchgraph", graph)
   		.getResultList()
   ```

   </aside>

2. **Spring Data JPA - `@EntityGraph` 어노테이션 사용**

   JpaRepository 인터페이스를 상속한 **Repository 인터페이스**에 있는 메서드에 대해 `@EntityGraph` 어노테이션을 붙여주고, value 속성 값으로 Named 엔티티 그래프의 이름을 지정해주면 된다.

   ```java
   @Repository
   public interface CommentRepository extends JpaRepository<Comment, Long> {
   	@EntityGraph(value = "Comment.withEvent")
   	List<Comment> findAll();
   ```

   - value : 엔티티 그래프의 이름

   findAll 메서드를 호출해서 Comment 리스트를 불러올 때 Comment 엔티티와 연관된 event 엔티티도 함께 불러오게 된다.

   <aside>

   💡 다음과 같이 JPQL과 함께 사용할 수도 있다.

   ```java
   @EntityGraph(attributePaths = {"event"})
   @Query("select c from Comment c")
   List<Comment> findCommentEntityGraph();
   ```

   </aside>

**예제2.** Event → EventTag → Tag

다대다 관계에 대해 Fetch Join을 수행해보자.

Event와 Tag는 다대다 관계여서, 이를 매핑하는 중간 테이블 엔티티 EventTag가 있다.

Event→ EventTag는 Event가 관리하는 필드이지만 EventTag → Tag는 Event가 관리하는 필드가 아니다.

이 경우 **subgraph**를 사용할 수 있다.

```java
@NamedEntityGraph(
        name = "Event.withAll",
        attributeNodes = {
                @NamedAttributeNode(value = "tags", subgraph = "tags")
        },
        subgraphs = @NamedSubgraph(name = "tags", attributeNodes = {
                @NamedAttributeNode("tag")
        })
);
@Entity
public class Event {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToMany(mappedBy = "event", fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
  private List<EventTag> tags = new ArrayList<>();

}

@Entity
public class EventTag {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "event_id", nullable = false)
  private Event event;
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "tag_id", nullable = false)
  private Tag tag;

}
```

Event.withAll이라는 Named 엔티티 그래프를 정의했는데, 이 엔티티 그래프는 Event→EventTag, EventTag→Tag의 객체 그래프를 함께 조회한다.

여기서 EventTag→Tag는 Event의 객체 그래프가 아니기 때문에 subgraphs 속성으로 정의해주었다.

사용 방법은 앞선 Comment 예제에서와 동일하다.

### 동적으로 정의 - 2가지 방법

- **EntityManager**

  createEntityGraph() 메소드를 사용해서 엔티티 그래프를 동적으로 구성할 수 있다.

  ```java
  EntityGraph graph = em.createEntityGraph(Comment.class);
  graph.addAttributeNodes("event");

  Map hints = new HashMap();
  hints.put("javax.persistence.fetchgraph", graph);

  Comment comment = em.find(Comment.class, commentId, hints);
  ```

  subgraph 기능을 동적으로 구성할 때는 다음과 같이 할 수 있다.

  ```java
  EntityGraph graph = em.createEntityGraph(Event.class);
  Subgraph<OrderItem> eventTags = graph.addSubgraph("tags");
  graph.addAttributeNodes("tag");

  Map hints = new HashMap();
  hints.put("javax.persistence.fetchgraph", graph);

  Event event = em.find(Comment.class, eventId, hints);
  ```

- Spring Data JPA - **`@EntityGraph` 어노테이션(동적 생성)**

  @EntityGraph 어노테이션의 attributePaths 속성을 통해 미리 정의한 NamedEntityGraph를 사용하지 않고, 실제 쿼리를 수행하는 시점에 동적으로 엔티티 그래프를 생성할 수 있다.

  ```java
  @Repository
  public interface CommentRepository extends JpaRepository<Comment, Long> {

  	@EntityGraph(attributePaths = {"event"})
  	List<Comment> findAll();
    ...
  }
  ```

  - **attributePaths** 속성 : 연관관계로 매핑된 필드의 필드 명을 지정한다.
  - **type** 속성 : 타입을 지정. LOAD와 FETCH가 있다.
    - `LOAD` - 지정한 연관 엔티티는 Eager 로딩으로 불러오고, 그 외 연관 엔티티들은 직접 선언한 FetchType 또는 해당 연관관계 어노테이션(@ManyToOne, @OneToOne 등)의 기본 FetchType에 따라 불러온다.
    - `FETCH` - 지정한 연관 엔티티는 Eager 로딩으로 불러오고, 그 외 연관 엔티티들은 LAZY 로딩으로 불러온다.(default)
      attirbutePaths 속성으로 event 필드를 설정해주었기 때문에, findAll() 메서드를 호출하여 Comment 리스트를 조회할 때 Comment 엔티티와 관련된 event 엔티티도 함께 조회하게 된다.
      @EntityGraph 어노테이션만으로 subgraph를 정의하는 방법은 아마 지원하지 않는 것 같다.(공식문서에도 명시되어 있지 않고, 긴 시간 서치를 해본 결과 관련해서 나온 정보가 전혀 없었다ㅠㅠ)

### 참고 자료

---

[엔티티 그래프로 연관관계 조회 하기](https://devbksheen.tistory.com/entry/엔티티-그래프로-엔티티-연관관계-조회-하기)

[JPA) @Entitygraph](https://awse2050.tistory.com/46)

[@EntityGraph](https://c-king.tistory.com/entry/EntityGraph)

[Spring Data JPA - @EntityGraph](https://devhan.tistory.com/206)

[JPA 성능 N+1 문제와 해결 방법](https://gmoon92.github.io/spring/jpa/hibernate/n+1/2021/01/12/jpa-n-plus-one.html)

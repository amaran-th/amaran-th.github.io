---
title: "[Java] VO(Value Object)란?"
date: "2023-03-08T20:22:03.284Z"
description: VO의 개념과 활용 방법에 대해 알아보자.
category: "우테코 5기"
tags:
  - 우아한 테크코스
  - Java
  - VO
---

<nav>

목차

- 정의
- 조건
- 장점
- 기타

</nav>

## **정의**

---

값 객체라고 불리며, 특정 값을 나타내는 객체를 의미한다. Domain(도메인) 객체의 일종이다.(원시값을 포장하는 객체)

## **조건**

---

### **equals&hash code 메서드를 재정의해야한다.**

equals 메서드를 재정의를 동등성 비교를 할 속성값을 정해야 VO간 값 비교가 가능해진다.

⇒**속성 값이 같은 객체는 같은 객체**임을 보장하면서 VO를 사용할 수 있다.

\*실제로 값이 같은 두 객체를 생성하고 동일성 비교를 해보면 둘은 서로 다른 객체로 구별된다.

⇒동일성(주소비교)≠동등성(값비교)

### **수정자(setter)가 없는 불변 객체여야 한다.**

- VO는 속성값 자체가 식별자이기 때문에 속성 값이 바뀌면 다른 객체가 되어 추적이 불가하다. 때문에 VO는 반드시 값을 변경할 수 없는 불변 객체로 만들어야 한다.
- 생성자를 통해서 객체가 생성될 때 값이 한 번만 할당되고 이후로는 변경되지 않도록 설계할 수 있다.

## **장점**

---

- VO를 통해 도메인을 설계하면 객체가 생성될 때 해당 객체 안에 ‘제약사항’을 추가할 수 있다.(=검증 로직 구현)
- 생성될 인스턴스가 정해져있는 경우 미리 인스턴스를 생성해놓고 캐싱하여 성능을 높이는 방법도 고려해볼 수 있다.
- Entity의 원시값을 VO로 포장하면 Entity가 지나치게 거대해지는 것을 막을 수 있다.→객체 지향적 프로그래밍이 가능

## 기타

---

- 하나의 값을 처리하는 로직이 길어지면 해당 값을 값 객체로 분리하는 것을 고려할 수 있다.

⇒강의에서는 Score를 하나의 값 객체로 분류하여 클래스 내부에 Ace에 대한 score 처리 로직을 구현하였다.

- 기존 코드

  ```java
  //Hand.java
  ...
  public int calculateScore(){
  	final var hasAce=hasAce();
  	final var score=score();

  	if(hasAce&&score+10<=21){
  		return score+10;
  	}
  	return score;
  }
  private int score(){
  	return cards.steram()
  		.mapToInt(Card::score)
  		.sum();
  }
  ```

- Score을 값 객체로 분리한 코드(+리팩토링)

  ```java
  //Score.java
  private static final Score min=new Score(0);
  private static final Score aceAdditional=new Score(10);
  private static final Score maxScore=new Score(21);

  private final int value;
  ...
  public static Score min(){ return min; }    //정적 팩토리 메서드

  public Score plusTenIfNotBust(){
  	final var sumScore=sum(aceAdditional);
  	if(sumScore.isLessThanOrEqul(maxScore)){
  		return sumScore;
  	}
  	return this;
  }

  private Score sum(final Score other){
  	return new Score(value+other.value);
  }
  private boolean isLessThanOrEqul(final Score other){
  	return value<=other.value;
  }
  ```

  ```java
  //Hand.java
  ...
  public Score calculateScore(){
  	Score score=score();
  	if(hasAce()){
  		return score.plusTenIfNotBust();
  	}
  	return score;
  }
  private int score(){
  	return cards.stream()
  					.map(Card::score)
  					.reduce(Score.min(), Score::add);
  }
  ```

- 값 객체를 구현할 때, 불변한 객체라고 해도 타입에 따라 네이밍 규칙이 조금 다르다.
  - 클래스 변수(≠상수)는 소문자 카멜케이스로, 상수(primitive type)는 대문자로.
    ⇒클래스 변수의 경우 꼭(!!) 불변하다고 할 수만은 없다.

```java
  private static final Score min = new Score(0);
  private static final int MIN=0;
```

<nav>

참고 자료

- [https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/](https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/)

</nav>

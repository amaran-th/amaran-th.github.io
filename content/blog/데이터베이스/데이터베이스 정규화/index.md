---
title: 데이터베이스 정규화 - 1
date: "2022-11-29T13:01:03.284Z"
description: "함수 종속성과 데이터베이스 정규화"
category: "데이터베이스"
tag: ["database"]
---

### 용어 설명

- Functional dependency(=FD, 함수 종속)

수학적 개념으로서 함수의 정의는 다음과 같다.

```
💡 함수 y=f(x)에 대해 임의의 x에 대응하는 y의 값은 오직 하나 존재한다.
```

위 개념과 마찬가지로, relation에서 각 필드 간에 함수의 성질이 만족될 때 해당 필드들은 **함수 종속성**을 갖는다고 한다.

필드 간 함수 종속 관계는 {x}→{y}와 같이 표현된다. 이 때 {x}를 determinant(결정자), {y}를 dependent라고 한다.

- candidate key(=후보키)
  : 릴레이션에서 튜플의 값을 고유하게 만드는 속성의 **집합**
  더 속성을 줄일 수 없는 상태여야 한다.

<aside>

💡 **trivial Functional Dependency**(자명한 함수 종속성)

---

- 임의의 속성은 후보키에 반드시 함수 종속된다.
- 속성의 부분집합 x, y가 있을 때 `{x, y}→{x}`, `{x, y}→{y}`는 항상 성립한다.

이와 같이 어떤 관계에서든 항상 성립하는 함수 종속성을 trivial Functional Dependency라고 한다.

↔**Non trivial Functional Dependency**(자명하지 않은 함수 종속성)

---

: 키가 아닌 A에 대해서 B가 결정되는 경우가 있다는 것. A는 키가 아니기 때문에 반복적으로 나타날 수 있다.→해결해야 할 문제

</aside>

- transitive FD

A→B이고 B→C이면 A→C가 성립한다.

- atomic

테이블에 중복되는 항목(value, 즉 primary key가 아닌 컬럼의 값)이 존재하지 않는다.

- non-loss decomposition

데이터베이스를 정규화하는 과정에서 데이터의 중복을 제거하기 위해 테이블을 분할하게 되는데, 테이블을 분할하는 과정에서 정보 손실이 일어나선 안된다.

→분할한 table들을 다시 join했을 때 분할하기 전의 table이 도출되어야 한다.

-> **Heath 이론** : 테이블을 분할하는 과정에서 정보 손실이 없어야 한다(nonloss decomposition)
| sno | city | status |
| --- | --- | --- |
| s1 | busan | 30 |
| s2 | paris | 20 |

위 테이블이 다음과 같은 종속관계를 가지고 있을 때

`sno→city`, `sno→status`, `city→status`

아래와 같이 3개의 case로 테이블을 분할할 수 있다.

방법1) : best

| sno | city  |
| :-: | :---: |
| s1  | busan |
| s2  | paris |

| city  | status |
| :---: | :----: |
| busan |   30   |
| paris |   20   |

방법2) : city→status를 유추해야 한다.

| sno | city  |
| :-: | :---: |
| s1  | busan |
| s2  | paris |

| sno | status |
| :-: | :----: |
| s1  |   30   |
| s2  |   20   |

방법3) : sno→city를 유도할 수 없다.⇒정보의 손실 발생=**Heath 이론 위반**

| sno | status |
| :-: | :----: |
| s1  |   30   |
| s2  |   20   |

| city  | status |
| :---: | :----: |
| busan |   30   |
| paris |   20   |

- anomaly : 데이터베이스의 컬럼에 중복이 존재하는 경우 발생할 수 있는 이상 현상
  - insert anomaly : 특정 정보를 추가할 때 불필요한 컬럼의 dirty data를 함께 입력해야 한다.
  - delete anomaly
  - update anomaly

### 데이터베이스 정규화(Normalization)

관계형 데이터베이스의 설계에서 중복을 최소화하기 위해 데이터를 구조화하는 과정을 의미한다.(=테이블을 decomposition(분할)하는 것)

정규화를 수행하기 위한 정규화의 법칙(Normalization Rule) 6가지

1NF, 2NF, 3NF, BCNF, 4NF, 5NF

### 1NF

테이블에 존재하는 필드가 모두 scalar value만을 가지며, 필드의 값이 모두 atomic하다.

### NF2

1NF의 조건을 만족하면서 테이블 내의 모든 함수 종속 관계가 **완전종속 관계**이다.

<aside>

💡 **완전 종속 관계**(irreducible dependent)

---

: 어떤 테이블 R의 필드 Y가 필드의 집합 X에 함수 종속이면서, X 자신을 제외한 X의 어떤 부분 집합에도 함수 종속이 아니면, Y는 X에 완전 함수 종속이라고 한다.

ex)만약 {X, Y}→Z와 같은 함수 종속 관계가 있을 때, 테이블 내 X→Z와 같은 종속관계가 존재하지 않는다.

</aside>

위 예제에서 분할한 second 테이블에서는 여전히 중복으로 인한 anomaly 문제가 발생한다.

- insert anomaly : 특정 city(도시)의 status 값을 입력할 때, 불필요한 sno 값을 추가로 입력해야 한다.→dirty data
- update anomaly : s1의 London의 status를 변경할 경우 s4의 정보를 함께 변경해주지 않을 시 정보의 불일치가 나타날 수 있다.
- delete anomaly : second 테이블에서 s2, s3의 값을 제거하면 Paris의 status 값이 10이라는 정보가 손실되게 된다.

sno(key)가 아닌 속성 간에 함수 종속 관계가 존재하기 때문에 발생한다.(city→status)

### NF3

2NF의 조건을 만족하면서 테이블의 key가 아닌 필드들이 서로 독립적이어야 한다.

⇒테이블의 모든 필드들은 key값에 대해서만 함수 종속 관계가 성립해야 한다.

다음과 같이 sc, cs 테이블로 분할하여 3NF를 만족하도록 할 수 있다.

\*candidate key가 2개 이상일 경우, 하나의 candidate key만 고려하고 다른 key들은 없다고 간주하여 3NF의 충족 여부를 판단한다.

### BCNF

테이블에 존재하는 모든 함수 종속 관계의 결정자(determinant)가 후보키(candidate key) 집합에 포함되어야 한다.

3NF와 달리, BCNF는 후보키가 2개 이상인 경우까지 고려하여 함수 종속 관계를 판정한다.

위 예시의 경우, 후보키 집합은 `{ {sno, pno}, {sname, pno} }`이다.

이 경우 sno와 sname은 후보키가 아니면서 종속관계의 결정자가 되기 때문에 테이블 ssp는 BCNF를 위반한다.(3NF는 만족한다)

- 3NF를 만족하면서 BCNF를 만족하지 않은 경우
  ⇒일반 속성A와 후보키의 원소 B 간에 A→B 종속성이 존재하는 경우
- BCNF를 위반하게 만드는 함수 종속성 X -> Y를 찾고 아래와 같이 분해한다

  - {X, Y}로 구성된 릴레이션
  - X와 나머지 속성으로 구성된 릴레이션

`+추가`

- 예제 sjt

| s     | j       | t     |
| ----- | ------- | ----- |
| Jones | Math    | White |
| Jones | Physics | Brown |
| Smith | Math    | White |
| Smith | Physics | Green |

stj에서 candidate key는 `{ {s, t}, {s, j} }`이다.

{s, j}→t

t→j

정의에 따라 stj는 3NF는 만족하지만 BCNF는 만족하지 않는다. 하지만 앞서 언급한 방법대로 st와 tj로 테이블을 분할하면 정보 손실이 발생하기 때문에 분할할 수 없다.

결론적으로 sjt는 atomic하여 더 이상 분할할 수 없지만 BCNF를 만족하지 못한다.

- 예제 sjp

sjp에서 candidate key는 `{ {s, j}, {j, p} }`이다.

{s, j}→p

{j, p}→s

2개의 candidate key가 모두 determinant하기때문에 BCNF를 만족한다.

위와 같이 중복되는 후보키를 갖더라도 BCNF를 충족할 수 있다.

- 참고 게시글

[[관계형 데이터베이스] - 데이터베이스 정규화 (Database Normalization)](https://untitledtblog.tistory.com/128)

[데이터베이스 정규화 이론 3. 2NF, 3NF, BCNF](https://www.korecmblog.com/database-normalization-3-2nf-3nf-bcnf/)

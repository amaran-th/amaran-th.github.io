---
title: 데이터베이스 정규화 - 1
date: "2022-11-29T13:01:03.284Z"
description: "함수 종속성과 데이터베이스 정규화"
category: "데이터베이스"
tag: ["database"]
---

### 용어 설명

- 함수 종속성

수학적 개념으로서 함수의 정의는 다음과 같다.

```
💡 함수 y=f(x)에 대해 임의의 x에 대응하는 y의 값은 오직 하나 존재한다.
```

위 개념과 마찬가지로, relation에서 각 필드 간에 함수의 성질이 만족될 때 해당 필드들은 **함수 종속성**을 갖는다고 한다.

### 데이터베이스 정규화(Normalization)

관계형 데이터베이스의 설계에서 중복을 최소화하기 위해 데이터를 구조화하는 과정을 의미한다.

1. 테이블의 중복을 제거하기 위해
2. 데이터의 종속성이 논리적으로 표현되도록
3. data anomaly를 제거하기 위해

테이블을 decomposition(분할)하는 것

- **Heath 이론** : 테이블을 분할하는 과정에서 정보 손실이 없어야 한다(nonloss decomposition)
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

정규화를 수행하기 위한 정규화의 법칙(Normalization Rule)이 존재한다.
1NF, 2NF, 3NF, BCNF, 4NF, 5NF

### 1NF

테이블에 존재하는 필드가 모두 scalar value만을 가지며, 필드의 값이 모두 atomic하다.
atomic=테이블에 중복되는 항목(value, 즉 primary key가 아닌 컬럼의 값)이 존재하지 않아야 한다.

### NF2

1NF의 조건을 만족한다.
테이블 내에 존재하는 모든 함수종속 관계가 **완전 함수 종속**이어야 한다.여기서 완전 함수 종속의 정의는 다음과 같다.
어떤 테이블 R의 필드 Y가 필드의 집합 X에 함수 종속이면서, X 자신을 제외한 X의 어떤 부분 집합에도 함수 종속이 아니면, Y는 X에 완전 함수 종속이라고 한다.

### NF3

테이블에 존재하는 key가 아닌 필드들이 서로 독립적이다.

### BCNF

테이블에 존재하는 모든 함수 종속 관계의 determinant가 candidate key이다.

- 참고 게시글

[[관계형 데이터베이스] - 데이터베이스 정규화 (Database Normalization)](https://untitledtblog.tistory.com/128)

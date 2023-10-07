---
title: '[Kerdy] 행사 검색 기능 구현하기'
date: "2023-10-07T16:26:03.284Z"
description: "Like 검색과 전문 검색 비교하기"
category: "데이터베이스"
tags:
  - 우아한 테크코스
  - Kerdy
  - 데이터베이스
---

## Like 검색과 전문 검색 
---
### Like 검색
일반적으로 검색 기능을 구현할 때, Like 키워드를 사용해 특정 문자열을 포함하고 있는 레코드를 조회합니다.
like 키워드를 사용하는 경우, 첫번째 와일드카드(%)가 등장하기 전까지의 문자열만으로 스캔할 인덱스 범위를 결정합니다.
예를 들면 ‘SEO%L’이라는 조건절을 사용한다고 할 때, ‘SEO’까지만 인덱스를 활용할 수 있는 것이죠.

‘%키워드%’와 같이 와일드카드(%)가 첫번째 조건절로 온다면, 인덱스를 사용하지 않고 풀스캔 방식으로 레코드를 조회하기 때문에 처리 속도가 느려질 수 있습니다.

```sql
SELECT * FROM board
WHERE (title like '%학교%' or body like '%학교%')
and (title like '%취업%' or body like '%취업%')
```

### 전문 검색
이 때 우리는 MySQL의 **Full-Text Search**(전문 검색)를 활용할 수 있습니다.

앞서 나온 예시를 통해 알아보도록 합시다.

Full-Text Search를 활용하기 위해, 먼저 검색 대상이 되는 컬럼에 인덱스를 추가해줍니다.
```sql
CREATE FULLTEXT INDEX 인덱스 명 on 테이블명(컬럼 명);
```
검색 대상이 되는 title, body에 대해 인덱스를 추가해주었습니다.
```sql
CREATE FULLTEXT INDEX idx_ft_title_and_body on articles(title, body);
```
전문 검색은 `MATCH ... AGAINST` 구문을 사용해서 수행되는데요, MATCH는 쉼표로 구분되며 **검색할 열**을 지정하고, AGAINST는 **검색할 문자열**과 수행할 **검색의 유형**을 나타내는 search modifier를 사용합니다.
```sql
SELECT * FROM board
WHERE match(title, body) against('+학교* +취업*' in boolean mode);
```

*전문 검색 시에는 대/소문자를 구분하지 않습니다.

이 때, 전문 검색은 토큰과 검색 키워드가 전부 일치하거나 전방(prefix) 일치한 경우에만 결과를 가져오기 때문에, 일부 키워드만 일치하는 데이터를 가져올 수 없습니다.

이 점을 보완하기 위해 MySQL에서 기본적으로 제공해주는 N-gram Parser를 사용할 수 있습니다.

> [!NOTE] N-gram이란?
> 문장을 공백과 같은 띄어쓰기 단위로 단어를 분리하고, 그 단어를 단순히 주어진 길이로 쪼개어 인덱싱하는 알고리즘 방법.
> 단어를 쪼개는 방식은 일정한 n개의 문자로 구성된 연속된 문자열로 쪼개는 것인데, 예를 들면 다음과 같다.
> ```
> n=1: 'a', 'b', 'c', 'd'
> n=2: 'ab', 'bc', 'cd'
> n=3: 'abc', 'bcd'
> n=4: 'abcd'
> ```

MySQL에서 n-gram을 사용할 때의 토큰 사이즈(n)는 기본적으로 2로 설정되어 있으며, ngram_token_size 옵션을 통해 조절할 수 있습니다.

Full Text Index를 추가할 때 Parser로 n-gram을 설정해주는 것을 확인할 수 있습니다.
```sql
ALTER TABLE articles ADD FULLTEXT INDEX ft_index (title, body) WITH PARSER ngram;
# OR
CREATE FULLTEXT INDEX ft_index ON articles (title, body) WITH PARSER ngram;
```

## 실제로 전문검색의 성능이 더 빠를까?
---
event 테이블에 1000여개의 데이터를 삽입하고, like 검색과 전문 검색을 수행해 성능 차이를 확인해보았습니다. 
먼저 like검색으로 행사 테이블을 조회한 경우입니다.
![](https://i.imgur.com/4slfgHP.png)
![](https://i.imgur.com/SIEZsFR.png)
실행 시간은 26ms정도로 나왔습니다.
다음으로 전문 검색으로 행사 테이블을 조회해보았습니다.
![](https://i.imgur.com/ckPQUF7.png)
![](https://i.imgur.com/ULU1xEg.png)
실행시간은 18ms정도로 나왔네요.
아직까진 Full Text Index를 사용하는 것이 눈에 띄는 성능 향상을 보이진 않는 것 같습니다.
데이터 수를 10000개로 늘려보았지만 결과는 비슷했습니다.
![wVXsG3T.png](https://i.imgur.com/wVXsG3T.png)

> **Execution Time(실행 시간)과 Fetching Time(패치 시간)**
> - 실행 시간 : 옵티마이저의 실행 계획에 따라 실행 작업을 수행하는 데 걸리는 시간
> - 패치 시간 : 실행 결과를 사용자에게 버퍼 사이즈만큼 전달하는 데 걸리는 시간. 쿼리 실행과 관련이 없으며, 네트워크 연결 상태에 의존한다.
> 결과 데이터가 많을 수록 패치 시간이 오래 걸린다.

**결과적으로 인덱스의 효과를 볼 수 있을 정도 많은 양의 데이터를 제어하는 경우엔 전문 검색이 더 효과적일 수 있지만, 데이터량이 적을 경우 큰 장점을 보이지 않습니다.**

저희 서비스에서 행사(event)는 많아봤자 100~1000여개로 예상되는, 상대적으로 적은 양의 데이터를 가진 테이블이기 때문에, 인덱스를 설정하는 것이 오히려 성능 저하를 일으킬 수 있다고 판단했습니다.

그래서 Kerdy 서비스에서 행사 검색 기능을 구현하는 데에 Like 검색을 사용하기로 결정했습니다.
## 참고 자료
---
[검색 기능 구현 시 DB성능에 관한 고찰🤔](https://devdy.tistory.com/19)

[Full Text Search를 이용한 DB 성능 개선 일지](https://www.essential2189.dev/db-performance-fts)

[MySQL Ngram, 제대로 이해하기](https://gngsn.tistory.com/163)
---
title: 트랜잭션
date: "2023-06-25T23:57:03.284Z"
description: "MVD와 4NF, JD와 5NF"
category: "데이터베이스"
tags:
  - database
  - 정규화
  - 데이터베이스 성능
---

# 5.3 InnnoDB 스토리지 엔진 잠금

---

InnoDB 스토리지 엔진은 MySQL에서 제공하는 잠금과 별개로 스토리지 엔진 내부에 레코드 기반의 잠금 방식을 탑재하고 있다.

때문에 MyISAM에 비해 훨씬 **뛰어난 동시성 처리**를 제공하지만, 스토리지 엔진에서 사용되는 **잠금에 대한 정보는 MySQL 명령을 이용해 접근하기가 상당히 까다롭다.**

서버에서 **InnoDB의 잠금 정보**를 진단할 수 있는 도구라고는 lock_monitor와 `SHOW ENGINE INNODB STATUS` 명령이 전부였지만, 이마저도 이해하기가 난해했다.

최근 버전에서는 MySQL 서버의 information_schema DB의 `INNODB_TRX`, `INNODB_LOCKS`, `INNODB_LOCK_WAITS`라는 테이블을 조인해서 조회하는 것으로 InnoDB의 트랜잭션과 잠금, 잠금 대기중인 트랜잭션의 목록을 조회할 수 있게 되었다.

이후 Performance Schema를 이용해 InnoDB 스토리지 엔진의 내부 잠금(세마포어)에 대한 모니터링 방법도 추가되었다.

## 5.3.1 InnoDB 스토리지 엔진의 잠금

앞서 언급하였듯 InnoDB 스토리지 엔진은 레코드 기반의 잠금을 제공하는데, 이 잠금 정보는 상당히 작은 공간으로 관리되기 때문에 `레코드 락→페이지락` 또는 `레코드 락→테이블락`으로의 **락 에스컬레이션**은 일어나지 않는다.

InnoDB 스토리지 엔진은 레코드 락 뿐만 아니라 갭(GAP) 락이라는 것도 존재한다.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/2ccae61a-51f2-47fb-9b74-8df7b7220882/Untitled.png)

### 5.3.1.1 레코드 락(Record lock)

**레코드 자체만을 잠그는 것.**

<aside>
💡 InnoDB 스토리지 엔진은 레코드 자체가 아니라 **인덱스의 레코드**를 잠근다.

인덱스가 없는 테이블의 경우 내부적으로 자동 생성된 **클러스터 인덱스**를 이용해 잠금을 설정한다.

InnoDB에서 **보조 인덱스**를 이용한 변경 작업은 넥스트 키 락/갭 락을 사용하고, **Primary Key 또는 유니크 인덱스**에 의한 변경 작업에서는 갭에 대해서는 잠그지 않고 레코드 자체에만 락을 건다.

</aside>

### 5.3.1.2 갭 락(Gab lock)

**레코드와 바로 인접한 레코드 사이의 간격을 잠그는 것.**

레코드와 레코드 사이 간격에 새로운 레코드가 생성(INSERT)되는 것을 제어한다.

주로 넥스트 키 락의 일부로서 자주 사용된다.

### 5.3.1.3 넥스트 키 락(Next key lock)

레코드 락과 갭 락을 합쳐 놓은 형태의 잠금.

시스템 변수 `innodb_locks_unsafe_for_binlog`가 비활성화되면(=0으로 설정되면) 변경을 위해 검색하는 레코드에 넥스트 키 락이 걸린다.

갭 락과 넥스트 키 락은 바이너리 로그에 기록되는 일련의 **쿼리들이 레플리카 서버에서 실행될 때 소스 서버에서 만들어낸 결과와 동일한 결과를 만들어내도록** 보장한다.

### 5.3.1.4 자동 증가 락(Auto increment lock)

AUTO_INCREMENT 컬럼이 사용된 테이블에서 **동시에 여러 레코드가 INSERT**되는 경우, 저장되는 각 레코드는 중복되지 않고 저장된 순서대로 증가하는 일련번호 값을 가져야 한다. 이를 위해 내부적으로 사용되는 테이블 수준의 잠금을 자동 증가 락이라고 한다.

- 새로운 레코드를 저장하는 쿼리(INSERT, REPLACE)에서만 필요하며, 레코드 락/넥스트 키 락과 달리 트랜잭션과 관계없이 INSERT/REPLACE 쿼리에서 **AUTO_INCREMENT 값을 가져오는 순간에만 락이 걸렸다가 즉시 해제**된다.
- AUTO_INCREMENT 락은 **테이블 당 하나만 존재**하기 때문에 여러 개의 INSERT 쿼리가 동시에 실행되면 하나의 쿼리가 건 AUTO_INCREMENT 락을 나머지 쿼리가 기다리게 된다.
- 명시적으로 획득할 수 없다.
- MySQL 5.1 이상부터 시스템 변수 `innodb_autoinc_lock_mode`를 이용해 자동 증가 락의 작동 방식을 변경할 수 있다.
  - `0` : 모든 INSERT 문장이 자동 증가 락을 사용한다.
  - `1(연속모드)` : MySQL 서버가 INSERT되는 레코드의 건수를 정확히 예측할 수 있을땐 **래치**를 이용해 처리하고, `INSERT … SELECT`와 같이 레코드 건수를 예측할 수 없을 때는 **자동 증가 락**을 사용한다.
  - `2(인터리빙 모드)` : 모든 INSERT 쿼리에 대해 **래치**를 사용해 처리한다.

## 5.3.2 인덱스와 잠금

InnoDB의 레코드 잠금은 레코드 자체가 아니라 인덱스를 잠그는 것인데, 이는 즉 변경해야 할 레코드를 찾기 위해 **검색한 인덱스의 레코드에 모두 락을 걸어야 함**을 의미한다.

예시)

employees 테이블에 first_name 컬럼만 멤버로 담긴 **ix_firstname**이라는 인덱스가 준비되어 있다고 하자.

first_name이 ‘Georgi’인 사원은 253명이고 이 중 last_name이 ‘Klassen’인 사원은 딱 1명이라고 할 때, 해당 사원에 대한 입사 일자(hire_date)를 변경하는 쿼리를 실행해보자.

```sql
UPDATE employees SET hire_date=NOW() WHERE first_name='Georgi' AND last_name='Klassen';
```

이 경우 1건의 레코드가 업데이트 되는데, 이 문장의 조건에서 인덱스를 이용할 수 있는 조건은 first_name=’Georgi’이고 last_name은 인덱스에 없기 때문에 **253개의 레코드가 모두 잠기게 된다.**

만약 인덱스가 하나도 없다면 UPDATE 쿼리 실행 시 테이블의 모든 레코드를 잠그게 된다.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/27cd3dea-9f71-4ff8-bf8e-1bd22d5877a2/Untitled.png)

이처럼 적절히 인덱스가 준비되어 있지 않다면 클라이언트 간의 동시성이 크게 떨어질 수 있다.

## 5.3.3 레코드 수준의 잠금 확인 및 해제

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/32b67450-0753-4d4f-bf03-0fc199d49ced/Untitled.png)

위와 같은 잠금 시나리오가 있을 때, 각 트랜잭션이 어떤 잠금을 기다리고 있는지, 기다리고 있는 잠금을 어떤 트랜잭션이 가지고 있는지를 조회해보자.

- MySQL `5.1`부터는 `information_schema` DB의 `INNODB_TRX`, `INNODB_LOCKS`, `INNODB_LOCK_WAITS` 테이블을 통해 확인이 가능했다.
- MySQL `8.0`부터는 `performance_schema` DB의 `data_locks`, `data_lock_waits` 테이블로 대체되고 있다.

먼저 다음 명령을 통해 MySQL 서버에서 **실행중인 프로세스 목록**을 조회해보자.

```sql
SHOW PROCESSLIST;
```

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3c9b0f8b-8976-403d-8915-8e437defdebc/Untitled.png)

아직 COMMIT을 실행하지 않은 17번 스레드는 레코드의 잠금을 가지고 있다.

18번, 19번 스레드는 잠금 대기로 인해 아직 UPDATE 명령을 실행중인 것으로 표시된다.

그리고 다음 명령을 통해 **잠금 대기 순서**를 파악할 수 있다.

```sql
SELECT
		r.trx_id waiting_trx_id,
		r.trx_mysql_thread_id waiting_thread,
		r.trx_query waiting_query,
		b.trx_id blocking_trx_id,
		b.trx_mysql_thread_id blocking_thread,
		b.trx_query blocking_query
FROM performance_schema.data_lock_waits w
		INNER JOIN information_schema.innodb_trx b
ON b.trx_id = w.blocking_engine_transaction_id
		INNER JOIN information_schema.innodb_trx r
ON r.trx_id = w.requesting_engine_transaction_id;
```

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/b77e3a81-2371-4b82-9bd4-3a7fa4a7725f/Untitled.png)

결과를 보면 18번 스레드와 19번 스레드가 대기중인데, 18번 스레드는 17번 스레드를, 19번 스레드는 17번 스레드와 18번 스레드를 기다리고 있는 것을 알 수 있다. 즉 17→18→19의 순으로 실행될 것임을 확인할 수 있다.

여기서 **17번 스레드가 어떤 잠금을 가지고 있는지** 확인하기 위해 다음 명령을 수행한다.

```sql
SELECT * FROM performance_schema.data_lock\G
```

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6b2ef46b-3228-4834-8360-5dfd1559098a/Untitled.png)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/4cc5487e-cebd-4e37-b35d-7db5a85733ed/Untitled.png)

테이블에 대해 IX 잠금을 가지고 있고, 특정 레코드에 대해 쓰기 잠금을 가지고 있는 것을 확인할 수 있다. 여기서 `REC_NOT_GAP` 표시가 있는 것으로 레코드 잠금은 갭이 포함되지 않은 순수 레코드에 대해서만 락을 가지고 있는 것을 확인할 수 있다.

그리고 17번 스레드를 강제 종료하고 싶은 경우 다음 명령을 실행하면 된다.

```sql
KILL 17;
```

# 5.4 MySQL의 격리 수준

---

트랜잭션의 격리 수준(isolation level)이란 여러 트랜잭션이 동시에 처리될 때 특정 트랜잭션이 다른 트랙잭션에서 변경/조회하는 데이터를 볼수 있게 허용할지를 결정하는 것으로, 크게 `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`의 4가지로 나뉜다.

이 4개의 격리 수준에서 뒤로 갈수록 각 트랜잭션 간의 **격리(고립) 정도가 높아지고** **동시 처리 성능도 떨어진다**.

DB의 격리 수준과 함께 다루어지는 3가지 부정합의 문제가 있는데, 이를 표로 정리하면 다음과 같다.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/42a5be19-3ea4-4fd7-be96-14d01829516d/Untitled.png)

오라클 같은 DBMS에서는 주로 `READ COMMITTED` 수준을 많이 사용하고, MySQL에서는 `REPEATABLE READ`를 주로 사용한다.

<aside>
⚠️ 여기서 설명하는 모든 SQL 예제는 모두 AUTOCOMMIT이 `off`인 상태에서만 테스트할 수 있다.

</aside>

## 5.4.1 READ UNCOMMITTED

각 트랜잭션에서의 변경 내용을 COMMIT/ROLlBACK 여부와 상관없이 다른 트랜잭션에서 볼 수 있다.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/476bff0f-bd8c-4dbd-9438-8d9fab95bb15/Untitled.png)

사용자 A가 새로운 사원을 INSERT할 때, A가 해당 **변경사항을 COMMIT하지 않아도 사용자 B는 해당 사원을 조회할 수 있다**.

이처럼 어떤 트랜잭션에서 처리한 작업이 완료되지 않았음에도 다른 트랜잭션에서 볼 수 있는 현상을 **Dirty read(더티 리드)**라고 한다.

## 5.4.2 READ COMMITTED

COMMIT이 완료된 데이터만 다른 트랜잭션에서 조회할 수 있다.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/30424b02-b322-4535-8802-55b1f7361912/Untitled.png)

사용자 A가 특정 사원의 이름을 ‘Lara’에서 ‘Toto’로 UPDATE하는데, 이 때 ‘Lara’라는 값은 언두 영역으로 백업된다. 이 변경사항이 COMMIT되지 않은 상황에서 사용자 B가 사원을 조회하면 **언두 영역에 백업된 ‘Lara’라는 값**을 사원의 이름으로 불러온다.

이 격리수준에서는 `NON-REPEATABLE READ`라는 부정합 문제가 발생한다.

<aside>
💡 **REPEATABLE READ**

---

하나의 트랜잭션 내에서 같은 SELECT 쿼리를 실행하면 항상 같은 결과를 가져와야 한다는 정합성

</aside>

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/25941570-785a-43f8-b2e9-20c60c2bc34a/Untitled.png)

이처럼 사용자 A가 도중에 변경사항을 커밋하면, 커밋하기 전/후에 데이터를 조회한 사용자 B는 같은 쿼리를 실행했음에도 다른 데이터를 조회하게 된다.

## 5.4.3 REPEATABLE READ

`NON-REPEATABLE READ` 문제를 해결한 격리수준이다.

모든 InnoDB의 트랜잭션은 고유한 트랜잭션 번호(순차적으로 증가하는 값)를 가지는데, 언두 영역에 백업된 모든 레코드는 변경을 발생시킨 트랜잭션의 번호를 포함하고 있다.(TRX-ID)

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3f4de1cc-5113-4805-8b69-0fae1b9b7a58/Untitled.png)

위 예시에서 사용자 A의 트랜잭션 번호는 12, B의 트랜잭션 번호는 10이다. 사용자 B가 10번 트랜잭션 안에서 실행한 SELECT 쿼리는 트랜잭션 번호가 10보다 작은 트랜잭션 번호에서 변경한 값만 보게 된다.

이 격리 수준에서도 `PHANTOM READ`라는 부정합 문제가 발생한다.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6b114d78-31ec-4ddc-a3c0-81b5cb1a5b0a/Untitled.png)

다른 트랜잭션에서 수행한 변경 작업에 의해 레코드가 보였다 안 보였다 하는 현상을 `PHANTOM READ`라고 한다.

SELECT … FOR UPDATE 쿼리는 SELECT하는 레코드에 쓰기 잠금을 거는데, **언두 레코드에는 잠금을 걸 수가 없기 때문**에 언두 영역의 변경 전 데이터가 아니라 현재 레코드의 값을 가져오게 된다.

## 5.4.4 SERIALIZABLE

가장 단순하면서도 엄격한 격리 수준이다. 동시 처리 성능이 가장 떨어진다.

`SERIALIZABLE` 격리수준에서는 읽기 작업 시 공유 잠금(읽기 잠금)을 획득하기 때문에 다른 트랜잭션에서 해당 레코드를 변경할 수 없게 된다.

때문에 `PHANTOM READ`가 발생하지 않는다.

하지만 InnoDB 스토리지 엔진에서는 **갭 락**과 **넥스트 키 락** 때문에 `REPEATABLE READ` 격리 수준에서도 `PHANTOM READ`가 발생하지 않기 때문에 굳이 SERIALIZABLE 격리 수준을 사용하지 않아도 된다.

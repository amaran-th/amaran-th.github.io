---
title: "[DB] Transaction과 Spring Transaction"
date: "2023-10-07T16:11:03.284Z"
description: "Transaction의 격리 수준과 전파 옵션에 대해 알아보자."
category: "Java"
tags:
  - 우아한 테크코스
  - Java
  - 데이터베이스
---

# 이론
---
## Transaction
---
### 트랜잭션이란
: 여러 SQL문을 한 번에 커밋(commit) 또는 롤백(rollback)할 수 있는 작업 단위
![](https://i.imgur.com/j50mQQb.png)

### 언제 트랜잭션을 사용하는가?
주로 여러 건의 데이터 변경 작업을 수행할 때, 데이터 원자성을 지키기 위해 사용합니다.

예시 )
- 회원 정보의 변경 이력 남기기
	- 비밀번호 변경(update)&&변경 이력 기록(insert)
		- **둘 중 하나라도 실패하면 두 작업 모두 원래 상태로 되돌려야(rollback) 한다.**

### SQL문이 단건이면 트랜잭션을 안써도 될까?
- 한 작업 단위(메서드)가 하나의 단일 SQL 만을 호출한다고 하더라도 DB 내부에서는 여러 작업이 수행될 수 있습니다.
	- 수 천개의 레코드를 조회하는 경우
	- 컬럼에 따라 인덱스도 갱신되는 경우
- 단건 조회라도 트랜잭션을 붙이고, readonly 옵션을 사용하는 것이 좋습니다.

### 자바에서는 어떻게 트랜잭션을 사용하는가?
- Connection.setAutoCommit(false)를 통해 트랜잭션을 시작할 수 있습니다.
- Connection.commit()을 통해 트랜잭션을 커밋할 수 있습니다.
- Connection.rollback()을 통해 트랜잭션을 롤백할 수 있습니다.
![](https://i.imgur.com/WGd6KwQ.png)

### Connection이 제공하는 기능
- 트랜잭션 경계를 설정할 수 있습니다.(setAutoCommit(false), commit(), rollback())
- 트랜잭션의 격리 레벨(isolation level)을 설정할 수 있습니다.
	- 격리 레벨은 ACID 모델 중 I에 해당됩니다.
- readonly 설정을 할 수 있습니다.
- 그 외 데이터베이서 연결 관련 기능을 제공하고 있습니다.
![](https://i.imgur.com/xbDe9xy.png)

### 데이터베이스 설계 원칙 - ACID 모델
- 우리가 엑셀 파일 대신 데이터베이스를 사용하는 이유는 무엇일까요?
	=> 데이터베이스의 경우, 어떤 상황에서도 **데이터 손실이 없을 것**이라고 신뢰할 수 있기 때문입니다.
![](https://i.imgur.com/ACKBfmv.png)
[15.2 InnoDB and the ACID Model](https://dev.mysql.com/doc/refman/8.0/en/mysql-acid.html)

> **일관성과 지속성의 차이?**
>
> 지속성은 물리적인 사고(화재, 침수 등)에 의한 데이터 손실에 대한 대처와 연관이 깊다.

### Transaction Isolation Level
: 여러 트랜잭션이 한 데이터를 동시에 변경/조회할 때 일관성을 조정하는 설정입니다.
- 격리 수준에 따라 발생할 수 있는 문제는 다음과 같습니다.
	![](https://i.imgur.com/sGNkuaC.png)
[15.7.2.1 Transaction Isolation Levels](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html)

### READ UNCOMMITTED
![](https://i.imgur.com/SX6lUCK.png)


### READ COMMITTED
![](https://i.imgur.com/rPv1ZkJ.png)

### REPEATABLE READ
![](https://i.imgur.com/z6TP47u.png)

## 스프링으로 트랜잭션 적용하기
---
### @Transactional
- JDBC API만으로는 트랜잭션을 적용하기가 복잡합니다.
- 이렇게 복잡한 트랜잭션 처리 과정을 편리하게 쓸 수 있도록 스프링에서는 `@Transactional` 어노테이션을 제공하고 있습니다.
	- 이 어노테이션을 통해 개발자는 비즈니스 로직 처리에 집중할 수 있습니다.
	- 프레임워크에 인프라 처리를 맡길 수 있습니다.
- `@Transactional`도 **isolation level**, **readonly** 설정이 가능합니다.
	- **timeout**->트랜잭션 지속 시간을 설정할 수 있습니다. 데드락을 해결하는 데 중요합니다.
	- **rollback**-> 롤백 조건(예외 발생 등)을 설정할 수 있습니다.
	- **propagation**->트랜잭션 전파 방식을 설정해줄 수 있습니다.
		*Connection 객체는 propagation 설정이 없습니다.
	![](https://i.imgur.com/yYfynoD.png)

### Propagation이란?
- 이미 진행중인 트랜잭션이 있거나 없는 경우 트랜잭션은 어떻게 동작할까요?
- 스프링이 트랜잭션을 관리하는 방법은 크게 다음 2가지로 나뉩니다.
	- 물리적 트랜잭션(physical transaction) : 실제 jdbc 트랜잭션
	- 논리적 트랜잭션(logical transaction) : `@Transactional` 어노테이션으로 중첩된 메서드
![](https://i.imgur.com/yaJogXG.png)

### PROPAGATION_REQUIRED
: 진행 중인 트랜잭션이 없으면 트랜잭션을 새로 시작하고, 있다면 참여합니다.

두 논리적 트랜잭션이 한 개의 물리적 트랜잭션에 묶여있기 때문에 하나라도 롤백이 발생하면 둘 다 롤백됩니다.

즉, 이 설정에서는 모든 논리적 트랜잭션이 커밋되어야 물리적 트랜잭션도 커밋됩니다.
![](https://i.imgur.com/0SuZyjo.png)

### PROPAGATION_REQUIRES_NEW
: 진행 중인 트랜잭션이 있어도 항상 새로운 트랜잭션을 시작합니다.

다시 말해, 외부 트랜잭션과 내부 트랜잭션을 별도의 물리 트랜잭션으로 사용하는 방법입니다.

때문에 커밋과 롤백도 각각 별도로 이루어집니다.

트랜잭션의 영향 범위가 독립적으로 정해지기 때문에 내부 트랜잭션에서 문제가 발생해서 롤백되어도 외부 트랜잭션에 영향을 주지 않으며, 반대 상황도 성립됩니다.
![](https://i.imgur.com/kaLi7pc.png)

### 그 외 설정
- `SUPPORTS`: 부모 트랜잭션이 존재하면 부모 트랜잭션에 합류하고, 존재하지 않을 경우 트랜잭션 없이 메서드가 실행된다.(자바 상의 트랜잭션 객체는 생성되지만, 실제로 트랜잭션을 시작하진 않는다. = non-transactional)
- `MANDATORY`: 부모 트랜잭션이 존재하면 부모 트랜잭션에 합류하고, 존재하지 않을 경우 예외를 발생시킨다.
- `NOT_SUPPORTED`: 부모 트랜잭션이 존재하면 트랜잭션을 보류시키고, 존재하지 않을 경우 트랜잭션 없이 메서드가 실행된다.
- `NESTED`: 부모 트랜잭션이 존재하면 부모 트랜잭션에 **중첩**시키고, 존재하지 않을 경우 새로운 트랜잭션을 생성한다.
	- 부모 트랜잭션에 예외가 발생하면 자식 트랜잭션도 롤백된다.
	- 자식 트랜잭션에 예외가 발생하면 자식 트랜잭션의 호출 지점까지 롤백된다.
  `NEVER`: 메서드가 트랜잭션을 필요로 하지 않는다. 부모 트랜잭션이 존재할 경우 예외가 발생한다.
### 애플리케이션에서 스프링 프레임워크를 활용한 트랜잭션 적용
![](https://i.imgur.com/WPxhYGi.png)

### 비즈니스 로직 내의 트랜잭션 경계 설정
- 현재 미션에서 구현한 JdbcTemplate는 메서드마다 새로운 Connection을 만들고 있습니다.
- 여러 작업을 하나의 트랜잭션으로 만들어야 원자성이 보장되는데요, 이 여러작업들을 하나의 트랜잭션으로 만들려면 어떻게 해야 할까요?
	=> 한 트랜잭션으로 묶고자 하는 JdbcTemplate의 메서드들이 동일한 Connection을 사용하도록 하면 됩니다.
![](https://i.imgur.com/tgBVAKq.png)

# 학습 테스트
---
학습테스트 코드가 포함된 [Github Repository 링크](https://github.com/woowacourse/jwp-dashboard-jdbc)
### 1. 트랜잭션 격리 수준
1. **Dirty Read 발생 여부 확인하기**
```java
@Test  
void dirtyReading() throws SQLException {  
    setUp(createH2DataSource());  
  
    // db에 새로운 연결(사용자A)을 받아와서  
    final var connection = dataSource.getConnection();  
  
    // 트랜잭션을 시작한다.  
    connection.setAutoCommit(false);  
  
    // db에 데이터를 추가하고 커밋하기 전에  
    userDao.insert(connection, new User("gugu", "password", "hkkang@woowahan.com"));  
  
    new Thread(RunnableWrapper.accept(() -> {  
        // db에 connection(사용자A)이 아닌 새로운 연결인 subConnection(사용자B)을 받아온다.  
        final var subConnection = dataSource.getConnection();  
  
        // 적절한 격리 레벨을 찾는다.  
        final int isolationLevel = Connection.TRANSACTION_READ_UNCOMMITTED;  
  
        // 트랜잭션 격리 레벨을 설정한다.  
        subConnection.setTransactionIsolation(isolationLevel);  
  
        // ❗️gugu 객체는 connection에서 아직 커밋하지 않은 상태다.  
        // 격리 레벨에 따라 커밋하지 않은 gugu 객체를 조회할 수 있다.  
        // 사용자B가 사용자A가 커밋하지 않은 데이터를 조회하는게 적절할까?  
        final var actual = userDao.findByAccount(subConnection, "gugu");  
  
        // 트랜잭션 격리 레벨에 따라 아래 테스트가 통과한다.  
        // 어떤 격리 레벨일 때 다른 연결의 커밋 전 데이터를 조회할 수 있을지 찾아보자.  
        // 다른 격리 레벨은 어떤 결과가 나오는지 직접 확인해보자.  
        log.info("isolation level : {}, user : {}", isolationLevel, actual);  
        assertThat(actual).isNull();  
    })).start();  
  
    sleep(0.5);  
  
    // 롤백하면 사용자A의 user 데이터를 저장하지 않았는데 사용자B는 user 데이터가 있다고 인지한 상황이 된다.  
    connection.rollback();  
}
```
다음 값을 어떤 값으로 설정해주느냐에 따라 테스트 성공 여부가 달라진다.
```java
final int isolationLevel = Connection.TRANSACTION_READ_UNCOMMITTED;  
```
위와 같이 `READ UNCOMMITTED`로 설정해준 경우, 커밋되지 않은 데이터가 다른 트랜잭션에서 조회되고, 테스트가 실패한다. 즉 Dirty Read가 발생한다.
나머지 격리 수준의 경우 모두 통과한다.
![](https://i.imgur.com/kpz96he.png)

2. **None-repeatable Read 발생 여부 확인하기**
```java
@Test  
void noneRepeatable() throws SQLException {  
    setUp(createH2DataSource());  
  
    // 테스트 전에 필요한 데이터를 추가한다.  
    userDao.insert(dataSource.getConnection(), new User("gugu", "password", "hkkang@woowahan.com"));  
  
    // db에 새로운 연결(사용자A)을 받아와서  
    final var connection = dataSource.getConnection();  
  
    // 트랜잭션을 시작한다.  
    connection.setAutoCommit(false);  
  
    // 적절한 격리 레벨을 찾는다.  
    final int isolationLevel = Connection.TRANSACTION_READ_COMMITTED;  
  
    // 트랜잭션 격리 레벨을 설정한다.  
    connection.setTransactionIsolation(isolationLevel);  
  
    // 사용자A가 gugu 객체를 조회했다.  
    final var user = userDao.findByAccount(connection, "gugu");  
    log.info("user : {}", user);  
  
    new Thread(RunnableWrapper.accept(() -> {  
        // 사용자B가 새로 연결하여  
        final var subConnection = dataSource.getConnection();  
  
        // 사용자A가 조회한 gugu 객체를 사용자B가 다시 조회했다.  
        final var anotherUser = userDao.findByAccount(subConnection, "gugu");  
  
        // ❗사용자B가 gugu 객체의 비밀번호를 변경했다.(subConnection은 auto commit 상태)  
        anotherUser.changePassword("qqqq");  
        userDao.update(subConnection, anotherUser);  
    })).start();  
  
    sleep(0.5);  
  
    // 사용자A가 다시 gugu 객체를 조회했다.  
    // 사용자B는 패스워드를 변경하고 아직 커밋하지 않았다.  
    final var actual = userDao.findByAccount(connection, "gugu");  
  
    // 트랜잭션 격리 레벨에 따라 아래 테스트가 통과한다.  
    // 각 격리 레벨은 어떤 결과가 나오는지 직접 확인해보자.  
    log.info("isolation level : {}, user : {}", isolationLevel, actual);  
    assertThat(actual.getPassword()).isEqualTo("password");  
  
    connection.rollback();  
}
```
여기서도 마찬가지로 격리 수준을 설정하는 구문을 수정해주면 테스트 결과가 달라진다.

`READ UNCOMMITTED`, `READ COMMITTED` 격리수준으로 설정한 경우 테스트가 실패한다.(=None-repeatable Read가 발생한다.)
![](https://i.imgur.com/vvVViep.png)

3. **Phantom Read 발생 여부 확인하기**
참고로 Phantom Read는 H2 환경에서는 발생하지 않는다.

다음 테스트는 도커 환경(테스트 컨테이너)에서 실행하기 때문에, 도커가 켜져 있는 상태에서 테스트를 실행해야 한다.
```java
@Test  
void phantomReading() throws SQLException {  
  
    // testcontainer로 docker를 실행해서 mysql에 연결한다.  
    final var mysql = new MySQLContainer<>(DockerImageName.parse("mysql:8.0.30"))  
            .withLogConsumer(new Slf4jLogConsumer(log));  
    mysql.withUrlParam("allowMultiQueries", "true");  
    mysql.start();  
    setUp(createMySQLDataSource(mysql));  
  
    // 테스트 전에 필요한 데이터를 추가한다.  
    userDao.insert(dataSource.getConnection(), new User("gugu", "password", "hkkang@woowahan.com"));  
  
    // db에 새로운 연결(사용자A)을 받아와서  
    final var connection = dataSource.getConnection();  
  
    // 트랜잭션을 시작한다.  
    connection.setAutoCommit(false);  
  
    // 적절한 격리 레벨을 찾는다.  
    final int isolationLevel = Connection.TRANSACTION_REPEATABLE_READ;  
  
    // 트랜잭션 격리 레벨을 설정한다.  
    connection.setTransactionIsolation(isolationLevel);  
  
    // 사용자A가 id로 범위를 조회했다.  
    userDao.findGreaterThan(connection, 1);  
  
    new Thread(RunnableWrapper.accept(() -> {  
        // 사용자B가 새로 연결하여  
        final var subConnection = dataSource.getConnection();  
  
        // 트랜잭션 시작  
        subConnection.setAutoCommit(false);  
  
        // 새로운 user 객체를 저장했다.  
        // id는 2로 저장된다.  
        userDao.insert(subConnection, new User("bird", "password", "bird@woowahan.com"));  
  
        subConnection.commit();  
    })).start();  
  
    sleep(0.5);  
  
    // MySQL에서 팬텀 읽기를 시연하려면 update를 실행해야 한다.  
    // http://stackoverflow.com/questions/42794425/unable-to-produce-a-phantom-read/42796969#42796969    userDao.updatePasswordGreaterThan(connection, "qqqq", 1);  
  
    // 사용자A가 다시 id로 범위를 조회했다.  
    final var actual = userDao.findGreaterThan(connection, 1);  
  
    // 트랜잭션 격리 레벨에 따라 아래 테스트가 통과한다.  
    // 각 격리 레벨은 어떤 결과가 나오는지 직접 확인해보자.  
    log.info("isolation level : {}, user : {}", isolationLevel, actual);  
    assertThat(actual).hasSize(1);  
  
    connection.rollback();  
    mysql.close();  
}
```
코드를 다시 설명해보자면, 사용자 A가 처음 테이블을 조회했을 때는 한 개의 레코드만 조회된다.(1, 'gugu') 이후 사용자 B가 새로운 레코드(2, 'bird')를 추가하고 커밋을 한다.

이후 사용자 A가, id가 1 이상인 레코드에 대해 **update** 쿼리를 수행하고 테이블을 조회하면, 2개의 레코드가 조회된다.(코드 상으로는 id가 1 이상인 레코드의 존재 여부를 검증한다.)

테스트가 통과하는 경우는 Phantom Read가 발생하지 않은 것이다.(언제든 같은 결과를 조회할 수 있어야 함.)

![](https://i.imgur.com/xS7BbGn.png)
`READ UNCOMMITTED`, `READ COMMITTED`, `Repeatable Read` 격리수준으로 설정한 경우 테스트가 실패한다.(=Phantom Read가 발생한다.)

이렇게 해서 격리 수준 별 발생하는 데이터 부정합 현상을 표로 나타내면 다음과 같다.

| Isolation level | Dirty reads | Non-repeatable reads | Phantom reads  | 
| ----------------- | ------------- | ---------------------- | -------------- | 
| Read Uncommitted |     발생       |          발생           |      발생       |
| Read Committed   |     -       |          발생           |      발생       |
|  Repeatable Read  |     -       |          -           |      발생      |
|  Serializable     |     -       |          -           |      -      |

### 2. Transaction Propagation
`@Transactional` 속성 중 propagation이라는 것이 존재하는데, DB에 없는 기능을 왜 스프링에서 제공하고 있을까?
학습 테스트 코드를 통해 Propagation 속성에 대해서 알아보자.

1. **testRequired**
다음 테스트 코드에서 actual은 생성된 트랜잭션 객체의 이름 집합(Set)인데, 실행해보면 집합의 크기가 1로 나온다. 즉 생성된 트랜잭션 객체(=물리적 트랜잭션)는 1개라는 의미인데, saveFirstTransactionWithRequired() 메서드를 확인해보자.

```java
@Test  
void testRequired() {  
    final Set<String> actual = firstUserService.saveFirstTransactionWithRequired();  
  
    log.info("transactions : {}", actual);  
    assertThat(actual)  
            .hasSize(0)  
            .containsExactly("");  
}
```

![](https://i.imgur.com/VVmMCIT.png)

위 테스트 실행 결과에서 콘솔로 출력되는 ✅, ❌ 이모지는 **실행된 메서드가 물리적 트랜잭션에 참여하고 있는지 여부**를 의미한다.
```java
private void logActualTransactionActive() {  
    final var currentTransactionName = TransactionSynchronizationManager.getCurrentTransactionName();  
    final var actualTransactionActive = TransactionSynchronizationManager.isActualTransactionActive();  
    final var emoji = actualTransactionActive ? "✅" : "❌";  
    log.info("\n{} is Actual Transaction Active : {} {}", currentTransactionName, emoji, actualTransactionActive);  
}
```

다음 코드를 보면 @Transactional 어노테이션이 붙은 두 메서드가 중첩되어 실행되고 있다. 즉 논리적 트랜잭션 2개가 중첩된 것인데, 각 논리적 트랜잭션의 Propagation 속성은 모두 REQUIRED로 설정된 상태이다.

REQUIRED 설정으로 인해 중첩된 내부 트랜잭션(SecondUserService의 saveSecondTransactionWithRequired())은 새 트랜잭션을 생성하지 않고 외부 트랜잭션의 물리적 트랜잭션을 그대로 사용하기 때문에, 결과적으로 물리적 트랜잭션의 개수는 1개가 나온 것이다.
```java
// FirstUserService.java
@Transactional(propagation = Propagation.REQUIRED)  
public Set<String> saveFirstTransactionWithRequired() {  
    final var firstTransactionName = TransactionSynchronizationManager.getCurrentTransactionName();  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
  
    final var secondTransactionName = secondUserService.saveSecondTransactionWithRequired();  
  
    return of(firstTransactionName, secondTransactionName);  
}

private Set<String> of(final String firstTransactionName, final String secondTransactionName) {  
    return Stream.of(firstTransactionName, secondTransactionName)  
            .filter(transactionName -> !Objects.isNull(transactionName))  
            .collect(Collectors.toSet());  
}
```
```java
// SecondUserService.java
@Transactional(propagation = Propagation.REQUIRED)  
public String saveSecondTransactionWithRequired() {  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
    return TransactionSynchronizationManager.getCurrentTransactionName();  
}
```

2. **testRequiredNew**
이제 다음 테스트를 실행해보자. 이 테스트의 경우 2개의 물리적 트랜잭션이 생성된다.
```java
@Test  
void testRequiredNew() {  
    final Set<String> actual = firstUserService.saveFirstTransactionWithRequiredNew();  
  
    log.info("transactions : {}", actual);  
    assertThat(actual)  
            .hasSize(0)  
            .containsExactly("");  
}
```
![](https://i.imgur.com/eQIRHwY.png)

코드를 확인해보면, 외부 트랜잭션은 REQUIRED, 내부 트랜잭션은 REQUIRES_NEW로 설정되어 있다. 내부 트랜잭션의 전파 옵션을 REQUIRES_NEW로 설정해줄 경우, 내부 트랜잭션이 호출될 때 새로운 물리적 트랜잭션을 생성한다.

```java
// First UserService.java
@Transactional(propagation = Propagation.REQUIRED)  
public Set<String> saveFirstTransactionWithRequiredNew() {  
    final var firstTransactionName = TransactionSynchronizationManager.getCurrentTransactionName();  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
  
    final var secondTransactionName = secondUserService.saveSecondTransactionWithRequiresNew();  
  
    return of(firstTransactionName, secondTransactionName);  
}
```
```java
// Second UserService.java
@Transactional(propagation = Propagation.REQUIRES_NEW)  
public String saveSecondTransactionWithRequiresNew() {  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
    return TransactionSynchronizationManager.getCurrentTransactionName();  
}
```


3. **testRequiredNewWithRollback**
이제 전파 옵션 별로 롤백이 수행되는 방식을 알아보자. 결과부터 보면 테스트 로직을 수행한 후 DB에 저장된 user 엔티티의 수는 1개임을 알 수 있다.
```java
@Test  
void testRequiredNewWithRollback() {  
    assertThat(firstUserService.findAll()).hasSize(0);  
  
    assertThatThrownBy(() -> firstUserService.saveAndExceptionWithRequiredNew())  
            .isInstanceOf(RuntimeException.class);  
  
    assertThat(firstUserService.findAll()).hasSize(-1);  
}
```
![](https://i.imgur.com/BvlqPQi.png)

이제 실행 로직을 보면, 중첩된 두 트랜잭션에서 각각 새로운 user 객체를 db에 추가한 뒤 외부 트랜잭션에서 강제로 예외를 발생시키고 있다. (이 때 내부 트랜잭션의 전파 옵션은 REQUIRES_NEW이다.)

결과적으로 DB에 남은 user 객체는 1개이기 때문에, 외부 트랜잭션은 롤백되었지만 내부 트랜잭션은 롤백되지 않은 것으로 판단할 수 있다.
```java
// FirstUserService.java
@Transactional(propagation = Propagation.REQUIRED)  
public Set<String> saveAndExceptionWithRequiredNew() {  
    secondUserService.saveSecondTransactionWithRequiresNew();  
  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
  
    throw new RuntimeException();  
}
```
```java
// Second UserService.java
@Transactional(propagation = Propagation.REQUIRES_NEW)  
public String saveSecondTransactionWithRequiresNew() {  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
    return TransactionSynchronizationManager.getCurrentTransactionName();  
}
```
4. **testSupports**
다음으로 SUPPORTS 옵션에 대해 알아보자.
```java
@Test  
void testSupports() {  
    final Set<String> actual = firstUserService.saveFirstTransactionWithSupports();  
  
    log.info("transactions : {}", actual);  
    assertThat(actual)  
            .hasSize(0)  
            .containsExactly("");  
}
```
```java
// FirstUserService.java
@Transactional(propagation = Propagation.REQUIRED)  
public Set<String> saveFirstTransactionWithSupports() {  
    final var firstTransactionName = TransactionSynchronizationManager.getCurrentTransactionName();  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
  
    final var secondTransactionName = secondUserService.saveSecondTransactionWithSupports();  
  
    return of(firstTransactionName, secondTransactionName);  
}
```
```java
// SecondUserService.java
@Transactional(propagation = Propagation.SUPPORTS)  
public String saveSecondTransactionWithSupports() {  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
    return TransactionSynchronizationManager.getCurrentTransactionName();  
}
```
이 학습테스트의 경우, 외부 트랜잭션의 @Transactional을 주석처리해주면 다음과 같이 내부 트랜잭션을 실행할 때 **트랜잭션 객체는 생성되지만 실제 물리적 트랜잭션을 생성하지는 않는다**.(=non-transactional)
![](https://i.imgur.com/Gu8WThs.png)
다시 @Transactional을 활성화해주면 다음과 같이 트랜잭션이 정상적으로 생성된다.
![](https://i.imgur.com/h5Vw3cY.png)
이 결과를 통해 알 수 있는 사실은 내부 트랜잭션의 전파 옵션을 SUPPORTS로 설정할 경우 
1. 기존 트랜잭션이 존재한다면 해당 트랜잭션에 참여하고(REQUIRED과 동일)
2. 기존 트랜잭션이 존재하지 않으면 트랜잭션을 생성하지 않는다는 것이다.(non-transactional)
<br>

5. **testMandatory**
다음으로 MANDATORY 설정에 대해 알아보자.
```java
@Test  
void testMandatory() {  
    final Set<String> actual = firstUserService.saveFirstTransactionWithMandatory();  
  
    log.info("transactions : {}", actual);  
    assertThat(actual)  
            .hasSize(0)  
            .containsExactly("");  
}
```

```java
// FirstUserService.java
@Transactional(propagation = Propagation.REQUIRED)  
public Set<String> saveFirstTransactionWithMandatory() {  
    final var firstTransactionName = TransactionSynchronizationManager.getCurrentTransactionName();  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
  
    final var secondTransactionName = secondUserService.saveSecondTransactionWithMandatory();  
  
    return of(firstTransactionName, secondTransactionName);  
}
```
```java
// SecondUserService.java
@Transactional(propagation = Propagation.MANDATORY)  
public String saveSecondTransactionWithMandatory() {  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
    return TransactionSynchronizationManager.getCurrentTransactionName();  
}
```
이 학습테스트의 경우, 외부 트랜잭션의 @Transactional을 주석처리하는 경우, MANDATORY로  설정된 내부 트랜잭션을 실행시키면 스프링에서 **IllegalTransactionStateException을 발생시킨다.**
![](https://i.imgur.com/nPspRk3.png)
다시 @Transactional을 활성화해주면 다음과 같이 트랜잭션이 정상적으로 생성된다.
![](https://i.imgur.com/cquxnbp.png)
이 결과를 통해 알 수 있는 사실은, 내부 트랜잭션의 전파 옵션을 MANDATORY로 설정할 경우 
1. 기존 트랜잭션이 존재한다면 해당 트랜잭션에 참여하고(REQUIRED과 동일)
2. 기존 트랜잭션이 존재하지 않으면 예외를 발생시킨다는 것이다.

이름 그대로(Mandatory = 의무적인) 외부 트랜잭션이 필수적으로 요구되는 설정이다.

6. **testNotSupported**
다음으로 NOT_SUPPORTED 옵션에 대해 알아보자.
```java
@Test  
void testNotSupported() {  
    final Set<String> actual = firstUserService.saveFirstTransactionWithNotSupported();  
  
    log.info("transactions : {}", actual);  
    assertThat(actual)  
            .hasSize(0)  
            .containsExactly("");  
}
```


```java
// FirstUserService.java
@Transactional(propagation = Propagation.REQUIRED)  
public Set<String> saveFirstTransactionWithNotSupported() {  
    final var firstTransactionName = TransactionSynchronizationManager.getCurrentTransactionName();  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
  
    final var secondTransactionName = secondUserService.saveSecondTransactionWithNotSupported();  
  
    return of(firstTransactionName, secondTransactionName);  
}
```

```java
// SecondUserService.java
@Transactional(propagation = Propagation.NOT_SUPPORTED)  
public String saveSecondTransactionWithNotSupported() {  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
    return TransactionSynchronizationManager.getCurrentTransactionName();  
}
```

외부 트랜잭션의 @Transactional을 주석처리하는 경우, 트랜잭션 객체는 생성되지만 실제로 트랜잭션을 활성화하진 않는다.
때문에 트랜잭션에 참여중인 메서드는 없지만 트랜잭션 객체의 개수는 1개로 나오는 것이다.
(논리적 트랜잭션의 수는 1개, 물리적 트랜잭션의 수는 0개)
![](https://i.imgur.com/MWzRpGd.png)
다시 @Transactional을 활성화해주면 NOT_SUPPORTED로 설정된 내부 트랜잭션이 실행되면 기존에 실행되고 있던 트랜잭션이 일시중지되고, 트랜잭션 없이 내부 로직이 실행된다. (트랜잭션 객체는 생성되기 때문에 트랜잭션 객체의 개수는 2개로 도출된다.) 즉 물리적 트랜잭션은 1개이다.
![](https://i.imgur.com/G8L7PVq.png)

이 결과를 통해 알 수 있는 사실은 내부 트랜잭션의 전파 옵션을 NOT_SUPPORTS로 설정할 경우 
1. 기존 트랜잭션이 존재한다면 해당 트랜잭션을 일시 중단 시키고 트랜잭션 없이 내부 로직을 실행하며
2. 기존 트랜잭션이 존재하지 않으면 트랜잭션을 생성하지 않는다는 것이다.(non-transactional)
<br>

8. **testNested**
다음으로 NESTED 옵션에 대해 알아보자.
```java
@Test  
void testNested() {  
    final Set<String> actual = firstUserService.saveFirstTransactionWithNested();  
  
    log.info("transactions : {}", actual);  
    assertThat(actual)  
            .hasSize(0)  
            .containsExactly("");  
}
```
```java
// FirstUserService.java
@Transactional(propagation = Propagation.REQUIRED)  
public Set<String> saveFirstTransactionWithNested() {  
    final var firstTransactionName = TransactionSynchronizationManager.getCurrentTransactionName();  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
  
    final var secondTransactionName = secondUserService.saveSecondTransactionWithNested();  
  
    return of(firstTransactionName, secondTransactionName);  
}
```
```java
// SecondUserService.java
@Transactional(propagation = Propagation.NESTED)  
public String saveSecondTransactionWithNested() {  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
    return TransactionSynchronizationManager.getCurrentTransactionName();  
}
```

외부 트랜잭션의 @Transactional을 주석처리하는 경우, NESTED로 설정된 내부 트랜잭션을 실행하면 해당 메서드는 새 트랜잭션(=물리적 트랜잭션)을 생성한다.(논리적 트랜잭션 1개, 물리적 트랜잭션 1개)(REQUIRED와 동일하게 동작) 
![](https://i.imgur.com/D9Rm2mW.png)
다시 @Transactional을 활성화해주면 다음과 같은 예외가 발생하는 것을 확인할 수 있는데, 이유는 NESTED는 JDBC 3.0 드라이버를 사용할 때만 적용할 수 있는 옵션이기 때문이다.
![](https://i.imgur.com/LJDllIa.png)

이 결과를 통해 알 수 있는 사실은 내부 트랜잭션의 전파 옵션을 NESTED로 설정할 경우 
1. 기존 트랜잭션이 존재한다면 해당 트랜잭션에 참여하면서 새 저장 지점을 표시하고,(JDBC 3.0 드라이버를 사용할 떄만 사용 가능)(이를 중첩된 트랜잭션을 생성한다고 표현)
2. 기존 트랜잭션이 존재하지 않으면 새 트랜잭션을 생성한다는 것이다.

중첩된 트랜잭션에서 롤백이 발생하면, 해당 트랜잭션의 호출 시점으로 롤백된다.

9. **testNever**
다음으로 NEVER 옵션에 대해 알아보자.
```java
@Test  
void testNever() {  
    final Set<String> actual = firstUserService.saveFirstTransactionWithNever();  
  
    log.info("transactions : {}", actual);  
    assertThat(actual)  
            .hasSize(0)  
            .containsExactly("");  
}
```

```java
// FirstUserService.java
@Transactional(propagation = Propagation.REQUIRED)  
public Set<String> saveFirstTransactionWithNever() {  
    final var firstTransactionName = TransactionSynchronizationManager.getCurrentTransactionName();  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
  
    final var secondTransactionName = secondUserService.saveSecondTransactionWithNever();  
  
    return of(firstTransactionName, secondTransactionName);  
}
```
```java
// SecondUserService.java
@Transactional(propagation = Propagation.NEVER)  
public String saveSecondTransactionWithNever() {  
    userRepository.save(User.createTest());  
    logActualTransactionActive();  
    return TransactionSynchronizationManager.getCurrentTransactionName();  
}
```
외부 트랜잭션의 @Transactional을 주석처리하는 경우, NEVER로 설정된 내부 트랜잭션을 실행하면 해당 메서드는 트랜잭션 객체는 생성하지만 실제 트랜잭션을 생성하지는 않는다.
![](https://i.imgur.com/C1RFAXb.png)

@Transactional을 활성화해주면 다음과 같이 내부 메서드에서 예외를 반환하는 것을 확인할 수 있다.
![](https://i.imgur.com/yssFkLC.png)

이 결과를 통해 알 수 있는 사실은 내부 트랜잭션의 전파 옵션을 NEVER로 설정할 경우 
1. 기존 트랜잭션이 존재한다면 예외를 반환하고
2. 기존 트랜잭션이 존재하지 않으면 트랜잭션을 생성하지 않는다는 것이다.(non-transactional)

# 참고 자료
- 강의 참고자료
	- [MySQL 8.0 Reference Mannual - The InnoDB Storage Engine](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html)
	- 토비의 스프링
	- Real MySQL 8.0
	- 전문가를 위한 스프링 5
- 포스팅 참고 자료
	- 우테코 코치 구구의 강의자료
	- [Transaction Propagation and Isolation in Spring @Transactional](https://www.baeldung.com/spring-transactional-propagation-isolation)
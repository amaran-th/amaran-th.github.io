---
title: "[JDBC] JDBC 라이브러리 구현하기"
date: "2023-10-03T19:47:03.284Z"
description: "JDBC API의 개념을 알아보고 JdbcTemplate를 직접 구현해보자."
category: "Java"
tags:
  - 우아한 테크코스
  - Java
  - 데이터베이스
thumbnailImg: "https://blog.kakaocdn.net/dn/bBKUcH/btqWQ81nqsb/fztYFdS7v2WP2cK1O3ufo0/img.png"
---

웹 서비스를 운영하기 위해서는 DB가 필요합니다.

자바 진영에서는 애플리케이션의 DB 관련 처리를 위해 [JDBC API](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html)를 제공하고 있는데요, 개발자가 이 JDBC API를 사용하면 DB에 접근해서 원하는 SQL 구문을 실행시킬 수 있습니다.

## JDBC API
---
![](https://blog.kakaocdn.net/dn/bBKUcH/btqWQ81nqsb/fztYFdS7v2WP2cK1O3ufo0/img.png)

> **JDBC(Java Database Connectivity)**
> - 자바 언어와 DB를 연결해주는 통로와 같은 라이브러리.
> - 자바를 이용한 DB 접속과 SQL 문장의 실행, 실행결과로 얻어진 데이터를 핸들링하는 방법과 절차에 대한 규약.
> - 자바 프로그램 내에서 SQL문을 실행하기 위한 자바 API

**JDBC API**는 JDK에서 기본적으로 제공하고 있기 때문에 별도로 설치할 필요가 없습니다.

JDBC API는 DBMS에 상관없이 사용할 수 있는 표준 인터페이스를 제공하는데, 해당 인터페이스들은 대개 java.sql 또는 javax.sql 패키지에 구현되어 있습니다.

JDBC가 제공하는 주요 클래스&인터페이스에는 다음과 같은 종류가 있습니다.
- `java.sql.DriverManager` - JDBC 드라이버 로드
- `java.sql.Connection` - DB와 연결하기 위한 인터페이스
- `java.sql.Statement/PreparedStatement/CallableStatement` - SQL문을 전달하기 위한 통로
- `java.sql.ResultSet` - SQL 요청의 결과를 저장하는 객체

**JDBC 드라이버**는 데이터베이스와의 통신을 담당하는 JDBC API 구현체라이브러리입니다.

오라클, MySQL 등과 같은 특정 DBMS 별로 JDBC 드라이버 구현체가 제공되고 있으며, 이 JDBC 드라이버 구현체를 이용해 특정 DBMS에 접근할 수 있습니다.

JDBC 드라이버는 쉽게 말해 특정 DBMS와 JDBC를 연결해주는 구현체라고 할 수 있습니다.

![MySQL JDBC 드라이버](https://blog.kakaocdn.net/dn/d73O6h/btrQTFLIopP/yLrBL43RtS02sL3exsbZi1/img.png)

JDBC API와 달리 JDBC 드라이버 구현체는 사용하는 DBMS에 따라 별도의 설치과정이 필요합니다.

만약 애플리케이션에서 DBMS를 변경하고자 한다면, 별도의 변경사항 없이 JDBC 드라이버만 교체해주면 됩니다. 

이처럼 JDBC를 사용하면 데이터베이스를 변경하더라도 항상 동일한 표준 인터페이스를 사용하기 때문에 변화에 유연하게 대처할 수 있다는 장점이 있습니다.

JDBC 클래스 간의 생성 관계를 보면 다음과 같이 정리할 수 있습니다.

![](https://velog.velcdn.com/images%2Fjungnoeun%2Fpost%2Ffb09cdf8-3374-45e0-af1b-bee30c9aba7a%2F2_11_1_JDBC_.png)
1. DriverManager 객체가 갖고 있는 메서드를 이용해 JDBC 드라이버를 로딩한다.
2. DriverManager 객체를 이용해 Connection 객체를 얻어낸다.
3. Connection 객체를 통해 Statement 객체를 얻어낸다.
4. Statement 객체를 통해 Query를 실행하고 ResultSet 객체를 얻어낸다.
5. ResultSet 객체로부터 데이터를 조회한다.(Java 애플리케이션)
6. 열 때와 반대 순서로 객체를 close()해주어야 한다.(ResultSet->Statement->Connection)

그럼 이 과정을 실제 코드로 구현해봅시다.
```java
public class UserDao {
    private static final Logger log = LoggerFactory.getLogger(UserDao.class);

    private final DataSource dataSource;

    public UserDao(final DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
	public void insert(final User user) {
        final var sql = "insert into users (account, password, email) values (?, ?, ?)";

        Connection conn = null;
        PreparedStatement pstmt = null;
        try {
            conn = dataSource.getConnection();
            pstmt = conn.prepareStatement(sql);

            log.debug("query : {}", sql);

            pstmt.setString(1, user.getAccount());
            pstmt.setString(2, user.getPassword());
            pstmt.setString(3, user.getEmail());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            log.error(e.getMessage(), e);
            throw new RuntimeException(e);
        } finally {
            try {
                if (pstmt != null) {
                    pstmt.close();
                }
            } catch (SQLException ignored) {}

            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException ignored) {}
        }
    }
    
	public User findById(final Long id) {
        final var sql = "select id, account, password, email from users where id = ?";

        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
            conn = dataSource.getConnection();
            pstmt = conn.prepareStatement(sql);
            pstmt.setLong(1, id);
            rs = pstmt.executeQuery();

            log.debug("query : {}", sql);

            if (rs.next()) {
                return new User(
                        rs.getLong(1),
                        rs.getString(2),
                        rs.getString(3),
                        rs.getString(4));
            }
            return null;
        } catch (SQLException e) {
            log.error(e.getMessage(), e);
            throw new RuntimeException(e);
        } finally {
            try {
                if (rs != null) {
                    rs.close();
                }
            } catch (SQLException ignored) {}

            try {
                if (pstmt != null) {
                    pstmt.close();
                }
            } catch (SQLException ignored) {}

            try {
                if (conn != null) {
                    conn.close();
                }
            } catch (SQLException ignored) {}
        }
    }
}
```
DataSource 객체는 다음 로직에서 `DataSourceConfig.getInstance()`를 호출하여 얻어내 설정할 수 있습니다.
```java
public class DataSourceConfig {  
  
    private static javax.sql.DataSource INSTANCE;  
  
    public static javax.sql.DataSource getInstance() {  
        if (Objects.isNull(INSTANCE)) {  
            INSTANCE = createJdbcDataSource();  
        }  
        return INSTANCE;  
    }  
  
    private static JdbcDataSource createJdbcDataSource() {  
        final var jdbcDataSource = new JdbcDataSource();  
        jdbcDataSource.setUrl("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;");  
        jdbcDataSource.setUser("");  
        jdbcDataSource.setPassword("");  
        return jdbcDataSource;  
    }  
  
    private DataSourceConfig() {}  
}
```

## JDBCTemplate 만들기
---
코드를 보니 DB 관련 작업을 수행하는 코드가 반복적으로 나타나고 있습니다.

DB를 사용할 때마다 매번 복잡한 코드를 작성해야 하다보니 생산성이 크게 떨어지게 됩니다.

이 문제를 해결하기 위해 우리는 **JdbcTemplate**라는 클래스를 사용할 수 있는데요,
JdbcTemplate는 JDBC에서 제공하는 클래스로, 개발자가 JDBC를 직접 사용할 때 발생하는 반복 작업을 대신 처리해주는 클래스입니다.

JdbcTemplate를 사용하면 개발자는 SQL 쿼리 작성, 쿼리에 전달할 인자, (SELECT 구문의 경우) 조회 결과를 추출하는 것에만 집중할 수 있게 됩니다.

이번엔 이 JdbcTemplate 인터페이스를 **직접 만들어보면서** 내부 구조를 이해해봅시다.

[GITHUB Repository 링크](https://github.com/woowacourse/jwp-dashboard-jdbc)

먼저 JDBC 라이브러리(JdbcTemplate)의 역할과 개발자의 역할을 나누면 다음과 같이 계획할 수 있습니다.

![](https://i.imgur.com/nzPEK8R.png)
즉 우리가 만들게 될 JdbcTemplate 클래스의 메서드는 Connection 생성-Statement 준비 및 실행-ResultSet 생성-예외처리-Close(+트랜잭션 관리) 라는 흐름으로 작성해야 합니다.

### Update 메서드
먼저 insert, update, delete SQL 구문에 대해 처리해주는 메서드 update()입니다.
```java
public class JdbcTemplate {  
  
    private static final Logger log = LoggerFactory.getLogger(JdbcTemplate.class);  
    private static final int VALID_RESULT_COUNT = 1;  
  
    private final DataSource dataSource;  
  
    public JdbcTemplate(final DataSource dataSource) {  
        this.dataSource = dataSource;  
    }  
  
    public void update(final String sql, final Object... obj) {  
        try (final Connection conn = dataSource.getConnection();  
             final PreparedStatement pstmt = conn.prepareStatement(sql)) {  
            log.debug("query : {}", sql);  
            setSqlParameter(obj, pstmt);  
            pstmt.execute();  
        } catch (SQLException e) {  
            log.error(e.getMessage(), e);  
            throw new RuntimeException(e);  
        }  
    }  
  
    private void setSqlParameter(final Object[] obj, final PreparedStatement pstmt) throws SQLException {  
        for (int i = 0; i < obj.length; i++) {  
            pstmt.setObject(i + 1, obj[i]);  
        }  
    }
}
```
Connection 생성과 PreparedStatement 생성 구문을 try-with-resources로 처리해주어 코드량을 줄였습니다.

또, SQL 파라미터를 설정하는 구문은 setObject()를 사용해 자료형에 상관없이 파라미터를 설정하였습니다.

다음은 이렇게 구현한 update() 메서드를 개발자가 실제 사용하는 예시입니다.
```java
public class UserDao {  
  
    private final JdbcTemplate jdbcTemplate;  
  
    public UserDao(final DataSource dataSource) {  
        this.jdbcTemplate = new JdbcTemplate(dataSource);  
    }  
  
    public UserDao(final JdbcTemplate jdbcTemplate) {  
        this.jdbcTemplate = jdbcTemplate;  
    }
    
	public void insert(final User user) {  
	    final String sql = "insert into users (account, password, email) values (?, ?, ?)";  
	    jdbcTemplate.update(sql, user.getAccount(), user.getPassword(), user.getEmail());  
  
	}  
  
	public void update(final User user) {  
	    final String sql = "update users set account = ?, password = ?, email = ? where id= ?";  
	    jdbcTemplate.update(sql, user.getAccount(), user.getPassword(), user.getEmail(), user.getId());  
	}
}
```
이렇게 해서 개발자는 SQL 구문과 해당 SQL에 넣을 파라미터만 적절히 전달하기만 하면 SQL 구문을 실행시킬 수 있게 되었습니다.

### 조회 메서드
조회 메서드는 크게 하나의 레코드를 조회하는 메서드 queryForObjejct()와 여러 개의 레코드를 조회해 리스트 형태로 반환하는 query() 두 개의 메서드로 구현해보도록 하겠습니다.
```java
public class JdbcTemplate {
...
	public <T> Optional<T> queryForObject(final String sql, final RowMapper<T> rowMapper, final Object... obj) {  
        try (final Connection conn = dataSource.getConnection();  
             final PreparedStatement pstmt = getPreparedStatement(sql, obj, conn);  
             final ResultSet rs = pstmt.executeQuery()) {  
            log.debug("query : {}", sql);  
            final List<T> result = new ArrayList<>();  
            while (rs.next()) {  
                result.add(rowMapper.mapRow(rs, rs.getRow())); 
            }  
            validateResultSetSize(result);  
            return Optional.of(result.get(0));  
        } catch (SQLException e) {  
            log.error(e.getMessage(), e);  
            throw new DataAccessException(e);  
        }  
    }  
  
    private PreparedStatement getPreparedStatement(final String sql, final Object[] obj, final Connection conn) throws SQLException {  
        final PreparedStatement pstmt = conn.prepareStatement(sql);  
        setSqlParameter(obj, pstmt);  
        return pstmt;  
    }  
  
    private <T> void validateResultSetSize(List<T> result) {  
        if (result.isEmpty()) {  
            throw new DataAccessException("조회하려는 레코드가 존재하지 않습니다.");  
        }  
        if (result.size() > VALID_RESULT_COUNT) {  
            throw new DataAccessException("조회하려는 레코드는 2개 이상일 수 없습니다.");  
        }  
    }  
  
    public <T> List<T> query(final String sql, final RowMapper<T> rowMapper, final Object... obj) {  
        try (final Connection conn = dataSource.getConnection();  
             final PreparedStatement pstmt = getPreparedStatement(sql, obj, conn);  
             final ResultSet rs = pstmt.executeQuery()) {  
  
            log.debug("query : {}", sql);  
            final List<T> result = new ArrayList<>();  
            while (rs.next()) {  
                result.add(rowMapper.mapRow(rs, rs.getRow())); 
            }  
            return result;  
        } catch (SQLException e) {  
            log.error(e.getMessage(), e);  
            throw new DataAccessException(e);  
        }  
    }  
}
```
이전 update() 메서드와 비교해봤을 때, ResultSet의 데이터를 사용자가 원하는 객체로 매핑하는 로직이 추가되었습니다. 

사용자가 **객체를 매핑하는 로직**을 인수로써 전달할 수 있도록, RowMapper라는 **함수형 인터페이스**를 만들었습니다.
```java
@FunctionalInterface  
public interface RowMapper<T> {  
    T mapRow(ResultSet rs, int rowNum) throws SQLException;  
}
```
실제 메서드를 사용하는 예시는 다음과 같습니다.
```java
public class UserDao {  
    private static final RowMapper<User> USER_ROW_MAPPER = (rs, rowNum) -> new User(  
            rs.getLong(1),  
            rs.getString(2),  
            rs.getString(3),  
            rs.getString(4));
    ...
    public List<User> findAll() {  
        final String sql = "select id, account, password, email from users";  
        return jdbcTemplate.query(sql, USER_ROW_MAPPER);  
    }  
  
    public Optional<User> findById(final Long id) {  
        final String sql = "select id, account, password, email from users where id = ?";  
        return jdbcTemplate.queryForObject(sql, USER_ROW_MAPPER, id);  
    }  
  
    public Optional<User> findByAccount(final String account) {  
        final String sql = "select id, account, password, email from users where account = ?";  
        return jdbcTemplate.queryForObject(sql, USER_ROW_MAPPER, account);  
    }  
}
```

## 결론
---
이렇게 해서 JDBC API의 개념에 대해 알아보고, JDBC API를 효과적으로 사용할 수 있도록 라이브러리를 직접 구현해보았습니다.

덕분에 실제 JdbcTemplate가 어떻게 동작하는지 이해할 수 있었고, 개발자의 역할과 라이브러리의 역할을 나누었을 때의 장점을 몸소 느껴볼 수 있었습니다.

## 참고 자료
---
[[Java] JDBC란 무엇인가? - Java Database Connectivity](https://ittrue.tistory.com/250)
[[Spring] JDBC(Java Database Connectivity)란? JDBC 드라이버란?](https://code-lab1.tistory.com/272)
---
title: "[기술부채] 우테코 5기 레벨4 - 6주차"
date: "2023-10-08T22:32:03.284Z"
description: "우테코 레벨 4 6주차 기술 부채"
section: "지식 공유" 
category: "우테코 5기"
tags:
  - 기술 부채
  - 우아한 테크코스
thumbnailImg: "../thumbnail.jpg"
---

## 코드 리뷰

---

### JDBC 라이브러리 구현하기 미션 1, 2단계(1)

- sql 구문의 파라미터를 셋팅할 때, 자료형이 명시되어 있지 않은 경우 setString(), setLong() 대신 setObject()를 사용할 수도 있다.
    
    ```java
    private void setSQLParameter(final Object parameter, final int parameterIndex,
                                 final PreparedStatement pstmt)
                throws SQLException {
        if (parameter instanceof String) {
            pstmt.setString(parameterIndex, (String) parameter);
            return;
        }
        if (parameter instanceof Long) {
            pstmt.setLong(parameterIndex, (Long) parameter);
            return;
        }
        ...
        if (parameter instanceof LocalDateTime) {
            pstmt.setTimestamp(parameterIndex, Timestamp.valueOf((LocalDateTime) parameter));
        }
    }
    ```
    
    ```java
    private void setSQLParameter(final Object parameter, final int parameterIndex,
                                 final PreparedStatement pstmt)
                throws SQLException {
        pstmt.setObject(parameterIndex, parameter);
    }
    ```
    
- SQLException으로 인한 예외가 발생했을 때, RuntimeException보다 다른 예외를 사용하는 것이 좋아 보인다.(DataAccessException으로 변경)
    
    ```java
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
    ```
    
- JDBC API에서 제공하는 Connection, PreparedStatement, ResultSet 모두 AutoCloseable의 구현체이기 때문에 try-with-resources를 적용할 수 있다.
- 아래와 같은 방법으로 ResultSet 객체의 요소를 반환하도록 하면, DB에 같은 쿼리를 날려도 다른 결과가 나오는 경우가 발생할 수 있다.
    
    때문에 ResultSet의 요소가 1개만 나오도록 제약을 걸어두어야 한다.
    
    ```java
    public <T> Optional<T> queryForObject(final String sql, final RowMapper<T> rowMapper, final Object... obj) {
        try (final Connection conn = dataSource.getConnection();
             final PreparedStatement pstmt = conn.prepareStatement(sql)) {
    		    ...
    		    ResultSet rs = pstmt.executeQuery();
    				if (rs.next()) {
                  return Optional.of(rowMapper.mapRow(rs, rs.getRow()));
            }
    				return Optional.empty();
        } catch (SQLException e) {
            log.error(e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }
    ```
    
- 함수형 인터페이스를 정의할 때, @FunctionalInterface 어노테이션을 사용하면 추후 인터페이스에 다른 메서드가 추가되는 일을 미연에 방지할 수 있다.
    
    ```java
    @FunctionalInterface
    public interface RowMapper<T> {
        T mapRow(ResultSet rs, int rowNum) throws SQLException;
    }
    ```
    

### JDBC 라이브러리 구현하기 미션 1, 2단계(2)

- getPreparedStatement()의 경우 특별한 로직 없이 단순히 PreparedStatement를 반환하는 메서드이니 Util성 클래스로 분리하는 것이 좋아보인다.
    - 리뷰어의 견해 : 메인 로직과 밀접하지 않고 변경될 가능성이 적은 기능의 경우 Util 클래스로 분리해도 괜찮다.
    
    ```java
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
    ```
    
- ‘결과가 2개 이상이라 어느 것을 반환해야 할지 알 수 없는’ 상황은 예외를 던지는 것 외에 사용자에게 해당 사실을 알릴 방법이 없지만, ‘조회하려는 레코드가 존재하지 않’는 상황은 예외를 던지지 않고도 null이나 Optional.empty()을 반환함으로서 사용자에게 알릴 수 있다.
    
    ```java
    private <T> void validateResultSetSize(List<T> result) {
        if (result.isEmpty()) {
            throw new DataAccessException("조회하려는 레코드가 존재하지 않습니다.");
        }
    		if (result.size() > VALID_RESULT_COUNT) {
            throw new DataAccessException("조회하려는 레코드는 2개 이상일 수 없습니다.");
        }
    }
    ```
    
- 반복되는 try-with-resources 구문을 중복제거 해보는 건 어떤지?
    
    다음과 같은 함수형 인터페이스를 정의하고,
    
    ```java
    public interface StatementExecutor<T> {
        T execute(final ResultSet rs) throws SQLException;
    }
    ```
    
    try-catch문을 메서드로 분리해주면 try-catch문에 대한 중복을 제거할 수 있다.
    
    ```java
    public <T> List<T> tryCatchTemplate(final StatementExecutor<List<T>> executor, final String sql, final Object... obj) {
        try (final Connection conn = dataSource.getConnection();
             final PreparedStatement pstmt = getPreparedStatement(sql, obj, conn);
             final ResultSet rs = pstmt.executeQuery()) {
            return executor.execute(rs);
        } catch (final SQLException exception) {
            log.error(exception.getMessage(), exception);
            throw new DataAccessException(exception);
        }
    }
    ```
    
    커스텀 함수형 인터페이스의 메서드 시그니쳐에 SQLException를 표기해주면, ResultSet 객체에 대한 로직을 수행하고 있는 메서드 `convertResultSetToInstances()`에 대해 예외 처리를 해주지 않아도 된다.
    
    ```java
    public <T> List<T> query(final String sql, final RowMapper<T> rowMapper, final Object... obj) {
        return tryCatchTemplate(rs -> {
            log.debug("query : {}", sql);
            return convertResultSetToInstances(rowMapper, rs);
        }, sql, obj);
    }
    ```
    

### JDBC 라이브러리 구현하기 3단계(1)

- 아래와 같이 코드를 작성한 경우, try 구문에 정의된 구문이 다른 update()에는 적용할 수 없다. update, query, queryForObject에 범용적으로 사용할 수 있게 만들 수는 없을까?
    
    ```java
    public <T> List<T> tryCatchTemplate(final StatementExecutor<List<T>> executor, final String sql, final Object... obj) {
        try (final Connection conn = dataSource.getConnection();
             final PreparedStatement pstmt = getPreparedStatement(sql, obj, conn);
             final ResultSet rs = pstmt.executeQuery()) {
            return executor.execute(rs);
        } catch (final SQLException exception) {
            log.error(exception.getMessage(), exception);
            throw new DataAccessException(exception);
        }
    }
    ```
    
- Connection을 주입받는 메서드가 필요해짐에 따라 update() 메서드를 오버로딩해주었는데, queryForObject()와 query()까지 오버로딩해줄 것인지?
    
    오버로딩 없이 할 수 있는 방법은 없을까?
    
    ```java
    public void update(final String sql, final Object... obj) {
            try (final Connection conn = dataSource.getConnection();
                 final PreparedStatement pstmt = getPreparedStatement(sql, obj, conn)) {
                log.debug("query : {}", sql);
                pstmt.execute();
            } catch (SQLException exception) {
                log.error(exception.getMessage(), exception);
                throw new DataAccessException(exception);
            }
        }
    
    public void update(final Connection conn, final String sql, final Object... obj) {
            try (final PreparedStatement pstmt = getPreparedStatement(sql, obj, conn)) {
                log.debug("query : {}", sql);
                pstmt.execute();
            } catch (SQLException exception) {
                log.error(exception.getMessage(), exception);
                throw new DataAccessException(exception);
            }
        }
    ```
    
    Connection을 static 객체로 다룰 수 있게 함으로써 JdbcTemplate 메서드에 직접 Connection 객체를 파라미터로 넘기지 않아도 되게끔 수정하였다.
    
    ```java
    private <T> T tryCatchTemplate(final StatementExecutor<T> executor, final String sql, final Object... obj) {
            final Connection conn = DataSourceUtils.getConnection(dataSource);
            try (final PreparedStatement pstmt = getPreparedStatement(sql, obj, conn)) {
                log.debug("query : {}", sql);
                return executor.execute(pstmt);
            } catch (SQLException exception) {
                log.error(exception.getMessage(), exception);
                throw new DataAccessException(exception);
            }
        }
    ```
    
    ```java
    public static Connection getConnection(DataSource dataSource) throws CannotGetJdbcConnectionException {
            Connection connection = TransactionSynchronizationManager.getResource(dataSource);
            if (connection != null) {
                return connection;
            }
    
            try {
                connection = dataSource.getConnection();
                TransactionSynchronizationManager.bindResource(dataSource, connection);
                return connection;
            } catch (SQLException ex) {
                throw new CannotGetJdbcConnectionException("Failed to obtain JDBC Connection", ex);
            }
        }
    ```

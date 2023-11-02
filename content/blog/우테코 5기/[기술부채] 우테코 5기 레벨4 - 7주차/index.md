---
title: "[기술부채] 우테코 5기 레벨4 - 7주차"
date: "2023-10-15T17:48:03.284Z"
description: "우테코 레벨 4 7주차 기술 부채"
section: "지식 공유" 
category: "우테코 5기"
tags:
  - 기술 부채
  - 우아한 테크코스
thumbnailImg: "../thumbnail.jpg"
---

## 코드 리뷰

---

### JDBC 라이브러리 구현하기 미션 3단계(2)

- 현재 구현 코드를 보면, TransactionManager 를 통해 DB와 통신하는 경우에는 TransactionManager 에서 connection 이 close() 되지만, 그렇지 않은경우 (예를 들어 UserService#findById 또는 insert) 같은 경우는 close가 되지 않고 있다.
    
    꼭 트랜잭션을 걸어줘야만 connection이 close 되는게 좋은걸까?
    
    ⇒커넥션을 오랫동안 붙잡고 있는 게 꼭 좋은 방법은 아니라는 생각이 들었음. 그래서 JdbcTemplate의 메서드에 finally 구문을 추가하고, 현재 트랜잭션이 활성화되었는지 여부에 따라 커넥션을 해제해주는 분기를 추가해주었음.
    
    ```java
    private <T> T tryCatchTemplate(final StatementExecutor<T> executor, final String sql, final Object... obj) {
            final Connection conn = DataSourceUtils.getConnection(dataSource);
            try (final PreparedStatement pstmt = getPreparedStatement(sql, obj, conn)) {
                log.debug("query : {}", sql);
                return executor.execute(pstmt);
            } catch (SQLException exception) {
                log.error(exception.getMessage(), exception);
                throw new DataAccessException(exception);
            } finally {
                releaseConnectionIfInactiveTransaction(conn);
            }
        }
    
        private void releaseConnectionIfInactiveTransaction(final Connection conn) {
            try {
                if (conn.getAutoCommit())
                    DataSourceUtils.releaseConnection(conn, dataSource);
            } catch (SQLException e) {
                throw new DataAccessException(e);
            }
        }
    ```

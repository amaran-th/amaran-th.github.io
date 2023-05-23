---
title: "[MySQL] MySQL과 Java의 데이터 타입"
date: "2023-05-23T21:19:03.284Z"
description: "MySQL의 자료형과 매핑되는 Java의 자료형 타입을 알아보자"
category: "Java"
tags:
  - 우아한 테크코스
  - Java
---

MySQL의 데이터 타입이 Java에서 어떤 자료형에 매핑되는지 매번 일일이 찾아보기 귀찮아서 정리해보았다.

| mysql 데이터타입            | java 데이터 타입                                    |
| --------------------------- | --------------------------------------------------- |
| BIT                         | Boolean                                             |
| TINYINT                     | Integer                                             |
| BOOL / BOOLEAN [TINYINT(1)] | Integer                                             |
| SMALLINT                    | Integer                                             |
| MEDIUMINT                   | Integer  / Unsigned면 Long                          |
| INT                         | Integer / Unsigned면 Long                           |
| BIGINT                      | Long / Unsigned면 java.math.BigInteger              |
| FLOAT                       | FLOAT                                               |
| DOUBLE                      | Double                                              |
| DECIMAL                     | java.math.BigDecimal                                |
| DATE                        | java.sql.Date                                       |
| DATETIME                    | java.sql.Timestamp                                  |
| TIMESTAMP                   | java.sql.Timestamp                                  |
| YEAR                        | Short / yearslsDateType이 설정됬다면 java.sql.Date  |
| CHAR                        | 칼럼이 Binary 설정되있다면 String / 아니라면 byte[] |
| VARCHAR                     | 칼럼이 Binary 설정되있다면 String / 아니라면 byte[] |
| BINARY                      | byte[]                                              |
| VARBINARY                   | byte[]                                              |
| TINYBLOB                    | byte[]                                              |
| TINYTEXT                    | String                                              |
| BLOB                        | byte[]                                              |
| MEDIUMBLOB                  | byte[]                                              |
| LONGBLOB                    | byte[]                                              |
| TEXT                        | String                                              |
| MEDIUMTEXT                  | String                                              |
| LONGTEXT                    | String                                              |
| ENUM                        | String                                              |
| SET                         | String                                              |

### 출처

[[Java] 간단히 mysql 데이터타입을 java 데이터타입과 매칭시켜보자](https://donggu1105.tistory.com/122)

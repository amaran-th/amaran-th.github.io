---
title: "[Java] DB 변경사항 롤백하기"
date: "2023-03-26T17:31:03.284Z"
description: Spring과 Java에서 DB 로직을 롤백하는 방법에 대해 알아보자.
section: "지식 공유" 
category: "Java"
tags:
  - 우아한 테크코스
  - Java
  - Spring
  - 데이터베이스
  - JUnit5
---

## 🍃스프링에서 롤백하기 - @Transactional 어노테이션

---

DB 로직을 구현할 때, 테스트를 돌릴 때마다 실제 DB에 변경사항이 누적되면 여러가지 문제가 생길 수 있다.

이를 방지하기 위해 Spring 프레임워크에서는 어노테이션을 통해 변경사항을 롤백할 수 있는 기능을 제공하고 있다.

### 프로덕션 코드에서 롤백

프로덕션 코드 실행 중 런타임 예외가 발생하면 DB에 대한 변경사항이 롤백된다.

- 사용 예시
  아래 코드는 `IllegalArgumentException` 예외가 발생할 경우 트랜잭션을 롤백한다.
  ```java
  @Transactional(rollbackFor={IllegalArgumentException.class})
  public void saveBook(BookRequest bookRequest){
  		bookRepository.save(new Book(bookRequest.getBookName(), bookRequest.getBookAuthor(), bookRequest.getPrice()));
  }
  ```
  💡rollbackFor 속성에 대한 값을 지정해주지 않을 경우 Spring은 디폴트로 `RuntimeException`과 `Error` 클래스를 설정한다.

⚠️만일 코드 내에서 try-catch문을 사용해 예외를 처리했다면, rollback은 일어나지 않는다.

### 테스트 코드에서 롤백

만약 `@Transactional` 어노테이션을 `@Test` 어노테이션과 함께 사용할 경우 예외 발생 여부와 상관없이 롤백 처리된다.

테스트 시작 전에 트랜잭션을 시작하고, 테스트 완료 후 롤백을 한다.

```java
@SpringBootTest
@AutoConfigureMockMvc
class SaveControllerTest {

    @Test
    @DisplayName("TEST 데이터 저장")
    @Transactional // 테스트 완료 후 rollback
    void saveTest() throws Exception {
        /* param set */
        TestDto testDto = new TestDto();
        testDto.setName("test");

        MvcResult result = mockMvc.perform(post("/test/saveTest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(rmVenParamDto)))
                .andExpect(status().isOk())
                .andReturn();

        ...
    }
}
```

➕rollback false 지정

만약 테스트 클래스에 `@Transactional` 어노테이션을 선언해준 상태에서 특정 메서드만 rollback되지 않게 하고 싶다면, `@Rollback(false)` 어노테이션을 사용하면 된다.

```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SaveControllerTest {

    @Test
    @DisplayName("TEST 데이터 저장")
    @Rollback(false) // rollback 되지 않도록 설정
    void saveTest() throws Exception {
        /* param set */
        TestDto testDto = new TestDto();
        testDto.setName("test");

        MvcResult result = mockMvc.perform(post("/test/saveTest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(rmVenParamDto)))
                .andExpect(status().isOk())
                .andReturn();

        ...
    }
}
```

## ☕바닐라 자바에서 트랜잭션 롤백하기

---

다음과 같은 로직으로 DB를 직접 롤백할 수 있다.

```java
Connection connection = DriverManager.getConnection(
		"jdbc:mysql://localhost:13306/chess?OPTION", USERNAME, PASSWORD);
Objects.requireNonNull(connection).setAutoCommit(false);
...    //데이터베이스 쿼리문 실행 로직
connection.rollback();
connection.close();
```

- `setAutoCommit(false)` : 쿼리 수행 직후 변경사항이 커밋되는 것을 막는다.
- `connection.rollback()` : 변경사항을 롤백한다.
- `connection.close()` : 커넥션을 닫는다.

⚠️이 경우, connection을 별도로 닫아줘야 하므로 try-catch 자동 반환 문법을 사용할 수 없다는 단점이 있다.

실제 테스트코드에 적용한 예시는 다음과 같다.

- `DataSource` : Connection을 생성하여 반환하는 클래스

  ```java
  public class DataSource {

      private static final String SERVER = /* MySQL 서버 주소 */
      private static final String DATABASE = /* MySQL DATABASE 이름 */
      private static final String OPTION = /* 옵션 */
      private static final String USERNAME = /* MySQL 서버 아이디 */
      private static final String PASSWORD = /* MySQL 서버 비밀번호 */

      public static Connection getConnection() {
          // 드라이버 연결
          try {
              return DriverManager.getConnection("jdbc:mysql://" + SERVER + "/" + DATABASE + OPTION,
                  USERNAME, PASSWORD);
          } catch (final SQLException e) {
              System.err.println("DB 연결 오류:" + e.getMessage());
              e.printStackTrace();
              return null;
          }
      }
  }
  ```

- `UserDao` : Connection을 생성하여 반환하는 클래스

  ```java
  public final class UserDao {

      private final Connection connection;

      UserDao(Connection connection) {
          this.connection = connection;
      }

      public void addUser(final User user) {
          final var query = "INSERT INTO user VALUES(?, ?)";
          try (final var preparedStatement = connection.prepareStatement(query)) {
              preparedStatement.setString(1, user.userId());
              preparedStatement.setString(2, user.name());
              preparedStatement.executeUpdate();
          } catch (final SQLException e) {
              throw new RuntimeException(e);
          }
      }
  		...
  }
  ```

- `UserDaoTest` : UserDao에 대한 테스트 코드. 각 동작 수행 후 rollback을 수행한다.

  ```java
  class UserDaoTest {

      private UserDao userDao;
      private Connection connection;

      @BeforeEach
      void initialize() {
          try {
              connection = DataSource.getConnection();
              Objects.requireNonNull(connection).setAutoCommit(false);
              userDao = new UserDao(connection);
          } catch (SQLException e) {
              e.printStackTrace();
          }
      }

      @Test
      public void addUser() {
          try {
              final var user = new User("test", "testUser");
              userDao.addUser(user);
              connection.rollback();
              connection.close();
          } catch (SQLException e) {
              e.printStackTrace();
          }
      }
  		...
  }
  ```

  💡rollback&close 로직을 `@AfterEach` 또는 `@AfterAll` 어노테이션을 사용해서 분리해주어도 된다.

<nav>

📎참고 게시글

- [https://pjh3749.tistory.com/269](https://pjh3749.tistory.com/269)
- [https://devfunny.tistory.com/721](https://devfunny.tistory.com/721)
- [https://wonin.tistory.com/494](https://wonin.tistory.com/494)

</nav>

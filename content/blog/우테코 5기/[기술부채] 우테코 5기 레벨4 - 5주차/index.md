---
title: "[기술부채] 우테코 5기 레벨4 - 5주차"
date: "2023-10-01T23:30:03.284Z"
description: "우테코 레벨 4 5주차 기술 부채"
category: "우테코 5기"
tags:
  - 기술 부채
  - 우아한 테크코스
thumbnailImg: "../thumbnail.jpg"
---

## 코드 리뷰

---

### @MVC 구현하기 미션 3단계 리뷰

- `"com.techcoursre"`가 mvc모듈의 DispatcherServlet에 박혀있어서, 다른 app 모듈에서는 활용을 못할 것 같다. app에서 자신에 맞는 HandlerMappings와 HandlerAdapters를 초기화할 수 있게 이 과정을 DispatcherServletInitializer에서 해주는것은 어떨지?
    
    ```java
    // DiapatcherServlet.java
    @Override
    public void init() {
        try {
            handlerMappings = new HandlerMappings(new AnnotationHandlerMapping("com.techcourse"));
            handlerMappings.initialize();
            handlerAdapters = new HandlerAdapters(new AnnotationHandlerAdapter());
        } catch (Exception exception) {
    		    throw new RuntimeException(exception);
        }
    }
    ```

## 자잘한 기술부채

---

### ✅ HttpServletResponse 객체로 JSON 객체 반환하기

Jackson 라이브러리를 사용해 객체 또는 Map을 Json 형식의 문자열로 변환한다.
```java
@Controller  
public class UserController {  
  
    private static final Logger log = LoggerFactory.getLogger(UserController.class);  
  
    @RequestMapping(value = "/api/user", method = RequestMethod.GET)  
    public ModelAndView show(HttpServletRequest request, HttpServletResponse response) {  
        final String account = request.getParameter("account");  
        log.debug("user id : {}", account);  
  
        final ModelAndView modelAndView = new ModelAndView(new JsonView());  
        final User user = InMemoryUserRepository.findByAccount(account)  
                .orElseThrow();  
  
        modelAndView.addObject("user", user);  
        return modelAndView;  
    }  
}
```
위와 같이 컨트롤러 코드가 작성되었다고 하자.
우리는 JsonView 클래스의 render 메서드를 구현해서 `/api/user`로 GET 요청을 보내면 user 객체를 json 형식으로 반환받을 수 있게 해야 한다.
```java
public class JsonView implements View {  
  
    @Override  
    public void render(final Map<String, ?> model, final HttpServletRequest request, HttpServletResponse response) throws Exception {  
        final ObjectMapper objectMapper = new ObjectMapper();  
        response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);  
  
        final String result = objectMapper.writeValueAsString(model);  
        response.getWriter().write(result);  
    }  
}
```

Jackson 라이브러리에서 제공하는 ObjectMapper를 이용해 Map 객체를 Json 형식의 문자열로 변환한다.
이 때 response 객체의 ContentType을 application/json으로 지정해주어야 한다.
그 후 response의 getWriter() 메서드를 통해 변환한 문자열을 반환하도록 하면, 
![](https://i.imgur.com/6HFjsYL.png)
이렇게 요청을 보냈을 때 정상적으로 Json 문자열이 반환되는 모습을 확인할 수 있다.

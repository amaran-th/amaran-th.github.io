---
title: "[Spring] Response Header에 접근할 수 없는 문제 해결하기"
date: "2023-05-24T21:10:03.284Z"
description: "Response Header에 접근할 수 없는 문제 트러블 슈팅(feat. CORS)"
section: "지식 공유" 
category: "Spring"
tags:
  - 우아한 테크코스
  - Spring
  - 트러블 슈팅
---

### 문제

정상적으로 요청과 응답이 이루어지고, 개발자 도구의 network 탭에서는 응답 헤더에 `Location` 데이터가 담겨 오는 것을 확인할 수 있지만 해당 헤더에 접근하려고 하면 null이 반환된다.

```java
console.log(response.headers.location) //null
```

### 해결

이 원인을 찾아보니, CORS 정책이 문제였다.

CORS 정책의 기본 설정으로 인해 클라이언트는 응답으로부터 다음 헤더에만 접근할 수 있다.

`Cache-Control`, `Content-Language`, `Content-Type`, `Expires`, `Last-Modified`, `Pragma`

이 외의 헤더를 사용할 수 있게 하기 위해서는 다음과 같이 exposedHeaders() 메서드를 통해 허용해주어야 한다.

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    ...

    @Override
    public void addCorsMappings(CorsRegistry registry){
        registry.addMapping("/**")
                .allowedMethods("*")
                .exposedHeaders(HttpHeaders.LOCATION);
    }
}
```

<aside>
💡 exposedHeaders("*")로 설정해주면 모든 헤더 값을 반환하도록 할 수 있다.

</aside>

### 부록: allowedHeaders()와 exposedHeaders()의 차이는?

먼저 Preflight의 개념을 짚고 넘어가보자.

preflight는 미리 보내는 것, 사전 전달이라는 뜻을 가지고 있다.

기본적으로 브라우저는 cross-origin 요청을 전송하기 전 OPTIONS 메소드로 preflight 요청을 전송한다.

이 때 Response로 Access-Control-Allow-Origin과 Access-Control-Allow-Methods가 반환되어 브라우저에게 서버에서 허용하는 origin과 method들을 알려준다.

그 다음 실제 cross-origin 요청을 보내 이후 과정을 진행한다.

즉, 요약하면

`allowedHeaders()`는 **preflight 요청 헤더**에 담도록 허용할 헤더를 설정하는 메서드이고, `exposedHeaders()`는 **실제 요청에 대한 응답**으로부터 접근할 수 있는 응답 헤더를 설정하는 메서드이다.

### 참고 자료

[Access-Control-Expose-Headers - HTTP | MDN](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Access-Control-Expose-Headers)

[http 응답에서 특정 헤더가 읽어지지 않을때](https://www.donnert.net/106)

---
title: "[AWS] AWS Lambda로 주기적으로 S3에만 저장된 파일 제거하기"
date: "2023-12-10T03:28:03.284Z"
description: "AWS Lambda를 사용해 S3에 남은 고아 이미지를 제거해보자."
section: "문제 해결" 
category: "인프라"
tags:
  - kerdy
  - aws
thumbnailImg: "./lambda.png"
---

## 들어가며
---
[Kerdy Image 처리 작업 성능 개선기](https://amaran-th.github.io/%EC%A3%BC%EC%A0%80%EB%A6%AC%EC%A3%BC%EC%A0%80%EB%A6%AC/[Kerdy]%20Image%20%EC%B2%98%EB%A6%AC%20%EC%9E%91%EC%97%85%20%EC%84%B1%EB%8A%A5%20%EA%B0%9C%EC%84%A0%EA%B8%B0/)의 **이미지 업로드 실패에 대한 처리**문제를 해결하기 위해 Lambda 함수를 도입하는 과정을 정리하였다.
나와 비슷한 목적으로 AWS Lambda 함수를 사용하려는 분들께 도움이 되길 바란다.
## 과정
---
### 1. AWS Lambda 생성
[AWS Lambda 콘솔](https://ap-northeast-2.console.aws.amazon.com/lambda/home?region=ap-northeast-2#/functions)에서 람다 함수를 생성해보자.
`Lambda>함수`로 이동한 뒤 함수 생성 버튼을 클릭한다.
![](https://i.imgur.com/eYnThpL.png)

함수 이름과 런타임(코드 작성 언어)를 기입하고, 함수 생성 버튼을 클릭해 람다 함수를 생성해준다.
![](https://i.imgur.com/MHV5rWt.png)

### 2. S3, RDS 접근 권한 설정 - IAM Role, VPC
AWS Lambda 함수에서 S3에 접근할 수 있도록, S3 접근 권한을 가진 역할을 생성하여 Lambda 함수에 부여해주어야 한다.
[IAM 콘솔](https://us-east-1.console.aws.amazon.com/iam/home?region=ap-northeast-2)로 이동하고, `IAM>역할`로 접근해 '역할 생성'을 클릭한다.
![](https://i.imgur.com/MB2lmiX.png)
Lambda에 부여할 역할이므로, 사용 사례를 Lambda로 선택해준다.
![](https://i.imgur.com/EaSviR5.png)
다음으로, 역할에 권한을 줄 차례이다.
S3에 접근하기 위해 `AmazonS3FullAccess` 정책을 찾아 체크해준다. S3에 대한 모든 접근 권한을 허용한다는 의미이다.
![](https://i.imgur.com/gpcdD7r.png)
그리고 RDS에 접근하기 위해 `AWSLambdaVPCAccessExecutionRole` 정책을 찾아 체크한다.
동일한 VPC 상에 있는 서비스에 대한 접근 권한을 허용한다는 의미이다.
![](https://i.imgur.com/EHPTKz0.png)

이렇게 역할을 생성해주면, ARN이라는 걸 확인할 수 있는데 이건 나중에 RDS와 연동할 때 사용될 정보이니 기억해두도록 하자. 
![](https://i.imgur.com/7fpjuUv.png)

<aside>

**ARN이란**

---
AWS 리소스를 고유하게 식별하는 이름(Aws Resource Name)
</aside>

이제 다시 Lambda 콘솔로 돌아가 1단계에서 만들었던 함수 페이지에 접속한다.
`구성 > 권한`에서 **실행 역할**을 확인할 수 있는데, 여기서 편집을 클릭해 앞서 만들었던 역할을 설정해준다.

![](https://i.imgur.com/taf8AJc.png)
![](https://i.imgur.com/d5DjVmZ.png)
이렇게 해서 내가 만든 람다 함수가 S3에 접근할 수 있게 되었다.

하지만 아직은 커디의 보안 정책 상 RDS에 접근할 수 없다. RDS 접근 권한을 얻기 위해서는 몇 가지 작업을 더 해야 한다.
RDS는 동일한 VPC 상에 존재하는 인스턴스로부터의 접근을 허용하고 있으므로, Lambda 함수를 RDS와 같은 VPC 상에 두어야 한다.

먼저, RDS 콘솔로 들어가 RDS의 **VPC, 서브넷, VPC 보안 그룹 정보**를 확인한다.
![](https://i.imgur.com/ETk8o1u.png)

다시 Lambda 콘솔로 돌아가서, `구성 > VPC`로 들어가 편집을 클릭한다.
그럼 VPC, 서브넷, 보안그룹을 기입하는 란이 나오는데, 모두 RDS의 VPC 정보와 동일하게 설정한다.
![](https://i.imgur.com/CShpB8J.png)

![](https://i.imgur.com/QjNoWPY.png)
**그런데 여기서 주의할 점이 있다.**

S3는 VPC 외부에 있기 때문에, Lambda 함수에 VPC를 할당해주면 S3에 접근할 수가 없게 된다.
때문에 VPC에서 S3에 접근할 수 있도록 **VPC 엔드포인트**를 추가해주어야 한다.

VPC 엔드포인트 중에서도 Gateway Endpoint를 추가하기로 했다.(이 부분에 대해서는 나중에 좀 더 알아봐야겠다.)

[VPC 콘솔](https://ap-northeast-2.console.aws.amazon.com/vpcconsole/home?region=ap-northeast-2#Home:)로 들어가 `VPC>Endpoint`에 접속하고, 엔드포인트 생성을 클릭한다.
![](https://i.imgur.com/grEQlxW.png)

엔드포인트 이름을 짓고
![](https://i.imgur.com/P9Ff6x3.png)

엔드포인트를 연결할 서비스(s3)를 Gateway 유형으로 선택하고
![](https://i.imgur.com/d86OGEr.png)

엔드포인트를 만들 VPC와 라우팅 테이블을 선택한다.
![](https://i.imgur.com/CtQ7g1I.png)
이렇게 해서 엔드포인트를 생성한다.

이제 Lambda 함수가 S3, RDS에 접근하기 위한 인프라 차원에서의 준비는 끝났다.
### 3. Java 템플릿 코드 준비
이제 Lamda 함수에 올릴 코드를 작성해주어야 한다.
먼저, 템플릿으로 [blank-java](https://github.com/awsdocs/aws-lambda-developer-guide/tree/main/sample-apps/blank-java) 코드를 다운 받는다.

blank-java 코드를 가져와서 build.gradle 파일을 확인해보면, 다음과 같이 Lambda에서 Java를 실행하기 위해 필요한 의존성이 추가되어 있는 것을 확인할 수 있다.
![](https://i.imgur.com/7fgASNr.png)

이제 build.gradle 파일에 java 코드를 zip 파일로 빌드하기 위한 buildZip task를 작성해주고, 실행시켜보자.
```java
task buildZip(type: Zip) {
    from compileJava
    from processResources
    into('lib') {
        from configurations.runtimeClasspath
    }
}
```
그럼 이렇게 zip 파일이 나온다. 이 파일을 준비해두자.
![](https://i.imgur.com/AQM8cOr.png)
### 4. 배포 패키지 업로드 및 핸들러 메서드 정의
다시 Lambda 콘솔로 돌아가 1단계에서 만든 람다 함수 페이지로 이동한다.
**코드 소스**에서 3번 단계에서 만든 zip 파일을 업로드한다.

![](https://i.imgur.com/42DAuF3.png)
그 다음, 런타임 설정에서 편집에 들어가 핸들러를 지정해준다.
![](https://i.imgur.com/BVy78di.png)

blank-java 소스코드의 초기 핸들러는 다음과 같이 작성되어 있다.
```java
// Handler value: example.Handler  
public class Handler implements RequestHandler<Map<String,String>, String> {  
  
    private static final LambdaClient lambdaClient = LambdaClient.builder().build();  
  
    @Override  
    public String handleRequest(Map<String,String> event, Context context) {  
  
        LambdaLogger logger = context.getLogger();  
        logger.log("Handler invoked");  
  
        GetAccountSettingsResponse response = null;  
        try {  
            response = lambdaClient.getAccountSettings();  
        } catch(LambdaException e) {  
            logger.log(e.getMessage());  
        }  
        return response != null ? "Total code size for your account is " + response.accountLimit().totalCodeSize() + " bytes" : "Error";  
    }  
}
```
example 패키지에 위치한 Handler 클래스의 handleRequest 메서드를 핸들러로 등록한다는 의미로, 핸들러 란에 `exaple.Handler::handleRequest`를 기입해주었다.
![](https://i.imgur.com/RaKfuhD.png)
### 5. 테스트 이벤트 생성 및 테스트 실행
Lambda 함수 페이지의 테스트 섹션으로 이동하면 다음과 같이 테스트 이벤트를 생성하는 폼이 뜬다.
![](https://i.imgur.com/fx6wrZj.png)

여기서 테스트를 클릭하면 람다 함수에 등록된 핸들러 함수가 실행된다.
다시 핸들러 코드를 가져와보면, LambdaClient의 계정 설정을 조회하는 로직이 포함되어 있음을 확인할 수 있다.
```java
// Handler value: example.Handler  
public class Handler implements RequestHandler<Map<String,String>, String> {  
  
    private static final LambdaClient lambdaClient = LambdaClient.builder().build();  
  
    @Override  
    public String handleRequest(Map<String,String> event, Context context) {  
  
        LambdaLogger logger = context.getLogger();  
        logger.log("Handler invoked");  
  
        GetAccountSettingsResponse response = null;  
        try {  
            response = lambdaClient.getAccountSettings();  
        } catch(LambdaException e) {  
            logger.log(e.getMessage());  
        }  
        return response != null ? "Total code size for your account is " + response.accountLimit().totalCodeSize() + " bytes" : "Error";  
    }  
}
```
지금으로서는 Lambda 함수가 클라이언트의 계정 정보에 접근할 권한이 없기 때문에, 테스트를 실행 시키면 에러 로그가 출력된다. 지금 요구사항에서 필요한 코드는 아니니, 일단은 무시하도록 하자. 
### 6. 본격적인 코드 작성
이제 본격적으로 S3의 고아 이미지를 제거해주는 코드를 작성해보자.
우리가 작성해야 할 로직은 다음과 같다.
1. S3의 이미지 (이름)목록을 불러온다.
2. RDS image 테이블의 (name)목록을 불러온다.
3. 두 목록을 서로 비교하여 S3에만 존재하는 이미지들만 필터링한다.
4. 필터링된 이미지들을 S3에서 제거한다.

<br/>

차례대로 살펴보자.

1. **S3의 이미지 목록 불러오기**

	먼저 Lambda 함수 코드에서 S3에 접근할 수 있도록 의존성을 추가한다.
	```gradle
	// AWS S3  
	implementation platform('com.amazonaws:aws-java-sdk-bom:1.11.1000')  
	implementation 'com.amazonaws:aws-java-sdk-s3:1.12.445'
	```
	그리고 다음과 같이 코드를 작성해서, S3에 존재하는 이미지 목록을 불러와보자.
	```java
	// Handler value: example.Handler  
	public class Handler implements RequestHandler<Map<String,String>, String> {  
	  
	    private static final String S3_BUCKET_NAME = "kerdy-dev";  
	    private static final String S3_PATH = "dev/";   
	    private AmazonS3 s3Client;  
	    @Override  
	    public String handleRequest(Map<String,String> event, Context context) { 
	        LambdaLogger logger = context.getLogger();  
	        try {  
		        s3Client = AmazonS3ClientBuilder.standard()  
		                .withRegion(Regions.AP_NORTHEAST_2)  
		                .build();  
		        List<String> s3ImageKeys = listObjectsInS3();  
	        
	            logger.log("S3에 저장된 이미지 개수:" + s3ImageNames.size() + "개\n");  
	            for (int i = 0; i < 10; i++) {  
	                logger.log(s3ImageNames.get(i));  
	            }   
	            return "Success";  
	        }catch(Exception e){  
	            logger.log(e.getMessage());
	            return "Error"  
	        }  
	    }  
	    private List<String> listObjectsInS3() {  
	        return s3Client.listObjects(S3_BUCKET_NAME, S3_PATH)  
	                .getObjectSummaries()  
	                .stream()  
	                .map(summary->summary.getKey().substring(S3_PATH.length()))  
	                .collect(Collectors.toList());  
	    }  
	  
	}
	```
	테스트를 돌리면 S3에 있는 이미지 이름이 성공적으로 불러와지는 것을 확인할 수 있다.
	![](https://i.imgur.com/0YuElJb.png)

2. **RDS image 테이블의 (name)목록을 불러온다.**

	mysql을 사용할 수 있도록 다음의 의존성을 추가한다.
	```gradle
	implementation 'mysql:mysql-connector-java:8.0.26'
	```
	다음과 같이 코드를 작성해서 image 테이블의 name 컬럼 값 목록을 불러오도록 했다.
	`listImageNamesInDB()` 메서드를 보면 된다.
	```java
	// Handler value: example.Handler  
	public class Handler implements RequestHandler<Map<String,String>, String> {  
	  
	    private static final String S3_BUCKET_NAME = "kerdy-dev";  
	    private static final String S3_PATH = "dev/";  
	    private static final String DB_URL = "jdbc:mysql:.../kerdy";  
	    private static final String DB_USER = "user-name";  
	    private static final String DB_PASSWORD = "password";  
	    private AmazonS3 s3Client;  
	    @Override  
	    public String handleRequest(Map<String,String> event, Context context) {  
	        LambdaLogger logger = context.getLogger();  
	        try {  
	            s3Client = AmazonS3ClientBuilder.standard()  
	                    .withRegion(Regions.AP_NORTHEAST_2)  
	                    .build();  
	            List<String> s3ImageNames = listObjectsInS3();  
	            List<String> dbImageNames = listImageNamesInDB();  
	            logger.log("S3에 저장된 이미지 개수:" + s3ImageNames.size() + "개\n");  
	            for (int i = 0; i < 10; i++) {  
	                logger.log(s3ImageNames.get(i));  
	            }  
	            logger.log("\nDB에 저장된 이미지 개수:" + dbImageNames.size() + "개\n");  
	            for (int i = 0; i < 10; i++) {  
	                logger.log(dbImageNames.get(i));  
	            }  
	            return "Success";  
	        }catch (Exception e){  
	            logger.log(e.getMessage());  
	            return "Error";  
	        }  
	    }  
	    private List<String> listObjectsInS3() {  
	        return s3Client.listObjects(S3_BUCKET_NAME, S3_PATH)  
	                .getObjectSummaries()  
	                .stream()  
	                .map(summary->summary.getKey().substring(S3_PATH.length()))  
	                .collect(Collectors.toList());  
	    }  
	  
	    private List<String> listImageNamesInDB(){  
	        try{  
	            Class.forName("com.mysql.cj.jdbc.Driver");  
	            try(Connection connection= DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)){  
	                String sql = "SELECT name FROM image";  
	                try(PreparedStatement preparedStatement = connection.prepareStatement(sql);  
	                    ResultSet resultSet = preparedStatement.executeQuery()){  
	                    List<String> result= new ArrayList<>();  
	                    while(resultSet.next()){  
	                        result.add(resultSet.getString("name"));  
	                    }  
	                    return result;  
	                }  
	            }  
	        } catch (ClassNotFoundException | SQLException e) {  
	            throw new RuntimeException(e);  
	        }  
	    }   
	}
	```
	DB 연동도 성공적으로 이루어졌다.
	![](https://i.imgur.com/piYMUoy.png)

3. **두 목록을 서로 비교하여 S3에만 존재하는 이미지들만 필터링한다.**

	```java
	// Handler value: example.Handler  
	public class Handler implements RequestHandler<Map<String,String>, String> {  
	  
	    private static final String S3_BUCKET_NAME = "kerdy-dev";  
	    private static final String S3_PATH = "dev/";  
	    private static final String DB_URL = "jdbc:mysql:.../kerdy";  
	    private static final String DB_USER = "user-name";  
	    private static final String DB_PASSWORD = "password"; 
	    private AmazonS3 s3Client;  
	    @Override  
	    public String handleRequest(Map<String,String> event, Context context) {  
	        LambdaLogger logger = context.getLogger();  
	        try {  
	            s3Client = AmazonS3ClientBuilder.standard()  
	                    .withRegion(Regions.AP_NORTHEAST_2)  
	                    .build();  
	            List<String> s3ImageNames = listObjectsInS3();  
	            List<String> dbImageNames = listImageNamesInDB();  
	            List<String> filteredImageNames = filterOrphanImageNames(s3ImageNames, dbImageNames);  
	            logger.log("S3에 저장된 이미지 개수:" + s3ImageNames.size() + "개\n");  
	            logger.log("DB에 저장된 이미지 개수:" + dbImageNames.size() + "개\n");  
	            logger.log("S3에만 존재하는 이미지 개수:" + filteredImageNames.size() + "개\n");  
	            for (int i = 0; i < filteredImageNames.size(); i++) {  
	                logger.log(filteredImageNames.get(i)+"\n");  
	            }  
	            return "Success";  
	        }catch (Exception e){  
	            logger.log(e.getMessage());  
	            return "Error";  
	        }  
	    }  
	    ...
	  
	    private List<String> filterOrphanImageNames(List<String> s3ImageNames, List<String> dbImageNames){  
	        return s3ImageNames.stream()  
	                .filter(name -> !dbImageNames.contains(name))  
	                .collect(Collectors.toList());  
	    } 
	}
	```
	![](https://i.imgur.com/rS8CtXj.png)
4. **필터링된 이미지들을 S3에서 제거한다.**

	```java
	// Handler value: example.Handler  
	public class Handler implements RequestHandler<Map<String,String>, String> {  
	  
	    private static final String S3_BUCKET_NAME = "kerdy-dev";  
	    private static final String S3_PATH = "dev/";  
	    private static final String DB_URL = "jdbc:mysql:.../kerdy";  
	    private static final String DB_USER = "user-name";  
	    private static final String DB_PASSWORD = "password";  
	    private AmazonS3 s3Client;  
	    @Override  
	    public String handleRequest(Map<String,String> event, Context context) {  
	        LambdaLogger logger = context.getLogger();  
	        try {  
	            s3Client = AmazonS3ClientBuilder.standard()  
	                    .withRegion(Regions.AP_NORTHEAST_2)  
	                    .build();  
	            List<String> s3ImageNames = listObjectsInS3();  
	            List<String> dbImageNames = listImageNamesInDB();  
	            List<String> filteredImageNames = filterOrphanImageNames(s3ImageNames, dbImageNames);  
	            logger.log("S3에 저장된 이미지 개수: " + s3ImageNames.size() + "개\n");  
	            logger.log("DB에 저장된 이미지 개수: " + dbImageNames.size() + "개\n");  
	            logger.log("S3에만 존재하는 이미지 개수: " + filteredImageNames.size() + "개\n");  
	            deleteFilesFromS3(filteredImageNames);  
	            List<String> cleanS3ImageNames = listObjectsInS3();  
	            logger.log("고아 이미지 삭제 후 남아있는 S3의 이미지 개수: " + cleanS3ImageNames.size() + "개\n");  
	            return "Success";  
	        }catch (Exception e){  
	            logger.log(e.getMessage());  
	            return "Error";  
	        }  
	    }  
	    private List<String> listObjectsInS3() {  
	        return s3Client.listObjects(S3_BUCKET_NAME, S3_PATH)  
	                .getObjectSummaries()  
	                .stream()  
	                .map(summary->summary.getKey().substring(S3_PATH.length()))  
	                .collect(Collectors.toList());  
	    }  
	  
	    private List<String> listImageNamesInDB(){  
	        try{  
	            Class.forName("com.mysql.cj.jdbc.Driver");  
	            try(Connection connection= DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)){  
	                String sql = "SELECT name FROM image";  
	                try(PreparedStatement preparedStatement = connection.prepareStatement(sql);  
	                    ResultSet resultSet = preparedStatement.executeQuery()){  
	                    List<String> result= new ArrayList<>();  
	                    while(resultSet.next()){  
	                        result.add(resultSet.getString("name"));  
	                    }  
	                    return result;  
	                }  
	            }  
	        } catch (ClassNotFoundException | SQLException e) {  
	            throw new RuntimeException(e);  
	        }  
	    }  
	  
	    private List<String> filterOrphanImageNames(List<String> s3ImageNames, List<String> dbImageNames){  
	        return s3ImageNames.stream()  
	                .filter(name->!dbImageNames.contains(name))  
	                .collect(Collectors.toList());  
	    }  
	  
	    private void deleteFilesFromS3(List<String> imageNames) {  
	        for (String imageName : imageNames) {  
	            s3Client.deleteObject(new DeleteObjectRequest(S3_BUCKET_NAME, S3_PATH+imageName));  
	        }  
	    }  
	}
	```
	![](https://i.imgur.com/ztv8AZo.png)
	이렇게 S3에 남아있는 고아 이미지를 식별해 삭제하는 Lambda 함수 코드가 완성됐다.
### 7. EventBridge Scheduler 만들기

이제 이 코드가 일정 주기마다 자동으로 돌아가게끔 설정해주어야 한다.
AWS의 [EventBridge 콘솔](https://ap-northeast-2.console.aws.amazon.com/events/home?region=ap-northeast-2#/)에 접속하여, **시작하기** 섹션에서 'EventBridge 일정'을 선택하고 규칙 생성 버튼을 클릭한다.
![](https://i.imgur.com/zxseTDd.png)

이름을 짓고
![](https://i.imgur.com/8tzFFam.png)
반복 패턴을 설정해준다.
**매일 자정마다** 이벤트가 실행되도록 `0 0 * * ? *`이라는 cron 식을 사용했다.
![](https://i.imgur.com/1btchh7.png)

그 다음, 대상 선택 페이지로 넘어가 대상 세부 정보에서 AWS Lambda를 선택해주고 
![](https://i.imgur.com/yonNkeI.png)

실행하고자 하는 Lambda 함수를 선택하고 테스트 데이터를 작성한다.
![](https://i.imgur.com/pqpcf27.png)

이렇게 하고 EventBridge 일정을 생성해주면, 이제 매일 자정마다 고아 이미지를 삭제해주는 Lambda 함수가 실행된다. 
## 참고 자료
---
- [Java로 Lambda 개발 및 배포하기](https://goateedev.tistory.com/219)
- [AWS Lambda에서 AWS S3 파일 읽어오는 방법](https://heytech.tistory.com/414)
- [[AWS][Lambda] Lambda와 RDS 연동하기 (3)](https://growth-coder.tistory.com/149)
- [[AWS] lambda+VPC 일 때의 S3 엑세스 문제](https://entaline.tistory.com/47)
- [[소개]VPC Endpoint란?](https://tech.cloud.nongshim.co.kr/2023/03/16/%EC%86%8C%EA%B0%9C-vpc-endpoint%EB%9E%80/)
- [AWS Lambda 활용 : Cron, 스케쥴러처럼 주기적 반복 실행](https://visu4l.tistory.com/entry/AWS-Lambda-%ED%99%9C%EC%9A%A9-Cron-%EC%8A%A4%EC%BC%80%EC%A5%B4%EB%9F%AC-%EC%B2%98%EB%9F%BC-%EC%A3%BC%EA%B8%B0%EC%A0%81-%EB%B0%98%EB%B3%B5-%EC%8B%A4%ED%96%89)
---
title: '[Kerdy] Image 처리 작업 성능 개선기'
date: "2023-12-10T03:30:03.284Z"
description: "Kerdy 서비스의 이미지 관리 작업의 성능을 개선해보았다."
section: "문제 해결" 
category: "주저리주저리"
tags:
  - Kerdy
thumbnailImg: "../../kerdy.png"
---


## 글을 쓰게 된 이유
---
내가 커디 서비스의 이미지 처리 로직을 개선해야겠다고 느낀 포인트는 크게 2가지다.
### 1. 느린 이미지 업로드 속도
현재 커디 서비스에는 100개 이상의 행사 정보가 게시되어 있는데, 새로운 행사를 추가할 때마다 꽤 긴 시간이 소요되는 문제가 있었다. 체감하기에 10초 이상은 걸린 것 같다.

그래서 예전부터 속도 개선을 꼭 해야겠다는 생각을 가지고 있었다.
### 2. 불완전한 이미지 업로드 로직
이전에 S3 이미지 저장/삭제 기능을 구현하면서 TODO 주석을 달아두고 미래의 나에게 맡겼던 문제가 있었다.
![](https://i.imgur.com/rDx9Q4B.png)
Kerdy 서비스에서는 기본적으로 **여러 장의 이미지**를 한 번에 업로드하는데, 만약 업로드하려는 이미지들 중 일부가 업로드에 실패하는 경우, 클라이언트에게 예외를 반환하는 한 편 이미 S3에 저장된 이미지는 삭제되지 않고 그대로 남아있다는 문제가 있다.

그래서 나는 업로드에 실패한 이미지가 있을 경우, 이미 업로드된 이미지를 삭제하는 로직을 호출하는 방법으로 롤백 작업을 구현했었다.

하지만, 이 롤백 작업마저 실패하는 경우, DB에 저장되지 않은 이미지 파일이 여전히 S3에 남아있게 된다는 문제가 있었다. 즉, 삭제되지 못한 파일들이 불필요한 용량을 소모하게 되는 것이다.

당시에는 기능을 구현하는 데 급급해서 이 문제에 대해 고민하는 것을 뒤로 미뤘는데, 지금은 여유가 생겨서 제대로 된 해결책을 고민해보고자 했다.

## 이미지 업로드 속도 개선
---
여기서는 **병렬 스트림**을 사용해서 속도를 개선하였다. 기존의 순차 스트림 로직을 병렬 스트림으로 바꾸고, AtomicBoolean 객체를 통해 업로드가 실패한 이미지의 존재 여부를 확인하고 롤백 로직을 수행하도록 했다. 
```java
public List<String> uploadImages(final List<MultipartFile> multipartFiles) {  
  final AtomicBoolean catchException = new AtomicBoolean(false);  
  
  final List<String> uploadedImageNames = multipartFiles.stream()  
      .parallel()  
      .map(file -> uploadImage(file, catchException))  
      .filter(Objects::nonNull)  
      .collect(Collectors.toList());  
  if (catchException.get()) {  
    deleteImages(uploadedImageNames);  
    throw new ImageException(ImageExceptionType.FAIL_S3_UPLOAD_IMAGE);  
  }  
  return uploadedImageNames;  
}

public String uploadImage(final MultipartFile file, final AtomicBoolean catchException) {  
  final String fileExtension = extractFileExtension(file);  
  final String newFileName = UUID.randomUUID().toString().concat(fileExtension);  
  final ObjectMetadata objectMetadata = configureObjectMetadata(file);  
  
  try (final InputStream inputStream = file.getInputStream()) {  
    amazonS3.putObject(new PutObjectRequest(bucket, newFileName, inputStream, objectMetadata));  
    return newFileName;  
  } catch (final IOException | SdkClientException exception) {  
    catchException.set(true);  
    return null;  
  }  
}

public void deleteImages(final List<String> fileNames) {  
  try {  
    fileNames.stream()  
        .parallel()  
        .forEach(fileName ->  
            amazonS3.deleteObject(new DeleteObjectRequest(bucket, fileName)));  
  } catch (SdkClientException exception) {  
    throw new ImageException(ImageExceptionType.FAIL_S3_DELETE_IMAGE);  
  }  
}

```
## 이미지 업로드 실패에 대한 처리
---
앞서 언급했듯, 지금의 서비스는 이미지 업로드에 실패할 경우 이미 업로드된 이미지에 대한 삭제 로직을 호출해 작업을 롤백하는데, 이 롤백 작업이 불완전하다는 문제가 있었다.

먼저 이미지 업로드 작업이 중간에 실패할 경우, 이미 업로드된 이미지들은 모두 S3에서 제거되어야 한다.

모든 이미지를 삭제하는 데 성공할 때까지 무한히 삭제 로직을 실행시켜야 하는걸까? 이 방식은 위험하고 비효율적이라는 생각이 들었다.

그래서 이와 관련한 문제 해결 케이스가 없나 자료를 찾아봤는데, AWS Lambda를 활용해 주기적으로 DB에 존재하지 않은 이미지(이하 고아 이미지)를 제거하는 방법이 있었다.

이렇게 하면 애플리케이션에서 복잡한 롤백 코드를 짤 필요도 없고, 삭제 작업이 반복적으로 실행되기 때문에 고아 이미지를 삭제하는 작업에 있어서는 비교적 높은 신뢰도를 보장할 수 있었다.

게다가, 서버를 올린 이래로 지금까지 발생한 고아 이미지들까지 쉽게 제거할 수 있으니 일석삼조라고 생각했다.

나는 AWS Lambda를 사용해본 적이 없으니, 이번 기회에 도전해보는 것도 좋겠다고 생각했다.
### AWS Lambda?
aws 공식 문서에 따르면, AWS Lambda는 '서버를 프로비저닝하거나 관리하지 않고도 코드를 실행할 수 있게 해주는 컴퓨팅 서비스'라고 한다. 쉽게 말해 Lambda를 사용하면 서버를 띄우지 않고도 특정 코드를 실행시킬 수 있다는 것이다.

주로 특정 기간 또는 특정 주기로 코드를 실행시키고자 한 경우, 트리거가 실행될 때만 코드를 실행시키고 싶은 경우 사용하면 유용하다.


이런 특징들 때문에 나는 AWS Lambda가 현재 내가 필요로 하는 작업을 수행하기 적합하다고 판단했다.

AWS Lambda 함수를 생성해서 도입하기까지의 과정을 서술하려니 너무 길어져서 별개의 포스팅으로 분리하였다.

[[AWS] AWS Lambda로 주기적으로 S3에만 저장된 파일 제거하기](https://amaran-th.github.io/%EC%9D%B8%ED%94%84%EB%9D%BC/[AWS]%20AWS%20Lambda%EB%A1%9C%20%EC%A3%BC%EA%B8%B0%EC%A0%81%EC%9C%BC%EB%A1%9C%20S3%EC%97%90%EB%A7%8C%20%EC%A0%80%EC%9E%A5%EB%90%9C%20%ED%8C%8C%EC%9D%BC%20%EC%A0%9C%EA%B1%B0%ED%95%98%EA%B8%B0/)

결과적으로 매일 자정마다 Lambda 함수를 실행시켜 고아 이미지를 찾아 제거하도록 했다.
## 마무리
---
역시 이미지를 관리하는 시스템을 구축하는 데에는 고민해볼 만한 문제가 많은 것 같다.

이번 일로 어떻게 하면 이미지 처리 성능을 개선할 수 있을지, 작업을 효율적으로 수행할 수 있을지 고민할 수 있어 재밌었다.

AWS Lambda라는 좋은 도구도 알게 되었고. 

AWS Lambda는 나중에 모니터링과 접목시키면 다양하게 활용할 수 있을 것 같다.

## 참고 자료
---
- [다중 이미지 업로드 최적화: 병렬 스트림과 CompletableFuture](https://tecoble.techcourse.co.kr/post/2023-11-23-multiple-image-upload/)
- [상품 저장 실패시 저장된 이미지에 대한 롤백 처리 문제 해결기](https://velog.io/@sontulip/s3-rollback-problem)
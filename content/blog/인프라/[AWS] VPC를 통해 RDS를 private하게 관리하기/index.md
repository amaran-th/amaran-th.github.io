---
title: "[AWS] VPC를 통해 RDS를 private하게 관리하기"
date: "2024-02-04T02:36:03.284Z"
description: "AWS VPC와 보안그룹을 통해 EC2와 RDS를 안전하게 관리해보자."
section: "문제 해결" 
category: "인프라"
tags:
  - 두레
  - 네트워크
thumbnailImg: "./infra.png"
---

## 들어가며
---
이번에 두레 서비스의 배포 서버 셋팅을 맡게 되었습니다.
현재까지 백엔드 팀에서 논의한 인프라 설계에 따라 두레 서비스는 크게 스프링 애플리케이션과 Nginx, Next.js 애플리케이션을 띄울 **EC2**, 파일을 저장할 **S3**, 데이터베이스 **RDS** 세 가지의 요소를 이용하기로 하였습니다. 

여기서 S3와 RDS는 서비스의 민감한 데이터들이 저장되는 곳이기 때문에 보안에 신경써야 했는데요, 저희는 외부로부터의 접근을 차단하고 오직 EC2에서만 S3, RDS에 접근할 수 있도록 VPC 서브넷을 활용했습니다.
이번 글은 그 과정을 기록한 포스팅입니다.

VPC에 대해서는 이전에 [개인 블로그에 정리했던 글](https://amaran-th.github.io/%EC%9D%B8%ED%94%84%EB%9D%BC/[AWS]%20VPC/)이 있으니 참고 부탁드립니다.
## 알아둬야 할 지식
---
### VPC와 서브넷
> - **VPC(Virtual Private Cloud)**
> 물리적으로 같은 클라우드 상에 있지만, 보안상의 목적을 위해 논리적으로 다른 클라우드인 것 처럼(=분리된 환경인 것 처럼) 동작하도록 만든 **가상**의 클라우드 환경
> - **서브넷(Subnet)**
> 보안, 통신 성능 향상 등을 목적으로 **VPC를 잘게 쪼갠 단위**

서브넷은 크게 외부에서 접근이 가능한 Public 서브넷, 내부에서만 접근이 가능한 Private 서브넷 분류됩니다. 저희는 RDS를 Private 서브넷에, EC2를 Public 서브넷에 구축할 계획입니다.
![](https://i.imgur.com/U83iUH0.png)

### 보안그룹
AWS에서 제공하는 **보안 그룹**은 인스턴스의 가상 방화벽의 역할을 하며 인스턴스의 인바운드/아웃바운드 트래픽을 관리할 수 있습니다. 
- 인바운드 : 외부에서 인스턴스로 접근하는 트래픽
- 아웃바운드 : 인스턴스에서 외부로 접근하는 트래픽
저희는 이 보안그룹을 통해 EC2가 Private 서브넷에 위치한 RDS에 접근할 수 있도록 설정할 것입니다.
![](https://i.imgur.com/GLNWbBe.png)

## 실습
---
그럼 바로 AWS를 켜서 인프라 환경을 구축해보겠습니다.
### 1. VPC 생성
먼저 AWS의 VPC 서비스로 이동한 뒤, VPC 생성을 클릭합니다.
![](https://i.imgur.com/0F1Xg65.png)
이름 태그를 원하는 이름으로 설정해주고, 나머지는 그대로 둡니다.
![](https://i.imgur.com/ZLN1UKG.png)
추후 서브넷 그룹을 만들기 위해서는 VPC의 가용 영역의 수가 2개 이상이어야 하기 때문에, 가용 영역의 수는 2개로 설정해주시고, 퍼블릭 서브넷, 프라이빗 서브넷 역시 기본값 그대로 2개씩 생성합니다.
그리고 `서브넷 CIDR 블록 사용자 지정`을 클릭해, 서브넷 CIDR 블록을 빨간 박스 안의 값으로 수정해줍니다.
![](https://i.imgur.com/5BXK2U6.png)
VPC 엔드포인트는 지금 사용할 필요가 없으니 `없음`으로 설정하고, VPC를 생성해줍니다.
![](https://i.imgur.com/MLqS2ir.png)
이렇게 모든 과정이 성공 표시로 바뀌면 VPC가 정상적으로 생성된 것입니다.
![](https://i.imgur.com/oSBqo5L.png)

### 2. 보안 그룹 생성
다음으로 EC2와 RDS에 적용될 보안그룹을 세팅해보겠습니다.
먼저 **EC2**의 보안 그룹부터 생성해봅시다.
VPC 페이지의 사이드바에서 `보안 그룹`을 클릭해 들어갑니다.
![](https://i.imgur.com/m6zTviu.png)
보안 그룹 생성을 클릭합니다.
![](https://i.imgur.com/EsXFjyF.png)
기본 세부 정보에서 보안 그룹 이름과 설명을 설정해주고, VPC는 방금 만들었던 VPC로 설정해줍니다.
![](https://i.imgur.com/RKeb7yp.png)
인바운드 규칙은 아래와 같이 설정해줍니다.
외부로부터 오는 모든 HTTP, HTTPS, SSH 요청을 허용한다는 의미입니다.
![](https://i.imgur.com/Fo9c25w.png)
그 외에 아웃바운드 규칙은 딱히 막을 이유가 없으므로 그대로 두고, `보안 그룹 생성`을 클릭해줍시다.

다음으로 **RDS**에 적용할 보안 그룹을 만들어봅시다.
기본 세부 정보는 EC2와 마찬가지로 같은 VPC를 설정해줍니다.
![](https://i.imgur.com/7UPHSw1.png)
인바운드 규칙은 아래와 같이 설정해줍니다. 여기서 주의해야 하는 게 있는데, 인바운드 소스로 앞서 만든 EC2의 보안 그룹을 선택해야 합니다.
이는 해당 보안 그룹을 거쳐 들어온 트래픽만 받겠다는 뜻입니다.
![](https://i.imgur.com/kBqxlOf.png)
이제 `보안 그룹 생성`을 클릭합니다.

이렇게 해서 두 인스턴스에 적용할 보안그룹을 모두 생성해주었습니다.
### 3. RDS 생성
RDS 서비스 페이지로 접속합니다.
RDS를 만들기 전에, RDS에 할당해줄 **서브넷 그룹**을 만들어주어야 합니다.
사이드바의 `서브넷 그룹`으로 들어가 `DB 서브넷 그룹 생성`을 클릭합니다.
![](https://i.imgur.com/DnWvZeg.png)
서브넷 그룹 세부 정보에서 VPC는 앞서 만든 VPC를 설정해줍니다.
![](https://i.imgur.com/NOuYzhG.png)
가용 영역은 2개를 선택해주고, 서브넷으로는 앞서 VPC를 만들 때 함께 만든 프라이빗 서브넷 2개를 선택해줍니다.
그리고 `생성`을 클릭해 서브넷 그룹을 생성해줍니다.
![](https://i.imgur.com/NWeAbfJ.png)
이제 RDS 인스턴스를 생성해봅시다.
다시 RDS 콘솔의 초기 화면으로 돌아가 `데이터베이스 생성`을 클릭합니다.
![](https://i.imgur.com/uOVJRti.png)
엔진으로 MySQL을 설정해주고, 
![](https://i.imgur.com/wRCJHV1.png)
템플릿으로 프리티어를 선택합니다.
![](https://i.imgur.com/XEwkKeD.png)
DB 인스턴스의 이름을 지어주고, MySQL의 루트 사용자에 해당하는 사용자의 이름과 비밀번호를 설정해줍니다.
![](https://i.imgur.com/nIfSqqK.png)
`스토리지 자동 조정`에서 자동 조정 활성화를 체크 해제해줍니다.
![](https://i.imgur.com/boxnDgS.png)
그리고 VPC와 서브넷 그룹을 앞서 만든 VPC와 서브넷 그룹으로 설정해줍니다.
퍼블릭 액세스는 당연하지만 `아니요`로 설정해줍니다.
![](https://i.imgur.com/TRIy8OV.png)
보안 그룹과 가용 영역도 아래와 같이 설정해줍니다.
![](https://i.imgur.com/5lOY5rZ.png)
저희 두레 서비스의 데이터베이스 스키마 명은 doore이므로 `초기 데이터베이스 이름`을 doore로 설정해주었습니다.
![](https://i.imgur.com/1D53062.png)
이렇게 설정해주고 `데이터베이스 생성`을 클릭해 데이터베이스를 만들어줍니다.
### 4. EC2 셋팅
EC2 서비스 페이지로 접속해, `인스턴스 생성`을 클릭해줍니다.
인스턴스 이름을 지어주고, OS는 Ubuntu로 선택했습니다
![](https://i.imgur.com/OdD7etW.png)
인스턴스 유형은 프리티어 이용이 가능한 t2.micro로 선택했고, 키 페어는 새로 생성해주었습니다
![](https://i.imgur.com/aq7zx6B.png)
![](https://i.imgur.com/eV7ubKr.png)
그 다음 네트워크 설정입니다. vpc는 앞서 만들었던 vpc를, 서브넷은 public 서브넷 중 하나를, 보안그룹으로는 앞서 만든 EC2 보안그룹을 선택해줍니다.
![](https://i.imgur.com/JROFMx4.png)
스토리지는 최대 30GiB까지 프리티어로 제공되므로, 30GiB로 맞춰줍니다.
![](https://i.imgur.com/3vN3e0Q.png)
여기까지 설정하고 EC2를 생성해줍니다.
### 5. EC2 인스턴스에 탄력적 IP(Elastic IP) 연결
이렇게 만들어진 EC2인스턴스는 중지 후 재시작을 할 때마다 퍼블릭 IP 주소가 달라지게 됩니다. 때문에 탄력적 IP를 할당받아 사용해야 합니다.
EC2 페이지의 사이드바에서 탄력적 IP를 선택해 들어갑니다.
![](https://i.imgur.com/nMNIP4P.png)
`탄력적 IP 주소 할당`을 클릭하고 나오는 페이지에서 별도로 설정해줄 것 없이 바로 `할당`을 클릭합니다.
![](https://i.imgur.com/LlcUZCE.png)
그 다음 할당된 탄력적 IP 주소를 연결하기 위해 `작업>탄력적 IP 주소 연결`을 클릭합니다.
![](https://i.imgur.com/0hPsBRo.png)
그 다음 인스턴스로 앞서 만들었던 인스턴스를 선택해주고, 프라이빗 IP 주소는 클릭해서 나오는 주소를 바로 선택합니다.
![](https://i.imgur.com/58CxAtc.png)
그 다음 연결을 클릭해 EC2에 탄력적 IP 주소를 연결해줍니다.
## EC2에서 RDS 접근하기
앞서 EC2를 생성할 때 만든 pem키를 사용해 EC2에 접속합니다.
![](https://i.imgur.com/yFLEFsD.png)
그 다음 MySQL을 설치해줍니다.
```shell
// APT 업데이트
sudo apt-get update
// MySQL 설치
sudo apt install mysql-client
```
그 다음 아래와 같은 명령어로 RDS DB에 연결합니다.
```shell
sudo mysql -u <마스터 사용자 이름> -p --port 3306 --host <RDS 인스턴스 엔드포인트>
```
RDS 인스턴스의 엔드포인트는 RDS 인스턴스의 요약에 들어가면 확인할 수 있습니다.
![](https://i.imgur.com/TReDLUY.png)
그럼 다음과 같이 mysql에 접근할 수 있는 것을 확인할 수 있습니다.
![](https://i.imgur.com/1kgY5si.png)
## 외부에서 RDS 접근하기
다음은 IntelliJ에서 데이터소스를 연결한 모습입니다.
url과 사용자명, 비밀번호를 옳게 입력했음에도 연결이 실패한 모습을 확인할 수 있습니다.
![](https://i.imgur.com/ooaQcyV.png)
### \[부록\] IntelliJ에서 RDS 접근하는 방법
여기서는 IntelliJ가 EC2를 경유해 MySQL에 접속할 수 있도록 SSH/SSL 창으로 이동해 SSH 터널링을 설정해주어야 합니다.
![](https://i.imgur.com/Dw5dRn8.png)

그럼 다음과 같이 연결에 성공한 것을 확인할 수 있습니다.
![](https://i.imgur.com/sXBbNV2.png)

## ❓궁금증
---
공부를 하다보니 이런 궁금증이 들었습니다.

**어차피 보안그룹으로 트래픽을 관리할 수 있다면, 굳이 public subnet, private subnet으로 나누지 않고 보안그룹만 설정해주어도 되는 것이 아닌가?**

그도 그럴게, 제가 이전에 참여했던 프로젝트에서도 VPC에는 아무런 설정을 해주지 않고 보안그룹만 설정했었기 때문입니다.

그래서 chatGPT에게 물어봤습니다.
![](https://i.imgur.com/NCBvlq2.png)
제가 이해한 바에 따르면, 보안그룹만으로도 외부 접근을 막을 수는 있지만, 일반적으로는 두 방식을 결합해서 사용하는 것이 안전성 측면에서 더 권장된다고 합니다.

## 마치며
---
이상으로 글을 마치겠습니다. 이 글을 읽으시는 분들 모두 안전한 인프라 환경을 구축하시길 바랍니다.
## 참고 자료
---
- [AWS VPC를 이용해 EC2와 RDS를 안전하게 관리하기](https://ndb796.tistory.com/224?category=987004)
- [[AWS RDS] RDS를 private subnet으로 옮기기](https://developerbee.tistory.com/212)
- [VPC, 서브넷 설정으로 RDS에 안전하게 접근하기!](https://velog.io/@server30sopt/VPC-%EC%84%9C%EB%B8%8C%EB%84%B7-%EC%84%A4%EC%A0%95%EC%9C%BC%EB%A1%9C-RDS%EC%97%90-%EC%95%88%EC%A0%84%ED%95%98%EA%B2%8C-%EC%A0%91%EA%B7%BC%ED%95%98%EA%B8%B0)
- [[AWS] public subnet에 EC2, private subnet에 RDS 인스턴스 생성하기 (1)](https://growth-coder.tistory.com/169)
- [[AWS] public subnet에 EC2, private subnet에 RDS 인스턴스 생성하기 (2)](https://growth-coder.tistory.com/170)

---
title: "[Infra] 두레 운영서버 CICD 구축하기"
date: "2024-02-28T19:54:03.284Z"
description: "Doore 서비스의 운영서버 CICD 메커니즘을 구축했다."
section: "문제 해결" 
category: "인프라"
tags:
  - 두레
  - 인프라
---

## 들어가며
---
이번에 두레 서비스의 운영 서버 구축을 담당하게 되었습니다.

이번 포스팅에서는 두레 운영서버의 CICD 동작에 대해 정리해보았습니다.
도커 허브를 활용했던 커디 서비스의 CICD 로직과 다르게, 이번 두레 서비스에서는 S3를 활용했습니다.

*CICD 환경은 Github Actions입니다.

##  전체 흐름
전체적인 흐름은 다음과 같습니다.
1. **Github Actions에서 ECR에 접근하기 위한 셋팅**
	- ECR에 대한 접근 권한을 가진 IAM Role을 만듭니다.
2. **Spring Boot 애플리케이션 빌드**
3. **Jar 파일 압축 및 S3에 업로드**
	- 이전 단계에서 얻은 빌드 결과물을 .tar.gz로 압축합니다.
	- 압축 파일을 s3에 업로드합니다.
4. **EC2에 설치된 Actions Runner 실행**
	- EC2에 Actions Runner를 설치합니다.
	- deploy.sh 쉘 스크립트를 작성합니다.
	- docker-compose.yml을 작성합니다.
	- dockerfile을 작성합니다.
5. **CICD 결과를 슬랙으로 전송**

## 1. ECR 접근을 위한 셋팅
### IAM Role 만들기
AWS 리소스에 접근할 수 있는 권한을 가진 IAM Role을 만들어 Github Actions에서 이용할 수 있도록 할 것입니다.
이를 위해서는 2가지 사전 작업이 필요한데, 순서대로 진행해봅시다.
1. 외부 자격 공급자(EIP) 생성
자격증명 공급자란, AWS 외부의 사용자 자격 증명을 관리할 수 있는 시스템입니다. 저희는 외부 자격 공급자를 만들어 Github Actions에서 AWS 리소스에 접근할 수 있도록 사용 권한을 부여해줄 것입니다.
IAM 서비스 콘솔의 `자격 증명 공급자>공급자 추가`를 클릭합니다.
![](https://i.imgur.com/yHeqmn5.png)
공급자 유형은 OpenID Connect로 선택해주시고, 공급자 URL은 `https://token.actions.githubusercontent.com`으로 설정해주고, 대상은 `sts.amazonaws.com`으로 설정해줍니다.
이렇게 해서 공급자를 추가해줍니다.
![](https://i.imgur.com/KGleVzw.png)

2. AWS IAM Role 생성
Github Actions에서 사용할 IAM Role을 생성합니다.
IAM 서비스 콘솔의 `역할>역할 생성`을 클릭합니다.
![](https://i.imgur.com/2VPrIqS.png)
신뢰할 수 있는 엔티티 유형은 `웹 자격 증명`을 선택해주고, 자격 증명 공급자, Audience는 조금 전 만들었던 자격 증명 공급자의 것과 동일하게 설정해줍니다.
Github 조직은 프로젝트 레파지토리가 소속된 Github Organization을 기입해줍니다.
![](https://i.imgur.com/iGM7tqp.png)
다음 페이지에서 ECR 접근을 위한 `AmazonEC2ContainerRegistryFullAccess`, S3에 업로드하기 위한 `AmazonS3FullAccess`, EC2에 SSH로 접근하기 위한  `AmazonEC2FullAccess` 권한을 찾아 추가해줍니다.
![](https://i.imgur.com/MVD0SZq.png)
이렇게 해서 역할을 생성해줍니다.
그 다음 생성한 역할의 요약으로 들어가 ARN을 기록해둡니다.
![](https://i.imgur.com/m9XNWql.png)


### CICD 스크립트 작성하기
```yaml
name: Deploy BDD Production Server  
  
on: workflow_dispatch  
  
jobs:  
  build:  
    runs-on: ubuntu-22.04  
    timeout-minutes: 10  
  
    permissions:  
      id-token: write  
      contents: read  
  
    steps:  
      - name: 체크아웃  
        uses: actions/checkout@v4  
        with:  
          submodules: recursive  
          token: ${{ secrets.ACTION_SUBMODULE_TOKEN }}  
  
      - name: AWS 자격증명 구성  
        uses: aws-actions/configure-aws-credentials@v4  
        with:  
          role-to-assume: ${{ secrets.PROD_AWS_ROLE_ARN }}  
          aws-region: ${{ secrets.AWS_REGION }}  
  
      - name: AWS ECR 로그인  
        id: login-ecr  
        uses: aws-actions/amazon-ecr-login@v1
```
위 스크립트에서 `${{ secrets.PROD_AWS_ROLE_ARN }}`이 앞서 만들었던 역할의 ARN입니다.
## 2. Spring Boot 애플리케이션 빌드
```yaml
- name: Gradle Build & Test
  uses: gradle/gradle-build-action@v2
  with:
    gradle-version: 8.5
    arguments: build
    cache-read-only: ${{ github.ref != 'refs/heads/main' && github.ref != 'ref/heads/develop' }}

```
Gradle 캐싱 성능이 좋다고 알려진 Github Actions 라이브러리 `gradle/gradle-build-action@v2`를 사용했습니다.
## 3. Jar 파일 압축 및 S3에 업로드
### .tar.gz로 압축
```yaml
- name: 빌드 결과물 압축
  run: \
  tar -zcf ${GITHUB_SHA::8}.tar.gz build/libs/doore-0.0.1-SNAPSHOT.jar
```
앞 단계에서 얻은 jar 파일을 tar 명령어를 사용해 압축합니다. ${GITHUB_SHA::8}은 현재 스크립트를 실행하고 있는 작업물의 가장 최근 커밋 ID의 앞 8자리 값입니다. 
### s3로 업로드
```yaml
- name: S3에 업로드
  run: \
  aws s3 mv --region ${{ secrets.AWS_REGION }} \
  ${GITHUB_SHA::8}.tar.gz \
  ${{ secrets.S3_PROD_BACK_LOCATION }}/${GITHUB_SHA::8}.tar.gz
```
awscli를 사용해 s3에 압축한 파일을 업로드합니다.
`${{ secrets.S3_PROD_BACK_LOCATION }}`는 압축 파일을 저장할 s3 버킷의 경로입니다.
## 4. EC2에 설치된 Actions Runner 실행
### EC2에 Actions Runner를 설치합니다.
EC2에 Actions Runner 프로그램을 설치하고 셋팅하는 과정은 [예전 포스팅](https://amaran-th.github.io/%EC%9D%B8%ED%94%84%EB%9D%BC/[CICD]%20Self-hosted%20Runner%EB%A1%9C%20%EC%84%9C%EB%B2%84%20%EB%B0%B0%ED%8F%AC%20%EC%9E%90%EB%8F%99%ED%99%94%ED%95%98%EA%B8%B0/)에서 다룬 적이 있으므로 스킵하도록 하겠습니다.
CICD 스크립트에서는 실질적으로 deploy.sh 쉘 스크립트를 실행하는 작업만 수행합니다.
```yaml
  deploy:  
    needs: build  
    name: 배포  
    runs-on: [ self-hosted, label-prod ]  
    steps:  
      - name: 쉘 스크립트 실행  
        working-directory: /home/ubuntu  
        run: |  
          chmod +x /home/ubuntu/deploy.sh  
          sudo /home/ubuntu/deploy.sh ${GITHUB_SHA::8}  
```
### deploy.sh 쉘 스크립트를 작성합니다.
```shell
#!/bin/bash

### $1: 커밋 ID

### 기존에 build 경로에 존재하던 jar파일 제거
rm -r build/libs/*

### S3로부터 jar 파일 로드
aws s3 cp s3://doore-s3/build/$1.tar.gz ./$1.tar.gz

### 압축 해제
tar -zxvf $1.tar.gz
rm $1.tar.gz

### 도커 컨테이너 삭제
docker stop doore-app && docker rm doore-app && docker rmi -f doore-app

### 도커 이미지 빌드
docker build -t doore-app:prod -f docker/app.dockerfile .

### 배포
docker-compose up -d
```
여기서 각 명령어들을 모두 실행시키기 위해서는 설치해야 할 게 몇 가지 있습니다.
- awscli : s3로부터 jar 파일을 로드할 때 필요합니다.
```shell
// 최신 버전의 aws cli 다운로드
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

// zip 파일 압축 해제
unzip awscliv2.zip

// awscli 설치
sudo ./aws/install
```
- docker : 도커 명령어를 사용하기 위해 필요합니다.
```shell
// 필요한 의존성 설치
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

// docker gpg key 추가
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

// apt source list에 docker repository를 축
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

// apt 패키지 리스트 업데이트&docker 설치
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```
- docker-compose : 도커 컴포즈 파일을 실행시키기 위해 필요합니다. 사실상 배포에 필요한 대부분의 작업이 해당 파일을 기반으로 실행되기 때문에, 뒤에서 자세히 다루도록 하겠습니다.
```shell
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```
### docker-compose.yml을 작성합니다.
```yaml
version: '3.5'

services:
  app:
    container_name: doore-app
    image: doore-app:prod
    ports:
      - 8080:8080
    environment:
      - TZ=Asia/Seoul
```
### dockerfile을 작성합니다.
- docker/app.dockerfile
```dockerfile
FROM openjdk:17 as build
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} doore.jar
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "/doore.jar"]
```
스프링 애플리케이션의 도커 이미지를 빌드하기 위한 dockerfile입니다.
## 5. CICD 결과를 슬랙으로 전송
이 역시 [이전 포스팅](https://amaran-th.github.io/%EC%9D%B8%ED%94%84%EB%9D%BC/[CICD]%20Github%20Actions%EC%99%80%20%EC%8A%AC%EB%9E%99%20%EC%95%8C%EB%9E%8C%20%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0/)에서 다룬 적이 있습니다. 마찬가지로 스킵하도록 하겠습니다.
## 전체 CICD 스크립트
```yaml
name: Deploy BDD Production Server  
  
on: workflow_dispatch  
  
jobs:  
  build:  
    name: 빌드  
    runs-on: ubuntu-22.04  
    timeout-minutes: 10  
  
    services:  
      mysql:  
        image: mysql:8.0.28  
        env:  
          MYSQL_USER: user  
          MYSQL_PASSWORD: password  
          MYSQL_ROOT_PASSWORD: 1234  
          MYSQL_DATABASE: doore  
        ports:  
          - 3306:3306  
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3  
  
    permissions:  
      id-token: write  
      contents: read  
  
    steps:  
      - name: 체크아웃  
        uses: actions/checkout@v4  
        with:  
          submodules: recursive  
          token: ${{ secrets.ACTION_SUBMODULE_TOKEN }}  
  
      - name: AWS 자격증명 구성  
        uses: aws-actions/configure-aws-credentials@v4  
        with:  
          role-to-assume: ${{ secrets.PROD_AWS_ROLE_ARN }}  
          aws-region: ${{ secrets.AWS_REGION }}  
  
      - name: AWS ECR 로그인  
        id: login-ecr  
        uses: aws-actions/amazon-ecr-login@v1  
  
      - name: JDK 설치  
        uses: actions/setup-java@v4  
        with:  
          java-version: 17  
          distribution: temurin  
  
      - name: Gradle Build & Test  
        uses: gradle/gradle-build-action@v2  
        with:  
          gradle-version: 8.5  
          arguments: build  
          cache-read-only: ${{ github.ref != 'refs/heads/main' && github.ref != 'ref/heads/develop' }}  
  
      - name: 빌드 결과물 압축  
        run: |  
          tar -zcf ${GITHUB_SHA::8}.tar.gz build/libs/doore-0.0.1-SNAPSHOT.jar  
  
      - name: S3에 업로드  
        run: |  
          aws s3 mv --region ${{ secrets.AWS_REGION }} \  
          ${GITHUB_SHA::8}.tar.gz \  
          ${{ secrets.S3_PROD_BACK_LOCATION }}/${GITHUB_SHA::8}.tar.gz  
  deploy:  
    needs: build  
    name: 배포  
    runs-on: [ self-hosted, label-prod ]  
    steps:  
      - name: 쉘 스크립트 실행  
        working-directory: /home/ubuntu  
        run: |  
          chmod +x /home/ubuntu/deploy.sh  
          sudo /home/ubuntu/deploy.sh ${GITHUB_SHA::8}  
      - name: Slack으로 결과 전송  
        if: always()  
        uses: 8398a7/action-slack@v3  
        env:  
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}  
        with:  
          status: ${{ job.status }}  
          author_name: DOORE Production Backend CICD  
          fields: repo, commit, message, author, action, took
```




## 참고 게시글
---
- [[CI/CD] GitHub Action AWS에 IAM Role로 접근하기](https://zerone-code.tistory.com/11)
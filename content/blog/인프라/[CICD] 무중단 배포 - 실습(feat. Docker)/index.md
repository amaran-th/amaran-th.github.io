---
title: "[CICD] 무중단 배포 - 실습(feat.Docker)"
date: "2023-10-22T22:30:03.284Z"
description: "무중단 배포 중 Blue/Green 배포 과정에 대해 알아보자."
section: "문제 해결" 
category: "인프라"
tags:
  - 우아한 테크코스
  - 배포
thumbnailImg: "./image.png"
---



### Kerdy 서비스에 무중단 배포를 도입한 이유
저희 Kerdy 서비스의 경우 기존에 동작하던 도커 이미지(이전 버전)를 중단하고, 새로 내려받은 도커 이미지를 다시 실행하는 일련의 작업에 **20초 가량**의 시간이 소요되고 있었습니다. 이는 충분히 개선할 여지가 있다고 느껴졌고, 팀에서 무중단 배포를 도입하기로 결정했습니다.
![](https://i.imgur.com/ass6UXv.png)


### 무중단 배포 전략 선택
결과부터 말하자면 Kerdy 서비스는 Blue/Green 전략을 도입하기로 결정하였습니다.

이유는 구 버전과 신 버전간의 호환성 문제를 최소화시키기 위함이었습니다.

Nginx를 사용해 간단히 Blue/Green 서버 트래픽을 전환시킬 수 있으니 현재 저희 서버 상황에서 가장 도입하기 쉬운 전략이라고 생각했습니다.

### 무중단 배포 적용하기
현재 Kerdy 서비스의 인프라는 다음과 같이 구성되어 있습니다.
![](https://i.imgur.com/9yF7Fwz.png)

여기서 무중단 배포를 적용할 프로덕션 서버에만 집중해보겠습니다.
![](https://i.imgur.com/mMQosh7.png)

여기서 Blue/Green 배포를 도입하게 되면, 다음과 같은 구성이 될 것이라고 예상했습니다.
![](https://i.imgur.com/pdhWc9x.png)
설명하자면 다음과 같습니다. 저희는 도커 환경을 사용하고 있기 때문에, 한 인스턴스에 여러 개의 스프링 컨테이너를 띄울 수 있습니다. 2개의 컨테이너 포트를 띄우고 각각 8080, 8081의 컨테이너 포트를 사용하도록 설정합니다.

실제 동작할 무중단 배포 시나리오는 다음과 같습니다.

- 신 버전의 스프링 애플리케이션을 빌드하고 이미지로 말아 도커 허브에 Push 합니다.
- 그 다음 EC2 서버에서 Shell Script를 실행합니다.
- Shell Script 동작
    - 도커 허브에 올라가 있는 이미지를 pull 받습니다.
    - 현재 애플리케이션이 띄워져있는 컨테이너 포트를 확인하고, 적절한 포트로 컨테이너를 띄웁니다.
    - 원래 띄워져 있던 컨테이너를 중단하고 제거합니다.

1. **도커 허브에 푸시하고 풀 받을 도커 이미지에 고유한 태그를 달아줍니다.**

지금까지는 latest로 푸시/풀을 받아왔지만, 블루/그린 도커 컨테이너에서 이미지의 최신 버전을 구분해주기 위해 명시적인 값을 태그로 설정해주어야 합니다.

저희는 **타임 스탬프**를 태그로 사용하기로 하였습니다.

- 이전 스크립트(backend-dev-deploy.yaml)
    
    ```yaml
    ...
    jobs:
      build: 
    			...
    			- name: 도커 이미지 빌드 및 푸시
    			  uses: docker/build-push-action@v4
    			  with:
    			    context: backend/emm-sale
    			    file: backend/emm-sale/Dockerfile-dev
    			    platforms: linux/arm64/v8
    			    push: true
    			    tags: ${{ secrets.DOCKERHUB_USERNAME }}/kerdy-dev:latest
    
    	deploy:
        needs: build
        name: 배포
        runs-on: [ self-hosted, label-dev ]
        steps:
          - name: 도커 실행
            run: |
              docker stop kerdy && docker rm kerdy && docker rmi -f ${{ secrets.DOCKERHUB_USERNAME }}/kerdy-dev
              docker run -d -p 8080:8080 --name kerdy -e TZ=Asia/Seoul --network host ${{ secrets.DOCKERHUB_USERNAME }}/kerdy-dev
    ```
    

여기서 푸시한 도커 이미지를 풀 받기 위해서 타임스탬프 값을 환경 변수로 저장을 해주어야 하는데요, 저희는 도커 이미지를 푸시하는 환경(ubnuntu = github 클라우드)과 도커 이미지를 풀받는 환경(self-hosted=EC2)이 다르기 때문에, **환경변수를 두 환경 모두에서 공유할 수 있어야** 했습니다.

이를 해결하기 위해 Github Actions Workflow의 **outputs**를 활용했습니다.

```yaml
...
jobs:
  build:
    name: 빌드
    runs-on: ubuntu-22.04
    defaults:
      run:
        working-directory: backend/emm-sale	
		...
		outputs:
      current_timestamp: ${{ steps.timestamp.outputs.timestamp }}

    steps:
      - name: workflow_dispatch에서 지정한 branch로 checkout
        uses: actions/checkout@v3
        ...
      - name: Get and set current UNIX timestamp
        id: timestamp
        run: echo "::set-output name=timestamp::$(date +%s)"
      - name: Echo timestamp from build job
        run: echo ${{ steps.timestamp.outputs.timestamp }}
	...

	deploy:
    needs: build
    name: 배포
    runs-on: [ self-hosted, label-dev ]
    steps:
      - name: Echo timestamp from build job
        run: echo ${{ needs.build.outputs.current_timestamp }}
```

- 변경 후 스크립트(backend-dev-deploy.yaml)
    
    ```yaml
    ...
    jobs:
    	build:
    		...
    		outputs:
          current_timestamp: ${{ steps.timestamp.outputs.timestamp }}
    
        steps:
          - name: workflow_dispatch에서 지정한 branch로 checkout
            uses: actions/checkout@v3
            with:
              token: ${{ secrets.SUBMODULE_TOKEN }}
              submodules: true
    			- name: unix 타임스탬프 얻기
            id: timestamp
            run: echo "::set-output name=timestamp::$(date +%s)"
    			...
    			- name: 도커 이미지 빌드 및 푸시
    			  uses: docker/build-push-action@v4
    			  with:
    			    context: backend/emm-sale
    			    file: backend/emm-sale/Dockerfile-dev
    			    platforms: linux/arm64/v8
    			    push: true
    			    tags: ${{ secrets.DOCKERHUB_USERNAME }}/kerdy-dev:${{ steps.timestamp.outputs.timestamp }}
    
    	deploy:
        needs: build
        name: 배포
        runs-on: [ self-hosted, label-dev ]
        steps:
          - name: 도커 실행
            run:
              sudo /home/ubuntu/deploy.sh ${{ secrets.DOCKERHUB_USERNAME }} ${{ needs.build.outputs.current_timestamp }}
    ```
    

2. **Nginx 설정 파일을 수정합니다.**

8080포트에 배포할 때 실행시킬 nginx 파일과 8081 포트에 배포할 때 실행시킬 nginx 파일을 분리합니다.

- kerdy1
    
    : 8080 포트를 사용하는 컨테이너에 대한 nginx 설정 파일
    
    ```bash
    server {
            server_name kerdy.kro.kr;
    
            location /privacy {
                    rewrite ^ /privacy.html break;
                    charset utf-8;
            }
    
            location / {
                    proxy_pass <http://127.0.0.1:8080>;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header Host $http_host;
            }
    
        listen 443 ssl; # managed by Certbot
        ...
    }
    server {
        if ($host = kerdy.kro.kr) {
            return 301 https://$host$request_uri;
        } # managed by Certbot
    
            listen 80;
            server_name kerdy.kro.kr;
        return 404; # managed by Certbot
    
    }
    ```
    
- kerdy2
    
    : 8081 포트를 사용하는 컨테이너에 대한 nginx 설정파일
    
    ```bash
    server {
            server_name kerdy.kro.kr;
    
            location /privacy {
                    rewrite ^ /privacy.html break;
                    charset utf-8;
            }
    
            location / {
                    proxy_pass <http://127.0.0.1:8081>;
                    proxy_set_header X-Real-IP $remote_addr;
                    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                    proxy_set_header Host $http_host;
            }
    
        listen 443 ssl; # managed by Certbot
        ...
    }
    server {
        if ($host = kerdy.kro.kr) {
            return 301 https://$host$request_uri;
        } # managed by Certbot
    
            listen 80;
            server_name kerdy.kro.kr;
        return 404; # managed by Certbot
    
    }
    ```
    

3. **쉘 스크립트를 작성합니다.**

쉘 스크립트는 실제로 Green 컨테이너를 실행시키고 Blue 컨테이너를 중단시키는 동작을 합니다.

- [deploy.sh](http://deploy.sh)(dev 서버 기준)

```bash
#!/bin/bash

DOCKER_USER_NAME=$1
TIMESTAMP=$2
IS_KERDY1=$(docker ps | grep kerdy1)
MAX_RETRIES=20

check_service() {
  local RETRIES=0
  local URL=$1
  while [ $RETRIES -lt $MAX_RETRIES ]; do
    echo "Checking service at $URL... (attempt: $((RETRIES+1)))"
    sleep 3

    REQUEST=$(curl $URL)
    if [ -n "$REQUEST" ]; then
      echo "health check success"
      return 0
    fi

    RETRIES=$((RETRIES+1))
  done;

  echo "Failed to check service after $MAX_RETRIES attempts."
  return 1
}

if [ -z "$IS_KERDY1" ];then
  echo "### KERDY2 => KERDY1 ###"

  echo "1. KERDY1 이미지 받기 및 실행"
  docker run -d -p 8080:8080 --name kerdy1 -e TZ=Asia/Seoul -e SPRING_DATASOURCE_URL=jdbc:mysql://192.168.1.158:3306/kerdy $DOCKER_USER_NAME/kerdy-dev:$TIMESTAMP

  echo "2. health check"
  if ! check_service "<http://127.0.0.1:8080>"; then
    echo "KERDY1 health check 가 실패했습니다."
    exit 1
  fi

  echo "3. nginx 재실행"
  cp /etc/nginx/kerdy-conf-dir/kerdy1 /etc/nginx/sites-available/kerdy.kro.kr
  nginx -s reload

  KERDY2_IMAGE=$(docker inspect -f '{{.Config.Image}}' kerdy2)
  echo $KERDY2_IMAGE

  echo "4. KERDY2 컨테이너 내리기"
  docker stop kerdy2 && docker rm kerdy2 && docker rmi -f $KERDY2_IMAGE

else
  echo "### KERDY1 => KERDY2 ###"

  echo "1. KERDY2 이미지 받기 및 실행"
  docker run -d -p 8081:8080 --name kerdy2 -e TZ=Asia/Seoul -e SPRING_DATASOURCE_URL=jdbc:mysql://192.168.1.158:3306/kerdy $DOCKER_USER_NAME/kerdy-dev:$TIMESTAMP

  echo "2. health check"
  if ! check_service "<http://127.0.0.1:8081>"; then
      echo "KERDY1 health check 가 실패했습니다."
      exit 1
  fi

  echo "3. nginx 재실행"
  cp /etc/nginx/kerdy-conf-dir/kerdy2 /etc/nginx/sites-available/kerdy.kro.kr
  sudo nginx -s reload

  KERDY1_IMAGE=$(docker inspect -f '{{.Config.Image}}' kerdy1)

  echo "4. KERDY1 컨테이너 내리기"
  docker stop kerdy1 && docker rm kerdy1 && docker rmi -f $KERDY1_IMAGE
fi
```

```bash
docker run -d -p 8080:8080 --name kerdy -e TZ=Asia/Seoul --network host ${{ secrets.DOCKERHUB_USERNAME }}/kerdy-dev
```

기존에 실행되고 있던 도커 실행 명령을 보면, `--network host`라는 옵션이 보입니다.

이 옵션을 사용해주면 호스트(EC2)의 네트워크 환경을 그대로 사용할 수 있습니다.

> 명령문을 보면 매핑된 호스트 포트와 컨테이너 포트 모두 8080인데, 이 값들은 호스트 네트워크를 사용할 경우 생략할 수 있습니다.

그런데 저희는 무중단 배포를 위해 2개의 도커 컨테이너를 동시에 띄워야 합니다. 스프링 애플리케이션은 8080 포트를 사용하도록 설정되어 있기 때문에, 쉘 스크립트에서 현재 실행중인 컨테이너가 Blue인지 Green인지 구분할 수가 없습니다.

그래서 저희는 도커 컨테이너의 network 설정을 기본 설정인 bridge 설정으로 변경해주고, 매핑해줄 호스트 포트를 8080과 8081로 분리했습니다.

```bash
docker run -d -p 8080:8080 --name kerdy -e TZ=Asia/Seoul ${{ secrets.DOCKERHUB_USERNAME }}/kerdy-dev
or
docker run -d -p 8081:8080 --name kerdy -e TZ=Asia/Seoul ${{ secrets.DOCKERHUB_USERNAME }}/kerdy-dev
```

이렇게 되면 localhost:8080을 사용하는 상황과 localhost:8081을 사용하는 상황으로 구분할 수 있습니다.

저희는 MySQL을 도커로 띄워두고 있는 상태였는데요, 이때 당시에는 컨테이너 네트워크에서 호스트 네트워크로 접속하는 것에 어려움이 있을 거라 판단해, MySQL 컨테이너를 지우고 호스트에 직접 MySQL을 설치하여 셋팅하기로 결정하였습니다.

**트러블 슈팅 #1**

shell script 작성 중 **문법 오류**가 발생했는데, 변수 선언에서 띄어쓰기를 잘못해서 생긴 문제였습니다.

shell에서는 변수를 선언할 때 `a=abc`와 같이 붙여 써야 합니다.

**트러블 슈팅 #2**

스프링 애플리케이션에서 MySQL에 대한 **접근 거부 에러**가 발생했습니다.

Dev 서버에 MySQL을 처음 설치한 것이다보니, 권한 관련 설정이 되어 있지 않아 발생한 문제였습니다.

1. mysql.cnf 파일의 bind-address 속성을 0.0.0.0으로 설정해주고
    
2. ‘root’@’%’의 접근을 허용해주어서 해결하였습니다.
    
    root 계정은 기본적으로 localhost에서만 접근이 가능하고, 외부로부터의 접근은 차단되어 있습니다.
    
    다음과 같은 sql 명령으로 접근 권한을 부여해줄 수 있습니다.
    
    ```sql
    GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED by '비밀번호';
    ```
    

**트러블 슈팅 #3**

푸시한 도커 이미지를 풀 받는 작업을 수행할 때, 다음과 같은 에러가 발생했습니다.

> ubuntu@ip-192-168-1-236:~$ sudo docker run -d -p 8081:8080 --name kerdy2 -e TZ=Asia/Seoul khj2/kerdy:1697539847
> 
> Unable to find image 'khj2/kerdy:1697539847' locally
> 
> docker: Error response from daemon: pull access denied for khj2/kerdy, repository does not exist or may require 'docker login': denied: requested access to the resource is denied.
> 
> See 'docker run --help'.

저희는 EC2 우분투 계정에서만 도커 허브 계정에 로그인을 해둔 상태였습니다.

```bash
sudo /home/ubuntu/deploy.sh ${{ secrets.DOCKERHUB_USERNAME }} ${{ needs.build.outputs.current_timestamp }}
```

위 명령을 실행할 때, sudo 권한으로 도커 허브에 로그인되지 않은 root 사용자가 스크립트를 실행하게 되므로 권한 에러가 발생한 것이었습니다.

sudo 권한으로 도커 허브에 로그인하여 해결했습니다.

## 마무리
![](https://i.imgur.com/CiBXliM.png)
이렇게 해서 dev서버부터 prod 서버까지의 무중단 배포 도입 작업을 성공적으로 마쳤습니다.

무중단 배포를 도입함으로서 다운타임을 20초에서 1초로 줄일 수 있었고(nginx가 reload되는 데 걸리는 시간), 효과적으로 가용성을 높일 수 있었습니다.
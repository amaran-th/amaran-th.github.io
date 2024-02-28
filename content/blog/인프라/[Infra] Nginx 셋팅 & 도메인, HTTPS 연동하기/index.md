---
title: "[Infra] Nginx 셋팅 & 도메인, HTTPS 연동하기"
date: "2024-02-28T20:08:03.284Z"
description: "Doore 서비스의 운영서버의 Nginx 환경을 셋팅하고 도메인, HTTPS를 연동했다."
section: "문제 해결" 
category: "인프라"
tags:
  - 두레
  - 인프라
---

# 들어가며
---
지난 포스팅에 이어서, HTTPS 설정을 위해 Nginx를 셋팅하고 도메인 연결, HTTPS 셋팅을 진행해봅시다.
*Nginx도 Spring 애플리케이션과 마찬가지로 도커 컨테이너로 띄울 것입니다.

# 전체적인 흐름
이번 포스팅에서 진행할 작업의 전체적인 흐름은 다음과 같습니다.
1. Nginx 셋팅
	- nginx 이미지 pull
	- nginx 설정 파일(default.conf, nginx.conf 작성)
	- docker-compose.yml에 nginx 추가 작성
2. 도메인 구입
3. HTTPS 적용
# 1. Nginx 셋팅
## Nginx Image Pull
먼저 nginx 도커 이미지를 내려받습니다.
```shell
docker pull nginx
```
혹은 dockerfile을 생성한 후 build를 해주어도 됩니다.
```dockerfile
FROM nginx:1.21.6
```
```shell
 docker build -t doore-nginx:prod -f docker/nginx.dockerfile .
```
## Nginx 설정 파일 작성
### nginx.conf
```conf
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;

    keepalive_timeout  65;

    include /etc/nginx/conf.d/*.conf;
}
```
**nginx.conf 파일**은  Nginx의 주요 설정 파일로, Nginx 서버의 동작을 정의하고 제어하는 데 사용됩니다. 예를 들면 Nginx 서버가 요청을 수신하고 응답하는 방식, 가상 호스트 설정, 로깅 방식, 프록시 설정 등을 구성할  수 있습니다.

Nginx의 모듈들은 configuration 파일에 있는 **directive**에 의해 제어됩니다. directive에는 simple directive, block directive 두 가지 종류가 있습니다.
1. **simple directive** : 이름, 인자 값이 있고 세미콜론(;)으로 끝납니다.
	- user : linux 시스템의 어떤 사용자가 NGINX 서버를 동작시킬지 기술.
	- worker_processes :  몇 개의 스레드를 사용할 지 정의.(CPU 코어 수에 맞추는 것이 권장됨)
	- error_log : nginx의 에러 로그가 쌓이는 경로
	- pid : nginx의 프로세스 아이디(pid)가 저장되는 경로
2. **block directive** : 구성은 simple directive와 같지만 세미콜론 대신 추가적인 내용들이 블럭 안에 들어갑니다. events, http 블럭 등이 이에 해당됩니다.
<aside>

**Context**

---
block directive 안에 다른 directive가 들어가 있는 경우, 이를 context라고 합니다. 대표적으로 events, http, server, location 등이 있습니다.(바깥의 directive들은 main context 안에 있는 것으로 간주됩니다.)
</aside>

- events: 일반적인 connection process를 담당 
	- worker_connections : worker process가 동시에 처리할 수 있는 접속자의 수(기본값 1024) 
- http : http 트래픽에 대한 설정을 담당
	- include : 포함시킬 외부 파일을 정의.
	- default_type : 웹 서버의 기본 Content-Type.
	- log_format : 로그의 형식 지정.
	- access_log : 접속 로그가 쌓이는 경로
	- sendfile : sendfile() 함수의 사용 여부 지정. sendfile()은 한 파일의 디스크립터와 다른 파일의 디스크립터 간에 데이터를 복사하는데, 커널 내부에서 복사가 진행된다.
	- keepalive_timeout : 클라이언트에서 연결이 유지될 시간을 정의.(기본값 65)
- mail : Mail 트래픽에 대한 설정을 담당
- stream : TCP와 UDP 트래픽에 대한 설정을 담당.

`include /etc/nginx/conf.d/*.conf;`는 해당 경로에 있는 conf파일의 설정을 포함시킨다는 의미인데, 다음으로 살펴볼 default.conf가 이 경로에 위치할 것이기 때문에 해당 파일의 설정도 함께 적용된다고 생각하면 됩니다.
### default.conf
```conf
upstream doore-api {
	server app:8080;
}

server {
	listen 80;
	
	location /api {
		proxy_pass http://doore-api/;
	}
}
```
\* **virtual server** : http와 같이, 트래픽을 다루는 context에서 사용자 요청을 처리하기 위해서는 한 개 이상의 server block을 추가해야 합니다. 트래픽 유형에 따라 server context에 추가할 수 있는 directive들이 다릅니다.

http context 안에 있는 server directive는 특정 도메인이나 IP 주소로의 요청을 처리합니다. server context 안에 있는 location context를 통해 특정 URI 집합을 어떻게 처리할지 설정할 수 있습니다. 
- listen : 해당 포트로 들어오는 요청을 해당 server{} 블록 내용에 맞게 처리하겠다는 것을 의미.
- server_name : 호스트 이름 지정.
- error_page : 요청 결과의 http 상태코드가 지정된 http 상태코드와 일치할 경우, 특정 url로 이동하도록 설정.
	```conf
	server {
		error_page 500 502 503 504 /50x.html;
		location = /50x.html {
			root /usr/share/nginx/html; 
		}
	}
	```
	요청 결과가 500, 502, 503, 504일 경우 /usr/share/nginx/html 경로에 위치한 50x.html 파일을 사용자에게 반환한다.
- location {uri 경로} : uri 경로에 해당되는 요청이 들어왔을 때 취할 동작을 정의하는 블록.
	- root : 요청이 들어왔을 때 보여줄 페이지들이 속한 경로
	- index : 요청이 들어왔을 때 보여줄 초기 페이지
	- proxy_pass : 받은 요청을 전달할 프록시 서버를 지정
		```conf
		server {
		    location / {
		        root   /usr/share/nginx/html;
		        index  index.html index.html;
		    }
		}
		```
처음에 나왔던 `default.conf` 파일을 다시 살펴봅시다.
```conf
upstream doore-api {
	server app:8080;
}
```
네트워크상에서 사용되는 upstream과 downstream이라는 용어를 설명해보자면, 데이터를 내려보내는 서버를 upstream 서버, upstream 서버로부터 데이터를 내려받는 서버를 downstream 서버라고 합니다.

doore-api라는 이름의 upstream 서버를 정의하는 블록인데, 스크립트를 보시면 서버 ip 주소가 app:8080으로 설정되어 있습니다.
docker-compose.yml 파일에서 스프링 애플리케이션 컨테이너의 이름을 'app'으로 설정했던 것이 기억나시나요?
```yml
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
`app:8080`는 이 컨테이너의 8080 포트를 가리키는 것입니다.

```conf
server {
	listen 80;
	
	location /api {
		proxy_pass http://doore-api/;
	}
}
```
그 다음 server 블록을 살펴봅시다. 이는 80번 포트로 들어오는 요청에 대해, 요청 url이 `/api`로 시작한다면 앞서 지정해주었던 upstream 서버로 요청을 전달한다는 의미입니다. 
![](https://i.imgur.com/EE18mET.png)

### docker-compose.yml에 nginx 추가 작성
```yml
version: '3.5'

services:
  app:
    container_name: doore-app
    image: doore-app:prod
    ports:
      - 8080:8080
    environment:
      - TZ=Asia/Seoul

  nginx:
    container_name: doore-nginx
    image: doore-nginx:prod
    volumes:
      - ./docker/data/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/data/nginx/conf.d:/etc/nginx/conf.d
    ports:
      - 80:80
      - 443:443
```
컨테이너의 이름은 `doore-nginx`이고, 컨테이너를 띄울 이미지는 `doore-nginx:prod`입니다.
volumes는 컨테이너와 호스트 간의 데이터/저장공간을 공유할 수 있도록 하는 설정입니다.
volumes 속성의 첫 번째 줄은 로컬 호스트의 `./docker/data/nginx/nginx.conf` 경로를 컨테이너의 `/etc/nginx/nginx.conf` 경로에 마운트시킨다는 의미입니다.
> **마운트**
>
> 컴퓨터 시스템에서 파일 시스템을 특정 디렉터리에 **연결**하는 작업. 이는 다른 디렉터리나 저장 장치를 해당 디렉터리에 투영하여 그 안의 파일들을 접근할 수 있게 해준다.

port 설정은 http와 https 요청을 처리하기 위해 80:80, 443:443 두 가지를 설정해주었습니다.

이렇게 해서 기본적인 nginx 설정을 마쳤습니다. 이전 게시글에서 작성했던 deploy.sh가 실행되면 nginx 서버의 컨테이너 역시 생성될 것입니다.

# 2. 도메인 구입
무료 도메인을 구입해봅시다. 저는 내도메인.한국이라는 도메인 센터에서 도메인을 구입했습니다.
사용하고자 하는 도메인 이름을 조회하여 선택합니다.
![](https://i.imgur.com/58LAdDK.png)
![](https://i.imgur.com/jXy35D0.png)
그리고 다음 화면에서 IP 연결을 체크하고 우측 입력창에 배포 서버(EC2)의 public IP 주소를 입력합니다.
![](https://i.imgur.com/tiD3WXS.png)

이렇게 하면 도메인 연결이 완료됩니다.

# 3. HTTPS 적용
이제 Nginx 컨테이너에 SSL 인증서를 적용하여 HTTPS를 적용할 것입니다.
먼저 docker-compose.yml 파일을 다음과 같이 수정해줍니다.
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

  nginx:
    container_name: doore-nginx
    image: doore-nginx:prod
    volumes:
      - ./docker/data/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/data/nginx/conf.d:/etc/nginx/conf.d
      - ./docker/data/certbot/conf:/etc/letsencrypt
      - ./docker/data/certbot/www:/var/www/certbot
    ports:
      - 80:80
      - 443:443
  certbot:
	container_name: doore-certbot
    image: certbot/certbot
    restart: unless-stopped
    volumes:
      - ./docker/data/certbot/conf:/etc/letsencrypt
      - ./docker/data/certbot/www:/var/www/certbot
```
그 다음 docker-compose.yml을 실행시킨 뒤 nginx와 certbot 컨테이너가 살아있는지 확인합니다.
```shell
docker-compose -f docker-compose.yml up -d
docker ps
```
그 다음, 인증서 발급을 위해 nginx.conf 파일에 `.well-known/acme-challenge` 경로에 대한 설정을 추가해줍니다.
```conf
upstream doore-api {
        server app:8080;
}

server {
        listen  80;
        listen [::]:80;

        server_name doo-re.kro.kr;

        location /.well-known/acme-challenge/ {
                allow all;
                root /var/www/certbot;
        }

        location /api {
                proxy_pass      http://doore-api/;
        }
}
```
다음으로 인증서를 발급받는 스크립트를 다운로드하고, 쉘 파일 내 도메인, 이메일 주소, 디렉터리를 수정한 뒤 실행시켜줍니다.
```shell
curl -L https://raw.githubusercontent.com/wmnnd/nginx-certbot/master/init-letsencrypt.sh > init-letsencrypt.sh 
chmod +x init-letsencrypt.sh 
vi init-letsencrypt.sh // 도메인, 이메일, 디렉토리 수정 
sudo ./init-letsencrypt.sh // 인증서 발급
```

이렇게 해서 인증서를 발급받았다면, nginx.conf 파일을 수정하여 HTTPS를 적용해줍니다.
```conf
upstream doore-api {
        server app:8080;
}

server {
        listen  80;
        listen [::]:80;

        server_name doo-re.kro.kr;
        server_tokens off;

        location /.well-known/acme-challenge/ {
                root /var/www/certbot;
        }

        location / {
                return 301 https://$host$request_uri;;
        }
}

server {
        listen 443 ssl;

        server_name doo-re.kro.kr;
        server_tokens off;

		ssl_certificate /etc/letsencrypt/live/doo-re.kro.kr/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/doo-re.kro.kr/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        location /api {
                proxy_pass      http://doore-api/;
                proxy_set_header        Host    $http_host;
                proxy_set_header        X-Real-IP       $remote_addr;
                proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for
        }
}
```
이렇게 하면 서비스에 https가 성공적으로 적용된 것을 확인할 수 있습니다.
![](https://i.imgur.com/pjbwZ8g.png)

ssl 인증서는 3개월마다 갱신해주어야 하는데, 이 작업을 자동으로 수행하기 위해 docker-compose.yml 파일에 다음과 같은 명령어 스크립트를 추가해줍니다.
```yaml
  nginx:
    container_name: doore-nginx
    image: doore-nginx:prod
    volumes:
      - ./docker/data/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/data/nginx/conf.d:/etc/nginx/conf.d
      - ./docker/data/certbot/conf:/etc/letsencrypt
      - ./docker/data/certbot/www:/var/www/certbot

    ports:
      - 80:80
      - 443:443
    command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"

  certbot:
    container_name: doore-certbot
    image: certbot/certbot
    restart: unless-stopped
    volumes:
      - ./docker/data/certbot/conf:/etc/letsencrypt
      - ./docker/data/certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```
# 참고 게시글
---
- [Nginx 설치 및 nginx.conf, default.conf 이해하기](https://phsun102.tistory.com/45)
- [[NGINX] 꼭 알아야 할 configuration 기초 개념!](https://gonna-be.tistory.com/20)
- [Nginx를 이용하여 https 적용하는 법](https://gist.github.com/woorim960/dda0bc85599f61a025bb8ac471dfaf7a)
- [[Docker] Docker 환경 Nginx에 SSL 인증서 적용하기(Let’s Encrypt)](https://node-js.tistory.com/32)
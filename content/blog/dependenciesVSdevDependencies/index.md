---
title: dependencies vs devDependencies
date: "2022-11-21T13:01:03.284Z"
description: "package.json의 dependencies vs devDependencies 속성에 대하여"
category: "주저리주저리"
tag: ["node"]
---

```
npm install [패키지명]
```

위와 같이 nodejs 프로젝트에서 npm install 명령어로 node 플러그인을 설치하면 기본적으로 프로젝트 내에 생성되어 있는 node_modules 디렉토리 내에 패키지가 설치됩니다.

다음 옵션을 통해 추가적으로 진행할 동작을 설정할 수 있습니다.
| 옵션 | 설명 |
| -----|-------|
| **--save** | package.json의 `dependencies` 항목에 설치하고자 하는 패키지 정보가 저장된다.(npm 5 버전 이후부터는 --save 옵션이 없이도 package.json의 dependencies에 패키지가 추가 된다.) |
| **--save-dev** 또는 **-D** | package.json의 `devDependencies` 항목에 설치하고자 하는 패키지 정보가 저장된다. |

`dependencies`에는 주로 실제 릴리즈될 애플리케이션 동작에 사용되는 패키지를 저장하고, `devDependencies`에는 개발 과정에서 사용할 패키지를 저장합니다. (esLint, webpack 등)

이렇게 패키지를 개발용과 배포용으로 분리하는 이유는, 배포 시에 배포용 패키지만 설치하여 운용하기 위함입니다.

### 배포

```
npm install --production

```

기본적으로 node package를 install 하면 dependencies와 devDependencies의 패키지가 모두 설치되지만, 옵션으로 `--production`을 붙여주면 dependencies 항목의 패키지만 설치가 됩니다.

때문에 일반적으로 프로젝트를 빌드할 때 위의 명령어를 사용하여 dependencies에 있는 패키지만 설치합니다.

이렇게 패키지를 구분해서 설치해주면 배포 시에 배포에 불필요한 라이브러리를 제외함으로써 빌드 시간을 효율적으로 줄일 수 있습니다.

- 참고 게시글

[[Node] npm install, --save, --save-dev 차이](https://jae04099.tistory.com/entry/Node-npm-install-save-save-dev-%EC%B0%A8%EC%9D%B4)

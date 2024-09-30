---
title: "[Next.js] 다국어 처리 라이브러리 i18next 사용해보기"
date: "2024-09-30T19:28:03.284Z"
description: "next-i18next를 사용해보자."
section: "지식 공유"
category: "React"
tags:
  - Nextjs
  - React
  - 라이브러리
---

## 개요

현재 인턴으로 다니고 있는 회사 프로젝트에서는 한국어 외에 영어 번역 페이지를 지원하고 있다. 이러한 다국어 처리를 구현하기 위해 i18next라는 프레임워크가 사용되었는데, 오늘은 이 프레임워크에 대해 알아보고 사용해보도록 하겠다.

<aside>
⚠️ 해당 게시글은 Page Router 기반의 nextjs 프로젝트를 기준으로 작성되었습니다.
</aside>

## i18next 셋팅

### 라이브러리 설치

i18next는 React 뿐만 아니라 Vue.js, Angular 등 다양한 환경에서 지원되고 있는데, 나는 nextjs에 기반한 프로젝트를 만들었기 때문에 `next-i18next`를 함께 설치해주었다.

```shell
npm install next-i18next
```

### 번역 문자열을 저장할 파일 작성

public 폴더에 locales라는 폴더를 만들고, 내부에 en, ko라는 폴더를 만들어주었다.

```
.
└── public
    └── locales
        ├── en
        |   └── common.json
        └── ko
            └── common.json
```

### next-i18next.config.js 파일 생성

프로젝트 루트 경로에 `next-i18next.config.js` 파일을 생성해주고 다음과 같이 작성해준다.

```javascript
module.exports = {
  i18n: {
    defaultLocale: "ko",
    locales: ["en", "ko"],
  },
  reloadOnPrerender: true,
}
```

기본 언어를 한국어(ko)로 설정하였다.
`http://localhost:3000`로 접속했을 때 locale 값은 디폴트 값인 'ko'이고, `http://localhost:3000/en`으로 접속하면 locale 값이 'en'으로 설정된 상태로 페이지를 로드하게 된다.

- **`reloadOnPrerender` 설정**

  기본적으로 public 경로의 리소스는 서버가 시작될 때 한 번 로드된다. 때문에, 개발 환경에서 translation json 파일(앞 단계에서 정의한 common.json 등)에 변경사항이 생겨도 서버를 다시 시작하지 않는다면 변경사항이 적용되지 않는다. 만일 개발서버를 다시 시작하지 않고도 json 파일의 변경사항을 적용하고 싶은 경우 `reloadOnPrerender` 옵션을 true로 설정하면 된다.

### next.config.js에 라이브러리 import

다음으로 `next.config.js` 설정파일에 i18n 라이브러리 설정을 import하고 프로젝트 설정에 적용해준다.

```javascript
/** @type {import('next').NextConfig} */

const { i18n } = require("./next-i18next.config")

const nextConfig = {
  reactStrictMode: true,
  i18n,
}

module.exports = nextConfig
```

### appWithTranslation HOC로 App 컴포넌트 래핑

위에서 해준 설정들을 적용하려면 `_app.tsx` 파일에서 appWithTranslation으로 App을 감싸주어야 한다.

```typescript
import Layout from "@/components/Layout"
import MuiLocalizationProvider from "@/lib/utils/muiLocalizationProvider"
import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { RecoilRoot } from "recoil"

import { appWithTranslation } from "next-i18next"

function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <MuiLocalizationProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MuiLocalizationProvider>
    </RecoilRoot>
  )
}

export default appWithTranslation(App)
```

## 사용 방법

이제 설정이 끝났으니 프레임워크를 사용해보자. i18next를 활용하기 위해선 `useTranslation`이라는 훅과 `serverSideTranslations`를 사용해야 한다.

### serverSideTranslations

만약 next-i18next를 서버사이드로 적용하고 싶은 경우, 아래와 같이 모든 페이지에 getStaticProps에서 텍스트 정보를 불러와주어야 한다.

```typescript
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

export const getStaticProps = async ({ locale }: { locale: "ko" | "en" }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "work-permit"])),
  },
})
```

### useTranslation

`useTranslation()` 훅에서 반환된 `t()` 함수는 이 글 맨 처음에 작성한 `public/locales/ko/xxx.json`, `public/locales/en/xxx.json` 파일에 정의한 문자열에 접근할 수 있다.

```typescript
"use client";

import PageTitle from "@/components/Typography/PageTitle";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export const getStaticProps = async ({ locale }: { locale: "ko" | "en" }) => ({
	props: {
		...(await serverSideTranslations(locale, ["common", "work-permit"])),
	},
});

export default function Home() {
	const { t } = useTranslation();
	...

	return (
		<main className="p-[30px] flex flex-col gap-6">
			<PageTitle title={`${t("work-permit:허가서_조회")} ${t("영어")}`} />
			...
		</main>
	);
}
```

현재 locales 폴더 내의 json 파일들은 다음과 같이 정의되어 있다.
참고로 `serverSideTranslations()` 함수의 인자로 넣어준 리스트에서 첫번째로 들어간 'common'이 default json 파일이 된다. 때문에 `t("영어")`는 common.json의 "영어" 속성 값을 불러온다.

- `/locales/ko/common.json`
  ```json
  {
    "영어": "영어",
    "한국어": "한국어"
  }
  ```
- `/locales/ko/work-permit.json`
  ```json
  {
    "허가서_조회": "허가서 조회"
  }
  ```
- `/locales/en/common.json`
  ```json
  {
    "영어": "English",
    "한국어": "Korean"
  }
  ```
- `/locales/en/work-permit.json`
  ```json
  {
    "허가서_조회": "Permit Inquiry"
  }
  ```

### 로케일 변경 방법

```typescript
import { useRouter } from "next/router";
...

const router = useRouter();
const { pathname, asPath, query } = router;

const changeLocaleEn = () => {
	router.push({ pathname, query }, asPath, {
		locale: "en",
	});
}
```

위와 같이 router.push()를 호출할 때 locale 값을 설정해주면 된다.

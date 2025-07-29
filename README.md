# 📘 ssami-front

> 문서 작성, 분석, 정리를 돕는 스마트 문서 편집 시스템의 프론트엔드 레포지토리입니다.  
> FastAPI 기반 백엔드와 함께 작동하며, React + TypeScript 기반의 인터페이스를 제공합니다.

---

## 🚀 주요 기능

- ✅ 소셜 로그인 (Google, Kakao, Naver) OAuth 인증 연동
- ✅ 문서 작성 및 자동 저장 기능
- ✅ 문장 단위 AI 분석 (하이라이트 + 라벨 추출)
- ✅ 챗봇 기반 문서 보조 기능
- ✅ 문서 분류 및 휴지통 기능
- ✅ 반응형 UI 및 직관적인 에디터 인터페이스

---

## 🛠️ 기술 스택

- **React 18 (TypeScript)**
- **Vite**: 번들러
- **Zustand**: 상태 관리
- **React Router v6**
- **Tailwind CSS**
- **FastAPI** (백엔드 연동)
- **JWT 인증 + OAuth2** (프론트-백 통신)

---

## 📁 폴더 구조

ssami-front/
├── public/                    # 정적 파일
├── src/
│   ├── assets/               # 이미지 및 스타일 에셋
│   ├── components/           # 재사용 가능한 UI 컴포넌트
│   │   ├── Button/
│   │   ├── Header/
│   │   ├── Modal/
│   │   └── ...
│   ├── features/             # 페이지 단위 기능 모듈
│   │   ├── Editor/
│   │   ├── Chatbot/
│   │   ├── Suggestion/
│   │   └── ...
│   ├── hooks/                # 커스텀 훅 모음
│   ├── lib/                  # API 함수 및 유틸
│   │   ├── api/
│   │   └── utils/
│   ├── routes/               # 라우팅 설정
│   ├── store/                # Zustand 상태 관리
│   ├── types/                # 전역 타입 선언
│   ├── App.tsx               # 최상위 컴포넌트
│   ├── main.tsx              # 진입점
│   └── index.css
├── .env                      # 환경 변수
├── Dockerfile                # Docker 설정
├── index.html                # HTML 진입점
├── package.json
└── vite.config.ts


---

## 📦 설치 및 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 환경 변수 설정 (.env)
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=...
VITE_KAKAO_CLIENT_ID=...
VITE_NAVER_CLIENT_ID=...

---

## 🧠 개발자 참고 사항

* `useAuthStore`를 통해 전역 사용자 상태를 관리합니다.
* `autosave` 및 `highlight` 처리는 `Editor` 및 `Suggestion`에서 관리됩니다.
* AI 분석 기능은 `/lib/api/analyzeApi.ts` 를 통해 FastAPI 백엔드와 통신합니다.
* 문서 분류 기능은 `Keyword`, 휴지통은 `Trash`로 분리되어 있습니다.
* `ProtectedRoute.tsx`를 통해 인증된 사용자만 특정 라우트를 접근할 수 있도록 구성합니다.

---

## 📄 저작권 및 라이선스

본 프로젝트는 내부 연구/개발 목적에 따라 제작되었으며, 별도 라이선스 조건이 적용될 수 있습니다.

---

🔧 문의 및 협업: \[프로젝트 관리자에게 문의하세요]

```


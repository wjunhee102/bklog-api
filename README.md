# Bklog Api

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## App Structure
```
(src)
├─── /auth(module)
|     └─ /private-user(module)
├─── /bklog(module)
|     ├─ /page(module)
|     └─ /block(module)
├─── /user(module)
├─── /entities
├─── /events(socket)
└─── /utils
```

```
(module)
├─── /repositories
├─── controller
├─── service
├─── type
└─── module
```
---


## Commit Message Convention

### 1. Commit Message Structure
```
#issue type

body
```


### 2. Commit Type
+ feat: 새로운 기능 추가
+ fix: 버그 수정
+ docs: 문서 수정
+ style: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
+ refactor: 코드 리팩토링
+ test: 테스트 코드
+ chore: 빌드 업무 수정, 패키지 매니저 수정
+ temp: 임시 저장 

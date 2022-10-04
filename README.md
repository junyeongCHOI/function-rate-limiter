# Function rate limiter

함수의 시간당 실행 횟수를 조절.
~ 1.8kB, gzip ~ 0.5kB

## 사용

```js
import Limiter from "function-rate-limiter";

const limiter = new Limiter({
  invoke: 10,
  interval: 1000,
  // options: {
  //   async: true, // 비동기 함수 기다림.
  //   delay: 100, // 함수 딜레이
  // },
});

while (1) {
  await limiter.exec(async () => {
    // ...
  });
}
```

위의 예제는 1,000ms 10번의 실행을 한다.  
옵션으로 비동기 함수를 기다릴 수 있다. 이때의 지연시간은 기다림까지 포함한다.  
해당 동기 혹은 비동기 실행이 실행 주기를 넘어갈 경우 바로 다음을 실행한다.

## 상세

### `new Limiter(configs)`

인스턴스 생성.

#### Configs

- `invoke` - Number - 실행 횟수
- `interval` - Number - 실행 주기(ms)
- `options` - Object
  - async - Boolean(Optional) - 실행 함수 기다림
  - delay - Number - 실행 함수 사이의 딜레이

### `limiter.exec(cb)`

함수를 실행한다.

- `cb` - Function

## 테스트

- npm run test
- npm run test:async

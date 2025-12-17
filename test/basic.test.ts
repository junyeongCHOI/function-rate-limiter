import assert from "assert";
import Limiter from "../src";

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

const getNow = () => new Date().getTime();
const LONG_TEST_MODE = process.env.LONG_TEST === "true";

type TestCase = {
  name: string;
  run: () => Promise<void>;
};

async function basicLimiterHonorsInvokePerInterval(): Promise<void> {
  const invoke = 5;
  const interval = 200;
  const limiter = new Limiter({
    invoke,
    interval,
    options: {
      async: true,
    },
  });

  const timestamps: number[] = [];

  for (let i = 0; i < invoke * 2; i++) {
    await limiter.exec(async () => {
      timestamps.push(getNow());
      await wait(10);
    });
  }

  assert.strictEqual(
    timestamps.length,
    invoke * 2,
    "예상한 횟수만큼 실행되지 않았습니다."
  );

  const elapsedBetweenWindows = timestamps[invoke] - timestamps[0];
  assert.ok(
    elapsedBetweenWindows >= interval - 20,
    `두 번째 윈도우까지 ${elapsedBetweenWindows}ms만 대기했습니다.`
  );
}

async function configChangeRespectsPreviousWindow(): Promise<void> {
  const firstInterval = 400;
  const limiter = new Limiter({
    invoke: 1,
    interval: firstInterval,
  });

  const timestamps: number[] = [];

  await limiter.exec(() => {
    timestamps.push(getNow());
  });

  limiter.setConfigs({
    invoke: 1,
    interval: 100,
  });

  await limiter.exec(() => {
    timestamps.push(getNow());
  });

  const elapsedBetweenConfigs = timestamps[1] - timestamps[0];
  assert.ok(
    elapsedBetweenConfigs >= firstInterval - 20,
    `설정 변경 후 두 번째 호출까지 ${elapsedBetweenConfigs}ms만 대기했습니다.`
  );
}

const tests: TestCase[] = [
  {
    name: "기본 인터벌에서 invoke 제한 확인",
    run: basicLimiterHonorsInvokePerInterval,
  },
  {
    name: "중간 설정 변경 시 이전 인터벌 소진 확인",
    run: configChangeRespectsPreviousWindow,
  },
];

async function runFiniteTests(): Promise<void> {
  for (const test of tests) {
    const startedAt = getNow();
    console.log(`▶ ${test.name}`);
    await test.run();
    console.log(`✅ ${test.name} (${getNow() - startedAt}ms)`);
  }
}

async function runLongDurationLog(): Promise<void> {
  const configs = {
    invoke: 10,
    interval: 1000,
    options: {
      async: process.env.async === "true",
      // delay: 100,
    },
  };
  const limiter = new Limiter(configs);
  let count = 0;
  let now = getNow();

  while (true) {
    await limiter.exec(async () => {
      count++;
      console.log(count);
      await wait(50);
    });

    if (count % configs.invoke === 0) {
      console.log("draft: ", getNow() - now);
      now = getNow();
    }
  }
}

(async () => {
  if (LONG_TEST_MODE) {
    await runLongDurationLog();
    return;
  }

  await runFiniteTests();
})();

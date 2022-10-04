import Limiter from "../src";

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

const getNow = () => new Date().getTime();

(async () => {
  const configs = {
    invoke: 10,
    interval: 1000,
    options: { async: process.env.async === "true" },
  };
  const limiter = new Limiter(configs);
  let count = 0;
  let now = getNow();

  while (1) {
    await limiter.exec(async () => {
      count++;
      console.log(count);
      await wait(250);
    });

    if (count % configs.invoke === 0) {
      console.log("draft: ", getNow() - now);
      now = getNow();
    }
  }
})();

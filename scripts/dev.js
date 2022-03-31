const execa = require("execa");

async function build(target) {
  // 子进程的输出输出在父进程中
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`], {
    stdio: "inherit",
  });
}

build("reactivity");

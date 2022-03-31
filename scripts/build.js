const fs = require("fs");
const execa = require("execa");

const dirs = fs.readdirSync("packages").filter((target) => {
  // 只留下文件夹
  return fs.statSync(`packages/${target}`).isDirectory();
});
console.log(dirs);

async function build(target) {
  // 子进程的输出输出在父进程中
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`], {
    stdio: "inherit",
  });
}

// 并发打包
async function parallel(dirs, iteratorFn) {
  const queue = [];
  for (const target of dirs) {
    queue.push(iteratorFn(target));
  }
  return Promise.all(queue);
}

// 打包文件
parallel(dirs, build).then(() => {
  console.log("打包完成");
});

const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("child_process").exec;
const util = require("util");
// const exec = util.promisify(require('child_process').exec);

try {
  const git_source = core.getInput("git_source");
  const git_source_key = core.getInput("git_source_key");
  const git_remote = core.getInput("git_remote");
  const git_remote_key = core.getInput("git_remote_key");

  const fs = require("fs");

  //git_source_key 是 Base64 编码的密钥
  const gitSourceKey = "git_source_key";

  // 对 git_source_key 进行 Base64 解码
  const decodedKey_source = Buffer.from(git_source_key, "base64").toString();
  const decodedKey_remote = Buffer.from(git_remote_key, "base64").toString();
  console.log(decodedKey_source);
  // 将解码后的密钥存储到 /tmp/git_source_key 文件中
  fs.writeFile("/tmp/git_source_key", decodedKey_source, (err) => {
    if (err) {
      console.error("无法将密钥存储到文件：", err);
      return;
    }
    console.log("密钥已成功存储到 /tmp/git_source_key 文件。");
  });

  console.log(decodedKey_remote);
  fs.writeFile("/tmp/git_remote_key", decodedKey_remote, (err) => {
    if (err) {
      console.error("无法将密钥存储到文件：", err);
      return;
    }
    console.log("密钥已成功存储到 /tmp/git_remote_key 文件。");
  });

  console.log("Running: rm -rf ./code");
  exec("rm -rf ./code", execCallback);
  console.log("Finished running: rm -rf ./code");

  console.log(
    `Running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git clone --bare ${git_source} code`
  );
  exec(
    `GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -F /dev/null  -i /tmp/git_source_key  ' git clone --bare ${git_source} code`
  );
  console.log(
    `Finished running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git clone --bare ${git_source} code`
  );

  // console.log("Running: realpath ./code");
  // exec("realpath ./code", execCallback);
  // const barecode = stdout.trim();
  // console.log(`Finished running: realpath ./code. Output: ${barecode}`);
  // process.chdir(barecode.trim());
  
  console.log(`cd  ./code`);
  exec("cd ./code", execCallback);
  exec("ls -lh", execCallback);
  exec('git config user.email "devops@cprd.tech"', execCallback);
  exec('git config user.name "codesync"', execCallback);

  console.log(
    `Running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git push --mirror ${gitRemote}`
  );
  exec(
    `GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -F /dev/null' git push --mirror ${gitRemote}`,
    execCallback
  );
  console.log(
    `Finished running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git push --mirror ${gitRemote}`
  );

  console.log(
    `Running: gh api repos/${org}/${value} --method PATCH --field 'default_branch=master' --silent`
  );
  exec(
    `gh api repos/${org}/${value} --method PATCH --field 'default_branch=master' --silent`,
    execCallback
  );
  console.log(
    `Finished running: gh api repos/${org}/${value} --method PATCH --field 'default_branch=master' --silent`
  );

  console.log("Running: git push --set-upstream origin master");
  exec("git push --set-upstream origin master", execCallback);
  console.log("Finished running: git push --set-upstream origin master");

  console.log(
    `Running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git push --follow-tags`
  );
  exec(
    `GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -F /dev/null' git push --follow-tags`,
    execCallback
  );
  console.log(
    `Finished running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git push --follow-tags`
  );
} catch (err) {
  console.error(`exec error: ${err}`);
}

// try {
//   // `who-to-greet` input defined in action metadata file

//   // 设置 git 用户的邮箱和用户名
//   exec(`git config --global user.email test@sp.com`, execCallback);
//   exec(`git config --global user.name devops`, execCallback);
//   // 将git_source_key用base64 decoder后存到 /tmp/git_source_key
//   // todo

//   // git_remote_key decoder后存到 /tmp/git_remote_key
//   // todo

//   // 从 git_source 检出代码
//   exec(
//     ` GIT_SSH_COMMAND='ssh -o  StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -F /dev/null -i /tmp/git_source_key  ' git clone --bare ${git_source} code `,
//     execCallback
//   );

//   const time = new Date().toTimeString();
//   core.setOutput("succeed", time);
//   core.setOutput("message", time);
//   core.setOutput("return_code", time);
//   core.setOutput("run_log", time);
// } catch (error) {
//   core.setFailed(error.message);
// }

function execCallback(error, stdout, stderr) {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
}

// 这是一个js的版本的github action，用于同步代码。请实现其中未完成的部分

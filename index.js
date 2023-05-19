const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");

let output_log = "";
let output_err = "";

const options = {};
options.listeners = {
  stdout: (data) => {
    output_log += data.toString();
  },
  stderr: (data) => {
    output_err += data.toString();
  },
};
options.cwd = "/tmp";

async function runCommands(
  pre_command,
  git_source,
  git_source_key,
  git_remote,
  git_remote_key
) {
  try {
    // ssh -fCL 0.0.0.0:50022:10.10.10.86:50022 remoteHost tail -f /dev/null
    const sync_commond = `#/bin/bash
    ${pre_command}
    set -ex
    GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -F /dev/null  -i /tmp/git_source_key  ' git clone --bare ${git_source} code
    cd  ./code
    ls -lh
    git config user.email "devops@cprd.tech"
    git config user.name "codesync"
    GIT_SSH_COMMAND='ssh -p 50022 -o  StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa  -F /dev/null  -i /tmp/git_remote_key  '  git push --mirror  ${git_remote}
    GIT_SSH_COMMAND='ssh -p 50022 -o  StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa  -F /dev/null -i /tmp/git_remote_key  ' git push --set-upstream origin master
    GIT_SSH_COMMAND='ssh -p 50022 -o  StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa  -F /dev/null -i /tmp/git_remote_key  ' git push --follow-tags  
    ls -lh
    `;
    const fs = require("fs");
    fs.writeFileSync("/tmp/sync.sh", sync_commond, { mode: 0o777 }, (err) => {
      if (err) {
        console.error("无法写入shell文件：", err);
        return;
      }
      console.log("Shell文件成功写入");
    });
    // 对 git_source_key 进行 Base64 解码
    const decodedKey_source = Buffer.from(git_source_key, "base64").toString();
    // console.log("git_source_key " + git_source_key);
    // console.log("source key after decode " + decodedKey_source);
    // 将解码后的密钥存储到 /tmp/git_source_key 文件中
    fs.writeFileSync(
      "/tmp/git_source_key",
      decodedKey_source,
      { mode: 0o400 },
      (err) => {
        if (err) {
          console.error("无法将密钥存储到文件：", err);
          return;
        }
        console.log(" 密钥已成功存储到 /tmp/git_source_key 文件。");
      }
    );

    const decodedKey_remote = Buffer.from(git_remote_key, "base64").toString();
    // console.log("git_remote_key " + git_remote_key);
    // console.log("remote key after decode " + decodedKey_remote);
    fs.writeFileSync(
      "/tmp/git_remote_key",
      decodedKey_remote,
      { mode: 0o400 },
      (err) => {
        if (err) {
          console.error("无法将密钥存储到文件：", err);
          return;
        }
        console.log("密钥已成功存储到 /tmp/git_remote_key 文件。");
      }
    );

    console.log("Running: rm -rf ./code");
    // await exec("rm -rf ./code");
    await exec.exec("bash", ["/tmp/sync.sh"]);
    await exec.exec("rm -rf ./code", [], options);
    console.log("Finished running: rm -rf ./code");
  } catch (err) {
    console.error(`exec error: ${err}`);
  }
}

try {
  const pre_command = core.getInput("pre_command");
  console.log(`pre_command ${pre_command}!`);

  const git_source_p = core.getInput("git_source");
  console.log(`git_source ${git_source_p}!`);

  const git_source_key_p = core.getInput("git_source_key");
  // console.log(`git_source_key ${git_source_key_p}!`);

  const git_remote_p = core.getInput("git_remote");
  console.log(`git_remote ${git_remote_p}!`);

  const git_remote_key_p = core.getInput("git_remote_key");
  // console.log(`git_remote_key ${git_remote_key_p}!`);

  (async function () {
    await runCommands(
      pre_command,
      git_source_p,
      git_source_key_p,
      git_remote_p,
      git_remote_key_p
    );
  })();

  const time = "2023";
  core.setOutput("succeed", time);
  core.setOutput("message", time);
  core.setOutput("return_code", time);
  core.setOutput("run_log", "Log\n" + output_log + "\r\n\r\nError" + output_err);
} catch (error) {
  core.setFailed(error.message);
}

// 这是一个js的版本的github action，用于同步代码。请实现其中未完成的部分

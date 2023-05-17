const core = require("@actions/core");
const github = require("@actions/github");
//const exec = require("child_process").exec;
const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function runCommands(git_source, git_source_key, git_remote, git_remote_key ) {
  try {
   

    const fs = require("fs");
    // 对 git_source_key 进行 Base64 解码
    const decodedKey_source = Buffer.from(git_source_key, "base64").toString();
    console.log("git_source_key " + git_source_key);
    console.log("source key after decode " + decodedKey_source);
    // 将解码后的密钥存储到 /tmp/git_source_key 文件中
    await fs.writeFile(
      "/tmp/git_source_key",
      decodedKey_source,
      { mode: 0o400 },
      (err) => {
        if (err) {
          console.error("无法将密钥存储到文件：", err);
          return;
        }
        console.log("lalla "+ git_source_key +" 密钥已成功存储到 /tmp/git_source_key 文件。 + " + decodedKey_source + "    dddd");
      }
    );

    const decodedKey_remote = Buffer.from(git_remote_key, "base64").toString();
    console.log("git_remote_key " + git_remote_key);
    console.log("remote key after decode " + decodedKey_remote);
    await fs.writeFile(
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
    await exec("rm -rf ./code");
    console.log("Finished running: rm -rf ./code");

    console.log(
      `Running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git clone --bare ${git_source} code`
    );
    await exec(
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

    await exec("ls -lh", execCallback);
    console.log(`cd  ./code`);
    await exec("cd ./code", execCallback);
    await exec("ls -lh", execCallback);
    await exec('git config user.email "devops@cprd.tech"', execCallback);
    await exec('git config user.name "codesync"', execCallback);

    console.log(
      `Running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git push --mirror ${gitRemote}`
    );
    await exec(
      `GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -F /dev/null' git push --mirror ${gitRemote}`,
      execCallback
    );
    console.log(
      `Finished running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git push --mirror ${gitRemote}`
    );

    console.log(
      `Running: gh api repos/${org}/${value} --method PATCH --field 'default_branch=master' --silent`
    );
    await exec(
      `gh api repos/${org}/${value} --method PATCH --field 'default_branch=master' --silent`,
      execCallback
    );
    console.log(
      `Finished running: gh api repos/${org}/${value} --method PATCH --field 'default_branch=master' --silent`
    );

    console.log("Running: git push --set-upstream origin master");
    await exec("git push --set-upstream origin master", execCallback);
    console.log("Finished running: git push --set-upstream origin master");

    console.log(
      `Running: GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=no...' git push --follow-tags`
    );
    await exec(
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
}

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const git_source_p = core.getInput("git_source");
  console.log(`Hello ${git_source}!`);
  const git_source_key_p = core.getInput("git_source_key");
  const git_remote_p = core.getInput("git_remote");
  const git_remote_key_p = core.getInput("git_remote_key");
  (async function () {
    await runCommands(git_source_p, git_source_key_p, git_remote_p, git_remote_key_p);
  })();

} catch (error) {
  core.setFailed(error.message);
}


// 这是一个js的版本的github action，用于同步代码。请实现其中未完成的部分

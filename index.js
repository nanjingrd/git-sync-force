const core = require('@actions/core');
const github = require('@actions/github');


try {
  // `who-to-greet` input defined in action metadata file
  const git_source = core.getInput('git_source');
  const git_source_key = core.getInput('git_source_key');
  const git_remote = core.getInput('git_remote');
  const git_remote_key = core.getInput('git_remote_key');
    // 设置 git 用户的邮箱和用户名
    exec(`git config --global user.email test@sp.com`, execCallback);
    exec(`git config --global user.name devops`, execCallback);

    // 从 git_source 检出代码
    exec(`git clone ${git_source}`, (error, stdout, stderr) => {
    if (error) {
        core.setFailed(error.message);
        return;
    }
    
    // 切换到代码所在的目录
    const repoName = git_source.split('/').pop().replace('.git', '');
    process.chdir(repoName);

    // 添加远程仓库并推送代码
    exec(`git remote add remote_repo ${git_remote}`, execCallback);
    exec(`git push remote_repo master`, execCallback);

    console.log("Git user email and name configured successfully!");
    console.log("Code synced successfully!");
    });
} catch (error) {
  core.setFailed(error.message);
}

function execCallback(error, stdout, stderr) {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  }


// 这是一个js的版本的github action，用于同步代码。请实现其中未完成的部分
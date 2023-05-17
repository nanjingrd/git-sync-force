# /bin/bash
set -ex
# nanjingrd/horeca-data-service-backend 
# nanjingrd / horeca-data-service-web 
# nanjingrd / horeca-async-task 
# nanjingrd / horeca-import-tool 
# nanjingrd / economic-impact-horeca-data-processing 
# nanjingrd / economic-impact-horeca-web 
# nanjingrd / economic-impact-horeca-backend 
# nanjingrd / horeca-data-service-web-i18n 
# nanjingrd / horeca-data-service-neo4j 
# nanjingrd / HoReCa-similarity


# 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

arr=(
#"horeca-data-service-backend" 
#"horeca-data-service-web" 
# "horeca-async-task" 
# "horeca-import-tool" 
######### "economic-impact-horeca-data-processing"
# "economic-impact-horeca-web"
# "economic-impact-horeca-backend" 
# "horeca-data-service-web-i18n" 
# "horeca-data-service-neo4j"
########## "HoReCa-similarity" 
"our-work-web"
)

export org="nanjingrd"

for value in ${arr[@]}
do
    echo $value
    export git_source="git@code.aliyun.com:${org}/$value.git"
    export git_remote="git@github.com:${org}/$value.git"
    export queryjson="{\"name\":\"${value}\",\"private\":true,\"visibility\":\"private\"}"
    curl -H "Authorization: token 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" --data "${queryjson}"  https://api.github.com/orgs/${org}/repos

    rm -rf ./code
    GIT_SSH_COMMAND='ssh -o  StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa -F /dev/null -i /tmp/git_source_key  ' git clone --bare $git_source code
    barecode=$(realpath ./code)
    cd $barecode
    git config user.email "devops@cprd.tech"
    git config user.name "codesync"

   
    GIT_SSH_COMMAND='ssh -o  StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa  -F /dev/null '  git push --mirror $git_remote

    gh api repos/${org}/$value --method PATCH --field 'default_branch=master' --silent
    git push --set-upstream origin master
    GIT_SSH_COMMAND='ssh -o  StrictHostKeyChecking=no -o IdentitiesOnly=yes -o HostkeyAlgorithms=+ssh-rsa -o PubkeyAcceptedKeyTypes=+ssh-rsa  -F /dev/null ' git push --follow-tags
    
done
exit







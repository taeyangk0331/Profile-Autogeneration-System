const option = () => {
  return $('#type').val();
};

const repositoryName = () => {
  return $('#name').val().trim();
};

const getHTML = (username, repoList) => {
    console.log("inside getHTML func");
    console.log(repoList);
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="style.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossorigin="anonymous">
      </head>
      <body>
        <div id="header_wrap" class="container-sm shadow p-1 float-xl-start bg-light rounded-4">
          <img src="photo.png" id="profile_photo">
          <p><i class="bi bi-person-circle"></i>${username}</p>
          <p><i class="bi bi-building"></i> Undergraduate Student in SKKU</p>
          <p><a class="external text-success" href="https://github.com/${username}" target="_blank"><i class="bi bi-github"></i> My Github</a></p>
          <p><i class="bi bi-envelope"></i></p>
        </div>
    
        <div class="container-sm float-xl-end mt-5">
          <h2>My Github Portfolio</h2>
          <h4>${repoList[0]['reponame']}</h4>
          <p>${repoList[0]['desc']}</p>

          <h4>${repoList[1]['reponame']}</h4>
          <p>${repoList[1]['desc']}</p>

          <h4>${repoList[2]['reponame']}</h4>
          <p>${repoList[2]['desc']}</p>

          <h4>${repoList[3]['reponame']}</h4>
          <p>${repoList[3]['desc']}</p>

          <h4>${repoList[4]['reponame']}</h4>
          <p>${repoList[4]['desc']}</p>
    
          <br><hr><br>
    
          <h2>Interested in</h2>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Problem Solving</a></li>
            <li class="list-group-item">Programming Languages</li>
            <li class="list-group-item">Blockchain</li>
            <li class="list-group-item">AI</li>
            <li class="list-group-item"></li>
          </ul>
    
    
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-OERcA2EqjJCMA+/3y+gxIOqMEjwtxJY7qPCqsdltbNJuaOe923+mo//f6V8Qbsw3" crossorigin="anonymous"></script>
      </body>
    </html>
    `
};

const getCSS = () => {
    return `#header_wrap{
        width: 450px;
      }
      
      #profile_photo {
        width: 100%;
        border-radius: 20px;
        margin-top: 10px;
      }
      
      .container-sm {
        max-width: 900px!important;
      }
      
      .external{
        text-decoration: none;
      }`
};
/* Status codes for creating of repo */

const statusCode = (res, status, name) => {
  switch (status) {
    case 304:
      $('#success').hide();
      $('#error').text(`Error creating ${name} - Unable to modify repository. Try again later!`);
      $('#error').show();
      break;

    case 400:
      $('#success').hide();
      $('#error').text(`Error creating ${name} - Bad POST request, make sure you're not overriding any existing scripts`);
      $('#error').show();
      break;

    case 401:
      $('#success').hide();
      $('#error').text(`Error creating ${name} - Unauthorized access to repo. Try again later!`);
      $('#error').show();
      break;

    case 403:
      $('#success').hide();
      $('#error').text(`Error creating ${name} - Forbidden access to repository. Try again later!`);
      $('#error').show();
      break;

    case 422:
      $('#success').hide();
      $('#error').text(`Error creating ${name} - Unprocessable Entity. Repository may have already been created. Try Linking instead (select 2nd option).`);
      $('#error').show();
      break;

    default:
      /* Change mode type to commit */
      chrome.storage.local.set({ mode_type: 'commit' }, () => {
        $('#error').hide();
        $('#success').html(`Successfully created <a target="blank" href="${res.html_url}">${name}</a>. Start <a href="https://www.acmicpc.net/">BOJ</a>!`);
        $('#success').show();
        $('#unlink').show();
        /* Show new layout */
        document.getElementById('hook_mode').style.display = 'none';
        document.getElementById('commit_mode').style.display = 'inherit';
      });
      /* Set Repo Hook */
      chrome.storage.local.set({ BaekjoonHub_hook: res.full_name }, () => {
        console.log('Successfully set new repo hook');
      });

      break;
  }
};

const createRepo = (token, name) => {
  const AUTHENTICATION_URL = 'https://api.github.com/user/repos';
  let data = {
    name,
    private: false,
    auto_init: true,
    description: 'This is a auto push repository for Baekjoon Online Judge created with [BaekjoonHub](https://github.com/BaekjoonHub/BaekjoonHub).',
  };
  data = JSON.stringify(data);

  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      statusCode(JSON.parse(xhr.responseText), xhr.status, name);
    }
  });

  stats = {};
  stats.version = chrome.runtime.getManifest().version;
  stats.submission = {};
  chrome.storage.local.set({ stats });

  xhr.open('POST', AUTHENTICATION_URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send(data);
};

const publishRepo = (token, hook) => {
  const AUTHENTICATION_URL = `https://api.github.com/repos/${hook}/pages`;
  let data = {
    source: {
      branch: 'main',
      path: '/',
    },
  };
  data = JSON.stringify(data);

  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      statusCode(JSON.parse(xhr.responseText), xhr.status, name);
    }
  });

  stats = {};
  stats.version = chrome.runtime.getManifest().version;
  stats.submission = {};
  chrome.storage.local.set({ stats });

  xhr.open('POST', AUTHENTICATION_URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');

  xhr.send(data);
};

const getRepoDesc = (token, hook) => {
    const AUTHENTICATION_URL = `https://api.github.com/repos/${hook}`;
 
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState === 4) {
            const res = JSON.parse(xhr.responseText);

            if (xhr.status === 200) {
                console.log(res.description);
            }
        }
    });

    stats = {};
    stats.version = chrome.runtime.getManifest().version;
    stats.submission = {};
    chrome.storage.local.set({ stats });

    xhr.open('GET', AUTHENTICATION_URL, true);
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');

    xhr.send(null);
};

const getPublishUrl = (token, hook) => {
    return new Promise((resolve, reject ) => {
        const AUTHENTICATION_URL = `https://api.github.com/repos/${hook}/pages`;
 
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4) {
                const res = JSON.parse(xhr.responseText);

                if (xhr.status === 200) {
                    console.log(res.html_url);

                    resolve(res.html_url);
                }
            }
        });

        stats = {};
        stats.version = chrome.runtime.getManifest().version;
        stats.submission = {};
        chrome.storage.local.set({ stats });

        xhr.open('GET', AUTHENTICATION_URL, true);
        xhr.setRequestHeader('Authorization', `token ${token}`);
        xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');

        xhr.send(null);
    });
    
}

/* Status codes for linking of repo */
const linkStatusCode = (status, name) => {
  let bool = false;
  switch (status) {
    case 301:
      $('#success').hide();
      $('#error').html(`Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to BaekjoonHub. <br> This repository has been moved permenantly. Try creating a new one.`);
      $('#error').show();
      break;

    case 403:
      $('#success').hide();
      $('#error').html(`Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to BaekjoonHub. <br> Forbidden action. Please make sure you have the right access to this repository.`);
      $('#error').show();
      break;

    case 404:
      $('#success').hide();
      $('#error').html(`Error linking <a target="blank" href="${`https://github.com/${name}`}">${name}</a> to BaekjoonHub. <br> Resource not found. Make sure you enter the right repository name.`);
      $('#error').show();
      break;

    default:
      bool = true;
      break;
  }
  $('#unlink').show();
  return bool;
};

/* 
    Method for linking hook with an existing repository 
    Steps:
    1. Check if existing repository exists and the user has write access to it.
    2. Link Hook to it (chrome Storage).
*/
const linkRepo = (token, name) => {
  const AUTHENTICATION_URL = `https://api.github.com/repos/${name}`;

  const xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === 4) {
      const res = JSON.parse(xhr.responseText);
      const bool = linkStatusCode(xhr.status, name);
      
      if (xhr.status === 200) {
        // BUG FIX
        if (!bool) {
          // unable to gain access to repo in commit mode. Must switch to hook mode.
          /* Set mode type to hook */
          chrome.storage.local.set({ mode_type: 'hook' }, () => {
            console.log(`Error linking ${name} to BaekjoonHub`);
          });
          /* Set Repo Hook to NONE */
          chrome.storage.local.set({ BaekjoonHub_hook: null }, () => {
            console.log('Defaulted repo hook to NONE');
          });

          /* Hide accordingly */
          document.getElementById('hook_mode').style.display = 'inherit';
          document.getElementById('commit_mode').style.display = 'none';
        } else {
          /* Change mode type to commit */
          /* Save repo url to chrome storage */
          chrome.storage.local.set({ mode_type: 'commit', repo: res.html_url }, () => {
            $('#error').hide();
            $('#success').html(`Successfully linked <a target="blank" href="${res.html_url}">${name}</a> to BaekjoonHub. Start <a href="https://www.acmicpc.net/">BOJ</a> now!`);
            $('#success').show();
            $('#unlink').show();
          });
          /* Set Repo Hook */

          stats = {};
          stats.version = chrome.runtime.getManifest().version;
          stats.submission = {};
          chrome.storage.local.set({ stats });

          chrome.storage.local.set({ BaekjoonHub_hook: res.full_name }, () => {
            console.log('Successfully set new repo hook');
            /* Get problems solved count */
            chrome.storage.local.get('stats', (psolved) => {
              const { stats } = psolved;
            });
          });
          /* Hide accordingly */
          document.getElementById('hook_mode').style.display = 'none';
          document.getElementById('commit_mode').style.display = 'inherit';
        }
      }
    }
  });

  xhr.open('GET', AUTHENTICATION_URL, true);
  xhr.setRequestHeader('Authorization', `token ${token}`);
  xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
  xhr.send();
};

const unlinkRepo = () => {
  /* Set mode type to hook */
  chrome.storage.local.set({ mode_type: 'hook' }, () => {
    console.log(`Unlinking repo`);
  });
  /* Set Repo Hook to NONE */
  chrome.storage.local.set({ BaekjoonHub_hook: null }, () => {
    console.log('Defaulted repo hook to NONE');
  });

  /* Hide accordingly */
  document.getElementById('hook_mode').style.display = 'inherit';
  document.getElementById('commit_mode').style.display = 'none';
};


/* repository list 받아오기  */

//pinned 기준 repository
async function getPinnedRepoList(name){
    return new Promise((resolve, reject) => {
    const AUTHENTICATION_URL = `https://github.com/${name}`;

    let xmlHttp = new XMLHttpRequest();
    let githubMainDocument;
    let pinnedList = [];

    xmlHttp.onreadystatechange = function () {
    if (this.readyState === xmlHttp.DONE) {
        if (this.status === 200) {
        this.onload = () => {
            githubMainDocument = this.responseXML;

            if (githubMainDocument.querySelector('div.js-pinned-items-reorder-container')){
                let tds = githubMainDocument.querySelectorAll('span.repo');
                pinnedList = Array.prototype.map.call(tds, function(t) { return t.textContent.trim(); });
                resolve(pinnedList);
            }
            else resolve(pinnedList);
        
          }
        } else {
        // handle errors
            console.log("error: ", this.status);
        }
    }
    };
        xmlHttp.open( "GET", AUTHENTICATION_URL);
        xmlHttp.responseType = "document";
        xmlHttp.send(null);
    });
}

//last commit 기준 repository 

async function getCommitRepoList(name, commitListLength, pinnedList){ 
    return new Promise((resolve, reject) => {
    const AUTHENTICATION_URL = `https://github.com/${name}?tab=repositories`;

    let xmlHttp = new XMLHttpRequest();
    let githubDocument;
    let repoList;

    xmlHttp.onreadystatechange = function () {
    if (this.readyState === xmlHttp.DONE) {
        if (this.status === 200) {
        this.onload = () => {
            githubDocument = this.responseXML;
            let tds = githubDocument.querySelectorAll('h3.wb-break-all > a');
            repoList = Array.prototype.map.call(tds, function(t) { return t.textContent.trim(); });

            if(commitListLength > 0) pinnedList.forEach(pinnedElement => {
                repoList = repoList.filter((item) => item != pinnedElement);
            });
            //console.log(repoList.slice(0, commitListLength));
            resolve(repoList.slice(0, commitListLength));
          }
        } else {
        // handle errors
            console.log("error: ", this.status);
        }
    }
    };
        xmlHttp.open( "GET", AUTHENTICATION_URL);
        xmlHttp.responseType = "document";
        xmlHttp.send(null);
    });
};

//repository 별로 description 값 전달
async function getReposDesc(username, repoList){
    let token = await getToken();
    return new Promise( async (resolve, reject) => {

    let totalRepoInfo = [];
    

    repoList.forEach((repoName, index) => {
        const AUTHENTICATION_URL = `https://api.github.com/repos/${username}/${repoName}`;
        const xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4) {
                const res = JSON.parse(xhr.responseText);
    
                if (xhr.status === 200) {
                    console.log(res.description);
                    let repoInfo = {};
                    repoInfo["reponame"] = repoName;
                    repoInfo["desc"] = res.description;
                    totalRepoInfo.push(repoInfo);
                }
            }
        });

        stats = {};
        stats.version = chrome.runtime.getManifest().version;
        stats.submission = {};
        chrome.storage.local.set({ stats });

        xhr.open( "GET", AUTHENTICATION_URL, true);
        xhr.setRequestHeader('Authorization', `token ${token}`);
        xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
        xhr.send(null);
    });

    resolve(totalRepoInfo);
    });

}


/* Check for value of select tag, Get Started disabled by default */

$('#type').on('change', function () {
  const valueSelected = this.value;
  if (valueSelected) {
    $('#hook_button').attr('disabled', false);
  } else {
    $('#hook_button').attr('disabled', true);
  }
});

$('#hook_button').on('click', async () => {
  /* on click should generate: 1) option 2) repository name */
  if (!option()) {
    $('#error').text('No option selected - Pick an option from dropdown menu below that best suits you!');
    $('#error').show();
  } else if (!repositoryName()) {
    $('#error').text('No repository name added - Enter the name of your repository!');
    $('#name').focus();
    $('#error').show();
  } else {
    $('#error').hide();
    $('#success').text('Attempting to create Hook... Please wait.');
    $('#success').show();

    /* 
      Perform processing
      - step 1: Check if current stage === hook.
      - step 2: store repo name as repoName in chrome storage.
      - step 3: if (1), POST request to repoName (iff option = create new repo) ; else display error message.
      - step 4: if proceed from 3, hide hook_mode and display commit_mode (show stats e.g: files pushed/questions-solved/leaderboard)
    */
    chrome.storage.local.get('BaekjoonHub_token', (data) => {
      const token = data.BaekjoonHub_token;
      if (token === null || token === undefined) {
        /* Not authorized yet. */
        $('#error').text('Authorization error - Grant BaekjoonHub access to your GitHub account to continue (launch extension to proceed)');
        $('#error').show();
        $('#success').hide();
      } else if (option() === 'new') {
        createRepo(token, repositoryName());
      } else {
        chrome.storage.local.get('BaekjoonHub_username', (data2) => {
          const username = data2.BaekjoonHub_username;
          if (!username) {
            /* Improper authorization. */
            $('#error').text('Improper Authorization error - Grant BaekjoonHub access to your GitHub account to continue (launch extension to proceed)');
            $('#error').show();
            $('#success').hide();
          } else {
            linkRepo(token, `${username}/${repositoryName()}`, false);
          }
        });
      }
    });

    
  }
});

$("#fileupload").on("click", async () => {
    let htmlcode;
    let token = await getToken();
    let hook = await getHook();
    let username = hook.split("/")[0];
    let pinnedList = await getPinnedRepoList(username);
    let commitListLength = 5 - pinnedList.length;
    let commitList = await getCommitRepoList(username, commitListLength, pinnedList);
    let repoNameList = pinnedList.concat(commitList);

    console.log(repoNameList);
    const repoInfo = await getReposDesc(username, repoNameList); 

    console.log(repoInfo.length);



    

    let readme = "readme data";
    let dir = "src";
    let cm = "test1";
    let cb = function(){console.log("hi")};
    console.log(token, hook); //hook: username/linked repository

    //await upload(token, hook, htmlcode, readme, dir, "index.html", cm, cb);
    //await upload(token, hook, getCSS(), readme, dir, "style.css", cm, cb);
    //alert("Success to create your profile repo.");
});

$("#deploy").on("click", async () => {
    let token = await getToken();
    let hook = await getHook();
    let code = "<html><head></head></html>";
    let readme = "readme data";
    let dir = "src";
    let fname = "index.html";
    let cm = "test1";
    let cb = function(){console.log("hi")};
    publishRepo(token, hook);

    $(this).css("color", "green");
});

$('#unlink a').on('click', () => {
  unlinkRepo();
  $('#unlink').hide();
  $('#success').text('Successfully unlinked your current git repo. Please create/link a new hook.');
});

$("#geturl").on("click", async () => {
    let token = await getToken();
    let hook = await getHook();
    let code = "<html><head></head></html>";
    let readme = "readme data";
    let dir = "src";
    let fname = "index.html";
    let cm = "test1";
    let cb = function(){console.log("hi")};
    let url = await getPublishUrl(token, hook);

    console.log(url);
    $("#display_url").text(url);
    $("#display_url").attr("href", url);
});


/* Detect mode type */
chrome.storage.local.get('mode_type', (data) => {
  const mode = data.mode_type;

  if (mode && mode === 'commit') {
    /* Check if still access to repo */
    chrome.storage.local.get('BaekjoonHub_token', (data2) => {
      const token = data2.BaekjoonHub_token;
      if (token === null || token === undefined) {
        /* Not authorized yet. */
        $('#error').text('Authorization error - Grant BaekjoonHub access to your GitHub account to continue (click BaekjoonHub extension on the top right to proceed)');
        $('#error').show();
        $('#success').hide();
        /* Hide accordingly */
        document.getElementById('hook_mode').style.display = 'inherit';
        document.getElementById('commit_mode').style.display = 'none';
      } else {
        /* Get access to repo */
        chrome.storage.local.get('BaekjoonHub_hook', (repoName) => {
          const hook = repoName.BaekjoonHub_hook;
          if (!hook) {
            /* Not authorized yet. */
            $('#error').text('Improper Authorization error - Grant BaekjoonHub access to your GitHub account to continue (click BaekjoonHub extension on the top right to proceed)');
            $('#error').show();
            $('#success').hide();
            /* Hide accordingly */
            document.getElementById('hook_mode').style.display = 'inherit';
            document.getElementById('commit_mode').style.display = 'none';
          } else {
            /* Username exists, at least in storage. Confirm this */
            linkRepo(token, hook);
          }
        });
      }
    });

    document.getElementById('hook_mode').style.display = 'none';
    document.getElementById('commit_mode').style.display = 'inherit';
  } else {
    document.getElementById('hook_mode').style.display = 'inherit';
    document.getElementById('commit_mode').style.display = 'none';
  }
});

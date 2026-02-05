let accessToken="";
window.handleCredentialResponse=handleCredentialResponse;

function handleCredentialResponse(){
  const tokenClient=google.accounts.oauth2.initTokenClient({
    client_id:"840290523953-u9jdtr6m7hqqebogn50iit029qpuc868.apps.googleusercontent.com",
    scope:"https://www.googleapis.com/auth/drive.file",
    callback:(t)=>{
      accessToken=t.access_token;
      document.getElementById("loginDiv").style.display="none";
      document.getElementById("wallet").style.display="block";
      loadCards();
      loadFiles();
    }
  });
  tokenClient.requestAccessToken();
}

// ---------- FOLDER ----------
async function getFolderId(){
  const r=await fetch("https://www.googleapis.com/drive/v3/files?q=name='AI Vault' and mimeType='application/vnd.google-apps.folder'",
  {headers:{Authorization:"Bearer "+accessToken}});
  const d=await r.json();
  if(d.files.length) return d.files[0].id;

  const f=await fetch("https://www.googleapis.com/drive/v3/files",{
    method:"POST",
    headers:{
      Authorization:"Bearer "+accessToken,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({name:"AI Vault",mimeType:"application/vnd.google-apps.folder"})
  });
  return (await f.json()).id;
}

// ---------- UPLOAD + LIST FILES ----------
async function uploadDoc(){
  const file=document.getElementById("fileInput").files[0];
  const folderId=await getFolderId();

  const meta={name:file.name,parents:[folderId]};
  const form=new FormData();
  form.append("metadata",new Blob([JSON.stringify(meta)],{type:"application/json"}));
  form.append("file",file);

  await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {method:"POST",headers:{Authorization:"Bearer "+accessToken},body:form});

  loadFiles();
}

async function loadFiles(){
  const folderId=await getFolderId();
  const r=await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents`,
    {headers:{Authorization:"Bearer "+accessToken}}
  );
  const data=await r.json();
  const list=document.getElementById("fileList");
  list.innerHTML="";

  data.files.forEach(f=>{
    list.innerHTML+=`<div class="file-item" onclick="openFile('${f.id}')">${f.name}</div>`;
  });
}

async function openFile(id){
  const res=await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    {headers:{Authorization:"Bearer "+accessToken}}
  );
  const blob=await res.blob();
  const url=URL.createObjectURL(blob);

  const viewer=document.getElementById("viewerContent");
  if(blob.type.includes("pdf"))
    viewer.innerHTML=`<iframe src="${url}" width="100%" height="100%"></iframe>`;
  else if(blob.type.includes("image"))
    viewer.innerHTML=`<img src="${url}" style="width:100%">`;
  else
    viewer.innerHTML=`<iframe src="${url}" width="100%" height="100%"></iframe>`;

  document.getElementById("viewerModal").style.display="flex";
}

// ---------- CARDS ----------
async function getCardsId(){
  const r=await fetch("https://www.googleapis.com/drive/v3/files?q=name='cards.json'",
  {headers:{Authorization:"Bearer "+accessToken}});
  const d=await r.json();
  return d.files.length?d.files[0].id:null;
}

async function loadCards(){
  const id=await getCardsId();
  if(!id) return;

  const r=await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    {headers:{Authorization:"Bearer "+accessToken}}
  );
  const cards=await r.json();

  const stack=document.getElementById("cardStack");
  stack.innerHTML="";
  cards.forEach(c=>{
    stack.innerHTML+=`<div class="wallet-card"><h3>${c.title}</h3><p>${c.number}</p></div>`;
  });
}

let accessToken="";
window.handleCredentialResponse=handleCredentialResponse;

function handleCredentialResponse(){
  const t=google.accounts.oauth2.initTokenClient({
    client_id:"840290523953-u9jdtr6m7hqqebogn50iit029qpuc868.apps.googleusercontent.com",
    scope:"https://www.googleapis.com/auth/drive.file",
    callback:r=>{
      accessToken=r.access_token;
      loginDiv.style.display="none";
      app.style.display="block";
      loadAll();
    }
  });
  t.requestAccessToken();
}

// ---------- Folder ----------
async function getFolder(){
  const r=await fetch(
    "https://www.googleapis.com/drive/v3/files?q=name='AI Vault' and mimeType='application/vnd.google-apps.folder'&fields=files(id)",
    {headers:{Authorization:"Bearer "+accessToken}});
  const d=await r.json();
  if(d.files.length) return d.files[0].id;

  const f=await fetch("https://www.googleapis.com/drive/v3/files",{
    method:"POST",
    headers:{Authorization:"Bearer "+accessToken,"Content-Type":"application/json"},
    body:JSON.stringify({name:"AI Vault",mimeType:"application/vnd.google-apps.folder"})
  });
  return (await f.json()).id;
}

// ---------- Upload ----------
async function uploadFile(){
  const file=fileInput.files[0];
  const folder=await getFolder();

  const meta={name:file.name,parents:[folder]};
  const form=new FormData();
  form.append("metadata",new Blob([JSON.stringify(meta)],{type:"application/json"}));
  form.append("file",file);

  await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {method:"POST",headers:{Authorization:"Bearer "+accessToken},body:form});

  loadAll();
}

// ---------- Load ----------
async function loadAll(){
  const folder=await getFolder();
  const r=await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folder}'+in+parents&fields=files(id,name,mimeType)`,
    {headers:{Authorization:"Bearer "+accessToken}});
  const data=await r.json();

  docs.innerHTML="";
  data.files.forEach(f=>{
    if(f.name.endsWith(".json")){
      loadCardsFromFile(f.id);
    }else{
      docs.innerHTML+=`
        <div class="doc">
          <span>${f.name}</span>
          <div>
            <button class="btn" onclick="openFile('${f.id}')">Open</button>
            <button class="btn-danger" onclick="deleteFile('${f.id}')">Delete</button>
          </div>
        </div>`;
    }
  });
}

// ---------- Viewer ----------
async function openFile(id){
  const r=await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    {headers:{Authorization:"Bearer "+accessToken}});
  const blob=await r.blob();
  const url=URL.createObjectURL(blob);

  viewer.innerHTML=blob.type.includes("image")
    ? `<img src="${url}">`
    : `<iframe src="${url}"></iframe>`;

  viewer.style.display="block";
}

// ---------- Delete ----------
async function deleteFile(id){
  await fetch(`https://www.googleapis.com/drive/v3/files/${id}`,
    {method:"DELETE",headers:{Authorization:"Bearer "+accessToken}});
  loadAll();
}

// ---------- Cards ----------
function addCard(){
  const title=prompt("Card name");
  const number=prompt("Card number");
  saveCard(title,number);
}

async function loadCardsFromFile(id){
  const r=await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    {headers:{Authorization:"Bearer "+accessToken}});
  const cardsData=await r.json();

  cards.innerHTML="";
  cardsData.forEach(c=>{
    cards.innerHTML+=`
      <div class="card">
        <div>${c.title}</div>
        <div>${c.number}</div>
      </div>`;
  });
}

const CLIENT_ID = "YOUR_CLIENT_ID";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

gapi.load("client:auth2", initClient);

function initClient() {
  gapi.client.init({
    clientId: CLIENT_ID,
    scope: SCOPES,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  }).then(() => {
    document.getElementById("loginBtn").onclick = handleAuth;
  });
}

function handleAuth() {
  gapi.auth2.getAuthInstance().signIn().then(() => {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("dashboard").style.display = "flex";
  });
}

async function uploadDoc() {
  const file = document.getElementById("fileInput").files[0];
  await uploadToDrive(file);
  alert("Document uploaded!");
}

async function saveCard() {
  const data = {
    name: document.getElementById("cardName").value,
    number: document.getElementById("cardNumber").value,
  };

  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const file = new File([blob], "card.json");

  await uploadToDrive(file);
  alert("Card saved!");
}

async function uploadToDrive(file) {
  const accessToken = gapi.auth.getToken().access_token;

  const metadata = { name: file.name };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({ Authorization: "Bearer " + accessToken }),
    body: form,
  });
}

function calcEMI() {
  const p = parseFloat(document.getElementById("p").value);
  const r = parseFloat(document.getElementById("r").value) / (12 * 100);
  const n = parseFloat(document.getElementById("n").value);

  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  document.getElementById("emiResult").innerText = "EMI: ₹ " + emi.toFixed(2);
}

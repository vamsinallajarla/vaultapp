let accessToken = "";

function handleCredentialResponse(response) {
  // After user signs in, request Drive permission
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: "840290523953-u9jdtr6m7hqqebogn50iit029qpuc868.apps.googleusercontent.com",
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: (tokenResponse) => {
      accessToken = tokenResponse.access_token;

      // Show dashboard after token received
      document.getElementById("loginDiv").style.display = "none";
      document.getElementById("dashboard").style.display = "block";
    },
  });

  tokenClient.requestAccessToken();
}

async function uploadDoc() {
  if (!accessToken) {
    alert("Login first");
    return;
  }

  const file = document.getElementById("fileInput").files[0];

  const metadata = { name: file.name };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", file);

  await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: new Headers({ Authorization: "Bearer " + accessToken }),
    body: form,
  });

  alert("Uploaded to Drive!");
}

function calcEMI() {
  const p = parseFloat(document.getElementById("p").value);
  const r = parseFloat(document.getElementById("r").value) / (12 * 100);
  const n = parseFloat(document.getElementById("n").value);

  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  document.getElementById("emiResult").innerText = "EMI: ₹ " + emi.toFixed(2);
}

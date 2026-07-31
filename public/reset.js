const params = new URLSearchParams(window.location.search);

const token = params.get("token");

document.getElementById("resetButton").addEventListener("click", async () => {
  const password = document.getElementById("password").value;

  const confirm = document.getElementById("confirmPassword").value;

  const status = document.getElementById("status");

  if (password.length < 6) {
    status.innerText = "Password must be at least 6 characters long.";
    return;
  }

  if (password !== confirm) {
    status.innerText = "Passwords do not match.";
    return;
  }

  const res = await fetch("/api/reset-password", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      token,
      password,
    }),
  });

  const json = await res.json();

  status.innerText = json.message;
});

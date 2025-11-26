document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const status = document.getElementById("status");
  status.textContent = "Sending...";

  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  try {
    const response = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      status.textContent = "Message sent successfully!";
      document.getElementById("contactForm").reset();
    } else {
      status.textContent = "Failed to send. Error: " + result.error;
    }
  } catch (err) {
    console.error(err);
    status.textContent = "Something went wrong!";
  }
});

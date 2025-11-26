// Sanitize input to prevent HTML injection
function sanitize(input) {
  return input.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

// Generate a simple nonce for demo purposes
document.getElementById("nonce").value = Math.random().toString(36).substring(2, 15);

document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const status = document.getElementById("status");
  status.textContent = "Sending...";

  const meetingRadio = document.querySelector('input[name="meeting"]:checked');
  const meetingValue = meetingRadio ? meetingRadio.value : "";

  // Basic client-side validation
  const email = document.getElementById("email").value.trim();
  const comment = document.getElementById("comment").value.trim();

  if (!meetingValue) {
    status.textContent = "Please select a meeting.";
    return;
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    status.textContent = "Please enter a valid email address.";
    return;
  }
  if (!comment || comment.length > 1000) {
    status.textContent = "Comment must be between 1 and 1000 characters.";
    return;
  }

  const data = {
    nonce: document.getElementById("nonce").value,
    firstName: sanitize(document.getElementById("firstName").value),
    lastName: sanitize(document.getElementById("lastName").value),
    email: sanitize(email),
    address: sanitize(document.getElementById("address").value),
    city: sanitize(document.getElementById("city").value),
    state: sanitize(document.getElementById("state").value),
    zip: sanitize(document.getElementById("zip").value),
    meeting: sanitize(meetingValue),
    item: sanitize(document.getElementById("item").value),
    comment: sanitize(comment),
  };

  try {
    const response = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      status.textContent = "Comment submitted successfully!";
      document.getElementById("contactForm").reset();
      document.getElementById("nonce").value = Math.random().toString(36).substring(2, 15);
    } else {
      status.textContent = "Failed to send. Error: " + result.error;
    }
  } catch (err) {
    console.error(err);
    status.textContent = "Something went wrong!";
  }
});

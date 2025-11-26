// List of all questions
const questions = [
  "q1","q2","q3","q4","q5","q6","q7","q8","q9","q10","q11","q12","q13",
  "q14","q15","q16","q17","q18","q19","q20","q21"
];

// Generate 1-10 radio buttons dynamically
questions.forEach(qid => {
  const container = document.querySelector(`#${qid} .radio-group`);
  for (let i = 1; i <= 10; i++) {
    const label = document.createElement("label");
    label.className = "number-button";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = qid;
    radio.value = i;
    label.appendChild(radio);
    label.appendChild(document.createTextNode(i));
    container.appendChild(label);

    // Add click listener to handle color change
    radio.addEventListener("change", () => {
      // Remove active class from all buttons in this group
      container.querySelectorAll(".number-button").forEach(btn => btn.classList.remove("active"));
      // Add active class to the selected button
      if (radio.checked) label.classList.add("active");
    });
  }
});

// Step management
let currentStep = 0;
const steps = document.querySelectorAll(".step");

function showStep(index) {
  steps.forEach((step, i) => step.classList.toggle("active", i === index));
}

function nextStep() {
  if (!validateStep()) return;
  if (currentStep < steps.length - 1) {
    currentStep++;
    showStep(currentStep);
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
}

// Validate required fields
function validateStep() {
  const activeStep = steps[currentStep];
  const groups = activeStep.querySelectorAll(".radio-group");
  for (const group of groups) {
    const checked = group.querySelector('input[type="radio"]:checked');
    if (!checked) {
      document.getElementById("status").textContent = "Please answer all questions in this step.";
      return false;
    }
  }
  document.getElementById("status").textContent = "";
  return true;
}

// Sanitize input
function sanitize(input) {
  return input.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Form submit
document.getElementById("commentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = { nonce: Math.random().toString(36).substring(2,15) };
  questions.forEach(qid => {
    const selected = document.querySelector(`input[name="${qid}"]:checked`);
    data[qid] = selected ? sanitize(selected.value) : "";
  });
  data.comment = sanitize(document.getElementById("finalComment").value.trim());

  const status = document.getElementById("status");
  status.textContent = "Sending...";

  try {
    const res = await fetch("/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      status.textContent = "Form submitted successfully!";
      document.getElementById("commentForm").reset();
      currentStep = 0;
      showStep(currentStep);
      // Remove all active states
      document.querySelectorAll(".number-button").forEach(btn => btn.classList.remove("active"));
    } else {
      status.textContent = "Failed to send. Error: " + result.error;
    }
  } catch(err) {
    console.error(err);
    status.textContent = "Something went wrong!";
  }
});

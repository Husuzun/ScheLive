// signup.js
$(document).ready(function () {
  // Show the signup modal on button click
  $("#signupBtn").click(function () {
    $("#signupModal").modal("show");
  });

  // Handle signup form submission
  $("#signupForm").submit(function (event) {
    event.preventDefault();

    // Gather form data
    const name = $("#signupName").val();
    const email = $("#signupEmail").val();
    const password = $("#signupPassword").val();

    // Send the signup data to the server (update the URL here)
    $.ajax({
      type: "POST",
      url: "http://localhost:3000/signup", // Update the URL to point to your backend
      data: JSON.stringify({ name, email, password }),
      contentType: "application/json",
      success: function (response) {
        alert("Signup successful!");
        $("#signupModal").modal("hide");
        window.location.href = "/front";
      },
      error: function (error) {
        alert("Signup failed: " + error.responseText);
      },
    });
  });

  // Handle Google signup button click
  $("#googleSignupBtn").click(function () {
    window.location.href = "http://localhost:3000/auth/google"; // Update URL for Google auth
  });
});

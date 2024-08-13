// login.js
$(document).ready(function () {
  // Show the login modal on button click
  $("#loginBtn").click(function () {
    $("#loginModal").modal("show");
  });

  // Handle login form submission
  $("#loginForm").submit(function (event) {
    event.preventDefault();

    // Gather form data
    const email = $("#loginEmail").val();
    const password = $("#loginPassword").val();

    // Clear previous error messages
    $("#loginError").text("");

    // Send the login data to the server
    $.ajax({
      type: "POST",
      url: "http://localhost:3000/login", // The login route on the backend
      data: JSON.stringify({ email, password }),
      contentType: "application/json",
      success: function (response) {
        console.log("Login successful response:", response); //
        $("#loginModal").modal("hide");

        localStorage.setItem("accessToken", response.accessToken);
        window.location.href = "/front";
      },
      error: function (xhr, status, error) {
        // Display error message in the modal
        let errorMessage = "Login failed. Please check your credentials.";
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        }
        $("#loginError").text(errorMessage).css("color", "red");
      },
    });
  });

  // Handle Google login button click
  $("#googleLoginBtn").click(function () {
    window.location.href = "http://localhost:3000/auth/google"; // Google OAuth login route
  });
});

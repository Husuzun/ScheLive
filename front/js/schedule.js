$(document).ready(function () {
  $.ajaxSetup({
    xhrFields: {
      withCredentials: true,
    },
  });
  // Check if the user is authenticated
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/test-auth",
    xhrFields: {
      withCredentials: true,
    },
    success: function (response) {
      console.log("Authentication test response:", response);
    },
    error: function (error) {
      console.log("Authentication test failed:", error.responseText);
    },
  });

  function generateTimeSlots() {
    // Generate time slots for the day (e.g., 8 AM to 12 PM)
    const startHour = 8;
    const endHour = 12;
    const scheduleBody = document.getElementById("scheduleBody");

    for (let hour = startHour; hour <= endHour; hour++) {
      const time = hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
      const row = document.createElement("tr");
      row.innerHTML = `
                <td style="color: white">${time}</td>
                <td class="schedule-cell" style="color: white" data-time="${time}">Click to add task</td>
            `;
      scheduleBody.appendChild(row);
    }

    // Handle cell click to open modal
    $(document).on("click", ".schedule-cell", function () {
      const time = $(this).data("time");
      $("#taskTime").val(time);
      $("#taskModal").modal("show");
    });
  }

  function loadTasks() {
    // Load existing tasks
    $.ajax({
      type: "GET",
      url: "http://localhost:3000/getTasks",
      xhrFields: {
        withCredentials: true,
      },
      success: function (tasks) {
        tasks.forEach((task) => {
          $(`td[data-time='${task.time}']`).text(task.task);
        });
      },
      error: function (error) {
        console.log("Error loading tasks: " + error.responseText);
      },
    });
  }

  // Handle saving task
  $("#saveTaskBtn").click(function () {
    const time = $("#taskTime").val();
    const task = $("#taskInput").val();

    // Send task to the server
    $.ajax({
      type: "POST",
      url: "http://localhost:3000/addTask",
      data: JSON.stringify({ time, task }),
      contentType: "application/json",
      xhrFields: {
        withCredentials: true,
      },
      success: function (tasks) {
        $(`td[data-time='${time}']`).text(task);
        $("#taskModal").modal("hide");
      },
      error: function (error) {
        alert("Error adding task: " + error.responseText);
      },
    });
  });
});

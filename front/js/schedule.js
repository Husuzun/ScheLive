/*$(document).ready(function () {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("You need to log in first.");
    return;
  }

  generateTimeSlots();
  loadTasks();

  // Create draggable time circles
  createDraggableTimes();

  // Function to generate time slots in the table
  function generateTimeSlots() {
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

  // Function to load existing tasks
  function loadTasks() {
    $.ajax({
      type: "GET",
      url: "http://localhost:3000/getTasks",
      headers: {
        Authorization: `Bearer ${token}`,
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

  // Function to handle saving task
  $("#saveTaskBtn").click(function () {
    const time = $("#taskTime").val();
    const task = $("#taskInput").val();

    // Send task to the server
    $.ajax({
      type: "POST",
      url: "http://localhost:3000/addTask",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({ time, task }),
      contentType: "application/json",
      success: function () {
        $(`td[data-time='${time}']`).text(task);
        $("#taskModal").modal("hide");
      },
      error: function (error) {
        alert("Error adding task: " + error.responseText);
      },
    });
  });

  // Function to create draggable time circles
  function createDraggableTimes() {
    const timeContainer = $("#timeContainer");
    const times = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM"];

    times.forEach((time) => {
      const timeCircle = $(
        `<div class="time-draggable" data-time="${time}">${time}</div>`
      );
      timeContainer.append(timeCircle);
    });

    // Make the time elements draggable
    $(".time-draggable").draggable({
      revert: "invalid",
    });
  }
});
*/
$(document).ready(function () {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("You need to log in first.");
    return;
  }

  loadTasks();

  // Create draggable time circles
  createDraggableTimes();

  // Function to load existing tasks and sort them by time
  function loadTasks() {
    $.ajax({
      type: "GET",
      url: "http://localhost:3000/getTasks",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (tasks) {
        // Sort tasks by time
        tasks.sort(compareTimes);
        tasks.forEach((task) => {
          // Ensure the time slot exists before adding the task
          if (!$(`td[data-time='${task.time}']`).length) {
            createTimeSlot(task.time);
          }
          // Update the cell with the task text
          $(`td[data-time='${task.time}']`).text(task.task);
        });
        // Sort the table after loading all tasks
        sortTable();
      },
      error: function (error) {
        console.log("Error loading tasks: " + error.responseText);
      },
    });
  }

  // Function to handle saving task and sort the table afterward
  $("#saveTaskBtn").click(function () {
    const time = $("#taskTime").val();
    const task = $("#taskInput").val();

    // Send task to the server
    $.ajax({
      type: "POST",
      url: "http://localhost:3000/addTask",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({ time, task }),
      contentType: "application/json",
      success: function () {
        // Ensure the time slot exists before adding the task
        if (!$(`td[data-time='${time}']`).length) {
          createTimeSlot(time);
        }
        // Update the cell with the task text after saving
        $(`td[data-time='${time}']`).text(task);
        $("#taskModal").modal("hide");

        // Sort the table after adding the task
        sortTable();
      },
      error: function (error) {
        alert("Error adding task: " + error.responseText);
      },
    });
  });

  // Function to create draggable time circles
  function createDraggableTimes() {
    const timeContainer = $("#timeContainer");
    const times = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM"];

    times.forEach((time) => {
      const timeCircle = $(
        `<div class="time-draggable" data-time="${time}">${time}</div>`
      );
      timeContainer.append(timeCircle);
    });

    // Make the time elements draggable
    $(".time-draggable").draggable({
      revert: "invalid",
      start: function () {
        $(this).addClass("dragging");
      },
      stop: function () {
        $(this).removeClass("dragging");
      },
    });

    // Make the schedule table droppable with cool effects
    $(".schedule-table").droppable({
      accept: ".time-draggable",
      over: function () {
        $(this).addClass("drop-hover");
      },
      out: function () {
        $(this).removeClass("drop-hover");
      },
      drop: function (event, ui) {
        $(this).removeClass("drop-hover");
        const time = $(ui.draggable).data("time");
        if (!$(`td[data-time='${time}']`).length) {
          createTimeSlot(time);
        }
        $(ui.draggable).draggable("option", "revert", true);

        // Sort the table after adding the task
        sortTable();
      },
    });
  }

  // Function to create a time slot in the schedule with styled time
  function createTimeSlot(time) {
    const scheduleBody = document.getElementById("scheduleBody");
    const row = document.createElement("tr");
    row.style.display = "none"; // Start hidden for animation
    row.innerHTML = `
      <td class="time-slot-cell" style="color: white">
        <div class="time-slot" style="background-color: #ffeb3b; color: #000; border-radius: 50%; padding: 10px 20px; display: inline-block;">${time}</div>
      </td>
      <td class="schedule-cell" style="color: white" data-time="${time}">Click to add task</td>
    `;
    scheduleBody.appendChild(row);

    // Reveal the row with a fade-in effect
    $(row).fadeIn(500);
  }

  // Use delegated event handling to ensure clicking on any `.schedule-cell` opens the modal
  $(document).on("click", ".schedule-cell", function () {
    const time = $(this).data("time");
    $("#taskTime").val(time);
    $("#taskModal").modal("show");
  });

  // Function to compare times for sorting
  function compareTimes(a, b) {
    const timeA = parseTime(a.time || a); // Support both task objects and time strings
    const timeB = parseTime(b.time || b);

    return timeA - timeB;
  }

  // Function to parse time strings into comparable numbers
  function parseTime(time) {
    const [hour, modifier] = time.split(" ");
    let [hours, minutes] = hour.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return hours * 60 + (minutes || 0); // Convert hours to minutes for comparison
  }

  // Function to sort the table rows based on time
  function sortTable() {
    const rows = $("#scheduleBody tr").get();

    rows.sort((a, b) => {
      const timeA = $(a).find(".time-slot").text().trim();
      const timeB = $(b).find(".time-slot").text().trim();
      return compareTimes(timeA, timeB);
    });

    // Append sorted rows back to the table body
    $.each(rows, function (index, row) {
      $("#scheduleBody").append(row);
    });
  }
});


const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const categoryInput = document.querySelector("#categoryInput");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");

const taskCount = document.querySelector("#taskCount");
const remainingText = document.querySelector("#remainingText");
const progressText = document.querySelector("#progressText");
const progressPercent = document.querySelector("#progressPercent");
const progressFill = document.querySelector("#progressFill");

const clearCompletedButton = document.querySelector("#clearCompleted");
const filterButtons = document.querySelectorAll(".filter-btn");
const todayLabel = document.querySelector("#todayLabel");

// Load saved tasks from the browser
let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("bloomTasks")) || [];
    if (!Array.isArray(tasks)) tasks = [];
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

// Show today's date
todayLabel.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
});

// Save tasks in browser storage
function saveTasks() {
    localStorage.setItem("bloomTasks", JSON.stringify(tasks));
}

// Add a new task
function addTask(event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        category: categoryInput.value,
        completed: false,
        createdAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        })
    };

    tasks.unshift(newTask);

    saveTasks();
    renderTasks();

    taskForm.reset();
    taskInput.focus();
}

// Mark a task complete or incomplete
function toggleTask(id) {
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// Delete an individual task
function deleteTask(id) {
    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });

    saveTasks();
    renderTasks();
}

// Remove all completed tasks
function clearCompleted() {
    tasks = tasks.filter(function(task) {
        return !task.completed;
    });

    saveTasks();
    renderTasks();
}

// Show tasks according to selected filter
function getVisibleTasks() {
    if (currentFilter === "active") {
        return tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        return tasks.filter(task => task.completed);
    }

    return tasks;
}

// Display all tasks on the page
function renderTasks() {
    const visibleTasks = getVisibleTasks();

    const completedCount = tasks.filter(
        task => task.completed
    ).length;

    const remainingCount = tasks.length - completedCount;

    const percent = tasks.length
        ? Math.round((completedCount / tasks.length) * 100)
        : 0;

    taskList.innerHTML = "";

    visibleTasks.forEach(function(task) {
        // Task card
        const item = document.createElement("article");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        // Complete button
        const checkButton = document.createElement("button");
        checkButton.className = "check-button";
        checkButton.type = "button";

        checkButton.setAttribute(
            "aria-label",
            task.completed
                ? "Mark task incomplete"
                : "Mark task complete"
        );

        checkButton.addEventListener("click", function() {
            toggleTask(task.id);
        });

        // Task information
        const main = document.createElement("div");
        main.className = "task-main";

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const category = document.createElement("span");
        category.className = "category-tag";
        category.dataset.category = task.category;
        category.textContent = task.category;

        const date = document.createElement("span");
        date.className = "task-date";
        date.textContent = "Added " + task.createdAt;

        meta.append(category, date);
        main.append(title, meta);

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.type = "button";
        deleteButton.textContent = "×";

        deleteButton.setAttribute(
            "aria-label",
            "Delete " + task.title
        );

        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

        // Add everything to the task card
        item.append(checkButton, main, deleteButton);
        taskList.appendChild(item);
    });

    // Show empty message when there are no visible tasks
    emptyState.style.display = visibleTasks.length ? "none" : "block";

    // Update task counters
    taskCount.textContent =
        tasks.length + (tasks.length === 1 ? " task" : " tasks");

    remainingText.textContent =
        remainingCount +
        (remainingCount === 1 ? " task left" : " tasks left");

    // Update progress bar
    progressPercent.textContent = percent + "%";
    progressFill.style.width = percent + "%";

    // Update welcome message
    if (tasks.length === 0) {
        progressText.textContent = "Your day is just beginning";
    } else if (percent === 100) {
        progressText.textContent = "Everything is done! ✨";
    } else if (completedCount > 0) {
        progressText.textContent =
            "You're doing lovely — " + completedCount + " done";
    } else {
        progressText.textContent = "Every little step counts";
    }
}

// Handle the add-task form
taskForm.addEventListener("submit", addTask);

// Handle clear-completed button
clearCompletedButton.addEventListener("click", clearCompleted);

// Handle All, To Do, and Completed filters
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function(btn) {
            btn.classList.toggle("active", btn === button);
        });

        renderTasks();
    });
});

// Display saved tasks when the website opens
renderTasks();

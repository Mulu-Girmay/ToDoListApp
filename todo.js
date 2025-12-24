let addButton = document.getElementById("add-button");
let inputTitle = document.getElementById("title-input");
let inputDescription = document.getElementById("description-input");
let inputCategory = document.getElementById("category-input");
let inputDate = document.getElementById("date-input");
let container = document.getElementById("todo-list");
let editForm = document.getElementById("edit-form");
let taskForm = document.getElementById("task-form");
let editTitle = document.getElementById("edit-title");
let editDescription = document.getElementById("edit-description");
let editCategory = document.getElementById("edit-category");
let editDate = document.getElementById("edit-date");
let editButton = document.getElementById("edit-button");
let toggle = document.getElementById("toggle");
let image = document.getElementById("image");
let cancelButton = document.getElementById("cancel-button");
let cancelBut = document.getElementById("taskform-cancel-button");
const searchInput = document.getElementById("search-input");
let addNewTask = document.getElementById("add");
let taskId = null;
let allTodos = [];
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  toggle.textContent = "Dark";
  image.textContent = "🌙";
}
toggle.addEventListener("click", (e) => {
  e.preventDefault();
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    toggle.textContent = "Dark";
    image.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  } else {
    toggle.textContent = "Light";
    image.textContent = "☀️";
    localStorage.setItem("theme", "light");
  }
});
addButton.addEventListener("click", async (e) => {
  e.preventDefault();
  let title = inputTitle.value.trim();
  let description = inputDescription.value.trim();
  let category = inputCategory.value.trim();
  let date = inputDate.value;
  if (!title || !description || !category || !date) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        date,
        completed: false,
      }),
    });
    if (!res.ok) throw new Error("Failed to add todo");
    inputTitle.value = "";
    inputDescription.value = "";
    inputCategory.value = "";
    inputDate.value = "";

    fetchingTodos();
  } catch (err) {
    console.log("error:", err);
  }
});

async function fetchingTodos() {
  try {
    const res = await fetch("http://localhost:3000/todos");
    if (!res.ok) {
      console.error(`Failed to fetch todos`);
      return;
    }
    allTodos = await res.json();
    renderTodos(allTodos);
  } catch (err) {
    console.error("Error fetching todos:", err);
  }
}
function renderTodos(todos) {
  container.innerHTML = "";
  if (todos.length === 0) {
    container.innerHTML = "<p>No tasks found</p>";
    return;
  }
  for (let i = 0; i < todos.length; i++) {
    let taskCart = document.createElement("div");
    taskCart.classList.add("taskCart");
    taskCart.dataset.id = todos[i].id;
    let todoId = taskCart.dataset.id;

    const leftContent = document.createElement("div");
    leftContent.classList.add("left-content");
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.checked = todos[i].completed;

    checkBox.addEventListener("change", async (e) => {
      e.preventDefault();
      const completed = checkBox.checked;
      if (completed) {
        toDoTitle.style.textDecoration = "line-through";
      } else {
        toDoTitle.style.textDecoration = "none";
      }
      try {
        const res = await fetch(`http://localhost:3000/todos/${todoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        });
        if (!res.ok) throw new Error("Update failed");
      } catch (err) {
        console.log(err);
      }
    });
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("info-div");
    const toDoTitle = document.createElement("h4");
    toDoTitle.textContent = todos[i].title;
    toDoTitle.classList.add("taskTitle");
    const toDoDesc = document.createElement("p");
    toDoDesc.textContent = todos[i].description;
    toDoDesc.classList.add("taskDesc");
    const metaDiv = document.createElement("div");
    metaDiv.classList.add("meta-div");
    metaDiv.innerHTML = `
  <span class="badge category">${todos[i].category}</span>
  <span class="badge date">${todos[i].date}</span>
`;
    infoDiv.append(toDoTitle, toDoDesc, metaDiv);
    leftContent.append(checkBox, infoDiv);
    const actions = document.createElement("div");
    actions.classList.add("actions");
    const editImg = document.createElement("img");
    editImg.src = "./Icons/edit.png";
    editImg.classList.add("editImg");

    const deleteImg = document.createElement("img");
    deleteImg.src = "./Icons/delete.png";
    deleteImg.classList.add("deleteImg");

    actions.append(editImg, deleteImg);
    taskCart.append(leftContent, actions);
    container.appendChild(taskCart);

    editImg.addEventListener("click", async (e) => {
      e.preventDefault();
      taskId = taskCart.dataset.id;
      editForm.style.display = "block";
      taskForm.style.display = "none";
      container.style.display = "none";
      searchInput.style.display = "none";
      editForm.dataset.id = todos[i].id;
      editTitle.value = todos[i].title;
      editDescription.value = todos[i].description;
      editCategory.value = todos[i].category;
      editDate.value = todos[i].date;
    });
    deleteImg.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!confirm("Are you sure you want to delete this task?")) return;
      let id = taskCart.dataset.id;
      let res = await fetch(`http://localhost:3000/todos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");
      fetchingTodos();
    });
  }
}

editButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const updatedTodo = {
    title: editTitle.value,
    description: editDescription.value,
    category: editCategory.value,
    date: editDate.value,
  };

  try {
    let res = await fetch(`http://localhost:3000/todos/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    });
    if (!res.ok) {
      console.log("Task is not edited");
    } else {
      editForm.style.display = "none";
      container.style.display = "block";
      fetchingTodos();
    }
  } catch (err) {
    alert("Error is happening");
    console.log("error:", err);
  }
});
addNewTask.addEventListener("click", (e) => {
  e.preventDefault();
  taskForm.style.display = "block";
  addNewTask.style.display = "none";
  container.style.display = "none";
  searchInput.style.display = "none";
});
cancelButton.addEventListener("click", (e) => {
  e.preventDefault;
  taskForm.style.display = "none";

  editForm.style.display = "none";
  taskForm.style.display = "block";
  container.style.display = "block";
});
cancelBut.addEventListener("click", (e) => {
  e.preventDefault();
  taskForm.style.display = "none";
  addNewTask.style.display = "block";
  container.style.display = "block";
  searchInput.style.display = "block";
});
searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase().trim();

  const filteredTodos = allTodos.filter((todo) => {
    return (
      todo.title.toLowerCase().includes(searchText) ||
      todo.description.toLowerCase().includes(searchText) ||
      todo.category.toLowerCase().includes(searchText) ||
      todo.date.includes(searchText)
    );
  });

  renderTodos(filteredTodos);
});

fetchingTodos();

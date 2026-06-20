let editId = null;
document.getElementById("eventForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first ❌");
    return;
  }
  const eventData = {
    eventName: document.getElementById("eventName").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    venue: document.getElementById("venue").value,
    category: document.getElementById("category").value,
    description: document.getElementById("description").value,
    capacity: document.getElementById("capacity").value,
    price: document.getElementById("price").value,
    image: document.getElementById("image").value
  };
  try {
    if (editId) {
      await fetch(`http://localhost:5000/update-event/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(eventData)
      });
      alert("Event Updated ✅");
      editId = null;
    } else {
      await fetch("http://localhost:5000/add-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(eventData)
      });

      alert("Event Added ✅");
    }
    document.getElementById("eventForm").reset();
    getEvents();
    loadCategories();
  } catch (error) {
    console.log(error);
  }
});
async function getEvents() {
  try {
    const res = await fetch("http://localhost:5000/events");
    const events = await res.json();
    const searchValue = document.getElementById("search").value.toLowerCase();
    const selectedCategory = document.getElementById("filterCategory").value;
    const eventList = document.getElementById("eventList");
    eventList.innerHTML = "";
    events
      .filter(event => {
        const matchSearch = event.eventName.toLowerCase().includes(searchValue);
        const matchCategory = selectedCategory === "" || event.category === selectedCategory;
        return matchSearch && matchCategory;
      })
      .forEach(event => {
        const seatsLeft = event.capacity - (event.registeredUsers?.length || 0);

        const shortDesc = event.description 
          ? event.description.substring(0, 80) + "..." 
          : "No Description";
        const div = document.createElement("div");
        div.classList.add("card");
        div.innerHTML = `
          <img src="${event.image || 'https://via.placeholder.com/300'}" />
          <div class="card-content">
            <h3>${event.eventName}</h3>
            <p>${new Date(event.date).toDateString()} | ${event.time}</p>
            <p>${event.venue}</p>
            <p>${event.category}</p>

            <p id="desc-${event._id}">
              ${shortDesc}
              ${
                event.description
                  ? `<span style="color:blue; cursor:pointer;" onclick="toggleDesc('${event._id}', \`${event.description}\`)">Read More</span>`
                  : ""
              }
            </p>
<div style="margin-top:auto;">
  <p class="price">₹${event.price}</p>
  <p>Seats Left: <b>${seatsLeft}</b></p>

  <div class="btn-group">
    <button onclick='editEvent(${JSON.stringify(event)})'>Edit</button>

    <button class="delete-btn"
      onclick="deleteEvent('${event._id}')">
      Delete
    </button>

    <button ${seatsLeft <= 0 ? "disabled" : ""}
      onclick="registerEvent('${event._id}')">
      ${seatsLeft <= 0 ? "Full ❌" : "Register"}
    </button>
  </div>
</div>
          </div>
        `;
        eventList.appendChild(div);
      });
  } catch (error) {
    console.log(error);
  }
}
async function loadCategories() {
  try {
    const res = await fetch("http://localhost:5000/events");
    const events = await res.json();
    const categories = [...new Set(events.map(ev => ev.category).filter(cat => cat))];
    const dropdown = document.getElementById("filterCategory");
    dropdown.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.text = cat;
      dropdown.appendChild(option);
    });
  } catch (err) {
    console.log(err);
  }
}
function editEvent(event) {
  document.getElementById("eventName").value = event.eventName;
  document.getElementById("date").value = event.date.split("T")[0];
  document.getElementById("time").value = event.time || "";
  document.getElementById("venue").value = event.venue;
  document.getElementById("category").value = event.category;
  document.getElementById("description").value = event.description || "";
  document.getElementById("capacity").value = event.capacity;
  document.getElementById("price").value = event.price;
  document.getElementById("image").value = event.image;

  editId = event._id;
}
async function deleteEvent(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Login required ❌");
    return;
  }
  try {
    await fetch(`http://localhost:5000/delete-event/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token
      }
    });
    alert("Deleted ❌");
    getEvents();
    loadCategories();
  } catch (error) {
    console.log(error);
  }
}
async function registerEvent(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Login required ❌");
    return;
  }
  try {
    const res = await fetch(`http://localhost:5000/register-event/${id}`, {
      method: "POST",
      headers: {
        "Authorization": token
      }
    });
    const data = await res.json();
    alert(data.message);
    getEvents();
  } catch (error) {
    console.log(error);
  }
}
getEvents();
loadCategories();
function toggleDesc(id, fullText) {
  const el = document.getElementById(`desc-${id}`);

  if (el.innerText.includes("Read More")) {
    el.innerHTML = `
      ${fullText}
      <span style="color:red; cursor:pointer;" onclick="toggleDesc('${id}', \`${fullText}\`)"> Show Less</span>
    `;
  } else {
    const shortText = fullText.substring(0, 80) + "...";
    el.innerHTML = `
      ${shortText}
      <span style="color:blue; cursor:pointer;" onclick="toggleDesc('${id}', \`${fullText}\`)"> Read More</span>
    `;
  }
}
function showLogin() {
  document.getElementById("authSection").style.display = "flex";
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("signupBox").style.display = "none";
}
function showSignup() {
  document.getElementById("authSection").style.display = "flex";
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
}
function closeAuth() {
  document.getElementById("authSection").style.display = "none";
}
function signup() {
  const name = document.querySelector("#signupBox input[placeholder='Name']").value;
  const email = document.querySelector("#signupBox input[placeholder='Email']").value;
  const password = document.querySelector("#signupBox input[placeholder='Password']").value;

  fetch("http://localhost:5000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    closeAuth();
  })
  .catch(err => console.log(err));
}
function login() {
  const email = document.querySelector("#loginBox input[placeholder='Email']").value;
  const password = document.querySelector("#loginBox input[placeholder='Password']").value;
  fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login Success ✅");
      closeAuth();
    } else {
      alert(data.message);
    }
  })
  .catch(err => console.log(err));
}
function logout() {
  localStorage.removeItem("token");
  alert("Logged out ✅");
  location.reload();
}
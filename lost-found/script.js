// storage

function getPosts() {
  return JSON.parse(localStorage.getItem("posts")) || [];
}

function savePosts(posts) {
  localStorage.setItem("posts", JSON.stringify(posts));
}

// image compression

function compressImage(file, callback) {
  const reader = new FileReader();

  reader.onload = e => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const MAX_WIDTH = 600;
      const scale = MAX_WIDTH / img.width;

      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      callback(canvas.toDataURL("image/jpeg", 0.7));
    };
  };

  reader.readAsDataURL(file);
}

// form handler

function handleForm(type) {
  const form = document.querySelector(".item-form");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const post = {
      id: Date.now(),
      type,
      itemName: document.getElementById("itemName").value,
      category: document.getElementById("category").value,
      location: document.getElementById("location").value,
      date: document.getElementById("date").value,
      description: document.getElementById("description").value,
      image: null
    };

    const imageInput = document.getElementById("image");
    const posts = getPosts();

    if (imageInput.files.length > 0) {
      compressImage(imageInput.files[0], compressed => {
        post.image = compressed;
        posts.push(post);
        savePosts(posts);
        window.location.href = "all-posts.html";
      });
    } else {
      posts.push(post);
      savePosts(posts);
      window.location.href = "all-posts.html";
    }
  });
}

// all post page

function renderPosts(posts) {
  const grid = document.querySelector(".posts-grid");
  const empty = document.querySelector(".empty-state");

  grid.innerHTML = "";

  if (posts.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  posts.forEach(p => {
    const card = document.createElement("div");
    card.className = "post-card";

    card.innerHTML = `
      <span class="badge ${p.type}-badge">${p.type.toUpperCase()}</span>
      ${p.image ? `<img src="${p.image}" class="post-image" />` : ""}
      <h3>${p.itemName}</h3>
      <p><strong>Category:</strong> ${p.category}</p>
      <p><strong>Location:</strong> ${p.location}</p>
      <p><strong>Date:</strong> ${p.date}</p>
      <p class="post-desc">${p.description}</p>
    `;

    grid.appendChild(card);
  });
}

function setupSearch(allPosts) {
  const search = document.querySelector(".search-input");
  const empty = document.querySelector(".empty-state");

  search.addEventListener("input", () => {
    const q = search.value.toLowerCase();

    const filtered = allPosts.filter(p =>
      p.itemName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      empty.innerHTML = "<p>No matching items found</p>";
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
    }

    renderPosts(filtered);
  });
}



document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("lost.html")) handleForm("lost");
  if (path.includes("found.html")) handleForm("found");

  if (path.includes("all-posts.html")) {
    const posts = getPosts();
    renderPosts(posts);
    setupSearch(posts);
  }
});

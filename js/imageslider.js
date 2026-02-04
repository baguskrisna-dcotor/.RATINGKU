const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";


const supabaseclient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const slider = document.getElementById("backgroundSlider");
const sizes = ["size-sm", "size-md", "size-lg"];

async function loadImages() {
  const { data, error } = await supabaseclient
    .storage
    .from("images")
    .list("", { limit: 20 });

  if (error) {
    console.error(error);
    return;
  }

  const images = data.filter(f => f.name.endsWith(".png"));
  const rows = [[], [], []];

  images.forEach((file, i) => {
    rows[i % 3].push(file.name);
  });

  rows.forEach((files, index) => {
    const row = document.createElement("div");
    row.className = `slider-row row-${index + 1}`;

    files.forEach(name => {
      const img = document.createElement("img");
      img.src = `${SUPABASE_URL}/storage/v1/object/public/images/${encodeURIComponent(name)}`,loading = "lazy"; 
      img.className = sizes[Math.floor(Math.random() * sizes.length)];
      row.appendChild(img);
    });

    row.innerHTML += row.innerHTML; 
    slider.appendChild(row);
  });
}

loadImages();
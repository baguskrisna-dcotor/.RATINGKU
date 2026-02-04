const parent = document.querySelector(".review-container");

function makeCrad(urlImage, title, description){
    let card = `<div class="review-card" style="--image-url: url(${urlImage})">
                            <div class="content-card">
                                
                                <div class="darken-card"></div>
                                <h1 class="rating">?/5 ★★★★★</h1>
                                <p class="deskripsi">${description}</p>
                                <h2 class="judul">${title}</h2>   
                                <div class="open">
                                    <button class="button-open">Lihat</button>
                                </div>
                            </div>
                        </div>`
    parent.insertAdjacentHTML("beforeend", card);

}

contentParent = document.querySelector("content-container")
function makeTitle(title){
    let titleDiv = `<div class="content ">
                    <h1>${title}</h1>
                    <div class="review-container ">
                    </div>
                </div>`
    contentParent.insertAdjacentHTML("beforeend",titleDiv)
}


const SEMENTARAIMG = "https://i.pinimg.com/originals/f3/d0/19/f3d019284cfaaf4d093941ecb0a3ea40.gif"

const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";


fetch(`${SUPABASE_URL}/rest/v1/content?type=eq.Animation`, {
    headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
    }
    })
    .then(res => res.json())
    .then(data =>{
        const container = document.querySelector(".review-container");
        for (let i = 0; i < data.length; i++) {
        let item = data[i]
        if (item.description == null){
            item.description = "-"
        }
        makeCrad(SEMENTARAIMG, item.title, item.description)
    }
    })
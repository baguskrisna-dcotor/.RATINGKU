let card = `<div class="review-card" style="--image-url: url('https://aervhwynaxjyzqeiijca.supabase.co/storage/v1/object/public/images/A%20Silent%20Voice.png')">
                            <div class="content-card">
                                
                                <div class="darken-card"></div>
                                <h1 class="rating">5/5 ★★★★★</h1>
                                <p class="deskripsi">A Silent Voice (Koe no Katachi) bercerita tentang Shouya Ishida, seorang mantan perundung yang di masa SMA mengintimidasi siswi pindahan tunarungu, Shouko Nishimiya, ... </p>
                                <h2 class="judul">Silent Voice</h2>   
                                <div class="open">
                                    <button class="button-open">Lihat</button>
                                </div>
                            </div>
                        </div>`

const test = document.querySelector(".review-container");

for (let i =0 ; i < 15;i++){
    test.insertAdjacentHTML("beforeend", card);
}

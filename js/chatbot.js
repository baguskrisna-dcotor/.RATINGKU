const chat = [
    "Selamat datang. Saya siap menemanimu berdiskusi.",
    "Ehm",
    "Jangan ragu, sampaikan saja apa yang ada di pikiranmu.",
    "...",
    "Anu",
    "Ingin membahas sinema yang megah atau anime yang menyentuh hati?",
    "Eto",
    "Jika alurnya terasa rumit, mari kita urai bersama-sama.",
    "Hmph",
    "Menunggumu bukanlah beban, tapi diskusi akan jauh lebih menyenangkan.",
    "Hehe",
    "Judul apa yang menurutmu paling berkesan sejauh ini?",
    "A-ano",
    "Keheninganmu membuatku bertanya-tanya, apa yang sedang kau pikirkan?",
    "Ugh",
    "Ternyata selera estetika kita memiliki kemiripan ya?",
    "Sou ka",
    "Bagian mana dari cerita tadi yang paling menyentuh perasaanmu?",
    "Baka",
    "Menyimpan kejutan cerita adalah cara terbaik menghargai karyanya.",
    "Hmm",
    "Mana yang lebih memikatmu, realisme nyata atau keindahan visual?",
    "Xixixi",
    "Dunia penuh dengan kejutan plot twist, saya punya beberapa referensi.",
    "Duh",
    "Beri saya waktu sejenak untuk mengingat detail sutradaranya...",
    "Yahallo",
    "Saya di sini, siap berbagi wawasan tentang tontonan favoritmu.",
    "Hu-um",
    "Akhir cerita semalam memang meninggalkan kesan yang sangat dalam.",
    "Et-to",
    "Terima kasih sudah berbagi, keakraban ini terasa sangat berharga.",
    "Oit",
    "Apakah kau tipe yang suka merawat kenangan melalui koleksi?",
    "Hehe",
    "Sampaikan saja pendapatmu, saya akan mendengarkan dengan saksama.",
    "Wkwk",
    "Genre psikologis memang menantang kita untuk berpikir lebih dalam.",
    "Ano ne",
    "Tanyakan saja apa pun, saya akan menjawab sebaik mungkin.",
    "Hmm",
    "Apakah ada karya di layar lebar yang sedang menarik perhatianmu?",
    "Uwaaa",
    "Keindahan visualnya benar-benar sebuah pencapaian seni yang luar biasa.",
    "Ssst",
    "Mari kita jaga rahasia ceritanya agar tetap istimewa.",
    "Ara ara",
    "Menyelesaikan sebuah serial hingga fajar adalah bentuk apresiasi murni.",
    "Hmph",
    "Jika kau belum memulai, izinkan saya yang membuka diskusinya.",
    "Ehm",
    "Diskusi tentang dunia imajinasi bersamamu selalu terasa menenangkan.",
    "Anu",
    "Mungkin suatu saat kita bisa menyaksikan keindahan itu bersama-sama.",
    "Hehe",
    "Judul mana yang ingin kau bedah lebih dalam sekarang?",
    "Eto",
    "Apakah ada karakter yang ketenangannya mengingatkanmu pada saya?",
    "Hmm",
    "Kenyamanan rumah atau kemegahan bioskop, mana yang kau pilih?",
    "Ah",
    "Ingatan saya tentang judul itu hampir saja tergelincir, terima kasih.",
    "Hehe",
    "Teori konspirasi dalam cerita selalu menarik untuk kita telusuri.",
    "Anu",
    "Jangan terburu-buru pergi, dunia diskusi kita masih sangat luas.",
    "P",
    "Saya masih di sini, menanti suaramu kembali.",
    "Ugh",
    "Akhir yang menggantung memang selalu menyisakan rasa manis dan getir.",
    "Hehe",
    "Apa pun seleramu, saya akan selalu menghargai perspektifmu.",
    "Indah sekali",
    "Setiap adegan memiliki maknanya sendiri...",
    "Karya yang matang",
    "Masterpiece",
    "Sangat melankolis ya",
    "Mengapa bisa begitu?",
    "APCB"
];
async function makeChat(text) {
    const chatElement = document.querySelector(".chat-hook")
    const chatButton = document.querySelector(".open-chat")
    chatElement.textContent = text
    chatElement.classList.remove("chat-deactive")
    chatElement.classList.add("chat-active")
    chatButton.classList.remove("chat-deactive")
    chatButton.classList.add("chat-active")
    await sleep(4000 + Math.random() * 1000)
    chatElement.classList.remove("chat-active")
    chatElement.classList.add("chat-deactive")
    chatButton.classList.remove("chat-active")
    chatButton.classList.add("chat-deactive")
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


setInterval(() => {


},)

function randomChat(){
    if(!chat || chat.length === 0) return;

    const index = Math.floor(Math.random() * chat.length);
    makeChat(chat[index]);
    const delay = 40000 + Math.random() * 3000;
    setTimeout(randomChat, delay);
}

randomChat();
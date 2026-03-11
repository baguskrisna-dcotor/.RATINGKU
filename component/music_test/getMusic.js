const apiKey = "1cda582139a91dba219e435327a9504b";

async function getChart() {
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${apiKey}&format=json&limit=10`
  );
  const data = await res.json();

  console.log(data); // cek struktur datanya dulu

  document.getElementById("output").textContent =
    JSON.stringify(data.tracks.track.map(t => ({
      rank: t["@attr"]?.rank ?? "-",
      title: t.name,
      artist: t.artist.name,
      listeners: t.listeners,
      playcount: t.playcount
    })), null, 2);
}

document.getElementById("load").onclick = getChart;
import { useState, useEffect } from "react";

function getWeatherInfo(code) {
  const table = {
    0: { emoji: "☀️", label: "Ciel dégagé" },
    1: { emoji: "🌤️", label: "Plutôt dégagé" },
    2: { emoji: "⛅", label: "Partiellement nuageux" },
    3: { emoji: "☁️", label: "Nuageux" },
    45: { emoji: "🌫️", label: "Brouillard" },
    48: { emoji: "🌫️", label: "Brouillard givrant" },
    51: { emoji: "🌦️", label: "Bruine légère" },
    53: { emoji: "🌦️", label: "Bruine" },
    55: { emoji: "🌦️", label: "Bruine dense" },
    61: { emoji: "🌧️", label: "Pluie légère" },
    63: { emoji: "🌧️", label: "Pluie" },
    65: { emoji: "🌧️", label: "Pluie forte" },
    71: { emoji: "❄️", label: "Neige légère" },
    73: { emoji: "❄️", label: "Neige" },
    75: { emoji: "❄️", label: "Neige forte" },
    80: { emoji: "🌦️", label: "Averses" },
    81: { emoji: "🌦️", label: "Averses fortes" },
    95: { emoji: "⛈️", label: "Orage" },
  };
  return table[code] || { emoji: "🌡️", label: "Conditions inconnues" };
}

async function recupererMeteo(latitude, longitude) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );
  if (!response.ok) throw new Error("Impossible de récupérer la météo");
  const data = await response.json();
  return data.current_weather;
}

export default function App() {
  const [ville, setVille] = useState("");
  const [lieu, setLieu] = useState(null);
  const [meteo, setMeteo] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setChargement(false);
      setErreur("Géolocalisation non disponible sur cet appareil.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // reverse geocoding pour afficher un nom de ville lisible
          const resNom = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
          );
          const dataNom = await resNom.json();
          const nom = dataNom.city || dataNom.locality || "Votre position";

          const donneesMeteo = await recupererMeteo(latitude, longitude);
          setLieu({ nom, latitude, longitude });
          setMeteo(donneesMeteo);
        } catch (e) {
          setErreur(e.message);
        } finally {
          setChargement(false);
        }
      },
      () => {
        setChargement(false);
        setErreur("Localisation refusée — recherchez une ville ci-dessous.");
      }
    );
  }, []);

  async function rechercherVille() {
    if (ville.trim() === "") return;
    try {
      setChargement(true);
      setErreur(null);

      const resRecherche = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          ville
        )}&count=1&language=fr&format=json`
      );
      const dataRecherche = await resRecherche.json();

      if (!dataRecherche.results || dataRecherche.results.length === 0) {
        throw new Error("Ville introuvable");
      }

      const { name, latitude, longitude } = dataRecherche.results[0];
      const donneesMeteo = await recupererMeteo(latitude, longitude);

      setLieu({ nom: name, latitude, longitude });
      setMeteo(donneesMeteo);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }

  function gererTouche(event) {
    if (event.key === "Enter") rechercherVille();
  }

  const info = meteo ? getWeatherInfo(meteo.weathercode) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 text-white">
        <h1 className="text-xl font-semibold text-center mb-4">Météo</h1>

        <div className="flex gap-2 mb-6">
          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            onKeyDown={gererTouche}
            placeholder="Rechercher une ville..."
            className="flex-1 rounded-lg px-3 py-2 text-sm bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            onClick={rechercherVille}
            className="bg-white/90 hover:bg-white text-blue-700 font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            OK
          </button>
        </div>

        {chargement && (
          <p className="text-center text-sm text-white/80">Chargement...</p>
        )}

        {!chargement && erreur && !meteo && (
          <p className="text-center text-sm text-red-100 bg-red-500/30 rounded-lg py-2 px-3">
            {erreur}
          </p>
        )}

        {!chargement && meteo && lieu && (
          <div className="text-center">
            <p className="text-sm uppercase tracking-wide text-white/80 mb-1">
              {lieu.nom}
            </p>
            <div className="text-6xl mb-2">{info.emoji}</div>
            <div className="text-4xl font-bold mb-1">
              {Math.round(meteo.temperature)}°C
            </div>
            <p className="text-sm text-white/90 mb-4">{info.label}</p>
            <div className="flex justify-center gap-6 text-xs text-white/80 border-t border-white/20 pt-3">
              <div>
                <p className="font-semibold text-sm">
                  {Math.round(meteo.windspeed)} km/h
                </p>
                <p>Vent</p>
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {new Date(meteo.time).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>Relevé à</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

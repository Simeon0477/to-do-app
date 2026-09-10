import { useState } from "react";

function Task(props) {
  const { content } = props;
  return (
    <div className="flex items-center justify-between border rounded-lg p-3 bg-white shadow-sm gap-3">
      <div>
        <h2
          className={`font-semibold ${
            content.fait ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {content.texte}
        </h2>
        <p className="text-xs text-gray-400">
          Créée le {new Date(content.id).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">{props.children}</div>
    </div>
  );
}

function FormulaireTache(props) {
  const [task, setTask] = useState({ texte: "", fait: false });

  function handleChange(event) {
    const { name, value } = event.target;
    setTask({ ...task, [name]: value });
  }

  function handleAdd() {
    if (task.texte.trim() === "") return;
    const nouvelleTache = { ...task, id: Date.now() };
    props.onAdd(nouvelleTache);
    setTask({ texte: "", fait: false });
  }

  return (
    <div className="flex gap-2 mb-4">
      <input
        name="texte"
        value={task.texte}
        onChange={handleChange}
        placeholder="Nouvelle tâche..."
        className="flex-1 border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={handleAdd}
        className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
      >
        Ajouter
      </button>
    </div>
  );
}

export default function App() {
  const [taches, setTaches] = useState([]);

  const tachesRestantes = taches.filter((t) => !t.fait).length;

  function addTask(task) {
    setTaches([...taches, task]);
  }

  function deleteTask(id) {
    setTaches(taches.filter((tache) => tache.id !== id));
  }

  function toggleTache(id) {
    setTaches(
      taches.map((tache) =>
        tache.id === id ? { ...tache, fait: !tache.fait } : tache
      )
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-xl">
      <h1 className="text-2xl font-bold text-center mb-1">To Do List</h1>
      <p className="text-center text-sm text-gray-500 mb-4">
        {tachesRestantes} tâche{tachesRestantes !== 1 ? "s" : ""} restante
        {tachesRestantes !== 1 ? "s" : ""}
      </p>

      <FormulaireTache onAdd={addTask} />

      <div className="flex flex-col gap-2">
        {taches.map((tache) => (
          <Task key={tache.id} content={tache}>
            <input
              type="checkbox"
              checked={tache.fait}
              onChange={() => toggleTache(tache.id)}
              className="w-4 h-4"
            />
            <button
              onClick={() => deleteTask(tache.id)}
              className="text-red-500 hover:text-red-700 text-sm font-bold"
            >
              ×
            </button>
          </Task>
        ))}
      </div>
    </div>
  );
}

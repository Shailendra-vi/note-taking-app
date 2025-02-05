"use client";
import { createContext, useContext, useState, useEffect } from "react";

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [notesLoading, setNotesLoading] = useState(true)

  const fetchNotes = async () => {
    const token = localStorage.getItem("token");
    try {
      setNotesLoading(true)
      const res = await fetch("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotes(data);
      setNotesLoading(false)
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notesLoading,
        notes,
        selectedNote,
        sortBy,
        setSortBy,
        setSelectedNote,
        fetchNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export const useNotes = () => useContext(NotesContext);

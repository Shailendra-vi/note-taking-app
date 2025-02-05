"use client";
import { useNotes } from "@/context/NotesContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import NoteModal from "@/components/NoteModal";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Disc, Edit, Image, SlidersHorizontal } from "lucide-react";
import { NoteCard } from "./NoteCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";

export default function Home() {
  const {
    notesLoading,
    notes,
    sortBy,
    setSortBy,
    fetchNotes,
    setSelectedNote,
  } = useNotes();
  const [filteredNotes, setFilteredNotes] = useState([]);
  const {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    transcript,
    setTranscript,
  } = useAudioRecorder();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && notes?.length) {
      let filtered = [...notes];

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(
          (note) =>
            note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort notes
      switch (sortBy) {
        case "newest":
          filtered.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          break;
        case "oldest":
          filtered.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          break;
        case "favorites":
          filtered = filtered.filter((note) => note.favorite);
          break;
      }

      setFilteredNotes(filtered);
    }
  }, [notes, searchQuery, sortBy]);

  const handleRecord = async () => {
    if (!isRecording) {
      startRecording();
    } else {
      const audioFile = await stopRecording();
      setShowModal(true);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-screen p-4 overflow-y-auto">
        <div className="flex items-center justify-center mb-8 ">
          <div className="flex items-center justify-between gap-2 w-1/2">
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("newest")}>
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                  Oldest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("favorites")}>
                  Favorites
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onClick={() => {
                setSelectedNote(note);
                setShowModal(true);
              }}
            />
          ))}
        </div>

        <div className="fixed flex items-center bottom-2 w-full ml-[14%] mb-4">
          <div className=" flex justify-between  w-1/2 items-center border-gray-200 border p-2 px-4 rounded-3xl">
            <div className="gap-2 flex">
              <Button variant="outline" className="w-1 rounded-full border-none" onClick={()=>{ setShowModal(true) }}>
                <Edit className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={handleRecord}
            >
              <div className="flex items-center">
                {isRecording ? (
                  <>
                    <Disc className="h-4 w-4 mr-2 animate-spin" />
                    Stop
                  </>
                ) : (
                  <>
                    <Disc className="h-4 w-4 mr-2" />
                    Record
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>

        {showModal && (
          <NoteModal
            onClose={() => {
              setShowModal(false);
              setSelectedNote(null);
              setTranscript("");
            }}
            audioBlob={audioBlob}
            transcript={transcript}
          />
        )}
      </main>
    </SidebarProvider>
  );
}

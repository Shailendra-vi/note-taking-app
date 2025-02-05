"use client";
import { useEffect, useState } from "react";
import { useNotes } from "@/context/NotesContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

export default function NoteModal({ onClose, audioBlob, transcript }) {
  const { selectedNote, fetchNotes } = useNotes();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: selectedNote?.name || "",
    description: selectedNote?.description || "",
    favorite: selectedNote?.favorite || false,
  });
  const [existingImageIds, setExistingImageIds] = useState(
    selectedNote?.images || []
  );
  const [newImageFiles, setNewImageFiles] = useState([]);

  useEffect(() => {
    if (transcript) {
      setFormData((prev) => ({ ...prev, description: transcript }));
    }
  }, [transcript]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let audioId = selectedNote?.audio;

      // Upload new audio only if creating a new note
      if (!selectedNote && audioBlob) {
        const audioFormData = new FormData();
        audioFormData.append("audio", audioBlob, "recording.webm");
        const audioRes = await fetch("/api/upload/audio", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: audioFormData,
        });
        if (!audioRes.ok) throw new Error("Audio upload failed");
        const audioData = await audioRes.json();
        audioId = audioData.fileId;
      }

      // Upload new images
      const uploadedImageIds = [];
      for (const file of newImageFiles) {
        const imageFormData = new FormData();
        imageFormData.append("image", file);
        const imageRes = await fetch("/api/upload/image", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: imageFormData,
        });
        if (!imageRes.ok) throw new Error("Image upload failed");
        const imageData = await imageRes.json();
        uploadedImageIds.push(imageData.fileId);
      }

      const allImageIds = [...existingImageIds, ...uploadedImageIds];

      const url = selectedNote
        ? `/api/notes/${selectedNote._id}`
        : "/api/notes";
      const method = selectedNote ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...formData,
          images: allImageIds,
          audio: audioId,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");

      fetchNotes();
      onClose();
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">
          {selectedNote ? "Edit Note" : "New Note"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Note Title"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.favorite}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    favorite: e.target.checked,
                  }))
                }
              />
              <label>Add to Favorites</label>
            </div>

            <div className="mt-4">
              <Button asChild>
                <Label>
                  Upload Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setNewImageFiles(Array.from(e.target.files))
                    }
                  />
                </Label>
              </Button>
              <div className="flex flex-wrap gap-2 mt-2">
                {[...existingImageIds, ...newImageFiles].map((item, index) => (
                  <a
                    key={index}
                    href={
                      typeof item === "string"
                        ? `/api/files/image/${item}`
                        : URL.createObjectURL(item)
                    }
                    target="_blank"
                    download
                  >
                    <img
                      src={
                        typeof item === "string"
                          ? `/api/files/image/${item}`
                          : URL.createObjectURL(item)
                      }
                      alt="Note image"
                      className="w-20 h-20 object-cover rounded cursor-pointer"
                    />
                  </a>
                ))}
              </div>
            </div>

            {selectedNote?.audio && (
              <div>
                <audio
                  controls
                  src={`/api/files/audio/${selectedNote.audio}`}
                  className="w-full mt-2"
                />
              </div>
            )}
            {!selectedNote?.audio && audioBlob && (
              <div>
                <audio
                  controls
                  src={URL.createObjectURL(audioBlob)}
                  className="w-full mt-2"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Save Note"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

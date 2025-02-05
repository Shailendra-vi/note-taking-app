"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotes } from "@/context/NotesContext";
import { Copy, Ellipsis, Image, Star } from "lucide-react";

export const NoteCard = ({ note, onClick }) => {
  const { fetchNotes } = useNotes();

  const handleFavorite = async () => {
    try {
      await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ favorite: !note.favorite }),
      });
      fetchNotes();
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(note.description);
  };

  const handleDeleteNote = async () => {
    try {
      const url = `/api/notes/${note._id}`;
      const method = "DELETE";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchNotes();
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {new Date(note.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite();
            }}
          >
            <Star
              className={`h-4 w-4 ${
                note.favorite ? "text-yellow-500 fill-current" : ""
              }`}
            />
          </Button>
        </div>
        <CardTitle>{note.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 line-clamp-3">{note.description}</p>
        {note.images?.length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <Image className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              {note.images.length} image{note.images.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end w-full space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard();
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Ellipsis className="h-4 w-4 text-gray-600" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onClick}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteNote}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

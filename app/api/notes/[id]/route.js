import { NextResponse } from "next/server";
import { protect } from "@/lib/auth";
import Note from "@/models/Note";
import dbConnect from "@/lib/db";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const user = await protect(req);
    const body = await req.json();

    const note = await Note.findOneAndUpdate(
      { _id: params.id, user: user._id },
      body,
      {
        new: true,
      }
    );
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = await protect(req);

    const note = await Note.findOneAndDelete({
      _id: params.id,
      user: user._id,
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

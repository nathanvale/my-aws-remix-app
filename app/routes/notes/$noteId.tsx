import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";
import { GeneralErrorBoundary } from "~/components/error-boundary";

import { deleteNote, readNote } from "~/models/note/note.server";
import { requireUserId } from "~/session/session.server";

type LoaderData = {
  note: NonNullable<Awaited<ReturnType<typeof readNote>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const note = await readNote(userId, params.noteId);
  if (!note) {
    throw new Response(null, {
      status: 404,
      statusText: "Note not found!",
    });
  }

  return json<LoaderData>({ note });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  await deleteNote(userId, params.noteId);

  return redirect("/notes");
};

export default function NoteDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.note.attributes.title}</h3>
      <p className="py-6">{data.note.attributes.body}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}
export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => <p>Note not found.</p>,
      }}
    />
  );
}

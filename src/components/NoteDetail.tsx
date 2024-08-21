import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase";
import { ChevronLeft, Edit, Image as ImageIcon, Loader } from "lucide-react";
import FullScreenImage from "./FullScreenImage";
import Comments from './Comments';

interface Note {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  userId: string;
  folderId: string;
  images: string[];
  createdAt?: { seconds: number; nanoseconds: number } | null;
  updatedAt?: { seconds: number; nanoseconds: number } | Date | null;
}

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <Loader className="animate-spin h-5 w-5 mr-3" />
    Loading...
  </div>
);

const NoteDetail: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        setIsLoading(true);
        try {
          const noteRef = doc(db, "notes", noteId);
          const noteSnap = await getDoc(noteRef);
          if (noteSnap.exists()) {
            const noteData = { id: noteSnap.id, ...noteSnap.data() } as Note;
            setNote(noteData);
            setEditTitle(noteData.title);
            setEditContent(noteData.content);
            setEditIsPublic(noteData.isPublic);
            setImages(noteData.images || []);
          }
        } catch (error) {
          console.error("Error fetching note:", error);
          // Handle error (e.g., show error message to user)
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchNote();
  }, [noteId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (note && noteId) {
      setIsSaving(true);
      try {
        const updateData = {
          title: editTitle,
          content: editContent,
          isPublic: editIsPublic,
          images,
          updatedAt: Timestamp.fromDate(new Date()),
        };
        await updateDoc(doc(db, "notes", noteId), updateData);
        setNote({ ...note, ...updateData });
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving note:", error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(note?.title || "");
    setEditContent(note?.content || "");
    setEditIsPublic(note?.isPublic || false);
    setImages(note?.images || []);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && note) {
      setIsSaving(true);
      try {
        const imageRef = ref(storage, `notes/${note.id}/${file.name}`);
        await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(imageRef);
        setImages([...images, downloadURL]);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsSaving(false);
      }
    }
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };

  const openFullScreenImage = (index: number) => {
    setFullScreenImage(index);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  const nextFullScreenImage = () => {
    if (fullScreenImage !== null && fullScreenImage < images.length - 1) {
      setFullScreenImage(fullScreenImage + 1);
    }
  };

  const previousFullScreenImage = () => {
    if (fullScreenImage !== null && fullScreenImage > 0) {
      setFullScreenImage(fullScreenImage - 1);
    }
  };

  const formatDate = (date: { seconds: number; nanoseconds: number } | Date | null | undefined) => {
    if (!date) return "Unknown";
    if (date instanceof Date) {
      return date.toLocaleString();
    }
    if ('seconds' in date) {
      return new Date(date.seconds * 1000).toLocaleString();
    }
    return "Invalid date";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-sky-200">
        <Spinner />
      </div>
    );
  }

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div className="note-detail min-h-screen bg-sky-200 p-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="flex items-center text-sky-700 mb-4">
          <ChevronLeft size={20} />
          <span className="ml-1">Back to Home</span>
        </Link>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-sky-800">{note.title}</h1>
          <button
            onClick={handleEdit}
            className="bg-sky-500 text-white px-3 py-1 rounded hover:bg-sky-600 flex items-center"
            disabled={isEditing || isSaving}
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>
        </div>
        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm mb-4">
          {note.isPublic ? 'Public' : 'Private'}
        </span>
        {!isEditing && (
          <div className="text-sm text-gray-600 mb-4">
            <p>Created: {formatDate(note.createdAt)}</p>
            <p>Updated: {formatDate(note.updatedAt)}</p>
          </div>
        )}
        {isEditing ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-2xl font-bold mb-4 p-2 border rounded"
              disabled={isSaving}
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isPublic"
                checked={editIsPublic}
                onChange={(e) => setEditIsPublic(e.target.checked)}
                className="mr-2"
                disabled={isSaving}
              />
              <label htmlFor="isPublic">Make this note public</label>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-64 p-2 mb-4 border rounded"
              disabled={isSaving}
            />
            <div className="mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-sky-500 text-white px-3 py-1 rounded hover:bg-sky-600 flex items-center"
                disabled={isSaving}
              >
                <ImageIcon size={16} className="mr-1" />
                Add Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                disabled={isSaving}
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Uploaded ${index}`}
                  className="w-24 h-24 object-cover rounded cursor-pointer"
                  onClick={() => openFullScreenImage(index)}
                />
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                disabled={isSaving}
              >
                {isSaving ? <Spinner /> : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-700 leading-relaxed">
              {renderContent(note.content)}
            </div>
            {images.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Images:</h3>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Note image ${index}`}
                      className="w-32 h-32 object-cover rounded cursor-pointer"
                      onClick={() => openFullScreenImage(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <Comments noteId={note.id} />
      </div>
      {fullScreenImage !== null && (
        <FullScreenImage
          images={images}
          currentIndex={fullScreenImage}
          onClose={closeFullScreenImage}
          onNext={nextFullScreenImage}
          onPrevious={previousFullScreenImage}
        />
      )}
    </div>
  );
};

export default NoteDetail;
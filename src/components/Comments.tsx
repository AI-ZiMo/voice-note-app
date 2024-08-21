import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
}

interface CommentsProps {
  noteId: string;
}

const Comments: React.FC<CommentsProps> = ({ noteId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('noteId', '==', noteId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const newComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(newComments);
    });

    return () => unsubscribe();
  }, [noteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser) return;

    await addDoc(collection(db, 'comments'), {
      noteId,
      text: newComment,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Anonymous',
      createdAt: Timestamp.now(),
    });

    setNewComment('');
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+),/, '$3/$2/$1').replace(',', '');
  };

  return (
    <div className="comments mt-8 w-full bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
          className="w-full p-2 border rounded h-32 resize-y"
        />
        <button
          type="submit"
          className="mt-2 bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
        >
          Post Comment
        </button>
      </form>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-100 p-4 rounded mb-2">
            <p>{comment.text}</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
              <span>Posted by: {comment.userName}</span>
              <span>{formatDate(comment.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
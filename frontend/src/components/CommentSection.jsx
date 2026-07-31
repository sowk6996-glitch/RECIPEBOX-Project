import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiSend, FiTrash2, FiMessageCircle } from 'react-icons/fi';
import api from '../services/api';

export const CommentSection = ({ comments, recipeId, recipeAuthorId, onCommentUpdated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/recipes/${recipeId}/comment`, { text });
      setText('');
      showToast('Comment posted!', 'success');
      onCommentUpdated(data); // callback to parent to update local state
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { data } = await api.delete(`/api/recipes/${recipeId}/comment/${commentId}`);
      showToast('Comment deleted!', 'success');
      onCommentUpdated(data);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete comment', 'error');
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 lg:p-8 space-y-6 shadow-sm">
      <h3 className="text-xl font-bold flex items-center gap-2 border-b border-slate-50 dark:border-slate-850 pb-4">
        <FiMessageCircle className="text-brand-500 w-5 h-5" />
        Comments ({comments?.length || 0})
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start">
          <img
            src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover border border-brand-500/20 flex-shrink-0"
          />
          <div className="flex-grow relative">
            <textarea
              rows="2"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts on this recipe..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 focus:border-brand-500 dark:focus:border-brand-500 rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 resize-none pr-12"
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="absolute right-3 bottom-4 p-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl transition-all duration-150 shadow-md shadow-brand-500/15"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl text-center">
          <p className="text-sm text-slate-500 dark:text-slate-450">
            Please{' '}
            <Link to="/login" className="text-brand-500 font-bold hover:underline">
              Sign In
            </Link>{' '}
            or{' '}
            <Link to="/register" className="text-brand-500 font-bold hover:underline">
              Sign Up
            </Link>{' '}
            to join the discussion!
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {comments && comments.length > 0 ? (
          comments.map((comment) => {
            const commentUser = comment.user || {};
            const isCommentOwner = user && (user._id || user.id) === (commentUser._id || commentUser.id);
            const isRecipeOwner = user && (user._id || user.id) === recipeAuthorId;

            return (
              <div
                key={comment._id}
                className="group flex gap-3 p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/50 dark:border-slate-900/50 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-950/45 transition-colors duration-150"
              >
                <Link to={`/profile/${commentUser._id || commentUser.id}`} className="flex-shrink-0">
                  <img
                    src={commentUser.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={commentUser.username || 'user'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                  />
                </Link>

                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <Link
                        to={`/profile/${commentUser._id || commentUser.id}`}
                        className="text-xs font-bold text-slate-850 dark:text-white hover:underline"
                      >
                        @{commentUser.username || 'unknown'}
                      </Link>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {/* Delete button (only for comment owner or recipe author) */}
                    {(isCommentOwner || isRecipeOwner) && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all duration-150"
                        title="Delete Comment"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-650 dark:text-slate-350 mt-1 whitespace-pre-line">
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-450 dark:text-slate-500">
            <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default CommentSection;

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  Reply,
  Loader2,
} from "lucide-react";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  formatDate,
  type Comment,
} from "@/lib/api";
// Simple confirmation dialog
const confirmDelete = (): boolean => {
  return window.confirm("Are you sure you want to delete this comment? This action cannot be undone.");
};
// Simple toast implementation
const showToast = (message: string, type: "success" | "error" = "success") => {
  // Simple alert for now - can be replaced with a proper toast library
  if (type === "error") {
    console.error(message);
    alert(message);
  } else {
    console.log(message);
  }
};

interface CommentsSectionProps {
  knowledgeItemId: string;
}

export function CommentsSection({ knowledgeItemId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [knowledgeItemId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await fetchComments(knowledgeItemId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Failed to load comments:", error);
      showToast("Failed to load comments", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      await createComment(knowledgeItemId, { content: newComment.trim() });
      setNewComment("");
      await loadComments();
      showToast("Comment added successfully");
    } catch (error) {
      console.error("Failed to create comment:", error);
      showToast("Failed to add comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    try {
      setSubmitting(true);
      await createComment(knowledgeItemId, {
        content: replyContent.trim(),
        parentCommentId: parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      await loadComments();
      showToast("Reply added successfully");
    } catch (error) {
      console.error("Failed to create reply:", error);
      showToast("Failed to add reply", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;

    try {
      setSubmitting(true);
      await updateComment(editingId, { content: editContent.trim() });
      setEditingId(null);
      setEditContent("");
      await loadComments();
      showToast("Comment updated successfully");
    } catch (error) {
      console.error("Failed to update comment:", error);
      showToast("Failed to update comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirmDelete()) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteComment(commentId);
      await loadComments();
      showToast("Comment deleted successfully");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      showToast("Failed to delete comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Group comments by parent (threaded comments)
  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const repliesMap = new Map<string, Comment[]>();
  comments
    .filter((c) => c.parentCommentId)
    .forEach((reply) => {
      const parentId = reply.parentCommentId!;
      if (!repliesMap.has(parentId)) {
        repliesMap.set(parentId, []);
      }
      repliesMap.get(parentId)!.push(reply);
    });

  const renderComment = (comment: Comment, isReply = false) => {
    const replies = repliesMap.get(comment.id) || [];
    const canEdit = user?.id === comment.user.id;
    const canDelete =
      user?.id === comment.user.id ||
      user?.role === "administrator" ||
      user?.role === "knowledge_champion";

    return (
      <div key={comment.id} className={isReply ? "ml-8 mt-3" : ""}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.avatar || undefined} />
            <AvatarFallback>
              {comment.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                    {comment.isEdited && " (edited)"}
                  </span>
                </div>
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px]"
                      placeholder="Edit your comment..."
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={submitting || !editContent.trim()}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-foreground mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-2">
                      {!isReply && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setReplyingTo(comment.id);
                            setReplyContent("");
                          }}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleStartEdit(comment)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={() => handleDelete(comment.id)}
                          disabled={submitting}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px]"
                  placeholder="Write a reply..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={submitting || !replyContent.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-1" />
                        Reply
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Render replies */}
            {replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {replies.map((reply) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment form */}
      {user && (
        <div className="mb-6 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Post Comment
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      {topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => renderComment(comment))}
        </div>
      )}

    </Card>
  );
}

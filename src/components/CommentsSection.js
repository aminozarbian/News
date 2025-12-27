'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import Link from 'next/link';

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " سال پیش";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " ماه پیش";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " روز پیش";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " ساعت قبل";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " دقیقه پیش";
  return "لحظاتی پیش";
}

export default function CommentsSection({ newsId }) {
  const [comments, setComments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [newComment, setNewComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    // Check login status
    const loggedIn = document.cookie.split('; ').find(row => row.startsWith('isLoggedIn=true'));
    setIsLoggedIn(!!loggedIn);

    fetchComments();
  }, [newsId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/news/${newsId}/comments`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.data || []);
      } else {
        console.error('Failed to load comments');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/news/${newsId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewComment('');
        // Add new comment to top or refetch
        setComments(prev => [data.data, ...prev]);
      } else {
        setError(data.message || 'خطا در ارسال دیدگاه');
      }
    } catch (err) {
      setError('خطا در برقراری ارتباط');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        دیدگاه‌ها ({comments.length})
      </Typography>
      
      {isLoggedIn ? (
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover', mb: 4, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            دیدگاه خود را بنویسید
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="نظر شما چیست؟"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              sx={{ mb: 2, bgcolor: 'background.paper' }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                endIcon={<SendIcon sx={{ transform: 'rotate(180deg)' }} />}
                disabled={submitting || !newComment.trim()}
              >
                ارسال دیدگاه
              </Button>
            </Box>
          </form>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          برای ثبت دیدگاه ابتدا <Link href="/login" style={{ textDecoration: 'underline', color: 'inherit', fontWeight: 'bold' }}>وارد شوید</Link>.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Paper key={comment._id} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {comment.userId?.firstName ? comment.userId.firstName.charAt(0) : '?'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {comment.userId ? `${comment.userId.firstName || ''} ${comment.userId.lastName || ''}`.trim() || comment.userId.username : 'کاربر ناشناس'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo(comment.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              هنوز دیدگاهی ثبت نشده است. اولین نفری باشید که نظر می‌دهد!
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}


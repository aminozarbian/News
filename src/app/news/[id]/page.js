import dbConnect from '@/lib/db';
import News from '@/models/News';
import '@/models/User';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CommentsSection from '@/components/CommentsSection';
import { decodeHtmlEntities } from '@/utils/html';

export const dynamic = 'force-dynamic';

async function getNewsItem(id) {
  try {
    await dbConnect();
    const news = await News.findById(id).populate('author', 'firstName lastName username').lean();
    if (!news) return null;
    return JSON.parse(JSON.stringify(news));
  } catch (error) {
    console.error('Error fetching news item:', error);
    return null;
  }
}

export default async function NewsDetail({ params }) {
  const { id } = await params;
  const news = await getNewsItem(id);

  if (!news) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          خبر مورد نظر یافت نشد
        </Typography>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<ArrowBackIcon />}>
            بازگشت به صفحه اصلی
          </Button>
        </Link>
      </Container>
    );
  }

  const authorName = news.author ? `${news.author.firstName || ''} ${news.author.lastName || ''}`.trim() || news.author.username : 'ناشناس';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', pb: 8 }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Back Button */}
        <Box sx={{ mb: 4 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button 
              startIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />} 
              sx={{ color: 'text.secondary' }}
            >
              بازگشت
            </Button>
          </Link>
        </Box>

        {/* Header Image */}
        {news.image && (
          <Box 
            sx={{ 
              width: '100%', 
              height: { xs: 250, md: 400 }, 
              backgroundImage: `url(${news.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 4,
              boxShadow: 3,
              mb: 4
            }} 
          />
        )}

        {/* Title & Meta */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color="text.primary">
            {news.title}
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2, color: 'text.secondary' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              {authorName.charAt(0)}
            </Avatar>
            <Typography variant="subtitle2">
              {authorName}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography variant="caption">
              {new Date(news.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Content */}
        <Box 
          sx={{ 
            typography: 'body1', 
            lineHeight: 1.8,
            color: 'text.primary',
            '& p': { mb: 2 },
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2 },
            '& a': { color: 'primary.main' },
            '& ul, & ol': { pr: 4, mb: 2 },
            '& blockquote': { borderRight: '4px solid', borderColor: 'divider', pr: 2, color: 'text.secondary', fontStyle: 'italic' }
          }}
          dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(news.content) }}
        />
        
        <Divider sx={{ my: 6 }} />
        
        <CommentsSection newsId={news._id} />
      </Container>
    </Box>
  );
}


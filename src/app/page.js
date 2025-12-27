import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import dbConnect from '@/lib/db';
import News from '@/models/News';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Stack from '@mui/material/Stack';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { decodeHtmlEntities } from '@/utils/html';

export const dynamic = 'force-dynamic';

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

import Comment from '@/models/Comment';

async function getNews() {
  try {
    await dbConnect();
    const news = await News.find({}).sort({ createdAt: -1 }).lean();
    
    // Fetch comment counts for each news item
    const newsWithComments = await Promise.all(news.map(async (item) => {
      const commentCount = await Comment.countDocuments({ newsId: item._id });
      return { ...item, commentCount };
    }));

    return JSON.parse(JSON.stringify(newsWithComments));
  } catch (error) {
    console.error('Database connection failed:', error);
    return [];
  }
}

function RenderHTML({ html }) {
  if (!html) return null;
  const content = decodeHtmlEntities(html);

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: content }} 
      style={{ 
        whiteSpace: 'normal',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word'
      }} 
    />
  );
}

export default async function Home() {
  const newsList = await getNews();

  // 1. Find the isHeader Item (Prioritize isHeader, then isMain, then editorSelection)
  let heroItem = newsList.find(n => n.isHeader);

  if (!heroItem) {
    heroItem = newsList.find(n => n.isMain);
  }
  if (!heroItem) {
    heroItem = newsList.find(n => n.editorSelection);
  }
  if (!heroItem && newsList.length > 0) {
    heroItem = newsList[0];
  }

  // 2. Find isMain Items (Next 4 items, excluding hero)
  const subHeroItems = newsList
    .filter(n => n._id !== heroItem?._id && n.isMain)
    .slice(0, 4);

  // 3. Regular News (Everything else)
  const regularNews = newsList.filter(n =>
    n._id !== heroItem?._id &&
    !subHeroItems.find(sub => sub._id === n._id)
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      {/* Hero Section */}
      {heroItem ? (
        <Box
          sx={{
            position: 'relative',
            height: { xs: 'auto', md: '500px' },
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Background Image with Gradient */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${heroItem.image || '/placeholder.png'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0) 80%), linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 30%)',
              }
            }}
          />

          {/* Hero Content */}
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', py: { xs: 4, md: 0 } }}>
            <Box sx={{ maxWidth: { xs: '100%', md: '50%' }, color: 'white' }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3.5rem' }
                }}
              >
                {heroItem.title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: 'rgba(255,255,255,0.8)',
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                }}
              >
              </Typography>

              <Link
                href={`/news/${heroItem._id}`}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="contained"
                  color="error"
                  endIcon={<ArrowBackIcon />}
                  sx={{
                    borderRadius: 0,
                    px: 4,
                    py: 1,
                    bgcolor: '#d32f2f',
                    '&:hover': { bgcolor: '#b71c1c' }
                  }}
                >
                  مشاهده مطالب
                </Button>
              </Link>
            </Box>
          </Container>
        </Box>
      ) : (
        <Container sx={{ py: 10 }}>
          <Typography variant="h4" color="white" align="center">خبری موجود نیست</Typography>
        </Container>
      )}

      {/* Sub Hero Items (Overlapping) */}
      {subHeroItems.length > 0 && (
        <Container maxWidth="lg" sx={{ mt: { xs: 4, md: -8 }, position: 'relative', zIndex: 3, mb: 8 }}>
          <Grid container spacing={2}>
            {subHeroItems.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item._id}>
                <Link href={`/news/${item._id}`} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: 'background.paper', // Adapted to theme
                      height: '100%',
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-5px)' },
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                      cursor: 'pointer'
                    }}
                  >
                    <Box
                      sx={{
                        height: 160,
                        backgroundImage: `url(${item.image || '/placeholder.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 'bold', mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'text.secondary', fontSize: '0.75rem', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
                            {timeAgo(item.createdAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
                            {item.commentCount || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* Regular News List */}
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ color: 'text.primary', borderRight: '4px solid #d32f2f', pr: 2 }}>
            آخرین اخبار
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {regularNews.map((news) => (
            <Grid size={{ xs: 12, md: 6 }} key={news._id}>
              <Link href={`/news/${news._id}`} style={{ textDecoration: 'none' }}>
                <Card sx={{
                  display: 'flex',
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  border: 'none',
                  alignItems: 'stretch',
                  p: 2,
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: 'action.hover', boxShadow: 3 },
                  borderRadius: 2
                }}>
                  {/* Content Section */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pl: 2 }}>
                    <Typography variant="h6" component="div" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
                      {news.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayIcon fontSize="small" sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
                          {timeAgo(news.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ChatBubbleOutlineIcon fontSize="small" sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontFamily: 'inherit' }}>
                          {news.commentCount || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Image Section */}
                  {news.image && (
                    <Box sx={{ width: 200, height: 120, position: 'relative', flexShrink: 0 }}>
                      <CardMedia
                        component="img"
                        image={news.image}
                        alt={news.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 2
                        }}
                      />
                    </Box>
                  )}
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

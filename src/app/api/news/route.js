import dbConnect from '@/lib/db';
import News from '@/models/News';
import User from '@/models/User';
import '@/models/Role'; // Ensure Role model is registered
import { decryptData } from '@/utils/security';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-98765';

const requirePermission = async (req) => {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return { error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).populate('role');
    if (!user) {
      return { error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) };
    }
    const roleName = user.role?.name || 'user';
    
    // Admins and Authors are allowed to access protected routes
    if (roleName !== 'admin' && roleName !== 'author') {
      return { error: NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 }) };
    }
    return { user, roleName };
  } catch (err) {
    return { error: NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 }) };
  }
};

export async function GET(req) {
  try {
    await dbConnect();

    // Check if the request is coming from the dashboard (authenticated)
    // We can check for the token to decide whether to filter
    const token = req.cookies.get('token')?.value;
    
    let filter = {};

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // We need to fetch the user to get the real role from DB, relying on token role is okay for quick check
        // but robust check requires DB.
        const user = await User.findById(decoded.id).populate('role');
        
        if (user) {
          const roleName = user.role?.name || 'user';
          
          // If it's an author, only show their own news
          if (roleName === 'author') {
            filter = { author: user._id };
          }
          // If it's admin, filter remains empty (show all)
          // If it's normal user or public, they see all (or we could restrict if needed)
        }
      } catch (e) {
        // Token invalid or expired, treat as public (show all)
      }
    }

    const news = await News.find(filter).sort({ createdAt: -1 }).populate('author', 'firstName lastName username');
    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    // Auth Check
    const authResult = await requirePermission(req);
    if (authResult.error) return authResult.error;
    const { user, roleName } = authResult;

    // Process Data
    const body = await req.json();
    const { payload } = body; // Encrypted news data
    
    const data = decryptData(payload);
    if (!data || !data.title || !data.content || !data.image) {
      return NextResponse.json({ success: false, message: 'Invalid data: Title, content, and image are required' }, { status: 400 });
    }

    const newsData = {
      title: data.title,
      content: data.content,
      image: data.image,
      isMain: data.isMain || false,
      author: user._id
    };

    if (roleName === 'admin') {
      newsData.editorSelection = data.editorSelection || false;
      newsData.isHeader = data.isHeader || false;
    }

    const news = await News.create(newsData);
    
    return NextResponse.json({ success: true, data: news }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();

    const authResult = await requirePermission(req);
    if (authResult.error) return authResult.error;
    const { user, roleName } = authResult;

    const body = await req.json();
    const { payload } = body;

    const data = decryptData(payload);
    if (!data || !data.id) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    const newsItem = await News.findById(data.id);
    if (!newsItem) {
      return NextResponse.json({ success: false, message: 'News not found' }, { status: 404 });
    }

    // Check ownership if not admin
    if (roleName !== 'admin' && newsItem.author.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, message: 'Forbidden: You can only edit your own articles' }, { status: 403 });
    }

    const update = {};
    if (data.title) update.title = data.title;
    if (data.content) update.content = data.content;
    if (typeof data.isMain === 'boolean') update.isMain = data.isMain;
    if (roleName === 'admin') {
      if (data.editorSelection !== undefined) update.editorSelection = data.editorSelection;
      if (data.isHeader !== undefined) update.isHeader = data.isHeader;
    }
    if (data.image !== undefined) update.image = data.image; // Allow clearing image if null/empty string passed

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, message: 'Nothing to update' }, { status: 400 });
    }

    const news = await News.findByIdAndUpdate(data.id, update, { new: true });

    return NextResponse.json({ success: true, data: news }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();

    const authResult = await requirePermission(req);
    if (authResult.error) return authResult.error;
    const { user, roleName } = authResult;

    const body = await req.json();
    const { payload } = body;

    const data = decryptData(payload);
    if (!data || !data.id) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    const newsItem = await News.findById(data.id);
    if (!newsItem) {
      return NextResponse.json({ success: false, message: 'News not found' }, { status: 404 });
    }

    // Check ownership if not admin
    if (roleName !== 'admin' && newsItem.author.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, message: 'Forbidden: You can only delete your own articles' }, { status: 403 });
    }

    await News.findByIdAndDelete(data.id);

    return NextResponse.json({ success: true, message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


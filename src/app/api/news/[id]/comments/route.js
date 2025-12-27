import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-98765';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const comments = await Comment.find({ newsId: id })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName username');
    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 });
    }

    const comment = await Comment.create({
      newsId: id,
      userId: decoded.id,
      content,
    });

    await comment.populate('userId', 'firstName lastName username');

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


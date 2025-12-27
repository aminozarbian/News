import dbConnect from '@/lib/db';
import User from '@/models/User';
import '@/models/Role';
import { decryptData } from '@/utils/security';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-98765';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { payload } = body;

    const data = decryptData(payload);
    
    if (!data || !data.username || !data.password) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 400 });
    }

    const { username, password } = data;

    const user = await User.findOne({ username }).populate('role');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }

    const roleName = user.role?.name || 'user';

    const token = jwt.sign({ id: user._id, username: user.username, role: roleName }, JWT_SECRET, {
      expiresIn: '1d',
    });

    const response = NextResponse.json({ success: true, token, role: roleName }, { status: 200 });
    
    // Set cookie for easier middleware handling if needed, though we can just return token
    response.cookies.set('token', token, {
      httpOnly: false, // Changed to false so client can read it for role check
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    response.cookies.set('isLoggedIn', 'true', {
      httpOnly: false, // Accessible to client-side JS
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


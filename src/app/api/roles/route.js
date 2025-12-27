import dbConnect from '@/lib/db';
import Role from '@/models/Role';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-98765';

const requireAdmin = async (req) => {
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
    if (roleName !== 'admin') {
      return { error: NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 }) };
    }
    return { user };
  } catch (err) {
    return { error: NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 }) };
  }
};

export async function GET(req) {
  try {
    await dbConnect();

    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const roles = await Role.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: roles }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


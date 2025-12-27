import dbConnect from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';
import { decryptData } from '@/utils/security';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-jwt-key-98765';

const passwordIsValid = (pwd) => /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

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

const sanitizeUser = (user) => {
  if (!user) return user;
  const { _id, firstName, lastName, username, role } = user;
  const roleName = role?.name || (typeof role === 'string' ? role : 'user');
  return { _id, firstName, lastName, username, role: roleName };
};

export async function GET(req) {
  try {
    await dbConnect();

    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const users = await User.find({}, '-password').sort({ username: 1 }).populate('role');
    const safeUsers = users.map(u => sanitizeUser(u));
    return NextResponse.json({ success: true, data: safeUsers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const body = await req.json();
    const { payload } = body;
    const data = decryptData(payload);

    if (!data || !data.firstName || !data.lastName || !data.username || !data.password) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    if (!passwordIsValid(data.password)) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters and include an uppercase letter, a number, and a symbol' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      userRole = await Role.create({ name: 'user', description: 'Default user role' });
      await Role.create({ name: 'admin', description: 'Administrator role' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: hashedPassword,
      role: userRole._id,
    });
    
    // Populate role for sanitizeUser
    await user.populate('role');

    return NextResponse.json({ success: true, data: sanitizeUser(user) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();

    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const body = await req.json();
    const { payload } = body;
    const data = decryptData(payload);

    if (!data || !data.id) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    const update = {};
    if (data.firstName) update.firstName = data.firstName;
    if (data.lastName) update.lastName = data.lastName;
    if (data.username) update.username = data.username;
    
    if (data.role) {
      const roleDoc = await Role.findOne({ name: data.role });
      if (roleDoc) {
        update.role = roleDoc._id;
      }
    }

    if (data.password) {
      if (!passwordIsValid(data.password)) {
        return NextResponse.json(
          { success: false, message: 'Password must be at least 8 characters and include an uppercase letter, a number, and a symbol' },
          { status: 400 }
        );
      }
      update.password = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, message: 'Nothing to update' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(data.id, update, { new: true }).populate('role');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sanitizeUser(user) }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();

    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const body = await req.json();
    const { payload } = body;
    const data = decryptData(payload);

    if (!data || !data.id) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    const user = await User.findByIdAndDelete(data.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



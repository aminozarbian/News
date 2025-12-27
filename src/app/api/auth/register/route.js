import dbConnect from '@/lib/db';
import User from '@/models/User';
import Role from '@/models/Role';
import { decryptData } from '@/utils/security';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { payload } = body; // Expecting encrypted payload

    const data = decryptData(payload);
    
    const passwordIsValid = (pwd) => /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pwd);

    if (!data || !data.firstName || !data.lastName || !data.username || !data.password) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    if (!passwordIsValid(data.password)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 8 characters and include an uppercase letter, a number, and a symbol',
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, username, password } = data;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    // Ensure roles exist
    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      userRole = await Role.create({ name: 'user', description: 'Default user role' });
      await Role.create({ name: 'admin', description: 'Administrator role' });
      await Role.create({ name: 'author', description: 'Author role' });
    } else {
      // Check if author role exists, if not create it
      const authorRole = await Role.findOne({ name: 'author' });
      if (!authorRole) {
        await Role.create({ name: 'author', description: 'Author role' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      role: userRole._id,
    });

    return NextResponse.json(
      {
        success: true,
        data: { firstName: user.firstName, lastName: user.lastName, username: user.username },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


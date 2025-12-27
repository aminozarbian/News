import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a role name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
});

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);


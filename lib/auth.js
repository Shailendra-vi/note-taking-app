import jwt from 'jsonwebtoken';
import User from '@/models/User';

export const protect = async (req) => {
  let token;
  let auth = req.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer')) {
    token = auth.split(' ')[1];
  }

  if (!token) throw new Error('Not authorized');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    throw new Error('Not authorized');
  }
};
import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import { connectDB } from './config/db.js';

const day = 24 * 60 * 60 * 1000;
const sample = [
    ['Aarav Sharma', 'aarav@example.com', '+91 98765 43210', 'admin', 'active', 1],
    ['Meera Iyer', 'meera@example.com', '+91 98111 22334', 'editor', 'active', 2],
    ['Rohan Gupta', 'rohan@example.com', '+91 99887 76655', 'viewer', 'inactive', 4],
    ['Sara Khan', 'sara@example.com', '+91 90000 11122', 'editor', 'active', 9],
    ['Liam Carter', 'liam@example.com', '+1 415 555 0134', 'viewer', 'active', 15],
    ['Noor Ahmed', 'noor@example.com', '+44 20 7946 0958', 'viewer', 'inactive', 30],
].map(([name, email, phone, role, status, ago]) => ({
    name, email, phone, role, status, createdAt: new Date(Date.now() - ago * day),
}));

// Extra generated users so pagination is visible (25 users total)
const roles = ['admin', 'editor', 'viewer'];
for (let i = 1; i <= 19; i++) {
    sample.push({
        name: `Test User ${i}`, email: `user${i}@example.com`, phone: `+91 90000 000${String(i).padStart(2, '0')}`,
        role: roles[i % 3], status: i % 4 === 0 ? 'inactive' : 'active', createdAt: new Date(Date.now() - (i + 2) * day),
    });
}

await connectDB(process.env.MONGODB_URI);
await User.deleteMany({});
await User.insertMany(sample);
console.log(`Seeded ${sample.length} users`);
await mongoose.disconnect();
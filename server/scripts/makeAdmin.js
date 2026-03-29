/**
 * Run this once to make yourself admin:
 *   node scripts/makeAdmin.js your@email.com
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];
if (!email) { console.error('Usage: node scripts/makeAdmin.js your@email.com'); process.exit(1); }

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate({ email }, { isAdmin: true }, { new: true });
  if (!user) { console.error('User not found:', email); process.exit(1); }
  console.log(`✅ ${user.name} (${user.email}) is now an admin`);
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });

const prisma = require('./prismaClient');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
  try {
    const password = "password123";
    console.log("Hashing password...");
    const hashedPassword = await argon2.hash(password);
    console.log("Hashed password successfully.");
    
    console.log("Creating user...");
    const newUser = await prisma.user.create({
      data: {
        name: "Test User 2",
        email: "test2@example.com",
        password: hashedPassword
      }
    });
    console.log("User created:", newUser);
    
    console.log("Generating token...");
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    console.log("Token generated:", token);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();

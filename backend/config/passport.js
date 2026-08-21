const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const argon2 = require('argon2');
const prisma = require('../prismaClient');

module.exports = function(passport) {
  // Local Strategy for Login
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() }
        });

        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }
        
        if (!user.isActive) {
          return done(null, false, { message: 'Account is disabled' });
        }

        let isMatch = false;
        try {
          if (user.password.startsWith('$argon2')) {
            isMatch = await argon2.verify(user.password, password);
          } else {
             // Fallback for previous bcrypt hashes if any (assuming bcrypt might be needed, but we try argon2 first)
             // If they are legacy bcrypt, they will fail unless we keep bcrypt. For now, we assume all valid users will be argon2 or we rely on argon2 failing gracefully.
             // (We uninstalled bcrypt to prefer argon2)
             isMatch = false; 
          }
        } catch (e) {
          console.error("Password verification error:", e);
        }

        if (isMatch) {
          // Never return password Hash
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } else {
          return done(null, false, { message: 'Password incorrect' });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  // JWT Strategy for protected routes
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod'
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwt_payload.id }
        });
        
        if (user && user.isActive) {
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        }
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};

import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import { prisma } from '../../lib/prisma';
import { env } from './env';

/** ================================================
 * Configure Google Strategy
 =================================================*/
export const configureGoogleStrategy = () => {
  return new GoogleStrategy(
    {
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: env.googleCallbackUrl,
    },
    
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
          const email = profile.emails?.[0]?.value;

          if (email) {
            user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  googleId: profile.id,
                  picture: profile.photos?.[0]?.value,
                },
              });
            }
          }

          if (!user) {
            const userCount = await prisma.user.count();
            user = await prisma.user.create({
              data: {
                email: email || `user_${profile.id}@google.local`,
                name: profile.displayName,
                googleId: profile.id,
                picture: profile.photos?.[0]?.value,
                role: userCount === 0 ? 'admin' : 'user',
                lastLoginAt: new Date(),
                lastActiveAt: new Date(),
                subscription: {
                  plan: 'free',
                  credits: 3,
                },
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  );
};

/** ================================================
 * Configure Passport
 =================================================*/
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

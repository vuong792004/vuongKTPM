import { prisma } from "config/client";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import 'dotenv/config';
import { comparePassword } from "services/auth.service";


const configPassport = () => {

    // Local Strategy
    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async function verify(req, email, password, done) {
            try {
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) {
                    return done(null, false, { message: 'Incorrect email/password.' });
                }
                if (user.status === "DISABLED") {
                    return done(null, false, { message: 'Your account has been disabled. Please contact support.' });
                }
                const isMatch = await comparePassword(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect email/password.' });
                }

                return done(null, user as any);
            } catch (err) {
                return done(err);
            }
        }
    ));

    // JWT Strategy
    passport.use(new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET!,
        },
        async (payload, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        id: payload.id,
                    },
                });
                if (!user) return done(null, false);
                return done(null, user);
            } catch (err) {
                return done(err, false);
            }
        }
    ));

}

export default configPassport
import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import type { User, InsertUser } from "@shared/schema";

// Available roles for new user registration (admin excluded)
export const PUBLIC_ROLES = [
  { value: "sales_manager", label: "Sales Manager" },
  { value: "finance_analyst", label: "Finance Analyst" },
  { value: "trade_development", label: "Trade Development" },
  { value: "executive", label: "Executive" }
];

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: any) => {
      try {
        // Check if user exists
        let user = await storage.getUserByProviderId('google', profile.id);
        
        if (!user) {
          // Check if email already exists with different provider
          const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          if (existingUser) {
            return done(new Error('Email already registered with different provider'), false);
          }

          // Create new user - they'll need to complete registration with role selection
          const userData: InsertUser = {
            id: nanoid(),
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
            profileImageUrl: profile.photos?.[0]?.value || null,
            provider: 'google',
            providerId: profile.id,
            emailVerified: true,
            role: null, // Will be set during registration completion
            lastLogin: new Date(),
          };
          user = await storage.createUser(userData);
        } else {
          // Update last login
          await storage.updateUser(user.id, { lastLogin: new Date() });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Microsoft OAuth Strategy
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(new MicrosoftStrategy({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: "/api/auth/microsoft/callback",
      scope: ['user.read']
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Check if user exists
        let user = await storage.getUserByProviderId('microsoft', profile.id);
        
        if (!user) {
          // Check if email already exists with different provider
          const existingUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
          if (existingUser) {
            return done(new Error('Email already registered with different provider'), false);
          }

          // Create new user - they'll need to complete registration with role selection
          const userData: InsertUser = {
            id: nanoid(),
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
            profileImageUrl: profile.photos?.[0]?.value || null,
            provider: 'microsoft',
            providerId: profile.id,
            emailVerified: true,
            role: null, // Will be set during registration completion
            lastLogin: new Date(),
          };
          user = await storage.createUser(userData);
        } else {
          // Update last login
          await storage.updateUser(user.id, { lastLogin: new Date() });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Local Strategy for business email registration
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.hashedPassword) {
        return done(null, false);
      }

      const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
      if (!isValidPassword) {
        return done(null, false);
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Auth routes
  setupAuthRoutes(app);
}

function setupAuthRoutes(app: Express) {
  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
    (req, res) => {
      const user = req.user as any;
      if (!user.role) {
        // Redirect to role selection
        res.redirect('/complete-registration');
      } else {
        res.redirect('/');
      }
    }
  );

  // Microsoft OAuth routes
  app.get('/api/auth/microsoft',
    passport.authenticate('microsoft')
  );

  app.get('/api/auth/microsoft/callback',
    passport.authenticate('microsoft', { failureRedirect: '/login?error=oauth_failed' }),
    (req, res) => {
      const user = req.user as any;
      if (!user.role) {
        // Redirect to role selection
        res.redirect('/complete-registration');
      } else {
        res.redirect('/');
      }
    }
  );

  // Local auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, role, department } = req.body;

      // Validate role is allowed for new users
      if (!PUBLIC_ROLES.some(r => r.value === role)) {
        return res.status(400).json({ message: 'Invalid role selected' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userData: InsertUser = {
        id: nanoid(),
        email,
        firstName,
        lastName,
        hashedPassword,
        role,
        department,
        provider: 'local',
        emailVerified: false,
        lastLogin: new Date(),
      };
      const user = await storage.createUser(userData);

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Registration successful but login failed' });
        }
        res.json({ user: { id: user.id, email: user.email, role: user.role } });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login',
    passport.authenticate('local', { failureMessage: true }),
    (req, res) => {
      const user = req.user as any;
      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    }
  );

  // Complete registration for OAuth users
  app.post('/api/auth/complete-registration', isAuthenticated, async (req, res) => {
    try {
      const { role, department } = req.body;
      const user = req.user as any;

      // Validate role is allowed for new users
      if (!PUBLIC_ROLES.some(r => r.value === role)) {
        return res.status(400).json({ message: 'Invalid role selected' });
      }

      // Update user with role and department
      await storage.updateUser(user.id, { role, department });

      // Get updated user
      const updatedUser = await storage.getUser(user.id);
      res.json({ user: { id: updatedUser?.id, email: updatedUser?.email, role: updatedUser?.role } });
    } catch (error) {
      console.error('Complete registration error:', error);
      res.status(500).json({ message: 'Failed to complete registration' });
    }
  });

  // Get current user
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        profileImageUrl: user.profileImageUrl
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Get available roles for registration
  app.get('/api/auth/roles', (req, res) => {
    res.json(PUBLIC_ROLES);
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    if (!user.role) {
      return res.status(403).json({ message: 'Registration incomplete' });
    }
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = req.user as any;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};
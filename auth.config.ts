import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool3 from "@/utils/dbAdmin";

const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        console.log("Credentials", credentials);

        // Query the database to find the user
        const [rows]: any = await pool3
          .promise()
          .query("SELECT * FROM admin_panel_users WHERE email = ? LIMIT 1", [
            credentials.username,
          ]);

        const user = Array.isArray(rows) ? rows[0] : null;
        if (!user) return null;

        // Check if the user is inactive
        if (!user.isActive) {
          throw new Error(
            "User is not active. Please contact the administrator."
          );
        }

        // Validate password
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!passwordMatch) {
          throw new Error("Invalid credentials. Please try again.");
        }

        return {
          id: user.id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    error: "/super-admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export default authConfig;

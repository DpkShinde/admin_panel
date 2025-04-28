import CredentialsProvider from "next-auth/providers/credentials";
console.log("Auth config loaded");

const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('Received credentials:', credentials);
        if (
          credentials?.username === process.env.USER_NAME &&
          credentials?.password === process.env.PASSWORD
        ) {
          return {
            message: "Login successful",
            id: "1",
            name: "Admin",
            email: "admin@example.com",
          };
        }
        // Return null if authentication fails
        console.log('Authentication failed');
        return null;
      },
    }),
  ],
  pages: {
    error: '/super-admin/login',  
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authConfig;

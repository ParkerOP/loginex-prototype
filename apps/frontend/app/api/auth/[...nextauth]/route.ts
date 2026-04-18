import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        phone: {
          label: "Phone Number",
          type: "text",
          placeholder: "e.g. 9876543210",
        },
        otp: {
          label: "OTP",
          type: "text",
          placeholder: "Any 4 digits for prototype",
        },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        // Prototype logic: Accept any 4-digit OTP
        if (credentials.otp.length === 4) {
          const role = credentials.role || "SHIPPER";

          return {
            id: `${role.toLowerCase()}-prototype-id-1`,
            name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}`,
            email: `${credentials.phone}@demo.com`,
            role: role,
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string; role?: string }).id =
          token.sub as string;
        (session.user as { id?: string; role?: string }).role =
          token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "prototype-secret-key",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

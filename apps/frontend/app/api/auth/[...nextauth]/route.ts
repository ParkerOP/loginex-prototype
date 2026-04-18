import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: {
        phone: { label: "Phone Number", type: "text", placeholder: "e.g. 9876543210" },
        otp: { label: "OTP", type: "text", placeholder: "Any 4 digits for prototype" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        // Prototype logic: Accept any 4-digit OTP
        if (credentials.otp.length === 4) {
          // Return a mock shipper user
          return {
            id: "shipper-prototype-id-1",
            name: "Demo Shipper",
            email: `${credentials.phone}@demo.com`,
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
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
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

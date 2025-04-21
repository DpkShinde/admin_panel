import { getSession } from "next-auth/react";
import { getToken } from "next-auth/jwt";

export const getServerSession = async (context : any) => {
  return await getSession(context);
};

export const getTokenForMiddleware = async (req : any) => {
  return await getToken({ req });
};

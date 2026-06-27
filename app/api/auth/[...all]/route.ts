import { auth } from "@/lib/auth/auth"; // your Better Auth instance
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
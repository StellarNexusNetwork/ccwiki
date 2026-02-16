import {createAuthClient} from "better-auth/vue";
import {passkeyClient} from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: "https://auth.snnetwork.top/",
  plugins: [passkeyClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession
} = authClient;

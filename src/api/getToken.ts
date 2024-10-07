import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function getToken(): Promise<string> {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    {
      grant_type: "client_credentials",
    },
    { headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization:'Basic ' + btoa(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID + ':' + process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET)
     } }
  );
  return response.data.access_token;
}

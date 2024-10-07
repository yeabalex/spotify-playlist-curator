import axios from "axios";
//import { getToken } from "./getToken";

export class GetMetadata{
  private artistId: string;
  private trackId: string;
  constructor(artistId?: string, trackId?: string) {
    this.artistId = artistId || "";
    this.trackId = trackId || "";
  }

  async getArtist(token: string) {
    const response = await axios.get(`https://api.spotify.com/v1/artists/${this.artistId}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }

  async getTrack(token: string) {
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${this.trackId}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
}

export default GetMetadata;

import axios, { AxiosError } from "axios";
//import { getToken } from "./getToken";

abstract class FetchRecommendedSongsToken {
    abstract fetchRecommendedSongs(artists: string[], tracks: string[], genres: string[], token: string): Promise<string[]>;
}

export class FetchRecommendedSongs extends FetchRecommendedSongsToken {
    private artists: string[];
    private tracks: string[];
    private genres: string[];
    private token: string;


    constructor(artists: string[], tracks: string[], genres: string[], token: string) {
        super();
        this.token = token;
        this.artists = artists;
        this.tracks = tracks;
        this.genres = genres;
    }

  //  async setToken(){
  //      this.token = await getToken();
  //  }

    async fetchRecommendedSongs() {
        try {
            const response = await axios.get(`https://api.spotify.com/v1/recommendations?seed_artists=${this.artists}&seed_tracks=${this.tracks}&seed_genres=${this.genres}&limit=10`, {
                headers: {
                    Authorization: `Bearer ${this.token}`
                }
            });
            console.log(response.data.tracks[0].album)
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response) {
                    console.error(`Error status: ${axiosError.response.status}`);
                    console.error(`Error data: ${JSON.stringify(axiosError.response.data)}`);
                } else if (axiosError.request) {
                    console.error('No response received:', axiosError.request);
                } else {
                    console.error('Error setting up request:', axiosError.message);
                }
            } else {
                console.error('Unexpected error:', error);
            }
            throw error;
        }
    }
}
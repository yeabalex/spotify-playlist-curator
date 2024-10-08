# Spotify Playlist Curator

Welcome to the Spotify Playlist Curator app! This application helps you discover and curate personalized playlists based on your favorite artists, tracks, and genres.

## Features

- Fetch recommended songs based on seed artists, tracks, and genres
- Retrieve detailed metadata for artists and tracks
- Secure authentication with Spotify API using client credentials flow

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Spotify Developer account and API credentials

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yeabalex/spotify-playlist-curator.git
   cd spotify-playlist-curator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Spotify API credentials:
   ```
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
   NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Use the `FetchRecommendedSongs` class to get song recommendations:
   ```typescript
   const fetcher = new FetchRecommendedSongs(artists, tracks, genres, token);
   const recommendations = await fetcher.fetchRecommendedSongs();
   ```

2. Retrieve artist or track metadata using the `GetMetadata` class:
   ```typescript
   const metadata = new GetMetadata(artistId, trackId);
   const artistData = await metadata.getArtist(token);
   const trackData = await metadata.getTrack(token);
   ```

## Future Enhancements

Here are some planned enhancements:

1. Server-side requests: Implement server-side API calls to enhance security and prevent exposure of sensitive information on the client-side.

2. Save generated playlists: Add functionality to save the curated playlists directly to the user's Spotify account.

3. User authentication: Implement Spotify user authentication to allow access to user-specific data and enable playlist saving.

4. Improved recommendation algorithms: Enhance the recommendation system to provide more accurate and diverse song suggestions.

5. Custom playlist parameters: Allow users to specify additional parameters like tempo, popularity, and audio features for more tailored recommendations.

I am open to contributions to these enhancements. If you're interested in working on any of these features, please feel free to submit a Pull Request.

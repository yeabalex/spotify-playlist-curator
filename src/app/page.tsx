"use client";

import { useState, useEffect, useRef } from "react";
import { genres } from "@/constants/genres";
import Image from "next/image";
import { getToken } from "@/api/getToken";
import { FetchRecommendedSongs } from "@/api/fetchRecommendedSongs";
import { GetMetadata } from "@/api/getMetadata";

interface RecommendedTrack {
  name: string;
  artists: [artist:{id:string, external_urls:{spotify:string}, name: string}]
  album: {images:[{url:string}]};
  previewUrl: string;
  duration: number;
  
}




export default function Home() {
  const [artists, setArtists] = useState<string[]>([]);
  const [tracks, setTracks] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentArtist, setCurrentArtist] = useState<string>("");
  const [artistName, setArtistName] = useState<string[]>([]);
  const [trackName, setTrackName] = useState<string[]>([]);
  const [currentTrack, setCurrentTrack] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [displayedGenres, setDisplayedGenres] = useState<string[]>([]);
  const [recommendedTracks, setRecommendedTracks] = useState<RecommendedTrack[]>([]);
  const [playingTrack, setPlayingTrack] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showAllTracks, setShowAllTracks] = useState<boolean>(false);
  const [isAddingArtist, setIsAddingArtist] = useState<boolean>(false);
  const [isAddingTrack, setIsAddingTrack] = useState<boolean>(false);
  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState<boolean>(false);
  const [isPlaylistGenerated, setIsPlaylistGenerated] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => { 
  async function fetchToken(){
      const token = await getToken();
      setToken(token);
    }
   fetchToken();
  }, []);

  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
    const randomGenres = genres.sort(() => 0.5 - Math.random()).slice(0, 10);
    setDisplayedGenres(randomGenres);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const isSpotifyLink = (link: string): boolean => {
    return link.startsWith('https://open.spotify.com/') || link.startsWith('spotify:');
  };

  const extractId = (link: string): string => {
    const parts = link.split('/');
    return parts[parts.length - 1].split('?')[0];
  };

  const addArtist = async () => {
    if (artists.length < 5 && currentArtist) {
      setIsAddingArtist(true);
      if (isSpotifyLink(currentArtist)) {
        try {
          const artistId = extractId(currentArtist);
          const getMetadata = new GetMetadata(artistId);
          //console.log(token);
          const artist = await getMetadata.getArtist(token);
          setArtistName((prevArtistName) => [...prevArtistName, artist.name]);
          setArtists([...artists, artistId]);
          setCurrentArtist("");
          setError("");
        } catch (error) {
          setError(`Error adding artist. Please try again.${error}`);
        } finally {
          setIsAddingArtist(false);
        }
      } else {
        setError("Please enter a valid Spotify artist link.");
        setIsAddingArtist(false);
      }
    }
  };

  const removeArtist = (index: number) => {
    setArtists(artists.filter((_, i) => i !== index));
    setArtistName(artistName.filter((_, i) => i !== index));
  };

  const addTrack = async () => {
    if (tracks.length < 5 && currentTrack) {
      setIsAddingTrack(true);
      if (isSpotifyLink(currentTrack)) {
        try {
          const trackId = extractId(currentTrack);
          const getMetadata = new GetMetadata(undefined,trackId);
          const track = await getMetadata.getTrack(token);
          setTrackName((prevTrackName) => [...prevTrackName, track.name]);
          setTracks([...tracks, trackId]);
          setCurrentTrack("");
          setError("");
        } catch (error) {
          setError(`Error adding track. Please try again. ${error}`);
        } finally {
          setIsAddingTrack(false);
        }
      } else {
        setError("Please enter a valid Spotify track link.");
        setIsAddingTrack(false);
      }
    }
  };

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
    setTrackName(trackName.filter((_, i) => i !== index));
  };

  const handleGenreSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term) {
      const filteredGenres = genres.filter(genre => genre.toLowerCase().includes(term));
      setDisplayedGenres(filteredGenres);
    } else {
      const randomGenres = genres.sort(() => 0.5 - Math.random()).slice(0, 10);
      setDisplayedGenres(randomGenres);
    }
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else if (selectedGenres.length < 5) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const removeGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter(g => g !== genre));
  };

  const generatePlaylist = async () => {
    setIsGeneratingPlaylist(true);
    try {
      const fetchRecommendedSongs = new FetchRecommendedSongs(artists, tracks, selectedGenres, token);
      const result = await fetchRecommendedSongs.fetchRecommendedSongs();
      setRecommendedTracks(result.tracks);
      setError("");
      setIsPlaylistGenerated(true);
    } catch(error) {
      setError(`Error generating playlist. Fill at least two fields. ${error}`);
    } finally {
      setIsGeneratingPlaylist(false);
    }
  };

  const formatDuration = (ms: number | undefined) => {
    if (ms === undefined) {
      return 
    }
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = (previewUrl: string | undefined) => {
    if (playingTrack === previewUrl) {
      audioRef.current?.pause();
    } else {
      if (audioRef.current) {
        audioRef.current.src = previewUrl || '';
        audioRef.current.play();
      }
      setPlayingTrack(previewUrl || '');
    }
  };

  return (
    <div className={`min-h-screen py-8 px-2 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-gray-100 to-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Image src="/spotify.png" alt="Spotify Logo" width={50} height={50} className="mr-4" />
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold ${darkMode ? 'text-spotify-green' : 'text-spotify-green-dark'} tracking-tight`}>Spotify Playlist Curator</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full shadow-lg transition-all duration-300 ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-sm sm:text-base mb-12">Curated playlist in one click. Useful tool for playlist curators and record labels. Made with ❤️ by <a href="https://linktr.ee/yeabsira.io" target="_blank" rel="noopener noreferrer" className="text-spotify-green hover:underline text-green-500 font-bold">Yeabsira :)</a></p>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        )}

        <div className="space-y-12">
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-4 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Similar/Favorite Artists <span className="text-xs sm:text-sm font-normal">(Max 5)</span></h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {artistName.map((artist, index) => (
                <div key={index} className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {artist}
                  <button onClick={() => removeArtist(index)} className="ml-2 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter Spotify artist link"
                className={`flex-grow p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition duration-300 text-sm sm:text-base ${darkMode ? 'bg-gray-800 border-gray-700 focus:border-spotify-green focus:ring-spotify-green' : 'bg-white border-gray-300 focus:border-spotify-green-dark focus:ring-spotify-green-dark'}`}
                value={currentArtist}
                onChange={(e) => setCurrentArtist(e.target.value)}
              />
              <button
                onClick={addArtist}
                className="bg-[#1DB954] hover:bg-opacity-90 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition duration-300 text-sm sm:text-base flex items-center justify-center"
                disabled={artists.length >= 5 || !currentArtist || isAddingArtist}
              >
                {isAddingArtist ? (
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Add"}
              </button>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Similar/Favorite Tracks <span className="text-xs sm:text-sm font-normal">(Max 5)</span></h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {trackName.map((track, index) => (
                <div key={index} className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {track}
                  <button onClick={() => removeTrack(index)} className="ml-2 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter Spotify track link"
                className={`flex-grow p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition duration-300 text-sm sm:text-base ${darkMode ? 'bg-gray-800 border-gray-700 focus:border-spotify-green focus:ring-spotify-green' : 'bg-white border-gray-300 focus:border-spotify-green-dark focus:ring-spotify-green-dark'}`}
                value={currentTrack}
                onChange={(e) => setCurrentTrack(e.target.value)}
              />
              <button
                onClick={addTrack}
                className="bg-[#1DB954] hover:bg-opacity-90 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition duration-300 text-sm sm:text-base flex items-center justify-center"
                disabled={tracks.length >= 5 || !currentTrack || isAddingTrack}
              >
                {isAddingTrack ? (
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Add"}
              </button>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Select Genres <span className="text-xs sm:text-sm font-normal">(Max 5)</span></h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {selectedGenres.map((genre) => (
                <div key={genre} className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {genre}
                  <button onClick={() => removeGenre(genre)} className="ml-2 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search for a genre"
              className={`w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 transition duration-300 text-sm sm:text-base mb-4 ${darkMode ? 'bg-gray-800 border-gray-700 focus:border-spotify-green focus:ring-spotify-green' : 'bg-white border-gray-300 focus:border-spotify-green-dark focus:ring-spotify-green-dark'}`}
              value={searchTerm}
              onChange={handleGenreSearch}
            />
            <div className="flex flex-wrap gap-3">
              {displayedGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    selectedGenres.includes(genre)
                      ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                      : darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                  disabled={selectedGenres.length >= 5 && !selectedGenres.includes(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="w-full bg-[#1DB954] hover:bg-opacity-90 text-white font-bold py-3 px-4 sm:py-4 sm:px-6 rounded-lg transition duration-300 shadow-lg text-sm sm:text-base flex items-center justify-center"
            onClick={generatePlaylist}
            disabled={isGeneratingPlaylist || isPlaylistGenerated}
          >
            {isGeneratingPlaylist ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : isPlaylistGenerated ? "Playlist Generated" : "Generate Playlist"}
          </button>

          {recommendedTracks.length > 0 && (
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Your Playlist</h2>
              <div className="space-y-4">
                {recommendedTracks.slice(0, showAllTracks ? recommendedTracks.length : 0).map((track: {album:{images:[{url:string}]}, name:string, preview_url?:string, external_urls?:{spotify:string}, artists:[artist:{id:string, external_urls:{spotify:string}, name: string}], duration_ms?:number}, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-white bg-opacity-20">
                    <div className="relative group">
                      <Image src={track.album.images[0].url} alt={track.name} width={120} height={120} className="rounded-md" />
                      {track.preview_url ? (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 rounded-md">
                          <button onClick={() => togglePlay(track.preview_url)} className="text-white">
                            {playingTrack === track.preview_url ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                          <p className="text-white text-xs text-center px-2">No preview available</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-5 flex-grow">
                      <div className="">
                      <h3 className="font-semibold text-xl max-w-40 md:max-w-full overflow-hidden">
                        <a href={track.external_urls?.spotify} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          <div className="sm:hidden inline-block whitespace-nowrap overflow-hidden" style={{
                            
                            animation: track.name.length > 14 ? 'marquee 15s linear infinite' : 'none'
                          }}>
                            {track.name}
                          </div>
                          <span className="hidden sm:inline-block">{track.name}</span>
                        </a>
                      </h3>
                      <p className="text-sm text-gray-300">
                        {track.artists.map((artist, index:number) => (
                          <span key={artist.id}>
                            {index > 0 && ", "}
                            <a href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {artist.name}
                            </a>
                          </span>
                        ))}
                      </p>
                      </div>
                      <div className="flex justify-start gap-5 items-center">
                      <p className="text-xs text-gray-400">
                        {formatDuration(track.duration_ms)}
                      </p>
                      {track.preview_url && (
                        <p className="text-xs text-gray-400 mt-1">Hover to preview</p>
                      )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {recommendedTracks.length > 5 && (
                <button
                  onClick={() => setShowAllTracks(!showAllTracks)}
                  className="mt-4 w-full bg-[#1DB954] hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-sm"
                >
                  {showAllTracks ? "Show Less" : "Show All"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <audio ref={audioRef} />
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

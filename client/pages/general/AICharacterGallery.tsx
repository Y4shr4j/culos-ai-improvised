import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { get } from "../../src/utils/api";
import { useAuth } from "../../src/contexts/AuthContext";

interface Character {
  _id: string;
  id?: string;
  name: string;
  description: string;
  avatar: string;
  personality: string;
  traits?: string[];
  category?: string;
  isActive?: boolean;
  systemPrompt?: string;
}

const AICharacterGallery: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const { user: authUser, token, loading: authLoading } = useAuth();

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try multiple endpoints in order of preference
      const endpoints = ['/chat/characters', '/characters', '/admin/characters'];
      let charactersArray: Character[] = [];
      let lastError: any = null;
      
      for (const endpoint of endpoints) {
        try {
          const response = await get<any>(endpoint);
          
          // Handle different response formats
          if (Array.isArray(response)) {
            charactersArray = response;
            break;
          } else if (response && response.characters && Array.isArray(response.characters)) {
            charactersArray = response.characters;
            break;
          } else if (response && Array.isArray(response.data)) {
            charactersArray = response.data;
            break;
          }
        } catch (error) {
          lastError = error;
          console.warn(`Failed to fetch from ${endpoint}:`, error);
          continue;
        }
      }
      
      if (charactersArray.length === 0) {
        throw lastError || new Error('No characters found');
      }
      
      // Filter only active characters for display
      const activeCharacters = charactersArray.filter(char => 
        char.isActive !== false && char.name && char.avatar
      );
      
      setCharacters(activeCharacters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      setError("Failed to load characters. Please try again later.");
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchCharacters();
  };

  const handleLogout = async () => {
    try {
      await get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (token && !authLoading) {
          const userData = await get<any>('/auth/me');
          setUser(userData);
          
          // Also fetch tokens
          try {
            const tokenData = await get<any>('/auth/tokens');
            setTokens(tokenData.tokens);
          } catch (tokenError) {
            console.warn('Failed to fetch tokens:', tokenError);
            setTokens(0);
          }
        } else {
          setUser(null);
          setTokens(null);
        }
      } catch (error) {
        setUser(null);
        setTokens(null);
      }
    };

    fetchUserData();
  }, [token, authUser, authLoading]);

  useEffect(() => {
    fetchCharacters();
  }, [retryCount]);

  const handleCharacterClick = (character: Character) => {
    // Navigate to chat with this character
    const characterId = character._id || character.id;
    if (characterId) {
      window.location.href = `/chat?character=${characterId}`;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] from-[17%] to-[#513238] to-[25%] text-culosai-gold font-norwester text-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-culosai-accent-gold mx-auto"></div>
          <p className="mt-4 text-culosai-cream">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] from-[17%] to-[#513238] to-[25%] text-culosai-gold font-norwester text-xl">
      <Navbar user={user} tokens={tokens} onLogout={handleLogout} />

      <main className="px-4 md:px-10 py-8 md:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Start Chat Button */}
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 mb-16 justify-center">
            {/* Generate Images Card */}
            <Link to="/aiimagegeneration" className="w-full lg:w-auto">
              <div className="flex flex-col items-center gap-3 p-6 md:p-8 bg-[#813521] rounded-[20px] hover:bg-[#913721] transition-colors w-full lg:w-[320px]">
                <h2 className="text-culosai-cream font-norwester text-2xl md:text-[32px] text-center">
                  Generate Images
                </h2>
                <div className="flex items-center gap-4">
                  <div className="px-6 py-2 rounded-[25px]" style={{ backgroundColor: '#FCEDBC' }}>
                    <span className="font-norwester text-xl md:text-2xl" style={{ color: '#42100B' }}>
                      generate
                    </span>
                  </div>
                  <svg
                    width="37"
                    height="31"
                    viewBox="0 0 37 31"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M36 27.1V23.797C36 23.124 35.7455 22.4759 35.2876 21.9827L30.7787 17.1259C29.2016 15.4271 26.6446 15.4271 25.0675 17.1259L24.4928 17.7449C23.4377 18.8814 21.6392 18.8814 20.5842 17.7449L15.971 12.7759C14.3939 11.0771 11.8369 11.0771 10.2598 12.7759L1.71237 21.9827C1.25447 22.4759 1 23.124 1 23.797V27.1C1 28.7016 2.20539 30 3.69231 30H33.3077C34.7946 30 36 28.7016 36 27.1Z"
                      fill="#F5EDD0"
                    />
                    <path
                      d="M9.6917 9.75541C12.0567 9.63316 12.2591 12.3867 10.0725 12.716C7.82817 12.8876 7.40079 10.151 9.6917 9.75541Z"
                      fill="#F5EDD0"
                    />
                    <path
                      d="M18.0414 9.75647C20.6581 9.71171 20.9154 12.1247 18.8349 12.7171C16.5304 12.9486 15.8856 10.6584 18.0414 9.75647Z"
                      fill="#F5EDD0"
                    />
                    <path
                      d="M27.1142 9.75491C29.2978 9.53694 29.7267 12.1856 27.5732 12.7155C25.1569 12.8646 24.8049 10.0267 27.1142 9.75491Z"
                      fill="#F5EDD0"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Generate Videos Card */}
            <Link to="/aivideogeneration" className="w-full lg:w-auto">
              <div className="flex flex-col items-center gap-3 p-6 md:p-8 bg-[#42100B] rounded-[20px] cursor-pointer hover:bg-opacity-90 transition-colors w-full lg:w-[320px]">
                <h2 className="text-culosai-cream font-norwester text-2xl md:text-[32px] text-center">
                  Generate Videos
                </h2>
                <div className="flex items-center gap-4">
                  <div className="px-6 py-2 rounded-[25px]" style={{ backgroundColor: '#FCEDBC' }}>
                    <span className="font-norwester text-xl md:text-2xl" style={{ color: '#42100B' }}>
                      generate
                    </span>
                  </div>
                  <svg
                    width="41"
                    height="27"
                    viewBox="0 0 41 27"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27.8077 10.7222L37.005 1.98209C37.9257 1.10714 39.5 1.72682 39.5 2.96419V24.0358C39.5 25.2732 37.9257 25.8929 37.005 25.0179L27.8077 16.2778M5.88462 26H23.4231C25.8446 26 27.8077 24.1345 27.8077 21.8333V5.16667C27.8077 2.86548 25.8446 1 23.4231 1H5.88462C3.46306 1 1.5 2.86548 1.5 5.16667V21.8333C1.5 24.1345 3.46306 26 5.88462 26Z"
                      stroke="#F5EDD0"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Characters Card */}
            <Link to="/chat" className="w-full lg:w-auto">
              <div className="flex flex-col items-center gap-3 p-6 md:p-8 bg-[#463034] rounded-[20px] cursor-pointer hover:bg-opacity-90 transition-colors w-full lg:w-[320px]">
                <h2 className="text-culosai-cream font-norwester text-2xl md:text-[32px] text-center">
                  Characters
                </h2>
                <div className="flex items-center gap-4">
                  <div className="px-6 py-2 rounded-[25px]" style={{ backgroundColor: '#FCEDBC' }}>
                    <span className="font-norwester text-xl md:text-2xl" style={{ color: '#42100B' }}>
                      generate
                    </span>
                  </div>
                  <svg
                    width="37"
                    height="29"
                    viewBox="0 0 37 29"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M28.9971 0.400391C30.0842 0.399948 31.0694 0.418928 31.9346 0.516602C32.7995 0.614244 33.5511 0.791116 34.1689 1.10742C34.789 1.4249 35.273 1.8825 35.6006 2.53711C35.927 3.18961 36.0954 4.03212 36.0986 5.11523L36.0996 17.1211C36.0996 18.3318 36.0277 19.5273 35.5098 20.5117C34.9876 21.504 34.0216 22.2668 32.2725 22.6348C31.0474 22.8924 29.636 22.7808 28.4014 22.7803L23.4316 22.7764H17.5039C16.8532 23.0916 14.4584 24.5222 12.1689 25.8887C11.0149 26.5774 9.88943 27.2486 9.0332 27.749C8.60544 27.999 8.24396 28.2064 7.97949 28.3525C7.8475 28.4255 7.73852 28.484 7.65723 28.5244C7.61676 28.5445 7.58182 28.5615 7.55371 28.5732C7.53976 28.5791 7.526 28.5839 7.51367 28.5879C7.50291 28.5914 7.48675 28.5964 7.46973 28.5977C7.16496 28.6198 6.9492 28.5019 6.80957 28.3008C6.67574 28.1078 6.61608 27.8451 6.5918 27.5791C6.56731 27.3107 6.57774 27.025 6.59375 26.7764C6.61012 26.5222 6.63179 26.3163 6.63184 26.1885L6.63477 22.7783C5.22404 22.8348 4.15504 22.6585 3.3457 22.2949C2.514 21.9212 1.96198 21.3554 1.59863 20.6621C1.23666 19.9713 1.06329 19.1572 0.979492 18.2891C0.895737 17.421 0.900787 16.4898 0.901367 15.5645L0.900391 6.31738C0.899846 4.46738 1.13451 3.02731 1.99512 2.0293C2.85774 1.02901 4.32709 0.495885 6.73145 0.401367H6.73535L28.9971 0.400391ZM23.6436 1.83008C17.6421 1.83043 11.6341 1.7668 5.63574 1.8291C4.75099 1.96893 4.11801 2.22583 3.66406 2.56152C3.21026 2.8972 2.9292 3.31747 2.75586 3.79395C2.58193 4.27219 2.51609 4.80873 2.49414 5.37695C2.47212 5.94739 2.4944 6.53712 2.49414 7.13184L2.49512 16.3525L2.48242 17.0654C2.47605 17.3054 2.46923 17.5461 2.46973 17.7861C2.47074 18.2668 2.49931 18.7396 2.60547 19.1836V19.1846C2.80715 20.0272 3.22843 20.5346 3.74707 20.8467C4.26992 21.1613 4.89981 21.282 5.52441 21.335C5.83626 21.3614 6.1448 21.3712 6.43555 21.3799C6.72473 21.3886 6.99923 21.3962 7.23828 21.4209C7.47595 21.4454 7.68985 21.4879 7.85449 21.5693C8.02363 21.653 8.14652 21.7816 8.18457 21.9746C8.22478 22.1784 8.22757 22.4061 8.22168 22.627C8.21563 22.8532 8.2009 23.0662 8.20215 23.2617L8.20312 26.4814L13.2539 23.543C14.0787 23.0548 14.644 22.6776 15.0928 22.3838C15.5405 22.0907 15.8781 21.8772 16.2412 21.7266C16.9696 21.4244 17.7913 21.3777 19.8145 21.3779L25.4238 21.3799L29.0332 21.3828C30.0788 21.3829 30.943 21.3606 31.6523 21.2637C32.3618 21.1668 32.9079 20.9969 33.3223 20.707C34.1436 20.1324 34.4884 19.0576 34.4902 16.9922L34.4912 14.2236C34.4923 11.2292 34.5481 8.23089 34.4844 5.24121C34.4661 4.37965 34.3456 3.74088 34.127 3.2666C33.9098 2.79572 33.5936 2.48195 33.1729 2.27051C32.7486 2.05742 32.2135 1.94583 31.5576 1.88867C30.9021 1.83157 30.1345 1.83003 29.2471 1.83008H23.6436Z"
                      fill="#FFEBB6"
                      stroke="#FFEBB6"
                      strokeWidth="0.2"
                    />
                    <path
                      d="M9.6917 9.75541C12.0567 9.63316 12.2591 12.3867 10.0725 12.716C7.82817 12.8876 7.40079 10.151 9.6917 9.75541Z"
                      fill="#FFEBB6"
                    />
                    <path
                      d="M18.0414 9.75647C20.6581 9.71171 20.9154 12.1247 18.8349 12.7171C16.5304 12.9486 15.8856 10.6584 18.0414 9.75647Z"
                      fill="#FFEBB6"
                    />
                    <path
                      d="M27.1142 9.75491C29.2978 9.53694 29.7267 12.1856 27.5732 12.7155C25.1569 12.8646 24.8049 10.0267 27.1142 9.75491Z"
                      fill="#FFEBB6"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Character Gallery */}
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="text-culosai-cream font-norwester text-2xl md:text-3xl mb-4">
                AI Chat Characters
              </h2>
              <p className="text-culosai-accent-gold text-sm md:text-base">
                Choose a character to start chatting with AI personalities
              </p>
            </div>

            {loading ? (
              <div className="text-left text-culosai-cream">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-culosai-accent-gold mb-4"></div>
                <p className="mb-6">Loading characters...</p>
                
                {/* Loading skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {[...Array(10)].map((_, index) => (
                    <div key={index} className="relative overflow-hidden rounded-lg shadow-lg bg-[#171717] animate-pulse">
                      <div className="aspect-square bg-culosai-dark bg-opacity-50"></div>
                      <div className="p-3">
                        <div className="h-4 bg-culosai-dark bg-opacity-50 rounded mb-2"></div>
                        <div className="h-3 bg-culosai-dark bg-opacity-30 rounded mb-2"></div>
                        <div className="h-6 bg-culosai-dark bg-opacity-20 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-left text-culosai-cream">
                <p className="text-lg text-red-400">{error}</p>
                <button 
                  onClick={handleRetry} 
                  className="mt-2 px-4 py-2 bg-culosai-accent-gold text-culosai-dark rounded hover:bg-opacity-80 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : characters.length === 0 ? (
              <div className="text-left text-culosai-cream">
                <p className="text-lg">No characters found</p>
                <p className="text-sm text-culosai-accent-gold">Add some characters from the admin panel</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {characters.map((character) => (
                  <div key={character._id || character.id} className="relative group overflow-hidden rounded-lg shadow-lg bg-[#171717] cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => handleCharacterClick(character)}>
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      
                      {character.isActive === false && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center p-4 text-center text-white">
                          <p className="font-semibold text-sm">Coming Soon</p>
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-3 text-white">
                          <p className="text-xs line-clamp-2">{character.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="text-culosai-cream font-norwester text-sm font-semibold truncate mb-1">
                        {character.name}
                      </h3>
                      <p className="text-culosai-accent-gold font-norwester text-xs truncate mb-2">
                        {character.personality}
                      </p>
                      {character.category && (
                        <span className="inline-block px-2 py-1 bg-culosai-accent-gold bg-opacity-20 text-culosai-accent-gold text-xs rounded-full">
                          {character.category}
                        </span>
                      )}
                      {character.traits && character.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {character.traits.slice(0, 2).map((trait, index) => (
                            <span key={index} className="px-1.5 py-0.5 bg-culosai-dark bg-opacity-50 text-culosai-accent-gold text-xs rounded">
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AICharacterGallery; 
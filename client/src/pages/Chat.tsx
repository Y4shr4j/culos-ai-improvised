import React from 'react';
import { Link } from 'react-router-dom';

const Chat: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block p-4 bg-blue-50 rounded-full">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-12 w-12 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Chat Feature Coming Soon
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                We're building something amazing for you!
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
              <div className="bg-gray-100 p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="ml-auto text-sm text-gray-500">chat:1</div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="text-left">
                  <div className="bg-blue-100 rounded-lg p-4 inline-block rounded-bl-none">
                    <p className="text-gray-800">Hey there! 👋</p>
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="bg-gray-100 rounded-lg p-4 inline-block rounded-bl-none">
                    <p className="text-gray-800">Hi! When will the chat be ready?</p>
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="bg-blue-100 rounded-lg p-4 inline-block rounded-bl-none">
                    <p className="text-gray-800">
                      We're working hard to launch our chat feature soon! 
                      Stay tuned for updates. 😊
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      placeholder="Type a message... (feature coming soon)"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      disabled
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                What to expect from our chat feature:
              </h3>
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Real-time Messaging
                  </h4>
                  <p className="text-gray-600">
                    Chat instantly with other users in real-time with our fast and reliable messaging system.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Group Chats
                  </h4>
                  <p className="text-gray-600">
                    Create or join group conversations to connect with multiple people at once.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    File Sharing
                  </h4>
                  <p className="text-gray-600">
                    Share images, videos, and documents directly in your conversations.
                  </p>
                </div>
              </div>
              
              <div className="mt-10">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Get Notified When We Launch
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter your email to be the first to know when our chat feature goes live!
                  </p>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Notify Me
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link
                  to="/"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg
                    className="h-5 w-5 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Back to Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

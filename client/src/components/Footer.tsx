import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-8 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="w-10 h-10 mr-3 bg-white rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="10" fill="#5E35B1" />
                  <circle cx="8" cy="10" r="2" fill="white" />
                  <circle cx="16" cy="10" r="2" fill="white" />
                  <path d="M7 14C7 16.2091 9.23858 18 12 18C14.7614 18 17 16.2091 17 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="font-pixel text-sm">BITLINGS</h2>
            </div>
            <p className="text-sm text-gray-400 mt-2">Collect, battle, and create your own digital creatures!</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <i className="ri-twitter-fill text-xl"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <i className="ri-discord-fill text-xl"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <i className="ri-github-fill text-xl"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <i className="ri-mail-fill text-xl"></i>
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Bitlings. All rights reserved. Powered by GPT-4 Vision.</p>
        </div>
      </div>
    </footer>
  );
}

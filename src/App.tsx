import React, { useState, useEffect } from 'react';
import { Facebook, Mail } from 'lucide-react';
import { OAUTH_CONFIG } from './config/oauth';

declare global {
  interface Window {
    FB: any;
    google: any;
  }
}

function App() {
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: OAUTH_CONFIG.FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    // Load Facebook SDK
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Load Google SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const client = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: OAUTH_CONFIG.GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response: any) => {
          if (response.access_token) {
            // Get user info using the access token
            const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${response.access_token}`,
              },
            }).then(res => res.json());

            console.log('Google user info:', userInfo);
            // Handle successful login here (e.g., store user data, redirect, etc.)
          }
        },
      });

      client?.requestAccessToken();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleFacebookLogin = () => {
    window.FB?.login(function(response: any) {
      if (response.authResponse) {
        // Get user info
        window.FB.api('/me', { fields: 'name,email' }, function(userInfo: any) {
          console.log('Facebook user info:', userInfo);
          // Handle successful login here (e.g., store user data, redirect, etc.)
        });
      } else {
        console.log('Facebook login cancelled or failed');
      }
    }, { scope: 'public_profile,email' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-5 h-5 text-red-500" />
            <span className="text-gray-700">Continue with Google</span>
          </button>

          <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-white"
          >
            <Facebook className="w-5 h-5" />
            <span>Continue with Facebook</span>
          </button>

          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-gray-500">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const gatewayUrl = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api';
    const endpoint = isSignUp ? `${gatewayUrl}/auth/register` : `${gatewayUrl}/auth/login`;
    const payload = isSignUp ? { name, email, password } : { email, password };

    try {
      const response = await axios.post(endpoint, payload);
      
      if (isSignUp) {
        setSuccess('// REGISTRATION SUCCESSFUL. SWAPPING TO TERMINAL LOGIN...');
        setIsSignUp(false);
        setPassword('');
      } else {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          onLoginSuccess();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication Handshake Denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-md bg-[#141414] border-4 border-black p-8 shadow-[8px_8px_0px_0px_#FFE600] relative">
        
        <header className="mb-8 border-b-4 border-black pb-4">
          <h1 className="text-3xl font-black uppercase tracking-tight font-mono text-brand-yellow">
            {isSignUp ? 'QUANTEDGE // REG' : 'QUANTEDGE // AUTH'}
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1">
            {isSignUp ? 'Register New Operational Operator Credentials' : 'Secure Quantitative Terminal Gateway Session Access'}
          </p>
        </header>

        {error && (
          <div className="bg-rose-950 border-2 border-rose-500 text-rose-300 font-mono text-xs p-3 mb-6 uppercase">
            // FAILURE: {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-950 border-2 border-emerald-500 text-emerald-300 font-mono text-xs p-3 mb-6 uppercase">
            // STATUS: {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-brand-yellow mb-2 font-mono">// OPERATOR NAME</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border-2 border-zinc-700 text-white font-mono p-3 outline-none focus:border-brand-yellow"
                placeholder="CHEF CHIKU"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-brand-yellow mb-2 font-mono">// SECURITY ACCESS KEY (EMAIL)</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 text-white font-mono p-3 outline-none focus:border-brand-yellow"
              placeholder="user@quantedge.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-brand-yellow mb-2 font-mono">// ACCESS PASSPHRASE</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 text-white font-mono p-3 outline-none focus:border-brand-yellow"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-yellow text-black font-black uppercase tracking-wider p-4 border-2 border-black hover:bg-white transition-colors duration-150 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer font-mono text-sm"
          >
            {loading ? '[ COMPILING... ]' : isSignUp ? '[ CREATE ACCOUNT ]' : '[ INITIALIZE SESSION ]'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccess('');
            }}
            className="text-xs font-mono text-zinc-400 hover:text-brand-yellow underline bg-transparent border-none cursor-pointer uppercase"
          >
            {isSignUp ? '// Already registered? Sign In' : '// Need clearance? Create an account'}
          </button>
        </div>
      </div>
    </div>
  );
}
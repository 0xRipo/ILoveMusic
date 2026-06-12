#!/usr/bin/env node

// Test script to verify Spotify integration after fixes
require('dotenv').config();
const https = require('https');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

console.log('Testing Spotify Integration...');
console.log('Client ID:', SPOTIFY_CLIENT_ID ? `${SPOTIFY_CLIENT_ID.substring(0, 10)}...` : 'NOT SET');
console.log('Client Secret:', SPOTIFY_CLIENT_SECRET ? '***SET***' : 'NOT SET');

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('\n❌ ERROR: Spotify credentials not configured!');
  console.error('Please add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env file');
  process.exit(1);
}

// Test 1: Get access token
async function getSpotifyAccessToken() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const postData = 'grant_type=client_credentials';
    
    const options = {
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const json = JSON.parse(data);
            resolve(json.access_token);
          } else {
            reject(new Error(`Spotify auth failed: ${res.statusCode} ${data}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    
    req.on('error', (err) => {
      reject(new Error(`Spotify auth request failed: ${err.message}`));
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 2: Fetch track metadata
async function fetchSpotifyTrackMetadata(token, trackId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.spotify.com',
      path: `/v1/tracks/${trackId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const json = JSON.parse(data);
            resolve(json);
          } else {
            reject(new Error(`Spotify API error: ${res.statusCode} ${data}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    
    req.on('error', (err) => {
      reject(new Error(`Spotify API request failed: ${err.message}`));
    });
    
    req.end();
  });
}

// Run tests
(async () => {
  try {
    console.log('\n1️⃣  Testing Spotify authentication...');
    const token = await getSpotifyAccessToken();
    console.log('✅ Access token obtained:', token.substring(0, 20) + '...');
    
    console.log('\n2️⃣  Testing track metadata fetch...');
    const testTrackId = '47iKV0KlcvlflSsrCPD3TQ'; // Example track
    const metadata = await fetchSpotifyTrackMetadata(token, testTrackId);
    
    console.log('✅ Track metadata retrieved:');
    console.log('   Title:', metadata.name);
    console.log('   Artist:', metadata.artists.map(a => a.name).join(', '));
    console.log('   Duration:', Math.round(metadata.duration_ms / 1000), 'seconds');
    console.log('   Album:', metadata.album.name);
    console.log('   Artwork:', metadata.album.images[0]?.url || 'N/A');
    
    console.log('\n✅ All tests passed! Spotify integration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
})();

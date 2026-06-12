// Test Spotify API Integration
require('dotenv').config();
const https = require('https');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

console.log('Testing Spotify API Integration...\n');
console.log('Client ID:', SPOTIFY_CLIENT_ID ? `${SPOTIFY_CLIENT_ID.substring(0, 8)}...` : 'NOT SET');
console.log('Client Secret:', SPOTIFY_CLIENT_SECRET ? `${SPOTIFY_CLIENT_SECRET.substring(0, 8)}...` : 'NOT SET');
console.log('');

// Test 1: Get Access Token
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
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          resolve(json.access_token);
        } else {
          reject(new Error(`Auth failed: ${res.statusCode} ${data}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 2: Fetch Track Metadata
async function fetchSpotifyTrack(trackId, token) {
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
        if (res.statusCode === 200) {
          const json = JSON.parse(data);
          resolve(json);
        } else {
          reject(new Error(`API error: ${res.statusCode} ${data}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

// Run Tests
(async () => {
  try {
    console.log('Test 1: Getting access token...');
    const token = await getSpotifyAccessToken();
    console.log('✅ Access token obtained:', token.substring(0, 20) + '...\n');
    
    console.log('Test 2: Fetching sample track (Spotify track ID: 3n3Ppam7vgaVa1iaRUc9Lp)...');
    const track = await fetchSpotifyTrack('3n3Ppam7vgaVa1iaRUc9Lp', token);
    console.log('✅ Track fetched successfully!');
    console.log('   Title:', track.name);
    console.log('   Artist:', track.artists.map(a => a.name).join(', '));
    console.log('   Duration:', Math.round(track.duration_ms / 1000), 'seconds');
    console.log('   Album:', track.album.name);
    console.log('   Album Art:', track.album.images[0]?.url || 'N/A');
    console.log('\n✅ All tests passed! Spotify integration is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
})();

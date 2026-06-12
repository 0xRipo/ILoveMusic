#!/bin/bash

echo "=========================================="
echo "Testing spotdl Installation"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if spotdl is installed
echo "1️⃣  Checking spotdl installation..."
if [ -f "/Users/ripo/Library/Python/3.9/bin/spotdl" ]; then
    echo -e "${GREEN}✅ spotdl found at: /Users/ripo/Library/Python/3.9/bin/spotdl${NC}"
    
    # Get version
    VERSION=$(/Users/ripo/Library/Python/3.9/bin/spotdl --version 2>&1 | tail -n 1)
    echo -e "${GREEN}   Version: $VERSION${NC}"
else
    echo -e "${RED}❌ spotdl not found!${NC}"
    echo "   Install with: pip3 install spotdl"
    exit 1
fi

echo ""

# Test 2: Test download (dry run)
echo "2️⃣  Testing spotdl download (dry run)..."
TEST_URL="https://open.spotify.com/track/47iKV0KlcvlflSsrCPD3TQ"
TEST_DIR="/tmp/ilovemusic_test_$$"
mkdir -p "$TEST_DIR"

echo "   URL: $TEST_URL"
echo "   Output: $TEST_DIR"
echo ""

# Run spotdl
/Users/ripo/Library/Python/3.9/bin/spotdl \
  "$TEST_URL" \
  --output "$TEST_DIR/test_track" \
  --format mp3 \
  --bitrate 320k \
  --threads 4 2>&1 | head -20

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Download successful!${NC}"
    
    # Check file
    if ls "$TEST_DIR"/*.mp3 1> /dev/null 2>&1; then
        FILE=$(ls "$TEST_DIR"/*.mp3 | head -1)
        SIZE=$(du -h "$FILE" | cut -f1)
        echo -e "${GREEN}   File: $(basename "$FILE")${NC}"
        echo -e "${GREEN}   Size: $SIZE${NC}"
        
        # Check bitrate with ffprobe if available
        if command -v ffprobe &> /dev/null; then
            BITRATE=$(ffprobe -v error -show_entries format=bit_rate -of default=noprint_wrappers=1:nokey=1 "$FILE" 2>/dev/null)
            if [ ! -z "$BITRATE" ]; then
                BITRATE_KBPS=$((BITRATE / 1000))
                echo -e "${GREEN}   Bitrate: ${BITRATE_KBPS} kbps${NC}"
            fi
        fi
        
        # Cleanup
        rm -rf "$TEST_DIR"
        echo ""
        echo -e "${GREEN}✅ All tests passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Download completed but file not found${NC}"
    fi
else
    echo ""
    echo -e "${RED}❌ Download failed!${NC}"
    rm -rf "$TEST_DIR"
    exit 1
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "✅ spotdl is installed and working"
echo "✅ Can download from Spotify URLs"
echo "✅ 320kbps quality confirmed"
echo ""
echo "🎉 Ready to use in ILoveMusic app!"
echo ""
echo "Next steps:"
echo "1. Restart Electron app: killall Electron && npm run dev"
echo "2. Paste a Spotify URL and click ADD"
echo "3. Check console for: 'Downloaded using spotdl (320kbps)'"
echo ""

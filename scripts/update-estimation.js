import fs from 'fs/promises';

class YouTubeStatsEstimator {
    async updateStats() {
        console.log('📊 Starting free YouTube stats estimation...');
        
        // Load your existing tools.json
        const toolsData = JSON.parse(await fs.readFile('./tools.json', 'utf8'));
        
        if (!toolsData.youtubeChannels || !Array.isArray(toolsData.youtubeChannels)) {
            console.log('❌ No youtubeChannels array found in tools.json');
            return;
        }
        
        console.log(`🔄 Updating ${toolsData.youtubeChannels.length} channels...`);
        
        // Update each YouTube channel
        const updatedChannels = toolsData.youtubeChannels.map(channel => {
            return this.updateChannelStats(channel);
        });
        
        // Update the data
        toolsData.youtubeChannels = updatedChannels;
        toolsData.lastUpdated = new Date().toISOString();
        toolsData.updateMethod = "free-estimation";
        
        // Save back to tools.json
        await fs.writeFile('./tools.json', JSON.stringify(toolsData, null, 2));
        
        console.log('✅ Free stats estimation complete!');
    }
    
    updateChannelStats(channel) {
        // Only update if it has the fields we want to update
        if (!channel.subscribers || !channel.monthlyViews) {
            return channel; // Return unchanged if fields don't exist
        }
        
        const currentSubs = this.parseCount(channel.subscribers);
        const currentViews = this.parseCount(channel.monthlyViews);
        
        // Calculate new values with realistic growth
        const newSubs = this.calculateNewSubscribers(currentSubs);
        const newViews = this.calculateNewViews(currentViews, newSubs);
        
        return {
            ...channel, // Keep all existing data
            subscribers: this.formatCount(newSubs),
            monthlyViews: this.formatCount(newViews) + '+', // Keep the "+" suffix
            lastEstimated: new Date().toISOString()
        };
    }
    
    parseCount(countStr) {
        if (!countStr) return 1000;
        
        // Remove any "+" signs and trim
        const cleanStr = countStr.replace('+', '').trim();
        
        // Handle different formats: "120k", "2.8M", "150000", etc.
        if (cleanStr.includes('M')) {
            return parseFloat(cleanStr) * 1000000;
        }
        if (cleanStr.includes('k')) {
            return parseFloat(cleanStr) * 1000;
        }
        
        // If it's just a number, parse it
        return parseInt(cleanStr) || 1000;
    }
    
    calculateNewSubscribers(currentSubs) {
        // Realistic growth algorithm based on channel size
        let growthRate;
        
        if (currentSubs > 1000000) {
            growthRate = 0.0003; // 0.03% daily for huge channels (1M+)
        } else if (currentSubs > 500000) {
            growthRate = 0.0005; // 0.05% daily for large channels (500k-1M)
        } else if (currentSubs > 100000) {
            growthRate = 0.001;  // 0.1% daily for medium channels (100k-500k)
        } else if (currentSubs > 50000) {
            growthRate = 0.002;  // 0.2% daily for growing channels (50k-100k)
        } else {
            growthRate = 0.003;  // 0.3% daily for small channels (<50k)
        }
        
        // Add some randomness (±20% of the growth rate)
        const randomFactor = 0.8 + (Math.random() * 0.4);
        const actualGrowth = growthRate * randomFactor;
        
        return Math.floor(currentSubs * (1 + actualGrowth));
    }
    
    calculateNewViews(currentViews, newSubs) {
        // Views typically grow faster than subscribers
        // and have more volatility
        const baseGrowth = 0.0015; // 0.15% base daily growth
        
        // Add randomness (±50% for views since they fluctuate more)
        const randomFactor = 0.5 + (Math.random() * 1.0);
        const actualGrowth = baseGrowth * randomFactor;
        
        return Math.floor(currentViews * (1 + actualGrowth));
    }
    
    formatCount(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
}

// Run the updater
new YouTubeStatsEstimator().updateStats().catch(error => {
    console.error('💥 Estimation failed:', error);
    process.exit(1);
});

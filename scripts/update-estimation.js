import fs from 'fs/promises';

class YouTubeStatsEstimator {
    async updateStats() {
        console.log('📊 Starting free YouTube stats estimation...');
        
        try {
            const toolsData = JSON.parse(await fs.readFile('./tools.json', 'utf8'));
            
            if (!toolsData.youtubeChannels || !Array.isArray(toolsData.youtubeChannels)) {
                console.log('❌ No youtubeChannels array found in tools.json');
                return;
            }
            
            console.log(`🔄 Updating ${toolsData.youtubeChannels.length} channels...`);
            
            const updatedChannels = toolsData.youtubeChannels.map(channel => {
                return this.updateChannelStats(channel);
            });
            
            toolsData.youtubeChannels = updatedChannels;
            toolsData.lastUpdated = new Date().toISOString();
            toolsData.updateMethod = "free-estimation";
            
            await fs.writeFile('./tools.json', JSON.stringify(toolsData, null, 2));
            
            console.log('✅ Free stats estimation complete!');
            console.log('📝 Next update: Tomorrow at 6:00 PM CST');
            
        } catch (error) {
            console.error('💥 Error during estimation:', error.message);
            throw error;
        }
    }
    
    updateChannelStats(channel) {
        if (!channel.subscribers || !channel.monthlyViews) {
            return channel;
        }
        
        const currentSubs = this.parseCount(channel.subscribers);
        const currentViews = this.parseCount(channel.monthlyViews);
        
        const newSubs = this.calculateNewSubscribers(currentSubs);
        const newViews = this.calculateNewViews(currentViews, newSubs);
        
        console.log(`   ${channel.name}: ${channel.subscribers} → ${this.formatCount(newSubs)} subscribers`);
        
        return {
            ...channel,
            subscribers: this.formatCount(newSubs),
            monthlyViews: this.formatCount(newViews) + '+',
            lastEstimated: new Date().toISOString()
        };
    }
    
    parseCount(countStr) {
        if (!countStr) return 1000;
        const cleanStr = countStr.replace('+', '').trim();
        
        if (cleanStr.includes('M')) {
            return parseFloat(cleanStr) * 1000000;
        }
        if (cleanStr.includes('k')) {
            return parseFloat(cleanStr) * 1000;
        }
        return parseInt(cleanStr) || 1000;
    }
    
    calculateNewSubscribers(currentSubs) {
        let growthRate;
        
        if (currentSubs > 1000000) growthRate = 0.0003;
        else if (currentSubs > 500000) growthRate = 0.0005;
        else if (currentSubs > 100000) growthRate = 0.001;
        else if (currentSubs > 50000) growthRate = 0.002;
        else growthRate = 0.003;
        
        const randomFactor = 0.8 + (Math.random() * 0.4);
        return Math.floor(currentSubs * (1 + (growthRate * randomFactor)));
    }
    
    calculateNewViews(currentViews, newSubs) {
        const baseGrowth = 0.0015;
        const randomFactor = 0.5 + (Math.random() * 1.0);
        return Math.floor(currentViews * (1 + (baseGrowth * randomFactor)));
    }
    
    formatCount(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    }
}

// Run the updater
new YouTubeStatsEstimator().updateStats().catch(error => {
    console.error('💥 Estimation failed:', error);
    process.exit(1);
});
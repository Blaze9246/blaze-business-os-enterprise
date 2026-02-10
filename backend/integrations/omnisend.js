const axios = require('axios');

class OmnisendIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.omnisend.com/v3';
  }

  getHeaders() {
    return {
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  // Get account info
  async getAccountInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/account`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Omnisend getAccountInfo error:', error.message);
      throw error;
    }
  }

  // Get contacts/subscribers
  async getContacts(limit = 50, offset = 0) {
    try {
      const response = await axios.get(
        `${this.baseURL}/contacts?limit=${limit}&offset=${offset}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend getContacts error:', error.message);
      throw error;
    }
  }

  // Create or update contact
  async upsertContact(contactData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/contacts`,
        contactData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend upsertContact error:', error.message);
      throw error;
    }
  }

  // Get campaigns
  async getCampaigns(limit = 50) {
    try {
      const response = await axios.get(
        `${this.baseURL}/campaigns?limit=${limit}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend getCampaigns error:', error.message);
      throw error;
    }
  }

  // Create campaign
  async createCampaign(campaignData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/campaigns`,
        campaignData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend createCampaign error:', error.message);
      throw error;
    }
  }

  // Get automation workflows
  async getAutomations() {
    try {
      const response = await axios.get(
        `${this.baseURL}/automation-workflows`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend getAutomations error:', error.message);
      throw error;
    }
  }

  // Create automation workflow
  async createAutomation(automationData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/automation-workflows`,
        automationData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend createAutomation error:', error.message);
      throw error;
    }
  }

  // Get campaign statistics
  async getCampaignStats(campaignId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/campaigns/${campaignId}/reports`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend getCampaignStats error:', error.message);
      throw error;
    }
  }

  // Get overall analytics
  async getAnalytics(startDate, endDate) {
    try {
      // Get contacts
      const contacts = await this.getContacts(1000);
      
      // Get campaigns
      const campaigns = await this.getCampaigns(100);
      
      // Calculate stats
      const analytics = {
        totalContacts: contacts.contacts?.length || 0,
        totalCampaigns: campaigns.campaigns?.length || 0,
        activeAutomations: 0,
        recentPerformance: {
          sent: 0,
          opened: 0,
          clicked: 0,
          openRate: 0,
          clickRate: 0,
        },
        topPerformingCampaigns: [],
      };

      // Get stats for recent campaigns
      if (campaigns.campaigns) {
        for (const campaign of campaigns.campaigns.slice(0, 5)) {
          try {
            const stats = await this.getCampaignStats(campaign.campaignID);
            analytics.recentPerformance.sent += stats.sent || 0;
            analytics.recentPerformance.opened += stats.opened || 0;
            analytics.recentPerformance.clicked += stats.clicked || 0;
            
            analytics.topPerformingCampaigns.push({
              id: campaign.campaignID,
              name: campaign.name,
              subject: campaign.subject,
              sent: stats.sent,
              opened: stats.opened,
              clicked: stats.clicked,
              openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
            });
          } catch (e) {
            // Campaign might not have stats yet
          }
        }
      }

      // Calculate rates
      if (analytics.recentPerformance.sent > 0) {
        analytics.recentPerformance.openRate = 
          (analytics.recentPerformance.opened / analytics.recentPerformance.sent) * 100;
        analytics.recentPerformance.clickRate = 
          (analytics.recentPerformance.clicked / analytics.recentPerformance.sent) * 100;
      }

      return analytics;
    } catch (error) {
      console.error('Omnisend getAnalytics error:', error.message);
      throw error;
    }
  }

  // Send custom event (for automation triggers)
  async sendCustomEvent(email, eventName, eventData = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/events`,
        {
          email: email,
          eventName: eventName,
          eventData: eventData,
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend sendCustomEvent error:', error.message);
      throw error;
    }
  }

  // Create segment
  async createSegment(segmentData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/segments`,
        segmentData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend createSegment error:', error.message);
      throw error;
    }
  }

  // Get segments
  async getSegments() {
    try {
      const response = await axios.get(
        `${this.baseURL}/segments`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Omnisend getSegments error:', error.message);
      throw error;
    }
  }
}

module.exports = OmnisendIntegration;

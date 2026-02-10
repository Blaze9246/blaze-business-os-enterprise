const axios = require('axios');

class ShopifyIntegration {
  constructor(storeUrl, accessToken) {
    this.storeUrl = storeUrl.replace(/\/+$/, '');
    this.accessToken = accessToken;
    this.baseURL = `${this.storeUrl}/admin/api/2024-01`;
  }

  getHeaders() {
    return {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json',
    };
  }

  // Get store details
  async getStoreInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/shop.json`, {
        headers: this.getHeaders(),
      });
      return response.data.shop;
    } catch (error) {
      console.error('Shopify getStoreInfo error:', error.message);
      throw error;
    }
  }

  // Get orders with filtering
  async getOrders(limit = 50, status = 'any', createdAtMin = null) {
    try {
      let url = `${this.baseURL}/orders.json?limit=${limit}&status=${status}`;
      if (createdAtMin) {
        url += `&created_at_min=${createdAtMin}`;
      }
      
      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });
      return response.data.orders;
    } catch (error) {
      console.error('Shopify getOrders error:', error.message);
      throw error;
    }
  }

  // Get products
  async getProducts(limit = 50, fields = null) {
    try {
      let url = `${this.baseURL}/products.json?limit=${limit}`;
      if (fields) {
        url += `&fields=${fields}`;
      }
      
      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });
      return response.data.products;
    } catch (error) {
      console.error('Shopify getProducts error:', error.message);
      throw error;
    }
  }

  // Get customers
  async getCustomers(limit = 50) {
    try {
      const response = await axios.get(
        `${this.baseURL}/customers.json?limit=${limit}`,
        { headers: this.getHeaders() }
      );
      return response.data.customers;
    } catch (error) {
      console.error('Shopify getCustomers error:', error.message);
      throw error;
    }
  }

  // Get analytics/reports
  async getSalesReport(startDate, endDate) {
    try {
      const orders = await this.getOrders(250, 'any', startDate);
      
      const report = {
        totalRevenue: 0,
        totalOrders: 0,
        totalItems: 0,
        averageOrderValue: 0,
        currency: 'USD',
        ordersByDay: {},
      };

      orders.forEach(order => {
        if (order.created_at >= startDate && order.created_at <= endDate) {
          report.totalRevenue += parseFloat(order.total_price);
          report.totalOrders += 1;
          report.totalItems += order.line_items.reduce((sum, item) => sum + item.quantity, 0);
          
          const day = order.created_at.split('T')[0];
          report.ordersByDay[day] = (report.ordersByDay[day] || 0) + 1;
        }
      });

      report.averageOrderValue = report.totalOrders > 0 
        ? report.totalRevenue / report.totalOrders 
        : 0;

      return report;
    } catch (error) {
      console.error('Shopify getSalesReport error:', error.message);
      throw error;
    }
  }

  // Get inventory levels
  async getInventoryLevels() {
    try {
      const products = await this.getProducts(250, 'id,title,variants');
      const inventory = [];

      for (const product of products) {
        for (const variant of product.variants) {
          if (variant.inventory_quantity < 10) {
            inventory.push({
              productId: product.id,
              productTitle: product.title,
              variantId: variant.id,
              variantTitle: variant.title,
              inventoryQuantity: variant.inventory_quantity,
              inventoryPolicy: variant.inventory_policy,
            });
          }
        }
      }

      return inventory.sort((a, b) => a.inventoryQuantity - b.inventoryQuantity);
    } catch (error) {
      console.error('Shopify getInventoryLevels error:', error.message);
      throw error;
    }
  }

  // Create product
  async createProduct(productData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/products.json`,
        { product: productData },
        { headers: this.getHeaders() }
      );
      return response.data.product;
    } catch (error) {
      console.error('Shopify createProduct error:', error.message);
      throw error;
    }
  }

  // Update product
  async updateProduct(productId, productData) {
    try {
      const response = await axios.put(
        `${this.baseURL}/products/${productId}.json`,
        { product: productData },
        { headers: this.getHeaders() }
      );
      return response.data.product;
    } catch (error) {
      console.error('Shopify updateProduct error:', error.message);
      throw error;
    }
  }

  // Get metafields
  async getMetafields(ownerResource, ownerId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${ownerResource}/${ownerId}/metafields.json`,
        { headers: this.getHeaders() }
      );
      return response.data.metafields;
    } catch (error) {
      console.error('Shopify getMetafields error:', error.message);
      throw error;
    }
  }

  // Create metafield
  async createMetafield(ownerResource, ownerId, metafieldData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${ownerResource}/${ownerId}/metafields.json`,
        { metafield: metafieldData },
        { headers: this.getHeaders() }
      );
      return response.data.metafield;
    } catch (error) {
      console.error('Shopify createMetafield error:', error.message);
      throw error;
    }
  }
}

module.exports = ShopifyIntegration;

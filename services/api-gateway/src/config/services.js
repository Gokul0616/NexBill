module.exports = {
  identityUrl: process.env.IDENTITY_SERVICE_URL || 'http://localhost:7124',
  subscriptionUrl: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:7125',
  billingUrl: process.env.BILLING_SERVICE_URL || 'http://localhost:7126',
  paymentUrl: process.env.PAYMENT_SERVICE_URL || 'http://localhost:7127',
  adminUrl: process.env.ADMIN_SERVICE_URL || 'http://localhost:7128',
};

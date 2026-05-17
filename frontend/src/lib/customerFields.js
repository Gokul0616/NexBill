const DEFAULT_FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. John Doe', required: true, enabled: true, isCustom: false },
  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. john@example.com', required: true, enabled: true, isCustom: false },
  { key: 'phone', label: 'Phone Number', type: 'text', placeholder: 'e.g. +91 98765 43210', required: false, enabled: true, isCustom: false },
  { key: 'gst_number', label: 'GST Number', type: 'text', placeholder: 'e.g. 22AAAAA0000A1Z5', required: false, enabled: true, isCustom: false }
];

export function getCustomerFields() {
  const stored = localStorage.getItem('customer_fields_config');
  if (!stored) {
    localStorage.setItem('customer_fields_config', JSON.stringify(DEFAULT_FIELDS));
    return DEFAULT_FIELDS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse customer fields config from localStorage', e);
    return DEFAULT_FIELDS;
  }
}

export function saveCustomerFields(fields) {
  localStorage.setItem('customer_fields_config', JSON.stringify(fields));
}

export function resetCustomerFields() {
  localStorage.setItem('customer_fields_config', JSON.stringify(DEFAULT_FIELDS));
  return DEFAULT_FIELDS;
}

// Simple demo script to show the API functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function demoAPI() {
  console.log('🚀 Resolve It API Demo\n');
  console.log('This demo shows how the API automatically routes reports to departments.\n');

  // Sample report data
  const sampleReport = {
    title: 'Large pothole on Main Street',
    description: 'There is a large pothole on Main Street near the intersection with Oak Avenue. It is causing traffic issues and potential vehicle damage to vehicles.',
    location: '123 Main Street, Downtown',
    category: 'road-maintenance',
    priority: 'high',
    reporterName: 'John Smith',
    reporterEmail: 'john.smith@email.com',
    reporterPhone: '+1234567890'
  };

  try {
    console.log('📋 Sample Report:');
    console.log(`Title: ${sampleReport.title}`);
    console.log(`Description: ${sampleReport.description}`);
    console.log(`Location: ${sampleReport.location}`);
    console.log(`Category: ${sampleReport.category}`);
    console.log(`Priority: ${sampleReport.priority}`);
    console.log(`Reporter: ${sampleReport.reporterName}\n`);

    console.log('🔄 Submitting report to API...\n');

    const response = await axios.post(`${API_BASE_URL}/reports`, sampleReport);
    const data = response.data.data;

    console.log('✅ Report submitted successfully!');
    console.log(`📄 Report ID: ${data.reportId}`);
    console.log(`🏢 Assigned Department: ${data.assignedDepartment.name}`);
    console.log(`📧 Department Email: ${data.assignedDepartment.email}`);
    console.log(`📞 Department Phone: ${data.assignedDepartment.phone}`);
    console.log(`📊 Routing Confidence: ${(data.routingDetails.confidence * 100).toFixed(1)}%`);
    console.log(`💡 Routing Reason: ${data.routingDetails.reason}`);
    console.log(`📅 Submitted At: ${new Date(data.submittedAt).toLocaleString()}`);

    console.log('\n🎯 How the routing worked:');
    console.log('1. The API analyzed the report content for keywords');
    console.log('2. Found keywords: "pothole", "road", "street"');
    console.log('3. Matched these to the Road Maintenance Department');
    console.log('4. Assigned high confidence due to clear keyword matches');
    console.log('5. Generated a unique report ID and timestamp');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Could not connect to the API server.');
      console.log('Please make sure the server is running:');
      console.log('   cd backend && npm start');
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }
}

// Run the demo
demoAPI();

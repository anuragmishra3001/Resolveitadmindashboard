const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test data for different types of reports
const testReports = [
  {
    title: 'Large pothole on Main Street',
    description: 'There is a large pothole on Main Street near the intersection with Oak Avenue. It is causing traffic issues and potential vehicle damage.',
    location: '123 Main Street, Downtown',
    category: 'road-maintenance',
    priority: 'high',
    reporterName: 'John Smith',
    reporterEmail: 'john.smith@email.com',
    reporterPhone: '+1234567890'
  },
  {
    title: 'Broken street light',
    description: 'Street light has been out for 3 days, creating safety concerns for pedestrians and drivers.',
    location: '456 Oak Avenue, Midtown',
    category: 'public-works',
    priority: 'medium',
    reporterName: 'Sarah Johnson',
    reporterEmail: 'sarah.johnson@email.com'
  },
  {
    title: 'Garbage collection missed',
    description: 'Garbage was not collected on scheduled pickup day. Bins are overflowing.',
    location: '789 Pine Street, Westside',
    category: 'sanitation',
    priority: 'low',
    reporterName: 'Mike Chen',
    reporterEmail: 'mike.chen@email.com'
  },
  {
    title: 'Water leak in street',
    description: 'Water is leaking from underground pipe, pooling on the street and causing traffic issues.',
    location: '258 Spruce Avenue, Riverside',
    category: 'water-supply',
    priority: 'high',
    reporterName: 'Maria Garcia',
    reporterEmail: 'maria.garcia@email.com'
  },
  {
    title: 'Noise complaint - construction',
    description: 'Construction work is starting before permitted hours, causing noise disturbance.',
    location: '654 Maple Drive, Northside',
    category: 'other',
    priority: 'medium',
    reporterName: 'David Wilson',
    reporterEmail: 'david.wilson@email.com'
  }
];

async function testAPI() {
  console.log('🧪 Testing Resolve It API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // Test departments endpoint
    console.log('2. Testing departments endpoint...');
    const departmentsResponse = await axios.get(`${API_BASE_URL}/departments`);
    console.log('✅ Departments:', departmentsResponse.data.data.length, 'departments found');
    departmentsResponse.data.data.forEach(dept => {
      console.log(`   - ${dept.name} (${dept.id})`);
    });
    console.log('');

    // Test report submissions
    console.log('3. Testing report submissions with auto-routing...');
    for (let i = 0; i < testReports.length; i++) {
      const report = testReports[i];
      console.log(`\n   Submitting report ${i + 1}: "${report.title}"`);
      
      const reportResponse = await axios.post(`${API_BASE_URL}/reports`, report);
      const responseData = reportResponse.data.data;
      
      console.log(`   ✅ Report ID: ${responseData.reportId}`);
      console.log(`   🏢 Assigned to: ${responseData.assignedDepartment.name}`);
      console.log(`   📊 Confidence: ${(responseData.routingDetails.confidence * 100).toFixed(1)}%`);
      console.log(`   💡 Reason: ${responseData.routingDetails.reason}`);
    }

    // Test getting all reports
    console.log('\n4. Testing get all reports...');
    const allReportsResponse = await axios.get(`${API_BASE_URL}/reports`);
    console.log(`✅ Retrieved ${allReportsResponse.data.data.reports.length} reports`);
    console.log('');

    // Test filtering by department
    console.log('5. Testing department filtering...');
    const roadMaintenanceReports = await axios.get(`${API_BASE_URL}/reports?department=road-maintenance`);
    console.log(`✅ Road Maintenance reports: ${roadMaintenanceReports.data.data.reports.length}`);
    
    const sanitationReports = await axios.get(`${API_BASE_URL}/reports?department=sanitation`);
    console.log(`✅ Sanitation reports: ${sanitationReports.data.data.reports.length}`);
    console.log('');

    // Test report status update
    console.log('6. Testing status update...');
    const firstReport = allReportsResponse.data.data.reports[0];
    if (firstReport) {
      const statusUpdateResponse = await axios.patch(
        `${API_BASE_URL}/reports/${firstReport.id}/status`,
        { status: 'in-progress' }
      );
      console.log(`✅ Updated report ${firstReport.id} status to: ${statusUpdateResponse.data.data.status}`);
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI, testReports };

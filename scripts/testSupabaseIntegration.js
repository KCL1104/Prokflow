import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  const envFile = readFileSync(join(__dirname, '../.env'), 'utf8');
  const envLines = envFile.split('\n');
  
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.warn('Warning: Could not load .env file:', error.message);
}

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Abcd_123'
};

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

async function testSupabaseIntegration() {
  console.log('🚀 Starting Supabase Integration Test...');
  console.log('=' .repeat(50));
  
  const results = {
    connection: false,
    authentication: false,
    databaseRead: false,
    databaseWrite: false,
    errorHandling: false
  };

  try {
    // Test 1: Basic Connection
    console.log('\n1. Testing Supabase Connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ Connection failed:', connectionError.message);
    } else {
      console.log('✅ Connection successful');
      results.connection = true;
    }

    // Test 2: Authentication
    console.log('\n2. Testing Authentication...');
    
    // Clear any existing session
    await supabase.auth.signOut();
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
    } else {
      console.log('✅ Authentication successful');
      console.log('   User ID:', authData.user.id);
      console.log('   Email:', authData.user.email);
      results.authentication = true;
    }

    // Test 3: Database Read Operations
    console.log('\n3. Testing Database Read Operations...');
    
    const tables = ['projects', 'work_items', 'users', 'notifications'];
    let readSuccess = true;
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Failed to read from ${table}:`, error.message);
        readSuccess = false;
      } else {
        console.log(`✅ Successfully read from ${table}`);
      }
    }
    
    results.databaseRead = readSuccess;

    // Test 4: Database Write Operations (if authenticated)
    if (results.authentication) {
      console.log('\n4. Testing Database Write Operations...');
      
      try {
        // Test creating a notification
        const { data: notification, error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: authData.user.id,
            title: 'Integration Test Notification',
            message: 'This notification was created during integration testing',
            type: 'info'
          })
          .select()
          .single();

        if (notificationError) {
          console.log('❌ Failed to create notification:', notificationError.message);
        } else {
          console.log('✅ Successfully created notification');
          console.log('   Notification ID:', notification.id);
          
          // Clean up - delete the test notification
          await supabase
            .from('notifications')
            .delete()
            .eq('id', notification.id);
          
          console.log('✅ Successfully cleaned up test notification');
          results.databaseWrite = true;
        }
      } catch (writeError) {
        console.log('❌ Write operation failed:', writeError.message);
      }
    } else {
      console.log('\n4. Skipping Database Write Operations (authentication failed)');
    }

    // Test 5: Error Handling
    console.log('\n5. Testing Error Handling...');
    
    // Test invalid authentication
    const { error: invalidAuthError } = await supabase.auth.signInWithPassword({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });

    if (invalidAuthError) {
      console.log('✅ Error handling works - invalid auth properly rejected');
      results.errorHandling = true;
    } else {
      console.log('❌ Error handling failed - invalid auth was accepted');
    }

    // Test invalid database operation
    const { error: invalidDbError } = await supabase
      .from('nonexistent_table')
      .select('*');
    
    if (invalidDbError) {
      console.log('✅ Error handling works - invalid table access properly rejected');
    } else {
      console.log('❌ Error handling failed - invalid table access was accepted');
    }

  } catch (error) {
    console.log('❌ Unexpected error during testing:', error.message);
  }

  // Generate Report
  console.log('\n' + '=' .repeat(50));
  console.log('📊 INTEGRATION TEST RESULTS');
  console.log('=' .repeat(50));
  
  const testResults = [
    { name: 'Supabase Connection', status: results.connection },
    { name: 'Authentication', status: results.authentication },
    { name: 'Database Read Operations', status: results.databaseRead },
    { name: 'Database Write Operations', status: results.databaseWrite },
    { name: 'Error Handling', status: results.errorHandling }
  ];

  testResults.forEach(test => {
    console.log(`${test.status ? '✅' : '❌'} ${test.name}: ${test.status ? 'PASS' : 'FAIL'}`);
  });

  const passedTests = testResults.filter(test => test.status).length;
  const totalTests = testResults.length;
  
  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 OVERALL RESULT: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Supabase integration is working perfectly.');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('⚠️  Most tests passed, but some issues need attention.');
  } else {
    console.log('❌ Multiple integration issues detected. Please review the failures above.');
  }
  
  console.log('=' .repeat(50));
  
  // Clean up
  await supabase.auth.signOut();
  
  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests,
    results
  };
}

// Run the test
testSupabaseIntegration()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
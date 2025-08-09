import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseOperations() {
  console.log('🔍 Testing Database Operations with RLS...');
  
  let testResults = {
    authentication: false,
    projectAccess: false,
    workItemAccess: false,
    workflowAccess: false,
    membershipAccess: false
  };
  
  try {
    // 1. Test Authentication
    console.log('\n1. Testing Authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'Abcd_123'
    });
    
    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
      return testResults;
    }
    
    console.log('✅ Authentication successful');
    testResults.authentication = true;
    
    const userId = authData.user.id;
    console.log('User ID:', userId);
    
    // 2. Test Project Access
    console.log('\n2. Testing Project Access...');
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);
    
    if (projectError) {
      console.log('❌ Project access failed:', projectError.message);
    } else {
      console.log('✅ Project access successful, found', projects.length, 'projects');
      testResults.projectAccess = true;
    }
    
    // 3. Test Work Items Access
    console.log('\n3. Testing Work Items Access...');
    const { data: workItems, error: workItemError } = await supabase
      .from('work_items')
      .select('*')
      .limit(5);
    
    if (workItemError) {
      console.log('❌ Work items access failed:', workItemError.message);
    } else {
      console.log('✅ Work items access successful, found', workItems.length, 'work items');
      testResults.workItemAccess = true;
    }
    
    // 4. Test Workflow Access
    console.log('\n4. Testing Workflow Access...');
    const { data: workflows, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .limit(5);
    
    if (workflowError) {
      console.log('❌ Workflow access failed:', workflowError.message);
    } else {
      console.log('✅ Workflow access successful, found', workflows.length, 'workflows');
      testResults.workflowAccess = true;
    }
    
    // 5. Test Project Membership Access
    console.log('\n5. Testing Project Membership Access...');
    const { data: memberships, error: membershipError } = await supabase
      .from('project_members')
      .select('*')
      .limit(5);
    
    if (membershipError) {
      console.log('❌ Project membership access failed:', membershipError.message);
    } else {
      console.log('✅ Project membership access successful, found', memberships.length, 'memberships');
      testResults.membershipAccess = true;
    }
    
    // 6. Test Workflow States Access
    console.log('\n6. Testing Workflow States Access...');
    const { data: workflowStates, error: workflowStatesError } = await supabase
      .from('workflow_states')
      .select('*')
      .limit(5);
    
    if (workflowStatesError) {
      console.log('❌ Workflow states access failed:', workflowStatesError.message);
    } else {
      console.log('✅ Workflow states access successful, found', workflowStates.length, 'workflow states');
    }
    
    // 7. Test User Profile Access
    console.log('\n7. Testing User Profile Access...');
    const { data: userProfile, error: userProfileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userProfileError) {
      console.log('❌ User profile access failed:', userProfileError.message);
    } else {
      console.log('✅ User profile access successful:', userProfile.email);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  // Calculate success rate
  const successCount = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  const successRate = (successCount / totalTests) * 100;
  
  console.log('\n📊 Database Operations Test Results:');
  console.log('=====================================');
  console.log(`Authentication: ${testResults.authentication ? '✅' : '❌'}`);
  console.log(`Project Access: ${testResults.projectAccess ? '✅' : '❌'}`);
  console.log(`Work Item Access: ${testResults.workItemAccess ? '✅' : '❌'}`);
  console.log(`Workflow Access: ${testResults.workflowAccess ? '✅' : '❌'}`);
  console.log(`Membership Access: ${testResults.membershipAccess ? '✅' : '❌'}`);
  console.log(`\nSuccess Rate: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`);
  
  if (successRate >= 80) {
    console.log('\n🎉 DATABASE OPERATIONS: SUCCESS');
    console.log('Database operations are working correctly with Supabase!');
  } else {
    console.log('\nWARNING: DATABASE OPERATIONS: PARTIAL SUCCESS');
    console.log('Some database operations failed. Check RLS policies and permissions.');
  }
  
  return testResults;
}

testDatabaseOperations().catch(console.error);
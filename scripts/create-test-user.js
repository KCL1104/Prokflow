import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://xerkidnfynjfdsdmovgu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcmtpZG5meW5qZmRzZG1vdmd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDEyNzk4MCwiZXhwIjoyMDY5NzAzOTgwfQ.e2-zXZJk8SXryrq3TTXuguU4KufU-A6xZ_Bm_1yFQlg';

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  try {
    console.log('Creating test user account...');
    
    // Create user with admin privileges
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'Abcd_123',
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        name: 'Test User',
        username: 'test'
      }
    });

    if (error) {
      console.error('Error creating user:', error.message);
      return;
    }

    console.log('✅ Test user created successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('\n📝 Login credentials:');
    console.log('Email: test@example.com');
    console.log('Password: Abcd_123');
    
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

// Run the script
createTestUser();
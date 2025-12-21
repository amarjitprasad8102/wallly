import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get the authorization header to verify the requesting user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to verify they're an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Request from user:', user.id);

    // Verify the user is an admin using the service role client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('User is not an admin:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin verified, processing request');

    const { action, userId, banReason } = await req.json();
    console.log('Action:', action, 'Target user:', userId);

    if (!action || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing action or userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the target user's profile
    const { data: targetUser, error: targetError } = await adminClient
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (targetError || !targetUser) {
      console.error('Target user not found:', targetError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Target user email:', targetUser.email);

    if (action === 'ban') {
      console.log('Banning user...');
      
      // Delete user's connections and related data
      const deletePromises = [
        adminClient.from('connections').delete().eq('user_id', userId),
        adminClient.from('connections').delete().eq('connected_user_id', userId),
        adminClient.from('connection_requests').delete().eq('from_user_id', userId),
        adminClient.from('connection_requests').delete().eq('to_user_id', userId),
        adminClient.from('messages').delete().eq('sender_id', userId),
        adminClient.from('messages').delete().eq('receiver_id', userId),
        adminClient.from('user_interests').delete().eq('user_id', userId),
        adminClient.from('matchmaking_queue').delete().eq('user_id', userId),
        adminClient.from('community_members').delete().eq('user_id', userId),
        adminClient.from('reports').delete().eq('reporter_id', userId),
      ];

      const deleteResults = await Promise.all(deletePromises);
      deleteResults.forEach((result, index) => {
        if (result.error) {
          console.error(`Delete operation ${index} failed:`, result.error);
        }
      });

      // Update profile to show banned status
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ name: '[BANNED]', age: null, gender: null })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        throw updateError;
      }

      console.log('User banned successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'User banned successfully', email: targetUser.email }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'delete') {
      console.log('Deleting user...');

      // Delete all user data
      const deletePromises = [
        adminClient.from('connections').delete().eq('user_id', userId),
        adminClient.from('connections').delete().eq('connected_user_id', userId),
        adminClient.from('connection_requests').delete().eq('from_user_id', userId),
        adminClient.from('connection_requests').delete().eq('to_user_id', userId),
        adminClient.from('messages').delete().eq('sender_id', userId),
        adminClient.from('messages').delete().eq('receiver_id', userId),
        adminClient.from('user_interests').delete().eq('user_id', userId),
        adminClient.from('matchmaking_queue').delete().eq('user_id', userId),
        adminClient.from('community_members').delete().eq('user_id', userId),
        adminClient.from('reports').delete().eq('reporter_id', userId),
        adminClient.from('user_roles').delete().eq('user_id', userId),
      ];

      const deleteResults = await Promise.all(deletePromises);
      deleteResults.forEach((result, index) => {
        if (result.error) {
          console.error(`Delete operation ${index} failed:`, result.error);
        }
      });

      // Delete profile
      const { error: profileError } = await adminClient
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Failed to delete profile:', profileError);
        throw profileError;
      }

      // Delete the auth user
      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);
      if (authDeleteError) {
        console.error('Failed to delete auth user:', authDeleteError);
        // Don't throw here, profile is already deleted
      }

      console.log('User deleted successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'User deleted successfully', email: targetUser.email }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    console.error('Error in admin-user-action:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

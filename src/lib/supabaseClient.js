import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const profileService = {
  async upsertProfile(profileData, netId) {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('net_id', netId)
        .single();

      const profileId = existingProfile?.id || undefined;

      const { canTeach, wantToLearn, availability, meetingSpots, ...profileInfo } = profileData;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: profileId,
          net_id: netId,
          name: profileInfo.name,
          year: profileInfo.year,
          college: profileInfo.college,
          bio: profileInfo.bio,
          avatar_initials: profileInfo.name.split(' ').map(n => n[0]).join(''),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) throw profileError;

      if (profileId) {
        await supabase.from('skills').delete().eq('profile_id', profile.id);
        await supabase.from('availability').delete().eq('profile_id', profile.id);
        await supabase.from('meeting_spots').delete().eq('profile_id', profile.id);
      }

      if (canTeach && canTeach.length > 0) {
        const teachingSkills = canTeach.map(skill => ({
          profile_id: profile.id,
          skill_type: skill.type,
          skill_name: skill.skill,
          skill_level: skill.level,
          is_teaching: true
        }));

        const { error: teachError } = await supabase
          .from('skills')
          .insert(teachingSkills);
        
        if (teachError) throw teachError;
      }

      // Insert learning skills
      if (wantToLearn && wantToLearn.length > 0) {
        const learningSkills = wantToLearn.map(skill => ({
          profile_id: profile.id,
          skill_type: skill.type,
          skill_name: skill.skill,
          skill_level: skill.level,
          is_teaching: false
        }));

        const { error: learnError } = await supabase
          .from('skills')
          .insert(learningSkills);
        
        if (learnError) throw learnError;
      }

      if (availability && availability.length > 0) {
        const availabilitySlots = availability.map(slot => ({
          profile_id: profile.id,
          time_slot: slot
        }));

        const { error: availError } = await supabase
          .from('availability')
          .insert(availabilitySlots);
        
        if (availError) throw availError;
      }

      if (meetingSpots && meetingSpots.length > 0) {
        const spots = meetingSpots.map(spot => ({
          profile_id: profile.id,
          location_name: spot
        }));

        const { error: spotsError } = await supabase
          .from('meeting_spots')
          .insert(spots);
        
        if (spotsError) throw spotsError;
      }

      return { success: true, profile };
    } catch (error) {
      console.error('Error upserting profile:', error);
      return { success: false, error: error.message };
    }
  },

  async getProfile(netId) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('net_id', netId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          return { success: true, profile: null };
        }
        throw profileError;
      }

      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('profile_id', profile.id);

      if (skillsError) throw skillsError;

      const { data: availability, error: availError } = await supabase
        .from('availability')
        .select('time_slot')
        .eq('profile_id', profile.id);

      if (availError) throw availError;

      const { data: meetingSpots, error: spotsError } = await supabase
        .from('meeting_spots')
        .select('location_name')
        .eq('profile_id', profile.id);

      if (spotsError) throw spotsError;

      const formattedProfile = {
        ...profile,
        canTeach: skills
          .filter(s => s.is_teaching)
          .map(s => ({
            id: s.id,
            type: s.skill_type,
            skill: s.skill_name,
            level: s.skill_level
          })),
        wantToLearn: skills
          .filter(s => !s.is_teaching)
          .map(s => ({
            id: s.id,
            type: s.skill_type,
            skill: s.skill_name,
            level: s.skill_level
          })),
        availability: availability.map(a => a.time_slot),
        meetingSpots: meetingSpots.map(s => s.location_name)
      };

      return { success: true, profile: formattedProfile };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { success: false, error: error.message };
    }
  },

  async getProfileById(profileId) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;

      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('profile_id', profile.id);

      if (skillsError) throw skillsError;

      const { data: availability, error: availError } = await supabase
        .from('availability')
        .select('time_slot')
        .eq('profile_id', profile.id);

      if (availError) throw availError;

      const { data: meetingSpots, error: spotsError } = await supabase
        .from('meeting_spots')
        .select('location_name')
        .eq('profile_id', profile.id);

      if (spotsError) throw spotsError;

      const formattedProfile = {
        ...profile,
        canTeach: skills
          .filter(s => s.is_teaching)
          .map(s => ({
            id: s.id,
            type: s.skill_type,
            skill: s.skill_name,
            level: s.skill_level
          })),
        wantToLearn: skills
          .filter(s => !s.is_teaching)
          .map(s => ({
            id: s.id,
            type: s.skill_type,
            skill: s.skill_name,
            level: s.skill_level
          })),
        availability: availability.map(a => a.time_slot),
        meetingSpots: meetingSpots.map(s => s.location_name)
      };

      return { success: true, profile: formattedProfile };
    } catch (error) {
      console.error('Error fetching profile by ID:', error);
      return { success: false, error: error.message };
    }
  },

  async getAllProfiles() {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*');

      if (skillsError) throw skillsError;

      const { data: availability, error: availError } = await supabase
        .from('availability')
        .select('*');

      if (availError) throw availError;

      const { data: meetingSpots, error: spotsError } = await supabase
        .from('meeting_spots')
        .select('*');

      if (spotsError) throw spotsError;

      const formattedProfiles = profiles.map(profile => {
        const profileSkills = skills.filter(s => s.profile_id === profile.id);
        const profileAvailability = availability.filter(a => a.profile_id === profile.id);
        const profileMeetingSpots = meetingSpots.filter(s => s.profile_id === profile.id);

        return {
          ...profile,
          canTeach: profileSkills
            .filter(s => s.is_teaching)
            .map(s => ({
              type: s.skill_type,
              skill: s.skill_name,
              level: s.skill_level
            })),
          seeking: profileSkills
            .filter(s => !s.is_teaching)
            .map(s => ({
              type: s.skill_type,
              skill: s.skill_name,
              level: s.skill_level
            })),
          availability: profileAvailability.map(a => a.time_slot),
          meetingSpots: profileMeetingSpots.map(s => s.location_name)
        };
      });

      return { success: true, profiles: formattedProfiles };
    } catch (error) {
      console.error('Error fetching all profiles:', error);
      return { success: false, error: error.message };
    }
  },

  async checkProfileExists(netId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('net_id', netId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { exists: false };
        }
        throw error;
      }

      return { exists: true, profileId: data.id };
    } catch (error) {
      console.error('Error checking profile:', error);
      return { exists: false, error: error.message };
    }
  }
};

export const chatService = {
  async getOrCreateConversation(user1Id, user2Id) {
    try {
      const { data, error } = await supabase
        .rpc('get_or_create_conversation', {
          p_user1_id: user1Id,
          p_user2_id: user2Id
        });

      if (error) throw error;
      return { success: true, conversationId: data };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error.message };
    }
  },

  async getUserConversations(userId) {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_time', { ascending: false });

      if (error) throw error;

      const conversationsWithUsers = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('net_id', otherUserId)
            .single();

          if (profile) {
            const { data: skills } = await supabase
              .from('skills')
              .select('*')
              .eq('profile_id', profile.id);

            profile.canTeach = skills?.filter(s => s.is_teaching).map(s => ({
              type: s.skill_type,
              skill: s.skill_name,
              level: s.skill_level
            })) || [];

            profile.wantToLearn = skills?.filter(s => !s.is_teaching).map(s => ({
              type: s.skill_type,
              skill: s.skill_name,
              level: s.skill_level
            })) || [];
          }

          return {
            ...conv,
            otherUser: profile
          };
        })
      );

      return { success: true, conversations: conversationsWithUsers };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, error: error.message };
    }
  },

  async getConversation(conversationId) {
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      const currentUser = getCurrentUser();
      const otherUserId = conversation.user1_id === currentUser.netId 
        ? conversation.user2_id 
        : conversation.user1_id;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('net_id', otherUserId)
        .single();

      if (profile) {
        const { data: skills } = await supabase
          .from('skills')
          .select('*')
          .eq('profile_id', profile.id);

        const { data: availability } = await supabase
          .from('availability')
          .select('time_slot')
          .eq('profile_id', profile.id);

        const { data: meetingSpots } = await supabase
          .from('meeting_spots')
          .select('location_name')
          .eq('profile_id', profile.id);

        profile.canTeach = skills?.filter(s => s.is_teaching).map(s => ({
          type: s.skill_type,
          skill: s.skill_name,
          level: s.skill_level
        })) || [];

        profile.wantToLearn = skills?.filter(s => !s.is_teaching).map(s => ({
          type: s.skill_type,
          skill: s.skill_name,
          level: s.skill_level
        })) || [];

        profile.availability = availability?.map(a => a.time_slot) || [];
        profile.meetingSpots = meetingSpots?.map(s => s.location_name) || [];
      }

      return { 
        success: true, 
        conversation,
        otherUser: profile 
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return { success: false, error: error.message };
    }
  },

  async getMessages(conversationId) {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { success: true, messages };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error: error.message };
    }
  },

  async sendMessage(conversationId, senderId, messageText) {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          message_text: messageText
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  },

  async markMessagesAsRead(conversationId, readerId) {
    try {

      const { error } = await supabase
        .rpc('mark_messages_read', {
          p_conversation_id: conversationId,
          p_reader_id: readerId
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (userData) => {
  localStorage.setItem('currentUser', JSON.stringify(userData));
};

export const clearCurrentUser = () => {
  localStorage.removeItem('currentUser');
};
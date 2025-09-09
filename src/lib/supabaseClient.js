// src/lib/supabaseClient.js
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

      // Delete existing data if updating
      if (profileId) {
        await supabase.from('skills').delete().eq('profile_id', profile.id);
        await supabase.from('availability').delete().eq('profile_id', profile.id);
        await supabase.from('meeting_spots').delete().eq('profile_id', profile.id);
      }

      // Insert teaching skills
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

      // Insert availability
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

      // Insert meeting spots
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
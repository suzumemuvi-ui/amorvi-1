import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContextV2';
import { useTheme } from '../context/ThemeContext';
import { buildApiUrl } from '../config/api';

const pink = '#ff075b';
const fallbackPhoto = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85';

type PublicUser = {
  id: string;
  name: string;
  age: number;
  bio?: string;
  interests?: string[];
  images?: string[];
  location?: { latitude: number; longitude: number } | null;
  distance?: number;
};

type FeedPost = {
  id: string;
  images: string[];
  caption: string;
  createdAt: string;
  user: PublicUser;
  likes: number;
  comments: number;
  liked: boolean;
  interested: boolean;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: PublicUser;
};

async function api<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }
  return payload as T;
}

function useColors() {
  const { dark } = useTheme();
  return {
    dark,
    bg: dark ? '#07131d' : '#fff',
    card: dark ? '#10202d' : '#f4f6f9',
    text: dark ? '#f8f9fc' : '#111318',
    muted: dark ? '#b4bdc8' : '#52627b',
    line: dark ? '#223342' : '#e7eaf0',
  };
}

function PageHeader({ title, onBack, action }: { title: string; onBack?: () => void; action?: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={[styles.header, { borderBottomColor: c.line }]}>
      {onBack ? <TouchableOpacity onPress={onBack} hitSlop={12}><Icon name="chevron-back" size={27} color={c.text} /></TouchableOpacity> : null}
      <Text style={[styles.headerTitle, { color: c.text }]}>{title}</Text>
      {action ?? (onBack ? <View style={{ width: 27 }} /> : null)}
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const c = useColors();
  return <View style={styles.centerState}><Icon name="cloud-offline-outline" size={36} color={pink} /><Text style={[styles.stateTitle, { color: c.text }]}>{message}</Text><TouchableOpacity style={styles.secondaryButton} onPress={onRetry}><Text style={styles.secondaryButtonText}>Try again</Text></TouchableOpacity></View>;
}

export function HomeScreen({ navigation }: any) {
  const c = useColors();
  const { token } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [postDraft, setPostDraft] = useState('');
  const [creatingPost, setCreatingPost] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!token) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const result = await api<{ posts: FeedPost[] }>('/feed', token);
      setPosts(result.posts ?? []);
    } catch (e: any) {
      setError(e?.message || 'Could not load the feed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const likePost = async (post: FeedPost) => {
    if (!token) return;
    try {
      const result = await api<{ liked: boolean; likes: number }>(`/posts/${post.id}/like`, token, { method: 'POST' });
      setPosts(current => current.map(item => item.id === post.id ? { ...item, liked: result.liked, likes: result.likes } : item));
    } catch (e: any) { Alert.alert('Could not update like', e?.message || 'Please try again.'); }
  };

  const interested = async (post: FeedPost) => {
    if (!token) return;
    try {
      if (post.interested) {
        await api(`/interested/${post.user.id}`, token, { method: 'DELETE' });
      } else {
        await api(`/interested/${post.user.id}`, token, { method: 'POST' });
      }
      setPosts(current => current.map(item => item.user.id === post.user.id ? { ...item, interested: !post.interested } : item));
    } catch (e: any) { Alert.alert('Could not update Interested', e?.message || 'Please try again.'); }
  };

  const openComments = async (post: FeedPost) => {
    setCommentPost(post);
    setComments([]);
    setCommentDraft('');
    if (!token) return;
    try {
      const result = await api<{ comments: Comment[] }>(`/posts/${post.id}/comments`, token);
      setComments(result.comments ?? []);
    } catch (e: any) { Alert.alert('Could not load comments', e?.message || 'Please try again.'); }
  };

  const sendComment = async () => {
    const content = commentDraft.trim();
    if (!token || !commentPost || !content || commentLoading) return;
    setCommentLoading(true);
    try {
      const result = await api<{ comment: Comment }>(`/posts/${commentPost.id}/comments`, token, { method: 'POST', body: JSON.stringify({ content }) });
      setComments(current => [...current, result.comment]);
      setPosts(current => current.map(item => item.id === commentPost.id ? { ...item, comments: item.comments + 1 } : item));
      setCommentDraft('');
    } catch (e: any) { Alert.alert('Could not send comment', e?.message || 'Please try again.'); }
    finally { setCommentLoading(false); }
  };

  const createPost = async () => {
    const caption = postDraft.trim();
    if (!token || !caption || creatingPost) return;
    setCreatingPost(true);
    try {
      await api('/posts', token, { method: 'POST', body: JSON.stringify({ images: [], caption }) });
      setPostDraft('');
      setCreateOpen(false);
      await load(true);
    } catch (e: any) { Alert.alert('Could not create post', e?.message || 'Please try again.'); }
    finally { setCreatingPost(false); }
  };

  if (loading) return <View style={[styles.page, { backgroundColor: c.bg }]}><PageHeader title="Discover"/><ActivityIndicator style={{ marginTop: 32 }} color={pink} /></View>;
  if (error) return <View style={[styles.page, { backgroundColor: c.bg }]}><PageHeader title="Discover"/><ErrorState message={error} onRetry={() => load()} /></View>;

  return (
    <View style={[styles.page, { backgroundColor: c.bg }]}>
      <PageHeader title="Discover" action={<TouchableOpacity onPress={()=>setCreateOpen(true)} hitSlop={12}><Icon name="add-circle-outline" size={27} color={pink}/></TouchableOpacity>} />
      <ScrollView contentContainerStyle={styles.feedList} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={pink} />}>
        {posts.length === 0 ? <View style={styles.centerState}><Icon name="images-outline" size={40} color={pink}/><Text style={[styles.stateTitle,{color:c.text}]}>No posts yet</Text><Text style={[styles.stateBody,{color:c.muted}]}>Posts from people nearby will appear here.</Text></View> : null}
        {posts.map(post => (
          <View key={post.id} style={[styles.postCard, { backgroundColor: c.card }]}>
            <View style={styles.row}>
              <Image source={{ uri: post.user.images?.[0] || fallbackPhoto }} style={styles.avatar} />
              <View style={{ flex: 1 }}><Text style={[styles.userName, { color: c.text }]}>{post.user.name}, {post.user.age}</Text><Text style={[styles.smallText, { color: c.muted }]}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</Text></View>
              <TouchableOpacity onPress={() => navigation?.navigate('Amorvi')}><Text style={styles.pinkText}>View</Text></TouchableOpacity>
            </View>
            {post.images?.[0] ? <Image source={{ uri: post.images[0] }} style={styles.postImage} resizeMode="cover" /> : null}
            {post.caption ? <Text style={[styles.caption, { color: c.text }]}>{post.caption}</Text> : null}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => likePost(post)} style={styles.action}><Icon name={post.liked ? 'heart' : 'heart-outline'} size={22} color={post.liked ? pink : c.text}/><Text style={[styles.smallText,{color:c.text}]}>{post.likes}</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => openComments(post)} style={styles.action}><Icon name="chatbubble-outline" size={20} color={c.text}/><Text style={[styles.smallText,{color:c.text}]}>{post.comments}</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => interested(post)} style={[styles.interestedButton, post.interested && styles.interestedActive]}><Icon name={post.interested ? 'bookmark' : 'bookmark-outline'} size={17} color={pink}/><Text style={styles.pinkText}>{post.interested ? 'Saved' : 'Interested'}</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <Modal visible={Boolean(commentPost)} animationType="slide" transparent onRequestClose={() => setCommentPost(null)}>
        <View style={styles.modalScrim}><View style={[styles.commentSheet,{backgroundColor:c.bg}]}><View style={styles.sheetHeader}><Text style={[styles.stateTitle,{color:c.text}]}>Comments</Text><TouchableOpacity onPress={() => setCommentPost(null)}><Icon name="close" size={24} color={c.text}/></TouchableOpacity></View><ScrollView style={{maxHeight:360}}>{comments.map(comment => <View key={comment.id} style={styles.commentRow}><Text style={[styles.userName,{color:c.text}]}>{comment.user?.name || 'User'}</Text><Text style={[styles.stateBody,{color:c.muted}]}>{comment.content}</Text></View>)}{comments.length===0?<Text style={[styles.stateBody,{color:c.muted,marginVertical:16}]}>No comments yet. Start the conversation.</Text>:null}</ScrollView><View style={styles.commentComposer}><TextInput value={commentDraft} onChangeText={setCommentDraft} placeholder="Write a comment…" placeholderTextColor={c.muted} style={[styles.commentInput,{backgroundColor:c.card,color:c.text}]} maxLength={500}/><TouchableOpacity onPress={sendComment} disabled={!commentDraft.trim()||commentLoading} style={styles.sendButton}><Icon name="send" size={19} color="#fff"/></TouchableOpacity></View></View></View>
      </Modal>
      <Modal visible={createOpen} animationType="slide" transparent onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.modalScrim}><View style={[styles.commentSheet,{backgroundColor:c.bg}]}><View style={styles.sheetHeader}><Text style={[styles.stateTitle,{color:c.text}]}>Create a post</Text><TouchableOpacity onPress={()=>setCreateOpen(false)}><Icon name="close" size={24} color={c.text}/></TouchableOpacity></View><Text style={[styles.stateBody,{color:c.muted}]}>Write a caption to share with the community.</Text><TextInput value={postDraft} onChangeText={setPostDraft} placeholder="What’s on your mind?" placeholderTextColor={c.muted} multiline maxLength={500} style={[styles.input,styles.bioInput,{backgroundColor:c.card,color:c.text,marginTop:14}]}/><TouchableOpacity disabled={!postDraft.trim()||creatingPost} onPress={createPost} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{creatingPost?'Posting…':'Share post'}</Text></TouchableOpacity></View></View>
      </Modal>
    </View>
  );
}

type DiscoverTab = 'Discover' | 'Interested' | 'Likes You';
export function AmorviScreen() {
  const c = useColors();
  const { token, user } = useAuth();
  const [tab, setTab] = useState<DiscoverTab>('Discover');
  const [profiles, setProfiles] = useState<PublicUser[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(''); setIndex(0);
    try {
      const path = tab === 'Discover' ? '/users/nearby?radius=50000' : tab === 'Interested' ? '/interested' : '/likes/received';
      const result = await api<{ users?: PublicUser[]; profiles?: PublicUser[] }>(path, token);
      setProfiles(tab === 'Discover' ? result.users ?? [] : result.profiles ?? []);
    } catch (e: any) { setProfiles([]); setError(e?.message || 'Could not load profiles.'); }
    finally { setLoading(false); }
  }, [tab, token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const profile = profiles[index];

  const act = async (action: 'pass' | 'like' | 'interested') => {
    if (!token || !profile) return;
    try {
      if (action === 'pass' && tab === 'Interested') await api(`/interested/${profile.id}`, token, { method: 'DELETE' });
      else if (action === 'pass' && tab === 'Likes You') await api(`/likes/${profile.id}`, token, { method: 'DELETE' });
      else if (action === 'pass') await api(`/passes/${profile.id}`, token, { method: 'POST' });
      else if (action === 'interested') await api(`/interested/${profile.id}`, token, { method: 'POST' });
      else {
        const result = await api<{ match: boolean }>(`/likes/${profile.id}`, token, { method: 'POST' });
        if (result.match) Alert.alert("It's a match!", `You and ${profile.name} liked each other.`);
      }
      setIndex(current => current + 1);
    } catch (e: any) { Alert.alert('Could not update profile', e?.message || 'Please try again.'); }
  };

  return (
    <View style={[styles.page,{backgroundColor:c.bg}]}>
      <PageHeader title="Amorvi" />
      <View style={styles.tabs}>{(['Discover','Interested','Likes You'] as DiscoverTab[]).map(item=><TouchableOpacity key={item} onPress={()=>setTab(item)} style={[styles.tab,tab===item&&styles.tabActive]}><Text style={[styles.tabText,{color:tab===item?'#fff':c.text}]}>{item}</Text></TouchableOpacity>)}</View>
      {loading ? <ActivityIndicator style={{marginTop:30}} color={pink}/> : error ? <ErrorState message={error} onRetry={load}/> : !profile ? <View style={styles.centerState}><Icon name="heart-outline" size={42} color={pink}/><Text style={[styles.stateTitle,{color:c.text}]}>{tab==='Discover'&&!user?.location?'Set your location to discover nearby people':'You’re all caught up'}</Text><Text style={[styles.stateBody,{color:c.muted}]}>{tab==='Discover'&&!user?.location?'Allow location access so Amorvi can find people near you.':'Check back later for more profiles.'}</Text></View> : <ScrollView contentContainerStyle={styles.discoverContent}>
        <Image source={{uri:profile.images?.[0]||fallbackPhoto}} style={styles.discoverImage}/>
        <View style={[styles.profileCard,{backgroundColor:c.card}]}><Text style={[styles.profileTitle,{color:c.text}]}>{profile.name}, {profile.age}</Text><Text style={[styles.stateBody,{color:c.muted}]}>{profile.distance !== undefined ? `${profile.distance<1000?`${profile.distance} m`:`${(profile.distance/1000).toFixed(1)} km`} away` : profile.location ? `${profile.location.latitude.toFixed(2)}, ${profile.location.longitude.toFixed(2)}` : 'Nearby'}</Text><Text style={[styles.caption,{color:c.text}]}>{profile.bio || 'Open to meeting someone new.'}</Text><View style={styles.chips}>{(profile.interests||[]).map(item=><Text key={item} style={styles.chip}>{item}</Text>)}</View></View>
        <View style={styles.discoverActions}><TouchableOpacity onPress={()=>act('pass')} style={[styles.circleButton,{backgroundColor:c.card}]}><Icon name="close" size={28} color={c.muted}/></TouchableOpacity><TouchableOpacity onPress={()=>act('interested')} style={[styles.circleButton,{backgroundColor:c.card}]}><Icon name="bookmark-outline" size={23} color="#7938ff"/></TouchableOpacity><TouchableOpacity onPress={()=>act('like')} style={[styles.circleButton,styles.likeCircle]}><Icon name="heart" size={29} color="#fff"/></TouchableOpacity></View>
      </ScrollView>}
    </View>
  );
}

export function RadarScreen() {
  const c=useColors(); const {token}=useAuth(); const [users,setUsers]=useState<PublicUser[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  const load=useCallback(async()=>{if(!token)return;setLoading(true);setError('');try{const result=await api<{users:PublicUser[]}>('/users/nearby?radius=50000',token);setUsers(result.users||[]);}catch(e:any){setError(e?.message||'Could not load nearby people.');}finally{setLoading(false);}},[token]);
  useFocusEffect(useCallback(()=>{load();},[load]));
  return <View style={[styles.page,{backgroundColor:c.bg}]}><PageHeader title="Radar"/>{loading?<ActivityIndicator style={{marginTop:30}} color={pink}/>:error?<ErrorState message={error} onRetry={load}/>:<ScrollView contentContainerStyle={styles.listContent}>{users.length===0?<View style={styles.centerState}><Icon name="radio-outline" size={40} color={pink}/><Text style={[styles.stateTitle,{color:c.text}]}>No one nearby yet</Text><Text style={[styles.stateBody,{color:c.muted}]}>People nearby will appear when they have registered and shared their location.</Text></View>:users.map(person=><View key={person.id} style={[styles.personRow,{backgroundColor:c.card}]}><Image source={{uri:person.images?.[0]||fallbackPhoto}} style={styles.avatarLarge}/><View style={{flex:1}}><Text style={[styles.userName,{color:c.text}]}>{person.name}, {person.age}</Text><Text style={[styles.smallText,{color:c.muted}]}>{person.distance===undefined?'Nearby':person.distance<1000?`${person.distance} m away`:`${(person.distance/1000).toFixed(1)} km away`}</Text><Text numberOfLines={2} style={[styles.smallText,{color:c.muted}]}>{person.bio||'Open to meeting someone new.'}</Text></View><Icon name="heart-outline" size={22} color={pink}/></View>)}</ScrollView>}</View>;
}

export function ProfileScreen({navigation}:any) {
  const c=useColors(); const {user}=useAuth(); const [counts,setCounts]=useState({matches:0,likes:0,connections:0}); const {token}=useAuth();
  const load=useCallback(async()=>{if(!token)return;const [matches,likes,connections]=await Promise.allSettled([api<{matches:any[]}>('/matches',token),api<{profiles:any[]}>('/likes/received',token),api<{connections:any[]}>('/connections',token)]);setCounts({matches:matches.status==='fulfilled'?matches.value.matches.length:0,likes:likes.status==='fulfilled'?likes.value.profiles.length:0,connections:connections.status==='fulfilled'?connections.value.connections.length:0});},[token]);
  useFocusEffect(useCallback(()=>{load();},[load]));
  const image=user?.images?.[0]||fallbackPhoto;
  return <View style={[styles.page,{backgroundColor:c.bg}]}><PageHeader title="My profile"/><ScrollView contentContainerStyle={styles.profileContent}><Image source={{uri:image}} style={styles.profileAvatar}/><Text style={[styles.profileTitle,{color:c.text}]}>{user?.name||'Your profile'}{user?.age?`, ${user.age}`:''}</Text><Text style={[styles.stateBody,{color:c.muted}]}>{[user?.city,user?.email].filter(Boolean).join(' · ')}</Text>{user?.jobTitle||user?.education?<Text style={[styles.smallText,{color:c.muted}]}>{[user?.jobTitle,user?.education].filter(Boolean).join(' · ')}</Text>:null}<TouchableOpacity onPress={()=>navigation.navigate('EditProfile')} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Edit profile</Text></TouchableOpacity><View style={[styles.stats,{backgroundColor:c.card}]}>{[[counts.matches,'Matches','Matches'],[counts.likes,'Likes You','Likes'],[counts.connections,'Connections','Connections']].map(([count,label,target]:any)=><TouchableOpacity key={label} onPress={()=>navigation.navigate(target)} style={styles.stat}><Text style={[styles.profileTitle,{color:c.text}]}>{count}</Text><Text style={[styles.smallText,{color:c.muted}]}>{label}</Text></TouchableOpacity>)}</View><Text style={[styles.sectionTitle,{color:c.text}]}>About me</Text><Text style={[styles.stateBody,{color:c.muted}]}>{user?.bio||'Add a short bio to introduce yourself.'}</Text><Text style={[styles.sectionTitle,{color:c.text}]}>Interests</Text><View style={styles.chips}>{(user?.interests||[]).map(item=><Text key={item} style={styles.chip}>{item}</Text>)}</View><TouchableOpacity onPress={()=>navigation.navigate('Settings')} style={[styles.settingsLink,{borderColor:c.line}]}><Icon name="settings-outline" size={20} color={c.text}/><Text style={[styles.userName,{color:c.text}]}>Settings & account</Text><Icon name="chevron-forward" size={20} color={c.muted}/></TouchableOpacity></ScrollView></View>;
}

export function EditProfileScreen({navigation}:any) {
  const c=useColors(); const {user,updateProfile}=useAuth(); const [name,setName]=useState(user?.name||''); const [age,setAge]=useState(String(user?.age||'')); const [bio,setBio]=useState(user?.bio||''); const [city,setCity]=useState(user?.city||''); const [jobTitle,setJobTitle]=useState(user?.jobTitle||''); const [education,setEducation]=useState(user?.education||''); const [dailyRoutine,setDailyRoutine]=useState(user?.dailyRoutine||''); const [additionalInfo,setAdditionalInfo]=useState(user?.additionalInfo||''); const [interests,setInterests]=useState(user?.interests||[]); const [newInterest,setNewInterest]=useState(''); const [saving,setSaving]=useState(false);
  const addInterest=()=>{const value=newInterest.trim();if(value&&!interests.includes(value)){setInterests(current=>[...current,value]);setNewInterest('');}};
  const save=async()=>{if(!name.trim()){Alert.alert('Name required','Enter your name before saving.');return;}const numericAge=Number(age);if(!Number.isInteger(numericAge)||numericAge<18){Alert.alert('Age required','You must be at least 18.');return;}setSaving(true);try{await updateProfile({name:name.trim(),age:numericAge,bio:bio.trim(),interests,city:city.trim(),jobTitle:jobTitle.trim(),education:education.trim(),dailyRoutine:dailyRoutine.trim(),additionalInfo:additionalInfo.trim()});Alert.alert('Profile saved','Your changes have been saved.');navigation.goBack();}catch(e:any){Alert.alert('Could not save',e?.message||'Please try again.');}finally{setSaving(false);}};
  return <View style={[styles.page,{backgroundColor:c.bg}]}><PageHeader title="Edit profile" onBack={()=>navigation.goBack()}/><ScrollView contentContainerStyle={styles.editContent}><Text style={[styles.sectionTitle,{color:c.text}]}>Name</Text><TextInput value={name} onChangeText={setName} style={[styles.input,{backgroundColor:c.card,color:c.text}]} /><Text style={[styles.sectionTitle,{color:c.text}]}>Age</Text><TextInput value={age} onChangeText={setAge} keyboardType="number-pad" style={[styles.input,{backgroundColor:c.card,color:c.text}]} /><Text style={[styles.sectionTitle,{color:c.text}]}>City</Text><TextInput value={city} onChangeText={setCity} style={[styles.input,{backgroundColor:c.card,color:c.text}]} /><Text style={[styles.sectionTitle,{color:c.text}]}>Job title</Text><TextInput value={jobTitle} onChangeText={setJobTitle} style={[styles.input,{backgroundColor:c.card,color:c.text}]} /><Text style={[styles.sectionTitle,{color:c.text}]}>Education</Text><TextInput value={education} onChangeText={setEducation} style={[styles.input,{backgroundColor:c.card,color:c.text}]} /><Text style={[styles.sectionTitle,{color:c.text}]}>About me</Text><TextInput value={bio} onChangeText={setBio} multiline maxLength={500} style={[styles.input,styles.bioInput,{backgroundColor:c.card,color:c.text}]} /><Text style={[styles.sectionTitle,{color:c.text}]}>Daily routine</Text><TextInput value={dailyRoutine} onChangeText={setDailyRoutine} multiline maxLength={500} style={[styles.input,styles.bioInput,{backgroundColor:c.card,color:c.text}]} /><Text style={[styles.sectionTitle,{color:c.text}]}>Additional info</Text><TextInput value={additionalInfo} onChangeText={setAdditionalInfo} multiline maxLength={500} style={[styles.input,styles.bioInput,{backgroundColor:c.card,color:c.text}]} /><Text style={[styles.sectionTitle,{color:c.text}]}>Interests</Text><View style={styles.chips}>{interests.map(item=><TouchableOpacity key={item} onPress={()=>setInterests(current=>current.filter(value=>value!==item))} style={styles.chip}><Text style={styles.chipText}>{item} ×</Text></TouchableOpacity>)}</View><View style={styles.row}><TextInput value={newInterest} onChangeText={setNewInterest} placeholder="Add an interest" placeholderTextColor={c.muted} style={[styles.input,{backgroundColor:c.card,color:c.text,flex:1}]} onSubmitEditing={addInterest}/><TouchableOpacity onPress={addInterest} style={styles.sendButton}><Icon name="add" size={22} color="#fff"/></TouchableOpacity></View><TouchableOpacity disabled={saving} onPress={save} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{saving?'Saving…':'Save changes'}</Text></TouchableOpacity></ScrollView></View>;
}

export function LikesScreen({navigation}:any) {
  return <AmorviLikesScreen navigation={navigation}/>;
}
function AmorviLikesScreen({navigation}:any){
  const c=useColors();const {token}=useAuth();const [profiles,setProfiles]=useState<PublicUser[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  const load=useCallback(async()=>{if(!token)return;setLoading(true);setError('');try{const result=await api<{profiles:PublicUser[]}>('/likes/received',token);setProfiles(result.profiles||[]);}catch(e:any){setError(e?.message||'Could not load likes.');}finally{setLoading(false);}},[token]);useFocusEffect(useCallback(()=>{load();},[load]));
  const like=async(profile:PublicUser)=>{try{const result=await api<{match:boolean}>(`/likes/${profile.id}`,token!,{method:'POST'});setProfiles(current=>current.filter(item=>item.id!==profile.id));if(result.match)Alert.alert("It's a match!",`You and ${profile.name} liked each other.`);}catch(e:any){Alert.alert('Could not like profile',e?.message||'Please try again.');}};
  const pass=async(profile:PublicUser)=>{try{await api(`/likes/${profile.id}`,token!,{method:'DELETE'});setProfiles(current=>current.filter(item=>item.id!==profile.id));}catch(e:any){Alert.alert('Could not dismiss like',e?.message||'Please try again.');}};
  return <View style={[styles.page,{backgroundColor:c.bg}]}><PageHeader title="Likes You" onBack={()=>navigation?.goBack()}/>{loading?<ActivityIndicator style={{marginTop:30}} color={pink}/>:error?<ErrorState message={error} onRetry={load}/>:<ScrollView contentContainerStyle={styles.listContent}>{profiles.length===0?<Text style={[styles.stateBody,{color:c.muted,textAlign:'center',marginTop:35}]}>No likes yet. New likes will appear here.</Text>:profiles.map(profile=><View key={profile.id} style={[styles.personRow,{backgroundColor:c.card}]}><Image source={{uri:profile.images?.[0]||fallbackPhoto}} style={styles.avatarLarge}/><View style={{flex:1}}><Text style={[styles.userName,{color:c.text}]}>{profile.name}, {profile.age}</Text><Text numberOfLines={2} style={[styles.smallText,{color:c.muted}]}>{profile.bio||'Liked your profile'}</Text></View><TouchableOpacity onPress={()=>pass(profile)} style={styles.smallAction}><Icon name="close" size={19} color={c.muted}/></TouchableOpacity><TouchableOpacity onPress={()=>like(profile)} style={[styles.smallAction,{backgroundColor:pink}]}><Icon name="heart" size={19} color="#fff"/></TouchableOpacity></View>)}</ScrollView>}</View>;
}

export function ConnectionsScreen({navigation}:any) {
  const c=useColors();const {token}=useAuth();const [connections,setConnections]=useState<Array<{id:string;user:PublicUser}>>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  const load=useCallback(async()=>{if(!token)return;setLoading(true);setError('');try{const result=await api<{connections:Array<{id:string;user:PublicUser}>}>('/connections',token);setConnections(result.connections||[]);}catch(e:any){setError(e?.message||'Could not load connections.');}finally{setLoading(false);}},[token]);useFocusEffect(useCallback(()=>{load();},[load]));
  return <View style={[styles.page,{backgroundColor:c.bg}]}><PageHeader title="Connections" onBack={()=>navigation?.goBack()}/>{loading?<ActivityIndicator style={{marginTop:30}} color={pink}/>:error?<ErrorState message={error} onRetry={load}/>:<ScrollView contentContainerStyle={styles.listContent}>{connections.length===0?<Text style={[styles.stateBody,{color:c.muted,textAlign:'center',marginTop:35}]}>No connections yet. Connect with someone from Discover.</Text>:connections.map(item=><TouchableOpacity key={item.id} onPress={()=>navigation?.getParent()?.navigate('Chats',{screen:'Conversation',params:{user:item.user,chatId:item.user.id}})} style={[styles.personRow,{backgroundColor:c.card}]}><Image source={{uri:item.user.images?.[0]||fallbackPhoto}} style={styles.avatarLarge}/><View style={{flex:1}}><Text style={[styles.userName,{color:c.text}]}>{item.user.name}, {item.user.age}</Text><Text numberOfLines={2} style={[styles.smallText,{color:c.muted}]}>{item.user.bio||'Your connection'}</Text></View><Icon name="chatbubble-outline" size={22} color={pink}/></TouchableOpacity>)}</ScrollView>}</View>;
}

export function MatchesScreen({navigation}:any) {
  const c=useColors();const {token}=useAuth();const [matches,setMatches]=useState<Array<{id:string;user:PublicUser;createdAt:string}>>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  const load=useCallback(async()=>{if(!token)return;setLoading(true);setError('');try{const result=await api<{matches:Array<{id:string;user:PublicUser;createdAt:string}>}>('/matches',token);setMatches(result.matches||[]);}catch(e:any){setError(e?.message||'Could not load matches.');}finally{setLoading(false);}},[token]);useFocusEffect(useCallback(()=>{load();},[load]));
  return <View style={[styles.page,{backgroundColor:c.bg}]}><PageHeader title="Matches" onBack={()=>navigation?.goBack()}/>{loading?<ActivityIndicator style={{marginTop:30}} color={pink}/>:error?<ErrorState message={error} onRetry={load}/>:<ScrollView contentContainerStyle={styles.listContent}>{matches.length===0?<Text style={[styles.stateBody,{color:c.muted,textAlign:'center',marginTop:35}]}>When you both like each other, your match will appear here.</Text>:matches.map(item=><TouchableOpacity key={item.id} onPress={()=>navigation?.getParent()?.navigate('Chats',{screen:'Conversation',params:{user:item.user,chatId:item.user.id}})} style={[styles.personRow,{backgroundColor:c.card}]}><Image source={{uri:item.user.images?.[0]||fallbackPhoto}} style={styles.avatarLarge}/><View style={{flex:1}}><Text style={[styles.userName,{color:c.text}]}>{item.user.name}, {item.user.age}</Text><Text numberOfLines={2} style={[styles.smallText,{color:c.muted}]}>{item.user.bio||'It’s a match!'}</Text></View><Icon name="chatbubble-outline" size={22} color={pink}/></TouchableOpacity>)}</ScrollView>}</View>;
}

export function SettingsScreen({navigation}:any) {
  const c=useColors(); const {dark,toggleTheme}=useTheme(); const {logout}=useAuth();
  return <View style={[styles.page,{backgroundColor:c.bg}]}><PageHeader title="Settings" onBack={()=>navigation?.goBack()}/><View style={styles.settingsContent}><View style={[styles.settingsLink,{borderColor:c.line,marginTop:0}]}><View style={{flex:1}}><Text style={[styles.userName,{color:c.text}]}>Dark appearance</Text><Text style={[styles.smallText,{color:c.muted}]}>Use the dark color theme</Text></View><Switch value={dark} onValueChange={toggleTheme} trackColor={{true:pink}}/></View><TouchableOpacity onPress={()=>navigation.navigate('Account')} style={[styles.settingsLink,{borderColor:c.line}]}><View style={{flex:1}}><Text style={[styles.userName,{color:c.text}]}>Account & security</Text><Text style={[styles.smallText,{color:c.muted}]}>Password, account details, and deletion</Text></View><Icon name="chevron-forward" size={20} color={c.muted}/></TouchableOpacity><TouchableOpacity onPress={()=>Alert.alert('Log out','Log out of Amorvi?', [{text:'Cancel',style:'cancel'},{text:'Log out',style:'destructive',onPress:logout}])} style={[styles.settingsLink,{borderColor:c.line}]}><Text style={[styles.userName,{color:pink}]}>Log out</Text></TouchableOpacity></View></View>;
}

export function AccountScreen({navigation}:any) {
  const c=useColors(); const {token,user,logout}=useAuth();
  const [passwordOpen,setPasswordOpen]=useState(false); const [currentPassword,setCurrentPassword]=useState(''); const [newPassword,setNewPassword]=useState(''); const [confirmPassword,setConfirmPassword]=useState(''); const [saving,setSaving]=useState(false);
  const changePassword=async()=>{
    if(!currentPassword||!newPassword||!confirmPassword){Alert.alert('Missing information','Fill in all password fields.');return;}
    if(newPassword!==confirmPassword){Alert.alert('Passwords do not match','Confirm the new password again.');return;}
    if(newPassword.length<8){Alert.alert('Password too short','Use at least 8 characters.');return;}
    if(!token)return;
    setSaving(true);
    try{await api('/me/password',token,{method:'PATCH',body:JSON.stringify({currentPassword,newPassword})});setPasswordOpen(false);setCurrentPassword('');setNewPassword('');setConfirmPassword('');Alert.alert('Password updated','Your password has been changed.');}
    catch(e:any){Alert.alert('Could not change password',e?.message||'Please try again.');}
    finally{setSaving(false);}
  };
  const deleteAccount=()=>Alert.alert('Delete account','This permanently removes your profile, posts, likes, matches, connections, and messages.',[{text:'Cancel',style:'cancel'},{text:'Delete account',style:'destructive',onPress:async()=>{if(!token)return;try{await api('/me',token,{method:'DELETE'});await logout();}catch(e:any){Alert.alert('Could not delete account',e?.message||'Please try again.');}}}]);
  return <View style={[styles.page,{backgroundColor:c.bg}]}><PageHeader title="Account" onBack={()=>navigation?.goBack()}/><ScrollView contentContainerStyle={styles.settingsContent}><View style={[styles.accountInfo,{backgroundColor:c.card}]}><Text style={[styles.infoLabel,{color:c.muted}]}>Email</Text><Text style={[styles.userName,{color:c.text}]}>{user?.email}</Text><Text style={[styles.infoLabel,{color:c.muted,marginTop:15}]}>User ID</Text><Text selectable style={[styles.smallText,{color:c.text}]}>{user?.id}</Text><Text style={[styles.infoLabel,{color:c.muted,marginTop:15}]}>Member since</Text><Text style={[styles.smallText,{color:c.text}]}>{user?.createdAt?new Date(user.createdAt).toLocaleDateString():'—'}</Text></View><TouchableOpacity onPress={()=>setPasswordOpen(true)} style={[styles.settingsLink,{borderColor:c.line}]}><View style={{flex:1}}><Text style={[styles.userName,{color:c.text}]}>Change password</Text><Text style={[styles.smallText,{color:c.muted}]}>Update the password for this account</Text></View><Icon name="chevron-forward" size={20} color={c.muted}/></TouchableOpacity><TouchableOpacity onPress={deleteAccount} style={[styles.settingsLink,{borderColor:c.line}]}><Text style={[styles.userName,{color:'#e53935'}]}>Delete account</Text></TouchableOpacity><Text style={[styles.stateBody,{color:c.muted}]}>Account deletion is permanent and removes your data from Amorvi.</Text></ScrollView><Modal visible={passwordOpen} animationType="slide" transparent onRequestClose={()=>setPasswordOpen(false)}><View style={styles.modalScrim}><View style={[styles.passwordSheet,{backgroundColor:c.bg}]}><View style={styles.sheetHeader}><Text style={[styles.stateTitle,{color:c.text}]}>Change password</Text><TouchableOpacity onPress={()=>setPasswordOpen(false)}><Icon name="close" size={24} color={c.text}/></TouchableOpacity></View>{[[currentPassword,setCurrentPassword,'Current password'],[newPassword,setNewPassword,'New password'],[confirmPassword,setConfirmPassword,'Confirm new password']].map(([value,setter,label]:any)=><TextInput key={label} value={value} onChangeText={setter} placeholder={label} placeholderTextColor={c.muted} secureTextEntry style={[styles.input,{backgroundColor:c.card,color:c.text}]} />)}<TouchableOpacity disabled={saving} onPress={changePassword} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{saving?'Saving…':'Save password'}</Text></TouchableOpacity></View></View></Modal></View>;
}

const styles=StyleSheet.create({
  page:{flex:1},header:{minHeight:54,paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:StyleSheet.hairlineWidth},headerTitle:{fontSize:22,fontWeight:'800'},feedList:{padding:14,paddingBottom:28},postCard:{borderRadius:16,padding:12,marginBottom:16},row:{flexDirection:'row',alignItems:'center',gap:10},avatar:{width:44,height:44,borderRadius:22},avatarLarge:{width:64,height:64,borderRadius:32},userName:{fontSize:16,fontWeight:'800'},smallText:{fontSize:12,marginTop:3},postImage:{height:320,width:'100%',borderRadius:12,marginTop:12,backgroundColor:'#dfe4eb'},caption:{fontSize:15,lineHeight:22,marginTop:10},actions:{flexDirection:'row',alignItems:'center',gap:20,marginTop:12},action:{flexDirection:'row',alignItems:'center',gap:6},interestedButton:{marginLeft:'auto',flexDirection:'row',alignItems:'center',gap:5,borderWidth:1,borderColor:'#ff9fbd',borderRadius:18,paddingVertical:7,paddingHorizontal:12},interestedActive:{backgroundColor:'#ffe5ef'},pinkText:{color:pink,fontSize:13,fontWeight:'700'},centerState:{alignItems:'center',justifyContent:'center',padding:24,minHeight:220},stateTitle:{fontSize:17,fontWeight:'800',textAlign:'center',marginTop:12},stateBody:{fontSize:14,lineHeight:21,marginTop:6},secondaryButton:{marginTop:16,borderWidth:1,borderColor:pink,paddingVertical:10,paddingHorizontal:18,borderRadius:20},secondaryButtonText:{color:pink,fontWeight:'800'},tabs:{flexDirection:'row',gap:8,padding:12},tab:{flex:1,borderRadius:20,alignItems:'center',paddingVertical:10,backgroundColor:'#eef0f4'},tabActive:{backgroundColor:pink},tabText:{fontSize:12,fontWeight:'700'},discoverContent:{padding:14,paddingBottom:26},discoverImage:{height:390,width:'100%',borderRadius:18,backgroundColor:'#dfe4eb'},profileCard:{borderRadius:15,padding:14,marginTop:10},profileTitle:{fontSize:23,fontWeight:'900'},chips:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:10},chip:{backgroundColor:'#ffe5ef',borderRadius:15,paddingHorizontal:11,paddingVertical:6},chipText:{color:pink,fontSize:12,fontWeight:'700'},discoverActions:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:20,marginTop:20},circleButton:{width:58,height:58,borderRadius:30,alignItems:'center',justifyContent:'center'},likeCircle:{width:70,height:70,backgroundColor:pink},listContent:{padding:14,gap:10},personRow:{flexDirection:'row',alignItems:'center',gap:12,borderRadius:15,padding:11},sectionTitle:{fontSize:18,fontWeight:'800',marginTop:20,marginBottom:7},profileContent:{alignItems:'center',padding:18},profileAvatar:{width:120,height:120,borderRadius:60,borderWidth:3,borderColor:pink,marginTop:14},stats:{width:'100%',flexDirection:'row',justifyContent:'space-around',padding:15,borderRadius:14,marginTop:18},stat:{alignItems:'center'},settingsLink:{width:'100%',flexDirection:'row',alignItems:'center',gap:12,borderTopWidth:1,paddingVertical:15,marginTop:22},settingsContent:{padding:18},accountInfo:{width:'100%',borderRadius:14,padding:15,marginBottom:10},infoLabel:{fontSize:12,fontWeight:'700',marginBottom:4},passwordSheet:{borderTopLeftRadius:20,borderTopRightRadius:20,padding:16},editContent:{padding:16},input:{minHeight:45,borderRadius:10,paddingHorizontal:12,marginTop:6,marginBottom:12,fontSize:15},bioInput:{minHeight:110,textAlignVertical:'top',paddingTop:10},primaryButton:{backgroundColor:pink,borderRadius:22,alignItems:'center',padding:13,marginTop:16},primaryButtonText:{color:'#fff',fontWeight:'800'},smallAction:{width:38,height:38,borderRadius:20,alignItems:'center',justifyContent:'center'},modalScrim:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.45)'},commentSheet:{borderTopLeftRadius:20,borderTopRightRadius:20,padding:16,minHeight:340},sheetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},commentRow:{paddingVertical:10,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#d8dce2'},commentComposer:{flexDirection:'row',alignItems:'center',gap:8,marginTop:12},commentInput:{flex:1,minHeight:42,borderRadius:22,paddingHorizontal:14},sendButton:{width:42,height:42,borderRadius:22,backgroundColor:pink,alignItems:'center',justifyContent:'center'},
});

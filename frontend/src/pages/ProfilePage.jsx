import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate }      from 'react-router-dom';
import useAuthStore                    from '../store/authStore';
import { getProfile, updateProfile }   from '../api/auth';

export default function ProfilePage() {
  const { username }              = useParams();
  const navigate                  = useNavigate();
  const { user: me, fetchMe }     = useAuthStore();
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [bio, setBio]             = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const fileRef                   = useRef();

  const isOwner = me?.username === username;

  useEffect(() => { loadProfile(); }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data } = await getProfile(username);
      setProfile(data);
      setBio(data.bio || '');
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile({ bio, avatar_url: avatarFile });
      await fetchMe();
      await loadProfile();
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setError('Error al guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setBio(profile?.bio || '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setError('');
  };

  if (loading) return <div style={s.loading}>Cargando perfil...</div>;
  if (!profile) return null;

  const avatarSrc = avatarPreview || profile.avatar_url;
  const initials  = profile.username.slice(0, 2).toUpperCase();

  return (
    <div style={s.page}>
      <div style={s.gridBg} />

      <div style={s.container}>

        {/* Breadcrumb */}
        <div style={s.breadcrumb}>
          <span style={s.breadcrumbLink} onClick={() => navigate('/')}>Dashboard</span>
          <span style={s.breadcrumbSep}>/</span>
          <span style={s.breadcrumbCurrent}>@{profile.username}</span>
        </div>

        {/* Card principal */}
        <div style={s.card}>

          {/* Banner superior */}
          <div style={s.banner}>
            <div style={s.bannerGlow} />
            <div style={s.bannerTag}>// Perfil de usuario</div>
          </div>

          {/* Avatar + info */}
          <div style={s.profileBody}>
            <div style={s.avatarSection}>

              {/* Avatar */}
              <div style={s.avatarWrap}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profile.username} style={s.avatarImg} />
                ) : (
                  <div style={s.avatarFallback}>{initials}</div>
                )}

                {/* Botón cambiar foto — solo si es el dueño y está editando */}
                {isOwner && editing && (
                  <>
                    <div
                      style={s.avatarOverlay}
                      onClick={() => fileRef.current.click()}
                    >
                      <span style={s.avatarOverlayIcon}>↑</span>
                      <span style={s.avatarOverlayText}>Cambiar</span>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>

              {/* Username + email */}
              <div>
                <h1 style={s.username}>@{profile.username}</h1>
                {isOwner && <p style={s.email}>{profile.email}</p>}
                <div style={s.badge}>
                  {isOwner ? '// Tu perfil' : '// Miembro'}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={s.divider} />

            {/* Bio */}
            <div style={s.bioSection}>
              <div style={s.sectionTag}>// Biografía</div>
              {editing ? (
                <textarea
                  style={s.bioInput}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Contá algo sobre vos..."
                  maxLength={300}
                  rows={4}
                  autoFocus
                />
              ) : (
                <p style={s.bioText}>
                  {profile.bio || (isOwner
                    ? 'Todavía no agregaste una biografía.'
                    : 'Este usuario no tiene biografía.'
                  )}
                </p>
              )}
              {editing && (
                <p style={s.charCount}>{bio.length}/300</p>
              )}
            </div>

            {/* Error */}
            {error && <p style={s.error}>{error}</p>}

            {/* Acciones — solo si es el dueño */}
            {isOwner && (
              <div style={s.actions}>
                {editing ? (
                  <>
                    <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button style={s.btnGhost} onClick={handleCancel}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button style={s.btnGhost} onClick={() => setEditing(true)}>
                    Editar perfil
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:              { minHeight: '100vh', background: '#080c10', paddingTop: '62px', fontFamily: "'DM Mono', monospace" },
  gridBg:            { position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(#1e2730 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4, pointerEvents: 'none' },
  loading:           { color: '#5a6a7a', fontSize: '0.82rem', textAlign: 'center', padding: '5rem', fontFamily: "'DM Mono', monospace" },
  container:         { maxWidth: '680px', margin: '0 auto', padding: '2.5rem 2rem' },
  breadcrumb:        { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.75rem' },
  breadcrumbLink:    { color: '#4fffb0', cursor: 'pointer', letterSpacing: '0.04em' },
  breadcrumbSep:     { color: '#1e2730' },
  breadcrumbCurrent: { color: '#5a6a7a' },
  card:              { background: '#0d1117', border: '1px solid #1e2730', borderRadius: '8px', overflow: 'hidden' },
  banner:            { height: '100px', background: 'linear-gradient(135deg, rgba(79,255,176,0.08), rgba(0,200,255,0.08))', borderBottom: '1px solid #1e2730', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '1rem 1.5rem' },
  bannerGlow:        { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(79,255,176,0.06), transparent 70%)', pointerEvents: 'none' },
  bannerTag:         { fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4fffb0', position: 'relative' },
  profileBody:       { padding: '1.5rem' },
  avatarSection:     { display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', marginTop: '-3rem' },
  avatarWrap:        { position: 'relative', flexShrink: 0 },
  avatarImg:         { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #080c10', display: 'block' },
  avatarFallback:    { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #4fffb0, #00c8ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#080c10', border: '3px solid #080c10' },
  avatarOverlay:     { position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(8,12,16,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '2px' },
  avatarOverlayIcon: { fontSize: '1rem', color: '#4fffb0' },
  avatarOverlayText: { fontSize: '0.6rem', color: '#4fffb0', letterSpacing: '0.08em', textTransform: 'uppercase' },
  username:          { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#e8edf2', letterSpacing: '-0.02em', margin: '0 0 0.2rem' },
  email:             { fontSize: '0.75rem', color: '#5a6a7a', margin: '0 0 0.5rem', letterSpacing: '0.02em' },
  badge:             { display: 'inline-block', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4fffb0', background: 'rgba(79,255,176,0.08)', border: '1px solid rgba(79,255,176,0.2)', padding: '0.2rem 0.6rem', borderRadius: '2px' },
  divider:           { height: '1px', background: '#1e2730', margin: '1.2rem 0' },
  bioSection:        { marginBottom: '1.5rem' },
  sectionTag:        { fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4fffb0', marginBottom: '0.8rem' },
  bioText:           { fontSize: '0.82rem', color: '#5a6a7a', lineHeight: 1.8, margin: 0 },
  bioInput:          { width: '100%', background: '#080c10', border: '1px solid #1e2730', borderRadius: '4px', color: '#e8edf2', padding: '0.8rem', fontSize: '0.82rem', fontFamily: "'DM Mono', monospace", outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.8 },
  charCount:         { fontSize: '0.68rem', color: '#5a6a7a', textAlign: 'right', marginTop: '0.4rem' },
  actions:           { display: 'flex', gap: '0.8rem' },
  btnPrimary:        { background: '#4fffb0', color: '#080c10', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '3px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' },
  btnGhost:          { background: 'transparent', border: '1px solid rgba(79,255,176,0.3)', color: '#4fffb0', padding: '0.55rem 1.2rem', borderRadius: '3px', fontSize: '0.78rem', cursor: 'pointer', letterSpacing: '0.04em' },
  error:             { fontSize: '0.78rem', color: '#ff8080', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '4px', padding: '0.6rem 0.8rem', marginBottom: '1rem' },
};
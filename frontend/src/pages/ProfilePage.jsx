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
    <div className='profile-page'>
      <div style={s.gridBg} />

      <div className='profile-container' style={s.container}>

        {/* Breadcrumb */}
        <div className='profile-breadcrumb'>
          <span className='profile-breadcrumb-link' onClick={() => navigate('/')}>Dashboard</span>
          <span style={s.breadcrumbSep}>/</span>
          <span style={s.breadcrumbCurrent}>@{profile.username}</span>
        </div>

        {/* Card principal */}
        <div className='profile-card'>

          {/* Banner superior */}
          <div className='profile-banner'>
            <div className='profile-banner-glow'/>
            <div style={s.bannerTag}>// Perfil de usuario</div>
          </div>

          {/* Avatar + info */}
          <div className='profile-body'>
            <div className='profile-avatar-section'>

              {/* Avatar */}
              <div className='profile-avatar-wrap'>
                {avatarSrc ? (
                  <img className='profile-avatar-img' src={avatarSrc} alt={profile.username}/>
                ) : (
                  <div className='profile-avatar-fallback' style={s.avatarFallback}>{initials}</div>
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
                <h1 className='profile-username'>@{profile.username}</h1>
                {isOwner && <p className='profile-email'>{profile.email}</p>}
                <div className='profile-badge'>
                  {isOwner ? '// Tu perfil' : '// Miembro'}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className='profile-divider' />

            {/* Bio */}
            <div className='profile-bio-section'>
              <div style={s.sectionTag}>// Biografía</div>
              {editing ? (
                <textarea
                  className='profile-bio-input'
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Contá algo sobre vos..."
                  maxLength={300}
                  rows={4}
                  autoFocus
                />
              ) : (
                <p className='profile-bio-text'>
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
              <div className='profile-actions'>
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
  gridBg:            { position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(#1e2730 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4, pointerEvents: 'none' },
  loading:           { color: '#5a6a7a', fontSize: '0.82rem', textAlign: 'center', padding: '5rem', fontFamily: "'DM Mono', monospace" },
  breadcrumbSep:     { color: '#1e2730' },
  breadcrumbCurrent: { color: '#5a6a7a' },
  bannerTag:         { fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4fffb0', position: 'relative' },
  avatarOverlayIcon: { fontSize: '1rem', color: '#4fffb0' },
  avatarOverlayText: { fontSize: '0.6rem', color: '#4fffb0', letterSpacing: '0.08em', textTransform: 'uppercase' },
  sectionTag:        { fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4fffb0', marginBottom: '0.8rem' },
  charCount:         { fontSize: '0.68rem', color: '#5a6a7a', textAlign: 'right', marginTop: '0.4rem' },
  actions:           { display: 'flex', gap: '0.8rem' },
  btnPrimary:        { background: '#4fffb0', color: '#080c10', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '3px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' },
  btnGhost:          { background: 'transparent', border: '1px solid rgba(79,255,176,0.3)', color: '#4fffb0', padding: '0.55rem 1.2rem', borderRadius: '3px', fontSize: '0.78rem', cursor: 'pointer', letterSpacing: '0.04em' },
  error:             { fontSize: '0.78rem', color: '#ff8080', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '4px', padding: '0.6rem 0.8rem', marginBottom: '1rem' },
};
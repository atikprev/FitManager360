import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  MonitorWeight,
  Height,
  FitnessCenter,
  Cancel,
  AccountCircle,
  Email,
  CalendarToday,
  Wc,
  TrendingUp,
  PhotoCamera,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    profile: {
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      fitnessLevel: '',
      goals: []
    }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        profile: {
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          age: user.profile?.age || '',
          gender: user.profile?.gender || '',
          height: user.profile?.height || '',
          weight: user.profile?.weight || '',
          fitnessLevel: user.profile?.fitnessLevel || '',
          goals: user.profile?.goals || []
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        [name]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const profileData = {
        profile: {
          ...formData.profile,
          age: formData.profile.age ? parseInt(formData.profile.age) : undefined,
          height: formData.profile.height ? parseInt(formData.profile.height) : undefined,
          weight: formData.profile.weight ? parseFloat(formData.profile.weight) : undefined
        }
      };

      const result = await updateProfile(profileData);
      
      if (result.success) {
        setMessage('Perfil actualizado exitosamente');
        setEditing(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error al actualizar el perfil');
    }
  };

  const calculateBMI = () => {
    if (formData.profile.height && formData.profile.weight) {
      const height = parseFloat(formData.profile.height) / 100;
      const weight = parseFloat(formData.profile.weight);
      const bmi = weight / (height * height);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: 'info', progress: 25 };
    if (bmi < 25) return { category: 'Normal', color: 'success', progress: 75 };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'warning', progress: 60 };
    return { category: 'Obesidad', color: 'error', progress: 40 };
  };

  const getFitnessLevelInfo = (level) => {
    switch (level) {
      case 'beginner':
        return { label: 'Principiante', color: 'info', icon: '🌱' };
      case 'intermediate':
        return { label: 'Intermedio', color: 'warning', icon: '💪' };
      case 'advanced':
        return { label: 'Avanzado', color: 'success', icon: '🏆' };
      default:
        return { label: 'No definido', color: 'default', icon: '❓' };
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, progress }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: `${color}.main`,
              mr: 2,
            }}
          >
            {React.cloneElement(icon, { sx: { color: 'white', fontSize: 24 } })}
          </Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
        </Box>
        <Typography 
          variant="h3" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            color: `${color}.main`,
            mb: 1
          }}
        >
          {value || 'N/A'}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        {progress && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: `${color}.main`,
                borderRadius: 3,
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Header Profile Card */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, backgroundColor: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{ 
                      width: { xs: 80, md: 100 }, 
                      height: { xs: 80, md: 100 },
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      fontWeight: 700,
                      backgroundColor: 'primary.main',
                    }}
                    src={user?.profile?.avatar}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700,
                      color: 'primary.main',
                      mb: 1,
                    }}
                  >
                    {user?.username}
                  </Typography>
                  
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body1" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body1" color="text.secondary">
                        Miembro desde {new Date(user?.createdAt || Date.now()).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.profile.fitnessLevel && (
                      <Chip
                        icon={<TrendingUp />}
                        label={`${getFitnessLevelInfo(formData.profile.fitnessLevel).icon} ${getFitnessLevelInfo(formData.profile.fitnessLevel).label}`}
                        color={getFitnessLevelInfo(formData.profile.fitnessLevel).color}
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    <Chip
                      label="Activo"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Messages */}
          {message && (
            <Grid item xs={12}>
              <Alert severity="success" onClose={() => setMessage('')}>
                {message}
              </Alert>
            </Grid>
          )}

          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </Grid>
          )}

          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Peso"
              value={formData.profile.weight ? `${formData.profile.weight} kg` : null}
              icon={<MonitorWeight />}
              color="primary"
              subtitle="Peso actual"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Altura"
              value={formData.profile.height ? `${formData.profile.height} cm` : null}
              icon={<Height />}
              color="secondary"
              subtitle="Estatura"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="IMC"
              value={calculateBMI()}
              icon={<FitnessCenter />}
              color="success"
              subtitle={calculateBMI() ? getBMICategory(calculateBMI()).category : null}
              progress={calculateBMI() ? getBMICategory(calculateBMI()).progress : null}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Edad"
              value={formData.profile.age ? `${formData.profile.age} años` : null}
              icon={<Person />}
              color="info"
              subtitle="Años cumplidos"
            />
          </Grid>

          {/* BMI Info Card */}
          {calculateBMI() && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, backgroundColor: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FitnessCenter sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Análisis del Índice de Masa Corporal
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Typography variant="h6" color="text.primary">
                    Tu IMC es <strong style={{ fontSize: '1.3em', color: '#1976d2' }}>{calculateBMI()}</strong>
                  </Typography>
                  <Chip
                    label={getBMICategory(calculateBMI()).category}
                    color={getBMICategory(calculateBMI()).color}
                    variant="filled"
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: '0.9rem',
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Profile Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 4, backgroundColor: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountCircle sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Información Personal
                  </Typography>
                </Box>
                
                {!editing ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    sx={{ px: 3, py: 1 }}
                  >
                    Editar Perfil
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => setEditing(false)}
                      color="error"
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSubmit}
                      color="success"
                    >
                      Guardar Cambios
                    </Button>
                  </Stack>
                )}
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="firstName"
                      value={formData.profile.firstName}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellido"
                      name="lastName"
                      value={formData.profile.lastName}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Edad"
                      name="age"
                      type="number"
                      value={formData.profile.age}
                      onChange={handleChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: editing ? (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Género</InputLabel>
                      <Select
                        name="gender"
                        value={formData.profile.gender}
                        onChange={handleChange}
                        disabled={!editing}
                        startAdornment={editing ? (
                          <InputAdornment position="start">
                            <Wc color="action" />
                          </InputAdornment>
                        ) : null}
                      >
                        <MenuItem value="male">Masculino</MenuItem>
                        <MenuItem value="female">Femenino</MenuItem>
                        <MenuItem value="other">Otro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Altura (cm)"
                      name="height"
                      type="number"
                      value={formData.profile.height}
                      onChange={handleChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: editing ? (
                          <InputAdornment position="start">
                            <Height color="action" />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Peso (kg)"
                      name="weight"
                      type="number"
                      value={formData.profile.weight}
                      onChange={handleChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: editing ? (
                          <InputAdornment position="start">
                            <MonitorWeight color="action" />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Nivel de Fitness</InputLabel>
                      <Select
                        name="fitnessLevel"
                        value={formData.profile.fitnessLevel}
                        onChange={handleChange}
                        disabled={!editing}
                        startAdornment={editing ? (
                          <InputAdornment position="start">
                            <TrendingUp color="action" />
                          </InputAdornment>
                        ) : null}
                      >
                        <MenuItem value="beginner">🌱 Principiante</MenuItem>
                        <MenuItem value="intermediate">💪 Intermedio</MenuItem>
                        <MenuItem value="advanced">🏆 Avanzado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Profile;
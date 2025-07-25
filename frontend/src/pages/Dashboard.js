import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Fab,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  FitnessCenter,
  AccessTime,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'strength',
    difficulty: 'beginner',
    estimatedDuration: 30,
    isPublic: false,
    exercises: [],
  });
  const [openExercisesDialog, setOpenExercisesDialog] = useState(false);
  const [exercisesToShow, setExercisesToShow] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [openNewExerciseDialog, setOpenNewExerciseDialog] = useState(false);
  const [newExerciseData, setNewExerciseData] = useState({
    name: '',
    description: '',
    muscleGroups: [],
    equipment: [],
    difficulty: 'beginner',
    instructions: [],
    tips: [],
  });

  useEffect(() => {
    if (user) {
      fetchRoutines();
      fetchExercises();
    }
  }, [user]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/routines');
      setRoutines(response.data.routines || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
      setError('Error al cargar las rutinas');
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoadingExercises(true);
      const res = await axios.get('/api/exercises');
      setAvailableExercises(res.data.exercises || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleOpenDialog = (routine = null) => {
    if (routine) {
      setSelectedRoutine(routine);
      setFormData({
        name: routine.name,
        description: routine.description || '',
        category: routine.category,
        difficulty: routine.difficulty,
        estimatedDuration: routine.estimatedDuration,
        isPublic: routine.isPublic,
        exercises: (routine.exercises || []).map((ex, idx) => ({
          exercise:
            typeof ex.exercise === 'object' ? ex.exercise._id : ex.exercise,
          sets: (ex.sets || []).map((set) => ({
            reps: set.reps ?? '',
            weight: set.weight ?? '',
            duration: set.duration ?? '',
            rest: set.rest ?? '',
          })),
          order: ex.order !== undefined ? ex.order : idx,
        })),
      });
    } else {
      setSelectedRoutine(null);
      setFormData({
        name: '',
        description: '',
        category: 'strength',
        difficulty: 'beginner',
        estimatedDuration: 30,
        isPublic: false,
        exercises: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRoutine(null);
  };

  const handleSubmit = async () => {
    const normalizedExercises = formData.exercises
      .map((ex, idx) => {
        const sets = (ex.sets || [])
          .map((set) => ({
            reps:
              set.reps !== '' && set.reps !== undefined
                ? Number(set.reps)
                : undefined,
            weight:
              set.weight !== '' && set.weight !== undefined
                ? Number(set.weight)
                : undefined,
            duration:
              set.duration !== '' && set.duration !== undefined
                ? Number(set.duration)
                : undefined,
            rest:
              set.rest !== '' && set.rest !== undefined
                ? Number(set.rest)
                : undefined,
          }))
          .filter(
            (set) =>
              set.reps !== undefined &&
              set.weight !== undefined &&
              set.duration !== undefined &&
              set.rest !== undefined
          );
        if (sets.length === 0) return null;
        return {
          exercise: typeof ex === 'string' ? ex : ex.exercise,
          sets,
          order: ex.order !== undefined ? ex.order : idx,
        };
      })
      .filter(Boolean);
    const dataToSend = { ...formData, exercises: normalizedExercises };
    try {
      if (selectedRoutine) {
        await axios.put(`/api/routines/${selectedRoutine._id}`, dataToSend);
      } else {
        await axios.post('/api/routines', dataToSend);
      }
      fetchRoutines();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving routine:', error);
      setError('Error al guardar la rutina');
    }
  };

  const handleDelete = async (routineId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      try {
        await axios.delete(`/api/routines/${routineId}`);
        fetchRoutines();
      } catch (error) {
        console.error('Error deleting routine:', error);
        setError('Error al eliminar la rutina');
      }
    }
  };

  const createExercise = async (exerciseData) => {
    try {
      const res = await axios.post('/api/exercises', exerciseData);
      return res.data;
    } catch (error) {
      console.error('Error creando ejercicio:', error);
      throw error;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      strength: 'primary',
      cardio: 'secondary',
      flexibility: 'success',
      sports: 'warning',
      rehabilitation: 'info',
      weight_loss: 'error',
      muscle_gain: 'primary',
    };
    return colors[category] || 'default';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'error',
    };
    return colors[difficulty] || 'default';
  };

  const RoutineCard = ({ routine }) => (
    <Card
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography
            variant='h5'
            component='div'
            sx={{ fontWeight: 600, color: 'text.primary' }}
          >
            {routine.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label={routine.category}
              color={getCategoryColor(routine.category)}
              size='small'
            />
            <Chip
              label={routine.difficulty}
              color={getDifficultyColor(routine.difficulty)}
              size='small'
            />
          </Stack>
        </Box>
        
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          {routine.description || 'Sin descripción'}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
            <Typography variant='body2' color='text.secondary'>
              {routine.estimatedDuration} minutos
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FitnessCenter sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
            <Typography variant='body2' color='text.secondary'>
              {routine.exercises?.length || 0} ejercicios
            </Typography>
          </Box>
        </Stack>
        
        {routine.isPublic && (
          <Chip
            label='Público'
            color='info'
            size='small'
            sx={{ mt: 2 }}
          />
        )}
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          size='small'
          startIcon={<Visibility />}
          variant='outlined'
          onClick={() => {
            setExercisesToShow(routine.exercises || []);
            setOpenExercisesDialog(true);
          }}
        >
          Ver Ejercicios
        </Button>
        
        <Box>
          <IconButton
            size='small'
            onClick={() => handleOpenDialog(routine)}
            color='primary'
            sx={{ mr: 1 }}
          >
            <Edit />
          </IconButton>
          <IconButton
            size='small'
            onClick={() => handleDelete(routine._id)}
            color='error'
          >
            <Delete />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
  
  const ExercisesDialog = () => (
    <Dialog
      open={openExercisesDialog}
      onClose={() => setOpenExercisesDialog(false)}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Ejercicios de la rutina</DialogTitle>
      <DialogContent>
        {exercisesToShow && exercisesToShow.length > 0 ? (
          <Box>
            {exercisesToShow.map((ex, idx) => {
              const exObj =
                ex.exercise && typeof ex.exercise === 'object'
                  ? ex.exercise
                  : availableExercises.find(
                      (e) => e._id === (ex.exercise?._id || ex.exercise)
                    );
              return (
                <Box
                  key={idx}
                  sx={{
                    mb: 2,
                    p: 1,
                    border: '1px solid #eee',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant='subtitle1'>
                    <b>{exObj ? exObj.name : `Ejercicio ${idx + 1}`}</b>
                  </Typography>
                  {exObj && exObj.description && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      {exObj.description}
                    </Typography>
                  )}
                  {ex.sets && ex.sets.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant='body2'>
                        <b>Sets:</b>
                      </Typography>
                      {ex.sets.map((set, sidx) => (
                        <Typography
                          key={sidx}
                          variant='body2'
                          sx={{ ml: 2 }}
                        >
                          {`Set ${sidx + 1}: ${set.reps || 0} reps, ${
                            set.weight || 0
                          } kg, ${set.duration || 0} seg, descanso ${
                            set.rest || 0
                          } seg`}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography>No hay ejercicios en esta rutina.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenExercisesDialog(false)}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );

  const handleCreateNewExercise = async () => {
    try {
      const created = await createExercise(newExerciseData);
      await fetchExercises();
      setFormData((prev) => ({
        ...prev,
        exercises: [
          ...prev.exercises,
          {
            exercise: created._id,
            sets: [
              {
                reps: '',
                weight: '',
                duration: '',
                rest: '',
              },
            ],
          },
        ],
      }));
      setOpenNewExerciseDialog(false);
      setNewExerciseData({
        name: '',
        description: '',
        muscleGroups: [],
        equipment: [],
        difficulty: 'beginner',
        instructions: [],
        tips: [],
      });
    } catch (error) {
      setError('Error creando ejercicio');
    }
  };

  if (loading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Cargando rutinas...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header Section */}
        <Paper sx={{ p: 4, mb: 4, backgroundColor: 'white' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant='h3'
                sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                Dashboard
              </Typography>
              <Typography variant='h6' color='text.secondary'>
                Gestiona tus rutinas de entrenamiento
              </Typography>
            </Box>
            <Button
              variant='contained'
              size='large'
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ px: 4, py: 1.5 }}
            >
              Nueva Rutina
            </Button>
          </Box>
        </Paper>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Routines Section */}
        <Paper sx={{ p: 4, backgroundColor: 'white' }}>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
            Mis Rutinas ({routines.length})
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {routines.length > 0 ? (
            <Grid container spacing={3}>
              {routines.map((routine) => (
                <Grid item xs={12} sm={6} md={4} key={routine._id}>
                  <RoutineCard routine={routine} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FitnessCenter
                sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }}
              />
              <Typography variant='h5' gutterBottom sx={{ fontWeight: 600 }}>
                No tienes rutinas creadas
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
              >
                Crea tu primera rutina personalizada para comenzar tu entrenamiento
              </Typography>
              <Button
                variant='contained'
                size='large'
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ px: 4, py: 1.5 }}
              >
                Crear Primera Rutina
              </Button>
            </Box>
          )}
        </Paper>

        {/* Floating Action Button */}
        <Fab
          color='primary'
          aria-label='add'
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => handleOpenDialog()}
        >
          <Add />
        </Fab>

        {/* Create/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {selectedRoutine ? 'Editar Rutina' : 'Nueva Rutina'}
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Nombre de la rutina'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Descripción'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <MenuItem value='strength'>Fuerza</MenuItem>
                    <MenuItem value='cardio'>Cardio</MenuItem>
                    <MenuItem value='flexibility'>Flexibilidad</MenuItem>
                    <MenuItem value='sports'>Deportes</MenuItem>
                    <MenuItem value='rehabilitation'>Rehabilitación</MenuItem>
                    <MenuItem value='weight_loss'>Pérdida de peso</MenuItem>
                    <MenuItem value='muscle_gain'>Ganancia muscular</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Dificultad</InputLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                  >
                    <MenuItem value='beginner'>Principiante</MenuItem>
                    <MenuItem value='intermediate'>Intermedio</MenuItem>
                    <MenuItem value='advanced'>Avanzado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Duración estimada (min)'
                  type='number'
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedDuration: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='exercises-label'>Ejercicios</InputLabel>
                  <Select
                    labelId='exercises-label'
                    multiple
                    value={formData.exercises.map((ex) =>
                      typeof ex === 'string' ? ex : ex.exercise
                    )}
                    onChange={async (e) => {
                      const selected = e.target.value;
                      if (selected.includes('nuevo')) {
                        setOpenNewExerciseDialog(true);
                        setFormData((prev) => ({
                          ...prev,
                          exercises: prev.exercises.filter(
                            (ex) => ex !== 'nuevo'
                          ),
                        }));
                        return;
                      }
                      setFormData((prev) => ({
                        ...prev,
                        exercises: selected.map((exId, idx) => {
                          const found = prev.exercises.find((ex) =>
                            typeof ex === 'string'
                              ? ex === exId
                              : ex.exercise === exId
                          );
                          return found
                            ? found
                            : {
                                exercise: exId,
                                sets: [
                                  {
                                    reps: '',
                                    weight: '',
                                    duration: '',
                                    rest: '',
                                  },
                                ],
                              };
                        }),
                      }));
                    }}
                    renderValue={(selected) =>
                      availableExercises
                        .filter((ex) => selected.includes(ex._id))
                        .map((ex) => ex.name)
                        .concat(
                          selected.includes('nuevo') ? ['(Nuevo ejercicio)'] : []
                        )
                        .join(', ')
                    }
                    disabled={loadingExercises}
                  >
                    {loadingExercises ? (
                      <MenuItem disabled>Cargando ejercicios...</MenuItem>
                    ) : (
                      [
                        ...availableExercises.map((ex) => (
                          <MenuItem key={ex._id} value={ex._id}>
                            {ex.name}
                          </MenuItem>
                        )),
                        <MenuItem key='nuevo' value='nuevo'>
                          <Button
                            variant='outlined'
                            color='primary'
                            fullWidth
                          >
                            + Crear nuevo ejercicio
                          </Button>
                        </MenuItem>,
                      ]
                    )}
                  </Select>
                </FormControl>
              </Grid>
              {formData.exercises.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant='h6' sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                    Configuración de Sets
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {formData.exercises.map((ex, idx) => {
                    const exId = typeof ex === 'string' ? ex : ex.exercise;
                    const exObj = availableExercises.find((e) => e._id === exId);
                    const sets =
                      (typeof ex === 'string'
                        ? [{ reps: '', weight: '', duration: '', rest: '' }]
                        : ex.sets) || [];
                    return (
                      <Paper
                        key={exId}
                        sx={{
                          mb: 3,
                          p: 3,
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                        >
                          <Typography
                            variant='subtitle1'
                            sx={{ flexGrow: 1, fontWeight: 600 }}
                          >
                            {exObj ? exObj.name : 'Ejercicio'}
                          </Typography>
                          <Button
                            size='small'
                            color='error'
                            variant='outlined'
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                exercises: prev.exercises.filter(
                                  (_, i) => i !== idx
                                ),
                              }));
                            }}
                          >
                            Eliminar ejercicio
                          </Button>
                        </Box>
                        <Stack spacing={2}>
                          {sets.map((set, sidx) => (
                            <Box
                              key={sidx}
                              sx={{
                                display: 'flex',
                                gap: 2,
                                alignItems: 'center',
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2" sx={{ minWidth: 60 }}>
                                Set {sidx + 1}:
                              </Typography>
                              <TextField
                                label='Reps'
                                type='number'
                                size='small'
                                value={set.reps}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const newExercises = [...prev.exercises];
                                    if (typeof newExercises[idx] === 'string')
                                      newExercises[idx] = {
                                        exercise: exId,
                                        sets: [
                                          {
                                            reps: '',
                                            weight: '',
                                            duration: '',
                                            rest: '',
                                          },
                                        ],
                                      };
                                    newExercises[idx].sets[sidx].reps = val;
                                    return { ...prev, exercises: newExercises };
                                  });
                                }}
                                sx={{ width: 80 }}
                              />
                              <TextField
                                label='Peso (kg)'
                                type='number'
                                size='small'
                                value={set.weight}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const newExercises = [...prev.exercises];
                                    if (typeof newExercises[idx] === 'string')
                                      newExercises[idx] = {
                                        exercise: exId,
                                        sets: [
                                          {
                                            reps: '',
                                            weight: '',
                                            duration: '',
                                            rest: '',
                                          },
                                        ],
                                      };
                                    newExercises[idx].sets[sidx].weight = val;
                                    return { ...prev, exercises: newExercises };
                                  });
                                }}
                                sx={{ width: 100 }}
                              />
                              <TextField
                                label='Duración (seg)'
                                type='number'
                                size='small'
                                value={set.duration}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const newExercises = [...prev.exercises];
                                    if (typeof newExercises[idx] === 'string')
                                      newExercises[idx] = {
                                        exercise: exId,
                                        sets: [
                                          {
                                            reps: '',
                                            weight: '',
                                            duration: '',
                                            rest: '',
                                          },
                                        ],
                                      };
                                    newExercises[idx].sets[sidx].duration = val;
                                    return { ...prev, exercises: newExercises };
                                  });
                                }}
                                sx={{ width: 120 }}
                              />
                              <TextField
                                label='Descanso (seg)'
                                type='number'
                                size='small'
                                value={set.rest}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => {
                                    const newExercises = [...prev.exercises];
                                    if (typeof newExercises[idx] === 'string')
                                      newExercises[idx] = {
                                        exercise: exId,
                                        sets: [
                                          {
                                            reps: '',
                                            weight: '',
                                            duration: '',
                                            rest: '',
                                          },
                                        ],
                                      };
                                    newExercises[idx].sets[sidx].rest = val;
                                    return { ...prev, exercises: newExercises };
                                  });
                                }}
                                sx={{ width: 120 }}
                              />
                              <Button
                                size='small'
                                color='error'
                                onClick={() => {
                                  setFormData((prev) => {
                                    const newExercises = [...prev.exercises];
                                    if (typeof newExercises[idx] === 'string')
                                      newExercises[idx] = {
                                        exercise: exId,
                                        sets: [
                                          {
                                            reps: '',
                                            weight: '',
                                            duration: '',
                                            rest: '',
                                          },
                                        ],
                                      };
                                    newExercises[idx].sets.splice(sidx, 1);
                                    if (newExercises[idx].sets.length === 0)
                                      newExercises[idx].sets.push({
                                        reps: '',
                                        weight: '',
                                        duration: '',
                                        rest: '',
                                      });
                                    return { ...prev, exercises: newExercises };
                                  });
                                }}
                              >
                                Eliminar
                              </Button>
                              <Button
                                size='small'
                                color='info'
                                onClick={() => {
                                  setFormData((prev) => {
                                    const newExercises = [...prev.exercises];
                                    if (typeof newExercises[idx] === 'string')
                                      newExercises[idx] = {
                                        exercise: exId,
                                        sets: [
                                          {
                                            reps: '',
                                            weight: '',
                                            duration: '',
                                            rest: '',
                                          },
                                        ],
                                      };
                                    const setToCopy = {
                                      ...newExercises[idx].sets[sidx],
                                    };
                                    newExercises[idx].sets.splice(
                                      sidx + 1,
                                      0,
                                      setToCopy
                                    );
                                    return { ...prev, exercises: newExercises };
                                  });
                                }}
                              >
                                Duplicar
                              </Button>
                            </Box>
                          ))}
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => {
                              setFormData((prev) => {
                                const newExercises = [...prev.exercises];
                                if (typeof newExercises[idx] === 'string')
                                  newExercises[idx] = {
                                    exercise: exId,
                                    sets: [
                                      {
                                        reps: '',
                                        weight: '',
                                        duration: '',
                                        rest: '',
                                      },
                                    ],
                                  };
                                newExercises[idx].sets.push({
                                  reps: '',
                                  weight: '',
                                  duration: '',
                                  rest: '',
                                });
                                return { ...prev, exercises: newExercises };
                              });
                            }}
                            sx={{ alignSelf: 'flex-start' }}
                          >
                            + Agregar set
                          </Button>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} size="large">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant='contained'
              size="large"
              sx={{ px: 4 }}
            >
              {selectedRoutine ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para ver ejercicios */}
        <ExercisesDialog />

        {/* Modal para crear nuevo ejercicio */}
        <Dialog
          open={openNewExerciseDialog}
          onClose={() => setOpenNewExerciseDialog(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Nuevo Ejercicio
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                label='Nombre'
                fullWidth
                value={newExerciseData.name}
                onChange={(e) =>
                  setNewExerciseData({ ...newExerciseData, name: e.target.value })
                }
                required
              />
              <TextField
                label='Descripción'
                fullWidth
                value={newExerciseData.description}
                onChange={(e) =>
                  setNewExerciseData({
                    ...newExerciseData,
                    description: e.target.value,
                  })
                }
                multiline
                rows={3}
              />
              <FormControl fullWidth>
                <InputLabel>Grupos musculares</InputLabel>
                <Select
                  multiple
                  value={newExerciseData.muscleGroups}
                  onChange={(e) =>
                    setNewExerciseData({
                      ...newExerciseData,
                      muscleGroups: e.target.value,
                    })
                  }
                >
                  <MenuItem value='chest'>Pecho</MenuItem>
                  <MenuItem value='back'>Espalda</MenuItem>
                  <MenuItem value='shoulders'>Hombros</MenuItem>
                  <MenuItem value='arms'>Brazos</MenuItem>
                  <MenuItem value='legs'>Piernas</MenuItem>
                  <MenuItem value='core'>Core</MenuItem>
                  <MenuItem value='cardio'>Cardio</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Equipo</InputLabel>
                <Select
                  multiple
                  value={newExerciseData.equipment}
                  onChange={(e) =>
                    setNewExerciseData({
                      ...newExerciseData,
                      equipment: e.target.value,
                    })
                  }
                >
                  <MenuItem value='bodyweight'>Peso corporal</MenuItem>
                  <MenuItem value='dumbbells'>Mancuernas</MenuItem>
                  <MenuItem value='barbell'>Barra</MenuItem>
                  <MenuItem value='machine'>Máquina</MenuItem>
                  <MenuItem value='cable'>Cable</MenuItem>
                  <MenuItem value='resistance_band'>Banda de resistencia</MenuItem>
                  <MenuItem value='kettlebell'>Kettlebell</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Dificultad</InputLabel>
                <Select
                  value={newExerciseData.difficulty}
                  onChange={(e) =>
                    setNewExerciseData({
                      ...newExerciseData,
                      difficulty: e.target.value,
                    })
                  }
                >
                  <MenuItem value='beginner'>Principiante</MenuItem>
                  <MenuItem value='intermediate'>Intermedio</MenuItem>
                  <MenuItem value='advanced'>Avanzado</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label='Instrucciones (separadas por coma)'
                fullWidth
                value={newExerciseData.instructions.join(', ')}
                onChange={(e) =>
                  setNewExerciseData({
                    ...newExerciseData,
                    instructions: e.target.value.split(',').map((i) => i.trim()),
                  })
                }
                multiline
                rows={2}
              />
              <TextField
                label='Tips (separados por coma)'
                fullWidth
                value={newExerciseData.tips.join(', ')}
                onChange={(e) =>
                  setNewExerciseData({
                    ...newExerciseData,
                    tips: e.target.value.split(',').map((i) => i.trim()),
                  })
                }
                multiline
                rows={2}
              />
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenNewExerciseDialog(false)} size="large">
              Cancelar
            </Button>
            <Button
              onClick={handleCreateNewExercise}
              variant='contained'
              size="large"
              sx={{ px: 4 }}
            >
              Crear
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;


// app/page.js
'use client'

import React, { useState, useEffect } from 'react';
import { Check, Calendar, Target, TrendingUp, Plus, Trash2, Edit } from 'lucide-react';

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState({});
  const [habitList, setHabitList] = useState([
    { id: 'reading', name: 'Read 5 pages', frequency: 'daily', icon: '📚', target: 7 },
    { id: 'music', name: 'Play music', frequency: 'twice-weekly', icon: '🎵', target: 2 },
    { id: 'gym', name: 'Gym exercises', frequency: 'daily', icon: '💪', target: 7 },
    { id: 'stretch', name: 'Stretching', frequency: 'alternate', icon: '🧘', target: null },
    { id: 'lad', name: 'lad exercises', frequency: 'alternate', icon: '🏃', target: null },
    { id: 'blink', name: 'Blink + smile exercise', frequency: 'daily', icon: '😊', target: 7 }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', frequency: 'daily', icon: '⭐', target: 7 });
  const [editingHabit, setEditingHabit] = useState(null);
  const [editData, setEditData] = useState({ name: '', frequency: 'daily', icon: '⭐', target: 7 });
  const [deletedHabit, setDeletedHabit] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHabits = localStorage.getItem('habitData');
      const savedHabitList = localStorage.getItem('habitList');
      
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
      
      if (savedHabitList) {
        setHabitList(JSON.parse(savedHabitList));
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitData', JSON.stringify(habits));
    }
  }, [habits]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitList', JSON.stringify(habitList));
    }
  }, [habitList]);

  const frequencyOptions = [
    { value: 'daily', label: 'Daily', description: 'Every day' },
    { value: 'twice-weekly', label: 'Twice Weekly', description: '2 times per week' },
    { value: 'alternate', label: 'Every Other Day', description: 'Alternating days' },
    { value: 'weekly', label: 'Weekly', description: 'Once per week' },
    { value: 'three-weekly', label: 'Three Times Weekly', description: '3 times per week' }
  ];

  const emojiOptions = ['⭐', '📚', '🎵', '💪', '🧘', '🏃', '😊', '🎯', '🔥', '✨', '🌟', '💎', '🚀', '🎨', '🍎', '💧', '🧠', '❤️', '🌱', '⚡'];

  const getDefaultTarget = (frequency) => {
    switch(frequency) {
      case 'daily': return 7;
      case 'twice-weekly': return 2;
      case 'three-weekly': return 3;
      case 'weekly': return 1;
      case 'alternate': return null;
      default: return 7;
    }
  };

  const addNewHabit = () => {
    if (!newHabit.name.trim()) return;
    
    const newId = newHabit.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();
    const target = newHabit.frequency === 'alternate' ? null : (newHabit.target || getDefaultTarget(newHabit.frequency));
    
    const habitToAdd = {
      id: newId,
      name: newHabit.name,
      frequency: newHabit.frequency,
      icon: newHabit.icon,
      target: target
    };
    
    setHabitList(prev => [...prev, habitToAdd]);
    setNewHabit({ name: '', frequency: 'daily', icon: '⭐', target: 7 });
    setShowAddForm(false);
  };

  const handleEditHabit = (habitId) => {
    const habit = habitList.find(h => h.id === habitId);
    if (habit) {
      setEditData({
        name: habit.name,
        frequency: habit.frequency,
        icon: habit.icon,
        target: habit.target || getDefaultTarget(habit.frequency)
      });
      setEditingHabit(habitId);
    }
  };

  const updateHabit = () => {
    if (!editData.name.trim()) return;
    
    setHabitList(prev => prev.map(habit => 
      habit.id === editingHabit 
        ? { 
            ...habit, 
            name: editData.name,
            frequency: editData.frequency,
            icon: editData.icon,
            target: editData.frequency === 'alternate' ? null : editData.target
          }
        : habit
    ));
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId) => {
    const habitToDelete = habitList.find(h => h.id === habitId);
    if (!habitToDelete) return;

    const habitData = {};
    Object.keys(habits).forEach(dateKey => {
      if (habits[dateKey] && habits[dateKey][habitId]) {
        habitData[dateKey] = habits[dateKey][habitId];
      }
    });

    setDeletedHabit({
      habit: habitToDelete,
      data: habitData
    });

    setHabitList(prev => prev.filter(habit => habit.id !== habitId));
    
    setHabits(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(dateKey => {
        if (updated[dateKey]) {
          delete updated[dateKey][habitId];
        }
      });
      return updated;
    });

    setTimeout(() => {
      setDeletedHabit(null);
    }, 10000);
  };

  const undoDelete = () => {
    if (!deletedHabit) return;
    
    setHabitList(prev => [...prev, deletedHabit.habit]);
    
    setHabits(prev => {
      const updated = { ...prev };
      Object.keys(deletedHabit.data).forEach(dateKey => {
        if (!updated[dateKey]) updated[dateKey] = {};
        updated[dateKey][deletedHabit.habit.id] = deletedHabit.data[dateKey];
      });
      return updated;
    });
    
    setDeletedHabit(null);
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const toggleHabit = (habitId, date) => {
    const dateKey = formatDate(date);
    setHabits(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [habitId]: !prev[dateKey]?.[habitId]
      }
    }));
  };

  const isHabitCompleted = (habitId, date) => {
    const dateKey = formatDate(date);
    return habits[dateKey]?.[habitId] || false;
  };

  const shouldShowHabit = (habit, date) => {
    if (habit.frequency === 'daily') return true;
    if (habit.frequency === 'twice-weekly' || habit.frequency === 'three-weekly') return true;
    if (habit.frequency === 'weekly') return date.getDay() === 1;
    if (habit.frequency === 'alternate') {
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const offset = habit.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2;
      return dayOfYear % 2 === offset;
    }
    return true;
  };

  const getWeeklyProgress = (habitId) => {
    let completed = 0;
    let total = 0;
    
    const habit = habitList.find(h => h.id === habitId);
    
    if (habit.frequency === 'alternate') {
      weekDates.forEach(date => {
        if (shouldShowHabit(habit, date)) {
          total++;
        }
      });
    } else {
      total = habit.target || getDefaultTarget(habit.frequency);
    }
    
    weekDates.forEach(date => {
      if (isHabitCompleted(habitId, date)) {
        completed++;
      }
    });
    
    return { completed, total };
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Target className="text-indigo-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Habit Tracker</h1>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Calendar size={16} />
            Today
          </button>
        </div>

        {/* Undo Delete Banner */}
        {deletedHabit && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-red-600">🗑️</span>
              <div>
                <p className="text-red-800 font-medium">
                  Deleted "{deletedHabit.habit.name}"
                </p>
                <p className="text-red-600 text-sm">
                  This will be permanently removed in 10 seconds
                </p>
              </div>
            </div>
            <button
              onClick={undoDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Undo
            </button>
          </div>
        )}

        {/* Add New Habit Button */}
        <div className="mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              Add New Habit
            </button>
          ) : (
            <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Habit</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Habit Name</label>
                  <input
                    type="text"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Drink water, Exercise, Meditate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={newHabit.frequency}
                    onChange={(e) => {
                      const freq = e.target.value;
                      setNewHabit(prev => ({ 
                        ...prev, 
                        frequency: freq,
                        target: getDefaultTarget(freq)
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                {newHabit.frequency !== 'alternate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Target</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={newHabit.target || ''}
                      onChange={(e) => setNewHabit(prev => ({ ...prev, target: parseInt(e.target.value) || getDefaultTarget(prev.frequency) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {emojiOptions.slice(0, 10).map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setNewHabit(prev => ({ ...prev, icon: emoji }))}
                        className={`w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors ${
                          newHabit.icon === emoji ? 'bg-green-100 ring-2 ring-green-500' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={addNewHabit}
                  disabled={!newHabit.name.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  Add Habit
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewHabit({ name: '', frequency: 'daily', icon: '⭐', target: 7 });
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateWeek(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            ← Previous Week
          </button>
          
          <div className="text-lg font-semibold text-gray-700">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
            {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          
          <button
            onClick={() => navigateWeek(1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Next Week →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700 w-64">Habit</th>
                {weekDates.map((date, index) => (
                  <th key={index} className="text-center p-3 font-semibold text-gray-700 w-20">
                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-sm ${isToday(date) ? 'text-indigo-600 font-bold' : ''}`}>
                        {dayNames[index]}
                      </span>
                      <span className={`text-lg ${isToday(date) ? 'text-indigo-600 font-bold bg-indigo-100 px-2 py-1 rounded-full' : ''}`}>
                        {date.getDate()}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="text-center p-3 font-semibold text-gray-700">
                  <TrendingUp size={16} />
                </th>
              </tr>
            </thead>
            
            <tbody>
              {habitList.map((habit) => (
                <tr key={habit.id} className="border-t border-gray-200 hover:bg-gray-50 group">
                  <td className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{habit.icon}</span>
                        <div>
                          <div className="font-medium text-gray-800">{habit.name}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {habit.frequency === 'twice-weekly' ? 'twice weekly' : 
                             habit.frequency === 'three-weekly' ? 'three times weekly' :
                             habit.frequency === 'alternate' ? 'every other day' :
                             habit.frequency === 'weekly' ? 'weekly' : 'daily'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditHabit(habit.id)}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all"
                          title="Edit habit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                          title="Delete habit"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                  
                  {weekDates.map((date, dateIndex) => (
                    <td key={dateIndex} className="text-center p-3 w-20">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() => toggleHabit(habit.id, date)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                            isHabitCompleted(habit.id, date)
                              ? 'bg-green-500 border-green-500 text-white hover:bg-green-600'
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {isHabitCompleted(habit.id, date) && <Check size={16} />}
                        </button>
                      </div>
                    </td>
                  ))}
                  
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-sm font-semibold ${
                        getWeeklyProgress(habit.id).completed >= getWeeklyProgress(habit.id).total 
                          ? 'text-green-600' 
                          : 'text-gray-700'
                      }`}>
                        {getWeeklyProgress(habit.id).completed}/{getWeeklyProgress(habit.id).total}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Habit Modal */}
        {editingHabit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Habit</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Habit Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={editData.frequency}
                    onChange={(e) => {
                      const freq = e.target.value;
                      setEditData(prev => ({ 
                        ...prev, 
                        frequency: freq,
                        target: freq === 'alternate' ? null : getDefaultTarget(freq)
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {editData.frequency !== 'alternate' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Target</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={editData.target || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, target: parseInt(e.target.value) || getDefaultTarget(prev.frequency) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {emojiOptions.slice(0, 15).map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setEditData(prev => ({ ...prev, icon: emoji }))}
                        className={`w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors ${
                          editData.icon === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={updateHabit}
                  disabled={!editData.name.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingHabit(null)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Summary */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">This Week's Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {habitList.map((habit) => {
              const progress = getWeeklyProgress(habit.id);
              const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
              
              return (
                <div key={habit.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{habit.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{habit.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{progress.completed}/{progress.total}</span>
                    <span className={`text-sm font-semibold ${percentage >= 100 ? 'text-green-600' : percentage >= 80 ? 'text-blue-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${percentage >= 100 ? 'bg-green-500' : percentage >= 80 ? 'bg-blue-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

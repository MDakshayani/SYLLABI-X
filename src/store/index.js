import { create } from 'zustand'
import { api } from '../lib/api'

const getUserId = () => {
  try {
    const userStr = localStorage.getItem('auth_user')
    if (!userStr) return 'guest'
    const user = JSON.parse(userStr)
    return user.id || user.email || 'guest'
  } catch {
    return 'guest'
  }
}

const getLocalData = (key, defaultVal) => {
  try {
    const userId = getUserId()
    const stored = localStorage.getItem(`${key}_${userId}`)
    return stored ? JSON.parse(stored) : defaultVal
  } catch {
    return defaultVal
  }
}

const setLocalData = (key, val) => {
  try {
    const userId = getUserId()
    if (val === null || val === undefined) {
      localStorage.removeItem(`${key}_${userId}`)
    } else {
      localStorage.setItem(`${key}_${userId}`, JSON.stringify(val))
    }
  } catch (err) {
    console.error("setLocalData error:", err)
  }
}

const useStore = create((set) => ({
  // Active role: 'faculty' or 'student'
  currentRole: localStorage.getItem('current_role') || 'faculty',
  
  // Faculty specific data
  facultyCurriculumData: getLocalData('faculty_curriculum', null),
  facultyHistoryData:    [],
  facultyQuizData:       getLocalData('faculty_quizzes', null),
  facultyResourcesData:  getLocalData('faculty_resources', null),

  // Student specific data
  studentCurriculumData: getLocalData('student_curriculum', null),
  studentHistoryData:    [],
  studentQuizData:       getLocalData('student_quizzes', null),
  studentScoresData:     getLocalData('student_scores', null),
  studentResourcesData:  getLocalData('student_resources', null),

  selectedSemester: null,
  selectedCourse:   null,

  // Set role
  setCurrentRole: (role) => {
    localStorage.setItem('current_role', role)
    set({ currentRole: role })
  },

  // Faculty state setters/actions
  setFacultyCurriculumData: (c) => set(() => {
    setLocalData('faculty_curriculum', c)
    return { facultyCurriculumData: c }
  }),
  setFacultyQuizData: (q) => set(() => {
    setLocalData('faculty_quizzes', q)
    return { facultyQuizData: q }
  }),
  setFacultyResourcesData: (r) => set(() => {
    setLocalData('faculty_resources', r)
    return { facultyResourcesData: r }
  }),
  loadFacultyHistoryData: async () => {
    try {
      const data = await api.getHistory('faculty')
      const formatted = data.map(item => ({
        ...item.curriculum_data,
        id: item.id,
        pdf_export_status: item.pdf_export_status,
        json_export_status: item.json_export_status,
        createdAt: item.date_generated
      }))
      set({ facultyHistoryData: formatted })
    } catch (err) {
      console.error("Failed to load faculty history", err)
    }
  },
  addFacultyHistoryData: async (c) => {
    try {
      const payload = {
        role: 'faculty',
        program_name: c.program_name,
        skill: c.skill,
        industry_focus: c.industry_focus,
        education_level: c.education_level,
        program_duration: c.program_duration,
        createdAt: c.createdAt || new Date().toISOString(),
        pdf_export_status: false,
        json_export_status: false,
        curriculum_data: c
      }
      const res = await api.addHistory(payload)
      const savedCurriculum = { 
        ...c, 
        id: res.id, 
        pdf_export_status: false, 
        json_export_status: false,
        createdAt: payload.createdAt
      }
      set((s) => ({
        facultyHistoryData: [savedCurriculum, ...s.facultyHistoryData]
      }))
      return savedCurriculum
    } catch (err) {
      console.error("Failed to add faculty history", err)
    }
  },
  deleteFacultyHistoryData: async (id) => {
    try {
      await api.deleteHistory(id)
      set((s) => ({
        facultyHistoryData: s.facultyHistoryData.filter(item => item.id !== id)
      }))
    } catch (err) {
      console.error("Failed to delete faculty history", err)
    }
  },

  // Student state setters/actions
  setStudentCurriculumData: (c) => set(() => {
    setLocalData('student_curriculum', c)
    return { studentCurriculumData: c }
  }),
  setStudentQuizData: (q) => set(() => {
    setLocalData('student_quizzes', q)
    return { studentQuizData: q }
  }),
  setStudentScoresData: (sc) => set(() => {
    setLocalData('student_scores', sc)
    return { studentScoresData: sc }
  }),
  setStudentResourcesData: (r) => set(() => {
    setLocalData('student_resources', r)
    return { studentResourcesData: r }
  }),
  loadStudentHistoryData: async () => {
    try {
      const data = await api.getHistory('student')
      const formatted = data.map(item => ({
        ...item.curriculum_data,
        id: item.id,
        pdf_export_status: item.pdf_export_status,
        json_export_status: item.json_export_status,
        createdAt: item.date_generated
      }))
      set({ studentHistoryData: formatted })
    } catch (err) {
      console.error("Failed to load student history", err)
    }
  },
  addStudentHistoryData: async (c) => {
    try {
      const payload = {
        role: 'student',
        program_name: c.program_name,
        skill: c.skill,
        industry_focus: c.industry_focus,
        education_level: c.education_level,
        program_duration: c.program_duration,
        createdAt: c.createdAt || new Date().toISOString(),
        pdf_export_status: false,
        json_export_status: false,
        curriculum_data: c
      }
      const res = await api.addHistory(payload)
      const savedCurriculum = { 
        ...c, 
        id: res.id, 
        pdf_export_status: false, 
        json_export_status: false,
        createdAt: payload.createdAt
      }
      set((s) => ({
        studentHistoryData: [savedCurriculum, ...s.studentHistoryData]
      }))
      return savedCurriculum
    } catch (err) {
      console.error("Failed to add student history", err)
    }
  },
  deleteStudentHistoryData: async (id) => {
    try {
      await api.deleteHistory(id)
      set((s) => ({
        studentHistoryData: s.studentHistoryData.filter(item => item.id !== id)
      }))
    } catch (err) {
      console.error("Failed to delete student history", err)
    }
  },


  setSelectedSemester: (s) => set({ selectedSemester: s }),
  setSelectedCourse:   (c) => set({ selectedCourse: c }),
}))

export default useStore

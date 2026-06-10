import { Navigate } from 'react-router-dom'
import useStore from '../store'

export default function PDFPreview() {
  const { currentRole, facultyCurriculumData, studentCurriculumData } = useStore()
  const curriculum = currentRole === 'faculty' ? facultyCurriculumData : studentCurriculumData
  return <Navigate to={curriculum ? "/curriculum" : "/dashboard"} replace />
}

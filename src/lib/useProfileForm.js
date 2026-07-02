import { useReducer, useRef, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

const INITIAL_STATE = {
  name: '', role: '', bio: '', username: '',
  photoData: '', photoFile: null, photoRemoved: false,
  links: [],
  accent: '#c45a3c', bgGradient: null, bgColor: '#ffffff', font: 'serif',
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }

    case 'SET_PHOTO':
      return { ...state, photoData: action.dataUrl, photoFile: action.file, photoRemoved: false }

    case 'REMOVE_PHOTO':
      return { ...state, photoData: '', photoFile: null, photoRemoved: true }

    case 'SET_DESIGN':
      return { ...state, ...action.payload }

    case 'RESET':
      return { ...INITIAL_STATE }

    case 'LOAD_PROFILE':
      return {
        name: action.profile.name || '',
        role: action.profile.role || '',
        bio: action.profile.bio || '',
        username: action.profile.username || '',
        photoData: action.profile.photo_url || '',
        photoFile: null,
        photoRemoved: false,
        links: (action.profile.links || []).map(l => ({
          id: Math.random().toString(36).slice(2, 9),
          label: l.label,
          url: l.url || '',
          ...(l.isSection ? { isSection: true } : {}),
          ...(l.type ? { type: l.type } : {}),
        })),
        accent: action.profile.accent || '#c45a3c',
        bgGradient: action.profile.bg_gradient || null,
        bgColor: action.profile.bg_color || '#ffffff',
        font: action.profile.font || 'serif',
      }

    case 'ADD_LINK':
    case 'ADD_LINK_TO_GROUP': {
      const { label = '', linkType } = action
      const newLink = {
        id: Math.random().toString(36).slice(2, 9),
        label, url: '', ...(linkType ? { type: linkType } : {}),
      }
      const insertUngrouped = () => {
        const idx = state.links.findIndex(l => l.isSection)
        if (idx === -1) return [...state.links, newLink]
        const links = [...state.links]
        links.splice(idx, 0, newLink)
        return links
      }
      const insertInSection = (sectionId) => {
        const idx = state.links.findIndex(l => l.id === sectionId)
        if (idx === -1) return insertUngrouped()
        let insertAt = idx + 1
        for (let i = idx + 1; i < state.links.length; i++) {
          if (state.links[i].isSection) break
          insertAt = i + 1
        }
        const links = [...state.links]
        links.splice(insertAt, 0, newLink)
        return links
      }
      return {
        ...state,
        links: action.type === 'ADD_LINK' || !action.sectionId
          ? insertUngrouped()
          : insertInSection(action.sectionId),
      }
    }

    case 'ADD_SECTION':
      return {
        ...state,
        links: [...state.links, {
          id: Math.random().toString(36).slice(2, 9),
          label: action.label || '', url: '', isSection: true,
        }],
      }

    case 'UPDATE_LINK':
      return {
        ...state,
        links: state.links.map(l =>
          l.id === action.id ? { ...l, [action.field]: action.value } : l
        ),
      }

    case 'REMOVE_LINK':
      return { ...state, links: state.links.filter(l => l.id !== action.id) }

    case 'MOVE_LINK': {
      if (action.activeId === action.overId) return state
      const oldIdx = state.links.findIndex(l => l.id === action.activeId)
      const newIdx = state.links.findIndex(l => l.id === action.overId)
      if (oldIdx === -1 || newIdx === -1) return state
      return { ...state, links: arrayMove(state.links, oldIdx, newIdx) }
    }

    default:
      return state
  }
}

export function useProfileForm() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const originalPhotoUrlRef = useRef('')

  const setField = useCallback((field, value) =>
    dispatch({ type: 'SET_FIELD', field, value }), [])

  const handlePhoto = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return ''
    if (!file.type.startsWith('image/')) return 'Please select an image file.'

    const reader = new FileReader()
    reader.onload = (ev) => {
      dispatch({ type: 'SET_PHOTO', dataUrl: ev.target?.result || '', file })
    }
    reader.onerror = () => {
      console.warn('Failed to read the selected image file.')
    }
    reader.readAsDataURL(file)
    return ''
  }, [])

  const removePhoto = useCallback(() =>
    dispatch({ type: 'REMOVE_PHOTO' }), [])

  const setDesign = useCallback((payload) =>
    dispatch({ type: 'SET_DESIGN', payload }), [])

  const reset = useCallback(() =>
    dispatch({ type: 'RESET' }), [])

  const loadProfile = useCallback((profile) => {
    originalPhotoUrlRef.current = profile.photo_url || ''
    dispatch({ type: 'LOAD_PROFILE', profile })
  }, [])

  const addLink = useCallback((label, linkType) =>
    dispatch({ type: 'ADD_LINK', label, linkType }), [])

  const addLinkToGroup = useCallback((sectionId, label, linkType) =>
    dispatch({ type: 'ADD_LINK_TO_GROUP', sectionId, label, linkType }), [])

  const addSection = useCallback((label) =>
    dispatch({ type: 'ADD_SECTION', label }), [])

  const updateLink = useCallback((id, field, value) =>
    dispatch({ type: 'UPDATE_LINK', id, field, value }), [])

  const removeLink = useCallback((id) =>
    dispatch({ type: 'REMOVE_LINK', id }), [])

  const moveLink = useCallback((activeId, overId) =>
    dispatch({ type: 'MOVE_LINK', activeId, overId }), [])

  return {
    state,
    originalPhotoUrl: originalPhotoUrlRef,
    setField, handlePhoto, removePhoto, setDesign,
    reset, loadProfile,
    addLink, addLinkToGroup, addSection, updateLink, removeLink, moveLink,
  }
}

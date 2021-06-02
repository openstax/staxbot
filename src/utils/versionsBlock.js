import {getItems, getItemValue, setItems} from './configBlock'

export const getVersions = (body, filter = () => true) => {
  const items = getItems(body, 'versions', filter)

  if (!items) {
    return null
  }

  return Object.entries(items).reduce((result, [name, {value}]) => ({...result, [name]: value}), {})
}

export const getVersion = (body, itemName) => {
  return getItemValue(body, 'versions', itemName)
}

export const setVersions = (body, versions) => {
  const lockedVersions = getItems(body, 'versions', item => item.flags.includes('locked'))
  const newVersions = {
    ...Object.entries(versions).reduce((result, [name, value]) => ({...result, [name]: {value}}), {}),
    ...lockedVersions
  }

  return setItems(body, 'versions', newVersions)
}

export const setVersion = (body, itemName, version) => {
  const versions = getVersions(body) || {}

  return setVersions(body, {
    ...versions,
    [itemName]: version
  })
}

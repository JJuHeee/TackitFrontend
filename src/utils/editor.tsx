export const isEditorEmpty = (html: string): boolean => {
  if (!html) return true
  const text = html
    .replace(/<p><br><\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim()
  return text.length === 0
}

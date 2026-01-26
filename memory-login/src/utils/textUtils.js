// Utilitaires pour le traitement de texte

export function stripHtmlAndTruncate(content, maxLength = 150) {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '').trim()
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}


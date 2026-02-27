export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString();
}

export function formatFileSize(bytes) {
  if (bytes == null || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

export function truncate(str, maxLen = 80) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

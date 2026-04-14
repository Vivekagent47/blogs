const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatCommentTimestamp(value: string) {
  return timestampFormatter.format(new Date(value))
}

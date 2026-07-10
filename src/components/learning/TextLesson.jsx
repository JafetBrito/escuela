// Renders a rich-text lesson from dangerouslySetInnerHTML.
// Content is written by us (trusted), never from user input.
export default function TextLesson({ content, className = '' }) {
  if (!content) return null
  return (
    <div
      className={`rounded-xl border border-border bg-surface px-6 py-5 text-text
        [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary first:[&_h2]:mt-0
        [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text
        [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-text-muted
        [&_ul]:mb-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:text-sm [&_ul]:text-text-muted
        [&_ol]:mb-3 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:text-sm [&_ol]:text-text-muted
        [&_li]:leading-relaxed
        [&_strong]:font-semibold [&_strong]:text-text
        [&_code]:rounded [&_code]:bg-black/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-emerald-400
        [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-emerald-900/40 [&_pre]:bg-black/60 [&_pre]:p-4
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-sm [&_pre_code]:text-emerald-300
        [&_blockquote]:mb-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-sm [&_blockquote]:italic [&_blockquote]:text-text-muted
        [&_.tip]:mb-3 [&_.tip]:rounded-xl [&_.tip]:border [&_.tip]:border-blue-500/30 [&_.tip]:bg-blue-900/20 [&_.tip]:p-4 [&_.tip]:text-sm [&_.tip]:text-blue-300
        [&_.warn]:mb-3 [&_.warn]:rounded-xl [&_.warn]:border [&_.warn]:border-yellow-500/30 [&_.warn]:bg-yellow-900/20 [&_.warn]:p-4 [&_.warn]:text-sm [&_.warn]:text-yellow-300
        [&_.example]:mb-3 [&_.example]:rounded-xl [&_.example]:border [&_.example]:border-violet-500/30 [&_.example]:bg-violet-900/20 [&_.example]:p-4 [&_.example]:text-sm [&_.example]:text-violet-200
        [&_.bad]:mb-3 [&_.bad]:rounded-xl [&_.bad]:border [&_.bad]:border-red-500/30 [&_.bad]:bg-red-900/20 [&_.bad]:p-4 [&_.bad]:text-sm [&_.bad]:text-red-200
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
